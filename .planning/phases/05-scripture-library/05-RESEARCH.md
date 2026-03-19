# Phase 5: Scripture Library - Research

**Researched:** 2026-03-19
**Domain:** Scripture data sourcing (Brenton LXX + EOB NT), Firestore data architecture for large verse corpus, keyword search on scripture, Next.js 15 reader UI, multilingual translation architecture
**Confidence:** HIGH for data architecture, search patterns, and UI; MEDIUM for exact EOB NT data sourcing workflow (license confirmed, machine-readable format requires manual conversion from PDF/HTML)

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| LIB-01 | Full Brenton's English Septuagint (OT) stored as structured machine-readable data (book/chapter/verse) | Brenton LXX is public domain (1851); USFM download from eBible.org (eng-Brenton_usfm.zip); convert with `usfm-js` v3.4.3 to JSON; seed via tsx script following existing `scripts/seed-super-admin.ts` pattern |
| LIB-02 | Full Eastern Orthodox Bible NT (Patriarchal Text) stored as structured machine-readable data | EOB NT granted free use to canonical Orthodox parishes/institutions (non-commercial); PDF available on Internet Archive; parse to structured JSON via script; store same schema as LIB-01 |
| LIB-03 | Scripture text rendered in Byzantine aesthetic (EB Garamond body, Cinzel headings, navy/gold theme) | Existing Tailwind v4 design tokens: `font-cinzel`, `font-garamond`, `text-gold`, `bg-navy` — no new CSS needed; match calendar page layout pattern |
| LIB-04 | User can search Scripture by keyword, phrase, or reference | Existing `searchKeywords` array-contains pattern from videos/posts; extend to scripture verses; also support reference parsing (e.g., "John 3:16") |
| LIB-05 | User can navigate Scripture by book/chapter/verse | Firestore queries: chapters by book, verses by chapter; URL routing: `/scripture/[book]/[chapter]` |
| LIB-06 | Architecture supports future multilingual translations (French, German, Spanish, Greek, Russian, Arabic, Romanian, Georgian) | `translationId` field on every verse document; query filters by translationId; adding a translation = seed new docs, zero schema change |
</phase_requirements>

---

## Summary

Phase 5 has two distinct sub-problems: (1) **data ingestion** — obtaining the two text corpora as machine-readable data and loading them into Firestore, and (2) **reader UI** — building the search and navigation interface in the Byzantine aesthetic.

For data ingestion, Brenton's English Septuagint (1851) is unambiguously public domain and available from eBible.org in USFM format (`eng-Brenton_usfm.zip`). The `usfm-js` npm package (v3.4.3) parses USFM into JSON. A seed script following the existing `scripts/seed-super-admin.ts` pattern converts the parsed USFM and batch-writes verse documents to Firestore. The Eastern Orthodox Bible NT has a confirmed non-commercial use license for canonical Orthodox institutions, and a PDF exists on Internet Archive; it requires parsing from PDF or HTML to JSON. The Firestore data model uses a flat `scripture_verses` collection with `translationId`, `book`, `bookIndex`, `chapter`, `verse`, `text`, and `searchKeywords` fields. This flat model is far simpler to query than a nested subcollection hierarchy and avoids Firestore's document-level read pricing on every verse.

For the reader UI, the pattern is identical to the calendar page: Server Component fetches verses by translation+book+chapter, passes as props to a Client Component that handles navigation state. Search uses the existing `array-contains` keyword pattern already deployed in videos, posts, and Synodeia. No new npm packages are required beyond `usfm-js` for the seed script (devDependency only).

The scale concern is real but manageable: ~31,000 verses total across both corpora. Reading a single chapter (average 26 verses) costs 26 Firestore reads, well within the 50K/day free tier. The `CAL-07` reading links from Phase 4 are designed as disabled stubs that activate in Phase 5 with zero Phase 4 changes.

