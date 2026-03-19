# Phase 6: Patristic Library + Study Guides - Research

**Researched:** 2026-03-19
**Domain:** CCEL ThML XML parsing for Church Fathers texts, Firestore data architecture for patristic corpus, author-first browse UI, study guide data model, Next.js 15 patterns mirroring Phase 5 Scripture Library
**Confidence:** HIGH for data architecture, Firestore patterns, and UI (all mirror Phase 5); MEDIUM for specific CCEL ThML XML structure details (confirmed format but some structural ambiguity around per-work segmentation within multi-work volumes)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Text Segmentation & Data Model**
- Each Firestore document = one complete short work OR one chapter/homily from a longer work
- Short standalone works (letters, short treatises, individual homilies) are stored as a single document
- Large works (multi-volume treatises, long homily series) are split by their natural chapter or homily boundaries — each chapter becomes its own document
- Collection name: `patristic_texts` (mirrors `scripture_verses` pattern)
- `searchKeywords` array built from: title + author name + topic tags + up to ~100 significant content words extracted from the text body. NOT full-text tokenization of the entire body

**Author & Work Selection**
- Seed target: at least 20 individual text documents (not 20 distinct Fathers — a single Father can contribute multiple works/chapters)
- Source: CCEL (ccel.org) — ANF/NPNF series structured XML (ThML/TEI format), Philip Schaff edition (pre-1928, public domain)
- Era coverage: balanced across eras — Apostolic Fathers (Ignatius, Clement), Ante-Nicene (Justin Martyr, Irenaeus), Nicene (Athanasius, Basil, Gregory of Nazianzus, Chrysostom), Post-Nicene (Cyril of Alexandria, John of Damascus)
- Researcher/planner select specific works based on CCEL XML availability and quality

**Browse & Navigation Model**
- `/fathers` landing page: Author-first — grid/list of Church Father author cards (name, era, brief description) with a topic filter sidebar to narrow by category
- Author pages (`/fathers/[slug]`): Short bio (era, feast day, key contribution) + ordered list of their seeded works/chapters. Clicking a work opens the full-text reader
- Topic categories: Reuse existing Phase 2 Orthodox content categories from `src/lib/constants/categories.ts` (`ORTHODOX_CATEGORIES`) as `topics[]` tags on each patristic text document. No new taxonomy
- Search (`/fathers/search`): `searchKeywords` array-contains query, results list showing matching works with author + topic context

**Study Guide Design**
- Format: Numbered reading list — a titled guide with an ordered sequence of items. Each item: step number, title, short description (what to read and why), and a link to either a `patristic_texts` doc or a `/scripture/[book]/[chapter]#verse-N` deep link
- Navigation: Study guides live under `/fathers/guides` — accessible via a 'Church Fathers' nav dropdown with 'Browse Fathers' and 'Study Guides' sub-links
- Initial seed guides (3-5 topics): Introduction to Orthodoxy, Holy Scripture & Tradition, Prayer & Theosis, The Divine Liturgy
- Firestore collection: `study_guides` — each document has title, description, topic tag, and an ordered `items[]` array (each item: type, refId/href, title, description)

**Routes**
- `/fathers`, `/fathers/[slug]`, `/fathers/search`, `/fathers/guides`, `/fathers/guides/[slug]`
- New routes in `src/app/(main)/fathers/`

### Claude's Discretion
- Exact CCEL XML parsing strategy and which specific works/chapters to seed (within era balance and 20+ count constraints)
- Text reader page layout for patristic works (can mirror Scripture reader pattern)
- Loading skeleton and empty state designs
- Author card layout details on the landing page
- Which specific passages to extract for the 100-word `searchKeywords` sample

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within Phase 6 scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PAT-01 | Curated selections of essential Church Fathers writings stored as structured data | `patristic_texts` Firestore collection — one doc per short work or per chapter/homily; same flat-collection pattern as `scripture_verses`; 20+ seed documents from CCEL ThML XML |
| PAT-02 | Texts sourced from public domain Ante-Nicene, Nicene, and Post-Nicene Fathers series | CCEL ANF/NPNF Philip Schaff edition (pre-1928); ThML XML downloadable at `https://ccel.org/ccel/schaff/anf01.xml` and equivalent URLs for each volume; all pre-1928 U.S. public domain |
| PAT-03 | User can search patristic texts by topic, keyword, quote, or author | `searchKeywords` array-contains query on `patristic_texts` collection; mirrors `searchVerses()` pattern from `src/lib/firestore/scripture.ts`; build `searchPatristicTexts()` in `src/lib/firestore/patristic.ts` |
| PAT-04 | User can browse by Church Father (author pages) | `patristic_authors` Firestore collection (slug, name, era, feastDay, bio); `/fathers/[slug]` Server Component page fetches author doc + all texts where `authorSlug == slug`; composite index on `authorSlug + sortOrder` |
| PAT-05 | Recommended reading lists curated by topic | `study_guides` collection with `items[]` array; 3-5 seed guides; same seed script pattern as `seed-brenton-lxx.ts` |
| PAT-06 | Rendered in Byzantine UI with clean reading experience | Reuse existing Tailwind v4 tokens (`font-cinzel`, `font-garamond`, `text-gold`, `bg-navy-mid`, `border-gold/[0.15]`); mirror `ScriptureReader` layout (narrow prose ~65ch, centered, Prev/Next navigation) |
| STD-01 | Curated reading/viewing paths organized by topic | `study_guides` Firestore collection; 3-5 seeded topics (Introduction to Orthodoxy, Holy Scripture & Tradition, Prayer & Theosis, The Divine Liturgy) |
| STD-02 | Study guides reference Scripture Library and Patristic Library entries | Each `items[]` entry has `type: 'patristic' | 'scripture'`, `refId` (patristic_texts docId) or `href` (Scripture deep link); links to existing `/scripture/[book]/[chapter]#verse-N` pattern from Phase 5 |
| STD-03 | Study guides display as ordered content sequences with descriptions | `items[]` array ordered by `step` number; each item renders step number, title, description, and a `<Link>` to the referenced content |
</phase_requirements>

---

## Summary

Phase 6 has three sub-problems that closely mirror Phase 5: (1) **data ingestion** — downloading CCEL ThML XML, parsing the content, and seeding `patristic_texts` + `patristic_authors` documents; (2) **library UI** — author browse, topic filter, author pages, search, and a text reader; and (3) **study guides** — a new `study_guides` collection with a seed script and read-only UI at `/fathers/guides`.

