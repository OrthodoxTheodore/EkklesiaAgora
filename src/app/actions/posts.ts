'use server';

import { getAdminAuth, getAdminFirestore } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { getProfileByUid } from '@/lib/firestore/profiles';
import { buildSearchKeywords } from '@/lib/firestore/posts';
import { ORTHODOX_CATEGORIES } from '@/lib/constants/categories';
import type { LinkPreview } from '@/lib/types/social';

export async function createPost(
  uid: string,
  data: {
    text: string;
    imageUrl: string | null;
    category: string;
    commentsRestricted: 'all' | 'followers';
    linkPreview: LinkPreview | null;
  }
): Promise<{ success: true; postId: string } | { success: false; error: string }> {
  // Validate text length
  if (!data.text || data.text.length < 1 || data.text.length > 5000) {
    return { success: false, error: 'Post text must be between 1 and 5000 characters.' };
  }

  // Validate category
  if (!(ORTHODOX_CATEGORIES as readonly string[]).includes(data.category)) {
    return { success: false, error: 'Invalid category.' };
  }

  try {
    const db = getAdminFirestore();
    const adminAuth = getAdminAuth();

    // Fetch author profile for denormalized fields
    const profile = await getProfileByUid(uid);
    if (!profile) {
      return { success: false, error: 'User profile not found.' };
    }

    // Get roleLevel from Auth custom claims
    const userRecord = await adminAuth.getUser(uid);
    const roleLevel: number = (userRecord.customClaims as { roleLevel?: number } | undefined)?.roleLevel ?? 1;

    // Build search keywords
    const searchKeywords = buildSearchKeywords(data.text);

    // Create post document
    const postRef = db.collection('posts').doc();
    const postId = postRef.id;
    const now = FieldValue.serverTimestamp();

    await postRef.set({
      postId,
      authorUid: uid,
      authorHandle: profile.handle,
      authorDisplayName: profile.displayName,
      authorAvatarUrl: profile.avatarUrl,
      authorJurisdictionId: profile.jurisdictionId,
      authorRoleLevel: roleLevel,
      text: data.text,
      imageUrl: data.imageUrl,
      category: data.category,
      searchKeywords,
      likeCount: 0,
      commentCount: 0,
      commentsRestricted: data.commentsRestricted,
      linkPreview: data.linkPreview,
      createdAt: now,
      updatedAt: null,
      isEdited: false,
    });

    // Fan-out: get all followers + self
    const followsSnap = await db
      .collection('follows')
      .where('followedUid', '==', uid)
      .get();

    const followerUids = followsSnap.docs.map(doc => doc.data().followerUid as string);
    const feedUids = [...new Set([uid, ...followerUids])];

    // Chunk into 500-operation batches per Firestore limit
    const postData = {
      postId,
      authorUid: uid,
      authorHandle: profile.handle,
      authorDisplayName: profile.displayName,
      authorAvatarUrl: profile.avatarUrl,
      authorJurisdictionId: profile.jurisdictionId,
      authorRoleLevel: roleLevel,
      text: data.text,
      imageUrl: data.imageUrl,
      category: data.category,
      searchKeywords,
      likeCount: 0,
      commentCount: 0,
      commentsRestricted: data.commentsRestricted,
      linkPreview: data.linkPreview,
      createdAt: now,
      updatedAt: null,
      isEdited: false,
    };

    for (let i = 0; i < feedUids.length; i += 500) {
      const chunk = feedUids.slice(i, i + 500);
      const batch = db.batch();
      for (const followerUid of chunk) {
        const feedRef = db
          .collection('users')
          .doc(followerUid)
          .collection('userFeed')
          .doc(postId);
        batch.set(feedRef, postData);
      }
      await batch.commit();
    }

    // Increment postCount on author profile
    await db
      .collection('userProfiles')
      .doc(uid)
      .update({ postCount: FieldValue.increment(1) });

    return { success: true, postId };
  } catch (err) {
    console.error('createPost error:', err);
    return { success: false, error: 'Failed to create post.' };
  }
}

