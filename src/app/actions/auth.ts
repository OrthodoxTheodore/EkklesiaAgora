'use server';

import { getAdminAuth } from '@/lib/firebase/admin';

/**
 * Server Action: set roleLevel: 1 (registered) on a newly created user's custom claims.
 * Called from the register page after createUserWithEmailAndPassword succeeds.
 */
export async function registerUser(uid: string): Promise<void> {
  const adminAuth = getAdminAuth();
  await adminAuth.setCustomUserClaims(uid, { roleLevel: 1 });
}