For data ingestion, the CCEL ANF/NPNF Philip Schaff edition is pre-1928 and unambiguously U.S. public domain. CCEL provides these texts in ThML (Theological Markup Language), an XML dialect, downloadable directly at URL patterns like `https://ccel.org/ccel/schaff/anf01.xml`. Each volume is a single XML file containing multiple works using `<div1>`/`<div2>`/`<div3>` nesting; individual works are distinguished by `authorID`/`workID` in `<ThML.head>` metadata. Since Phase 6 seeds curated selections (not the full corpus), the seed script downloads the relevant volume XML files at build time, parses them with `fast-xml-parser` (v5.5.6, MIT, already in the npm ecosystem), extracts the target works/chapters by their `div` identifiers, strips markup, and batch-writes to Firestore. The `searchKeywords` hybrid strategy (title + author + topic tags + ~100 significant body words) avoids the index-bloat risk of full-body tokenization.

The library UI mirrors the Scripture Library exactly: Server Component fetches from `patristic_texts` or `patristic_authors` via Admin SDK, passes as props to Client Components. The `/fathers` author-grid landing page, `/fathers/[slug]` author detail page, `/fathers/search` search results page, and the inline text reader are all new routes in `src/app/(main)/fathers/`. The navbar gets a "Church Fathers" dropdown (desktop) and flat links (mobile) following the existing `Navbar.tsx` + `MobileMenu.tsx` pattern. Study guides are a thin new collection with no new UI patterns beyond a simple ordered-list render page.

**Primary recommendation:** Treat Phase 6 as a direct extension of Phase 5 — adapt `src/lib/firestore/scripture.ts` into `src/lib/firestore/patristic.ts`, adapt `scripts/seed-brenton-lxx.ts` into `scripts/seed-patristic.ts` (using `fast-xml-parser` instead of `usfm-js`), and add `fast-xml-parser` as the only new devDependency.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| fast-xml-parser | 5.5.6 | Parse CCEL ThML XML volumes to JSON in seed script | MIT license; zero C/C++ dependencies; TypeScript-native; actively maintained (last published March 2026); handles large XML files without streaming complexity |
| firebase-admin | 13.7.0 (existing) | Batch-write `patristic_texts`, `patristic_authors`, `study_guides` seed documents | Already installed; established Admin SDK pattern across all prior phases |
| tsx | 4.21.0 (existing) | Run TypeScript seed script directly | Already installed; same tool used for `seed-brenton-lxx.ts` and `seed-eob-nt.ts` |
| Next.js 15 / React 19 | 15.5.13 (existing) | Server Component pages, URL-based navigation | Already installed; Server Component + searchParams pattern matches Phase 5 exactly |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| dotenv | 17.3.1 (existing) | Load `.env.local` credentials in seed script | Same pattern as all prior seed scripts |
| zod | 4.3.6 (existing) | Validate parsed patristic objects before Firestore write | Defensive parsing — catch malformed XML text at seed time |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `fast-xml-parser` | `xml2js` v0.6.2 | `xml2js` uses callbacks/promises but is well-established; `fast-xml-parser` is TypeScript-native and has simpler synchronous API; either works — `fast-xml-parser` is preferred for clean TS integration |
| `fast-xml-parser` | `cheerio` v1.2.0 | Cheerio is HTML/DOM-oriented; ThML is valid XML that fast-xml-parser handles better |
| Firestore `patristic_texts` flat collection | Nested `authors/{slug}/works/{workId}/pages/{n}` subcollections | Subcollections require multi-level reads to fetch a text; flat collection with compound query is one read per text; same rationale as Phase 5 `scripture_verses` |
| Hybrid `searchKeywords` (title + author + ~100 body words) | Full-body tokenization | Full body would produce 500–2000 tokens per document; at 20+ documents that's 10,000+ array entries per query; Firestore array index has practical limits and costs; hybrid at ~150 tokens/doc is safe |

**Installation (seed script devDependency only):**
```bash
npm install --save-dev fast-xml-parser
```

**Version verification:**
```bash
npm view fast-xml-parser version   # 5.5.6
```

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/(main)/
│   └── fathers/
│       ├── page.tsx                      # Server Component — author grid + topic filter
│       ├── search/
│       │   └── page.tsx                  # Server Component — search results (searchParams.q)
│       ├── [slug]/
│       │   ├── page.tsx                  # Server Component — author detail page
│       │   └── [textId]/
│       │       └── page.tsx              # Server Component — patristic text reader
│       └── guides/
│           ├── page.tsx                  # Server Component — study guides list
│           └── [slug]/
│               └── page.tsx             # Server Component — individual guide
├── components/
│   └── fathers/
│       ├── FathersGrid.tsx               # Client Component — author cards + topic filter state
│       ├── AuthorCard.tsx                # Presentational — author card (name, era, description)
│       ├── PatristicReader.tsx           # Client Component — text reader (mirrors ScriptureReader)
│       ├── PatristicSearch.tsx           # Client Component — search form + results
│       ├── PatristicSkeleton.tsx         # Loading skeleton
│       ├── StudyGuideList.tsx            # Presentational — list of study guide cards
│       └── StudyGuideViewer.tsx          # Client Component — ordered step list with links
├── lib/
│   ├── firestore/
│   │   └── patristic.ts                 # getPatristicText, getAuthor, getAuthorTexts,
│   │                                    #   searchPatristicTexts, getStudyGuide, getStudyGuides
│   └── types/
│       └── patristic.ts                 # PatristicText, PatristicAuthor, StudyGuide types
└── scripts/
    └── seed-patristic.ts                # Seeds patristic_texts + patristic_authors + study_guides
```

### Firestore Data Model

**Collection: `patristic_texts`**

```typescript
// src/lib/types/patristic.ts
export interface PatristicText {
  textId: string;            // e.g., "ignatius-ephesians" or "chrysostom-homily-matthew-1"
  authorSlug: string;        // FK to patristic_authors, e.g., "ignatius-of-antioch"
  authorName: string;        // Denormalized: "Ignatius of Antioch"
  era: PatristicEra;         // 'apostolic' | 'ante-nicene' | 'nicene' | 'post-nicene'
  title: string;             // e.g., "Epistle to the Ephesians"
  workTitle: string;         // Parent work title if this is a chapter: "Homilies on Matthew"
  chapterOrHomily: number | null; // null for standalone works, 1-N for chapters
  topics: OrthodoxCategory[]; // From ORTHODOX_CATEGORIES in src/lib/constants/categories.ts
  source: string;            // e.g., "ANF Vol. 1, Philip Schaff ed. (CCEL)"
  sortOrder: number;         // For ordering within author page
  body: string;              // Full text of this work/chapter (stripped of XML markup)
  searchKeywords: string[];  // title + authorName + topics + ~100 significant body words
}

