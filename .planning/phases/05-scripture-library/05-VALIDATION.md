---
phase: 5
slug: scripture-library
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-19
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x / vitest (project standard) |
| **Config file** | jest.config.ts or vitest.config.ts (project root) |
| **Quick run command** | `npm test -- --testPathPattern=scripture` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --testPathPattern=scripture`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 0 | LIB-01 | unit | `npm test -- --testPathPattern=scripture` | ❌ W0 | ⬜ pending |
| 05-01-02 | 01 | 1 | LIB-01 | integration | `npm test -- --testPathPattern=scripture-ingestion` | ❌ W0 | ⬜ pending |
| 05-01-03 | 01 | 1 | LIB-02 | unit | `npm test -- --testPathPattern=scripture-types` | ❌ W0 | ⬜ pending |
| 05-01-04 | 01 | 2 | LIB-03 | integration | `npm test -- --testPathPattern=scripture-search` | ❌ W0 | ⬜ pending |
| 05-02-01 | 02 | 1 | LIB-04 | unit | `npm test -- --testPathPattern=scripture-reader` | ❌ W0 | ⬜ pending |
| 05-02-02 | 02 | 1 | LIB-05 | unit | `npm test -- --testPathPattern=scripture-nav` | ❌ W0 | ⬜ pending |
| 05-02-03 | 02 | 2 | LIB-06 | e2e | `npm test -- --testPathPattern=scripture-cal` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `__tests__/scripture/scripture-ingestion.test.ts` — stubs for LIB-01 (data ingestion structure)
- [ ] `__tests__/scripture/scripture-types.test.ts` — stubs for LIB-02 (type validation)
- [ ] `__tests__/scripture/scripture-search.test.ts` — stubs for LIB-03 (search functionality)
- [ ] `__tests__/scripture/scripture-reader.test.ts` — stubs for LIB-04 (reader UI)
- [ ] `__tests__/scripture/scripture-nav.test.ts` — stubs for LIB-05 (navigation)
- [ ] `__tests__/scripture/scripture-cal.test.ts` — stubs for LIB-06 (CAL-07 integration)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| EOB NT PDF parsing quality | LIB-01 | Requires visual inspection of parsed verse text | Parse 5 sample chapters, compare against known text |
| Byzantine aesthetic rendering | LIB-04 | Visual regression not automated | Open reader in browser, verify EB Garamond/Cinzel/navy/gold |
| USFM deuterocanonical book ordering | LIB-01 | File inspection needed | Unzip Brenton USFM, verify all 49 LXX book codes |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
