'use server';

import { getAdminAuth, getAdminFirestore } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { cookies } from 'next/headers';
import { getTokens } from 'next-firebase-auth-edge';
import { buildVideoSearchKeywords, getVideoById, getChannelById } from '@/lib/firestore/videos';
import { getProfileByUid } from '@/lib/firestore/profiles';
import { ORTHODOX_CATEGORIES } from '@/lib/constants/categories';
import { z } from 'zod';

// Inline authConfig — same pattern as admin/actions.ts
const authConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  cookieName: 'AuthToken',
  cookieSignatureKeys: [
    process.env.COOKIE_SECRET_CURRENT!,
    process.env.COOKIE_SECRET_PREVIOUS!,
  ],
  serviceAccount: {
    projectId: process.env.FIREBASE_PROJECT_ID!,
    privateKey: (process.env.FIREBASE_PRIVATE_KEY!.includes('-----BEGIN') ? process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n') : Buffer.from(process.env.FIREBASE_PRIVATE_KEY!, 'base64').toString('utf-8')),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
  },
};

const createVideoSchema = z.object({
  videoId: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).default(''),
  tags: z.array(z.string()).max(10).default([]),
  category: z.string().refine(
    (val) => (ORTHODOX_CATEGORIES as readonly string[]).includes(val),
    { message: 'Invalid category.' }
  ),
  videoUrl: z.string().url(),
  storagePath: z.string().min(1),
  thumbnailUrl: z.union([z.string().url(), z.null()]).default(null),
  durationSeconds: z.number().min(0),
  channelId: z.union([z.string().min(1), z.null()]).default(null),
});

export async function createVideo(
  uid: string,
  data: {
    videoId: string;
    title: string;
    description: string;
    tags: string[];
    category: string;
    videoUrl: string;
    storagePath: string;
    thumbnailUrl: string | null;
    durationSeconds: number;
    channelId: string | null;
  }
): Promise<{ success: true } | { success: false; error: string }> {
  // Validate input
  const parsed = createVideoSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }
  const validated = parsed.data;

  try {
    const db = getAdminFirestore();
    const adminAuth = getAdminAuth();

    // Fetch uploader profile
    const profile = await getProfileByUid(uid);
    if (!profile) {
      return { success: false, error: 'User profile not found.' };
    }

    // Fetch uploader roleLevel from Auth custom claims
    const userRecord = await adminAuth.getUser(uid);
    const roleLevel: number =
      (userRecord.customClaims as { roleLevel?: number } | undefined)?.roleLevel ?? 1;

    // Build search keywords
    const searchKeywords = buildVideoSearchKeywords(
      validated.title,
      validated.description,
      validated.tags
    );

    // Resolve channel handle if channelId provided
    let channelHandle: string | null = null;
    if (validated.channelId) {
      const channel = await getChannelById(validated.channelId);
      channelHandle = channel?.handle ?? null;
    }

    // Write video document — status always pending_review
    await db.collection('videos').doc(validated.videoId).set({
      videoId: validated.videoId,
      uploaderUid: uid,
      uploaderHandle: profile.handle,
      uploaderDisplayName: profile.displayName,
      uploaderAvatarUrl: profile.avatarUrl,
      uploaderJurisdictionId: profile.jurisdictionId ?? null,
      uploaderRoleLevel: roleLevel,
      channelId: validated.channelId,
      channelHandle,
      title: validated.title,
      description: validated.description,
      tags: validated.tags,
      category: validated.category,
      thumbnailUrl: validated.thumbnailUrl,
      videoUrl: validated.videoUrl,
      storagePath: validated.storagePath,
      durationSeconds: validated.durationSeconds,
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      status: 'pending_review',
      moderatorNote: null,
      moderatedAt: null,
      moderatedBy: null,
      searchKeywords,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: null,
    });

    return { success: true };
  } catch (err) {
    console.error('createVideo error:', err);
    return { success: false, error: 'Failed to create video.' };
  }
}