export async function deletePost(
  uid: string,
  postId: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const db = getAdminFirestore();

    // Verify post exists and caller is author (or moderator+)
    const postDoc = await db.collection('posts').doc(postId).get();
    if (!postDoc.exists) {
      return { success: false, error: 'Post not found.' };
    }
    const postData = postDoc.data() as { authorUid: string };

    // Moderators (roleLevel >= 2) can delete any post; authors can delete their own
    const adminAuth = getAdminAuth();
    const userRecord = await adminAuth.getUser(uid);
    const callerRoleLevel: number =
      (userRecord.customClaims as { roleLevel?: number } | undefined)?.roleLevel ?? 1;

    if (postData.authorUid !== uid && callerRoleLevel < 2) {
      return { success: false, error: 'Not authorized to delete this post.' };
    }

    // Delete all likes subcollection docs
    const likesSnap = await db.collection('posts').doc(postId).collection('likes').get();
    if (!likesSnap.empty) {
      const likesBatch = db.batch();
      for (const doc of likesSnap.docs) {
        likesBatch.delete(doc.ref);
      }
      await likesBatch.commit();
    }

    // Delete all comments subcollection docs
    const commentsSnap = await db.collection('posts').doc(postId).collection('comments').get();
    if (!commentsSnap.empty) {
      const commentsBatch = db.batch();
      for (const doc of commentsSnap.docs) {
        commentsBatch.delete(doc.ref);
      }
      await commentsBatch.commit();
    }

    // Delete main post document
    await db.collection('posts').doc(postId).delete();

    // Fan-out delete: get all followers + self
    const followsSnap = await db
      .collection('follows')
      .where('followedUid', '==', uid)
      .get();

    const followerUids = followsSnap.docs.map(doc => doc.data().followerUid as string);
    const feedUids = [...new Set([uid, ...followerUids])];

    // Chunk into 500-operation batches per Firestore limit
    for (let i = 0; i < feedUids.length; i += 500) {
      const chunk = feedUids.slice(i, i + 500);
      const batch = db.batch();
      for (const followerUid of chunk) {
        const feedRef = db
          .collection('users')
          .doc(followerUid)
          .collection('userFeed')
          .doc(postId);
        batch.delete(feedRef);
      }
      await batch.commit();
    }

    // Decrement postCount on author profile
    await db
      .collection('userProfiles')
      .doc(uid)
      .update({ postCount: FieldValue.increment(-1) });

    return { success: true };
  } catch (err) {
    console.error('deletePost error:', err);
    return { success: false, error: 'Failed to delete post.' };
  }
}

export async function editPost(
  uid: string,
  postId: string,
  data: {
    text: string;
    category: string;
    commentsRestricted: 'all' | 'followers';
  }
): Promise<{ success: true } | { success: false; error: string }> {
  // Validate text length
  if (!data.text || data.text.length < 1 || data.text.length > 5000) {
    return { success: false, error: 'Post text must be between 1 and 5000 characters.' };
  }

  // Validate category
  if (!(ORTHODOX_CATEGORIES as readonly string[]).includes(data.category)) {
    return { success: false, error: 'Invalid category.' };
  }

  try {
    const db = getAdminFirestore();

    // Verify post exists and caller is author
    const postDoc = await db.collection('posts').doc(postId).get();
    if (!postDoc.exists) {
      return { success: false, error: 'Post not found.' };
    }
    const postData = postDoc.data() as { authorUid: string };
    if (postData.authorUid !== uid) {
      return { success: false, error: 'Not authorized to edit this post.' };
    }

    const searchKeywords = buildSearchKeywords(data.text);
    const updateFields = {
      text: data.text,
      category: data.category,
      commentsRestricted: data.commentsRestricted,
      searchKeywords,
      updatedAt: FieldValue.serverTimestamp(),
      isEdited: true,
    };

    // Update main post document
    await db.collection('posts').doc(postId).update(updateFields);

    // Fan-out update: get all followers + self
    const followsSnap = await db
      .collection('follows')
      .where('followedUid', '==', uid)
      .get();

    const followerUids = followsSnap.docs.map(doc => doc.data().followerUid as string);
    const feedUids = [...new Set([uid, ...followerUids])];

    // Chunk into 500-operation batches per Firestore limit
    for (let i = 0; i < feedUids.length; i += 500) {
      const chunk = feedUids.slice(i, i + 500);
      const batch = db.batch();
      for (const followerUid of chunk) {
        const feedRef = db
          .collection('users')
          .doc(followerUid)
          .collection('userFeed')
          .doc(postId);
        batch.update(feedRef, updateFields);
      }
      await batch.commit();
    }

    return { success: true };
  } catch (err) {
    console.error('editPost error:', err);
    return { success: false, error: 'Failed to edit post.' };
  }
}
