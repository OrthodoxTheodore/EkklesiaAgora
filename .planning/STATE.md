---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: unknown
stopped_at: Completed 05-scripture-library 05-02-PLAN.md
last_updated: "2026-03-19T11:18:10.063Z"
progress:
  total_phases: 7
  completed_phases: 5
  total_plans: 23
  completed_plans: 23
---

---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: unknown
stopped_at: Completed 05-scripture-library 05-02-PLAN.md
last_updated: "2026-03-19T11:12:08.199Z"
progress:
  total_phases: 7
  completed_phases: 5
  total_plans: 23
  completed_plans: 23
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-16)

**Core value:** Providing a trustworthy, canonically-grounded Eastern Orthodox Christian platform where users can find authentic content and community.
**Current focus:** Phase 05 — scripture-library

## Current Position

Phase: 05 (scripture-library) — EXECUTING
Plan: 1 of 2

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
| Phase 02-social-core P06 | 8 | 2 tasks | 8 files |
| Phase 02-social-core P04 | 48 | 2 tasks | 8 files |
| Phase 02-social-core P07 | 1 | 0 tasks | 0 files |
| Phase 03-video-hub-moderation P01 | 239s | 2 tasks | 12 files |
| Phase 03-video-hub-moderation P02 | 3 | 2 tasks | 4 files |
| Phase 03-video-hub-moderation P04 | 5 | 2 tasks | 6 files |
| Phase 03-video-hub-moderation P03 | 6min | 2 tasks | 9 files |
| Phase 03-video-hub-moderation P05 | 251s | 2 tasks | 7 files |
| Phase 03-video-hub-moderation P05 | 251s+checkpoint | 3 tasks | 7 files |
| Phase 04-orthodox-identity P01 | 3min | 2 tasks | 12 files |
| Phase 04-orthodox-identity P02 | 4min | 2 tasks | 8 files |
| Phase 04-orthodox-identity P03 | 10min | 3 tasks | 9 files |
| Phase 05-scripture-library PP01 | 15min | 2 tasks | 11 files |
| Phase 05-scripture-library P02 | 319s | 3 tasks | 13 files |

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
- [Phase 02-social-core-05]: All comments load at once on post detail page — flat thread, no pagination (per CONTEXT locked decision)
- [Phase 02-social-core-05]: Follower-only restriction enforced both server-side (createComment Server Action) and client-side (compose area hidden with UI message)
- [Phase 02-social-core-05]: PostCard reused on post detail page with the same component as the feed — no separate detail variant needed
- [Phase 02-social-core]: NotificationBell uses Firestore onSnapshot on users/{uid}/notifications where read==false for real-time unread badge
- [Phase 02-social-core]: ProfileHeader block/mute/report calls Server Actions directly client-side; onFollow/onUnfollow closures defined in Server Component and passed as props
- [Phase 02-social-core-04]: FeedClient uses getDocs (not onSnapshot) for feed pagination — consistent with 02-RESEARCH.md locked decision
- [Phase 02-social-core-04]: Search and category filter are mutually exclusive — entering a search clears the category, selecting a category clears search
- [Phase 02-social-core-04]: AI category classification uses module-scope getAI/getGenerativeModel initialization to avoid per-render overhead
- [Phase 02-social-core]: Phase 2 human verification checkpoint — all social core features verified by user before proceeding to Phase 3
- [Phase 03-video-hub-moderation-01]: Video reads gated on status==published OR owner OR moderator+ — prevents unreviewed content exposure
- [Phase 03-video-hub-moderation-01]: Notification extended inline in social.ts with moderation type, videoId, decision, moderatorNote fields
- [Phase 03-video-hub-moderation-01]: buildVideoSearchKeywords uses \\W+ split to handle punctuation in titles/tags, not just whitespace
- [Phase 03-video-hub-moderation-01]: firebase-admin mocked with jest.mock() hoisting + require() in tests/lib/videos.test.ts to avoid jose ESM parse error
- [Phase 03-video-hub-moderation]: authConfig inlined in each video/channel Server Action file — matches existing admin/actions.ts pattern
- [Phase 03-video-hub-moderation]: reportContent extended to accept 'video' contentType; flagCount increment consolidates duplicate pending reports
- [Phase 03-video-hub-moderation]: Video status always starts as pending_review — no Server Action can publish a video directly
- [Phase 03-video-hub-moderation-04]: VideoDetailClient receives initial data as props from Server Component; no client-side Firestore reads on detail page
- [Phase 03-video-hub-moderation-04]: incrementViewCount called with void (fire-and-forget) — page load not blocked by view count write
- [Phase 03-video-hub-moderation]: SubscribeButton co-located client component keeps channel detail page as Server Component while providing interactive subscribe toggle
- [Phase 03-video-hub-moderation]: ChannelBrowseClient thin wrapper: Server Component pre-fetches all approved channels, client handles CategoryFilterTabs filter state
- [Phase 03-video-hub-moderation]: Moderation console isModerator guard (roleLevel >= 2) for navbar and page access — separate from isAdmin (3+)
- [Phase 03-video-hub-moderation]: FlaggedContentCard deduplicates flag reasons — multiple reports same reason shown once; flagCount shows total report count
- [Phase 03-video-hub-moderation]: Phase 3 human verification checkpoint approved — complete video hub and moderation flow verified
- [Phase 04-orthodox-identity]: orthocal.info endpoint mapping: new_julian->gregorian, old_julian->julian — Revised Julian aligns with civil dates; Old Julian is 13 days behind
- [Phase 04-orthodox-identity]: CANONICAL_IDS typed as string[] to allow .includes(string) — readonly literal tuple from as const causes TS2345
- [Phase 04-orthodox-identity]: sanitizeMember enforces location privacy in application layer — Firestore rules cannot gate individual fields within a document
- [Phase 04-orthodox-identity]: buildDisplayNameKeywords uses 2-char minimum prefix (not 3+ like video keywords) — personal names like Li/Bo need 2-char matching
- [Phase 04-orthodox-identity]: ReadingRef prop renamed from ref to reading — ref is reserved by React and silently stripped from function components
- [Phase 04-orthodox-identity]: CalendarDayView uses router.push(?date=YYYY-MM-DD&cal=) for day navigation — Server Component re-fetches orthocal.info on each navigation
- [Phase 04-orthodox-identity]: Search and jurisdiction filter are mutually exclusive in Synodeia — entering search clears tab to All; clicking tab clears search input
- [Phase 04-orthodox-identity]: Location toggle auto-saves on click via updateLocationSharing Server Action rather than waiting for main profile form submit
- [Phase 05-scripture-library]: buildVerseKeywords uses >= 3 char filter for verse text; EOB NT seed uses pre-parsed JSON input to separate PDF extraction from Firestore writes; seed scripts inline keyword builder to avoid Next.js module resolution outside src/
- [Phase 05-scripture-library]: parseReference exported from ScriptureSearch for direct unit testing
- [Phase 05-scripture-library]: ReadingRef use-client directive removed — Link is server-compatible with no hooks in this component
- [Phase 05-scripture-library]: ScriptureReader test mocks VerseList to include font-garamond class, satisfying LIB-03 Byzantine rendering gate assertion

### Pending Todos

None yet.

### Blockers/Concerns

- **Phase 3 flag:** Liturgical calendar data sourcing (OCA.org, ROCOR) — verify whether structured data APIs or downloadable datasets exist before Phase 4 planning begins
- **Phase 5 flag:** Public domain patristic text sources — resolve text sourcing strategy (pre-1928 translations from CCEL/Project Gutenberg) before Phase 6 planning begins
- **Legal prerequisite:** Register DMCA agent with U.S. Copyright Office before any video uploads or seed content goes live

## Session Continuity

Last session: 2026-03-19T11:12:08.193Z
Stopped at: Completed 05-scripture-library 05-02-PLAN.md
Resume command: `/gsd:execute-phase 3`
Resume file: None
