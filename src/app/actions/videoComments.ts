'use server';

import { randomUUID } from 'crypto';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { cookies } from 'next/headers';
import { getTokens } from 'next-firebase-auth-edge';
import { getVideoById } from '@/lib/firestore/videos';
import { getProfileByUid } from '@/lib/firestore/profiles';
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
    privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
  },
};

const commentTextSchema = z.string().min(1).max(2000);

export async function createVideoComment(
  uid: string,
  videoId: string,
  text: string
): Promise<{ success: true; commentId: string } | { success: false; error: string }> {
  const textParsed = commentTextSchema.safeParse(text);
  if (!textParsed.success) {
    return { success: false, error: 'Comment must be between 1 and 2000 characters.' };
  }

  try {
    const profile = await getProfileByUid(uid);
    if (!profile) {
      return { success: false, error: 'User profile not found.' };
    }

    const db = getAdminFirestore();
    const commentId = randomUUID();
    const commentRef = db.collection('videos').doc(videoId).collection('comments').doc(commentId);
    const now = FieldValue.serverTimestamp();

    await commentRef.set({
      commentId,
      videoId,
      authorUid: uid,
      authorHandle: profile.handle,
      authorDisplayName: profile.displayName,
      authorAvatarUrl: profile.avatarUrl,
      text,
      createdAt: now,
      updatedAt: null,
      isEdited: false,
    });

    // Increment commentCount on the video
    await db.collection('videos').doc(videoId).update({
      commentCount: FieldValue.increment(1),
    });

    // Write comment notification to video uploader (skip if commenter is uploader)
    const video = await getVideoById(videoId);
    if (video && video.uploaderUid !== uid) {
      const notifRef = db
        .collection('users')
        .doc(video.uploaderUid)
        .collection('notifications')
        .doc();

      await notifRef.set({
        notificationId: notifRef.id,
        type: 'comment',
        fromUid: uid,
        fromHandle: profile.handle,
        fromDisplayName: profile.displayName,
        fromAvatarUrl: profile.avatarUrl,
        postId: null,
        postText: null,
        videoId,
        read: false,
        createdAt: now,
      });
    }

    return { success: true, commentId };
  } catch (err) {
    console.error('createVideoComment error:', err);
    return { success: false, error: 'Failed to create comment.' };
  }
}

export async function deleteVideoComment(
  uid: string,
  videoId: string,
  commentId: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const db = getAdminFirestore();
    const commentRef = db.collection('videos').doc(videoId).collection('comments').doc(commentId);
    const commentDoc = await commentRef.get();

    if (!commentDoc.exists) {
      return { success: false, error: 'Comment not found.' };
    }

    const commentData = commentDoc.data() as { authorUid: string };

    // Verify uid is author OR roleLevel >= 2
    if (commentData.authorUid !== uid) {
      const tokens = await getTokens(await cookies(), authConfig);
      const callerRoleLevel: number =
        (tokens?.decodedToken as { roleLevel?: number } | undefined)?.roleLevel ?? 0;

      if (callerRoleLevel < 2) {
        return { success: false, error: 'Not authorized to delete this comment.' };
      }
    }

    await commentRef.delete();

    // Decrement commentCount on the video
    await db.collection('videos').doc(videoId).update({
      commentCount: FieldValue.increment(-1),
    });

    return { success: true };
  } catch (err) {
    console.error('deleteVideoComment error:', err);
    return { success: false, error: 'Failed to delete comment.' };
  }
}

export async function editVideoComment(
  uid: string,
  videoId: string,
  commentId: string,
  newText: string
): Promise<{ success: true } | { success: false; error: string }> {
  const textParsed = commentTextSchema.safeParse(newText);
  if (!textParsed.success) {
    return { success: false, error: 'Comment must be between 1 and 2000 characters.' };
  }

  try {
    const db = getAdminFirestore();
    const commentRef = db.collection('videos').doc(videoId).collection('comments').doc(commentId);
    const commentDoc = await commentRef.get();

    if (!commentDoc.exists) {
      return { success: false, error: 'Comment not found.' };
    }

    const commentData = commentDoc.data() as { authorUid: string };
    if (commentData.authorUid !== uid) {
      return { success: false, error: 'You can only edit your own comments.' };
    }

    await commentRef.update({
      text: newText,
      isEdited: true,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (err) {
    console.error('editVideoComment error:', err);
    return { success: false, error: 'Failed to edit comment.' };
  }
}
