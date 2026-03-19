---
phase: 03-video-hub-moderation
plan: "01"
subsystem: types-rules-indexes
tags: [types, firestore-rules, storage-rules, indexes, test-stubs, video, channel]
dependency_graph:
  requires: []
  provides:
    - Video, Channel, VideoComment, ChannelSubscribe TypeScript interfaces
    - VideoStatus, ChannelStatus, ChannelType union types
    - Notification extended with moderation fields
    - Firestore security rules for /videos, /channels, /channelSubscribes
    - Storage rules for /videos, /thumbnails, /channels
    - 5 composite indexes for video queries
    - buildVideoSearchKeywords, getVideoById, getChannelById, isChannelHandleAvailable helpers
    - 6 Wave 0 test stubs for Nyquist compliance
  affects:
    - All Phase 3 plans (types contract)
    - 03-02, 03-03, 03-04, 03-05 (depend on video/channel types)
tech_stack:
  added: []
  patterns:
    - Status-based Firestore read guards (published vs pending_review)
    - Admin-SDK-only writes (allow write: if false) for server action integrity
    - Pure function keyword tokenizer with Set deduplication
    - Wave 0 test.todo() stubs for Nyquist compliance
key_files:
  created:
    - src/lib/types/video.ts
    - src/lib/firestore/videos.ts
    - tests/actions/videos.test.ts
    - tests/actions/channels.test.ts
    - tests/actions/videoComments.test.ts
    - tests/lib/videos.test.ts
    - tests/components/VideoPlayer.test.tsx
    - tests/components/VideoUploadForm.test.tsx
  modified:
    - src/lib/types/social.ts
    - firestore.rules
    - storage.rules
    - firestore.indexes.json
decisions:
  - "Video reads gated on status==published OR owner OR moderator+ — prevents unreviewed content exposure"
  - "Notification extended inline in social.ts rather than a new file — single source of truth for notification shape"
  - "buildVideoSearchKeywords uses \\W+ split to handle punctuation in titles/tags, not just whitespace"
  - "firebase-admin mocked with jest.mock() hoisting + require() in tests/lib/videos.test.ts to avoid jose ESM parse error"
metrics:
  duration: "239s (~4 min)"
  completed_date: "2026-03-19"
  tasks_completed: 2
  files_created: 8
  files_modified: 4
---

# Phase 3 Plan 01: Foundation Types, Rules, and Indexes Summary

**One-liner:** Phase 3 type contracts (Video/Channel/VideoComment interfaces), status-based Firestore security rules, Storage upload rules, 5 composite indexes, buildVideoSearchKeywords helper, and 6 Wave 0 Nyquist test stubs.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Type contracts, Notification extension, Firestore/Storage rules, indexes | 722d1a3 | src/lib/types/video.ts, src/lib/types/social.ts, firestore.rules, storage.rules, firestore.indexes.json |
| 2 | Video search keyword helper, query helpers, Wave 0 test stubs | c95e5f6 | src/lib/firestore/videos.ts, 6 test stub files |

## What Was Built

### Type Contracts (`src/lib/types/video.ts`)
Complete Phase 3 domain model:
- `Video` interface — 26 fields covering uploader denormalization, channel association, moderation state, search keywords
- `Channel` interface — 15 fields with status-based approval workflow
- `VideoComment` interface — subcollection comment shape
- `ChannelSubscribe` interface — subscriber document shape
- `VideoStatus`, `ChannelStatus`, `ChannelType` union types

### Notification Extension (`src/lib/types/social.ts`)
Added `'moderation'` to the type union and three optional fields: `videoId`, `decision`, `moderatorNote` — enabling the moderation workflow to notify uploaders of review outcomes.

### Firestore Security Rules (`firestore.rules`)
Three new collection rules following the Phase 1/2 pattern of Admin-SDK-only writes:
- `/videos/{videoId}` — reads allowed when `status=='published'` OR caller is the uploader OR caller is moderator+; subcollection likes (owner write) and comments (read-only)
- `/channels/{channelId}` — reads allowed when `status=='approved'` OR caller is owner OR moderator+
- `/channelSubscribes/{channelId}/subscribers/{uid}` — authenticated reads only

### Storage Rules (`storage.rules`)
Three new upload paths:
- `/videos/{uid}/{videoId}/**` — owner can upload video/* content type; anyone reads
- `/thumbnails/{videoId}/**` — any authenticated user can upload; anyone reads
- `/channels/{channelId}/**` — any authenticated user can upload; anyone reads

### Composite Indexes (`firestore.indexes.json`)
5 indexes added for efficient video queries:
1. `videos`: status + createdAt — feed queries by publication state
2. `videos`: status + category + createdAt — category-filtered video feed
3. `videos`: channelId + status + createdAt — per-channel video lists
4. `videos`: searchKeywords (CONTAINS) + status — full-text search
5. `channels`: status + primaryCategory — category-filtered channel directory

### Query Helpers (`src/lib/firestore/videos.ts`)
- `buildVideoSearchKeywords(title, description, tags)` — tokenizes all three sources, lowercases, deduplicates with Set, filters tokens < 3 chars
- `getVideoById(videoId)` — Admin SDK Firestore fetch
- `getChannelById(channelId)` — Admin SDK Firestore fetch
- `isChannelHandleAvailable(handle)` — handle uniqueness check

### Wave 0 Test Stubs (6 files)
All test stubs use `test.todo()` for Nyquist compliance:
- `tests/actions/videos.test.ts` — createVideo, updateVideoStatus, likeVideo, incrementViewCount
- `tests/actions/channels.test.ts` — createChannelApplication, approveChannel, subscribeChannel
- `tests/actions/videoComments.test.ts` — createVideoComment, deleteVideoComment
- `tests/components/VideoPlayer.test.tsx` — VideoPlayer render tests
- `tests/components/VideoUploadForm.test.tsx` — VideoUploadForm render tests

`tests/lib/videos.test.ts` has 5 **passing** unit tests verifying `buildVideoSearchKeywords`.

## Verification Results

- `npx tsc --noEmit` — exits 0, no TypeScript errors
- `npx jest --testPathPatterns tests/lib/videos --no-coverage` — 5 passing tests
- All 6 test stub files exist and contain proper describe blocks

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Added firebase-admin mocks to tests/lib/videos.test.ts**
- **Found during:** Task 2 verification
- **Issue:** `buildVideoSearchKeywords` is a pure function but lives in a module that imports `getAdminFirestore` from `@/lib/firebase/admin`, which imports `firebase-admin/auth` which in turn imports `jose` (ESM-only). Jest cannot parse ESM `export` syntax from `jose`.
- **Fix:** Added `jest.mock('server-only')`, `jest.mock('firebase-admin/app')`, `jest.mock('firebase-admin/firestore')`, `jest.mock('firebase-admin/auth')` at top of test file (hoisted by Jest); switched to `require()` import pattern to match claims.test.ts precedent.
- **Files modified:** tests/lib/videos.test.ts
- **Commit:** c95e5f6 (included in Task 2 commit)

## Self-Check: PASSED

Files created:
- src/lib/types/video.ts — FOUND
- src/lib/firestore/videos.ts — FOUND
- tests/actions/videos.test.ts — FOUND
- tests/actions/channels.test.ts — FOUND
- tests/actions/videoComments.test.ts — FOUND
- tests/lib/videos.test.ts — FOUND
- tests/components/VideoPlayer.test.tsx — FOUND
- tests/components/VideoUploadForm.test.tsx — FOUND

Commits:
- 722d1a3 — FOUND
- c95e5f6 — FOUND
