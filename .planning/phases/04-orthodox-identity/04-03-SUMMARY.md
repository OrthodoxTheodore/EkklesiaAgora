---
phase: 04-orthodox-identity
plan: "03"
subsystem: ui
tags: [next.js, firebase, firestore, react, server-actions, tailwind]

# Dependency graph
requires:
  - phase: 04-orthodox-identity
    plan: "01"
    provides: SynodeiaMember type, getMembersByJurisdiction, searchMembersByName, sanitizeMember, CANONICAL_ORTHODOX_JURISDICTIONS, updateLocationSharing Server Action
  - phase: 04-orthodox-identity
    plan: "02"
    provides: Liturgical calendar page at /calendar verified and working
provides:
  - Auth-gated Synodeia people finder at /synodeia with jurisdiction tabs and name search
  - MemberCard component with avatar, jurisdiction badge, and location privacy
  - Location sharing toggle on profile edit page (city/state fields)
  - Calendar and Synodeia nav links in desktop navbar and mobile menu
  - MemberCard unit tests with real assertions
affects:
  - 04-orthodox-identity
  - 05-scripture-library

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Auth-gated Server Component with getTokens sign-in fallback card
    - Server Actions wrapping Firestore query functions (synodeia.ts)
    - Jurisdiction filter tabs adapted from CategoryFilterTabs pattern with role=tablist
    - Mutually exclusive search and jurisdiction filter with debounced input
    - Location privacy enforced in application layer (sanitizeMember) not Firestore rules
    - Toggle switch (role=switch, aria-checked) for boolean preference inline in form

key-files:
  created:
    - src/app/actions/synodeia.ts
    - src/app/(main)/synodeia/page.tsx
    - src/components/synodeia/SynodeiaClient.tsx
    - src/components/synodeia/MemberCard.tsx
    - src/components/synodeia/SynodiaSkeleton.tsx
  modified:
    - src/components/profile/ProfileEditForm.tsx
    - src/components/nav/Navbar.tsx
    - src/components/nav/MobileMenu.tsx
    - tests/components/MemberCard.test.tsx

key-decisions:
  - "Search and jurisdiction filter are mutually exclusive — entering a search clears the active jurisdiction tab; selecting a tab clears search input"
  - "Location sharing toggle auto-saves on click via updateLocationSharing Server Action rather than waiting for main form submit"
  - "City/state inputs only rendered when locationSharingEnabled is true — prevents stale location data from saving when disabled"

patterns-established:
  - "Synodeia Client Component: initialMembers from Server Component, then Server Actions for filter/search updates"
  - "Location toggle: role=switch + aria-checked + immediate Server Action on click (no form submit needed)"

requirements-completed:
  - SYN-01
  - SYN-02
  - SYN-03
  - SYN-04

# Metrics
duration: ~10min (continuation from checkpoint)
completed: 2026-03-19
---

# Phase 4 Plan 03: Synodeia Summary

**Auth-gated Synodeia people finder with jurisdiction filter tabs, name search, member cards with location privacy, and location sharing toggle on profile edit page**

## Performance

- **Duration:** ~10 min (continuation after human verification checkpoint)
- **Started:** 2026-03-19 (continuation agent)
- **Completed:** 2026-03-19
- **Tasks:** 3 (tasks 1-2 code, task 3 human verification)
- **Files modified:** 9

## Accomplishments

- Built /synodeia page with auth gate — unauthenticated users see a sign-in prompt card; authenticated users see the member grid
- Implemented jurisdiction filter tabs (19 tabs: "All Jurisdictions" + 18 canonical jurisdictions) and debounced name search with mutual exclusion
- Added location sharing toggle to profile edit page with inline city/state inputs that auto-save via Server Action on toggle
- Added Calendar and Synodeia nav links to both desktop Navbar and MobileMenu between Videos and Scripture
- Filled MemberCard test stubs with real assertions covering display name, jurisdiction badge, city/state visibility, and avatar initial fallback

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Synodeia Server Actions, page, components, and profile edit extensions** - `20334c3` (feat)
2. **Task 2: Add Calendar and Synodeia links to Navbar and MobileMenu, fill MemberCard test stubs** - `4941a82` (feat)
3. **Task 3: Verify all Phase 4 features — Calendar and Synodeia** - Human verification checkpoint approved

## Files Created/Modified

- `src/app/actions/synodeia.ts` - Server Actions wrapping getMembersByJurisdiction and searchMembersByName
- `src/app/(main)/synodeia/page.tsx` - Auth-gated Server Component; fetches initial members; renders SynodeiaClient or sign-in gate
- `src/components/synodeia/SynodeiaClient.tsx` - Client Component with jurisdiction filter tabs, debounced search, member grid, loading/empty/error states
- `src/components/synodeia/MemberCard.tsx` - Presentational card: avatar, display name, jurisdiction badge, conditional city/state
- `src/components/synodeia/SynodiaSkeleton.tsx` - Loading skeleton (6 cards, aria-busy, animate-pulse)
- `src/components/profile/ProfileEditForm.tsx` - Added location sharing toggle section below Patron Saint field
- `src/components/nav/Navbar.tsx` - Added Calendar and Synodeia links between Videos and Scripture
- `src/components/nav/MobileMenu.tsx` - Added Calendar and Synodeia mobile links between Videos and Scripture
- `tests/components/MemberCard.test.tsx` - Replaced test.todo stubs with real render assertions

## Decisions Made

- Search and jurisdiction filter are mutually exclusive: entering a search clears the active tab to "All Jurisdictions"; clicking a tab clears the search input. Consistent with the search/filter exclusion pattern from Phase 2 (FeedClient).
- Location toggle auto-saves immediately on click (not deferred to main form submit) so the toggle state is always in sync with Firestore without requiring the user to click Save.
- City/state inputs hidden when location sharing is disabled to prevent stale values being passed to the Server Action.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 4 Orthodox Identity is fully complete: Liturgical Calendar (plan 02) and Synodeia people finder (plan 03) both human-verified
- Phase 5 Scripture Library can begin; /scripture route and Bible text data sourcing (Brenton LXX + EOB NT) are next
- Blocker flagged in STATE.md: resolve public-domain patristic text sources before Phase 6 planning

---
*Phase: 04-orthodox-identity*
*Completed: 2026-03-19*
