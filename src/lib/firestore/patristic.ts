import { getAdminFirestore } from '@/lib/firebase/admin';
import type { PatristicText, PatristicAuthor, StudyGuide } from '@/lib/types/patristic';

/**
 * Build keyword tokens for full-text search on a patristic text.
 * Combines title, authorName, topics, and a sample of body words.
 *
 * - Title + authorName + topics: split on [\s\W]+, filter >= 3 chars
 * - Body words: split on [\s\W]+, filter >= 4 chars, sample first maxBodyWords * 3 raw tokens
 * - Deduplicates and lowercases all tokens
 * - Hard cap at 150 total tokens
 */
export function buildPatristicKeywords(
  title: string,
  authorName: string,
  topics: string[],
  body: string,
  maxBodyWords = 100
): string[] {
  // Meta tokens: title + authorName + topics — filter >= 3 chars
  const metaSource = [title, authorName, ...topics].join(' ');
  const metaTokens = metaSource
    .toLowerCase()
    .split(/[\s\W]+/)
    .filter(t => t.length >= 3);

  // Body tokens: sample raw tokens from start of body, filter >= 4 chars
  const rawBodyTokens = body
    .toLowerCase()
    .split(/[\s\W]+/)
    .filter(t => t.length >= 4);
  const bodyTokens = rawBodyTokens.slice(0, maxBodyWords * 3).filter(t => t.length >= 4);

  const allTokens = [...metaTokens, ...bodyTokens];
  const deduped = [...new Set(allTokens)];
  return deduped.slice(0, 150);
}

/**
 * Fetch a PatristicAuthor document by slug.
 * Returns null if the author does not exist.
 */
export async function getAuthor(slug: string): Promise<PatristicAuthor | null> {
  const db = getAdminFirestore();
  const doc = await db.collection('patristic_authors').doc(slug).get();
  if (!doc.exists) return null;
  return doc.data() as PatristicAuthor;
}

/**
 * Fetch all patristic texts by a given author, ordered by sortOrder ascending.
 */
export async function getAuthorTexts(authorSlug: string): Promise<PatristicText[]> {
  const db = getAdminFirestore();
  const snap = await db
    .collection('patristic_texts')
    .where('authorSlug', '==', authorSlug)
    .orderBy('sortOrder', 'asc')
    .get();
  return snap.docs.map(d => d.data() as PatristicText);
}

/**
 * Fetch a single PatristicText document by textId.
 * Returns null if not found.
 */
export async function getPatristicText(textId: string): Promise<PatristicText | null> {
  const db = getAdminFirestore();
  const doc = await db.collection('patristic_texts').doc(textId).get();
  if (!doc.exists) return null;
  return doc.data() as PatristicText;
}

/**
 * Search patristic texts by keyword using array-contains on searchKeywords.
 * Returns empty array for empty/whitespace query.
 * Default limit: 20 results.
 */
export async function searchPatristicTexts(
  query: string,
  limit = 20
): Promise<PatristicText[]> {
  const keyword = query.toLowerCase().trim();
  if (!keyword) return [];

  const db = getAdminFirestore();
  const snap = await db
    .collection('patristic_texts')
    .where('searchKeywords', 'array-contains', keyword)
    .limit(limit)
    .get();
  return snap.docs.map(d => d.data() as PatristicText);
}

/**
 * Fetch all patristic authors ordered by sortOrder ascending.
 */
export async function getPatristicAuthors(): Promise<PatristicAuthor[]> {
  const db = getAdminFirestore();
  const snap = await db
    .collection('patristic_authors')
    .orderBy('sortOrder', 'asc')
    .get();
  return snap.docs.map(d => d.data() as PatristicAuthor);
}

/**
 * Fetch all study guides from the study_guides collection.
 */
export async function getStudyGuides(): Promise<StudyGuide[]> {
  const db = getAdminFirestore();
  const snap = await db.collection('study_guides').get();
  return snap.docs.map(d => d.data() as StudyGuide);
}

/**
 * Fetch a single StudyGuide by slug.
 * Returns null if not found.
 */
export async function getStudyGuide(slug: string): Promise<StudyGuide | null> {
  const db = getAdminFirestore();
  const snap = await db
    .collection('study_guides')
    .where('slug', '==', slug)
    .limit(1)
    .get();
  if (snap.empty) return null;
  return snap.docs[0].data() as StudyGuide;
}
