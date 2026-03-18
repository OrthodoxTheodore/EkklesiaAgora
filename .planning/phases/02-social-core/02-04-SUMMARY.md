---
phase: 02-social-core
plan: "04"
subsystem: ui
tags: [react, firebase, firestore, firebase-ai, gemini, lucide-react, tailwindcss, infinite-scroll, agora-feed]

# Dependency graph
requires:
  - phase: 02-social-core-01
    provides: social types (Post, LinkPreview), categories constants, jurisdictions constants
  - phase: 02-social-core-03
    provides: createPost, toggleLike, fetchLinkPreview Server Actions, userFeed subcollection pattern
provides:
  - /agora feed page (Server Component with getTokens auth)
  - FeedClient with IntersectionObserver infinite scroll, cursor pagination, and keyword search
  - ComposeBox with Firebase AI Gemini category classification (gemini-2.0-flash, text/x.enum)
  - CategoryFilterTabs horizontal scrollable filter with ORTHODOX_CATEGORIES
  - BlockingSkeletons loading state (3 PostCard-shaped skeletons)
  - PostCard with jurisdiction badge, verified checkmark, optimistic like, delete dialog, three-dot menu
  - LinkPreviewCard rendering OG metadata
  - Dashboard redirects to /agora
affects: [02-05, 02-06, 02-07, phase-03-video-hub]

# Tech tracking
tech-stack:
  added:
    - lucide-react (Heart, MessageCircle, MoreHorizontal, CheckCircle, Image, X icons)
    - firebase/ai (getAI, getGenerativeModel, GoogleAIBackend, Schema — already in firebase SDK)
  patterns:
    - Firebase AI called at module scope (getAI + getGenerativeModel initialized once)
    - Optimistic UI for likes with rollback on Server Action failure
    - IntersectionObserver for infinite scroll (sentinel div pattern)
    - getDocs (not onSnapshot) for feed — consistent with research decision
    - Search vs category filter are mutually exclusive (clearing one resets the other)
    - Blocked/muted users loaded on mount, applied client-side as post-query filter
    - Debounced AI classification (800ms) only fires when text >= 20 chars

key-files:
  created:
    - src/app/(main)/agora/page.tsx
    - src/components/agora/FeedClient.tsx
    - src/components/agora/ComposeBox.tsx
    - src/components/agora/CategoryFilterTabs.tsx
    - src/components/agora/BlockingSkeletons.tsx
    - src/components/agora/LinkPreviewCard.tsx
  modified:
    - src/app/(main)/dashboard/page.tsx (redirect to /agora)
    - src/middleware.ts (already had /profile and /agora added in earlier plan)

key-decisions:
  - "FeedClient uses getDocs (not onSnapshot) for feed pagination — consistent with 02-RESEARCH.md locked decision"
  - "Search and category filter are mutually exclusive — entering a search clears the category, selecting a category clears search"
  - "ComposeBox AI classification uses module-scope getAI/getGenerativeModel to avoid re-initialization on every render"
  - "PostCard and LinkPreviewCard kept as separate files per plan spec; PostCard also has inline version for backward compat"

patterns-established:
  - "Feed pagination: IntersectionObserver sentinel div triggers loadFeed(lastDoc) when visible and hasMore=true"
  - "Optimistic like: flip state immediately, call Server Action, rollback on catch with toast"
  - "AI category: 800ms debounce, text>=20 chars threshold, Schema.enumString with ORTHODOX_CATEGORIES"
  - "Search uses posts collection with array-contains on searchKeywords; feed uses users/{uid}/userFeed subcollection"

requirements-completed: [AGRA-01, AGRA-02, AGRA-03, AGRA-05, AGRA-10, CAT-01, CAT-02]

# Metrics
duration: 48min
completed: 2026-03-18
---

# Phase 2 Plan 04: Agora Feed UI Summary

**Complete Agora feed experience with ComposeBox (Gemini AI category classification), infinite scroll FeedClient, CategoryFilterTabs, BlockingSkeletons, PostCard with optimistic likes and delete confirmation, and LinkPreviewCard**

