---
phase: 04-orthodox-identity
plan: 02
subsystem: ui
tags: [react, next.js, tailwind, calendar, liturgical, orthocal, testing-library]

requires:
  - phase: 04-01
    provides: fetchDayData, extractReadingRefs, formatCalendarDate, OrthodocalDay type, updateCalendarPreference Server Action

provides:
  - /calendar Server Component page with auth-aware calendar preference loading
  - CalendarDayView Client Component with feast/saint/fasting/readings sections
  - SaintCard Client Component with expand/collapse Synaxarion stories
  - ReadingRef Client Component as disabled Scripture stub
  - CalendarSkeleton loading state component
  - 12 passing component tests for all 3 interactive components

affects: [05-scripture-library, 07-discovery-messaging]

tech-stack:
  added: []
  patterns:
    - "Server Component reads auth token + profile calendarPreference, passes as props to Client Component"
    - "URL-driven navigation: router.push(?date=&cal=) triggers Server Component re-fetch"
    - "React useId() for stable aria-controls/id pairs in expandable components"
    - "Prop named 'reading' (not 'ref') for ReadingRef — ref is reserved in React"

key-files:
  created:
    - src/app/(main)/calendar/page.tsx
    - src/components/calendar/CalendarDayView.tsx
    - src/components/calendar/SaintCard.tsx
    - src/components/calendar/ReadingRef.tsx
    - src/components/calendar/CalendarSkeleton.tsx
    - tests/components/CalendarDayView.test.tsx
    - tests/components/SaintCard.test.tsx
    - tests/components/ReadingRef.test.tsx
  modified: []

key-decisions:
  - "ReadingRef prop renamed from 'ref' to 'reading' — 'ref' is reserved by React and silently stripped from function components"
  - "CalendarDayView uses router.push(?date=YYYY-MM-DD&cal=) for day navigation — Server Component re-fetches orthocal.info on each navigation"
  - "Guest calendar toggle uses local state + URL param; logged-in toggle calls updateCalendarPreference then navigates"
  - "SaintCard uses useId() from React for stable aria-controls/id binding across server/client renders"

patterns-established:
  - "Orthodox feast level styling: >=5 gold-bright, 3-4 gold, 1-2 gold-dim, 0 text-light"
  - "Disabled stub pattern: cursor-not-allowed + aria-disabled=true + title tooltip (no click handler)"
  - "Expandable card: aria-expanded on button + aria-controls pointing to content id + ChevronDown rotate-180"

requirements-completed: [CAL-01, CAL-02, CAL-03, CAL-04, CAL-05, CAL-06, CAL-07]

duration: 4min
completed: 2026-03-19
---

# Phase 04 Plan 02: Liturgical Calendar UI Summary

**Server Component /calendar page with CalendarDayView hero, expandable SaintCards, disabled ReadingRef stubs, and 12 passing component tests across feast/fasting/navigation/accessibility**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-19T06:13:34Z
- **Completed:** 2026-03-19T06:18:00Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- /calendar route renders today's liturgical data from orthocal.info with feast display, saints, fasting rule, and readings sections
- SaintCard expands/collapses Synaxarion stories inline with proper ARIA (aria-expanded, aria-controls, ChevronDown rotate)
- ReadingRef renders as non-interactive disabled stub with cursor-not-allowed, aria-disabled, and "Scripture Library — coming soon" tooltip
- Calendar system toggle (New/Old Julian) persists to userProfiles for logged-in users via updateCalendarPreference Server Action
- All 15 calendar tests pass (12 new component tests + 3 existing lib tests)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create CalendarDayView, SaintCard, ReadingRef, CalendarSkeleton, and /calendar page** - `071559d` (feat)
2. **Task 2: Fill component test stubs with real assertions** - `27fa730` (test)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `src/app/(main)/calendar/page.tsx` — Server Component: auth-aware calendar preference, fetchDayData, Suspense wrapper
- `src/components/calendar/CalendarDayView.tsx` — Client Component: hero day view with 5 sections, toggle, prev/next nav
- `src/components/calendar/SaintCard.tsx` — Client Component: expandable Synaxarion card with feast-level styling
- `src/components/calendar/ReadingRef.tsx` — Client Component: disabled Scripture stub with accessibility attributes
- `src/components/calendar/CalendarSkeleton.tsx` — Loading skeleton with aria-busy and animate-pulse
- `tests/components/CalendarDayView.test.tsx` — 5 real assertions replacing stubs
- `tests/components/SaintCard.test.tsx` — 3 real assertions replacing stubs
- `tests/components/ReadingRef.test.tsx` — 4 real assertions replacing stubs

## Decisions Made

- **ReadingRef prop renamed 'reading':** React silently strips the `ref` prop from function components (it's reserved for ref forwarding). Renamed to `reading` throughout so the prop actually reaches the component.
- **URL-driven navigation:** day navigation pushes `?date=YYYY-MM-DD&cal=` to trigger Server Component re-fetch, keeping data fetching server-side (orthocal.info API stays server-only).
- **Guest toggle uses URL params:** guest users get `cal=` URL param override; no Firestore write needed.
- **useId() for ARIA:** React's `useId()` generates stable IDs across server/client renders, used for aria-controls on SaintCard.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Renamed ReadingRef prop from `ref` to `reading`**
- **Found during:** Task 2 (writing tests — prop would not be passed through by React)
- **Issue:** React treats `ref` as a special prop and silently strips it from non-forwardRef components. The `reading.display` would have thrown a runtime error.
- **Fix:** Changed interface prop name from `ref: ReadingRefType` to `reading: ReadingRefType`; updated CalendarDayView to pass `reading={ref}` instead of `ref={ref}`.
- **Files modified:** src/components/calendar/ReadingRef.tsx, src/components/calendar/CalendarDayView.tsx
- **Verification:** TypeScript passes; ReadingRef test renders correctly; `screen.getByText('John 3:16-21')` finds the element.
- **Committed in:** 27fa730 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug)
**Impact on plan:** Critical correctness fix — component would have rendered blank reading text at runtime without the fix. No scope creep.

## Issues Encountered

None beyond the auto-fixed prop naming bug.

## Next Phase Readiness

- /calendar page is complete and ready for human verification in Plan 04-03
- All CAL-01 through CAL-07 requirements addressed
- ReadingRef stubs are positioned correctly for Phase 5 (Scripture Library) to replace with live links

---
*Phase: 04-orthodox-identity*
*Completed: 2026-03-19*
