'use server';

import { getAdminFirestore } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { isHandleAvailable } from '@/lib/firestore/profiles';
import { buildDisplayNameKeywords } from '@/lib/firestore/synodeia';
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
    displayNameKeywords: buildDisplayNameKeywords(parsed.data.displayName),
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

export async function updateCalendarPreference(
  uid: string,
  preference: 'new_julian' | 'old_julian'
): Promise<{ success: boolean; error?: string }> {
  if (preference !== 'new_julian' && preference !== 'old_julian') {
    return { success: false, error: 'Invalid calendar preference' };
  }
  const db = getAdminFirestore();
  await db.collection('userProfiles').doc(uid).update({
    calendarPreference: preference,
    updatedAt: FieldValue.serverTimestamp(),
  });
  return { success: true };
}

export async function updateLocationSharing(
  uid: string,
  data: { locationSharingEnabled: boolean; city?: string; stateRegion?: string }
): Promise<{ success: boolean; error?: string }> {
  const db = getAdminFirestore();
  const update: Record<string, unknown> = {
    locationSharingEnabled: data.locationSharingEnabled,
    updatedAt: FieldValue.serverTimestamp(),
  };
  if (data.locationSharingEnabled && data.city !== undefined) {
    update.city = data.city;
  }
  if (data.locationSharingEnabled && data.stateRegion !== undefined) {
    update.stateRegion = data.stateRegion;
  }
  await db.collection('userProfiles').doc(uid).update(update);
  return { success: true };
}