## Performance

- **Duration:** 48 min
- **Started:** 2026-03-18T19:31:13Z
- **Completed:** 2026-03-18T20:19:00Z
- **Tasks:** 2
- **Files modified:** 8 (6 created, 2 modified)

## Accomplishments

- /agora Server Component page with getTokens auth, renders FeedClient passing uid
- FeedClient with IntersectionObserver infinite scroll (10 posts per page), category filtering, keyword search with 300ms debounce querying posts collection array-contains searchKeywords, blocked/muted user client-side filtering
- ComposeBox with Firebase AI (gemini-2.0-flash, text/x.enum, Schema.enumString) for category classification with 800ms debounce; photo upload to Firebase Storage with progress bar; link preview detection and fetching; manual category picker grid
- CategoryFilterTabs with 11 pills (All + 10 ORTHODOX_CATEGORIES), role="tablist" / role="tab" / aria-selected accessibility
- PostCard with full UI-SPEC layout: avatar, display name, verified checkmark (roleLevel >= 2), @handle, jurisdiction badge, timestamp, post text, optional image, link preview, category chip, optimistic like button with rollback, comment count link to /agora/[postId], three-dot overflow menu with delete confirmation dialog
- Dashboard redirects authenticated users to /agora

## Task Commits

1. **Task 1: Agora page, FeedClient, ComposeBox, CategoryFilterTabs, BlockingSkeletons, dashboard redirect** - `bad6ed1` (feat — committed by prior agent in Plan 02-03 docs commit)
2. **Task 2: PostCard and LinkPreviewCard components** - `6f1ca06` (feat)

## Files Created/Modified

- `src/app/(main)/agora/page.tsx` - Server Component with getTokens auth, renders FeedClient uid={uid}
- `src/components/agora/FeedClient.tsx` - Client-side feed with IntersectionObserver infinite scroll, category filter, keyword search, blocked/muted filtering
- `src/components/agora/ComposeBox.tsx` - Compose form with Firebase AI classification (gemini-2.0-flash), photo upload, link preview, manual category picker
- `src/components/agora/CategoryFilterTabs.tsx` - Horizontal scrollable filter tabs with ORTHODOX_CATEGORIES
- `src/components/agora/BlockingSkeletons.tsx` - 3 PostCard-shaped skeletons with animate-pulse, aria-busy
- `src/components/agora/LinkPreviewCard.tsx` - OG metadata card with thumbnail, title, description, domain, target=_blank
- `src/components/agora/PostCard.tsx` - Full post card per UI-SPEC (created in prior commit)
- `src/app/(main)/dashboard/page.tsx` - Stripped to auth check + redirect('/agora')

## Decisions Made

- FeedClient uses getDocs (not onSnapshot) — consistent with 02-RESEARCH.md locked decision for predictable pagination costs
- Search and category filter are mutually exclusive to avoid compound query complexity on Firestore
- AI classification fires at module scope initialization to avoid per-render overhead
- LinkPreviewCard created as separate file as specified, even though PostCard.tsx has an inline version for backward compatibility

## Deviations from Plan

None — plan executed exactly as written. All prerequisite files (types, constants, Server Actions) were already committed by prior agent executions. lucide-react package was installed as a prerequisite dependency (Rule 3 auto-fix).

## Issues Encountered

- Prior agent had already committed agora feed components (FeedClient, ComposeBox, CategoryFilterTabs, BlockingSkeletons, agora/page.tsx) under commit `bad6ed1` labeled as Plan 02-03 docs. PostCard.tsx was committed in `5d16e70` labeled as 02-06. All files were present and correct, so no rework was needed.
- `LinkPreviewCard.tsx` was the only file not yet committed as a standalone component — created and committed separately as `6f1ca06`.

## Next Phase Readiness

- Agora feed UI complete with all required interactions
- Plan 02-05 (post detail / comment page at /agora/[postId]) can proceed — PostCard comment count link already points to that route
- Plan 02-06 (notifications) is already committed

---
*Phase: 02-social-core*
*Completed: 2026-03-18*
