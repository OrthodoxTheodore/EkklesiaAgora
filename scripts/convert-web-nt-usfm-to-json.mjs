/**
 * Converts WEB (World English Bible) NT USFM files to the JSON format
 * expected by seed-eob-nt.ts:
 *   [{ "book": "Matthew", "chapter": 1, "verse": 1, "text": "..." }, ...]
 *
 * Usage: node scripts/convert-web-nt-usfm-to-json.mjs
 * Output: data/eob-nt.json  (placeholder — replace with real EOB text later)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const USFM_DIR = path.join(ROOT, 'data', 'engweb_usfm');
const OUT_FILE = path.join(ROOT, 'data', 'eob-nt.json');

// USFM file prefix → canonical book name
const NT_FILES = [
  { file: '70-MATengwebp.usfm', book: 'Matthew' },
  { file: '71-MRKengwebp.usfm', book: 'Mark' },
  { file: '72-LUKengwebp.usfm', book: 'Luke' },
  { file: '73-JHNengwebp.usfm', book: 'John' },
  { file: '74-ACTengwebp.usfm', book: 'Acts' },
  { file: '75-ROMengwebp.usfm', book: 'Romans' },
  { file: '76-1COengwebp.usfm', book: '1 Corinthians' },
  { file: '77-2COengwebp.usfm', book: '2 Corinthians' },
  { file: '78-GALengwebp.usfm', book: 'Galatians' },
  { file: '79-EPHengwebp.usfm', book: 'Ephesians' },
  { file: '80-PHPengwebp.usfm', book: 'Philippians' },
  { file: '81-COLengwebp.usfm', book: 'Colossians' },
  { file: '82-1THengwebp.usfm', book: '1 Thessalonians' },
  { file: '83-2THengwebp.usfm', book: '2 Thessalonians' },
  { file: '84-1TIengwebp.usfm', book: '1 Timothy' },
  { file: '85-2TIengwebp.usfm', book: '2 Timothy' },
  { file: '86-TITengwebp.usfm', book: 'Titus' },
  { file: '87-PHMengwebp.usfm', book: 'Philemon' },
  { file: '88-HEBengwebp.usfm', book: 'Hebrews' },
  { file: '89-JASengwebp.usfm', book: 'James' },
  { file: '90-1PEengwebp.usfm', book: '1 Peter' },
  { file: '91-2PEengwebp.usfm', book: '2 Peter' },
  { file: '92-1JNengwebp.usfm', book: '1 John' },
  { file: '93-2JNengwebp.usfm', book: '2 John' },
  { file: '94-3JNengwebp.usfm', book: '3 John' },
  { file: '95-JUDengwebp.usfm', book: 'Jude' },
  { file: '96-REVengwebp.usfm', book: 'Revelation' },
];

/**
 * Parse a USFM file and extract verse objects.
 * Handles \c (chapter), \v (verse), inline markers like \wj ...\wj*, etc.
 */
function parseUsfm(content, bookName) {
  const verses = [];
  let chapter = 0;

  const lines = content.split('\n');
  for (const rawLine of lines) {
    const line = rawLine.trim();

    // Chapter marker: \c 1
    const chapterMatch = line.match(/^\\c\s+(\d+)/);
    if (chapterMatch) {
      chapter = parseInt(chapterMatch[1], 10);
      continue;
    }

    // Verse marker: \v 1 text... (may have inline markers)
    const verseMatch = line.match(/^\\v\s+(\d+)\s+(.*)/);
    if (verseMatch && chapter > 0) {
      const verseNum = parseInt(verseMatch[1], 10);
      let text = verseMatch[2];

      // Remove inline USFM markers: \wj, \wj*, \add, \add*, \nd, \nd*, etc.
      text = text.replace(/\\[a-z]+\*?\s*/g, '');
      // Remove trailing footnote/cross-ref markers \f ... \f* and \x ... \x*
      text = text.replace(/\\[fx].*?\\[fx]\*/g, '');
      // Collapse whitespace
      text = text.replace(/\s+/g, ' ').trim();

      if (text.length > 0) {
        verses.push({ book: bookName, chapter, verse: verseNum, text });
      }
    }
  }

  return verses;
}

const allVerses = [];

for (const { file, book } of NT_FILES) {
  const filePath = path.join(USFM_DIR, file);
  if (!fs.existsSync(filePath)) {
    console.error(`Missing: ${file}`);
    process.exit(1);
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const verses = parseUsfm(content, book);
  console.log(`  ${book}: ${verses.length} verses`);
  allVerses.push(...verses);
}

fs.writeFileSync(OUT_FILE, JSON.stringify(allVerses, null, 2));
console.log(`\nWrote ${allVerses.length} verses to data/eob-nt.json`);
console.log('NOTE: This uses the WEB (World English Bible) NT — a public-domain');
console.log('placeholder. Replace with EOB text when available.');
