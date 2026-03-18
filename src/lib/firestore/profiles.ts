import { getAdminFirestore } from '@/lib/firebase/admin';
import type { UserProfile } from '@/lib/types/social';

export async function getProfileByUid(uid: string): Promise<UserProfile | null> {
  const db = getAdminFirestore();
  const doc = await db.collection('userProfiles').doc(uid).get();
  return doc.exists ? (doc.data() as UserProfile) : null;
}

export async function getProfileByHandle(handle: string): Promise<UserProfile | null> {
  const db = getAdminFirestore();
  const snap = await db
    .collection('userProfiles')
    .where('handle', '==', handle)
    .limit(1)
    .get();
  return snap.empty ? null : (snap.docs[0].data() as UserProfile);
}

export async function isHandleAvailable(handle: string, excludeUid?: string): Promise<boolean> {
  const db = getAdminFirestore();
  const snap = await db
    .collection('userProfiles')
    .where('handle', '==', handle)
    .limit(1)
    .get();
  if (snap.empty) return true;
  if (excludeUid && snap.docs[0].id === excludeUid) return true;
  return false;
}
