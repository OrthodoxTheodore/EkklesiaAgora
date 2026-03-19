---
phase: 6
slug: patristic-library-study-guides
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-19
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 30 + jsdom + @testing-library/react |
| **Config file** | `jest.config.ts` (root) — matches `tests/**/*.test.{ts,tsx}` |
| **Quick run command** | `npx jest --testPathPatterns="patristic\|fathers\|StudyGuide\|PatristicReader" --no-coverage` |
| **Full suite command** | `npx jest --no-coverage` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --testPathPatterns="patristic\|fathers\|StudyGuide\|PatristicReader" --no-coverage`
- **After every plan wave:** Run `npx jest --no-coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 6-00-01 | 00 | 0 | PAT-01 | unit stub | `npx jest --testPathPatterns="patristic" --no-coverage` | ❌ W0 | ⬜ pending |
| 6-00-02 | 00 | 0 | PAT-06 | unit stub | `npx jest --testPathPatterns="PatristicReader" --no-coverage` | ❌ W0 | ⬜ pending |
| 6-00-03 | 00 | 0 | STD-02,STD-03 | unit stub | `npx jest --testPathPatterns="StudyGuide" --no-coverage` | ❌ W0 | ⬜ pending |
| 6-01-01 | 01 | 1 | PAT-01,PAT-02 | unit | `npx jest --testPathPatterns="patristic" --no-coverage` | ❌ W0 | ⬜ pending |
| 6-01-02 | 01 | 1 | PAT-03,PAT-04 | unit | `npx jest --testPathPatterns="patristic" --no-coverage` | ❌ W0 | ⬜ pending |
| 6-01-03 | 01 | 1 | PAT-02 | manual | seed script runs without error | n/a | ⬜ pending |
| 6-02-01 | 02 | 2 | PAT-04,PAT-06 | unit | `npx jest --testPathPatterns="PatristicReader" --no-coverage` | ❌ W0 | ⬜ pending |
| 6-02-02 | 02 | 2 | PAT-03,PAT-06 | unit | `npx jest --testPathPatterns="patristic\|PatristicReader" --no-coverage` | ❌ W0 | ⬜ pending |
| 6-02-03 | 02 | 2 | PAT-05 | manual | browse /fathers and verify topic filter sidebar | n/a | ⬜ pending |
| 6-03-01 | 03 | 3 | STD-01,STD-02,STD-03 | unit | `npx jest --testPathPatterns="StudyGuide" --no-coverage` | ❌ W0 | ⬜ pending |
| 6-03-02 | 03 | 3 | STD-02 | manual | verify Scripture deep links in study guide items open correct chapter | n/a | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/lib/patristic.test.ts` — stubs for PAT-01 (buildPatristicKeywords, deterministic textId), PAT-03 (searchPatristicTexts mock), PAT-04 (getAuthorTexts mock), STD-01 (getStudyGuides mock)
- [ ] `tests/components/PatristicReader.test.tsx` — stubs for PAT-06 (Byzantine aesthetic: font-garamond body, font-cinzel title, text-gold title)
- [ ] `tests/components/StudyGuideViewer.test.tsx` — stubs for STD-02 (scripture Link href), STD-03 (step ordering)

*Framework already installed — no new framework needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Seed script ingests ≥20 texts from CCEL XML | PAT-02 | Requires live Firebase Admin + downloaded XML files | Run `npx tsx scripts/seed-patristic.ts`; verify Firestore `patristic_texts` collection has ≥20 docs in emulator or dev project |
| Author pages display bio + works list correctly | PAT-04,PAT-06 | Visual layout verification | Browse /fathers/chrysostom; confirm bio section and works list render in Byzantine aesthetic |
| Topic filter sidebar narrows author list | PAT-05 | Interactive UI filter | On /fathers, select "Holy Fathers" filter; confirm non-matching authors are hidden |
| Study guide Scripture links open correct verse | STD-02 | Deep link navigation | Click a Scripture item in a study guide; confirm /scripture/[book]/[chapter]#verse-N loads correctly |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
