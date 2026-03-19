---
phase: 5
slug: scripture-library
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-03-19
updated: 2026-03-19
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 30 (project standard) |
| **Config file** | jest.config.ts (project root) |
| **Quick run command** | `npx jest --testPathPatterns="scripture" --no-coverage` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --testPathPatterns="scripture" --no-coverage`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Test File | Status |
|---------|------|------|-------------|-----------|-------------------|-----------|--------|
| 05-01 T1 | 01 | 1 | LIB-01, LIB-02, LIB-04, LIB-06 | unit | `npx jest --testPathPatterns="scripture" --no-coverage` | tests/lib/scripture.test.ts, tests/components/Scripture*.test.tsx, tests/components/BookNavigator.test.tsx | ⬜ pending |
| 05-01 T2 | 01 | 1 | LIB-01 | syntax | `npx tsc --noEmit scripts/seed-brenton-lxx.ts; npx tsc --noEmit scripts/seed-eob-nt.ts` | (no test file — seed scripts verified by type-check) | ⬜ pending |
| 05-02 T1 | 02 | 2 | LIB-04, LIB-05 | unit | `npx jest --testPathPatterns="scripture\|BookNavigator" --no-coverage` | tests/components/ScriptureReader.test.tsx, tests/components/BookNavigator.test.tsx | ⬜ pending |
| 05-02 T2 | 02 | 2 | LIB-04, LIB-05 | unit | `npx jest --testPathPatterns="scripture\|BookNavigator" --no-coverage` | tests/components/ScriptureSearch.test.tsx, tests/components/ScriptureReader.test.tsx | ⬜ pending |
| 05-02 T3 | 02 | 2 | LIB-03, LIB-06 | unit | `npx jest --testPathPatterns="ReadingRef\|ScriptureSearch\|BookNavigator\|ScriptureReader" --no-coverage` | tests/components/ReadingRef.test.tsx, tests/components/ScriptureSearch.test.tsx, tests/components/BookNavigator.test.tsx, tests/components/ScriptureReader.test.tsx | ⬜ pending |

*Status: ⬜ pending / ✅ green / ❌ red / ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/lib/scripture.test.ts` — unit tests for buildVerseKeywords, getChapter, searchVerses, getBooks, getBookMeta (created in 05-01 Task 1)
- [ ] `tests/components/ScriptureReader.test.tsx` — stub with todo for font-garamond rendering assertion (created in 05-01 Task 1, filled in 05-02 Task 3)
- [ ] `tests/components/ScriptureSearch.test.tsx` — stub with todo for parseReference and search input (created in 05-01 Task 1, filled in 05-02 Task 3)
- [ ] `tests/components/BookNavigator.test.tsx` — stub with todo for Navigate button and optgroup rendering (created in 05-01 Task 1, filled in 05-02 Task 3)
- [ ] `tests/components/ReadingRef.test.tsx` — already exists from Phase 4; updated in 05-02 Task 3

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| EOB NT PDF parsing quality | LIB-01 | Requires visual inspection of parsed verse text | Parse 5 sample chapters, compare against known text |
| Byzantine aesthetic rendering | LIB-03 | Visual regression not automated | Open reader in browser, verify EB Garamond/Cinzel/navy/gold |
| USFM deuterocanonical book ordering | LIB-01 | File inspection needed | Unzip Brenton USFM, verify all 49 LXX book codes |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
