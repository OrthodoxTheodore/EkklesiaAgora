import 'server-only';

import { getAdminAuth, getAdminFirestore } from '@/lib/firebase/admin';
import { ROLE_LEVELS } from '@/lib/firebase/roles';
import type { RoleLevel } from '@/lib/firebase/roles';
import { FieldValue } from 'firebase-admin/firestore';

export { type RoleLevel };

/**
 * Sets a user's roleLevel custom claim via Firebase Admin SDK.
 * Also denormalizes roleLevel into the users/{uid} Firestore document for queries.
 * Logs the promotion to roleAuditLog collection for admin audit trail.
 *
 * SECURITY: This function must only be called from Server Actions/API routes
 * after verifying the caller's permissions (see actions.ts).
 */
export async function setUserRole(
  uid: string,
  roleLevel: RoleLevel,
  promotedByUid: string,
): Promise<void> {
  const auth = getAdminAuth();
  const db = getAdminFirestore();

  // 1. Set Firebase Auth custom claim — this is what Firestore rules and
  //    getTokens() will read from the decoded JWT.
  await auth.setCustomUserClaims(uid, { roleLevel });

  // 2. Denormalize roleLevel into Firestore users doc for collection queries
  //    (Firestore rules cannot query custom claims directly across users).
  await db.collection('users').doc(uid).set(
    {
      roleLevel,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  // 3. Append audit log entry — written via Admin SDK which bypasses rules.
  //    Firestore rules set write:false on roleAuditLog so only Admin SDK can write.
  await db.collection('roleAuditLog').add({
    targetUid: uid,
    newRole: roleLevel,
    promotedBy: promotedByUid,
    timestamp: FieldValue.serverTimestamp(),
  });
}

/**
 * Returns a user's current roleLevel from their Firebase Auth custom claims.
 * Falls back to guest (0) if no claim is set.
 */
export async function getUserRoleLevel(uid: string): Promise<RoleLevel> {
  const auth = getAdminAuth();
  const userRecord = await auth.getUser(uid);
  const level = userRecord.customClaims?.roleLevel as RoleLevel | undefined;
  return level ?? ROLE_LEVELS.guest;
}

/**
 * Searches users by email prefix in Firestore.
 * Returns up to 10 matching users with their current roleLevel.
 * Only call this from admin-gated Server Actions.
 */
export async function searchUsersByEmail(
  emailPrefix: string,
): Promise<Array<{ uid: string; email: string; displayName: string; roleLevel: RoleLevel }>> {
  if (!emailPrefix || emailPrefix.trim().length === 0) return [];

  const db = getAdminFirestore();
  const prefix = emailPrefix.trim().toLowerCase();

  // Firestore range query for email prefix search (lexicographic).
  // Requires a composite index on email (ascending) — covered by default single-field index.
  const snapshot = await db
    .collection('users')
    .where('email', '>=', prefix)
    .where('email', '<=', prefix + '\uf8ff')
    .limit(10)
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      uid: doc.id,
      email: data.email ?? '',
      displayName: data.displayName ?? '',
      roleLevel: (data.roleLevel ?? ROLE_LEVELS.guest) as RoleLevel,
    };
  });
}
