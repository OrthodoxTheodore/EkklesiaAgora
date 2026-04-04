/**
 * Builds static Bible JSON files from USFM source data.
 * Output goes to public/bible/ so Next.js server components can read them
 * with fs.readFileSync — no Firestore quota needed.
 *
 * Structure produced:
 *   public/bible/brenton-books.json         — ScriptureBook[] for OT
 *   public/bible/brenton/{slug}/{ch}.json   — ScriptureVerse[] per chapter
 *   public/bible/nt-books.json             — ScriptureBook[] for NT
 *   public/bible/nt/{slug}/{ch}.json       — ScriptureVerse[] per chapter
 *
 * Usage: node scripts/build-bible-static.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_ROOT = path.join(ROOT, 'public', 'bible');

// ─── helpers ────────────────────────────────────────────────────────────────

function mkdirp(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(filePath, data) {
  mkdirp(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data));
}

function buildVerseKeywords(text) {
  const tokens = text.toLowerCase().split(/[\s\W]+/).filter(t => t.length >= 3);
  return [...new Set(tokens)];
}

// ─── BRENTON LXX (USFM) ─────────────────────────────────────────────────────

const USFM_TO_SLUG = {
  GEN: { slug: 'genesis',           name: 'Genesis',            index: 1  },
  EXO: { slug: 'exodus',            name: 'Exodus',             index: 2  },
  LEV: { slug: 'leviticus',         name: 'Leviticus',          index: 3  },
  NUM: { slug: 'numbers',           name: 'Numbers',            index: 4  },
  DEU: { slug: 'deuteronomy',       name: 'Deuteronomy',        index: 5  },
  JOS: { slug: 'joshua',            name: 'Joshua',             index: 6  },
  JDG: { slug: 'judges',            name: 'Judges',             index: 7  },
  RUT: { slug: 'ruth',              name: 'Ruth',               index: 8  },
  '1SA': { slug: '1-samuel',        name: '1 Samuel',           index: 9  },
  '2SA': { slug: '2-samuel',        name: '2 Samuel',           index: 10 },
  '1KI': { slug: '1-kings',         name: '1 Kings',            index: 11 },
  '2KI': { slug: '2-kings',         name: '2 Kings',            index: 12 },
  '1CH': { slug: '1-chronicles',    name: '1 Chronicles',       index: 13 },
  '2CH': { slug: '2-chronicles',    name: '2 Chronicles',       index: 14 },
  '1ES': { slug: '1-esdras',        name: '1 Esdras',           index: 15 },
  EZR: { slug: 'ezra',              name: 'Ezra',               index: 16 },
  NEH: { slug: 'nehemiah',          name: 'Nehemiah',           index: 17 },
  TOB: { slug: 'tobit',             name: 'Tobit',              index: 18 },
  JDT: { slug: 'judith',            name: 'Judith',             index: 19 },
  EST: { slug: 'esther',            name: 'Esther',             index: 20 },
  '1MA': { slug: '1-maccabees',     name: '1 Maccabees',        index: 21 },
  '2MA': { slug: '2-maccabees',     name: '2 Maccabees',        index: 22 },
  '3MA': { slug: '3-maccabees',     name: '3 Maccabees',        index: 23 },
  PSA: { slug: 'psalms',            name: 'Psalms',             index: 24 },
  MAN: { slug: 'prayer-of-manasseh',name: 'Prayer of Manasseh', index: 25 },
  PRO: { slug: 'proverbs',          name: 'Proverbs',           index: 26 },
  ECC: { slug: 'ecclesiastes',      name: 'Ecclesiastes',       index: 27 },
  SNG: { slug: 'song-of-solomon',   name: 'Song of Solomon',    index: 28 },
  JOB: { slug: 'job',              name: 'Job',                 index: 29 },
  WIS: { slug: 'wisdom-of-solomon', name: 'Wisdom of Solomon',  index: 30 },
  SIR: { slug: 'sirach',            name: 'Sirach',             index: 31 },
  HOS: { slug: 'hosea',             name: 'Hosea',              index: 33 },
  AMO: { slug: 'amos',              name: 'Amos',               index: 34 },
  MIC: { slug: 'micah',             name: 'Micah',              index: 35 },
  JOL: { slug: 'joel',              name: 'Joel',               index: 36 },
  OBA: { slug: 'obadiah',           name: 'Obadiah',            index: 37 },
  JON: { slug: 'jonah',             name: 'Jonah',              index: 38 },
  NAM: { slug: 'nahum',             name: 'Nahum',              index: 39 },
  HAB: { slug: 'habakkuk',          name: 'Habakkuk',           index: 40 },
  ZEP: { slug: 'zephaniah',         name: 'Zephaniah',          index: 41 },
  HAG: { slug: 'haggai',            name: 'Haggai',             index: 42 },
  ZEC: { slug: 'zechariah',         name: 'Zechariah',          index: 43 },
  MAL: { slug: 'malachi',           name: 'Malachi',            index: 44 },
  ISA: { slug: 'isaiah',            name: 'Isaiah',             index: 45 },
  JER: { slug: 'jeremiah',          name: 'Jeremiah',           index: 46 },
  BAR: { slug: 'baruch',            name: 'Baruch',             index: 47 },
  LAM: { slug: 'lamentations',      name: 'Lamentations',       index: 48 },
  EZK: { slug: 'ezekiel',           name: 'Ezekiel',            index: 49 },
  DAN: { slug: 'daniel',            name: 'Daniel',             index: 50 },
};

async function buildBreton() {
  const { default: usfm } = await import('usfm-js');

  const usfmDir = path.join(ROOT, 'data', 'eng-Brenton_usfm');
  if (!fs.existsSync(usfmDir)) {
    console.error('Brenton USFM not found at data/eng-Brenton_usfm/');
    return;
  }

  const files = fs.readdirSync(usfmDir).filter(f => f.endsWith('.usfm'));
  console.log(`\nBuilding Brenton LXX from ${files.length} USFM files...`);

  const books = [];
  let totalVerses = 0;

  for (const filename of files) {
    const content = fs.readFileSync(path.join(usfmDir, filename), 'utf-8');
    let json;
    try { json = usfm.toJSON(content); } catch { continue; }

    const headers = json.headers ?? [];
    const idHeader = headers.find(h => h.tag === 'id');
    const rawCode = idHeader?.content?.trim().split(/\s+/)[0]?.toUpperCase() ?? '';
    const bookInfo = USFM_TO_SLUG[rawCode];
    if (!bookInfo) continue;

    const { slug, name, index: bookIndex } = bookInfo;
    const chaptersRaw = json.chapters;
    if (!chaptersRaw || typeof chaptersRaw !== 'object') continue;

    const chapterNums = new Set();
    let bookVerseCount = 0;

    for (const chKey of Object.keys(chaptersRaw)) {
      const chNum = parseInt(chKey, 10);
      if (isNaN(chNum)) continue;
      chapterNums.add(chNum);

      const versesRaw = chaptersRaw[chKey];
      if (!versesRaw || typeof versesRaw !== 'object') continue;

      const verseArr = [];
      for (const vKey of Object.keys(versesRaw)) {
        const vNum = parseInt(vKey, 10);
        if (isNaN(vNum)) continue;
        const verseObj = versesRaw[vKey];
        const verseObjects = Array.isArray(verseObj?.verseObjects) ? verseObj.verseObjects : [];
        const text = verseObjects
          .filter(o => o.type === 'text')
          .map(o => String(o.text ?? ''))
          .join('')
          .replace(/\s+/g, ' ')
          .trim();
        if (text) {
          verseArr.push({
            verseId: `brenton_${slug}_${chNum}_${vNum}`,
            translationId: 'brenton',
            testament: 'OT',
            bookIndex,
            bookName: name,
            bookAbbrev: slug,
            chapter: chNum,
            verse: vNum,
            text,
            searchKeywords: buildVerseKeywords(text),
          });
        }
      }

      verseArr.sort((a, b) => a.verse - b.verse);
      if (verseArr.length > 0) {
        writeJson(path.join(OUT_ROOT, 'brenton', slug, `${chNum}.json`), verseArr);
        bookVerseCount += verseArr.length;
        totalVerses += verseArr.length;
      }
    }

    books.push({
      bookId: `brenton_${slug}`,
      translationId: 'brenton',
      bookIndex,
      bookName: name,
      bookAbbrev: slug,
      testament: 'OT',
      chapterCount: chapterNums.size,
    });

    console.log(`  ${name}: ${bookVerseCount} verses, ${chapterNums.size} chapters`);
  }

  books.sort((a, b) => a.bookIndex - b.bookIndex);
  writeJson(path.join(OUT_ROOT, 'brenton-books.json'), books);
  console.log(`Brenton done: ${books.length} books, ${totalVerses} verses`);
}

// ─── EOB NT (JSON format from convert-web-nt-usfm-to-json.mjs) ──────────────

const NT_BOOK_MAP = {
  'Matthew':         { slug: 'matthew',         index: 1  },
  'Mark':            { slug: 'mark',            index: 2  },
  'Luke':            { slug: 'luke',            index: 3  },
  'John':            { slug: 'john',            index: 4  },
  'Acts':            { slug: 'acts',            index: 5  },
  'Romans':          { slug: 'romans',          index: 6  },
  '1 Corinthians':   { slug: '1-corinthians',   index: 7  },
  '2 Corinthians':   { slug: '2-corinthians',   index: 8  },
  'Galatians':       { slug: 'galatians',       index: 9  },
  'Ephesians':       { slug: 'ephesians',       index: 10 },
  'Philippians':     { slug: 'philippians',     index: 11 },
  'Colossians':      { slug: 'colossians',      index: 12 },
  '1 Thessalonians': { slug: '1-thessalonians', index: 13 },
  '2 Thessalonians': { slug: '2-thessalonians', index: 14 },
  '1 Timothy':       { slug: '1-timothy',       index: 15 },
  '2 Timothy':       { slug: '2-timothy',       index: 16 },
  'Titus':           { slug: 'titus',           index: 17 },
  'Philemon':        { slug: 'philemon',        index: 18 },
  'Hebrews':         { slug: 'hebrews',         index: 19 },
  'James':           { slug: 'james',           index: 20 },
  '1 Peter':         { slug: '1-peter',         index: 21 },
  '2 Peter':         { slug: '2-peter',         index: 22 },
  '1 John':          { slug: '1-john',          index: 23 },
  '2 John':          { slug: '2-john',          index: 24 },
  '3 John':          { slug: '3-john',          index: 25 },
  'Jude':            { slug: 'jude',            index: 26 },
  'Revelation':      { slug: 'revelation',      index: 27 },
};

function buildNT() {
  const ntJsonPath = path.join(ROOT, 'data', 'eob-nt.json');
  if (!fs.existsSync(ntJsonPath)) {
    console.error('NT JSON not found at data/eob-nt.json — run convert-web-nt-usfm-to-json.mjs first');
    return;
  }

  console.log('\nBuilding NT from data/eob-nt.json...');
  const raw = JSON.parse(fs.readFileSync(ntJsonPath, 'utf-8'));

  // Group by book → chapter
  const byBook = {};
  for (const v of raw) {
    if (!byBook[v.book]) byBook[v.book] = {};
    if (!byBook[v.book][v.chapter]) byBook[v.book][v.chapter] = [];
    byBook[v.book][v.chapter].push(v);
  }

  const books = [];
  let totalVerses = 0;

  for (const [bookName, chapters] of Object.entries(byBook)) {
    const bookInfo = NT_BOOK_MAP[bookName];
    if (!bookInfo) { console.warn(`Unknown NT book: ${bookName}`); continue; }
    const { slug, index: bookIndex } = bookInfo;

    for (const [chStr, verseArr] of Object.entries(chapters)) {
      const chNum = parseInt(chStr, 10);
      const verses = verseArr
        .sort((a, b) => a.verse - b.verse)
        .map(v => ({
          verseId: `eob_nt_${slug}_${chNum}_${v.verse}`,
          translationId: 'eob_nt',
          testament: 'NT',
          bookIndex,
          bookName,
          bookAbbrev: slug,
          chapter: chNum,
          verse: v.verse,
          text: v.text,
          searchKeywords: buildVerseKeywords(v.text),
        }));

      writeJson(path.join(OUT_ROOT, 'nt', slug, `${chNum}.json`), verses);
      totalVerses += verses.length;
    }

    const chapterNums = Object.keys(chapters).map(Number);
    books.push({
      bookId: `eob_nt_${slug}`,
      translationId: 'eob_nt',
      bookIndex,
      bookName,
      bookAbbrev: slug,
      testament: 'NT',
      chapterCount: chapterNums.length,
    });

    console.log(`  ${bookName}: ${Object.values(chapters).flat().length} verses`);
  }

  books.sort((a, b) => a.bookIndex - b.bookIndex);
  writeJson(path.join(OUT_ROOT, 'nt-books.json'), books);
  console.log(`NT done: ${books.length} books, ${totalVerses} verses`);
}

// ─── main ────────────────────────────────────────────────────────────────────

mkdirp(OUT_ROOT);
await buildBreton();
buildNT();
console.log('\nAll Bible static files written to public/bible/');
