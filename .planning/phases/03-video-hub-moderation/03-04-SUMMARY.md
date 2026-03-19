---
phase: 03-video-hub-moderation
plan: "04"
subsystem: video-ui
tags: [video, player, browse, detail, comments, like, share, flag]
dependency_graph:
  requires: [03-02]
  provides: [VideoCard, VideoPlayer, /videos, /videos/[id]]
  affects: [navigation, video-discovery, video-playback]
tech_stack:
  added: []
  patterns:
    - HTML5 native video element with browser controls (no custom skin)
    - Server Component data fetch + Client Component interactivity split
    - Optimistic UI for like toggle with rollback on error
    - Mutually exclusive search/category filter (clears each other)
    - Fire-and-forget incrementViewCount on page load
key_files:
  created:
    - src/components/video/VideoPlayer.tsx
    - src/components/video/VideoCard.tsx
    - src/components/video/VideoBrowseClient.tsx
    - src/components/video/VideoDetailClient.tsx
    - src/app/(main)/videos/page.tsx
    - src/app/(main)/videos/[id]/page.tsx
  modified: []
decisions:
  - "VideoDetailClient receives initial data as props from Server Component; no client-side Firestore reads on detail page"
  - "incrementViewCount called with void (fire-and-forget) — page load not blocked by view count write"
  - "sidebarHeading computed server-side: 'More from this channel' vs 'More in {category}' based on actual related video channelId"
  - "Related videos: channel-first query (limit 6, filter current), backfill from category if <5 results"
metrics:
  duration: 5 minutes
  completed: "2026-03-19"
  tasks: 2
  files: 6
requirements:
  - VID-02
  - VID-03
  - VID-04
  - VID-05
  - VID-06
  - VID-07
  - VID-10
  - VID-11
  - VID-13
---

# Phase 3 Plan 04: Video Hub UI Summary

One-liner: HTML5 video player wrapper, VideoCard with inline playback, /videos browse hub with search + category filter, and /videos/[id] YouTube-style detail page with like/share/flag/comments and related sidebar.

## What Was Built

### VideoPlayer (`src/components/video/VideoPlayer.tsx`)
Simple wrapper around HTML5 `<video>` element with:
- Native browser controls (`controls` attribute) — no custom skin per CONTEXT.md decision
- `w-full aspect-video rounded-[6px]` responsive sizing
- `poster` attribute for thumbnail, `preload="metadata"` for faster initial load
- `aria-label="Video player"` for accessibility
- `onError` state shows crimson error message: "Video unavailable. Try refreshing the page."

### VideoCard (`src/components/video/VideoCard.tsx`)
Grid card for video listings:
- 16:9 thumbnail with `aspect-video rounded-t-[6px] overflow-hidden` container
- Duration chip: `absolute bottom-2 right-2 bg-black/70 font-cinzel text-xs text-white`
- `showInlinePlayback` prop: clicking thumbnail replaces thumbnail with VideoPlayer in-card
- Below thumbnail: channel/uploader avatar (w-9 h-9 rounded-full), title (link to /videos/[id]), view count + relative date, category chip
- `VideoCardSkeleton` exported: aspect-video animate-pulse + 3 text bar rectangles

### /videos Browse Page (`src/app/(main)/videos/page.tsx`)
Server Component:
- `h1` heading in Cinzel bold gold: "Videos"
- `VideoBrowseClient` for search input + CategoryFilterTabs (client)
- Firestore query: `status == 'published'`, optional `category` filter or `searchKeywords array-contains` search
- Search and category mutually exclusive (per Phase 2 established pattern)
- `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6` video grid with Suspense + skeleton fallback
- Empty state: "No Videos Yet" / "Videos will appear here as channels and members share content."

### /videos/[id] Detail Page (`src/app/(main)/videos/[id]/page.tsx`)
Server Component with YouTube-style two-column layout:
- `lg:grid lg:grid-cols-3 gap-6` — left `lg:col-span-2`, right `lg:col-span-1`
- Auth optional (unauthenticated users can view published videos)
- Access gate: `notFound()` if video missing or non-published and viewer is not uploader/moderator+
- `incrementViewCount(videoId)` called with `void` (fire-and-forget) on every page load
- Left column: VideoPlayer → title → stats (views, duration, date) → uploader row → jurisdiction badge → category chip → VideoDetailClient (interactive) → description
- Right sidebar: "More from this channel" or "More in {category}" heading + vertical VideoCard stack (up to 5 related)

### VideoDetailClient (`src/components/video/VideoDetailClient.tsx`)
Client wrapper handling all interactive state:
- **Like**: optimistic toggle (Heart icon, gold fill when liked), rollback on Server Action error
- **Share**: `navigator.clipboard.writeText(window.location.href)`, "Link copied!" toast for 2.5s
- **Flag**: FlagDialog with radio reason picker (Spam, Harassment, Inappropriate content, Other) → `reportContent` with `contentType: 'video'`
- **Comments**: textarea compose (roleLevel >= 1 required), submit via `createVideoComment`, optimistic append, delete via `deleteVideoComment` with confirm step

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check

### Files Created
- [x] src/components/video/VideoPlayer.tsx
- [x] src/components/video/VideoCard.tsx
- [x] src/components/video/VideoBrowseClient.tsx
- [x] src/components/video/VideoDetailClient.tsx
- [x] src/app/(main)/videos/page.tsx
- [x] src/app/(main)/videos/[id]/page.tsx

### Commits
- [x] 3cec711 — feat(03-04): VideoCard and VideoPlayer components
- [x] 3359038 — feat(03-04): video browse page and detail page

### TypeScript
- [x] `npx tsc --noEmit` exits 0

## Self-Check: PASSED