export type PatristicEra = 'apostolic' | 'ante-nicene' | 'nicene' | 'post-nicene';

// Collection: `patristic_authors` — author index for browse and author pages
export interface PatristicAuthor {
  authorSlug: string;        // e.g., "ignatius-of-antioch" — doc ID
  name: string;              // "Ignatius of Antioch"
  era: PatristicEra;
  eraLabel: string;          // Display: "Apostolic Father (c. 35–108 AD)"
  feastDay: string | null;   // e.g., "December 20 (OC)" — null if not commemorated
  keyContribution: string;   // One-sentence summary: "Letters defending apostolic unity"
  bio: string;               // 2-4 sentence biography for author page
  sortOrder: number;         // For ordering on /fathers landing page
}

// Collection: `study_guides` — curated reading sequences
export interface StudyGuide {
  guideId: string;           // doc ID, e.g., "introduction-to-orthodoxy"
  slug: string;              // URL slug — same as guideId
  title: string;             // "Introduction to Orthodoxy"
  description: string;       // 2-3 sentence overview
  topic: OrthodoxCategory;   // One topic tag from ORTHODOX_CATEGORIES
  items: StudyGuideItem[];   // Ordered array — Firestore array field
}

export interface StudyGuideItem {
  step: number;              // 1, 2, 3 …
  title: string;             // e.g., "The Epistle to the Ephesians — Ignatius"
  description: string;       // What to read and why (1-2 sentences)
  type: 'patristic' | 'scripture';
  refId: string | null;      // patristic_texts textId OR null for scripture links
  href: string | null;       // null for patristic; "/scripture/john/1#verse-1" for scripture
}
```

**Import existing `OrthodoxCategory` type:**
```typescript
import { ORTHODOX_CATEGORIES, type OrthodoxCategory } from '@/lib/constants/categories';
```
This reuses the existing Phase 2 category constants — no new taxonomy.

**Scale sanity check (Phase 6 seed):**
- `patristic_texts`: 20–35 documents × ~5KB body each ≈ ~150KB storage — trivial
- `patristic_authors`: 10–15 documents × ~500 bytes each ≈ ~8KB storage
- `study_guides`: 3–5 documents × ~2KB each ≈ ~10KB storage
- Firestore reads per author page: 1 author doc + N text docs (average ~3–5 per author)
- Free tier: 50K reads/day — Phase 6 data volume is microscopic compared to scripture

### Composite Indexes Required

Add to `firestore.indexes.json`:

```json
{
  "collectionGroup": "patristic_texts",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "authorSlug", "order": "ASCENDING" },
    { "fieldPath": "sortOrder", "order": "ASCENDING" }
  ]
},
{
  "collectionGroup": "patristic_texts",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "searchKeywords", "arrayConfig": "CONTAINS" }
  ]
},
{
  "collectionGroup": "patristic_texts",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "topics", "arrayConfig": "CONTAINS" },
    { "fieldPath": "era", "order": "ASCENDING" }
  ]
},
{
  "collectionGroup": "patristic_authors",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "era", "order": "ASCENDING" },
    { "fieldPath": "sortOrder", "order": "ASCENDING" }
  ]
}
```

Note: Single-field `searchKeywords` array-contains does NOT require a composite index — it uses Firestore's automatic single-field index. The composite index above is for the `topics + era` browse filter query.

### Pattern 1: Server Component + Client Component Split (mirrors Phase 5)

**What:** Server Component fetches from Firestore via Admin SDK, passes as props to Client Component.

**When to use:** All `/fathers` pages — same pattern as `/scripture/[book]/[chapter]/page.tsx`.

**Example (author detail page):**
```typescript
// src/app/(main)/fathers/[slug]/page.tsx
// Source: mirrors src/app/(main)/scripture/[book]/[chapter]/page.tsx pattern
import { getAuthor, getAuthorTexts } from '@/lib/firestore/patristic';
import { FathersAuthorPage } from '@/components/fathers/FathersAuthorPage';
import { notFound } from 'next/navigation';

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [author, texts] = await Promise.all([
    getAuthor(slug),
    getAuthorTexts(slug),
  ]);
  if (!author) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-cinzel text-gold text-xl uppercase tracking-widest mb-2">
        {author.name}
      </h1>
      <p className="font-cinzel text-xs uppercase tracking-widest text-text-mid mb-6">
        {author.eraLabel}
      </p>
      <FathersAuthorPage author={author} texts={texts} />
    </div>
  );
}
```

### Pattern 2: Patristic Firestore Query Functions

**What:** Admin SDK queries against `patristic_texts` and `patristic_authors` with compound filters, mirroring `src/lib/firestore/scripture.ts`.

**When to use:** All Server Components and Server Actions loading patristic data.

```typescript
// src/lib/firestore/patristic.ts
import { getAdminFirestore } from '@/lib/firebase/admin';
import type { PatristicText, PatristicAuthor, StudyGuide } from '@/lib/types/patristic';

export async function getAuthor(slug: string): Promise<PatristicAuthor | null> {
  const db = getAdminFirestore();
  const doc = await db.collection('patristic_authors').doc(slug).get();
  if (!doc.exists) return null;
  return doc.data() as PatristicAuthor;
}

export async function getAuthorTexts(authorSlug: string): Promise<PatristicText[]> {
  const db = getAdminFirestore();
  const snap = await db
    .collection('patristic_texts')
    .where('authorSlug', '==', authorSlug)
    .orderBy('sortOrder', 'asc')
    .get();
  return snap.docs.map(d => d.data() as PatristicText);
}

export async function getPatristicText(textId: string): Promise<PatristicText | null> {
  const db = getAdminFirestore();
  const doc = await db.collection('patristic_texts').doc(textId).get();
  if (!doc.exists) return null;
  return doc.data() as PatristicText;
}

export async function searchPatristicTexts(
  query: string,
  limit = 20
): Promise<PatristicText[]> {
  const db = getAdminFirestore();
  const keyword = query.toLowerCase().trim();
  if (!keyword) return [];
  const snap = await db
    .collection('patristic_texts')
    .where('searchKeywords', 'array-contains', keyword)
    .limit(limit)
    .get();
  return snap.docs.map(d => d.data() as PatristicText);
}

