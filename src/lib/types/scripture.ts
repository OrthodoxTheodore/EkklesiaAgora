export interface ScriptureVerse {
  verseId: string;            // "brenton_genesis_1_1" — deterministic
  translationId: string;      // "brenton" | "eob_nt"
  testament: 'OT' | 'NT';
  bookIndex: number;          // 1-49 (OT), 1-27 (NT) canonical order
  bookName: string;           // "Genesis", "John"
  bookAbbrev: string;         // URL slug: "genesis", "john", "1-kings"
  chapter: number;
  verse: number;
  text: string;
  searchKeywords: string[];   // lowercased word tokens >= 3 chars
}

export interface ScriptureBook {
  bookId: string;             // "brenton_genesis"
  translationId: string;
  bookIndex: number;
  bookName: string;
  bookAbbrev: string;
  testament: 'OT' | 'NT';
  chapterCount: number;
}

export const TRANSLATIONS = {
  BRENTON: 'brenton',
  EOB_NT: 'eob_nt',
} as const;

export type TranslationId = typeof TRANSLATIONS[keyof typeof TRANSLATIONS];

/**
 * Maps display book names to URL slug info.
 * Covers all 49 Brenton LXX OT books (including Deuterocanonicals) and 27 NT books.
 * Used by ReadingRef activation in Plan 05-02 to convert calendar reading names to scripture URLs.
 */