**Primary recommendation:** Use a flat `scripture_verses` Firestore collection with `translationId` as first query filter; seed from USFM (Brenton) and HTML/PDF parse (EOB NT) via `tsx` scripts; search via `searchKeywords` array-contains; navigation via `?book=&chapter=` URL params on Server Component pages.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| usfm-js | 3.4.3 | Parse eBible.org Brenton USFM files to JSON (seed script only) | MIT license; actively maintained; used by unfoldingWord; direct USFM → JSON conversion |
| firebase-admin | 13.7.0 (existing) | Batch-write verse documents in seed script | Already installed; Admin SDK required for bulk Firestore writes |
| tsx | 4.21.0 (existing) | Run TypeScript seed scripts directly | Already installed; same tool used for `seed-super-admin.ts` |
| Next.js 15 / React 19 | 15.5.13 (existing) | Server Component page fetches, URL-based navigation | Already installed; Server Component + searchParams pattern matches calendar page |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Zod | 4.3.6 (existing) | Validate parsed verse objects before Firestore write | Defensive parsing in seed script and Server Action returns |
| dotenv | 17.3.1 (existing) | Load `.env.local` in seed scripts | Seed scripts run outside Next.js; same pattern as `seed-super-admin.ts` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Flat `scripture_verses` collection | Nested `books/{bookId}/chapters/{ch}/verses/{v}` subcollections | Subcollections require multi-path reads (3 collection reads to get a chapter); flat collection with compound query is one read per chapter |
| Flat `scripture_verses` collection | JSON files in public/ folder served as static assets | JSON files cannot be queried; no server-side keyword search; hard to support multilingual without multiple files |
| usfm-js for parsing | Manual regex parse of HTML | HTML structure is fragile; USFM is a defined standard with reliable parsers |
| Firestore keyword array | Full-text search service (Algolia/Typesense) | External service costs money and adds infrastructure; `array-contains` is free and matches existing project patterns; scripture is immutable (no write cost) |

**Installation (seed script devDependency only):**
```bash
npm install --save-dev usfm-js
```

**Version verification:**
```bash
npm view usfm-js version   # 3.4.3
```

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/(main)/
│   └── scripture/
│       ├── page.tsx                  # Server Component — book list / landing
│       └── [book]/
│           └── [chapter]/
│               └── page.tsx          # Server Component — chapter reader
├── components/
│   └── scripture/
│       ├── ScriptureReader.tsx       # Client Component — nav, search, verse highlight
│       ├── VerseList.tsx             # Presentational — renders verse array
│       ├── BookNavigator.tsx         # Client Component — book/chapter dropdowns
│       ├── ScriptureSearch.tsx       # Client Component — keyword/reference search
│       └── ScriptureSkeleton.tsx     # Loading skeleton
├── lib/
│   ├── firestore/
│   │   └── scripture.ts              # getChapter, searchVerses, getBooks, getBookMeta
│   └── types/
│       └── scripture.ts              # ScriptureVerse, BookMeta, Translation types
└── scripts/
    ├── seed-brenton-lxx.ts           # Seed Brenton OT from USFM
    └── seed-eob-nt.ts                # Seed EOB NT from parsed HTML/JSON
```

### Firestore Data Model

**Collection: `scripture_verses`**

Each document is one verse:

```typescript
// src/lib/types/scripture.ts
export interface ScriptureVerse {
  verseId: string;            // e.g., "brenton_Gen_1_1" — unique, deterministic
  translationId: string;      // e.g., "brenton" | "eob_nt" | future: "fr_brenton"
  testament: 'OT' | 'NT';
  bookIndex: number;          // 1–49 (OT) or 1–27 (NT) — for ordering
  bookName: string;           // e.g., "Genesis", "John"
  bookAbbrev: string;         // e.g., "Gen", "Jn" — for URL slugs and links
  chapter: number;
  verse: number;
  text: string;
  searchKeywords: string[];   // lowercased word tokens for array-contains search
}

// Firestore document ID = verseId (deterministic, idempotent seed)

