# Phase 5: Scripture Library - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Full Orthodox canon of Scripture — Brenton's English Septuagint (OT, 49 books) and Eastern Orthodox Bible NT (Patriarchal Text, 27 books) — stored in Firestore as structured verse documents, searchable by keyword or reference, navigable by book/chapter/verse, rendered in the Byzantine UI aesthetic. The data architecture must support future multilingual translations without schema changes.

CAL-07 activation is included: the disabled `ReadingRef` stubs from Phase 4 become live links to `/scripture/[book]/[chapter]#verse-[verseStart]`.

</domain>

<decisions>
## Implementation Decisions

### Reader Layout
- Verse numbers as **superscript inline** with text — printed-Bible style, natural for continuous reading
- Reading column is **narrow prose width (~65ch), centered** on page — optimal readability
- **Prev/Next chapter navigation at the bottom** of the text — read to the end, then advance (book-like flow)
- Book/chapter selector is **collapsed** — a single "Navigate" button opens a dropdown panel with book+chapter pickers. Not always-visible. Cleaner, more immersive reading experience.
- **Subtle testament label** near the book title: "Old Testament — Brenton LXX" or "New Testament — Eastern Orthodox Bible". Same reader styling otherwise — no color differences between OT and NT.

### Book List & Landing Page (`/scripture`)
- **OT then NT in canonical order**: Section 1 — "Old Testament — Brenton Septuagint" (49 books, LXX canonical order including Deuterocanonicals); Section 2 — "New Testament — Eastern Orthodox Bible" (27 books)
- Each book entry: **book name (Cinzel, gold) + chapter count** below in small text. Card or row layout.
- **Search bar on the landing page** — keyword/reference search at the top of `/scripture`, not requiring navigation to a chapter first. Most useful entry point.

### Search Behavior
- Results **grouped by book** (e.g., "Genesis (3)", "John (7)") — easy to scan which books contain the word. Clicking a result opens the chapter page with the verse highlighted.
- Each result shows **verse text only** (matching verse, keyword highlighted). No surrounding context shown inline — user clicks through to the chapter reader for context.
- Reference detection: if input matches the pattern `Book chapter:verse` (e.g., "John 3:16"), **navigate directly** to `/scripture/john/3#verse-16` — no search results page.

### EOB NT Data Sourcing
- **Attempt PDF parse first** (PDF available on Internet Archive, license confirmed for non-commercial Orthodox use). Include validation step against known NT verse counts per book. If PDF quality is unacceptable after parsing attempt, contact EOB editor at `eobeditor@easternorthodoxbible.org` for structured data.
- Credit the EOB translation in the reader UI (small attribution line).

### Claude's Discretion
- Exact verse highlight animation/style when navigating to a specific verse via anchor
- Loading skeleton design for the chapter reader
- Empty state for search with no results
- Navigation dropdown animation/styling
- How to handle USFM edge cases (poetry markers, section headers) in verse text extraction

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase requirements
- `.planning/ROADMAP.md` §"Phase 5: Scripture Library" — phase goal, dependencies, LIB-01–06 requirement list, suggested plan breakdown
- `.planning/REQUIREMENTS.md` §"Scripture Library" — LIB-01–06 acceptance criteria including multilingual architecture requirement

### Research (data architecture, sourcing, pitfalls)
- `.planning/phases/05-scripture-library/05-RESEARCH.md` — complete: Firestore data model (`scripture_verses` flat collection, `ScriptureVerse` type), seed script patterns (Brenton USFM workflow, EOB NT PDF workflow), composite index requirements, all 7 pitfalls, code examples for every pattern

### Existing patterns to mirror
- `src/app/(main)/calendar/page.tsx` — Server Component + `searchParams` + Client Component props pattern to replicate for chapter reader
- `src/lib/firestore/synodeia.ts` — Admin SDK query pattern (`getAdminFirestore()`, compound where clauses)
- `src/lib/firestore/videos.ts` — `buildVideoSearchKeywords` pattern to adapt for verse keyword building
- `scripts/seed-super-admin.ts` — Firebase Admin SDK seed script pattern (dotenv, initializeApp, batch writes)
- `src/components/calendar/ReadingRef.tsx` — existing stub to activate in Phase 5 (convert disabled span to active Link)

### Validation
- `.planning/phases/05-scripture-library/05-VALIDATION.md` — Nyquist test map: Wave 0 stubs required (tests/lib/scripture.test.ts, tests/components/ScriptureReader.test.tsx, tests/components/ScriptureSearch.test.tsx, tests/components/BookNavigator.test.tsx); ReadingRef.test.tsx already exists from Phase 4

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/` — existing UI primitives (buttons, cards, inputs) in Byzantine aesthetic; use before building new
- `src/components/calendar/ReadingRef.tsx` — Phase 4 stub to activate; already typed with `ReadingRef` interface from `@/lib/types/calendar`
- `src/components/nav/` — existing navbar; add `/scripture` link here
- `firestore.indexes.json` — existing composite index file; Phase 5 adds two new indexes (translationId+bookAbbrev+chapter+verse, translationId+searchKeywords array-contains)

### Established Patterns
- **Server Component + Client Component split**: Server Component fetches Firestore data via Admin SDK, passes as props to Client Component. Calendar page (`src/app/(main)/calendar/page.tsx`) is the exact template.
- **Tailwind v4 Byzantine tokens**: `text-gold`, `bg-navy`, `bg-navy-mid`, `font-cinzel`, `font-garamond`, `border-gold/[0.15]` — no new color values, no new CSS tokens
- **`(main)` route group**: new routes at `src/app/(main)/scripture/`, `src/app/(main)/scripture/[book]/[chapter]/`
- **Server Actions for writes** — no writes in Phase 5 (read-only); seed scripts use Admin SDK directly
- **500-op batch chunks** for Firestore bulk writes — established in Phase 2 fan-out, Phase 3 video seeding
- **Jest 30 flag**: `--testPathPatterns` (plural) — verified project-wide pattern

### Integration Points
- **Navbar** (`src/components/nav/`): add "Scripture" link alongside Calendar and Synodeia
- **`ReadingRef.tsx`** (Phase 4 calendar component): activate — replace disabled `<span>` with `<Link href="/scripture/[book]/[chapter]#verse-[n]">`
- **Global search** (Phase 7): scripture search will be incorporated into the Phase 7 global search — build `searchVerses()` in `src/lib/firestore/scripture.ts` with a clean API that Phase 7 can call without modification

</code_context>

<specifics>
## Specific Ideas

No specific UI references provided — open to standard approaches within the established Byzantine aesthetic and calendar page pattern.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within Phase 5 scope.

</deferred>

---

*Phase: 05-scripture-library*
*Context gathered: 2026-03-19*
