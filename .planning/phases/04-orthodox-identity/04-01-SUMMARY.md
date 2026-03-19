---
phase: 04-orthodox-identity
plan: 01
subsystem: api, database, testing
tags: [orthocal, firestore, typescript, calendar, synodeia, firebase-admin]

# Dependency graph
requires:
  - phase: 03-video-hub-moderation
    provides: buildVideoSearchKeywords pattern for prefix search keywords

provides:
  - OrthodocalDay, ReadingRef, SaintStory, CalendarSystem types (src/lib/types/calendar.ts)
  - fetchDayData wrapping orthocal.info API with 24-hour Next.js revalidation cache
  - extractReadingRefs separating gospel/epistle readings from OrthodocalDay
  - formatCalendarDate with (O.S.) suffix for Old Julian calendar display
  - SynodeiaMember interface and sanitizeMember privacy enforcement
  - buildDisplayNameKeywords prefix-based name search keyword builder
  - getMembersByJurisdiction filtering to canonical Eastern Orthodox only
  - searchMembersByName with displayNameKeywords array-contains Firestore query
  - UserProfile extended with calendarPreference, locationSharingEnabled, city, stateRegion, displayNameKeywords
  - updateCalendarPreference and updateLocationSharing Server Actions
  - Two composite Firestore indexes for Synodeia compound queries
  - Wave 0 test stubs for all Phase 4 calendar and Synodeia components

affects: [04-02-calendar-ui, 04-03-synodeia-ui]

# Tech tracking
tech-stack:
  added: [orthocal.info API (external, no package)]
  patterns:
    - orthocal.info endpoint: new_julian -> /api/gregorian/, old_julian -> /api/julian/
    - CANONICAL_IDS typed as string[] to permit .includes() on string arguments
    - sanitizeMember enforces location privacy (Firestore rules cannot gate individual fields)
    - buildDisplayNameKeywords generates all prefixes >= 2 chars per word token (adapted from buildVideoSearchKeywords)
    - firebase-admin mocked with jest.mock() hoisting + require() in test files

key-files:
  created:
    - src/lib/types/calendar.ts
    - src/lib/calendar/orthocal.ts
    - src/lib/firestore/synodeia.ts
    - tests/lib/calendar.test.ts
    - tests/lib/synodeia.test.ts
    - tests/components/CalendarDayView.test.tsx
    - tests/components/SaintCard.test.tsx
    - tests/components/ReadingRef.test.tsx
    - tests/components/MemberCard.test.tsx
  modified:
    - src/lib/types/social.ts
    - src/app/actions/profile.ts
    - firestore.indexes.json

key-decisions:
  - "orthocal.info endpoint mapping: new_julian->gregorian, old_julian->julian — do not swap (Revised Julian aligns with civil dates, Old Julian is 13 days behind)"
  - "CANONICAL_IDS typed as string[] to allow .includes(string) — readonly literal tuple from as const would cause TS2345"
  - "sanitizeMember privacy enforcement in application layer — Firestore security rules cannot gate individual document fields"
  - "buildDisplayNameKeywords generates prefixes >= 2 chars (not 3+ like buildVideoSearchKeywords) — names like 'Li' or 'Bo' need 2-char match"
  - "updateProfile rebuilds displayNameKeywords on every profile update — keeps keywords always in sync with displayName"

patterns-established:
  - "Calendar API pattern: fetch with next.revalidate for ISR caching; always use response date fields for display"
  - "Synodeia query pattern: canonical jurisdiction filter enforced in query (in array) and verified before single-jurisdiction queries"
  - "Location privacy: sanitizeMember strips city/stateRegion whenever locationSharingEnabled !== true (strict equality)"

requirements-completed: [CAL-01, CAL-05, CAL-06, CAL-07, SYN-01, SYN-02, SYN-03, SYN-04]

# Metrics
duration: 3min
completed: 2026-03-19
---

# Phase 4 Plan 01: Orthodox Identity Data Layer Summary

**orthocal.info API wrapper with gospel/epistle reading extraction, Synodeia Firestore queries with canonical jurisdiction enforcement and location privacy, UserProfile extended for calendar and location preferences, and Wave 0 test stubs for all Phase 4 components**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-19T06:06:59Z
- **Completed:** 2026-03-19T06:10:19Z
- **Tasks:** 2
- **Files modified:** 12 (6 created new, 3 modified existing, 6 test stubs created)

## Accomplishments

