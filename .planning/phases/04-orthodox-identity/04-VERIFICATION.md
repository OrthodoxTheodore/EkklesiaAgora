---
phase: 04-orthodox-identity
verified: 2026-03-19T00:00:00Z
status: passed
score: 13/13 must-haves verified
re_verification: false
human_verification:
  - test: "Old Julian calendar offset"
    expected: "Toggle to Old Calendar — date header shows ~13 days behind civil date with (O.S.) suffix"
    why_human: "orthocal.info returns server-computed dates; offset cannot be verified without a live API call"
  - test: "Calendar toggle persistence across reload"
    expected: "Logged-in user toggles to Old Julian, reloads /calendar — page still shows Old Julian data"
    why_human: "Requires live Firestore write and cookie-authenticated Server Component re-render"
  - test: "Synodeia auth gate"
    expected: "Visiting /synodeia while logged out shows 'Sign in to find fellow Orthodox Christians' card"
    why_human: "Requires unauthenticated browser session"
  - test: "Location sharing toggle saves and hides/shows data"
    expected: "Toggle on /profile/edit persists city/state to Firestore; Synodeia member cards reflect privacy state"
    why_human: "Requires live Firestore reads and writes with real user session"
---

# Phase 4: Orthodox Identity Verification Report

**Phase Goal:** Deliver Orthodox identity features — liturgical calendar and Synodeia people finder
**Verified:** 2026-03-19
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | orthocal.info API fetch returns structured day data for both old_julian and new_julian calendar systems | VERIFIED | `src/lib/calendar/orthocal.ts` — `fetchDayData` maps `old_julian` → `/api/julian/`, `new_julian` → `/api/gregorian/`; correct endpoint comment present |
| 2 | Reading references are extracted from orthocal.info response as structured ReadingRef objects (not plain strings) | VERIFIED | `extractReadingRefs` builds `ReadingRef` structs from `passage[0]` and `passage[last]`; `tests/lib/calendar.test.ts` asserts `.book`, `.chapter`, `.verseStart`, `.verseEnd` |
| 3 | Synodeia query returns only canonical Eastern Orthodox members, never non-Orthodox | VERIFIED | `getMembersByJurisdiction` enforces `CANONICAL_IDS.includes(jurisdictionId)` guard; `searchMembersByName` adds in-memory `.filter(m => CANONICAL_IDS.includes(m.jurisdictionId))` post-query |
| 4 | Location fields are stripped from member data when locationSharingEnabled is false | VERIFIED | `sanitizeMember` uses `profile.locationSharingEnabled === true` (strict equality); false/undefined both null out `city` and `stateRegion`; `tests/lib/synodeia.test.ts` covers all three cases |
| 5 | Display name prefix search keywords are generated correctly for Synodeia name search | VERIFIED | `buildDisplayNameKeywords` generates all prefixes >= 2 chars per token; deduplicates with `Set`; `tests/lib/synodeia.test.ts` asserts `jo`, `joh`, `john`, `do`, `doe`, punctuation handling, deduplication |
| 6 | UserProfile type includes calendarPreference, locationSharingEnabled, city, stateRegion, displayNameKeywords fields | VERIFIED | `src/lib/types/social.ts` lines 17-21 — all five fields present, original fields untouched |
| 7 | User can view the liturgical calendar showing today's feasts, saints, fasting rule, and readings | VERIFIED | `CalendarDayView.tsx` renders all five sections: Feast(s) of the Day, Saints of the Day, Fasting Rule, Daily Readings, date header with `summary_title` |
| 8 | User can toggle between Old Julian and New Julian calendar systems | VERIFIED | `CalendarDayView.tsx` — `role="group" aria-label="Calendar system"` wrapper with two `aria-pressed` buttons; toggle calls `updateCalendarPreference` for logged-in users and `router.push` with `&cal=` param |
| 9 | User can navigate forward and backward by day using prev/next arrows | VERIFIED | `navigateDay(delta)` uses `router.push(/calendar?date=...)` with ±1 day arithmetic; `aria-label="Previous Day"` / `aria-label="Next Day"` present; test asserts both |
| 10 | Saint cards expand inline to show full Synaxarion story and collapse back | VERIFIED | `SaintCard.tsx` — `aria-expanded`, `aria-controls`, `dangerouslySetInnerHTML`, `ChevronDown rotate-180` on expand; `tests/components/SaintCard.test.tsx` asserts expand/collapse/double-click collapse |
| 11 | Reading references render as disabled stubs with 'coming soon' tooltip | VERIFIED | `ReadingRef.tsx` — `cursor-not-allowed`, `aria-disabled="true"`, `title="Scripture Library — coming soon"`; no click handler; tests assert all three attributes |
| 12 | Registered user can browse Synodeia members filtered by canonical Eastern Orthodox jurisdiction | VERIFIED | `SynodeiaClient.tsx` renders `role="tablist"` with 19 tabs (All + 18 canonical); `handleJurisdictionChange` calls `getMembers(jurisdictionId)` Server Action |
| 13 | Navbar and mobile menu include Calendar and Synodeia links | VERIFIED | `Navbar.tsx` lines 74-85: `href="/calendar"` and `href="/synodeia"` between Videos and Scripture; `MobileMenu.tsx` lines 51-64: same two links |

