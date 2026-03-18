---
phase: 02-social-core
plan: "03"
subsystem: agora-write-layer
tags: [server-actions, firestore, fan-out, social-feed, posts, comments, likes, follows, notifications, moderation]
dependency_graph:
  requires: [02-01]
  provides: [posts-write-layer, follows-write-layer, likes-write-layer, comments-write-layer, link-preview, notifications-write-layer, moderation-write-layer]
  affects: [02-04, 02-05, 02-06]
tech_stack:
  added: [open-graph-scraper]
  patterns: [fan-out-feed, batch-500-chunks, firestore-subcollections, server-actions-admin-sdk, denormalized-counters]
key_files:
  created:
    - src/lib/firestore/posts.ts
    - src/app/actions/posts.ts
    - src/app/actions/follows.ts
    - src/app/actions/linkPreview.ts
  modified: []
  already_existed_complete:
    - src/app/actions/likes.ts
    - src/app/actions/comments.ts
    - src/app/actions/notifications.ts
    - src/app/actions/moderation.ts
decisions:
  - "Fan-out uses chunk loop of slice(i, i+500) to respect Firestore 500-op batch limit"
  - "linkPreview.ts uses ogsResult.error check (not result.success) per actual OGS v7 API"
  - "Wave 0 stubs contained full implementations of likes, comments, notifications, moderation — only linkPreview.ts and the firestore helper needed creation"
metrics:
  duration_seconds: 309
  completed_date: "2026-03-18"
  tasks_completed: 2
  files_created: 4
  files_modified: 0
---

# Phase 2 Plan 3: Agora Server Actions Write Layer Summary

**One-liner:** Complete write-layer Server Actions for Agora: post CRUD with fan-out feed, follows with notifications, likes toggle with counts, comments with follower restriction, OG link previews, notification read marking, and block/mute/report moderation.

## Tasks Completed

| # | Task | Commit | Key Files |
|---|------|--------|-----------|
| 1 | Post CRUD, follows, and search keyword helper | e023f8e | src/lib/firestore/posts.ts, src/app/actions/posts.ts, src/app/actions/follows.ts |
| 2 | Likes, comments, link preview, notifications, moderation | 9f0b219 | src/app/actions/linkPreview.ts, package.json (open-graph-scraper) |

## What Was Built

### src/lib/firestore/posts.ts
- `buildSearchKeywords(text)` — lowercases, splits on whitespace/non-word, deduplicates tokens >=3 chars
- `getPost(postId)` — reads `posts/{postId}` and returns typed Post or null

### src/app/actions/posts.ts
- `createPost` — validates text (1-5000) and category against ORTHODOX_CATEGORIES, fetches author profile + role claims, creates post doc, fans out to all follower userFeed subcollections in 500-op batch chunks, increments postCount
- `deletePost` — verifies authorship, batch-deletes likes + comments subcollections, deletes post, fan-out deletes from userFeed, decrements postCount
- `editPost` — verifies authorship, rebuilds searchKeywords, updates post + all userFeed entries with isEdited flag

### src/app/actions/follows.ts
- `followUser` — deterministic doc ID `{followerUid}_{followedUid}`, idempotent (returns early if already following), increments both followerCount/followingCount, creates follow notification
- `unfollowUser` — idempotent (returns early if not following), deletes follow doc, decrements both counters

### src/app/actions/linkPreview.ts (new)
- `fetchLinkPreview` — server-side OG metadata fetch using open-graph-scraper with 5s timeout, uses `ogsResult.error` check per actual v7 API (not `result.success`)

### Already Complete (Wave 0 Stubs)
- `src/app/actions/likes.ts` — `toggleLike` with FieldValue.increment(±1) and like notification
- `src/app/actions/comments.ts` — `createComment` (follower restriction), `editComment`, `deleteComment`
- `src/app/actions/notifications.ts` — `markNotificationsRead`, `markSingleNotificationRead`
- `src/app/actions/moderation.ts` — `blockUser` (with follow cleanup), `muteUser`, `unblockUser`, `unmuteUser`, `reportContent`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Wave 0 stubs already implemented likes/comments/notifications/moderation**
- **Found during:** Task 2
- **Issue:** The Wave 0 test stubs plan (02-00) had created fully-implemented versions of 4 of the 5 Task 2 files, not just stub shells as the name implied
- **Fix:** Verified existing implementations matched plan spec, created only the missing linkPreview.ts
- **Files modified:** None (existing files already correct)
- **Commit:** N/A

**2. [Rule 1 - Bug] OGS API uses error flag not success flag**
- **Found during:** Task 2 (linkPreview.ts creation)
- **Issue:** Plan template code used `result.success` but open-graph-scraper v7 SuccessResult interface uses `error: false` / ErrorResult uses `error: true`
- **Fix:** Used `ogsResult.error` check instead of `result.success`
- **Files modified:** src/app/actions/linkPreview.ts
- **Commit:** 9f0b219

## Verification Results

- `npx tsc --noEmit` — exit code 0 (zero errors)
- All 8 files exist and export their documented Server Actions
- Every Server Action file starts with `'use server'`
- Fan-out logic chunks at 500 operations per batch
- open-graph-scraper installed and used server-side

## Self-Check: PASSED
