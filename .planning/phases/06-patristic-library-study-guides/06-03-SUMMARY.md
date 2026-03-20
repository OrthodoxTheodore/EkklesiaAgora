---
phase: 06-patristic-library-study-guides
plan: 03
subsystem: ui
tags: [nextjs, react, firestore, tailwind, byzantine]

# Dependency graph
requires:
  - phase: 06-patristic-library-study-guides
    provides: Patristic data layer (types, Firestore queries, seed data)
  - phase: 06-patristic-library-study-guides
    provides: Church Fathers landing, author detail, text reader, and search pages

provides:
  - Study guides landing page at /fathers/guides listing all guides with topic tags and step counts
  - Individual study guide pages at /fathers/guides/[slug] with numbered steps and deep links
  - StudyGuideCard and StudyGuideViewer components with Byzantine styling
  - Church Fathers dropdown in desktop Navbar (hover-reveal, mutually exclusive with avatar dropdown)
  - Flat Browse Fathers and Study Guides links in MobileMenu

affects: [07-discovery-messaging]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Server Component fetches resolvedLinks by querying patristic_texts collection to map refId to /fathers/[authorSlug]/[textId] URL"
    - "Dropdown mutual exclusion: fathersOpen and avatarOpen states never both true simultaneously"
    - "Flat mobile nav links mirror desktop dropdown items — no nested menus on mobile"

key-files:
  created:
    - src/app/(main)/fathers/guides/page.tsx
    - src/app/(main)/fathers/guides/[slug]/page.tsx
    - src/components/fathers/StudyGuideCard.tsx
    - src/components/fathers/StudyGuideViewer.tsx
  modified:
    - src/components/nav/Navbar.tsx
    - src/components/nav/MobileMenu.tsx
    - tests/components/StudyGuideViewer.test.tsx

key-decisions:
  - "resolvedLinks built server-side by fetching each patristic refId from Firestore — avoids client-side reads and keeps the viewer component purely presentational"
  - "Fathers dropdown uses onMouseEnter/onMouseLeave for hover behavior plus onClick for keyboard/touch — progressive enhancement"
  - "MobileMenu uses flat links (no nested dropdowns) — simpler UX on small screens"

patterns-established:
  - "StudyGuideViewer receives resolvedLinks as a prop — Server Component owns data fetching, client component owns rendering only"
  - "Deep links to /scripture/[book]/[chapter]#verse-N are stored directly on StudyGuideItem.href; patristic deep links are resolved at render time from refId"

requirements-completed: [STD-01, STD-02, STD-03]

# Metrics
duration: ~25min
completed: 2026-03-20
---

# Phase 6 Plan 03: Study Guides and Navbar Integration Summary

**Study guide pages with numbered steps and Scripture/patristic deep links, plus Church Fathers navbar dropdown completing Phase 6 patristic library**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-03-20
- **Completed:** 2026-03-20
- **Tasks:** 2 (plus 1 human verification checkpoint)
- **Files modified:** 7

## Accomplishments

- Study guides landing page at /fathers/guides with grid of guide cards (topic tag, title, step count badge, hover border animation)
- Individual study guide pages at /fathers/guides/[slug] with ordered steps showing numbered steps, titles, descriptions, and deep-link buttons ("Read Text" / "Read Scripture")
- Server Component resolves patristic refIds to full /fathers/[authorSlug]/[textId] URLs before rendering — viewer stays purely presentational
- Church Fathers dropdown added to desktop Navbar (hover + click, mutually exclusive with avatar dropdown)
- Browse Fathers and Study Guides flat links added to MobileMenu
- Human verified full Phase 6 feature set end-to-end

## Task Commits

Each task was committed atomically:

1. **Task 1: Study guide pages and components** - `0414b7d` (feat)
2. **Task 2: Navbar dropdown and MobileMenu links** - `e522a1d` (feat)

## Files Created/Modified

- `src/app/(main)/fathers/guides/page.tsx` - Study guides landing page (Server Component, calls getStudyGuides)
- `src/app/(main)/fathers/guides/[slug]/page.tsx` - Individual guide page (Server Component, resolves patristic deep links)
- `src/components/fathers/StudyGuideCard.tsx` - Presentational card with topic tag, title, description, step count badge
- `src/components/fathers/StudyGuideViewer.tsx` - Client component rendering ordered step list with Read Text / Read Scripture links
- `src/components/nav/Navbar.tsx` - Added fathersOpen state and Church Fathers hover dropdown
- `src/components/nav/MobileMenu.tsx` - Added Browse Fathers and Study Guides flat links
- `tests/components/StudyGuideViewer.test.tsx` - Updated stubs to use real component with resolvedLinks prop

## Decisions Made

- resolvedLinks built server-side: the guide detail Server Component fetches each patristic refId from Firestore to build a map of refId -> /fathers/[authorSlug]/[textId] before passing it to StudyGuideViewer. This keeps the client component purely presentational.
- Dropdown uses both onMouseEnter/onMouseLeave (desktop hover) and onClick (keyboard/touch) for progressive enhancement.
- MobileMenu uses flat links instead of nested dropdowns for simpler mobile UX.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 6 complete: full patristic library (data layer, UI pages, study guides, navbar) shipped and human-verified
- All 40 test suites pass (117 passing tests, 92 todo stubs)
- Phase 7 (Discovery + Messaging — global search, DMs) is unblocked and ready to plan

---
*Phase: 06-patristic-library-study-guides*
*Completed: 2026-03-20*
