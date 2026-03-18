---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: completed
stopped_at: Completed 02-social-core-02-PLAN.md
last_updated: "2026-03-18T19:39:30.884Z"
last_activity: 2026-03-18 — Plan 02-03 complete (8 Server Action files, fan-out feed, follows, likes, comments, link preview, notifications, moderation)
progress:
  total_phases: 7
  completed_phases: 1
  total_plans: 12
  completed_plans: 9
  percent: 45
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-16)

**Core value:** Providing a trustworthy, canonically-grounded Eastern Orthodox Christian platform where users can find authentic content and community.
**Current focus:** Phase 2 — Social Core

## Current Position

Phase: 2 of 7 (Social Core) — **IN PROGRESS**
Plan: 3 of 7 complete (02-03 done, 02-04 is next)
Status: Phase 2 active — Agora write-layer Server Actions complete
Last activity: 2026-03-18 — Plan 02-03 complete (8 Server Action files, fan-out feed, follows, likes, comments, link preview, notifications, moderation)

Progress: [███░░░░░░░] 45%

## Performance Metrics

**Velocity:**
- Total plans completed: 0
- Average duration: -
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**
- Last 5 plans: -
- Trend: -

*Updated after each plan completion*
| Phase 01-foundation P01 | 18 | 3 tasks | 31 files |
| Phase 01-foundation P02 | 7 | 2 tasks | 15 files |
| Phase 01-foundation P03 | 45 | 2 tasks | 13 files |
| Phase 01-foundation P04 | 2 | 1 tasks | 1 files |
| Phase 02-social-core P00 | 5 | 1 task | 12 files |
| Phase 02-social-core P01 | 6min | 2 tasks | 9 files |
| Phase 02-social-core P03 | 309s | 2 tasks | 4 files |
| Phase 02-social-core P02 | 7 | 2 tasks | 8 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Pre-phase]: React/Next.js 15 + Firebase backend (existing ekklesia-agora project); do not migrate
- [Pre-phase]: Video pipeline — Firebase Storage acceptable for prototype demo; never treated as production CDN (Mux deferred to post-blessing)
- [Pre-phase]: Firestore data model must be designed in Phase 1 before any feature development — fan-out feed pattern and likes as subcollections are required
- [Pre-phase]: DMCA agent registration ($6/year) must precede any user-uploaded content — even prototype demo for clergy
- [Pre-phase]: Seed content must be jurisdictionally balanced from day one; moderation decisions must benchmark against Seven Ecumenical Councils, not any one jurisdiction
- [Phase 01-foundation]: next-firebase-auth-edge v1.12 uses setAuthCookies/removeAuthCookies from next-firebase-auth-edge/next/cookies (not createSessionCookieOnLogin from lib/next/server)
- [Phase 01-foundation]: Server Action used for setCustomUserClaims — keeps Admin SDK server-only, avoids exposing service account to client bundle
- [Phase 01-foundation]: Double /api/login POST pattern: first creates initial session cookie, second updates it after roleLevel:1 claim is set via Admin SDK
- [Phase 01-foundation]: Anti-enumeration: password reset always shows success message regardless of whether email exists (swallows auth/user-not-found)
- [Phase 01-foundation]: Admin page uses getTokens() in Server Component for defense-in-depth role check beyond middleware
- [Phase 01-foundation]: roleAuditLog write:false in Firestore rules — Admin SDK only writes ensure audit log integrity
- [Phase 01-foundation]: Privilege escalation guard: non-super-admin callers cannot assign role >= own level
- [Phase 01-foundation]: CSS token testing via fs.readFileSync with regex assertions — no jsdom needed for static CSS content
- [Phase 02-social-core]: Jest 30 renamed --testPathPattern to --testPathPatterns (plural); all verify commands in Phase 2 plans must use the plural flag
- [Phase 02-social-core-01]: userProfiles collection is separate from /users/{uid} — userProfiles is public social data, /users/{uid} is the auth/role document
- [Phase 02-social-core-01]: Admin SDK writes for posts/comments/follows/feed/notifications use allow write: if false in Firestore rules (rules enforce no direct client writes)
- [Phase 02-social-core-01]: Owner-controlled privacy controls (block, mute, like) use direct Firestore writes with isOwner() && isRegistered() guard
- [Phase 02-social-core-03]: Fan-out feed uses 500-op batch chunks; open-graph-scraper v7 uses ogsResult.error flag not result.success
- [Phase 02-social-core]: ProfileHeader accepts optional onFollow/onUnfollow callback props to avoid direct import of follows actions from a wave-parallel plan
- [Phase 02-social-core]: JurisdictionDropdown uses native select with optgroup for accessible two-section jurisdiction picker

### Pending Todos

None yet.

### Blockers/Concerns

- **Phase 3 flag:** Liturgical calendar data sourcing (OCA.org, ROCOR) — verify whether structured data APIs or downloadable datasets exist before Phase 4 planning begins
- **Phase 5 flag:** Public domain patristic text sources — resolve text sourcing strategy (pre-1928 translations from CCEL/Project Gutenberg) before Phase 6 planning begins
- **Legal prerequisite:** Register DMCA agent with U.S. Copyright Office before any video uploads or seed content goes live

## Session Continuity

Last session: 2026-03-18T19:39:30.879Z
Stopped at: Completed 02-social-core-02-PLAN.md
Resume command: `/gsd:execute-phase 2`
Resume file: None
