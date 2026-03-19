'use server';

import { getMembersByJurisdiction, searchMembersByName } from '@/lib/firestore/synodeia';
import type { SynodeiaMember } from '@/lib/firestore/synodeia';

export async function getMembers(
  jurisdictionId: string | null,
  limit = 50
): Promise<SynodeiaMember[]> {
  return getMembersByJurisdiction(jurisdictionId, limit);
}

export async function searchMembers(
  nameQuery: string,
  jurisdictionId: string | null,
  limit = 50
): Promise<SynodeiaMember[]> {
  return searchMembersByName(nameQuery, jurisdictionId, limit);
}