// Collection: `scripture_books` — lightweight index for navigation UI
export interface ScriptureBook {
  bookId: string;             // e.g., "brenton_Gen"
  translationId: string;
  bookIndex: number;
  bookName: string;
  bookAbbrev: string;
  testament: 'OT' | 'NT';
  chapterCount: number;
}
```

**Why flat collection over subcollections:**
- One compound Firestore query (`where translationId == X AND where bookAbbrev == Y AND where chapter == Z`) returns all verses in one read batch.
- Subcollections would require navigating: `scripture_books/{book}/chapters/{ch}/verses` = 3 levels, one collection listing per level.
- Flat collection with composite index supports future cross-book keyword search in a single query.

**Scale sanity check:**
- Brenton LXX (OT): ~23,145 verses across 49 books
- EOB NT: ~7,957 verses across 27 books
- Total: ~31,102 verse documents
- Average chapter: ~26 verses = 26 Firestore reads per chapter page
- Firestore free tier: 50,000 reads/day → ~1,923 chapter page views/day before hitting free tier
- Storage: ~31,102 docs × ~1KB each ≈ 31 MB (Firestore free tier: 1 GiB)

### Pattern 1: Chapter Reader — Server Component with URL Params

**What:** Server Component reads `searchParams.book` and `searchParams.chapter`, calls `getChapter()`, passes verse array as props to `ScriptureReader` Client Component.

**When to use:** `/scripture/[book]/[chapter]` page (primary reading view).

**Example:**
```typescript
// src/app/(main)/scripture/[book]/[chapter]/page.tsx
// Source: mirrors calendar/page.tsx pattern
import { getChapter, getBookMeta } from '@/lib/firestore/scripture';
import { ScriptureReader } from '@/components/scripture/ScriptureReader';

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ book: string; chapter: string }>;
}) {
  const { book, chapter } = await params;
  const chapterNum = parseInt(chapter, 10);

  // Default to Brenton for OT books, EOB NT for NT books
  const bookMeta = await getBookMeta(book); // resolves translationId from bookAbbrev
  const verses = await getChapter(bookMeta.translationId, book, chapterNum);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-cinzel text-gold text-xl uppercase tracking-widest mb-6">
        {bookMeta.bookName} {chapterNum}
      </h1>
      <ScriptureReader
        initialVerses={verses}
        bookMeta={bookMeta}
        currentChapter={chapterNum}
      />
    </div>
  );
}
```

### Pattern 2: Scripture Firestore Query Functions

**What:** Admin SDK queries against `scripture_verses` collection with compound filters.

**When to use:** All Server Actions and Server Components loading scripture data.

**Example:**
```typescript
// src/lib/firestore/scripture.ts
import { getAdminFirestore } from '@/lib/firebase/admin';
import type { ScriptureVerse, ScriptureBook } from '@/lib/types/scripture';

export async function getChapter(
  translationId: string,
  bookAbbrev: string,
  chapter: number
): Promise<ScriptureVerse[]> {
  const db = getAdminFirestore();
  const snap = await db.collection('scripture_verses')
    .where('translationId', '==', translationId)
    .where('bookAbbrev', '==', bookAbbrev)
    .where('chapter', '==', chapter)
    .orderBy('verse', 'asc')
    .get();
  return snap.docs.map(d => d.data() as ScriptureVerse);
}

export async function searchVerses(
  query: string,
  translationId?: string,
  limit = 30
): Promise<ScriptureVerse[]> {
  const db = getAdminFirestore();
  const keyword = query.toLowerCase().trim();
  let q = db.collection('scripture_verses')
    .where('searchKeywords', 'array-contains', keyword)
    .limit(limit);
  if (translationId) {
    q = db.collection('scripture_verses')
      .where('translationId', '==', translationId)
      .where('searchKeywords', 'array-contains', keyword)
      .limit(limit);
  }
  const snap = await q.get();
  return snap.docs.map(d => d.data() as ScriptureVerse);
}
```

### Pattern 3: Scripture Keyword Builder

**What:** Same pattern as `buildVideoSearchKeywords` from `src/lib/firestore/videos.ts` — split verse text into lowercase word tokens.

**Note:** Scripture search needs a lower minimum token length (2 chars, not 3) to handle short words like "in", "of", but 3+ is fine for keyword search as users search meaningful words. No prefix tokens needed — exact word match is sufficient for scripture search.

**When to use:** In the seed script when building `searchKeywords` for each verse.

```typescript
// src/scripts/seed-brenton-lxx.ts (seed utility function)
function buildVerseKeywords(text: string): string[] {
  return [...new Set(
    text.toLowerCase()
      .split(/[\s\W]+/)
      .filter(t => t.length >= 3)
  )];
}
```

### Pattern 4: CAL-07 Reading Link Activation

**What:** Phase 4 already renders `ReadingRef` components as disabled stubs. Phase 5 activates them by rendering real anchor links to `/scripture/[bookAbbrev]/[chapter]#verse-[verseStart]`.

**When to use:** Update `ReadingRef.tsx` component in Phase 5 with `isEnabled` prop or replace stub with real `<Link>`.

