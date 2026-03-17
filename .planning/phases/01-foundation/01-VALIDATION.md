---
phase: 1
slug: foundation
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-16
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 29 + React Testing Library 16 |
| **Config file** | `jest.config.ts` — Wave 0 (Plan 01-01 Task 0) |
| **Quick run command** | `npx jest --testPathPattern="auth\|roles\|theme" --passWithNoTests` |
| **Full suite command** | `npx jest --coverage` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --testPathPattern="(auth|roles|claims)" --passWithNoTests`
- **After every plan wave:** Run `npx jest --coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-00 | 01 | 0 | ALL | infra | `npx jest --passWithNoTests` | Plan 01-01 Task 0 | ⬜ pending |
| 1-01-01 | 01 | 1 | DES-01 | snapshot | `npx jest tests/ui/theme.test.ts -x` | Plan 01-01 Task 0 | ⬜ pending |
| 1-01-02 | 01 | 1 | DES-02 | unit (RTL) | `npx jest tests/components/nav.test.tsx -x` | Plan 01-01 Task 0 | ⬜ pending |
| 1-01-03 | 01 | 1 | AUTH-05 | unit | `npx jest tests/middleware/public-routes.test.ts -x` | Plan 01-01 Task 0 | ⬜ pending |
| 1-02-01 | 02 | 2 | AUTH-01 | unit | `npx jest tests/auth/register.test.ts -x` | Plan 01-01 Task 0 | ⬜ pending |
| 1-02-02 | 02 | 2 | AUTH-02 | unit | `npx jest tests/auth/session.test.ts -x` | Plan 01-01 Task 0 | ⬜ pending |
| 1-02-03 | 02 | 2 | AUTH-03 | unit (mocked) | `npx jest tests/auth/reset.test.ts -x` | Plan 01-01 Task 0 | ⬜ pending |
| 1-02-04 | 02 | 2 | AUTH-04 | unit | `npx jest tests/auth/logout.test.ts -x` | Plan 01-01 Task 0 | ⬜ pending |
| 1-03-01 | 03 | 3 | AUTH-06 | unit (Admin SDK mocked) | `npx jest tests/auth/claims.test.ts -x` | Plan 01-01 Task 0 | ⬜ pending |
| 1-03-02 | 03 | 3 | AUTH-07 | unit | `npx jest tests/auth/claims.test.ts -x` | Plan 01-01 Task 0 | ⬜ pending |
| 1-03-03 | 03 | 3 | AUTH-08 | unit | `npx jest tests/auth/roles.test.ts -x` | Plan 01-01 Task 0 | ⬜ pending |
| 1-01-04 | 01 | 1 | DES-03 | lint/static | manual review | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

All Wave 0 items are addressed by **Plan 01-01, Task 0**:

- [x] `jest.config.ts` — base Jest configuration with jsdom environment and path aliases
- [x] `jest.setup.ts` — jest-dom matchers
- [x] `tests/auth/register.test.ts` — covers AUTH-01 (stubs, filled in Plan 02)
- [x] `tests/auth/session.test.ts` — covers AUTH-02 (stubs, filled in Plan 02)
- [x] `tests/auth/reset.test.ts` — covers AUTH-03 (stubs, filled in Plan 02)
- [x] `tests/auth/logout.test.ts` — covers AUTH-04 (stubs, filled in Plan 02)
- [x] `tests/middleware/public-routes.test.ts` — covers AUTH-05 (stubs, filled in Plan 02 or stays stub)
- [x] `tests/auth/claims.test.ts` — covers AUTH-06, AUTH-07 (stubs, filled in Plan 03)
- [x] `tests/auth/roles.test.ts` — covers AUTH-08 (stubs, filled in Plan 03)
- [x] `tests/ui/theme.test.ts` — covers DES-01 (stubs, filled alongside theme implementation)
- [x] `tests/components/nav.test.tsx` — covers DES-02 (stubs, filled alongside nav implementation)
- [x] Framework install: included in Plan 01-01 Task 1 npm install

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Auth logic in `/lib` with no Next.js-specific imports | DES-03 | Architecture constraint — best verified by code review | Review `/lib` directory: no imports from `next/` in auth utilities |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify with targeted Jest commands
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (Plan 01-01 Task 0)
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending execution