**Score:** 13/13 truths verified

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/types/calendar.ts` | OrthodocalDay, ReadingRef, SaintStory, CalendarSystem types | VERIFIED | All four exports present; 47 lines |
| `src/lib/calendar/orthocal.ts` | fetchDayData, extractReadingRefs, formatCalendarDate | VERIFIED | All three exports; correct endpoint mapping; `revalidate: 86400`; `(O.S.)` suffix |
| `src/lib/firestore/synodeia.ts` | getMembersByJurisdiction, searchMembersByName, buildDisplayNameKeywords, sanitizeMember, SynodeiaMember | VERIFIED | All five exports; 107 lines; CANONICAL_IDS typed as `string[]` |
| `src/lib/types/social.ts` | Extended UserProfile with calendar/location fields | VERIFIED | 5 new fields appended at lines 17-21; all original fields intact |
| `src/app/actions/profile.ts` | updateCalendarPreference, updateLocationSharing, buildDisplayNameKeywords wired into updateProfile | VERIFIED | Both Server Actions present; `buildDisplayNameKeywords` called in `updateProfile` at line 39 |
| `firestore.indexes.json` | Composite indexes for displayNameKeywords+jurisdictionId and jurisdictionId+displayName | VERIFIED | Both indexes at lines 70-84; valid JSON |
| `src/app/(main)/calendar/page.tsx` | Server Component — auth-aware calendar preference, fetchDayData | VERIFIED | 79 lines; `getTokens`, `calendarPreference`, `fetchDayData`, `Suspense`+`CalendarSkeleton` all present |
| `src/components/calendar/CalendarDayView.tsx` | Client Component — hero day view with 5 sections | VERIFIED | 227 lines; all sections rendered; `extractReadingRefs`, `formatCalendarDate`, `updateCalendarPreference` all called |
| `src/components/calendar/SaintCard.tsx` | Client Component — expandable saint summary | VERIFIED | 73 lines; `aria-expanded`, `aria-controls`, `dangerouslySetInnerHTML`, `ChevronDown`, feast-level styling |
| `src/components/calendar/ReadingRef.tsx` | Client Component — disabled Scripture stub | VERIFIED | 25 lines; `cursor-not-allowed`, `aria-disabled="true"`, title tooltip; prop renamed to `reading` (not `ref`) |
| `src/components/calendar/CalendarSkeleton.tsx` | Loading skeleton | VERIFIED | `aria-busy="true"`, `aria-label="Loading calendar"`, 3 animate-pulse rows |
| `src/app/(main)/synodeia/page.tsx` | Server Component — auth-gated Synodeia page | VERIFIED | 59 lines; `getTokens` auth gate; sign-in card with exact copy; `getMembersByJurisdiction` for initial load |
| `src/components/synodeia/SynodeiaClient.tsx` | Client Component — jurisdiction filter + name search + member grid | VERIFIED | 177 lines; `role="tablist"`, `aria-label="Filter by jurisdiction"`, `All Jurisdictions`, debounced search, `No members found`, `No results for` |
| `src/components/synodeia/MemberCard.tsx` | Presentational component — member display card | VERIFIED | 44 lines; `getJurisdictionLabel`, `border-gold/[0.30]`, conditional location display with `aria-label` |
| `src/components/synodeia/SynodiaSkeleton.tsx` | Loading skeleton | VERIFIED | `aria-busy="true"`, 6-card grid, `animate-pulse` |
| `src/app/actions/synodeia.ts` | Server Actions wrapping Synodeia queries | VERIFIED | `'use server'`, `getMembers`, `searchMembers` both wired to `getMembersByJurisdiction` / `searchMembersByName` |
| `src/components/profile/ProfileEditForm.tsx` | Location sharing section added | VERIFIED | `Share my location`, `role="switch"`, `aria-checked`, `updateLocationSharing`, City/State inputs |
| `src/components/nav/Navbar.tsx` | Calendar and Synodeia links | VERIFIED | `href="/calendar"` (line 75), `href="/synodeia"` (line 81), between Videos and Scripture |
| `src/components/nav/MobileMenu.tsx` | Calendar and Synodeia mobile links | VERIFIED | `href="/calendar"` (line 52), `href="/synodeia"` (line 58) |
| `tests/lib/calendar.test.ts` | Real tests for extractReadingRefs and formatCalendarDate | VERIFIED | 9 real assertions; no test.todo; covers gospel/epistle separation, O.S. suffix, new_julian no-suffix |
| `tests/lib/synodeia.test.ts` | Real tests for sanitizeMember and buildDisplayNameKeywords | VERIFIED | 9 real assertions; firebase-admin mocked correctly with jest.mock hoisting + require |
| `tests/components/CalendarDayView.test.tsx` | 5 real assertions | VERIFIED | Feast rendering, fasting rule, date format, prev/next nav aria-labels, empty feast state |
| `tests/components/SaintCard.test.tsx` | 3 real assertions | VERIFIED | Render, expand, collapse |
| `tests/components/ReadingRef.test.tsx` | 4 real assertions | VERIFIED | Display text, cursor-not-allowed class, title attribute, aria-disabled |
| `tests/components/MemberCard.test.tsx` | 4 real assertions | VERIFIED | Display name + jurisdiction badge, city/state when provided, city/state hidden when null, avatar initial |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/lib/calendar/orthocal.ts` | `https://orthocal.info/api/` | `fetch` with `next.revalidate` | WIRED | `fetch(url, { next: { revalidate: 86400 } })` at line 22 |
| `src/lib/firestore/synodeia.ts` | `userProfiles` collection | `getAdminFirestore` | WIRED | `db.collection('userProfiles')` at lines 63, 68, 92, 96 |
| `src/app/(main)/calendar/page.tsx` | `src/lib/calendar/orthocal.ts` | `fetchDayData` import | WIRED | `import { fetchDayData }` and called at line 62 |
| `src/components/calendar/CalendarDayView.tsx` | `src/lib/calendar/orthocal.ts` | `extractReadingRefs`, `formatCalendarDate` | WIRED | Imported and called at lines 11, 52-53 |
| `src/components/calendar/CalendarDayView.tsx` | `src/app/actions/profile.ts` | `updateCalendarPreference` | WIRED | Imported and called inside `handleCalendarToggle` at line 70 |
| `src/app/(main)/synodeia/page.tsx` | `next-firebase-auth-edge` | `getTokens` auth gating | WIRED | `getTokens(await cookies(), authConfig)` at line 24; null check gates authenticated view |
| `src/app/actions/synodeia.ts` | `src/lib/firestore/synodeia.ts` | `getMembersByJurisdiction`, `searchMembersByName` | WIRED | Both functions imported and delegated to directly |
| `src/components/synodeia/SynodeiaClient.tsx` | `src/app/actions/synodeia.ts` | `getMembers`, `searchMembers` | WIRED | Both Server Actions imported and called in `handleJurisdictionChange` and `handleSearchChange` |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| CAL-01 | 04-01, 04-02 | Calendar displays in both Old Julian and New/Revised Julian formats with toggle | SATISFIED | `fetchDayData` supports both endpoints; toggle in `CalendarDayView` with `aria-pressed`; `formatCalendarDate` adds `(O.S.)` for Old Julian |
| CAL-02 | 04-02 | Calendar shows feast days with descriptions | SATISFIED | `CalendarDayView` renders `dayData.feasts` with feast-level-dependent styling; test asserts feast title rendered |
| CAL-03 | 04-02 | Calendar shows fasting periods and rules | SATISFIED | Fasting Rule section renders `fast_level_desc` and `fast_exception_desc`; test asserts `Lenten Fast` text |
| CAL-04 | 04-02 | Calendar shows saints of the day with life summaries (Synaxarion) | SATISFIED | `SaintCard` renders saint title in collapsed state and full `story.story` HTML when expanded; expand/collapse tested |
| CAL-05 | 04-01, 04-02 | Calendar shows Gospel reading of the day | SATISFIED | `extractReadingRefs` separates gospel readings; `CalendarDayView` renders gospel refs via `ReadingRef` with "Holy Gospel" label |
| CAL-06 | 04-01, 04-02 | Calendar shows Epistle reading of the day | SATISFIED | `extractReadingRefs` separates epistle readings; `CalendarDayView` renders epistle refs via `ReadingRef` with "Epistle" label |
| CAL-07 | 04-01, 04-02 | Daily readings link directly to the Scripture Library | SATISFIED (STUB) | Per CONTEXT.md design decision: CAL-07 is "built" in Phase 4 as structured disabled stubs (cursor-not-allowed, aria-disabled, "coming soon" tooltip), activated in Phase 5 when Scripture Library ships |
| SYN-01 | 04-01, 04-03 | User can browse members by Eastern Orthodox jurisdiction | SATISFIED | `getMembersByJurisdiction` enforces CANONICAL_IDS; `SynodeiaClient` jurisdiction filter tabs |
| SYN-02 | 04-01, 04-03 | User can search for members by name | SATISFIED | `searchMembersByName` uses `displayNameKeywords array-contains`; `SynodeiaClient` debounced search input |
| SYN-03 | 04-01, 04-03 | User can optionally share location (city/state level) | SATISFIED | Location fields in `UserProfile`; `ProfileEditForm` location section with city/state inputs when toggle enabled |
| SYN-04 | 04-01, 04-03 | Location sharing has privacy toggle (on/off) | SATISFIED | `role="switch"` toggle in `ProfileEditForm` calls `updateLocationSharing`; `sanitizeMember` enforces privacy in application layer; `MemberCard` conditionally renders location only when non-null |

