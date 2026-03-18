---
phase: 2
slug: social-core
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-18
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 30 + React Testing Library 16 |
| **Config file** | `jest.config.ts` — exists from Phase 1 |
| **Quick run command** | `npx jest --testPathPattern="(posts\|profiles\|comments\|follows\|notifications)" --passWithNoTests` |
| **Full suite command** | `npx jest --coverage` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --testPathPattern="(posts|profiles|comments|follows|notifications)" --passWithNoTests`
- **After every plan wave:** Run `npx jest --coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | PROF-01 | unit | `npx jest tests/actions/profile.test.ts -x` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | PROF-02, PROF-03 | unit (RTL) | `npx jest tests/components/JurisdictionDropdown.test.tsx -x` | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 1 | PROF-04 | unit | `npx jest tests/profile/page.test.tsx -x` | ❌ W0 | ⬜ pending |
| 02-01-04 | 01 | 1 | PROF-05 | unit (RTL) | `npx jest tests/profile/edit.test.tsx -x` | ❌ W0 | ⬜ pending |
| 02-01-05 | 01 | 1 | PROF-06 | unit | `npx jest tests/actions/profile.test.ts -x` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 2 | AGRA-01, AGRA-09 | unit | `npx jest tests/actions/posts.test.ts -x` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 2 | AGRA-02, AGRA-03 | unit (RTL) | `npx jest tests/components/PostCard.test.tsx -x` | ❌ W0 | ⬜ pending |
| 02-02-03 | 02 | 2 | AGRA-04 | unit | `npx jest tests/actions/comments.test.ts -x` | ❌ W0 | ⬜ pending |
| 02-02-04 | 02 | 2 | AGRA-05, AGRA-06 | unit (RTL) | `npx jest tests/components/FeedClient.test.tsx -x` | ❌ W0 | ⬜ pending |
| 02-03-01 | 03 | 3 | AGRA-07 | unit (RTL) | `npx jest tests/components/NotificationBell.test.tsx -x` | ❌ W0 | ⬜ pending |
| 02-03-02 | 03 | 3 | AGRA-08 | unit | `npx jest tests/actions/linkPreview.test.ts -x` | ❌ W0 | ⬜ pending |
| 02-03-03 | 03 | 3 | AGRA-10, CAT-01 | unit | `npx jest tests/lib/posts.test.ts -x` | ❌ W0 | ⬜ pending |
| 02-03-04 | 03 | 3 | CAT-02 | unit (RTL) | `npx jest tests/components/CategoryFilterTabs.test.tsx -x` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/actions/posts.test.ts` — stubs for AGRA-01, AGRA-09, CAT-01
- [ ] `tests/actions/comments.test.ts` — stubs for AGRA-04
- [ ] `tests/actions/profile.test.ts` — stubs for PROF-01, PROF-06
- [ ] `tests/actions/linkPreview.test.ts` — stubs for AGRA-08
- [ ] `tests/lib/posts.test.ts` — stubs for AGRA-10
- [ ] `tests/components/PostCard.test.tsx` — stubs for AGRA-02, AGRA-03
- [ ] `tests/components/FeedClient.test.tsx` — stubs for AGRA-05, AGRA-06
- [ ] `tests/components/NotificationBell.test.tsx` — stubs for AGRA-07
- [ ] `tests/components/CategoryFilterTabs.test.tsx` — stubs for CAT-02
- [ ] `tests/components/JurisdictionDropdown.test.tsx` — stubs for PROF-02, PROF-03
- [ ] `tests/profile/page.test.tsx` — stubs for PROF-04
- [ ] `tests/profile/edit.test.tsx` — stubs for PROF-05

*(jest.config.ts and jest.setup.ts exist from Phase 1 — no framework install needed)*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Avatar upload progress indicator | PROF-06 | UI progress feedback requires visual verification | Upload a file and confirm progress bar/spinner appears and resolves |
| Fan-out feed updates for followers | AGRA-01 | Requires multiple authenticated sessions | Sign in as two users; user A follows user B; user B posts; confirm post appears in user A's feed |
| In-app notification delivery | AGRA-07 | Requires real Firestore onSnapshot in browser | Like/comment on a post and verify bell badge increments in real-time |
| Link preview card render | AGRA-08 | OG scraping requires external network in browser | Share a URL with OG tags and verify preview card renders in feed |
| Block user hides content | AGRA-06 | Requires multi-user session | User A blocks user B; verify user B's posts no longer appear in user A's feed |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
