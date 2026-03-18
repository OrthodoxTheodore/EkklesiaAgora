---
phase: "02"
plan: "06"
subsystem: notifications-navbar-moderation
tags: [notifications, realtime, firestore, moderation, block, mute, report, navbar, profile]
dependency_graph:
  requires: [02-01, 02-02, 02-03]
  provides: [notification-bell, block-mute-report-ui, navbar-avatar-link]
  affects: [Navbar, ProfileHeader, MobileMenu, profile-page]
tech_stack:
  added: []
  patterns: [onSnapshot-realtime-listener, optimistic-follow-unfollow, server-action-moderation, confirmation-dialog]
key_files:
  created:
    - src/components/nav/NotificationBell.tsx
    - src/app/actions/notifications.ts
    - src/app/actions/moderation.ts
    - src/components/profile/ProfileHeader.tsx
    - src/components/profile/ProfileTabs.tsx
  modified:
    - src/components/nav/Navbar.tsx
    - src/components/nav/MobileMenu.tsx
    - src/app/(main)/profile/[handle]/page.tsx
decisions:
  - NotificationBell uses Firestore onSnapshot on users/{uid}/notifications where read==false for real-time badge
  - ProfileHeader imports blockUser/muteUser/reportContent directly from moderation.ts as client-side calls to Server Actions
  - onFollow/onUnfollow Server Action closures defined in profile page Server Component and passed as props to ProfileHeader
  - Block navigates to /agora after completing; mute shows toast; report shows reason picker sheet
metrics:
  duration: "8 minutes"
  completed: "2026-03-18"
  tasks: 2
  files: 8
---

# Phase 2 Plan 06: Notification Bell, Navbar Integration, and Block/Mute Wiring Summary

**One-liner:** Real-time notification bell with Firestore onSnapshot, Navbar updated with bell and avatar link, ProfileHeader block/mute/report wired to Server Actions with confirmation dialogs.

## Tasks Completed

### Task 1: NotificationBell component with real-time updates

Created `src/components/nav/NotificationBell.tsx` as a Client Component that:
- Subscribes to `users/{uid}/notifications` with `where('read', '==', false)` via `onSnapshot`
- Shows 44px touch target bell button with 16px gold/navy unread count badge
- Renders a dropdown with notification items (like, comment, follow, mention)
- Each item shows avatar, message text by type, relative timestamp
- Unread items get `bg-navy-light/50` background
- Mark all read button calls `markNotificationsRead` Server Action
- Per-item click calls `markSingleNotificationRead` and navigates (post link for like/comment/mention, profile for follow)
- Empty state: "No notifications yet" / "You'll see likes, comments, follows, and mentions here."
- Proper `aria-label` with unread count

Also created:
- `src/app/actions/notifications.ts`: `markNotificationsRead`, `markSingleNotificationRead`
- `src/app/actions/moderation.ts`: `blockUser`, `muteUser`, `unblockUser`, `unmuteUser`, `reportContent`

### Task 2: Navbar integration, profile block/mute wiring, and profile post content

**Navbar.tsx:**
- Added `NotificationBell` import and rendered before avatar button with `uid={user.uid}`
- Removed Dashboard link from dropdown
- Updated Profile link to `/profile/edit`
- Added Agora link to dropdown

**MobileMenu.tsx:**
- Updated Profile link to `/profile/edit`
- Removed Dashboard link
- Ensured Agora link present

**ProfileHeader.tsx:**
- Wired `blockUser` — opens confirmation dialog "Block {displayName}? They won't be able to see your posts or follow you." with crimson "Block {displayName}" button; on confirm navigates to `/agora`
- Wired `muteUser` — calls immediately on click, shows toast "Muted {displayName}. Their posts will be hidden from your feed."
- Wired `reportContent` — opens reason picker sheet (Spam, Harassment, Inappropriate content, Other); on submit calls Server Action with `contentType: 'user'`; shows toast "Report submitted. Thank you."
- Wired `followUser` / `unfollowUser` — optimistic toggle with rollback toast "Could not follow. Try again." on failure
- Accepts `onFollow?` / `onUnfollow?` callback props; falls back to direct Server Action calls if not provided

**profile/[handle]/page.tsx:**
- Added `followUser` / `unfollowUser` imports
- Defined `handleFollow` / `handleUnfollow` as inline Server Actions with `'use server'` directive
- Passed as `onFollow` / `onUnfollow` props to ProfileHeader

## Deviations from Plan

### Auto-fixed Issues (Rule 3 - Blocking Issues)

**1. [Rule 3 - Blocking] Missing prerequisite files from plans 02-01 through 02-05**
- **Found during:** Pre-task dependency check
- **Issue:** `notifications.ts`, `moderation.ts`, `ProfileHeader.tsx`, `ProfileTabs.tsx` were missing or incomplete (stubs without wiring). These are required by plan 02-06.
- **Fix:** Created/completed all missing prerequisite files as part of this plan execution:
  - `src/app/actions/notifications.ts` (new)
  - `src/app/actions/moderation.ts` (new)
  - `src/components/profile/ProfileHeader.tsx` (created with full block/mute/report wiring)
  - `src/components/profile/ProfileTabs.tsx` (created with role="tablist", aria-selected)
- **Files modified:** As listed above
- **Commit:** 731f333

## Self-Check: PASSED

All required files exist and commits are present in git history.

| Check | Result |
|-------|--------|
| NotificationBell.tsx exists | PASS |
| notifications.ts exists | PASS |
| moderation.ts exists | PASS |
| ProfileHeader.tsx exists | PASS |
| ProfileTabs.tsx exists | PASS |
| Commit 731f333 exists | PASS |
| Commit 0463e2f exists | PASS |
| TypeScript noEmit: 0 errors | PASS |
