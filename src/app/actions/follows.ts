'use server';

import { getAdminFirestore } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { getProfileByUid } from '@/lib/firestore/profiles';

export async function followUser(
  followerUid: string,
  followedUid: string
): Promise<{ success: true } | { success: false; error: string }> {
  // Prevent self-follow
  if (followerUid === followedUid) {
    return { success: false, error: 'You cannot follow yourself.' };
  }

  try {
    const db = getAdminFirestore();
    const followDocId = `${followerUid}_${followedUid}`;
    const followRef = db.collection('follows').doc(followDocId);

    // Check if follow already exists
    const existingFollow = await followRef.get();
    if (existingFollow.exists) {
      return { success: true }; // Already following, return early
    }

    // Fetch follower profile for notification denormalized fields
    const followerProfile = await getProfileByUid(followerUid);
    if (!followerProfile) {
      return { success: false, error: 'Follower profile not found.' };
    }

    // Create follow document
    await followRef.set({
      followerUid,
      followedUid,
      createdAt: FieldValue.serverTimestamp(),
    });

    // Increment counters on both profiles
    const batch = db.batch();
    batch.update(db.collection('userProfiles').doc(followedUid), {
      followerCount: FieldValue.increment(1),
    });
    batch.update(db.collection('userProfiles').doc(followerUid), {
      followingCount: FieldValue.increment(1),
    });
    await batch.commit();

    // Create follow notification for the followed user
    const notificationRef = db
      .collection('users')
      .doc(followedUid)
      .collection('notifications')
      .doc();
    await notificationRef.set({
      notificationId: notificationRef.id,
      type: 'follow',
      fromUid: followerUid,
      fromHandle: followerProfile.handle,
      fromDisplayName: followerProfile.displayName,
      fromAvatarUrl: followerProfile.avatarUrl,
      postId: null,
      postText: null,
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (err) {
    console.error('followUser error:', err);
    return { success: false, error: 'Failed to follow user.' };
  }
}

export async function unfollowUser(
  followerUid: string,
  followedUid: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const db = getAdminFirestore();
    const followDocId = `${followerUid}_${followedUid}`;
    const followRef = db.collection('follows').doc(followDocId);

    // Check if follow doc exists
    const existingFollow = await followRef.get();
    if (!existingFollow.exists) {
      return { success: true }; // Not following, return early
    }

    // Delete follow document
    await followRef.delete();

    // Decrement counters on both profiles
    const batch = db.batch();
    batch.update(db.collection('userProfiles').doc(followedUid), {
      followerCount: FieldValue.increment(-1),
    });
    batch.update(db.collection('userProfiles').doc(followerUid), {
      followingCount: FieldValue.increment(-1),
    });
    await batch.commit();

    return { success: true };
  } catch (err) {
    console.error('unfollowUser error:', err);
    return { success: false, error: 'Failed to unfollow user.' };
  }
}
