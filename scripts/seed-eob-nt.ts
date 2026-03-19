/**
 * Ekklesia Agora — EOB New Testament Seed Script
 *
 * Seeds all Eastern Orthodox Bible (EOB) New Testament verse documents into Firestore.
 * Source: Pre-parsed JSON file extracted from the EOB PDF.
 *
 * Usage:
 *   npm run seed:eob-nt [path/to/eob-nt.json]
 *
 * Default data file: ./data/eob-nt.json
 *
 * Expected JSON format:
 *   [
 *     { "book": "Matthew", "chapter": 1, "verse": 1, "text": "The book of the genealogy..." },
 *     ...
 *   ]
 *
 * This design separates the PDF-to-JSON conversion (manual/semi-manual step that
 * may require human inspection) from the Firestore seeding (automated).
 *
 * Writes are idempotent (doc.set overwrites existing docs).
 * Safe to re-run without creating duplicates.
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';
import * as fs from 'fs';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config({ path: resolve(process.cwd(), '.env') });

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const BATCH_SIZE = 500;

// ── NT book map ───────────────────────────────────────────────────────────────
interface NTBookInfo {
  slug: string;
  index: number;
  expectedVerseCount: number;
}

const NT_BOOK_MAP: Record<string, NTBookInfo> = {
  'Matthew':         { slug: 'matthew',         index: 1,  expectedVerseCount: 1071 },
  'Mark':            { slug: 'mark',            index: 2,  expectedVerseCount: 678  },
  'Luke':            { slug: 'luke',            index: 3,  expectedVerseCount: 1151 },
  'John':            { slug: 'john',            index: 4,  expectedVerseCount: 879  },
  'Acts':            { slug: 'acts',            index: 5,  expectedVerseCount: 1007 },
  'Romans':          { slug: 'romans',          index: 6,  expectedVerseCount: 433  },
  '1 Corinthians':   { slug: '1-corinthians',   index: 7,  expectedVerseCount: 437  },
  '2 Corinthians':   { slug: '2-corinthians',   index: 8,  expectedVerseCount: 257  },
  'Galatians':       { slug: 'galatians',       index: 9,  expectedVerseCount: 149  },
  'Ephesians':       { slug: 'ephesians',       index: 10, expectedVerseCount: 155  },
  'Philippians':     { slug: 'philippians',     index: 11, expectedVerseCount: 104  },
  'Colossians':      { slug: 'colossians',      index: 12, expectedVerseCount: 95   },
  '1 Thessalonians': { slug: '1-thessalonians', index: 13, expectedVerseCount: 89   },
  '2 Thessalonians': { slug: '2-thessalonians', index: 14, expectedVerseCount: 47   },
  '1 Timothy':       { slug: '1-timothy',       index: 15, expectedVerseCount: 113  },
  '2 Timothy':       { slug: '2-timothy',       index: 16, expectedVerseCount: 83   },
  'Titus':           { slug: 'titus',           index: 17, expectedVerseCount: 46   },
  'Philemon':        { slug: 'philemon',        index: 18, expectedVerseCount: 25   },
  'Hebrews':         { slug: 'hebrews',         index: 19, expectedVerseCount: 303  },
  'James':           { slug: 'james',           index: 20, expectedVerseCount: 108  },
  '1 Peter':         { slug: '1-peter',         index: 21, expectedVerseCount: 105  },
  '2 Peter':         { slug: '2-peter',         index: 22, expectedVerseCount: 61   },
  '1 John':          { slug: '1-john',          index: 23, expectedVerseCount: 105  },
  '2 John':          { slug: '2-john',          index: 24, expectedVerseCount: 13   },
  '3 John':          { slug: '3-john',          index: 25, expectedVerseCount: 14   },
  'Jude':            { slug: 'jude',            index: 26, expectedVerseCount: 25   },
  'Revelation':      { slug: 'revelation',      index: 27, expectedVerseCount: 404  },
};

// ── Keyword builder (inline — mirrors src/lib/firestore/scripture.ts) ─────────
function buildVerseKeywords(text: string): string[] {
  const tokens = text.toLowerCase().split(/[\s\W]+/).filter(t => t.length >= 3);
  return [...new Set(tokens)];
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface VerseInput {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

interface ScriptureVerse {
  verseId: string;
  translationId: string;
  testament: 'OT' | 'NT';
  bookIndex: number;
  bookName: string;
  bookAbbrev: string;
  chapter: number;
  verse: number;
  text: string;
  searchKeywords: string[];
}

interface ScriptureBook {
  bookId: string;
  translationId: string;
  bookIndex: number;
  bookName: string;
  bookAbbrev: string;
  testament: 'OT' | 'NT';
  chapterCount: number;
}

// ── Batch write helper ────────────────────────────────────────────────────────
async function writeBatches(
  db: FirebaseFirestore.Firestore,
  collection: string,
  docs: Array<{ id: string; data: Record<string, unknown> }>,
  label: string
): Promise<void> {
  let count = 0;
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const chunk = docs.slice(i, i + BATCH_SIZE);
    const batch = db.batch();
    for (const { id, data } of chunk) {
      batch.set(db.collection(collection).doc(id), data);
    }
    await batch.commit();
    count += chunk.length;
    console.log(`  Seeded ${count} / ${docs.length} ${label}`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  if (!projectId || !privateKey || !clientEmail) {
    console.error('ERROR: Firebase Admin SDK credentials are missing.');
    console.error('Ensure FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL are set in .env.local');
    process.exit(1);
  }

  if (getApps().length === 0) {
    initializeApp({ credential: cert({ projectId, privateKey, clientEmail }) });
  }

  const db = getFirestore();

  // Resolve data file from args or default
  const dataFile = process.argv[2] ?? resolve(process.cwd(), 'data', 'eob-nt.json');
  console.log(`Reading EOB NT data from: ${dataFile}`);

  if (!fs.existsSync(dataFile)) {
    console.error(`ERROR: Data file not found: ${dataFile}`);
    console.error('Extract the EOB NT from the PDF to JSON format, then provide the path.');
    console.error('Expected format: [{ "book": "Matthew", "chapter": 1, "verse": 1, "text": "..." }, ...]');
    process.exit(1);
  }

  let inputVerses: VerseInput[];
  try {
    const raw = fs.readFileSync(dataFile, 'utf-8');
    inputVerses = JSON.parse(raw) as VerseInput[];
  } catch (err) {
    console.error('ERROR: Failed to parse JSON data file:', err);
    process.exit(1);
  }

  if (!Array.isArray(inputVerses) || inputVerses.length === 0) {
    console.error('ERROR: Data file must contain a non-empty array of verse objects.');
    process.exit(1);
  }

  console.log(`Loaded ${inputVerses.length} verses from input file`);

  // ── Group verses by book for validation ──────────────────────────────────
  const bookVerseMap = new Map<string, VerseInput[]>();
  const unknownBooks = new Set<string>();

  for (const v of inputVerses) {
    const bookInfo = NT_BOOK_MAP[v.book];
    if (!bookInfo) {
      unknownBooks.add(v.book);
      continue;
    }
    if (!bookVerseMap.has(v.book)) bookVerseMap.set(v.book, []);
    bookVerseMap.get(v.book)!.push(v);
  }

  if (unknownBooks.size > 0) {
    console.warn(`WARN: Unrecognized book names (will be skipped): ${Array.from(unknownBooks).join(', ')}`);
  }

  // ── Validate verse counts per book ──────────────────────────────────────
  console.log('\nVerse count validation:');
  console.log('Book                  | Expected | Actual | Status');
  console.log('----------------------|----------|--------|-------');
  for (const [bookName, bookInfo] of Object.entries(NT_BOOK_MAP)) {
    const verses = bookVerseMap.get(bookName) ?? [];
    const actual = verses.length;
    const expected = bookInfo.expectedVerseCount;
    const status = actual === expected ? 'OK' : actual === 0 ? 'MISSING' : `WARN (diff: ${actual - expected})`;
    const paddedName = bookName.padEnd(21);
    console.log(`${paddedName} | ${String(expected).padStart(8)} | ${String(actual).padStart(6)} | ${status}`);
  }

  // ── Build Firestore documents ─────────────────────────────────────────────
  const allVerses: Array<{ id: string; data: Record<string, unknown> }> = [];
  const allBooks: Array<{ id: string; data: Record<string, unknown> }> = [];

  for (const [bookName, verseInputs] of bookVerseMap.entries()) {
    const bookInfo = NT_BOOK_MAP[bookName];
    const { slug, index: bookIndex } = bookInfo;

    const chapterNumbers = new Set<number>();

    for (const v of verseInputs) {
      chapterNumbers.add(v.chapter);

      const text = v.text?.trim() ?? '';
      if (!text) continue;

      const verseId = `eob_nt_${slug}_${v.chapter}_${v.verse}`;
      const verseDoc: ScriptureVerse = {
        verseId,
        translationId: 'eob_nt',
        testament: 'NT',
        bookIndex,
        bookName,
        bookAbbrev: slug,
        chapter: v.chapter,
        verse: v.verse,
        text,
        searchKeywords: buildVerseKeywords(text),
      };

      allVerses.push({ id: verseId, data: verseDoc as unknown as Record<string, unknown> });
    }

    const bookDoc: ScriptureBook = {
      bookId: `eob_nt_${slug}`,
      translationId: 'eob_nt',
      bookIndex,
      bookName,
      bookAbbrev: slug,
      testament: 'NT',
      chapterCount: chapterNumbers.size,
    };

    allBooks.push({ id: bookDoc.bookId, data: bookDoc as unknown as Record<string, unknown> });
    console.log(`\nParsed: ${bookName} — ${verseInputs.length} verses, ${chapterNumbers.size} chapters`);
  }

  console.log(`\nTotal: ${allBooks.length} books, ${allVerses.length} verses`);

  if (allVerses.length === 0) {
    console.error('ERROR: No verses were parsed. Check the input JSON file.');
    process.exit(1);
  }

  // Write books first
  console.log('\nWriting scripture_books...');
  await writeBatches(db, 'scripture_books', allBooks, 'books');

  // Write verses in 500-op batches
  console.log('\nWriting scripture_verses...');
  await writeBatches(db, 'scripture_verses', allVerses, 'verses');

  console.log('\nEOB NT seed complete.');
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