export async function getPatristicAuthors(): Promise<PatristicAuthor[]> {
  const db = getAdminFirestore();
  const snap = await db
    .collection('patristic_authors')
    .orderBy('sortOrder', 'asc')
    .get();
  return snap.docs.map(d => d.data() as PatristicAuthor);
}

export async function getStudyGuides(): Promise<StudyGuide[]> {
  const db = getAdminFirestore();
  const snap = await db.collection('study_guides').get();
  return snap.docs.map(d => d.data() as StudyGuide);
}

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
```

### Pattern 3: Hybrid Keyword Builder for Patristic Texts

**What:** Build `searchKeywords` from title + author + topics + significant body words, not full-body tokenization.

**Why different from `buildVerseKeywords`:** Patristic text bodies can be thousands of words. Full tokenization would create 500–2,000 array entries per document. The hybrid approach targets the most useful search terms while staying within practical index limits.

```typescript
// scripts/seed-patristic.ts — inline keyword builder
function buildPatristicKeywords(
  title: string,
  authorName: string,
  topics: string[],
  body: string,
  maxBodyWords = 100
): string[] {
  const metaTokens = [title, authorName, ...topics]
    .join(' ')
    .toLowerCase()
    .split(/[\s\W]+/)
    .filter(t => t.length >= 3);

  // Extract significant body words: tokenize, deduplicate, take first maxBodyWords
  const bodyTokens = body
    .toLowerCase()
    .split(/[\s\W]+/)
    .filter(t => t.length >= 4)  // Use >=4 for body words to reduce noise
    .slice(0, maxBodyWords * 3); // Sample from start (most important content)

  const all = [...new Set([...metaTokens, ...bodyTokens])];
  return all.slice(0, 150); // Hard cap at 150 to guard against edge cases
}
```

### Pattern 4: CCEL ThML XML Parsing Strategy

**What:** Download CCEL volume XML files, parse with `fast-xml-parser`, extract target works/chapters by `div` nesting and `workID` identifiers, strip XML markup from body text.

**CCEL URL pattern (confirmed):**
- ANF volumes: `https://ccel.org/ccel/schaff/anf01.xml` through `anf10.xml`
- NPNF Series I: `https://ccel.org/ccel/schaff/npnf101.xml` through `npnf108.xml`
- NPNF Series II: `https://ccel.org/ccel/schaff/npnf201.xml` through `npnf214.xml`

**ThML structure (confirmed from CCEL):**
- Root: `<ThML>` containing `<ThML.head>` (metadata) and `<ThML.body>` (content)
- Content hierarchy: `<div1>` (major sections/works) > `<div2>` (introductory notes, subsections) > `<div3>` (chapters, numbered with `@n` attribute)
- Text in `<p>` elements; footnotes in `<note>` elements; scripture refs in `<scripRef>` elements; page breaks in `<pb>` elements

**Parsing approach:**
```typescript
// scripts/seed-patristic.ts (structure)
import { XMLParser } from 'fast-xml-parser';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  ignoreDeclaration: true,
  removeNSPrefix: true,
});

function extractBodyText(xmlNode: unknown): string {
  // Recursively collect text from <p> elements
  // Skip <note>, <index>, <scripRef> tags (footnotes, indices)
  // Return concatenated plain text
}
```

**Work identification:** Each `<div1>` within a volume typically represents one author/work. The seed script identifies the target work by matching `<div1>` heading content or `workID` metadata, then extracts `<p>` text nodes recursively while skipping `<note>` and `<index>` children.

### Pattern 5: Navbar Dropdown for "Church Fathers"

**What:** Add a "Church Fathers" dropdown to `Navbar.tsx` and flat links to `MobileMenu.tsx`, using the existing hover-state dropdown pattern (same approach as the existing avatar dropdown).

**Important:** The current Navbar uses a `useState`-controlled hover dropdown. Add a `[fathersOpen, setFathersOpen]` state pair following the existing `avatarOpen` pattern.

```tsx
// src/components/nav/Navbar.tsx — add to desktop nav links section
// Pattern mirrors the existing avatarOpen dropdown
const [fathersOpen, setFathersOpen] = useState(false);

<div className="relative" onMouseLeave={() => setFathersOpen(false)}>
  <button
    onMouseEnter={() => setFathersOpen(true)}
    className="font-cinzel text-xs uppercase tracking-widest text-text-light hover:text-gold transition-colors"
    aria-expanded={fathersOpen}
  >
    Fathers
  </button>
  {fathersOpen && (
    <div className="absolute top-full left-0 mt-1 w-44 bg-navy-mid border border-gold/20 rounded shadow-xl z-60">
      <Link href="/fathers" onClick={() => setFathersOpen(false)}
        className="block px-4 py-2 font-cinzel text-xs uppercase tracking-wider text-text-light hover:text-gold hover:bg-gold/5 transition-colors">
        Browse Fathers
      </Link>
      <Link href="/fathers/guides" onClick={() => setFathersOpen(false)}
        className="block px-4 py-2 font-cinzel text-xs uppercase tracking-wider text-text-light hover:text-gold hover:bg-gold/5 transition-colors">
        Study Guides
      </Link>
    </div>
  )}
</div>
```

**MobileMenu.tsx:** Add two flat links following existing Link pattern:
```tsx
<Link href="/fathers" onClick={onClose} className="px-4 py-3 font-cinzel text-sm uppercase ...">Browse Fathers</Link>
<Link href="/fathers/guides" onClick={onClose} className="px-4 py-3 font-cinzel text-sm uppercase ...">Study Guides</Link>
```

### Pattern 6: Study Guide Render

**What:** A study guide page renders an ordered list with step numbers, titles, descriptions, and links. Each item links to either `patristic_texts` reader or existing Scripture deep links.

```tsx
// src/components/fathers/StudyGuideViewer.tsx
'use client';
import Link from 'next/link';
import type { StudyGuide } from '@/lib/types/patristic';

export function StudyGuideViewer({ guide }: { guide: StudyGuide }) {
  return (
    <div>
      <p className="font-garamond text-text-light mb-8">{guide.description}</p>
      <ol className="space-y-6">
        {guide.items.map((item) => (
          <li key={item.step} className="flex gap-4 items-start border-b border-gold/[0.10] pb-6">
            <span className="font-cinzel text-gold text-lg shrink-0">{item.step}.</span>
            <div>
              <p className="font-cinzel text-gold text-sm mb-1">{item.title}</p>
              <p className="font-garamond text-sm text-text-light mb-2">{item.description}</p>
              {item.type === 'patristic' && item.refId && (
                <Link href={`/fathers/text/${item.refId}`}
                  className="font-cinzel text-xs text-gold hover:underline uppercase tracking-wider">
                  Read Text
                </Link>
              )}
              {item.type === 'scripture' && item.href && (
                <Link href={item.href}
                  className="font-cinzel text-xs text-gold hover:underline uppercase tracking-wider">
                  Read Scripture
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
```

