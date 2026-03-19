'use server';

import { searchVerses } from '@/lib/firestore/scripture';
import type { ScriptureVerse } from '@/lib/types/scripture';

export async function searchScripture(query: string): Promise<ScriptureVerse[]> {
  if (!query || query.trim().length < 3) return [];
  return searchVerses(query.trim());
}
