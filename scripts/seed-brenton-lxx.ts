/**
 * Ekklesia Agora — Brenton LXX Seed Script
 *
 * Seeds all Brenton Septuagint Old Testament verse documents into Firestore.
 * Source: eBible.org Brenton USFM files (eng-Brenton_usfm/).
 *
 * Usage:
 *   npm run seed:brenton [path/to/eng-Brenton_usfm/]
 *
 * Default data directory: ./data/eng-Brenton_usfm/
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

// ── Canonical Brenton LXX book mapping ───────────────────────────────────────
// Maps USFM book codes to { slug, name, index } for scripture URL and Firestore docs.
// Covers all books included in eBible.org's eng-Brenton USFM bundle.

interface BookInfo {
  slug: string;
  name: string;
  index: number;
}

const USFM_TO_SLUG: Record<string, BookInfo> = {
  GEN: { slug: 'genesis',             name: 'Genesis',            index: 1  },
  EXO: { slug: 'exodus',              name: 'Exodus',             index: 2  },
  LEV: { slug: 'leviticus',           name: 'Leviticus',          index: 3  },
  NUM: { slug: 'numbers',             name: 'Numbers',            index: 4  },
  DEU: { slug: 'deuteronomy',         name: 'Deuteronomy',        index: 5  },
  JOS: { slug: 'joshua',              name: 'Joshua',             index: 6  },
  JDG: { slug: 'judges',              name: 'Judges',             index: 7  },
  RUT: { slug: 'ruth',                name: 'Ruth',               index: 8  },
  '1SA': { slug: '1-samuel',          name: '1 Samuel',           index: 9  },
  '2SA': { slug: '2-samuel',          name: '2 Samuel',           index: 10 },
  '1KI': { slug: '1-kings',           name: '1 Kings',            index: 11 },
  '2KI': { slug: '2-kings',           name: '2 Kings',            index: 12 },
  '1CH': { slug: '1-chronicles',      name: '1 Chronicles',       index: 13 },
  '2CH': { slug: '2-chronicles',      name: '2 Chronicles',       index: 14 },
  '1ES': { slug: '1-esdras',          name: '1 Esdras',           index: 15 },
  EZR: { slug: 'ezra',                name: 'Ezra',               index: 16 },
  NEH: { slug: 'nehemiah',            name: 'Nehemiah',           index: 17 },
  TOB: { slug: 'tobit',               name: 'Tobit',              index: 18 },
  JDT: { slug: 'judith',              name: 'Judith',             index: 19 },
  EST: { slug: 'esther',              name: 'Esther',             index: 20 },
  '1MA': { slug: '1-maccabees',       name: '1 Maccabees',        index: 21 },
  '2MA': { slug: '2-maccabees',       name: '2 Maccabees',        index: 22 },
  '3MA': { slug: '3-maccabees',       name: '3 Maccabees',        index: 23 },
  PSA: { slug: 'psalms',              name: 'Psalms',             index: 24 },
  MAN: { slug: 'prayer-of-manasseh',  name: 'Prayer of Manasseh', index: 25 },
  PRO: { slug: 'proverbs',            name: 'Proverbs',           index: 26 },
  ECC: { slug: 'ecclesiastes',        name: 'Ecclesiastes',       index: 27 },
  SNG: { slug: 'song-of-solomon',     name: 'Song of Solomon',    index: 28 },
  JOB: { slug: 'job',                 name: 'Job',                index: 29 },
  WIS: { slug: 'wisdom-of-solomon',   name: 'Wisdom of Solomon',  index: 30 },
  SIR: { slug: 'sirach',              name: 'Sirach',             index: 31 },
  PSS: { slug: 'psalms-of-solomon',   name: 'Psalms of Solomon',  index: 32 },
  HOS: { slug: 'hosea',               name: 'Hosea',              index: 33 },
  AMO: { slug: 'amos',                name: 'Amos',               index: 34 },
  MIC: { slug: 'micah',               name: 'Micah',              index: 35 },
  JOL: { slug: 'joel',                name: 'Joel',               index: 36 },
  OBA: { slug: 'obadiah',             name: 'Obadiah',            index: 37 },
  JON: { slug: 'jonah',               name: 'Jonah',              index: 38 },
  NAM: { slug: 'nahum',               name: 'Nahum',              index: 39 },
  HAB: { slug: 'habakkuk',            name: 'Habakkuk',           index: 40 },
  ZEP: { slug: 'zephaniah',           name: 'Zephaniah',          index: 41 },
  HAG: { slug: 'haggai',              name: 'Haggai',             index: 42 },
  ZEC: { slug: 'zechariah',           name: 'Zechariah',          index: 43 },
  MAL: { slug: 'malachi',             name: 'Malachi',            index: 44 },
  ISA: { slug: 'isaiah',              name: 'Isaiah',             index: 45 },
  JER: { slug: 'jeremiah',            name: 'Jeremiah',           index: 46 },
  BAR: { slug: 'baruch',              name: 'Baruch',             index: 47 },
  LAM: { slug: 'lamentations',        name: 'Lamentations',       index: 48 },
  EZK: { slug: 'ezekiel',             name: 'Ezekiel',            index: 49 },
  DAN: { slug: 'daniel',              name: 'Daniel',             index: 50 },
};

// ── Keyword builder (inline — mirrors src/lib/firestore/scripture.ts) ─────────
function buildVerseKeywords(text: string): string[] {
  const tokens = text.toLowerCase().split(/[\s\W]+/).filter(t => t.length >= 3);
  return [...new Set(tokens)];
}

// ── Verse object ──────────────────────────────────────────────────────────────
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

  // Resolve data directory from args or default
  const dataDir = process.argv[2] ?? resolve(process.cwd(), 'data', 'eng-Brenton_usfm');
  console.log(`Reading USFM files from: ${dataDir}`);

  if (!fs.existsSync(dataDir)) {
    console.error(`ERROR: Data directory not found: ${dataDir}`);
    console.error('Download the Brenton USFM bundle from eBible.org and extract it to ./data/eng-Brenton_usfm/');
    process.exit(1);
  }

  const usfm = require('usfm-js');

  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.usfm') || f.endsWith('.USFM'));
  console.log(`Found ${files.length} USFM files`);

  const allVerses: Array<{ id: string; data: Record<string, unknown> }> = [];
  const allBooks: Array<{ id: string; data: Record<string, unknown> }> = [];
  const skippedFiles: string[] = [];

  for (const filename of files) {
    const filePath = resolve(dataDir, filename);
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    // Parse USFM
    let json: Record<string, unknown>;
    try {
      json = usfm.toJSON(fileContent);
    } catch (err) {
      console.warn(`WARN: Failed to parse ${filename} — skipping`);
      skippedFiles.push(filename);
      continue;
    }

    // Extract book code from \id marker
    const headers = json.headers as Array<{ tag: string; content?: string }> | undefined;
    const idHeader = headers?.find(h => h.tag === 'id');
    const rawCode = idHeader?.content?.trim().split(/\s+/)[0]?.toUpperCase() ?? '';

    const bookInfo = USFM_TO_SLUG[rawCode];
    if (!bookInfo) {
      console.warn(`WARN: Unrecognized USFM book code "${rawCode}" in ${filename} — skipping`);
      skippedFiles.push(filename);
      continue;
    }

    const { slug, name, index: bookIndex } = bookInfo;
    // usfm-js returns chapters as an object keyed by chapter number string,
    // where each value is also an object keyed by verse number string.
    // e.g. json.chapters = { "1": { "1": { verseObjects: [...] }, "2": {...} } }
    const chaptersRaw = json.chapters as Record<string, Record<string, { verseObjects?: Array<Record<string, unknown>> }>> | undefined;
    if (!chaptersRaw || typeof chaptersRaw !== 'object') {
      console.warn(`WARN: No chapters found in ${filename} — skipping`);
      skippedFiles.push(filename);
      continue;
    }

    const chapterNumbers = new Set<number>();
    const bookVerses: ScriptureVerse[] = [];

    for (const chapterKey of Object.keys(chaptersRaw)) {
      const chapterNum = parseInt(chapterKey, 10);
      if (isNaN(chapterNum)) continue;
      chapterNumbers.add(chapterNum);

      const versesRaw = chaptersRaw[chapterKey];
      if (!versesRaw || typeof versesRaw !== 'object') continue;

      for (const verseKey of Object.keys(versesRaw)) {
        const verseNum = parseInt(verseKey, 10);
        if (isNaN(verseNum)) continue;

        const verseObj = versesRaw[verseKey];
        // Extract plain text: concatenate only type:'text' objects
        const verseObjects = Array.isArray(verseObj?.verseObjects) ? verseObj.verseObjects : [];
        const text = verseObjects
          .filter((o: Record<string, unknown>) => o.type === 'text')
          .map((o: Record<string, unknown>) => String(o.text ?? ''))
          .join('')
          .replace(/\s+/g, ' ')
          .trim();

        if (!text) continue;

        const verseId = `brenton_${slug}_${chapterNum}_${verseNum}`;
        bookVerses.push({
          verseId,
          translationId: 'brenton',
          testament: 'OT',
          bookIndex,
          bookName: name,
          bookAbbrev: slug,
          chapter: chapterNum,
          verse: verseNum,
          text,
          searchKeywords: buildVerseKeywords(text),
        });
      }
    }

    // Build ScriptureBook document
    const bookDoc: ScriptureBook = {
      bookId: `brenton_${slug}`,
      translationId: 'brenton',
      bookIndex,
      bookName: name,
      bookAbbrev: slug,
      testament: 'OT',
      chapterCount: chapterNumbers.size,
    };

    allBooks.push({ id: bookDoc.bookId, data: bookDoc as unknown as Record<string, unknown> });
    for (const v of bookVerses) {
      allVerses.push({ id: v.verseId, data: v as unknown as Record<string, unknown> });
    }

    console.log(`  Parsed: ${name} — ${bookVerses.length} verses, ${chapterNumbers.size} chapters`);
  }

  console.log(`\nTotal: ${allBooks.length} books, ${allVerses.length} verses`);

  if (allVerses.length === 0) {
    console.error('ERROR: No verses were parsed. Check that the USFM directory contains valid files.');
    process.exit(1);
  }

  // Write books first (fewer docs, quick)
  console.log('\nWriting scripture_books...');
  await writeBatches(db, 'scripture_books', allBooks, 'books');

  // Write verses in 500-op batches
  console.log('\nWriting scripture_verses...');
  await writeBatches(db, 'scripture_verses', allVerses, 'verses');

  console.log('\nBrenton LXX seed complete.');
  if (skippedFiles.length > 0) {
    console.log(`Skipped files (${skippedFiles.length}): ${skippedFiles.join(', ')}`);
  }
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
