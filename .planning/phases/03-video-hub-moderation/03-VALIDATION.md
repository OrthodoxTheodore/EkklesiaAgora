---
phase: 3
slug: video-hub-moderation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-18
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 30 + jest-environment-jsdom |
| **Config file** | `jest.config.ts` (root) |
| **Quick run command** | `npx jest --testPathPatterns tests/actions/videos tests/actions/channels tests/actions/videoComments` |
| **Full suite command** | `npx jest` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --testPathPatterns tests/actions/videos tests/actions/channels tests/actions/videoComments`
- **After every plan wave:** Run `npx jest`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | CHAN-01 | unit | `npx jest --testPathPatterns tests/actions/channels` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | CHAN-03 | unit | `npx jest --testPathPatterns tests/actions/channels` | ❌ W0 | ⬜ pending |
| 03-01-03 | 01 | 1 | VID-08 | unit | `npx jest --testPathPatterns tests/actions/channels` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 2 | VID-01, VID-12, VID-13 | unit | `npx jest --testPathPatterns tests/actions/videos` | ❌ W0 | ⬜ pending |
| 03-02-02 | 02 | 2 | VID-09 | component | `npx jest --testPathPatterns tests/components/VideoUploadForm` | ❌ W0 | ⬜ pending |
| 03-03-01 | 03 | 2 | VID-02 | component | `npx jest --testPathPatterns tests/components/VideoPlayer` | ❌ W0 | ⬜ pending |
| 03-03-02 | 03 | 2 | VID-04 | unit | `npx jest --testPathPatterns tests/actions/videos` | ❌ W0 | ⬜ pending |
| 03-03-03 | 03 | 2 | VID-05 | unit | `npx jest --testPathPatterns tests/actions/videoComments` | ❌ W0 | ⬜ pending |
| 03-03-04 | 03 | 2 | VID-07 | unit | `npx jest --testPathPatterns tests/actions/videos` | ❌ W0 | ⬜ pending |
| 03-03-05 | 03 | 2 | VID-11 | unit | `npx jest --testPathPatterns tests/lib/videos` | ❌ W0 | ⬜ pending |
| 03-04-01 | 04 | 3 | MOD-04 | unit | `npx jest --testPathPatterns tests/actions/videos` | ❌ W0 | ⬜ pending |
| 03-04-02 | 04 | 3 | MOD-05 | unit | `npx jest --testPathPatterns tests/actions/videos` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/actions/videos.test.ts` — stubs for VID-01, VID-04, VID-07, VID-12, VID-13, MOD-04, MOD-05
- [ ] `tests/actions/channels.test.ts` — stubs for CHAN-01, CHAN-03, VID-08
- [ ] `tests/actions/videoComments.test.ts` — stubs for VID-05
- [ ] `tests/lib/videos.test.ts` — stubs for VID-11 (`buildVideoSearchKeywords`)
- [ ] `tests/components/VideoPlayer.test.tsx` — stubs for VID-02
- [ ] `tests/components/VideoUploadForm.test.tsx` — stubs for VID-09

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Share video via copy link | VID-06 | Requires real browser clipboard API; mocking is trivial but low value | Open `/videos/[id]`, click Share button, verify clipboard toast appears and URL is correct |
| Mobile-responsive video player | VID-10 | Visual layout verification | Open video page on mobile viewport (375px); verify controls are accessible and player fills width |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
