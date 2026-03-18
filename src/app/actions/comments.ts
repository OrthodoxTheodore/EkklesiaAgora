'use server';

import { getAdminFirestore } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { getPost } from '@/lib/firestore/posts';
import { getProfileByUid } from '@/lib/firestore/profiles';

/**
 * Create a comment on a post.
 * Enforces follower-only restriction if set on the post.
 */
export async function createComment(
  uid: string,
  postId: string,
  text: string,
): Promise<{ success: boolean; commentId?: string; error?: string }> {
  if (!text || text.length < 1 || text.length > 2000) {
    return { success: false, error: 'Comment must be between 1 and 2000 characters.' };
  }

  const post = await getPost(postId);
  if (!post) {
    return { success: false, error: 'Post not found.' };
  }

  // Enforce follower-only restriction
  if (post.commentsRestricted === 'followers' && post.authorUid !== uid) {
    const db = getAdminFirestore();
    const followDoc = await db.collection('follows').doc(`${uid}_${post.authorUid}`).get();
    if (!followDoc.exists) {
      return { success: false, error: 'Only followers can comment on this post.' };
    }
  }

  const profile = await getProfileByUid(uid);
  if (!profile) {
    return { success: false, error: 'User profile not found.' };
  }

  const db = getAdminFirestore();
  const commentRef = db.collection('posts').doc(postId).collection('comments').doc();
  const now = FieldValue.serverTimestamp();

  await commentRef.set({
    commentId: commentRef.id,
    postId,
    authorUid: uid,
    authorHandle: profile.handle,
    authorDisplayName: profile.displayName,
    authorAvatarUrl: profile.avatarUrl,
    text,
    createdAt: now,
    updatedAt: null,
    isEdited: false,
  });

  // Increment comment count on post
  await db.collection('posts').doc(postId).update({
    commentCount: FieldValue.increment(1),
  });

  // Create notification if commenter is not the post author
  if (post.authorUid !== uid) {
    const notifRef = db
      .collection('users')
      .doc(post.authorUid)
      .collection('notifications')
      .doc();
    await notifRef.set({
      notificationId: notifRef.id,
      type: 'comment',
      fromUid: uid,
      fromHandle: profile.handle,
      fromDisplayName: profile.displayName,
      fromAvatarUrl: profile.avatarUrl,
      postId,
      postText: post.text.slice(0, 80),
      read: false,
      createdAt: now,
    });
  }

  return { success: true, commentId: commentRef.id };
}

/**
 * Edit a comment (own comments only).
 */
export async function editComment(
  uid: string,
  postId: string,
  commentId: string,
  text: string,
): Promise<{ success: boolean; error?: string }> {
  if (!text || text.length < 1 || text.length > 2000) {
    return { success: false, error: 'Comment must be between 1 and 2000 characters.' };
  }

  const db = getAdminFirestore();
  const commentRef = db.collection('posts').doc(postId).collection('comments').doc(commentId);
  const commentDoc = await commentRef.get();

  if (!commentDoc.exists) {
    return { success: false, error: 'Comment not found.' };
  }

  const commentData = commentDoc.data() as { authorUid: string };
  if (commentData.authorUid !== uid) {
    return { success: false, error: 'You can only edit your own comments.' };
  }

  await commentRef.update({
    text,
    updatedAt: FieldValue.serverTimestamp(),
    isEdited: true,
  });

  return { success: true };
}

/**
 * Delete a comment (own comments only, or moderator+).
 */
export async function deleteComment(
  uid: string,
  postId: string,
  commentId: string,
): Promise<{ success: boolean }> {
  const db = getAdminFirestore();
  const commentRef = db.collection('posts').doc(postId).collection('comments').doc(commentId);
  const commentDoc = await commentRef.get();

  if (!commentDoc.exists) {
    return { success: true }; // Already deleted
  }

  const commentData = commentDoc.data() as { authorUid: string };
  if (commentData.authorUid !== uid) {
    return { success: false } as { success: boolean };
  }

  await commentRef.delete();

  // Decrement comment count on post
  await db.collection('posts').doc(postId).update({
    commentCount: FieldValue.increment(-1),
  });

  return { success: true };
}
