# Phase 6: Patristic Library + Study Guides - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Church Fathers texts (sourced from CCEL's public domain ANF/NPNF XML corpus) stored in Firestore as structured documents, searchable by keyword/author/topic, browsable via author pages with topic filtering, and rendered in the Byzantine UI aesthetic. Study guides are curated numbered reading sequences organized by topic, referencing both the Patristic Library and the Scripture Library. The Patristic data ingest, library UI, and study guides ship together in this phase.

Video upload/playback, social features, Scripture data, and global search are out of scope — handled by prior and future phases.

</domain>

<decisions>
## Implementation Decisions

### Text Segmentation & Data Model
- Each Firestore document = one complete short work **or** one chapter/homily from a longer work
- Short standalone works (letters, short treatises, individual homilies) are stored as a single document
- Large works (multi-volume treatises, long homily series) are split by their natural chapter or homily boundaries — each chapter becomes its own document
- Collection name: `patristic_texts` (mirrors `scripture_verses` pattern)
- `searchKeywords` array built from: title + author name + topic tags + up to ~100 significant content words extracted from the text body. NOT full-text tokenization of the entire body (too large for Firestore array indexes)

### Author & Work Selection
- Seed target: **at least 20 individual text documents** (not 20 distinct Fathers — a single Father can contribute multiple works/chapters)
- **Source: CCEL** (ccel.org) — ANF/NPNF series structured XML (ThML/TEI format), Philip Schaff edition (pre-1928, public domain)
- Era coverage: **balanced across eras** — include a sampling from Apostolic Fathers (Ignatius, Clement), Ante-Nicene (Justin Martyr, Irenaeus), Nicene (Athanasius, Basil, Gregory of Nazianzus, Chrysostom), and Post-Nicene (Cyril of Alexandria, John of Damascus)
- Researcher/planner select specific works based on CCEL XML availability and quality

### Browse & Navigation Model
- **`/fathers` landing page**: Author-first — grid/list of Church Father author cards (name, era, brief description) with a topic filter sidebar to narrow by category
- **Author pages** (`/fathers/[slug]`): Short bio (era, feast day, key contribution) + ordered list of their seeded works/chapters. Clicking a work opens the full-text reader
- **Topic categories**: Reuse the existing Phase 2 Orthodox content categories (Holy Fathers, Holy Scripture, Holy Trinity, Spiritual Life, Liturgy, Church History, Apologetics, Iconography, Feast/Fast Days, Chanting & Music) as `topics[]` tags on each patristic text document. No new taxonomy
- Search (`/fathers/search`): `searchKeywords` array-contains query, results list showing matching works with author + topic context

### Study Guide Design
- **Format**: Numbered reading list — a titled guide with an ordered sequence of items. Each item: step number, title, short description (what to read and why), and a link to either a `patristic_texts` doc or a `/scripture/[book]/[chapter]#verse-N` deep link
- **Navigation**: Study guides live under `/fathers/guides` — accessible via a 'Church Fathers' nav dropdown with 'Browse Fathers' and 'Study Guides' sub-links
- **Initial seed guides** (3-5 topics): Introduction to Orthodoxy, Holy Scripture & Tradition, Prayer & Theosis, The Divine Liturgy
- Firestore collection: `study_guides` — each document has title, description, topic tag, and an ordered `items[]` array (each item: type, refId/href, title, description)

### Claude's Discretion
- Exact CCEL XML parsing strategy and which specific works/chapters to seed (within era balance and 20+ count constraints)
- Text reader page layout for patristic works (can mirror Scripture reader pattern)
- Loading skeleton and empty state designs
- Author card layout details on the landing page
- Which specific passages to extract for the 100-word `searchKeywords` sample

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase requirements
- `.planning/ROADMAP.md` §"Phase 6: Patristic Library + Study Guides" — phase goal, dependencies, PAT-01–06 + STD-01–03 requirement list, plan breakdown (06-01, 06-02, 06-03)
- `.planning/REQUIREMENTS.md` §"Patristic Library (Info Center)" — PAT-01–06 acceptance criteria
- `.planning/REQUIREMENTS.md` §"Study Guides" — STD-01–03 acceptance criteria

