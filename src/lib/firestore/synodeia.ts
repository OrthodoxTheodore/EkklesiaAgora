import { getAdminFirestore } from '@/lib/firebase/admin';
import { CANONICAL_ORTHODOX_JURISDICTIONS } from '@/lib/constants/jurisdictions';

const CANONICAL_IDS: string[] = CANONICAL_ORTHODOX_JURISDICTIONS.map(j => j.id);

export interface SynodeiaMember {
  uid: string;
  handle: string;
  displayName: string;
  avatarUrl: string | null;
  jurisdictionId: string;
  city: string | null;
  stateRegion: string | null;
}

/**
 * Strip location fields when user has locationSharingEnabled == false.
 * This is the privacy enforcement layer — Firestore rules cannot gate individual fields.
 */
export function sanitizeMember(profile: Record<string, unknown>): SynodeiaMember {
  const locationEnabled = profile.locationSharingEnabled === true;
  return {
    uid: (profile.uid as string) ?? '',
    handle: (profile.handle as string) ?? '',
    displayName: (profile.displayName as string) ?? '',
    avatarUrl: (profile.avatarUrl as string | null) ?? null,
    jurisdictionId: (profile.jurisdictionId as string) ?? '',
    city: locationEnabled ? ((profile.city as string) ?? null) : null,
    stateRegion: locationEnabled ? ((profile.stateRegion as string) ?? null) : null,
  };
}

/**
 * Build prefix search keywords for display name.
 * Generates all prefixes of length >= 2 for each word token.
 * Pattern adapted from buildVideoSearchKeywords in src/lib/firestore/videos.ts.
 */
export function buildDisplayNameKeywords(displayName: string): string[] {
  const tokens = displayName.toLowerCase().split(/[\s\W]+/).filter(t => t.length >= 2);
  const prefixes: string[] = [];
  for (const token of tokens) {
    for (let i = 2; i <= token.length; i++) {
      prefixes.push(token.slice(0, i));
    }
  }
  return [...new Set([...tokens, ...prefixes])];
}

/**
 * Get members filtered by jurisdiction. Only returns canonical Orthodox members.
 * When jurisdictionId is null, returns all canonical Orthodox members.
 */
export async function getMembersByJurisdiction(
  jurisdictionId: string | null,
  limit = 50
): Promise<SynodeiaMember[]> {
  const db = getAdminFirestore();

  let query;
  if (jurisdictionId) {
    // Verify jurisdiction is canonical before querying
    if (!CANONICAL_IDS.includes(jurisdictionId)) return [];
    query = db.collection('userProfiles')
      .where('jurisdictionId', '==', jurisdictionId)
      .limit(limit);
  } else {
    query = db.collection('userProfiles')
      .where('jurisdictionId', 'in', CANONICAL_IDS)
      .limit(limit);
  }

  const snap = await query.get();
  return snap.docs.map(doc => sanitizeMember({ ...doc.data(), uid: doc.id }));
}

/**
 * Search members by display name prefix keyword.
 * Uses displayNameKeywords array-contains query (same pattern as video search).
 */
export async function searchMembersByName(
  nameQuery: string,
  jurisdictionId: string | null,
  limit = 50
): Promise<SynodeiaMember[]> {
  const db = getAdminFirestore();
  const keyword = nameQuery.toLowerCase().trim();
  if (keyword.length < 2) return [];

  let query;
  if (jurisdictionId && CANONICAL_IDS.includes(jurisdictionId)) {
    query = db.collection('userProfiles')
      .where('displayNameKeywords', 'array-contains', keyword)
      .where('jurisdictionId', '==', jurisdictionId)
      .limit(limit);
  } else {
    query = db.collection('userProfiles')
      .where('displayNameKeywords', 'array-contains', keyword)
      .limit(limit);
  }

  const snap = await query.get();
  // Filter to canonical jurisdictions in-memory when no jurisdictionId filter
  return snap.docs
    .map(doc => sanitizeMember({ ...doc.data(), uid: doc.id }))
    .filter(m => CANONICAL_IDS.includes(m.jurisdictionId));
}