### Anti-Patterns to Avoid

- **Full-body `searchKeywords` tokenization:** At 1,000–5,000 words per patristic text, full tokenization produces 200–1,000 unique tokens per document. With 20+ documents, this approaches Firestore array index practical limits (~40KB per document) and increases read costs. Use the hybrid approach (~150 tokens max).
- **Storing entire work bodies in one large Firestore document:** The Firestore 1MB document limit applies. A large homily series chapter is typically 2,000–5,000 words (~15–30KB); a complete multi-chapter work could exceed 1MB if not split. The decision to split large works by chapter/homily boundary directly prevents this.
- **Fetching all `patristic_texts` on the `/fathers` landing page:** The landing page only needs authors (from `patristic_authors`), not the full text documents. Fetch only `patristic_authors` for the landing page; only load texts when an author page or search result is requested.
- **Subcollections for `items[]` in `study_guides`:** Each guide has 3–15 items. An embedded array in the guide document is correct. Creating a subcollection `study_guides/{id}/items/` would add unnecessary read complexity for no benefit.
- **New Tailwind tokens or CSS variables:** Phase 6 uses only existing Byzantine tokens — `text-gold`, `bg-navy`, `bg-navy-mid`, `font-cinzel`, `font-garamond`, `border-gold/[0.15]`. No new CSS added.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| ThML XML parsing | Custom regex stripping of XML tags | `fast-xml-parser` v5.5.6 | ThML has nested markup, footnote tags, scripture refs, page break markers; regex will corrupt text with nested angle brackets, footnotes, and inline markup |
| Text body cleanup | Manual character-by-character parser | fast-xml-parser + recursive text node extraction (filter `<p>` children by tag) | The parser preserves structure so `<note>` footnotes can be excluded cleanly; regex cannot reliably distinguish footnote content from body text |
| Category taxonomy | New topic enum for patristic topics | Import `ORTHODOX_CATEGORIES` from `src/lib/constants/categories.ts` | Phase 2 categories already match patristic content perfectly (Holy Fathers, Holy Scripture, Holy Trinity, Spiritual Life, etc.); new taxonomy would fragment browse/filter UX |
| Author bio data | Scrape from Wikipedia/OCA website | Hand-authored inline in seed script | There are only 10–15 Fathers to seed; bio text must be canonically accurate and jurisdiction-neutral; automated sourcing introduces quality and copyright risk |
| Full-text search engine | Algolia/Typesense integration | Firestore `array-contains` + hybrid `searchKeywords` | External service cost on minimal budget; patristic corpus is small (20–35 docs); existing pattern from videos/posts/scripture; Phase 7 global search can call `searchPatristicTexts()` directly |

**Key insight:** The complexity in Phase 6 is in the seed script (CCEL XML parsing and work extraction), not the UI. The UI is a direct adaptation of Phase 5. Invest implementation time in the seed script; the UI is largely copy-paste-adapt from Scripture Library components.

---

## Recommended Seed Works (20+ Documents, Era-Balanced)

This selection covers all four eras and stays within CCEL ThML XML availability. The seed script should download these specific volumes:

| # | Author | Work/Chapter | Era | CCEL Volume | Topics |
|---|--------|-------------|-----|-------------|--------|
| 1 | Clement of Rome | First Epistle to the Corinthians | Apostolic | ANF Vol. 1 (`anf01.xml`) | Holy Trinity, Spiritual Life |
| 2 | Ignatius of Antioch | Epistle to the Ephesians | Apostolic | ANF Vol. 1 | Holy Trinity, Church History |
| 3 | Ignatius of Antioch | Epistle to the Smyrnaeans | Apostolic | ANF Vol. 1 | Holy Trinity, Church History |
| 4 | Ignatius of Antioch | Epistle to Polycarp | Apostolic | ANF Vol. 1 | Spiritual Life |
| 5 | Justin Martyr | First Apology | Ante-Nicene | ANF Vol. 1 | Apologetics, Holy Scripture |
| 6 | Justin Martyr | Dialogue with Trypho (excerpt/ch. 1) | Ante-Nicene | ANF Vol. 1 | Apologetics, Holy Scripture |
| 7 | Irenaeus | Against Heresies, Book I Ch. 1-2 | Ante-Nicene | ANF Vol. 1 | Holy Trinity, Apologetics |
| 8 | Irenaeus | Against Heresies, Book III Ch. 1 | Ante-Nicene | ANF Vol. 1 | Holy Scripture, Church History |
| 9 | Athanasius | On the Incarnation (excerpt/ch. 1-2) | Nicene | NPNF Series II Vol. 4 (`npnf204.xml`) | Holy Trinity, Apologetics |
| 10 | Basil the Great | On the Holy Spirit, Ch. 1 | Nicene | NPNF Series II Vol. 8 (`npnf208.xml`) | Holy Trinity, Spiritual Life |
| 11 | Gregory of Nazianzus | Oration 27 (Theological Oration 1) | Nicene | NPNF Series II Vol. 7 (`npnf207.xml`) | Holy Trinity |
| 12 | Gregory of Nazianzus | Oration 38 (On the Nativity) | Nicene | NPNF Series II Vol. 7 | Feast Days/Fast Days, Holy Trinity |
| 13 | John Chrysostom | Homily 1 on Matthew | Nicene | NPNF Series I Vol. 10 (`npnf110.xml`) | Holy Scripture, Divine Liturgy |
| 14 | John Chrysostom | Homily on Prayer | Nicene | NPNF Series I Vol. 10 (or Vol. 9) | Spiritual Life, Divine Liturgy |
| 15 | John Chrysostom | On the Priesthood, Book I | Nicene | NPNF Series I Vol. 9 (`npnf109.xml`) | Church History, Spiritual Life |
| 16 | John of Damascus | Exact Exposition of the Orthodox Faith, Book I Ch. 1 | Post-Nicene | NPNF Series II Vol. 9 (`npnf209.xml`) | Holy Trinity, Church History |
| 17 | John of Damascus | Exact Exposition of the Orthodox Faith, Book I Ch. 2 | Post-Nicene | NPNF Series II Vol. 9 | Holy Trinity |
| 18 | John of Damascus | On Holy Images, Oration I | Post-Nicene | NPNF Series II Vol. 9 | Iconography, Apologetics |
| 19 | Cyril of Alexandria | Letter to Nestorius (Third Letter) | Post-Nicene | NPNF Series II Vol. 14 (`npnf214.xml`) | Holy Trinity, Church History |
| 20 | Dionysius the Areopagite | On the Ecclesiastical Hierarchy, Ch. 1 | Post-Nicene | ANF Vol. 7 (`anf07.xml`) | Divine Liturgy, Spiritual Life |

