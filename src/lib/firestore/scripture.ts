import { getAdminFirestore } from '@/lib/firebase/admin';
import type { ScriptureVerse, ScriptureBook } from '@/lib/types/scripture';

/**
 * Build keyword tokens for full-text search on a verse.
 * Splits on whitespace and non-word characters, filters tokens to >= 3 chars,
 * lowercases, and deduplicates. Mirrors buildVideoSearchKeywords pattern.
 */
export function buildVerseKeywords(text: string): string[] {
  const tokens = text.toLowerCase().split(/[\s\W]+/).filter(t => t.length >= 3);
  return [...new Set(tokens)];
}

/**
 * Fetch all verses for a given translation, book, and chapter, ordered by verse number.
 */
export async function getChapter(
  translationId: string,
  bookAbbrev: string,
  chapter: number
): Promise<ScriptureVerse[]> {
  const db = getAdminFirestore();
  const snap = await db
    .collection('scripture_verses')
    .where('translationId', '==', translationId)
    .where('bookAbbrev', '==', bookAbbrev)
    .where('chapter', '==', chapter)
    .orderBy('verse', 'asc')
    .get();
  return snap.docs.map(d => d.data() as ScriptureVerse);
}

/**
 * Search verses by keyword across all books (or within a translation).
 * Uses array-contains on the searchKeywords field.
 */
export async function searchVerses(
  query: string,
  translationId?: string,
  limit = 30
): Promise<ScriptureVerse[]> {
  const db = getAdminFirestore();
  const keyword = query.toLowerCase().trim();
  if (!keyword) return [];

  let q = db
    .collection('scripture_verses')
    .where('searchKeywords', 'array-contains', keyword);

  if (translationId) {
    q = q.where('translationId', '==', translationId);
  }

  const snap = await q.limit(limit).get();
  return snap.docs.map(d => d.data() as ScriptureVerse);
}

/**
 * Fetch all books for a translation ordered by canonical bookIndex.
 */
export async function getBooks(translationId: string): Promise<ScriptureBook[]> {
  const db = getAdminFirestore();
  const snap = await db
    .collection('scripture_books')
    .where('translationId', '==', translationId)
    .orderBy('bookIndex', 'asc')
    .get();
  return snap.docs.map(d => d.data() as ScriptureBook);
}

/**
 * Resolve a bookAbbrev (URL slug) to its ScriptureBook metadata.
 * Returns null if not found.
 */
export async function getBookMeta(bookAbbrev: string): Promise<ScriptureBook | null> {
  const db = getAdminFirestore();
  const snap = await db
    .collection('scripture_books')
    .where('bookAbbrev', '==', bookAbbrev)
    .limit(1)
    .get();
  if (snap.empty) return null;
  return snap.docs[0].data() as ScriptureBook;
}