export async function updateVideoStatus(
  videoId: string,
  decision: 'published' | 'rejected' | 'changes_requested',
  note?: string
): Promise<{ success: true } | { error: string }> {
  // Validate decision
  const validDecisions = ['published', 'rejected', 'changes_requested'] as const;
  if (!validDecisions.includes(decision)) {
    return { error: 'Invalid decision.' };
  }

  // Require non-empty note for changes_requested
  if (decision === 'changes_requested' && (!note || note.trim().length === 0)) {
    return { error: 'A moderator note is required when requesting changes.' };
  }

  try {
    // Get caller tokens and check roleLevel >= 2
    const tokens = await getTokens(await cookies(), authConfig);
    if (!tokens) {
      return { error: 'Not authenticated.' };
    }

    const { decodedToken } = tokens;
    const callerUid: string = decodedToken.uid;
    const callerRoleLevel: number =
      (decodedToken as { roleLevel?: number }).roleLevel ?? 0;

    if (callerRoleLevel < 2) {
      return { error: 'Insufficient permissions.' };
    }

    const db = getAdminFirestore();

    // Update video status
    await db.collection('videos').doc(videoId).update({
      status: decision,
      moderatorNote: note ?? null,
      moderatedAt: FieldValue.serverTimestamp(),
      moderatedBy: callerUid,
    });

    // Read video to get uploaderUid for notification
    const video = await getVideoById(videoId);
    if (!video) {
      return { error: 'Video not found.' };
    }

    // Write moderation notification to uploader
    const notifRef = db
      .collection('users')
      .doc(video.uploaderUid)
      .collection('notifications')
      .doc();

    await notifRef.set({
      notificationId: notifRef.id,
      type: 'moderation',
      fromUid: callerUid,
      fromHandle: '',
      fromDisplayName: 'Moderator',
      fromAvatarUrl: null,
      postId: null,
      postText: null,
      videoId,
      decision,
      moderatorNote: note ?? null,
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (err) {
    console.error('updateVideoStatus error:', err);
    return { error: 'Failed to update video status.' };
  }
}

export async function deleteVideo(
  videoId: string,
  callerUid: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const db = getAdminFirestore();
    const adminAuth = getAdminAuth();

    // Fetch video
    const video = await getVideoById(videoId);
    if (!video) {
      return { success: false, error: 'Video not found.' };
    }

    // Verify caller is uploader or moderator+
    const userRecord = await adminAuth.getUser(callerUid);
    const callerRoleLevel: number =
      (userRecord.customClaims as { roleLevel?: number } | undefined)?.roleLevel ?? 0;

    if (video.uploaderUid !== callerUid && callerRoleLevel < 2) {
      return { success: false, error: 'Not authorized to delete this video.' };
    }

    // Batch-delete likes subcollection (500-op chunks)
    const likesSnap = await db.collection('videos').doc(videoId).collection('likes').get();
    for (let i = 0; i < likesSnap.docs.length; i += 500) {
      const chunk = likesSnap.docs.slice(i, i + 500);
      const batch = db.batch();
      for (const doc of chunk) {
        batch.delete(doc.ref);
      }
      await batch.commit();
    }

    // Batch-delete comments subcollection (500-op chunks)
    const commentsSnap = await db.collection('videos').doc(videoId).collection('comments').get();
    for (let i = 0; i < commentsSnap.docs.length; i += 500) {
      const chunk = commentsSnap.docs.slice(i, i + 500);
      const batch = db.batch();
      for (const doc of chunk) {
        batch.delete(doc.ref);
      }
      await batch.commit();
    }

    // Delete main video document
    await db.collection('videos').doc(videoId).delete();

    return { success: true };
  } catch (err) {
    console.error('deleteVideo error:', err);
    return { success: false, error: 'Failed to delete video.' };
  }
}

export async function likeVideo(
  videoId: string,
  uid: string
): Promise<{ liked: boolean } | { error: string }> {
  try {
    const db = getAdminFirestore();
    const likeRef = db.collection('videos').doc(videoId).collection('likes').doc(uid);
    const likeDoc = await likeRef.get();

    if (likeDoc.exists) {
      // Unlike: remove doc, decrement likeCount
      await likeRef.delete();
      await db.collection('videos').doc(videoId).update({
        likeCount: FieldValue.increment(-1),
      });
      return { liked: false };
    } else {
      // Like: create doc, increment likeCount
      await likeRef.set({ uid, createdAt: FieldValue.serverTimestamp() });
      await db.collection('videos').doc(videoId).update({
        likeCount: FieldValue.increment(1),
      });

      // Write like notification to video uploader (skip if liker is uploader)
      const video = await getVideoById(videoId);
      if (video && video.uploaderUid !== uid) {
        const profile = await getProfileByUid(uid);
        const notifRef = db
          .collection('users')
          .doc(video.uploaderUid)
          .collection('notifications')
          .doc();

        await notifRef.set({
          notificationId: notifRef.id,
          type: 'like',
          fromUid: uid,
          fromHandle: profile?.handle ?? '',
          fromDisplayName: profile?.displayName ?? '',
          fromAvatarUrl: profile?.avatarUrl ?? null,
          postId: null,
          postText: null,
          videoId,
          read: false,
          createdAt: FieldValue.serverTimestamp(),
        });
      }

      return { liked: true };
    }
  } catch (err) {
    console.error('likeVideo error:', err);
    return { error: 'Failed to update like.' };
  }
}

export async function incrementViewCount(
  videoId: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const db = getAdminFirestore();
    await db.collection('videos').doc(videoId).update({
      viewCount: FieldValue.increment(1),
    });
    return { success: true };
  } catch (err) {
    console.error('incrementViewCount error:', err);
    return { success: false, error: 'Failed to increment view count.' };
  }
}