This yields exactly 20 documents (some Fathers contribute 2–3), balanced: 4 Apostolic, 4 Ante-Nicene, 7 Nicene, 5 Post-Nicene. The planner may adjust counts within era-balance constraints.

**CCEL volumes needed:** `anf01.xml`, `anf07.xml`, `npnf109.xml`, `npnf110.xml`, `npnf204.xml`, `npnf207.xml`, `npnf208.xml`, `npnf209.xml`, `npnf214.xml`

---

## Common Pitfalls

### Pitfall 1: ThML XML Footnote Text Polluting Body

**What goes wrong:** CCEL ThML embeds footnotes in `<note>` tags inside `<div>` and `<p>` elements. If body text is extracted by naive text concatenation, footnote content ("1. Literally, 'in the name of...'") appears inline in the patristic text body.

**Why it happens:** `fast-xml-parser` returns a flat object where `<note>` children are siblings to text nodes under the same `<p>`. Recursive `#text` extraction without filtering `<note>` picks up footnote strings.

**How to avoid:** When walking the parsed XML tree, skip all nodes whose tag name is `note`, `index`, `scripRef`, `pb`, or `h1`/`h2`/`h3` (which are section headers, not body text). Collect only text from `<p>` nodes whose direct children are text nodes, excluding footnote-tagged siblings.

**Warning signs:** Body text contains parenthetical numerals, "[" footnote markers, or commentary prose that doesn't match the known patristic text.

### Pitfall 2: Missing Composite Index for `authorSlug + sortOrder`

**What goes wrong:** `getAuthorTexts(authorSlug)` query — `.where('authorSlug', '==', X).orderBy('sortOrder', 'asc')` — throws a Firestore "requires an index" runtime error.

**Why it happens:** Any Firestore compound query with a field equality filter + `orderBy` on a different field requires a composite index. Phase 5 already learned this lesson for `scripture_verses`; the same applies here.

**How to avoid:** Add the `patristic_texts` composite index for `authorSlug + sortOrder` to `firestore.indexes.json` in Wave 0 (Plan 06-01). Deploy indexes before the UI plans run.

**Warning signs:** Runtime Firestore error with a URL to create the index automatically.

### Pitfall 3: CCEL ThML Volume Structure Variations

**What goes wrong:** The parsing code assumes a consistent `<div1>` per work structure across all CCEL volumes, but some volumes have different nesting depths — e.g., NPNF volumes may use `<div2>` for individual works and `<div3>` for chapters, while ANF volumes use `<div1>` for works.

**Why it happens:** CCEL's ThML was converted by different volunteers over many years; structural consistency is not guaranteed across volumes.

**How to avoid:** Before writing the full seed script, download and inspect 2–3 representative XML files (`anf01.xml`, `npnf204.xml`, `npnf207.xml`) in a text editor to map the actual depth of the target works. Write the extraction function per-volume if structures differ significantly rather than a single generic parser.

**Warning signs:** Seed script extracts empty body strings for some works, or extracts the wrong section (title page content instead of work body).

### Pitfall 4: `fast-xml-parser` Attribute vs. Text Node Access

**What goes wrong:** `fast-xml-parser` v5 returns attributes under `@_` prefix by default when `attributeNamePrefix: '@_'` is set, but developers access them without the prefix, getting `undefined`.

**Why it happens:** Default configuration must be explicitly set; the parser does not infer attribute vs. element.

**How to avoid:** Configure explicitly:
```typescript
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',  // attributes accessed as node['@_n'], node['@_id'] etc.
  textNodeName: '#text',
  trimValues: true,
});
```
Then access chapter number via `div3['@_n']`, not `div3.n`.

**Warning signs:** Chapter numbers all come out as `undefined`; sort order is wrong.

### Pitfall 5: Seed Script Idempotency

**What goes wrong:** Running the seed script twice creates duplicate `patristic_texts` documents or partially overwrites existing data with incorrect IDs.

**Why it happens:** Using auto-generated Firestore IDs makes each run create new documents.

**How to avoid:** Use deterministic document IDs. For `patristic_texts`: `textId = authorSlug + '-' + workSlug + (chapterNum ? '-' + chapterNum : '')`. Use `db.collection('patristic_texts').doc(textId).set(data)` — idempotent on re-run. Same pattern as Phase 5 `verseId`.

**Warning signs:** `patristic_texts` collection grows beyond expected count on second seed run.

### Pitfall 6: Jest 30 Flag (Project-Wide Known Pattern)

**What goes wrong:** Test run command uses `--testPathPattern` (singular) — fails in this project.

**Why it happens:** Jest 30 renamed to `--testPathPatterns` (plural). Documented in STATE.md from Phase 2.

**How to avoid:** All test commands must use `--testPathPatterns` (plural).

### Pitfall 7: Navbar Dropdown State Isolation

**What goes wrong:** Adding the "Fathers" dropdown to `Navbar.tsx` using `useState` breaks other dropdown states — e.g., opening the Fathers dropdown leaves the avatar dropdown open simultaneously, or vice versa.

**Why it happens:** Each dropdown has independent `useState` booleans with no mutual-exclusion logic.

**How to avoid:** When opening the Fathers dropdown, set `setAvatarOpen(false)` and vice versa. Or use a single `openDropdown: 'fathers' | 'avatar' | null` state that naturally prevents two dropdowns being open at once.

**Warning signs:** Both dropdowns visible simultaneously on click.

---

## Code Examples

### Patristic Firestore Query (Admin SDK)
```typescript
// src/lib/firestore/patristic.ts
// Source: mirrors src/lib/firestore/scripture.ts pattern exactly
import { getAdminFirestore } from '@/lib/firebase/admin';
import type { PatristicText, PatristicAuthor } from '@/lib/types/patristic';

export async function getAuthorTexts(authorSlug: string): Promise<PatristicText[]> {
  const db = getAdminFirestore();
  const snap = await db
    .collection('patristic_texts')
    .where('authorSlug', '==', authorSlug)
    .orderBy('sortOrder', 'asc')
    .get();
  return snap.docs.map(d => d.data() as PatristicText);
}

export async function searchPatristicTexts(
  query: string,
  limit = 20
): Promise<PatristicText[]> {
  const db = getAdminFirestore();
  const keyword = query.toLowerCase().trim();
  if (!keyword) return [];
  const snap = await db
    .collection('patristic_texts')
    .where('searchKeywords', 'array-contains', keyword)
    .limit(limit)
    .get();
  return snap.docs.map(d => d.data() as PatristicText);
}
```