- Calendar data layer: orthocal.info API wrapper with correct endpoint mapping (new_julian/old_julian), ReadingRef extraction separating gospel from epistle readings, date formatter with O.S. suffix for Old Julian
- Synodeia data layer: Firestore queries exclusively filtering canonical Eastern Orthodox jurisdictions, location privacy enforcement via sanitizeMember (not Firestore rules), prefix keyword builder for display name search
- UserProfile extended with 5 new fields; updateProfile now rebuilds displayNameKeywords on every save; two new Server Actions added for calendar preference and location sharing settings
- All 9 real tests pass (extractReadingRefs, formatCalendarDate, sanitizeMember, buildDisplayNameKeywords); 16 todo stubs in place for Plan 02 and 03 UI components

## Task Commits

Each task was committed atomically:

1. **Task 1: Calendar types, orthocal.info API wrapper, Synodeia queries, UserProfile extension** - `ec4e46f` (feat)
2. **Task 2: Wave 0 test stubs for all Phase 4 components** - `b2bcf15` (test)

## Files Created/Modified

- `src/lib/types/calendar.ts` - OrthodocalDay, ReadingRef, SaintStory, CalendarSystem type definitions
- `src/lib/calendar/orthocal.ts` - fetchDayData, extractReadingRefs, formatCalendarDate
- `src/lib/firestore/synodeia.ts` - SynodeiaMember, sanitizeMember, buildDisplayNameKeywords, getMembersByJurisdiction, searchMembersByName
- `src/lib/types/social.ts` - UserProfile extended with calendarPreference, locationSharingEnabled, city, stateRegion, displayNameKeywords
- `src/app/actions/profile.ts` - Added updateCalendarPreference, updateLocationSharing; integrated buildDisplayNameKeywords into updateProfile
- `firestore.indexes.json` - Two composite indexes: displayNameKeywords+jurisdictionId, jurisdictionId+displayName
- `tests/lib/calendar.test.ts` - Real tests for extractReadingRefs and formatCalendarDate
- `tests/lib/synodeia.test.ts` - Real tests for sanitizeMember and buildDisplayNameKeywords
- `tests/components/CalendarDayView.test.tsx` - Todo stubs for Plan 04-02
- `tests/components/SaintCard.test.tsx` - Todo stubs for Plan 04-02
- `tests/components/ReadingRef.test.tsx` - Todo stubs for Plan 04-02
- `tests/components/MemberCard.test.tsx` - Todo stubs for Plan 04-03

## Decisions Made

- orthocal.info endpoint mapping: new_julian uses `/api/gregorian/`, old_julian uses `/api/julian/` — these must not be swapped (Revised Julian fixed feasts align with civil calendar; Old Julian is currently 13 days behind)
- `CANONICAL_IDS` typed as `string[]` explicitly to allow `.includes(string)` — TypeScript rejects string arguments to `.includes()` when the array is inferred as a readonly literal tuple from `as const`
- `sanitizeMember` enforces location privacy in the application layer — Firestore security rules can restrict document access but cannot selectively redact individual fields within a document
- `buildDisplayNameKeywords` generates prefixes >= 2 chars (not 3 like `buildVideoSearchKeywords`) — personal names like "Li" or "Bo" need 2-char matching; the 3-char minimum from video search is not appropriate for name tokens

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] TypeScript error: CANONICAL_IDS.includes() rejected string argument**
- **Found during:** Task 1 (TypeScript compilation check)
- **Issue:** `CANONICAL_ORTHODOX_JURISDICTIONS.map(j => j.id)` inferred as readonly tuple of literal string types; TypeScript TS2345 rejects `.includes(string)` because the array only officially contains the known literal IDs
- **Fix:** Added explicit `: string[]` type annotation to `CANONICAL_IDS` declaration
- **Files modified:** `src/lib/firestore/synodeia.ts`
- **Verification:** `npx tsc --noEmit` exits 0
- **Committed in:** `ec4e46f` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - type error)
**Impact on plan:** Single type annotation addition; no logic changes. All intended behavior preserved.

## Issues Encountered

None — one TypeScript type annotation auto-fix required but resolved immediately.

## User Setup Required

None - no external service configuration required. orthocal.info is a public API requiring no authentication.

## Next Phase Readiness

- Plan 04-02 (Calendar UI) can now import from `@/lib/types/calendar` and `@/lib/calendar/orthocal`
- Plan 04-03 (Synodeia UI) can now import from `@/lib/firestore/synodeia`
- Wave 0 test stubs are in place; Plans 02 and 03 fill in the component implementations
- Firestore indexes must be deployed before Synodeia queries run against production: `firebase deploy --only firestore:indexes`

---
*Phase: 04-orthodox-identity*
*Completed: 2026-03-19*
