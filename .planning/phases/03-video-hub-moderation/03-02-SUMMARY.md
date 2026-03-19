---
phase: 03-video-hub-moderation
plan: "02"
subsystem: api
tags: [firebase, firestore, server-actions, video, moderation, channels]

# Dependency graph
requires:
  - phase: 03-video-hub-moderation
    plan: "01"
    provides: "Video, Channel, VideoComment, ChannelSubscribe types; buildVideoSearchKeywords, getVideoById, getChannelById, isChannelHandleAvailable firestore helpers; Firestore rules for videos/channels"
  - phase: 02-social-core
    provides: "UserProfile type, getProfileByUid, follows/notifications patterns, fan-out batch pattern"
provides:
  - "createVideo Server Action — validates with Zod, always sets status pending_review"
  - "updateVideoStatus Server Action — role-gated moderator+, writes moderation notification"
  - "deleteVideo Server Action — batch-deletes likes+comments subcollections in 500-op chunks"
  - "likeVideo Server Action — toggles like subcollection with atomic FieldValue.increment counter"
  - "incrementViewCount Server Action — no auth required, FieldValue.increment"
  - "createChannelApplication Server Action — validates handle regex, checks uniqueness, sets pending_approval"
  - "approveChannel/rejectChannel Server Actions — role-gated moderator+, notify channel owner"
  - "subscribeChannel/unsubscribeChannel Server Actions — atomic subscriberCount counters"
  - "createVideoComment Server Action — increments commentCount, sends notification to uploader"
  - "deleteVideoComment Server Action — author or moderator+, decrements commentCount"
  - "editVideoComment Server Action — author-only, sets isEdited flag"
  - "reportContent extended — now accepts 'video' contentType; increments flagCount on duplicate reports"
affects: [03-03, 03-04, 03-05, 07-discovery]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "inline authConfig in Server Actions (same as admin/actions.ts pattern)"
    - "getTokens(await cookies(), authConfig) for role-gated Server Actions"
    - "FieldValue.increment for all counter mutations (likeCount, commentCount, viewCount, subscriberCount)"
    - "500-op batch chunk pattern for subcollection deletes (same as posts.ts deletePost)"
    - "Zod schema validation at Server Action entry point"
    - "flagCount deduplication on reportContent — increment existing pending report instead of creating duplicate"

key-files:
  created:
    - src/app/actions/videos.ts
    - src/app/actions/channels.ts
    - src/app/actions/videoComments.ts
  modified:
    - src/app/actions/moderation.ts

key-decisions:
  - "authConfig inlined in each Server Action file (not exported from a shared module) — matches existing admin/actions.ts pattern in codebase"
  - "deleteVideoComment fetches tokens only when uid != authorUid — avoids cookie read overhead for the common case (author deleting own comment)"
  - "reportContent uses flagCount increment on duplicate pending reports to consolidate moderation queue instead of creating duplicate entries"
  - "likeVideo like notification reads getVideoById after setting the like — acceptable extra read since like notifications are best-effort"
  - "randomUUID() from Node 'crypto' module used for channelId and commentId generation instead of Firestore auto-id, for predictability in channelApplication flow"

patterns-established:
  - "Video status always starts as pending_review — no Server Action can create a published video directly"
  - "Moderator identity not disclosed in moderation notifications (fromHandle: '', fromDisplayName: 'Moderator')"
  - "Channel subscription stored in channelSubscribes/{channelId}/subscribers/{uid} — parallel to follows pattern"

requirements-completed: [VID-01, VID-04, VID-05, VID-07, VID-08, VID-09, VID-12, CHAN-01, CHAN-02, MOD-01, MOD-02, MOD-04, MOD-05]

# Metrics
duration: 3min
completed: 2026-03-19
---

# Phase 3 Plan 02: Server Actions Write Layer Summary

**Video CRUD with pending_review queue, like/view atomic counters, channel applications with mod approval, subscribe/unsubscribe, video comments with counters, and moderation decisions with uploader notifications — all TypeScript clean.**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-19T00:36:04Z
- **Completed:** 2026-03-19T00:38:59Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Complete Server Actions write layer for all Phase 3 video and channel operations
- All counter mutations use FieldValue.increment (atomic, no read-modify-write race)
- Moderation gate enforced at roleLevel >= 2 in updateVideoStatus, approveChannel, rejectChannel, deleteVideoComment
- reportContent extended to handle video contentType with flagCount deduplication

## Task Commits

Each task was committed atomically:

1. **Task 1: Video Server Actions (CRUD, likes, moderation decisions, view count)** - `cb74a9e` (feat)
2. **Task 2: Channel Server Actions and video comment Server Actions** - `e447f38` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `src/app/actions/videos.ts` — createVideo, updateVideoStatus, deleteVideo, likeVideo, incrementViewCount
- `src/app/actions/channels.ts` — createChannelApplication, approveChannel, rejectChannel, subscribeChannel, unsubscribeChannel
- `src/app/actions/videoComments.ts` — createVideoComment, deleteVideoComment, editVideoComment
- `src/app/actions/moderation.ts` — extended reportContent for 'video' contentType + flagCount deduplication

## Decisions Made
- Inlined authConfig in each Server Action file matching the existing admin/actions.ts pattern rather than introducing a shared module
- deleteVideoComment avoids cookie read unless the caller is not the comment author (optimization)
- flagCount increment consolidates moderation queue rather than creating duplicate pending reports
- randomUUID() from Node crypto used for generated IDs in channel/comment creation

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed ZodError.errors API — should be ZodError.issues**
- **Found during:** Task 1 (createVideo TypeScript compile)
- **Issue:** Called `parsed.error.errors[0]` but the Zod v3 API property is `issues`, not `errors`
- **Fix:** Changed to `parsed.error.issues[0]?.message`
- **Files modified:** src/app/actions/videos.ts
- **Verification:** `npx tsc --noEmit` exits 0
- **Committed in:** cb74a9e (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — Zod API property name)
**Impact on plan:** Minor API name correction, no scope change.

## Issues Encountered
None beyond the Zod `.issues` vs `.errors` property name which was caught immediately by TypeScript.

## User Setup Required
None — no external service configuration required.

## Next Phase Readiness
- All Server Action write functions are ready for UI pages in plans 03-03 and 03-04
- Video upload flow can call createVideo, UI can call updateVideoStatus for moderator console
- Channel application form can call createChannelApplication
- Subscribe/unsubscribe buttons can call subscribeChannel/unsubscribeChannel

---
*Phase: 03-video-hub-moderation*
*Completed: 2026-03-19*
