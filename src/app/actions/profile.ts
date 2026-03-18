'use server';

import { getAdminFirestore } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { isHandleAvailable } from '@/lib/firestore/profiles';
import { z } from 'zod';

const profileSchema = z.object({
  displayName: z.string().min(1).max(50),
  handle: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_]+$/, 'Handle must be lowercase letters, numbers, and underscores only'),
  bio: z.string().max(300),
  jurisdictionId: z.string().nullable(),
  patronSaint: z.string().max(100).nullable(),
});

export async function updateProfile(
  uid: string,
  data: z.infer<typeof profileSchema>,
): Promise<{ success: boolean; error?: string }> {
  const parsed = profileSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  // Check handle uniqueness (excluding current user)
  const handleAvailable = await isHandleAvailable(parsed.data.handle, uid);
  if (!handleAvailable) {
    return { success: false, error: 'This handle is already taken' };
  }

  const db = getAdminFirestore();
  await db.collection('userProfiles').doc(uid).update({
    ...parsed.data,
    updatedAt: FieldValue.serverTimestamp(),
  });
  return { success: true };
}

export async function updateAvatar(uid: string, avatarUrl: string): Promise<void> {
  const db = getAdminFirestore();
  await db.collection('userProfiles').doc(uid).update({
    avatarUrl,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function updateBanner(uid: string, bannerUrl: string): Promise<void> {
  const db = getAdminFirestore();
  await db.collection('userProfiles').doc(uid).update({
    bannerUrl,
    updatedAt: FieldValue.serverTimestamp(),
  });
}
