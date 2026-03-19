---
phase: 4
slug: orthodox-identity
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-19
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest / jest (Next.js project) |
| **Config file** | vitest.config.ts or jest.config.ts (confirm in Wave 0) |
| **Quick run command** | `npm run test -- --run` |
| **Full suite command** | `npm run test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run test -- --run`
- **After every plan wave:** Run `npm run test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 4-01-01 | 01 | 1 | CAL-01 | unit | `npm run test -- --run src/lib/calendar` | ❌ W0 | ⬜ pending |
| 4-01-02 | 01 | 1 | CAL-02 | unit | `npm run test -- --run src/lib/calendar` | ❌ W0 | ⬜ pending |
| 4-01-03 | 01 | 1 | CAL-03 | unit | `npm run test -- --run src/lib/calendar` | ❌ W0 | ⬜ pending |
| 4-01-04 | 01 | 1 | CAL-04 | unit | `npm run test -- --run src/lib/calendar` | ❌ W0 | ⬜ pending |
| 4-02-01 | 02 | 2 | CAL-01 | component | `npm run test -- --run src/app` | ❌ W0 | ⬜ pending |
| 4-02-02 | 02 | 2 | CAL-05 | component | `npm run test -- --run src/app` | ❌ W0 | ⬜ pending |
| 4-02-03 | 02 | 2 | CAL-06 | component | `npm run test -- --run src/app` | ❌ W0 | ⬜ pending |
| 4-02-04 | 02 | 2 | CAL-07 | component | `npm run test -- --run src/app` | ❌ W0 | ⬜ pending |
| 4-03-01 | 03 | 2 | SYN-01 | integration | `npm run test -- --run src/app/synodeia` | ❌ W0 | ⬜ pending |
| 4-03-02 | 03 | 2 | SYN-02 | integration | `npm run test -- --run src/app/synodeia` | ❌ W0 | ⬜ pending |
| 4-03-03 | 03 | 2 | SYN-03 | integration | `npm run test -- --run src/app/synodeia` | ❌ W0 | ⬜ pending |
| 4-03-04 | 03 | 2 | SYN-04 | integration | `npm run test -- --run src/app/synodeia` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/calendar/__tests__/orthocal.test.ts` — stubs for CAL-01 through CAL-04 (calendar data layer)
- [ ] `src/app/synodeia/__tests__/synodeia.test.ts` — stubs for SYN-01 through SYN-04 (people finder)
- [ ] `src/app/(calendar)/__tests__/calendar-ui.test.ts` — stubs for CAL-05 through CAL-07 (calendar UI)

*If no test framework detected: install vitest and @testing-library/react*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Old Julian date offset displays correctly (13 days behind civil) | CAL-01 | Requires visual calendar comparison | Toggle to Old Calendar, verify today's feast date shows -13 days from civil |
| Location sharing toggle persists across sessions | SYN-04 | Requires browser session state | Enable location, reload, confirm city visible; disable, reload, confirm hidden |
| Nearby member discovery filters by distance | SYN-04 | Requires geolocation mock or real coordinates | Set city, confirm members in same city appear first |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
