'use server';

import { getAdminAuth, getAdminFirestore } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Server Action: set roleLevel: 1 (registered) on a newly created user's custom claims,
 * and create their userProfiles document with defaults derived from their email.
 * Called from the register page after createUserWithEmailAndPassword succeeds.
 */
export async function registerUser(uid: string, email: string): Promise<void> {
  const adminAuth = getAdminAuth();
  const db = getAdminFirestore();

  // Set roleLevel claim (existing behaviour)
  await adminAuth.setCustomUserClaims(uid, { roleLevel: 1 });

  // Create userProfiles document with default handle derived from email
  const defaultHandle = email
    .split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .slice(0, 30);

  // Handle uniqueness: append uid suffix if collision exists
  const existingHandle = await db
    .collection('userProfiles')
    .where('handle', '==', defaultHandle)
    .limit(1)
    .get();
  const handle = existingHandle.empty ? defaultHandle : `${defaultHandle}_${uid.slice(0, 6)}`;

  await db.collection('userProfiles').doc(uid).set({
    uid,
    handle,
    displayName: email.split('@')[0],
    bio: '',
    avatarUrl: null,
    bannerUrl: null,
    jurisdictionId: null,
    patronSaint: null,
    followerCount: 0,
    followingCount: 0,
    postCount: 0,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
}