### Patterns to mirror from Phase 5 (Scripture Library)
- `.planning/phases/05-scripture-library/05-CONTEXT.md` — decisions and code context for the Scripture Library; Phase 6 mirrors this architecture closely
- `.planning/phases/05-scripture-library/05-RESEARCH.md` — Firestore data model patterns, seed script patterns, composite index requirements, batch write patterns

### External source
- `https://ccel.org` — CCEL ANF/NPNF XML corpus (ThML/TEI format); researcher should identify which works are available as structured XML vs. plain text

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/firestore/scripture.ts` — `buildVerseKeywords()`, `searchVerses()`, `getChapter()` patterns to adapt for `buildPatristicKeywords()`, `searchPatristicTexts()`, `getPatristicText()`
- `src/lib/types/scripture.ts` — `ScriptureVerse`/`ScriptureBook` types to use as structural template for `PatristicText`/`PatristicAuthor` types
- `src/components/scripture/ScriptureReader.tsx` — full-text reader component pattern to adapt for patristic text reader
- `src/components/scripture/ScriptureSearch.tsx` — search results component pattern to adapt
- `src/components/scripture/ScriptureSkeleton.tsx` — skeleton loading pattern to reuse/adapt
- `scripts/seed-brenton-lxx.ts` + `scripts/seed-eob-nt.ts` — seed script patterns (Admin SDK, batch writes, dotenv) to follow for `seed-patristic.ts`
- `src/components/ui/` — existing Byzantine UI primitives (cards, inputs, buttons) — use before building new components
- `src/components/nav/` — existing navbar to add 'Church Fathers' link with dropdown

### Established Patterns
- **Server Component + Client Component split**: Server Component fetches via Admin SDK, passes as props to Client Component — see `src/app/(main)/calendar/page.tsx` and `src/app/(main)/scripture/` for exact templates
- **`(main)` route group**: new routes at `src/app/(main)/fathers/`, `src/app/(main)/fathers/[slug]/`, `src/app/(main)/fathers/search/`, `src/app/(main)/fathers/guides/`, `src/app/(main)/fathers/guides/[slug]/`
- **Tailwind v4 Byzantine tokens**: `text-gold`, `bg-navy`, `bg-navy-mid`, `font-cinzel`, `font-garamond`, `border-gold/[0.15]` — no new color values or CSS tokens
- **500-op Firestore batch chunks** for bulk seed writes — established pattern across Phases 2, 3, 5
- **`getAdminFirestore()`** from `src/lib/firebase/admin` — use for all seed scripts and Server Components
- **Phase 2 Orthodox content categories** (`src/lib/types/social.ts` or equivalent constants file) — import and reuse as `topics[]` values on patristic text documents

### Integration Points
- **Navbar** (`src/components/nav/`): add 'Church Fathers' link with dropdown: 'Browse Fathers' → `/fathers`, 'Study Guides' → `/fathers/guides`
- **Scripture Library** (`/scripture/[book]/[chapter]`): study guide items link directly into existing Scripture reader via deep links (`/scripture/[book]/[chapter]#verse-N`) — no changes to Scripture Library needed
- **CAL-07 pattern** (ReadingRef activation from Phase 5): model for how patristic study guide items can reference both Scripture deep links and patristic text docs
- **Global search** (Phase 7): build `searchPatristicTexts()` in `src/lib/firestore/patristic.ts` with a clean API that Phase 7 can call without modification

</code_context>

<specifics>
## Specific Ideas

No specific UI references provided — open to standard approaches within the established Byzantine aesthetic, mirroring the Scripture Library reader and calendar page patterns.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within Phase 6 scope.

</deferred>

---

*Phase: 06-patristic-library-study-guides*
*Context gathered: 2026-03-19*