**Example:**
```typescript
// src/components/calendar/ReadingRef.tsx — Phase 5 update
// Before (Phase 4 stub):
// <span className="text-text-mid/50 cursor-not-allowed">John 3:16-21</span>

// After (Phase 5 activation):
import Link from 'next/link';
export function ReadingRef({ reading }: { reading: ReadingRef }) {
  return (
    <Link
      href={`/scripture/${reading.book}/${reading.chapter}#verse-${reading.verseStart}`}
      className="text-gold hover:underline font-garamond"
    >
      {reading.display}
    </Link>
  );
}
```

### Pattern 5: Reference Search Parsing

**What:** User types "John 3:16" or "Gen 1:1" — parse into `{ bookAbbrev, chapter, verse }` for direct navigation rather than keyword search.

**When to use:** In `ScriptureSearch.tsx` before deciding whether to run keyword search or direct navigation.

```typescript
// src/components/scripture/ScriptureSearch.tsx
const REF_PATTERN = /^(\d?\s?[a-zA-Z]+)\s+(\d+)(?::(\d+))?$/;

function parseReference(query: string): { book: string; chapter: number; verse?: number } | null {
  const match = query.trim().match(REF_PATTERN);
  if (!match) return null;
  return {
    book: match[1].trim(),
    chapter: parseInt(match[2], 10),
    verse: match[3] ? parseInt(match[3], 10) : undefined,
  };
}
```

### Pattern 6: Multilingual Translation Architecture

**What:** Adding a new translation (e.g., French Brenton, Greek NT) requires only seeding new verse documents with a different `translationId`. No schema changes, no index changes (composite indexes already cover `translationId` as first field).

**When to use:** Future phases; document the contract now so seed scripts are written correctly.

```typescript
// Translation IDs (define as constants)
export const TRANSLATIONS = {
  BRENTON: 'brenton',      // Brenton's English LXX (OT)
  EOB_NT: 'eob_nt',        // Eastern Orthodox Bible NT
  // Future:
  // FR_BRENTON: 'fr_brenton',
  // GR_PATRIARCHAL: 'gr_patriarchal',
} as const;
export type TranslationId = typeof TRANSLATIONS[keyof typeof TRANSLATIONS];
```

### Anti-Patterns to Avoid

- **Subcollection per book/chapter:** Requires 3 reads minimum to get a chapter; cannot do cross-book search. Use flat `scripture_verses` collection.
- **Storing full chapter text in one document:** Firestore 1MB document limit applies; chapters with 100+ long verses can approach this. Per-verse documents are safe (average verse ~150 chars).
- **Client-side Firestore `onSnapshot` for verse reads:** Scripture text is immutable. Use Server Component + Admin SDK `get()`, not real-time listeners. No live subscription needed.
- **Keyword prefix tokens on all 31K verses:** The video pattern uses prefix tokens for title/tag search (user types partial words). Scripture keyword search should use exact word tokens only — users search complete words like "grace" or "salvation", not partial tokens. Prefix-expanding 31K verses × average 50 words would create 1.5M+ array entries, approaching index bloat.
- **Using `bookName` as the compound query field instead of `bookAbbrev`:** Book names vary ("1 Kings" vs "1 Kings" in Brenton; "First Kings" elsewhere). Use `bookAbbrev` as the canonical query field — define it in the seed script from the USFM book code.
- **Running seed script multiple times without idempotency:** Use deterministic document IDs (`verseId = translationId_bookAbbrev_chapter_verse`). Firestore `.set()` is idempotent when the document ID is stable.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| USFM file parsing | Custom regex parser for Brenton USFM | `usfm-js` v3.4.3 | USFM has 100+ marker types; regex will break on edge cases (poetry, section headers, footnotes) |
| Bible verse count per book | Custom lookup table | USFM parsing produces exact verse count per chapter from source files | Manual tables go stale; USFM source is authoritative |
| Reference string parsing ("John 3:16") | Nothing beyond simple regex | Simple `REF_PATTERN` regex sufficient | Full BCV parser is overkill; the pattern only needs to handle standard `Book chapter:verse` format |
| Full-text search infrastructure | Algolia/Typesense integration | Firestore `array-contains` + `searchKeywords` field | External search services cost money; scripture is immutable (write once, read many); existing project pattern works |
| Translation management UI | Admin panel for adding translations | Seed scripts only for v1 | v1 has only 2 translations; admin UI is Phase 7+ scope |

**Key insight:** The hardest part of Phase 5 is data ingestion, not the UI. The UI follows existing project patterns exactly. Invest time in the seed scripts to get clean, validated data into Firestore — everything else is straightforward.

---

## Data Sourcing Details

### LIB-01: Brenton's English Septuagint (OT)

**Source:** eBible.org — `https://ebible.org/eng-Brenton/`
**Format available:** USFM zip (`eng-Brenton_usfm.zip`) — one `.usfm` file per book
**License:** Public Domain (published 1851)
**Confidence:** HIGH — publicly confirmed, freely downloadable

