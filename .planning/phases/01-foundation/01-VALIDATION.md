---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-16
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 29 + React Testing Library 16 |
| **Config file** | `jest.config.ts` — Wave 0 (does not exist yet) |
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
| 1-01-01 | 01 | 1 | AUTH-01 | unit | `npx jest tests/auth/register.test.ts -x` | ❌ W0 | ⬜ pending |
| 1-01-02 | 01 | 1 | AUTH-02 | unit | `npx jest tests/auth/session.test.ts -x` | ❌ W0 | ⬜ pending |
| 1-01-03 | 01 | 1 | AUTH-03 | unit (mocked) | `npx jest tests/auth/reset.test.ts -x` | ❌ W0 | ⬜ pending |
| 1-01-04 | 01 | 1 | AUTH-04 | unit | `npx jest tests/auth/logout.test.ts -x` | ❌ W0 | ⬜ pending |
| 1-01-05 | 01 | 1 | AUTH-05 | unit | `npx jest tests/middleware/public-routes.test.ts -x` | ❌ W0 | ⬜ pending |
| 1-01-06 | 01 | 1 | AUTH-06 | unit (Admin SDK mocked) | `npx jest tests/auth/claims.test.ts -x` | ❌ W0 | ⬜ pending |
| 1-01-07 | 01 | 1 | AUTH-07 | unit | `npx jest tests/auth/claims.test.ts -x` | ❌ W0 | ⬜ pending |
| 1-01-08 | 01 | 1 | AUTH-08 | unit | `npx jest tests/auth/roles.test.ts -x` | ❌ W0 | ⬜ pending |
| 1-01-09 | 01 | 1 | DES-01 | snapshot | `npx jest tests/ui/theme.test.ts -x` | ❌ W0 | ⬜ pending |
| 1-01-10 | 01 | 1 | DES-02 | unit (RTL) | `npx jest tests/components/nav.test.tsx -x` | ❌ W0 | ⬜ pending |
| 1-01-11 | 01 | 1 | DES-03 | lint/static | manual review | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `jest.config.ts` — base Jest configuration with jsdom environment and path aliases
- [ ] `jest.setup.ts` — jest-dom matchers
- [ ] `tests/auth/register.test.ts` — covers AUTH-01
- [ ] `tests/auth/session.test.ts` — covers AUTH-02
- [ ] `tests/auth/reset.test.ts` — covers AUTH-03
- [ ] `tests/auth/logout.test.ts` — covers AUTH-04
- [ ] `tests/middleware/public-routes.test.ts` — covers AUTH-05
- [ ] `tests/auth/claims.test.ts` — covers AUTH-06, AUTH-07
- [ ] `tests/auth/roles.test.ts` — covers AUTH-08
- [ ] `tests/ui/theme.test.ts` — covers DES-01
- [ ] `tests/components/nav.test.tsx` — covers DES-02
- [ ] Framework install: `npm install --save-dev jest @types/jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Auth logic in `/lib` with no Next.js-specific imports | DES-03 | Architecture constraint — best verified by code review | Review `/lib` directory: no imports from `next/` in auth utilities |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
