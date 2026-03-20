---
phase: 07-discovery-messaging
plan: "01"
subsystem: search
tags: [search, firestore, aggregation, navbar, ui]
dependency_graph:
  requires:
    - src/lib/firestore/videos.ts (searchVideos added)
    - src/lib/firestore/posts.ts (searchPosts added)
    - src/lib/firestore/synodeia.ts (searchMembersByName)
    - src/lib/firestore/scripture.ts (searchVerses)
    - src/lib/firestore/patristic.ts (searchPatristicTexts)
  provides:
    - src/lib/firestore/search.ts (globalSearch, GlobalSearchResults)
    - src/app/(main)/search/page.tsx (search results page)
    - src/components/search/SearchResultsClient.tsx (tabbed results UI)
    - src/components/search/SearchBar.tsx (navbar desktop input + mobile icon)
    - src/components/search/SearchResultCard.tsx (individual result card)
  affects:
    - src/components/nav/Navbar.tsx (SearchBar integrated)
    - src/components/nav/MobileMenu.tsx (Search link added)
tech_stack:
  added: []
  patterns:
    - Promise.all aggregation across 5 Firestore search functions
    - Server Component page with searchParams awaited
    - Client-side tab switching with router.push URL state
    - Debounced search input with 300ms delay
key_files:
  created:
    - src/lib/firestore/search.ts
    - tests/lib/search.test.ts
    - src/components/search/SearchBar.tsx
    - src/components/search/SearchResultCard.tsx
    - src/components/search/SearchResultsClient.tsx
    - src/app/(main)/search/page.tsx
  modified:
    - src/lib/firestore/videos.ts
    - src/lib/firestore/posts.ts
    - src/components/nav/Navbar.tsx
    - src/components/nav/MobileMenu.tsx
    - src/app/(main)/agora/[postId]/page.tsx
    - src/app/(main)/videos/[id]/page.tsx
decisions:
  - globalSearch limitPerType defaults to 50 so Server Component pre-fetches enough for All tab (5 per type) plus full individual tabs (10 + Load More increments)
  - Search page has no auth guard — available to all users including guests (per AUTH-05)
  - searchVideos filters status==published to prevent unreviewed content in search results
  - Tab switching uses router.push to update URL so browser back/forward works and tabs are shareable
  - 300ms debounce in SearchBar desktop input navigates after typing pauses
metrics:
  duration: "651 seconds (~11 minutes)"
  completed_date: "2026-03-20"
  tasks_completed: 2
  files_changed: 12
---

# Phase 7 Plan 01: Global Search Summary

**One-liner:** globalSearch aggregates 5 Firestore content types (videos, posts, people, Scripture, Church Fathers) in parallel via Promise.all with a tabbed /search page and navbar SearchBar.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Add searchVideos, searchPosts, globalSearch aggregation, unit tests | bc5febe | search.ts, tests/lib/search.test.ts |
| 2 | Build /search page, SearchResultsClient, SearchResultCard, SearchBar, navbar integration | 671b760 | 6 new files, 4 modified |

## What Was Built

### Search Aggregation Layer (Task 1)

- **`searchVideos()`** added to `videos.ts`: queries `videos` collection with `status == 'published'` filter and `searchKeywords array-contains` term
- **`searchPosts()`** added to `posts.ts`: queries `posts` collection with `searchKeywords array-contains` term
- **`src/lib/firestore/search.ts`**: `globalSearch()` runs all 5 sub-searches in parallel via `Promise.all`, returns typed `GlobalSearchResults` object
- **`tests/lib/search.test.ts`**: 4 unit tests covering empty query (no sub-functions called), results aggregation, uppercase normalization, whitespace trimming — all pass

### Search UI (Task 2)

- **`SearchBar.tsx`**: Desktop `hidden md:block` input with Search icon, 300ms debounce, `focus:w-64` expand. Mobile `md:hidden` magnifying glass button. Both navigate to `/search?q=...`
- **`SearchResultCard.tsx`**: Link wrapping type badge (VIDEO/POST/PERSON/SCRIPTURE/FATHERS in gold Cinzel) + title + context, Byzantine navy-mid card styling
- **`SearchResultsClient.tsx`**: `'use client'` component with:
  - Empty state: centered "Search Ekklesia Agora" heading + subtitle + autofocused input
  - No-results state: "No results for '{query}'" with spelling tip
  - Tab bar: All / Videos / Posts / People / Scripture / Church Fathers with URL state
  - All tab: up to 5 cards per section with "See all N {type} results" link that switches tab
  - Individual tabs: `IndividualTabResults` sub-component with `visibleCount` state (starts 10, +10 per Load More)
- **`src/app/(main)/search/page.tsx`**: Server Component, awaits `searchParams`, calls `globalSearch()` for non-empty queries, no auth guard
- **`Navbar.tsx`**: `SearchBar` imported and rendered before desktop auth controls div
- **`MobileMenu.tsx`**: `/search` Link added after Study Guides

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed pre-existing `<a>` element navigation errors**
- **Found during:** Task 2 verification (next build)
- **Issue:** `src/app/(main)/agora/[postId]/page.tsx` line 61 and `src/app/(main)/videos/[id]/page.tsx` line 150 used `<a href="...">` instead of Next.js `<Link>`, causing ESLint build errors
- **Fix:** Added `Link` import to agora page, replaced both `<a>` elements with `<Link>` components
- **Files modified:** `src/app/(main)/agora/[postId]/page.tsx`, `src/app/(main)/videos/[id]/page.tsx`
- **Commits:** 671b760

### Build Note

The `npx next build` command exits with error during static page generation due to Firebase service account credentials not available in the local build environment (affects `/fathers/guides` prerender). This is a pre-existing issue present before this plan's changes — TypeScript compilation and ESLint both pass with `✓ Compiled successfully`. The search page is dynamic (reads `searchParams`) so it is not affected by static generation.

## Self-Check: PASSED

All created files exist on disk. Both task commits (bc5febe, 671b760) confirmed in git log. Content checks verified: globalSearch in search.ts, SearchBar import in Navbar.tsx, /search link in MobileMenu.tsx.