**Ingestion workflow:**
1. Download `eng-Brenton_usfm.zip` from eBible.org
2. Extract 49 book files
3. Parse each file with `usfm-js`: `usfm.toJSON(usfmText)`
4. Traverse JSON to extract `{ book, chapter, verse, text }`
5. Build `verseId`, `searchKeywords`, assign `translationId: 'brenton'`, `testament: 'OT'`
6. Batch-write to Firestore in 500-document chunks (Admin SDK batch limit, matching Phase 2 fan-out pattern)

**USFM structure (key markers):**
- `\id GEN` — book identifier
- `\c 1` — chapter marker
- `\v 1 In the beginning...` — verse with text inline

### LIB-02: Eastern Orthodox Bible NT (Patriarchal Text)

**Source:** Internet Archive PDF — `https://ia800108.us.archive.org/18/items/new-testament-the-eastern-greek-orthodox-bible/`
**License:** Non-commercial use explicitly granted to canonical Orthodox institutions and parishes. Specific terms: "Permissions to use, quote, reproduce and modify for non-commercial, liturgical or scholarly purposes is hereby granted to all institutions, parishes, clergy, or lay members affiliated to the affiliated jurisdictions and agencies of the Assembly of Canonical Orthodox Bishops of North and Central America, as well as all jurisdictions in communion with the Ecumenical Patriarchate of Constantinople."
**Status for this project:** Ekklesia Agora is a non-commercial Orthodox platform — this license applies. Credit the EOB in the UI.
**Confidence:** MEDIUM — license terms confirmed, but machine-readable format requires manual conversion from PDF

**Ingestion workflow:**
1. Obtain PDF from Internet Archive
2. Convert PDF to text (pdf-parse or manual extraction)
3. Write a parsing script to extract book/chapter/verse structure from the text
4. Validate verse counts against standard NT verse count reference
5. Build `verseId`, `searchKeywords`, assign `translationId: 'eob_nt'`, `testament: 'NT'`
6. Batch-write to Firestore

**Alternative approach:** The EOB NT HTML may be available from other sources (VDUB Software app, Biblia.com) that could be scraped once for personal non-commercial use. However, parsing the PDF is more straightforward and clearly within the license terms.

**Risk flag:** PDF parsing can introduce OCR artifacts (e.g., ligatures, punctuation). The seed script MUST include a validation step that checks verse count per book against a known reference (e.g., 879 verses in Matthew, 16 chapters).

---

## Common Pitfalls

### Pitfall 1: Firestore Composite Index Missing for Scripture Queries

**What goes wrong:** The compound query `where('translationId', '==', X).where('bookAbbrev', '==', Y).where('chapter', '==', Z).orderBy('verse', 'asc')` throws "requires an index" error.
**Why it happens:** Multi-field queries with `orderBy` always require composite indexes in Firestore.
**How to avoid:** Add composite index entries to `firestore.indexes.json` in Plan 05-01 (Wave 0):
```json
{
  "collectionGroup": "scripture_verses",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "translationId", "order": "ASCENDING" },
    { "fieldPath": "bookAbbrev", "order": "ASCENDING" },
    { "fieldPath": "chapter", "order": "ASCENDING" },
    { "fieldPath": "verse", "order": "ASCENDING" }
  ]
},
{
  "collectionGroup": "scripture_verses",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "translationId", "order": "ASCENDING" },
    { "fieldPath": "searchKeywords", "arrayConfig": "CONTAINS" }
  ]
}
```
**Warning signs:** Runtime Firestore error with URL to create the index automatically.

### Pitfall 2: Seed Script Not Idempotent

**What goes wrong:** Running the seed script twice creates duplicate verse documents or fails midway and leaves partial data.
**Why it happens:** Using auto-generated Firestore IDs makes each run create new documents.
**How to avoid:** Use deterministic document IDs: `const docId = \`${translationId}_${bookAbbrev}_${chapter}_${verse}\``. The `db.collection('scripture_verses').doc(docId).set(data)` is idempotent — re-running overwrites identical data.
**Warning signs:** `scripture_verses` collection grows beyond expected count on second run.

### Pitfall 3: USFM Parsing Missing Verse Text Edge Cases

**What goes wrong:** Some verses in USFM have footnote markers (`\f ... \f*`), section headers (`\s`), and poetry formatting (`\q`) embedded in or adjacent to verse text. Naive parsing produces verse text containing raw USFM markup.
**Why it happens:** `usfm-js.toJSON()` returns a structured object, but accessing `verseObjects[i].text` may require filtering non-text object types.
**How to avoid:** Filter `verseObjects` array to only include objects with `type: 'text'`. Log and inspect 10 sample verses from different books before bulk-seeding.
**Warning signs:** Verse text contains `\f`, `\q`, or `*` characters.

