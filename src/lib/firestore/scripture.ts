/**
 * Scripture data access — reads from static JSON files in public/bible/
 * instead of Firestore, avoiding quota limits for this large static dataset.
 *
 * File layout (built by scripts/build-bible-static.mjs):
 *   public/bible/brenton-books.json
 *   public/bible/brenton/{bookAbbrev}/{chapter}.json
 *   public/bible/nt-books.json
 *   public/bible/nt/{bookAbbrev}/{chapter}.json
 */

import fs from 'fs';
import path from 'path';
import type { ScriptureVerse, ScriptureBook } from '@/lib/types/scripture';
import { TRANSLATIONS } from '@/lib/types/scripture';

// ─── file helpers ────────────────────────────────────────────────────────────

function bibleRoot(): string {
  return path.join(process.cwd(), 'public', 'bible');
}

function readJson<T>(filePath: string): T | null {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
  } catch {
    return null;
  }
}

// ─── book index (module-level cache) ─────────────────────────────────────────

let _brentonBooks: ScriptureBook[] | null = null;
let _ntBooks: ScriptureBook[] | null = null;

function loadBrentonBooks(): ScriptureBook[] {
  if (!_brentonBooks) {
    _brentonBooks = readJson<ScriptureBook[]>(path.join(bibleRoot(), 'brenton-books.json')) ?? [];
  }
  return _brentonBooks;
}

function loadNtBooks(): ScriptureBook[] {
  if (!_ntBooks) {
    _ntBooks = readJson<ScriptureBook[]>(path.join(bibleRoot(), 'nt-books.json')) ?? [];
  }
  return _ntBooks;
}

// ─── public API (matches original Firestore signatures) ───────────────────────

/**
 * Fetch all books for a translation ordered by canonical bookIndex.
 */
export async function getBooks(translationId: string): Promise<ScriptureBook[]> {
  if (translationId === TRANSLATIONS.BRENTON) return loadBrentonBooks();
  if (translationId === TRANSLATIONS.EOB_NT) return loadNtBooks();
  return [];
}

/**
 * Resolve a bookAbbrev (URL slug) to its ScriptureBook metadata.
 * Returns null if not found.
 */
export async function getBookMeta(bookAbbrev: string): Promise<ScriptureBook | null> {
  const all = [...loadBrentonBooks(), ...loadNtBooks()];
  return all.find(b => b.bookAbbrev === bookAbbrev) ?? null;
}

/**
 * Fetch all verses for a given translation, book, and chapter, ordered by verse number.
 */
export async function getChapter(
  translationId: string,
  bookAbbrev: string,
  chapter: number
): Promise<ScriptureVerse[]> {
  const subfolder = translationId === TRANSLATIONS.BRENTON ? 'brenton' : 'nt';
  const filePath = path.join(bibleRoot(), subfolder, bookAbbrev, `${chapter}.json`);
  return readJson<ScriptureVerse[]>(filePath) ?? [];
}

/**
 * Search verses by keyword across all books (or within a translation).
 * Scans the module-level verse index; builds it lazily on first call.
 */

// Lazy full-text index — built once per process lifetime
let _searchIndex: ScriptureVerse[] | null = null;

function loadSearchIndex(): ScriptureVerse[] {
  if (_searchIndex) return _searchIndex;

  const root = bibleRoot();
  const allVerses: ScriptureVerse[] = [];

  function collectDir(dir: string) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        collectDir(full);
      } else if (entry.name.endsWith('.json') && !entry.name.includes('-books')) {
        const verses = readJson<ScriptureVerse[]>(full);
        if (verses) allVerses.push(...verses);
      }
    }
  }

  collectDir(path.join(root, 'brenton'));
  collectDir(path.join(root, 'nt'));
  _searchIndex = allVerses;
  return _searchIndex;
}

export async function searchVerses(
  query: string,
  translationId?: string,
  limit = 30
): Promise<ScriptureVerse[]> {
  const keyword = query.toLowerCase().trim();
  if (!keyword || keyword.length < 2) return [];

  const allVerses = loadSearchIndex();
  const results: ScriptureVerse[] = [];

  for (const v of allVerses) {
    if (translationId && v.translationId !== translationId) continue;
    // Match on searchKeywords array first (faster), fall back to text scan
    const inKeywords = v.searchKeywords.includes(keyword);
    const inText = !inKeywords && v.text.toLowerCase().includes(keyword);
    if (inKeywords || inText) {
      results.push(v);
      if (results.length >= limit) break;
    }
  }

  return results;
}

/**
 * Kept for backward compatibility — no-op since data is file-based.
 */
export function buildVerseKeywords(text: string): string[] {
  const tokens = text.toLowerCase().split(/[\s\W]+/).filter(t => t.length >= 3);
  return [...new Set(tokens)];
}