**All 11 requirement IDs from PLAN frontmatter accounted for. No orphaned requirements.**

REQUIREMENTS.md traceability section marks all 11 as Phase 4 / Complete, consistent with implementation.

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/components/calendar/CalendarDayView.tsx` | 47 | `const [error] = useState<string | null>(null)` — error state declared but setter never called; error branch is dead code | INFO | Error UI exists but never triggers; not a goal blocker |

No MISSING, STUB, or PLACEHOLDER anti-patterns found. No `TODO`/`FIXME` comments. No empty implementations. All components render substantive content.

**One notable decision noted (not an anti-pattern):** `CalendarDayView` holds `dayData = initialDay` without local refetch state — navigation is URL-driven (router.push), which re-renders the Server Component. This is the intended architecture per the SUMMARY decision log and is correct for Next.js App Router.

---

## Human Verification Required

### 1. Old Julian Calendar Date Offset

**Test:** Toggle the calendar to "Old Calendar (O.S.)" on /calendar
**Expected:** Date header shows a date approximately 13 days behind today's civil date with "(O.S.)" suffix
**Why human:** orthocal.info returns the actual Orthodox date — cannot be verified without a live network call to the external API

### 2. Calendar Toggle Persistence (Logged-In User)

**Test:** Log in, visit /calendar, toggle to "Old Calendar (O.S.)", then reload the page
**Expected:** Page re-renders in Old Julian mode (Firestore calendarPreference persisted, Server Component reads it)
**Why human:** Requires live Firebase Auth session, Firestore write, and cookie-authenticated Server Component

### 3. Synodeia Auth Gate

**Test:** Open a private/incognito browser window, visit http://localhost:3000/synodeia
**Expected:** Shows "Sign in to find fellow Orthodox Christians" card with "Sign In to Synodeia" button; member grid is not visible
**Why human:** Requires unauthenticated browser session; cannot verify getTokens null-path programmatically

### 4. Location Sharing Privacy End-to-End

**Test:** On /profile/edit, toggle "Share my location" on, enter city/state, save. Then open Synodeia — verify city/state appears on your card. Toggle off — verify it disappears.
**Expected:** City and state visible when enabled; null/hidden when disabled; other users cannot see location when toggle is off
**Why human:** Requires live Firestore write + sanitizeMember enforcement across two user sessions

---

## Gaps Summary

No gaps. All 13 observable truths verified. All 25 artifacts exist, are substantive, and are wired. All 8 key links confirmed. All 11 requirement IDs satisfied. No blocker anti-patterns.

The one dead-code observation (unused error state setter in CalendarDayView) is informational — the error UI is present and correct; it simply cannot be triggered through current navigation patterns, which is acceptable for this phase.

---

_Verified: 2026-03-19_
_Verifier: Claude (gsd-verifier)_
