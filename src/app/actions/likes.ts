'use server';

import { getAdminFirestore } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { getPost } from '@/lib/firestore/posts';
import { getProfileByUid } from '@/lib/firestore/profiles';

/**
 * Toggle a like on a post.
 * Returns whether the post is now liked (true) or unliked (false).
 */
export async function toggleLike(
  uid: string,
  postId: string,
): Promise<{ liked: boolean }> {
  const db = getAdminFirestore();
  const likeRef = db.collection('posts').doc(postId).collection('likes').doc(uid);
  const likeDoc = await likeRef.get();

  if (likeDoc.exists) {
    // Unlike: remove the like doc and decrement count
    await likeRef.delete();
    await db.collection('posts').doc(postId).update({
      likeCount: FieldValue.increment(-1),
    });
    return { liked: false };
  } else {
    // Like: create the like doc and increment count
    await likeRef.set({
      uid,
      createdAt: FieldValue.serverTimestamp(),
    });
    await db.collection('posts').doc(postId).update({
      likeCount: FieldValue.increment(1),
    });

    // Create notification if liker is not the post author
    const post = await getPost(postId);
    if (post && post.authorUid !== uid) {
      const profile = await getProfileByUid(uid);
      if (profile) {
        const notifRef = db
          .collection('users')
          .doc(post.authorUid)
          .collection('notifications')
          .doc();
        await notifRef.set({
          notificationId: notifRef.id,
          type: 'like',
          fromUid: uid,
          fromHandle: profile.handle,
          fromDisplayName: profile.displayName,
          fromAvatarUrl: profile.avatarUrl,
          postId,
          postText: post.text.slice(0, 80),
          read: false,
          createdAt: FieldValue.serverTimestamp(),
        });
      }
    }

    return { liked: true };
  }
}
