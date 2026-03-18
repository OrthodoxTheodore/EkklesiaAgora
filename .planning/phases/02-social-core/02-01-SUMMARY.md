---
phase: 02-social-core
plan: "01"
subsystem: database
tags: [firestore, firebase-storage, typescript, zod, server-actions]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Admin SDK (getAdminAuth, getAdminFirestore), roleLevel custom claims, Server Action pattern

provides:
  - TypeScript interfaces for all Phase 2 Firestore documents (UserProfile, Post, Comment, Like, Follow, Notification, Block, Mute, LinkPreview, FeedEntry)
  - Jurisdiction constants: 18 canonical Orthodox churches + 4 Other Christian entries
  - Category constants: 10 Orthodox content categories
  - Firestore security rules for 9 Phase 2 collections
  - Firebase Storage rules for avatars, banners, and post images
  - Composite index definitions for category-filtered feed queries
  - Profile Server Actions: updateProfile, updateAvatar, updateBanner
  - Profile query helpers: getProfileByUid, getProfileByHandle, isHandleAvailable
  - Extended registerUser creates userProfiles doc with default handle on signup

affects:
  - 02-02 (profile UI uses UserProfile type and Server Actions)
  - 02-03 (post CRUD uses Post, Comment, Like, Follow types and Firestore rules)
  - 02-04 (feed UI uses FeedEntry and category constants)
  - 02-05 (notifications use Notification type and rules)
  - 02-06 (block/mute use Block/Mute types and rules)
  - all subsequent Phase 2 plans

# Tech tracking
tech-stack:
  added: [zod (validation in updateProfile Server Action)]
  patterns:
    - Server Actions for Firestore writes (Admin SDK server-only, never client-side)
    - Zod schema validation inside Server Actions before DB writes
    - Handle uniqueness checked atomically via Firestore query before write
    - Default handle derived from email prefix with uid-suffix collision fallback

key-files:
  created:
    - src/lib/types/social.ts
    - src/lib/constants/jurisdictions.ts
    - src/lib/constants/categories.ts
    - src/lib/firestore/profiles.ts
    - src/app/actions/profile.ts
    - storage.rules
    - firestore.indexes.json
  modified:
    - firestore.rules (Phase 2 collection rules added)
    - src/app/actions/auth.ts (extended registerUser signature + userProfiles creation)
    - src/app/(auth)/register/page.tsx (passes email to registerUser)

key-decisions:
  - "userProfiles collection is separate from /users/{uid} — userProfiles is public social data, /users/{uid} is the auth/role document"
  - "Likes are Firestore subcollections on posts (not a top-level collection) per Phase 1 data model decision"
  - "Server Actions use Admin SDK for all Firestore writes — Firestore rules block all direct client writes to posts/comments/follows/feed/notifications"
  - "Default handle derived from email prefix with sanitization and uid-suffix collision fallback"
  - "Firestore rules for userMutes/userBlocks allow owner writes directly (no Server Action needed for privacy controls)"

patterns-established:
  - "Profile writes: validate with Zod schema, check handle uniqueness, then db.update() — all in one Server Action"
  - "Admin SDK writes (fan-out, complex logic): allow write: if false in Firestore rules"
  - "Owner-controlled simple writes (block, mute, like): allow write with isOwner() && isRegistered() guard"

requirements-completed: [PROF-01, PROF-02, PROF-03, PROF-05, PROF-06]

# Metrics
duration: 6min
completed: 2026-03-18
---

# Phase 2 Plan 01: Social Core Foundation Summary

**TypeScript data contracts, jurisdiction/category constants, Firestore and Storage security rules, composite indexes, and profile Server Actions using Admin SDK with Zod validation**

## Performance

- **Duration:** ~6 min
- **Started:** 2026-03-18T19:30:45Z
- **Completed:** 2026-03-18T19:36:21Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- All Phase 2 TypeScript interfaces (10 types) defined in a single shared module
- 18 canonical Orthodox + 4 Other Christian jurisdictions with helper function
- 10 Orthodox content categories as const array with derived type
- Firestore security rules extended with 9 Phase 2 collection blocks (defense-in-depth: Admin SDK writes blocked at rules layer)
- Firebase Storage rules for avatar/banner/post images (5MB/10MB limits, image/* content type enforcement)
- Composite indexes for category-filtered, time-sorted feed queries on posts and userFeed
- Registration extended to create userProfiles document atomically with email-derived handle + collision fallback

## Task Commits

Each task was committed atomically:

1. **Task 1: Types, constants, Firestore rules, Storage rules, indexes** - `c880adc` (feat)
2. **Task 2: Profile Server Actions and extended registration** - `fd76df6` (feat)

**Plan metadata:** _(docs commit pending)_

## Files Created/Modified
- `src/lib/types/social.ts` - UserProfile, Post, Comment, Like, Follow, Notification, Block, Mute, LinkPreview, FeedEntry interfaces
- `src/lib/constants/jurisdictions.ts` - CANONICAL_ORTHODOX_JURISDICTIONS (18), OTHER_CHRISTIAN_JURISDICTIONS (4), JurisdictionId type, getJurisdictionLabel helper
- `src/lib/constants/categories.ts` - ORTHODOX_CATEGORIES (10), OrthodoxCategory type
- `src/lib/firestore/profiles.ts` - getProfileByUid, getProfileByHandle, isHandleAvailable query helpers
- `src/app/actions/profile.ts` - updateProfile (Zod validated, handle uniqueness), updateAvatar, updateBanner Server Actions
- `firestore.rules` - Added 9 Phase 2 collection rules (userProfiles, posts, likes, comments, follows, userFeed, notifications, userBlocks, userMutes)
- `storage.rules` - Created with avatar/banner/post image upload rules
- `firestore.indexes.json` - Created with 3 composite indexes for feed queries
- `src/app/actions/auth.ts` - Extended registerUser(uid, email) to create userProfiles doc
- `src/app/(auth)/register/page.tsx` - Updated caller to pass user.email!

## Decisions Made
- `userProfiles` collection is distinct from `/users/{uid}` — public social profile vs. auth role document
- Admin SDK controls all write-sensitive collections (posts, comments, follows, feed, notifications) with `allow write: if false` in rules
- Owner-controlled privacy controls (block, mute, like) use direct Firestore writes with `isOwner() && isRegistered()` guard
- Default handle uses email prefix + sanitization; uid-suffix appended on collision

## Deviations from Plan

None — plan executed exactly as written. Wave 0 stubs (created in plan 02-00) had pre-implemented some files (auth.ts, profile.ts, profiles.ts, register/page.tsx) with the correct signatures; this plan verified and committed those implementations.

## Issues Encountered
- Wave 0 pre-created stub files with correct implementations — no rework needed, verified content matched plan spec and committed.
- Pre-existing untracked agora component stubs from a prior execution attempt have a TSC cascade error (PostDetailClient → CommentCard not yet created). This pre-dates plan 02-01 and is resolved by later plans creating the missing components. TSC exits 0 with all working-tree files present.

## Next Phase Readiness
- All shared types and backend infrastructure ready for plan 02-02 (profile UI)
- Firestore rules deployed via `firebase deploy --only firestore:rules` before any data writes
- Storage rules deployed via `firebase deploy --only storage` before any image uploads

---
*Phase: 02-social-core*
*Completed: 2026-03-18*
