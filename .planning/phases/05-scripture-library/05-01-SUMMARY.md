---
phase: 05-scripture-library
plan: "01"
subsystem: scripture-data-layer
tags: [firestore, types, seed-scripts, tdd, search-keywords, usfm]
dependency_graph:
  requires: []
  provides:
    - ScriptureVerse type (src/lib/types/scripture.ts)
    - ScriptureBook type (src/lib/types/scripture.ts)
    - TRANSLATIONS constant (src/lib/types/scripture.ts)
    - BOOK_ABBREV_MAP / SLUG_TO_BOOK (src/lib/types/scripture.ts)
    - getChapter, searchVerses, getBooks, getBookMeta, buildVerseKeywords (src/lib/firestore/scripture.ts)
    - scripture_verses composite indexes (firestore.indexes.json)
    - Brenton LXX seed script (scripts/seed-brenton-lxx.ts)
    - EOB NT seed script (scripts/seed-eob-nt.ts)
    - Wave 0 test stubs (tests/lib/ and tests/components/)
  affects:
    - Plan 05-02 (UI builds entirely against these exports)
    - CalendarDayView ReadingRef activation (uses BOOK_ABBREV_MAP for slug resolution)
tech_stack:
  added:
    - usfm-js ^3.4.3 (devDependency — USFM file parsing for Brenton seed)
  patterns:
    - getAdminFirestore() pattern (mirrors videos.ts / synodeia.ts)
    - 500-op batch chunk writes (mirrors Phase 02 fan-out pattern)
    - array-contains keyword search (mirrors buildVideoSearchKeywords)
    - deterministic document IDs (verseId: brenton_genesis_1_1)
key_files:
  created:
    - src/lib/types/scripture.ts
    - src/lib/firestore/scripture.ts
    - firestore.indexes.json (modified — 2 new indexes added)
    - scripts/seed-brenton-lxx.ts
    - scripts/seed-eob-nt.ts
    - tests/lib/scripture.test.ts
    - tests/components/ScriptureReader.test.tsx
    - tests/components/ScriptureSearch.test.tsx
    - tests/components/BookNavigator.test.tsx
  modified:
    - firestore.indexes.json
    - package.json
decisions:
  - "buildVerseKeywords uses >= 3 char filter (not 2 like displayNameKeywords) — verse text has abundant long tokens; exact-word keyword search is sufficient"
  - "EOB NT seed uses pre-parsed JSON input (not PDF-direct) — separates manual PDF extraction from automated Firestore writes"
  - "BOOK_ABBREV_MAP includes 50 OT entries (includes Daniel) and 27 NT — all books present in Brenton LXX plus full NT"
  - "Seed scripts inline buildVerseKeywords rather than importing from src/ — scripts run outside Next.js module resolution"
  - "Wave 0 test stubs use jest.mock() + require() pattern (matching videos.test.ts) to avoid firebase-admin ESM issues"
metrics:
  duration: "~15 minutes"
  completed_date: "2026-03-19"
  tasks_completed: 2
  files_created: 9
  files_modified: 2
---

# Phase 05 Plan 01: Scripture Data Layer Summary

**One-liner:** Scripture Firestore data layer with ScriptureVerse/ScriptureBook types, keyword-search query functions, composite indexes, USFM-based Brenton LXX seed script, JSON-based EOB NT seed script, and Wave 0 test stubs.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Scripture types, Firestore query functions, indexes, Wave 0 test stubs | cd5f2e5 | scripture.ts (types), scripture.ts (firestore), firestore.indexes.json, 4 test files |
| 2 | Brenton LXX and EOB NT seed scripts | b71a4bd | seed-brenton-lxx.ts, seed-eob-nt.ts, package.json |

## What Was Built

### Types (`src/lib/types/scripture.ts`)

- `ScriptureVerse` interface: verseId (deterministic slug), translationId, testament, bookIndex, bookName, bookAbbrev, chapter, verse, text, searchKeywords
- `ScriptureBook` interface: bookId, translationId, bookIndex, bookName, bookAbbrev, testament, chapterCount
- `TRANSLATIONS` constant: `{ BRENTON: 'brenton', EOB_NT: 'eob_nt' }`
- `TranslationId` type alias
- `BOOK_ABBREV_MAP`: 77-entry map (50 OT + 27 NT) from display name to `{ slug, name, testament, index }`
- `SLUG_TO_BOOK`: reverse lookup derived at module init from BOOK_ABBREV_MAP

### Query Functions (`src/lib/firestore/scripture.ts`)

- `buildVerseKeywords(text)`: splits on `[\s\W]+`, filters >= 3 chars, lowercases, deduplicates
- `getChapter(translationId, bookAbbrev, chapter)`: where x3 + orderBy verse asc
- `searchVerses(query, translationId?, limit)`: array-contains keyword + optional translationId filter
- `getBooks(translationId)`: orderBy bookIndex asc
- `getBookMeta(bookAbbrev)`: limit(1) by bookAbbrev, returns null if missing

### Firestore Indexes (`firestore.indexes.json`)

Two new composite indexes added to `scripture_verses`:
1. `translationId ASC + bookAbbrev ASC + chapter ASC + verse ASC` — supports getChapter
2. `translationId ASC + searchKeywords CONTAINS` — supports searchVerses with translationId filter

### Seed Scripts

- `scripts/seed-brenton-lxx.ts`: USFM directory parsing via usfm-js, 50-book USFM_TO_SLUG mapping, text extraction from `verseObjects[type=text]`, 500-op batch writes, skips unrecognized book codes
- `scripts/seed-eob-nt.ts`: JSON input validation, 27-book NT_BOOK_MAP with expected verse counts, per-book count comparison table, 500-op batch writes
- npm scripts: `seed:brenton` and `seed:eob-nt`

### Test Stubs

- `tests/lib/scripture.test.ts`: 11 passing tests (buildVerseKeywords: 3, getChapter: 1, searchVerses: 3, getBooks: 1, getBookMeta: 2), firebase-admin mocked with jest.mock() hoisting
- `tests/components/ScriptureReader.test.tsx`: LIB-03 stub (font-garamond traceability) + 1 todo
- `tests/components/ScriptureSearch.test.tsx`: 2 todos for Plan 05-02
- `tests/components/BookNavigator.test.tsx`: 2 todos for Plan 05-02

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] TypeScript mock return type mismatch in scripture.test.ts**
- **Found during:** Task 1 verification (`npx tsc --noEmit`)
- **Issue:** `mockOrderBy.mockReturnValue({ get: mockGet })` was missing `limit` and `orderBy` properties required by inferred mock return type
- **Fix:** Added `limit: mockLimit, orderBy: mockOrderBy` to all `mockReturnValue` calls
- **Files modified:** tests/lib/scripture.test.ts
- **Commit:** cd5f2e5 (fixed in same task commit)

## Self-Check: PASSED

Files verified:
- src/lib/types/scripture.ts: FOUND
- src/lib/firestore/scripture.ts: FOUND
- firestore.indexes.json: modified with scripture_verses indexes
- scripts/seed-brenton-lxx.ts: FOUND
- scripts/seed-eob-nt.ts: FOUND
- tests/lib/scripture.test.ts: FOUND (11 tests passing)
- tests/components/ScriptureReader.test.tsx: FOUND (font-garamond stub present)
- tests/components/ScriptureSearch.test.tsx: FOUND
- tests/components/BookNavigator.test.tsx: FOUND

Commits verified:
- cd5f2e5: FOUND (Task 1)
- b71a4bd: FOUND (Task 2)
