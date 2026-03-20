---
phase: 7
slug: discovery-messaging
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-19
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 30 + jest-environment-jsdom |
| **Config file** | `jest.config.ts` (root) |
| **Quick run command** | `npx jest --testPathPatterns=tests/lib/search tests/lib/messages` |
| **Full suite command** | `npx jest` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --testPathPatterns=tests/lib/search tests/lib/messages`
- **After every plan wave:** Run `npx jest`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 07-01-01 | 01 | 0 | SRCH-01 | unit | `npx jest --testPathPatterns=tests/lib/search` | ❌ W0 | ⬜ pending |
| 07-01-02 | 01 | 0 | MSG-01 | unit | `npx jest --testPathPatterns=tests/lib/messages` | ❌ W0 | ⬜ pending |
| 07-01-03 | 01 | 1 | SRCH-01 | unit | `npx jest --testPathPatterns=tests/lib/search` | ✅ W0 | ⬜ pending |
| 07-01-04 | 01 | 1 | SRCH-02 | manual | Navigate `/search?q=grace&tab=scripture` | manual-only | ⬜ pending |
| 07-02-01 | 02 | 0 | MSG-01 | unit | `npx jest --testPathPatterns=tests/lib/messages` | ❌ W0 | ⬜ pending |
| 07-02-02 | 02 | 1 | MSG-01 | unit | `npx jest --testPathPatterns=tests/lib/messages` | ✅ W0 | ⬜ pending |
| 07-02-03 | 02 | 1 | MSG-02 | manual | Open `/messages` as test user | manual-only | ⬜ pending |
| 07-02-04 | 02 | 1 | MSG-03 | manual | Open `/messages/[id]` with 3+ messages | manual-only | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/lib/search.test.ts` — unit tests for `globalSearch()` covering SRCH-01 (aggregation across all 5 types, empty query guard)
- [ ] `tests/lib/messages.test.ts` — unit tests covering MSG-01 (`sendMessage()`, `createOrGetConversation()` idempotency, `getConversationId()` determinism)

*Firebase admin mocked via `jest.mock()` hoisting + `require()` pattern established in Phase 3 for `tests/lib/videos.test.ts`*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Tab state renders correct result subset | SRCH-02 | Requires real browser tab navigation and Firestore data | Navigate `/search?q=grace&tab=scripture`, verify only Scripture results shown |
| Conversation list renders with last message preview | MSG-02 | Requires real Firestore data and UI rendering | Open `/messages` as test user, verify name + preview + timestamp visible |
| Messages ordered chronological asc in thread | MSG-03 | Requires real Firestore onSnapshot and ordering | Open `/messages/[id]` with 3+ messages, verify oldest message at top |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