### Pitfall 4: EOB NT PDF Parsing Quality

**What goes wrong:** PDF-to-text extraction produces garbled text for certain Unicode characters, diacritics, or paragraph boundaries, corrupting verse content.
**Why it happens:** PDF text extraction depends on font encoding in the original PDF.
**How to avoid:** After parsing, spot-check 20 verses across different books against the known text. Include a word count sanity check (average NT verse should be 20–30 words). Flag any verse under 5 words (except known short verses like "Jesus wept." John 11:35).
**Warning signs:** Verses with garbled Unicode, missing spaces, or verse numbers embedded in text.

### Pitfall 5: Large Batch Write Timeout

**What goes wrong:** Seeding 31,000 verses in a single batch or tight loop hits Firestore rate limits or Admin SDK timeouts.
**Why it happens:** Firestore Admin SDK batch writes support max 500 operations per commit. Sending 31,000 writes without batching causes errors.
**How to avoid:** Use 500-operation batch chunks with `await batch.commit()` per chunk, matching the Phase 2 fan-out pattern from `src/lib/actions/posts.ts`. Add `console.log` progress reporting every 500 documents.
**Warning signs:** `Error: 4 DEADLINE_EXCEEDED` from Firestore Admin SDK during seed.

### Pitfall 6: Book Name Normalization Across Translations

**What goes wrong:** The calendar's `ReadingRef` uses `book: "John"` but the scripture URL uses the USFM book code `JHN`. Navigation from calendar to scripture fails.
**Why it happens:** USFM uses SBL abbreviations (`JHN`, `GEN`) while the calendar API uses display names (`John`, `Genesis`).
**How to avoid:** Define a `BOOK_ABBREV_MAP` that maps USFM codes (`JHN`) to URL slugs (`john`), display names (`John`), and `ReadingRef.book` values. Use URL-slug as the canonical `bookAbbrev` in Firestore (lowercase, no spaces: `genesis`, `john`, `1-kings`).
**Warning signs:** Calendar reading links navigate to 404 scripture pages.

### Pitfall 7: jest 30 Flag (Known Project Pattern)

**What goes wrong:** Test run command uses `--testPathPattern` (singular) — fails with jest 30.
**Why it happens:** jest 30 renamed to `--testPathPatterns` (plural). Documented in STATE.md.
**How to avoid:** All test commands must use `--testPathPatterns` (plural).

---

## Code Examples

Verified patterns derived from existing project code and official sources:

### Firestore Verse Query (Admin SDK)
```typescript
// src/lib/firestore/scripture.ts
// Source: mirrors pattern from src/lib/firestore/synodeia.ts
import { getAdminFirestore } from '@/lib/firebase/admin';
import type { ScriptureVerse } from '@/lib/types/scripture';

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
```

### Seed Script Batch Write Pattern
```typescript
// scripts/seed-brenton-lxx.ts (structure)
// Source: mirrors scripts/seed-super-admin.ts pattern
import * as dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// ... init Firebase Admin same as seed-super-admin.ts ...

const BATCH_SIZE = 500; // Firestore max

async function seedVerses(verses: ScriptureVerse[]) {
  const db = getFirestore();
  for (let i = 0; i < verses.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const chunk = verses.slice(i, i + BATCH_SIZE);
    for (const verse of chunk) {
      const ref = db.collection('scripture_verses').doc(verse.verseId);
      batch.set(ref, verse); // idempotent — safe to re-run
    }
    await batch.commit();
    console.log(`Seeded ${Math.min(i + BATCH_SIZE, verses.length)} / ${verses.length} verses`);
  }
}
```

### Scripture Types
```typescript
// src/lib/types/scripture.ts
export interface ScriptureVerse {
  verseId: string;          // e.g., "brenton_genesis_1_1"
  translationId: string;    // e.g., "brenton" | "eob_nt"
  testament: 'OT' | 'NT';
  bookIndex: number;        // canonical order (1-49 OT, 1-27 NT)
  bookName: string;         // display name e.g., "Genesis"
  bookAbbrev: string;       // URL slug e.g., "genesis", "john", "1-kings"
  chapter: number;
  verse: number;
  text: string;
  searchKeywords: string[]; // lowercased word tokens >= 3 chars
}

export interface ScriptureBook {
  bookId: string;           // e.g., "brenton_genesis"
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
```

