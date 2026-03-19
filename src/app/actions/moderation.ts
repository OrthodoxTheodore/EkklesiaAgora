'use server';

import { getAdminFirestore } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Block a user. Also removes any existing follow relationship.
 */
export async function blockUser(
  callerUid: string,
  targetUid: string,
): Promise<{ success: boolean }> {
  const db = getAdminFirestore();

  // Create block document
  await db
    .collection('userBlocks')
    .doc(callerUid)
    .collection('blocked')
    .doc(targetUid)
    .set({
      blockedUid: targetUid,
      createdAt: FieldValue.serverTimestamp(),
    });

  // Remove any existing follow relationships (both directions)
  const followDocId1 = `${callerUid}_${targetUid}`;
  const followDocId2 = `${targetUid}_${callerUid}`;

  const [follow1, follow2] = await Promise.all([
    db.collection('follows').doc(followDocId1).get(),
    db.collection('follows').doc(followDocId2).get(),
  ]);

  const batch = db.batch();

  if (follow1.exists) {
    batch.delete(db.collection('follows').doc(followDocId1));
    batch.update(db.collection('userProfiles').doc(targetUid), {
      followerCount: FieldValue.increment(-1),
    });
    batch.update(db.collection('userProfiles').doc(callerUid), {
      followingCount: FieldValue.increment(-1),
    });
  }

  if (follow2.exists) {
    batch.delete(db.collection('follows').doc(followDocId2));
    batch.update(db.collection('userProfiles').doc(callerUid), {
      followerCount: FieldValue.increment(-1),
    });
    batch.update(db.collection('userProfiles').doc(targetUid), {
      followingCount: FieldValue.increment(-1),
    });
  }

  if (follow1.exists || follow2.exists) {
    await batch.commit();
  }

  return { success: true };
}

/**
 * Mute a user. Their posts will be hidden from the caller's feed.
 */
export async function muteUser(
  callerUid: string,
  targetUid: string,
): Promise<{ success: boolean }> {
  const db = getAdminFirestore();

  await db
    .collection('userMutes')
    .doc(callerUid)
    .collection('muted')
    .doc(targetUid)
    .set({
      mutedUid: targetUid,
      createdAt: FieldValue.serverTimestamp(),
    });

  return { success: true };
}

/**
 * Unblock a user.
 */
export async function unblockUser(callerUid: string, targetUid: string): Promise<void> {
  const db = getAdminFirestore();
  await db
    .collection('userBlocks')
    .doc(callerUid)
    .collection('blocked')
    .doc(targetUid)
    .delete();
}

/**
 * Unmute a user.
 */
export async function unmuteUser(callerUid: string, targetUid: string): Promise<void> {
  const db = getAdminFirestore();
  await db
    .collection('userMutes')
    .doc(callerUid)
    .collection('muted')
    .doc(targetUid)
    .delete();
}

/**
 * Report content (post, comment, user, or video) to the moderation queue.
 * If a report already exists for the same contentId, increments flagCount instead
 * of creating a duplicate.
 */
export async function reportContent(
  callerUid: string,
  data: {
    contentType: 'post' | 'comment' | 'user' | 'video';
    contentId: string;
    reason: string;
  },
): Promise<{ success: boolean }> {
  const db = getAdminFirestore();

  // Check for existing report on same contentId to increment flagCount
  const existingSnap = await db
    .collection('reports')
    .where('contentId', '==', data.contentId)
    .where('status', '==', 'pending')
    .limit(1)
    .get();

  if (!existingSnap.empty) {
    // Increment flagCount on existing report
    await existingSnap.docs[0].ref.update({
      flagCount: FieldValue.increment(1),
    });
    return { success: true };
  }

  await db.collection('reports').add({
    reporterUid: callerUid,
    contentType: data.contentType,
    contentId: data.contentId,
    reason: data.reason,
    status: 'pending',
    flagCount: 1,
    createdAt: FieldValue.serverTimestamp(),
  });

  return { success: true };
}