export const BOOK_ABBREV_MAP: Record<string, { slug: string; name: string; testament: 'OT' | 'NT'; index: number }> = {
  // ── Old Testament (Brenton LXX canonical order) ──────────────────────────
  'Genesis':              { slug: 'genesis',              name: 'Genesis',              testament: 'OT', index: 1  },
  'Exodus':               { slug: 'exodus',               name: 'Exodus',               testament: 'OT', index: 2  },
  'Leviticus':            { slug: 'leviticus',            name: 'Leviticus',            testament: 'OT', index: 3  },
  'Numbers':              { slug: 'numbers',              name: 'Numbers',              testament: 'OT', index: 4  },
  'Deuteronomy':          { slug: 'deuteronomy',          name: 'Deuteronomy',          testament: 'OT', index: 5  },
  'Joshua':               { slug: 'joshua',               name: 'Joshua',               testament: 'OT', index: 6  },
  'Judges':               { slug: 'judges',               name: 'Judges',               testament: 'OT', index: 7  },
  'Ruth':                 { slug: 'ruth',                 name: 'Ruth',                 testament: 'OT', index: 8  },
  '1 Samuel':             { slug: '1-samuel',             name: '1 Samuel',             testament: 'OT', index: 9  },
  '2 Samuel':             { slug: '2-samuel',             name: '2 Samuel',             testament: 'OT', index: 10 },
  '1 Kings':              { slug: '1-kings',              name: '1 Kings',              testament: 'OT', index: 11 },
  '2 Kings':              { slug: '2-kings',              name: '2 Kings',              testament: 'OT', index: 12 },
  '1 Chronicles':         { slug: '1-chronicles',         name: '1 Chronicles',         testament: 'OT', index: 13 },
  '2 Chronicles':         { slug: '2-chronicles',         name: '2 Chronicles',         testament: 'OT', index: 14 },
  '1 Esdras':             { slug: '1-esdras',             name: '1 Esdras',             testament: 'OT', index: 15 },
  'Ezra':                 { slug: 'ezra',                 name: 'Ezra',                 testament: 'OT', index: 16 },
  'Nehemiah':             { slug: 'nehemiah',             name: 'Nehemiah',             testament: 'OT', index: 17 },
  'Tobit':                { slug: 'tobit',                name: 'Tobit',                testament: 'OT', index: 18 },
  'Judith':               { slug: 'judith',               name: 'Judith',               testament: 'OT', index: 19 },
  'Esther':               { slug: 'esther',               name: 'Esther',               testament: 'OT', index: 20 },
  '1 Maccabees':          { slug: '1-maccabees',          name: '1 Maccabees',          testament: 'OT', index: 21 },
  '2 Maccabees':          { slug: '2-maccabees',          name: '2 Maccabees',          testament: 'OT', index: 22 },
  '3 Maccabees':          { slug: '3-maccabees',          name: '3 Maccabees',          testament: 'OT', index: 23 },
  'Psalms':               { slug: 'psalms',               name: 'Psalms',               testament: 'OT', index: 24 },
  'Prayer of Manasseh':   { slug: 'prayer-of-manasseh',   name: 'Prayer of Manasseh',   testament: 'OT', index: 25 },
  'Proverbs':             { slug: 'proverbs',             name: 'Proverbs',             testament: 'OT', index: 26 },
  'Ecclesiastes':         { slug: 'ecclesiastes',         name: 'Ecclesiastes',         testament: 'OT', index: 27 },
  'Song of Solomon':      { slug: 'song-of-solomon',      name: 'Song of Solomon',      testament: 'OT', index: 28 },
  'Job':                  { slug: 'job',                  name: 'Job',                  testament: 'OT', index: 29 },
  'Wisdom of Solomon':    { slug: 'wisdom-of-solomon',    name: 'Wisdom of Solomon',    testament: 'OT', index: 30 },
  'Sirach':               { slug: 'sirach',               name: 'Sirach',               testament: 'OT', index: 31 },
  'Psalms of Solomon':    { slug: 'psalms-of-solomon',    name: 'Psalms of Solomon',    testament: 'OT', index: 32 },
  'Hosea':                { slug: 'hosea',                name: 'Hosea',                testament: 'OT', index: 33 },
  'Amos':                 { slug: 'amos',                 name: 'Amos',                 testament: 'OT', index: 34 },
  'Micah':                { slug: 'micah',                name: 'Micah',                testament: 'OT', index: 35 },
  'Joel':                 { slug: 'joel',                 name: 'Joel',                 testament: 'OT', index: 36 },
  'Obadiah':              { slug: 'obadiah',              name: 'Obadiah',              testament: 'OT', index: 37 },
  'Jonah':                { slug: 'jonah',                name: 'Jonah',                testament: 'OT', index: 38 },
  'Nahum':                { slug: 'nahum',                name: 'Nahum',                testament: 'OT', index: 39 },
  'Habakkuk':             { slug: 'habakkuk',             name: 'Habakkuk',             testament: 'OT', index: 40 },
  'Zephaniah':            { slug: 'zephaniah',            name: 'Zephaniah',            testament: 'OT', index: 41 },
  'Haggai':               { slug: 'haggai',               name: 'Haggai',               testament: 'OT', index: 42 },
  'Zechariah':            { slug: 'zechariah',            name: 'Zechariah',            testament: 'OT', index: 43 },
  'Malachi':              { slug: 'malachi',              name: 'Malachi',              testament: 'OT', index: 44 },
  'Isaiah':               { slug: 'isaiah',               name: 'Isaiah',               testament: 'OT', index: 45 },
  'Jeremiah':             { slug: 'jeremiah',             name: 'Jeremiah',             testament: 'OT', index: 46 },
  'Baruch':               { slug: 'baruch',               name: 'Baruch',               testament: 'OT', index: 47 },
  'Lamentations':         { slug: 'lamentations',         name: 'Lamentations',         testament: 'OT', index: 48 },
  'Ezekiel':              { slug: 'ezekiel',              name: 'Ezekiel',              testament: 'OT', index: 49 },
  'Daniel':               { slug: 'daniel',               name: 'Daniel',               testament: 'OT', index: 50 },
  // ── New Testament (canonical order) ───────────────────────────────────────
  'Matthew':              { slug: 'matthew',              name: 'Matthew',              testament: 'NT', index: 1  },
  'Mark':                 { slug: 'mark',                 name: 'Mark',                 testament: 'NT', index: 2  },
  'Luke':                 { slug: 'luke',                 name: 'Luke',                 testament: 'NT', index: 3  },
  'John':                 { slug: 'john',                 name: 'John',                 testament: 'NT', index: 4  },
  'Acts':                 { slug: 'acts',                 name: 'Acts',                 testament: 'NT', index: 5  },
  'Romans':               { slug: 'romans',               name: 'Romans',               testament: 'NT', index: 6  },
  '1 Corinthians':        { slug: '1-corinthians',        name: '1 Corinthians',        testament: 'NT', index: 7  },
  '2 Corinthians':        { slug: '2-corinthians',        name: '2 Corinthians',        testament: 'NT', index: 8  },
  'Galatians':            { slug: 'galatians',            name: 'Galatians',            testament: 'NT', index: 9  },
  'Ephesians':            { slug: 'ephesians',            name: 'Ephesians',            testament: 'NT', index: 10 },
  'Philippians':          { slug: 'philippians',          name: 'Philippians',          testament: 'NT', index: 11 },
  'Colossians':           { slug: 'colossians',           name: 'Colossians',           testament: 'NT', index: 12 },
  '1 Thessalonians':      { slug: '1-thessalonians',      name: '1 Thessalonians',      testament: 'NT', index: 13 },
  '2 Thessalonians':      { slug: '2-thessalonians',      name: '2 Thessalonians',      testament: 'NT', index: 14 },
  '1 Timothy':            { slug: '1-timothy',            name: '1 Timothy',            testament: 'NT', index: 15 },
  '2 Timothy':            { slug: '2-timothy',            name: '2 Timothy',            testament: 'NT', index: 16 },
  'Titus':                { slug: 'titus',                name: 'Titus',                testament: 'NT', index: 17 },
  'Philemon':             { slug: 'philemon',             name: 'Philemon',             testament: 'NT', index: 18 },
  'Hebrews':              { slug: 'hebrews',              name: 'Hebrews',              testament: 'NT', index: 19 },
  'James':                { slug: 'james',                name: 'James',                testament: 'NT', index: 20 },
  '1 Peter':              { slug: '1-peter',              name: '1 Peter',              testament: 'NT', index: 21 },
  '2 Peter':              { slug: '2-peter',              name: '2 Peter',              testament: 'NT', index: 22 },
  '1 John':               { slug: '1-john',               name: '1 John',               testament: 'NT', index: 23 },
  '2 John':               { slug: '2-john',               name: '2 John',               testament: 'NT', index: 24 },
  '3 John':               { slug: '3-john',               name: '3 John',               testament: 'NT', index: 25 },
  'Jude':                 { slug: 'jude',                 name: 'Jude',                 testament: 'NT', index: 26 },
  'Revelation':           { slug: 'revelation',           name: 'Revelation',           testament: 'NT', index: 27 },
};

/**
 * Reverse lookup: URL slug -> book info.
 * Derived from BOOK_ABBREV_MAP at module init time.
 */
export const SLUG_TO_BOOK: Record<string, { name: string; testament: 'OT' | 'NT'; index: number }> = Object.fromEntries(
  Object.values(BOOK_ABBREV_MAP).map(({ slug, name, testament, index }) => [
    slug,
    { name, testament, index },
  ])
);
