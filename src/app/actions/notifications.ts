'use server';

import { getAdminFirestore } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Mark all unread notifications for a user as read.
 * Returns the count of notifications marked.
 */
export async function markNotificationsRead(
  uid: string,
): Promise<{ success: boolean; count: number }> {
  const db = getAdminFirestore();
  const snap = await db
    .collection('users')
    .doc(uid)
    .collection('notifications')
    .where('read', '==', false)
    .limit(100)
    .get();

  if (snap.empty) {
    return { success: true, count: 0 };
  }

  const batch = db.batch();
  snap.docs.forEach((doc) => {
    batch.update(doc.ref, { read: true });
  });
  await batch.commit();

  return { success: true, count: snap.size };
}

/**
 * Mark a single notification as read.
 */
export async function markSingleNotificationRead(
  uid: string,
  notificationId: string,
): Promise<void> {
  const db = getAdminFirestore();
  await db
    .collection('users')
    .doc(uid)
    .collection('notifications')
    .doc(notificationId)
    .update({ read: true });
}