### Seed Script Structure (CCEL ThML)
```typescript
// scripts/seed-patristic.ts (outline)
// Source: mirrors scripts/seed-brenton-lxx.ts pattern
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import * as fs from 'fs';
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { XMLParser } from 'fast-xml-parser';

const BATCH_SIZE = 500;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  trimValues: true,
  ignoreDeclaration: true,
});

async function writeBatches(
  db: FirebaseFirestore.Firestore,
  collection: string,
  docs: Array<{ id: string; data: Record<string, unknown> }>
): Promise<void> {
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = db.batch();
    for (const { id, data } of docs.slice(i, i + BATCH_SIZE)) {
      batch.set(db.collection(collection).doc(id), data);
    }
    await batch.commit();
    console.log(`Seeded ${Math.min(i + BATCH_SIZE, docs.length)} / ${docs.length}`);
  }
}
```

### PatristicText TypeScript Types
```typescript
// src/lib/types/patristic.ts
import type { OrthodoxCategory } from '@/lib/constants/categories';

export type PatristicEra = 'apostolic' | 'ante-nicene' | 'nicene' | 'post-nicene';

export interface PatristicText {
  textId: string;
  authorSlug: string;
  authorName: string;
  era: PatristicEra;
  title: string;
  workTitle: string;
  chapterOrHomily: number | null;
  topics: OrthodoxCategory[];
  source: string;
  sortOrder: number;
  body: string;
  searchKeywords: string[];
}

export interface PatristicAuthor {
  authorSlug: string;
  name: string;
  era: PatristicEra;
  eraLabel: string;
  feastDay: string | null;
  keyContribution: string;
  bio: string;
  sortOrder: number;
}

export interface StudyGuideItem {
  step: number;
  title: string;
  description: string;
  type: 'patristic' | 'scripture';
  refId: string | null;
  href: string | null;
}

export interface StudyGuide {
  guideId: string;
  slug: string;
  title: string;
  description: string;
  topic: OrthodoxCategory;
  items: StudyGuideItem[];
}
```

### Composite Index JSON Additions
```json
// Add to firestore.indexes.json "indexes" array
{
  "collectionGroup": "patristic_texts",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "authorSlug", "order": "ASCENDING" },
    { "fieldPath": "sortOrder", "order": "ASCENDING" }
  ]
},
{
  "collectionGroup": "patristic_texts",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "topics", "arrayConfig": "CONTAINS" },
    { "fieldPath": "era", "order": "ASCENDING" }
  ]
},
{
  "collectionGroup": "patristic_authors",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "era", "order": "ASCENDING" },
    { "fieldPath": "sortOrder", "order": "ASCENDING" }
  ]
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Full-text search engine (Algolia) for library apps | Firestore `array-contains` with hybrid `searchKeywords` | 2020+ | Free; sufficient for curated 20–50 doc corpora; no external service |
| Separate XML parsing library per format (usfm-js for USFM, etc.) | `fast-xml-parser` for any well-formed XML/ThML | 2022+ | Single-library solution for CCEL ThML; TypeScript-native; no C++ binding |
| Nested Firestore subcollections for hierarchical library data | Flat collection with compound index | Firebase best practices 2021+ | One query returns a text; cross-collection search possible |
| New category taxonomies per feature | Reuse `ORTHODOX_CATEGORIES` across all content types | Phase 2 decision | Consistent browse/filter UX; Phase 7 global search can filter by category uniformly |

**Deprecated/outdated:**
- Storing patristic texts as static JSON files in `public/`: Cannot be queried server-side; no search; no per-author filtering without loading all texts on every page
- CCEL's older HTML-only format: ThML XML is available for all major ANF/NPNF volumes and is structurally superior for programmatic extraction

---

## Open Questions

1. **ThML `<div>` depth varies by CCEL volume**
   - What we know: ANF Vol. 1 uses `<div1>` per work, `<div3>` per chapter (confirmed by fetching `anf01.xml`). Other volumes may vary.
   - What's unclear: Whether NPNF volumes follow the same depth convention or require per-volume parsing logic.
   - Recommendation: Plan 06-01 must include a task to download and manually inspect 3 representative volumes (`anf01.xml`, `npnf207.xml`, `npnf209.xml`) before writing the full seed script. Per-volume extraction logic is acceptable — there are only ~9 volumes needed.

2. **CCEL server reliability for programmatic download**
   - What we know: CCEL XML files are publicly accessible at documented URLs. The library has been online since 1994.
   - What's unclear: Whether CCEL has rate limits or blocks automated downloads.
   - Recommendation: Download the ~9 required XML files manually once, commit them to `data/ccel-xml/` (gitignored from main repo but checked into seed data directory), and read from local files in the seed script — same approach as `seed-brenton-lxx.ts` reading from `data/eng-Brenton_usfm/`. This also makes the seed script reproducible offline.

3. **Study guide Scripture deep link format**
   - What we know: Phase 5 Scripture Library routes are `/scripture/[bookAbbrev]/[chapter]#verse-N`. This is confirmed in `ScriptureReader.tsx` prev/next navigation links.
   - What's unclear: Whether the anchor `#verse-N` scroll behavior works as expected when navigating from an external page (study guide).
   - Recommendation: The `ScriptureReader.tsx` already handles `#verse-` hash on mount via `useEffect + window.location.hash`. This works for external navigation too — no changes to Phase 5 code needed.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 30 + jsdom + @testing-library/react |
| Config file | `jest.config.ts` (root) — matches `tests/**/*.test.{ts,tsx}` |
| Quick run command | `npx jest --testPathPatterns="06\|patristic\|fathers\|study" --no-coverage` |
| Full suite command | `npx jest --no-coverage` |