### CAL-07 Activation (ReadingRef link)
```typescript
// src/components/calendar/ReadingRef.tsx — Phase 5 update
// Source: existing ReadingRef.tsx stub from Phase 4
import Link from 'next/link';
import type { ReadingRef } from '@/lib/types/calendar';

export function ReadingRef({ reading }: { reading: ReadingRef }) {
  return (
    <Link
      href={`/scripture/${reading.book.toLowerCase()}/${reading.chapter}#verse-${reading.verseStart}`}
      className="text-gold hover:underline font-garamond text-sm"
    >
      {reading.display}
    </Link>
  );
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Full-text search engine (Algolia) for Bible apps | Firestore `array-contains` with `searchKeywords` | 2020–2022 | Free, sufficient for scripture keyword search; no external service |
| Storing Bible text as static JSON files | Firestore structured documents | N/A (project choice) | Enables server-side filtering, search, and multilingual queries; queryable by book/chapter |
| NKJV or NIV (copyrighted) | Brenton LXX + EOB NT (public domain / non-commercial Orthodox) | Project inception | Zero copyright risk; canonically Orthodox sources |
| Nested subcollections for Bible hierarchy | Flat collection with compound index | Firebase best practices 2021+ | One query returns a chapter; cross-collection search works |

**Deprecated/outdated:**
- Bible Gateway API for embedding: Requires paid license, non-compatible with offline use and multilingual goal
- NKJV: Rejected in REQUIREMENTS.md — Thomas Nelson copyright
- Catena Bible App data: Oriental (Coptic) Orthodox source — explicitly excluded in CLAUDE.md

---

## Open Questions

1. **EOB NT PDF parsing quality**
   - What we know: PDF exists on Internet Archive; non-commercial Orthodox use is licensed; no pre-built JSON/USFM download found.
   - What's unclear: Quality of PDF text extraction; whether structured HTML version is available from VDUB Software or other source.
   - Recommendation: Plan 05-01 must include a sub-task to attempt PDF-to-JSON conversion and validate against known verse counts. If parsing quality is unacceptable, contact EOB editor at `eobeditor@easternorthodoxbible.org` for structured data.

2. **USFM book codes to URL-slug normalization**
   - What we know: eBible.org USFM uses standard SBL codes (GEN, EXO, ... JHN, ACT). Brenton uses LXX book ordering which differs from Protestant OT ordering (includes Deuterocanonical books: Tobit, Judith, 1-2 Maccabees, etc.).
   - What's unclear: Exact book ordering and codes in the Brenton USFM file from eBible.org for the deuterocanonical books.
   - Recommendation: Download and inspect the USFM zip before writing the seed script. Define the canonical `bookAbbrev` and `bookIndex` for all 49 LXX books explicitly in a constants file.

3. **Firestore free tier capacity for 31K verse reads**
   - What we know: 50K reads/day free tier; reading one chapter costs ~26 reads on average; 31K total verse documents need ~31 writes to seed.
   - What's unclear: Whether the app sees enough traffic to exhaust the free tier.
   - Recommendation: The free tier is sufficient for prototype/demo use. Caching via Next.js `unstable_cache` or `fetch` revalidation should be applied to Server Component chapter fetches to reduce repeat reads for the same chapter.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 30 + jsdom + @testing-library/react |
| Config file | `jest.config.ts` (root) — matches `tests/**/*.test.{ts,tsx}` |
| Quick run command | `npx jest --testPathPatterns="05" --no-coverage` |
| Full suite command | `npx jest --no-coverage` |