Note: Jest 30 uses `--testPathPatterns` (plural) — not `--testPathPattern`. See STATE.md Phase 2 decision.

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PAT-01 | `buildPatristicKeywords` builds hybrid keyword array (title + author + ~100 body words) | unit | `npx jest --testPathPatterns="patristic" --no-coverage` | Wave 0 |
| PAT-01 | `getPatristicText` returns correct doc for known textId | unit (mocked Firestore) | `npx jest --testPathPatterns="patristic" --no-coverage` | Wave 0 |
| PAT-02 | Seed script outputs PatristicText docs with valid `source` field containing "ANF" or "NPNF" | unit (seed utility fn) | `npx jest --testPathPatterns="patristic" --no-coverage` | Wave 0 |
| PAT-03 | `searchPatristicTexts` queries by keyword array-contains | unit (mocked Firestore) | `npx jest --testPathPatterns="patristic" --no-coverage` | Wave 0 |
| PAT-04 | `getAuthorTexts` returns texts ordered by sortOrder for known authorSlug | unit (mocked Firestore) | `npx jest --testPathPatterns="patristic" --no-coverage` | Wave 0 |
| PAT-06 | `PatristicReader` renders `font-garamond` class on body text | unit | `npx jest --testPathPatterns="PatristicReader" --no-coverage` | Wave 0 |
| PAT-06 | `PatristicReader` renders `font-cinzel` and `text-gold` on title | unit | `npx jest --testPathPatterns="PatristicReader" --no-coverage` | Wave 0 |
| STD-01 | `getStudyGuides` returns array of StudyGuide documents | unit (mocked Firestore) | `npx jest --testPathPatterns="patristic" --no-coverage` | Wave 0 |
| STD-02 | `StudyGuideViewer` renders a Link for scripture-type items using `item.href` | unit | `npx jest --testPathPatterns="StudyGuide" --no-coverage` | Wave 0 |
| STD-03 | `StudyGuideViewer` renders items in order by `step` number | unit | `npx jest --testPathPatterns="StudyGuide" --no-coverage` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx jest --testPathPatterns="patristic\|fathers\|StudyGuide\|PatristicReader" --no-coverage`
- **Per wave merge:** `npx jest --no-coverage`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/lib/patristic.test.ts` — covers PAT-01 (keyword builder, deterministic textId), PAT-03 (searchPatristicTexts mock), PAT-04 (getAuthorTexts mock), STD-01 (getStudyGuides mock)
- [ ] `tests/components/PatristicReader.test.tsx` — covers PAT-06 (Byzantine aesthetic rendering: font-garamond, font-cinzel, text-gold)
- [ ] `tests/components/StudyGuideViewer.test.tsx` — covers STD-02 (scripture Link href), STD-03 (step ordering)
- [ ] Framework already installed: no new framework needed

---

## Sources

### Primary (HIGH confidence)
- `C:/Users/Owner/Downloads/Claude Projects/Ekklesia_Agora/src/lib/firestore/scripture.ts` — confirmed `buildVerseKeywords`, `getChapter`, `searchVerses` patterns to adapt directly for `patristic.ts`
- `C:/Users/Owner/Downloads/Claude Projects/Ekklesia_Agora/src/lib/types/scripture.ts` — confirmed TypeScript type structure for `PatristicText` / `PatristicAuthor` design
- `C:/Users/Owner/Downloads/Claude Projects/Ekklesia_Agora/scripts/seed-brenton-lxx.ts` — confirmed seed script pattern (dotenv, firebase-admin init, 500-op batch, writeBatches helper)
- `C:/Users/Owner/Downloads/Claude Projects/Ekklesia_Agora/src/components/nav/Navbar.tsx` — confirmed current nav structure; dropdown pattern for "Church Fathers" addition
- `C:/Users/Owner/Downloads/Claude Projects/Ekklesia_Agora/src/lib/constants/categories.ts` — confirmed `ORTHODOX_CATEGORIES` array (10 categories, reuse as `topics[]` on patristic docs)
- `C:/Users/Owner/Downloads/Claude Projects/Ekklesia_Agora/firestore.indexes.json` — confirmed composite index JSON format; Phase 6 indexes follow same structure
- `C:/Users/Owner/Downloads/Claude Projects/Ekklesia_Agora/package.json` — confirmed existing deps (firebase-admin 13.7.0, tsx 4.21.0, dotenv 17.3.1, zod 4.3.6); `fast-xml-parser` NOT yet installed
- `https://ccel.org/ccel/schaff/anf01.html` — confirmed direct XML download URL: `https://ccel.org/ccel/schaff/anf01.xml`; confirmed ThML volume contains 26+ individual works; confirmed URL pattern `ccel.org/ccel/schaff/[volume].xml`
- `https://ccel.org/ccel/schaff/anf01.xml` — confirmed ThML structure: `<ThML>` root, `<div1>`/`<div2>`/`<div3>` nesting, `<p>` text nodes, `<note>` footnotes, `@_n` chapter attributes
- `npm view fast-xml-parser version` → 5.5.6 (verified current)

### Secondary (MEDIUM confidence)
- WebFetch of `https://ccel.org/index/format/ThML` — confirmed ThML XML is available for 300+ CCEL works including ANF/NPNF volumes; URL pattern `/ccel/schaff/[volume].xml` consistent
- WebFetch of `https://www.ccel.org/fathers` — confirmed all ANF (Vols. 1–10) and NPNF Series I (Vols. 1–8) and Series II (Vols. 1–14) are available; individual author/work links accessible
- `npm-compare.com` — comparison of xml2js vs fast-xml-parser: fast-xml-parser preferred for TypeScript-native synchronous parsing

### Tertiary (LOW confidence)
- Exact `<div>` depth structure in NPNF volumes (only ANF Vol. 1 directly inspected) — LOW confidence: planner should include a pre-seed inspection task for NPNF volumes before writing full extraction logic
- CCEL server policies on programmatic download — not documented; assume manual download to `data/ccel-xml/` is the safe approach

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all dependencies are existing project libs; only `fast-xml-parser` is new (verified v5.5.6, MIT, no C++ deps)
- Architecture: HIGH — flat Firestore collection pattern proven across Phases 2–5; keyword search pattern proven; Server Component pattern proven
- CCEL XML sourcing: MEDIUM-HIGH — URL pattern and ThML structure confirmed for ANF Vol. 1; NPNF structure requires inspection before seed script
- Data model: HIGH — `PatristicText`, `PatristicAuthor`, `StudyGuide` types mirror Phase 5 patterns with straightforward additions
- Pitfalls: HIGH for Firestore index, idempotency, ThML footnote pollution (all preventable by following Phase 5 lessons); MEDIUM for CCEL volume structure variation (unknown until XML files inspected)

**Research date:** 2026-03-19
**Valid until:** 2026-09-19 (CCEL public domain status is permanent; npm package versions stable; Firestore patterns stable)