Note: Jest 30 uses `--testPathPatterns` (plural) — not `--testPathPattern`. See STATE.md Phase 2 decision.

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LIB-01 | `buildVerseKeywords` produces correct lowercase token array | unit | `npx jest --testPathPatterns="scripture" --no-coverage` | Wave 0 |
| LIB-01 | Seed script produces deterministic `verseId` format | unit | `npx jest --testPathPatterns="scripture" --no-coverage` | Wave 0 |
| LIB-02 | `getChapter` returns correct verse array for known chapter | unit (mocked Firestore) | `npx jest --testPathPatterns="scripture" --no-coverage` | Wave 0 |
| LIB-03 | `VerseList` renders EB Garamond class and gold verse numbers | unit | `npx jest --testPathPatterns="ScriptureReader" --no-coverage` | Wave 0 |
| LIB-04 | `searchVerses` queries by keyword array-contains | unit (mocked Firestore) | `npx jest --testPathPatterns="scripture" --no-coverage` | Wave 0 |
| LIB-04 | `parseReference("John 3:16")` returns `{ book: "John", chapter: 3, verse: 16 }` | unit | `npx jest --testPathPatterns="ScriptureSearch" --no-coverage` | Wave 0 |
| LIB-05 | `BookNavigator` renders book dropdown with correct options | unit | `npx jest --testPathPatterns="BookNavigator" --no-coverage` | Wave 0 |
| LIB-05 | `ReadingRef` renders as active Link after Phase 5 activation | unit | `npx jest --testPathPatterns="ReadingRef" --no-coverage` | Exists (Phase 4 stub) |
| LIB-06 | `getChapter` accepts arbitrary `translationId` and queries correctly | unit (mocked Firestore) | `npx jest --testPathPatterns="scripture" --no-coverage` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx jest --testPathPatterns="05" --no-coverage`
- **Per wave merge:** `npx jest --no-coverage`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/lib/scripture.test.ts` — covers LIB-01 (keyword builder, verseId format), LIB-02 (getChapter mock), LIB-04 (searchVerses mock), LIB-06 (translationId query)
- [ ] `tests/components/ScriptureReader.test.tsx` — covers LIB-03 (Byzantine aesthetic rendering)
- [ ] `tests/components/ScriptureSearch.test.tsx` — covers LIB-04 (parseReference)
- [ ] `tests/components/BookNavigator.test.tsx` — covers LIB-05 (navigation dropdowns)
- [ ] `tests/components/ReadingRef.test.tsx` — EXISTS from Phase 4; update to test active Link state

---

## Sources

### Primary (HIGH confidence)
- eBible.org `https://ebible.org/eng-Brenton/` — confirmed public domain status, USFM download availability for Brenton LXX
- npm registry: `npm view usfm-js version` → 3.4.3 (MIT license, unfoldingWord)
- `C:/Users/Owner/Downloads/Claude Projects/Ekklesia_Agora/scripts/seed-super-admin.ts` — confirmed seed script pattern (dotenv + Firebase Admin SDK + batch writes)
- `C:/Users/Owner/Downloads/Claude Projects/Ekklesia_Agora/src/lib/firestore/videos.ts` — confirmed `buildVideoSearchKeywords` pattern to adapt
- `C:/Users/Owner/Downloads/Claude Projects/Ekklesia_Agora/package.json` — confirmed existing dependencies (firebase-admin 13.7.0, tsx 4.21.0, zod 4.3.6)
- `C:/Users/Owner/Downloads/Claude Projects/Ekklesia_Agora/firestore.indexes.json` — confirmed composite index pattern for array-contains + field equality
- `C:/Users/Owner/Downloads/Claude Projects/Ekklesia_Agora/src/app/(main)/calendar/page.tsx` — confirmed Server Component + searchParams + Client Component pattern to replicate
- Firebase Firestore docs — confirmed 500-op batch limit, 50K reads/day free tier, 1GiB free storage

### Secondary (MEDIUM confidence)
- WebSearch verified EOB NT license: "non-commercial, liturgical or scholarly purposes hereby granted to canonical Orthodox jurisdictions" — from EOB copyright page (textus-receptus.com/wiki/Holy_Orthodox_Bible)
- Internet Archive EOB NT PDF — confirmed PDF availability: `https://ia800108.us.archive.org/18/items/new-testament-the-eastern-greek-orthodox-bible/`
- `usfm-js` GitHub (unfoldingWord) — confirmed `usfm.toJSON()` API, 3.4.3 latest

### Tertiary (LOW confidence)
- EOB NT machine-readable format availability — No confirmed JSON/USFM download found; PDF parsing approach inferred; contact with EOB editor may be needed if PDF quality is poor

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — existing project libraries cover everything; only `usfm-js` is new (devDep only, verified version)
- Architecture: HIGH — flat Firestore collection pattern proven in project; keyword search pattern proven; Server Component pattern proven
- Data sourcing (Brenton): HIGH — public domain, USFM download confirmed
- Data sourcing (EOB NT): MEDIUM — license confirmed, but machine-readable format requires manual workflow
- Pitfalls: HIGH for Firestore index, batch size, and jest flag (all verified); MEDIUM for PDF parsing quality (unknown until attempted)

**Research date:** 2026-03-19
**Valid until:** 2026-09-19 (stable npm packages, immutable public domain text sources, Firestore pricing stable)
