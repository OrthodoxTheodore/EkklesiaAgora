---
phase: 07-discovery-messaging
verified: 2026-03-20T00:00:00Z
status: human_needed
score: 12/12 must-haves verified
human_verification:
  - test: "Verify search results appear across all 5 content types in a live app session"
    expected: "Searching 'grace' shows results across Videos, Posts, People, Scripture, and Church Fathers tabs"
    why_human: "Firestore index availability and seed data presence cannot be verified programmatically; requires live database"
  - test: "Verify real-time message delivery between two users"
    expected: "Message sent by User A appears instantly in User B's thread without page refresh"
    why_human: "onSnapshot real-time behavior requires two live browser sessions and an active Firestore connection"
  - test: "Verify unread badge clears and Seen indicator appears after recipient opens conversation"
    expected: "Envelope badge on User B's navbar resets to zero; 'Seen' label appears under User A's last sent message"
    why_human: "markConversationRead side-effects and cross-client state propagation require two live sessions"
  - test: "Verify online presence green dot for recently-active users in conversation list"
    expected: "Green dot on avatar when partner's lastSeen is within 5 minutes"
    why_human: "updateLastSeen is fire-and-forget and depends on real server timestamps and window.focus events"
---

# Phase 7: Discovery + Messaging Verification Report

**Phase Goal:** Implement global search and direct messaging features to complete v1 of the Ekklesia Agora platform
**Verified:** 2026-03-20
**Status:** human_needed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | User can enter a search query and see results from videos, posts, people, Scripture, and Church Fathers in grouped tabs | VERIFIED | `globalSearch()` aggregates all 5 types via `Promise.all`; `SearchResultsClient` renders sections per type |
| 2 | Empty query shows a centered prompt instead of results | VERIFIED | `SearchResultsClient` lines 82–103: `if (!query \|\| results === null)` renders "Search Ekklesia Agora" heading |
| 3 | No results shows a helpful message with the query | VERIFIED | `SearchResultsClient` lines 109–118: renders "No results for '{query}'" with spelling tip |
| 4 | Clicking a tab filters to that content type; clicking See all switches tab | VERIFIED | `switchTab()` function updates `activeTab` state and calls `router.push` with tab param; "See all" button calls `switchTab(s.tabId)` |
| 5 | Search bar in desktop navbar navigates to /search?q=... | VERIFIED | `SearchBar.tsx`: Enter key and 300ms debounce both call `router.push('/search?q=' + encodeURIComponent(...))` |
| 6 | Mobile users see a magnifying glass icon that navigates to /search | VERIFIED | `SearchBar.tsx` lines 50–57: `md:hidden` button with `<Search size={20} />` calls `router.push('/search')` |
| 7 | User can send a private message to another user from their profile page | VERIFIED | Profile page has `<Link href={'/messages?to=${profile.uid}'}>`; `/messages/page.tsx` handles `?to=` redirect to `createOrGetConversation()` |
| 8 | User can view a conversation list with avatar, name, last message preview, and timestamp | VERIFIED | `ConversationList.tsx`: renders avatar, `profile.displayName`, `conv.lastMessage`, `formatRelativeTime(conv.lastMessageAt)` |
| 9 | Messages display in chronological order (oldest at top, newest at bottom) | VERIFIED | `getMessages()` uses `.orderBy('createdAt', 'asc')`; `MessageThread` onSnapshot uses `orderBy('createdAt', 'asc')` |
| 10 | New messages appear in real-time via onSnapshot without page refresh | VERIFIED | `MessageThread.tsx` lines 37–52: `onSnapshot` on `conversations/{id}/messages` ordered by `createdAt asc` |
| 11 | Unread count badge appears on envelope icon in navbar | VERIFIED | `MessagesIcon.tsx`: `onSnapshot` on conversations, client-side filter for `unreadCounts[uid] > 0`, gold badge rendered |
| 12 | Seen indicator appears on sender's last message after recipient opens conversation | VERIFIED | `MessageThread.tsx` lines 112–114: renders "Seen" when `lastMessage.senderUid === currentUid && seenBy.length > 0`; `markConversationRead` Server Action updates `seenAt` and `seenBy` |

**Score:** 12/12 truths verified

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/firestore/search.ts` | globalSearch aggregation function | VERIFIED | Exports `globalSearch` and `GlobalSearchResults`; `Promise.all` over 5 sub-searches; handles empty/whitespace queries |
| `src/app/(main)/search/page.tsx` | Search results Server Component page | VERIFIED | Awaits `searchParams`, calls `globalSearch(q)` when query present, passes `null` for empty |
| `src/components/search/SearchResultsClient.tsx` | Tabbed results client component | VERIFIED | `'use client'`; empty/no-results/tabbed states; Load More with `visibleCount` state |
| `src/components/search/SearchBar.tsx` | Desktop input + mobile icon for navbar | VERIFIED | `'use client'`; `hidden md:block` input with debounce; `md:hidden` icon button |
| `tests/lib/search.test.ts` | Unit tests for globalSearch | VERIFIED | 4 tests: empty query, aggregation, uppercase normalization, whitespace trimming |
| `src/lib/types/messages.ts` | Conversation and Message TypeScript interfaces | VERIFIED | Exports `Conversation` (with `participantUids`, `unreadCounts`) and `Message` (with `seenAt`, `seenBy`) |
| `src/lib/firestore/messages.ts` | Firestore helpers for conversations and messages | VERIFIED | Exports `getConversationId` (`.sort().join('_')`), `getConversationsForUser`, `getMessages` |
| `src/app/actions/messages.ts` | Server Actions for messaging | VERIFIED | Exports `createOrGetConversation`, `sendMessage` (with `FieldValue.increment(1)`), `markConversationRead`, `updateLastSeen` |
| `src/components/nav/MessagesIcon.tsx` | Envelope icon with unread badge | VERIFIED | `'use client'`; `Mail` from lucide; `onSnapshot`; client-side unread filter; 99+ cap; aria-label |
| `src/app/(main)/messages/page.tsx` | Messages page with split-pane layout | VERIFIED | Auth guard (`redirect('/login')`); `getConversationsForUser`; `lastSeenMap` construction; `?to=` handling |
| `tests/lib/messages.test.ts` | Unit tests for messaging logic | VERIFIED | 3 tests for `getConversationId`: alphabetical sort, determinism, identical uids |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/components/nav/Navbar.tsx` | `src/components/search/SearchBar.tsx` | `import.*SearchBar` | WIRED | Line 11: `import { SearchBar } from '@/components/search/SearchBar'`; rendered at line 145 |
| `src/app/(main)/search/page.tsx` | `src/lib/firestore/search.ts` | `globalSearch()` call | WIRED | Line 1 import; line 10 `globalSearch(q)` with result passed to client |
| `src/lib/firestore/search.ts` | `src/lib/firestore/patristic.ts` | `searchPatristicTexts` import | WIRED | Line 7 import; used in `Promise.all` at line 31 |
| `src/components/nav/Navbar.tsx` | `src/components/nav/MessagesIcon.tsx` | `import.*MessagesIcon` | WIRED | Line 10 import; rendered at line 152 between SearchBar and NotificationBell |
| `src/app/(main)/profile/[handle]/page.tsx` | `/messages?to=` | Message button Link | WIRED | Line 84: `href={'/messages?to=${profile.uid}'}` |
| `src/components/messages/MessageThread.tsx` | `conversations/{id}/messages` | `onSnapshot` real-time listener | WIRED | Lines 38–52: `onSnapshot` on subcollection with `orderBy('createdAt', 'asc')` |
| `src/app/actions/messages.ts` | `src/lib/firestore/messages.ts` | `getConversationId` import | WIRED | Line 4: `import { getConversationId } from '@/lib/firestore/messages'`; called in `createOrGetConversation` |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| SRCH-01 | 07-01-PLAN.md | Global search across videos, posts, people, and Scripture | SATISFIED | `globalSearch()` queries videos, posts, people (`searchMembersByName`), scripture, and Church Fathers (exceeds requirement) |
| SRCH-02 | 07-01-PLAN.md | Search results grouped by type with tabs | SATISFIED | `SearchResultsClient` renders All/Videos/Posts/People/Scripture/Church Fathers tab bar with grouped sections |
| MSG-01 | 07-02-PLAN.md | User can send private messages to other users | SATISFIED | `createOrGetConversation` + `sendMessage` Server Actions; profile page "Send Message" button initiates flow |
| MSG-02 | 07-02-PLAN.md | User can view conversation list with message previews | SATISFIED | `ConversationList` shows avatar, display name, last message preview, relative timestamp, unread dot |
| MSG-03 | 07-02-PLAN.md | Messages display in chronological order within conversation | SATISFIED | `getMessages` and `onSnapshot` both use `orderBy('createdAt', 'asc')`; MessageThread renders in that order |

**All 5 Phase 7 requirements accounted for. No orphaned requirements.**

---

## Anti-Patterns Found

None detected. The "placeholder" text occurrences found are all legitimate HTML `placeholder=` attribute values on input elements (not code stubs). All functions return real data, all components render substantive UI.

---

## Human Verification Required

These items require a running application and cannot be verified programmatically.

### 1. Global Search Results Across Content Types

**Test:** With the dev server running and seed data in Firestore, search for a term like "grace" in the navbar
**Expected:** Results appear in the tabbed /search page with actual data in Videos, Posts, People, Scripture, and Church Fathers sections
**Why human:** Firestore composite indexes (`searchKeywords array-contains` + `status == 'published'`) must be deployed and seed data must be present; cannot verify index availability or data existence programmatically

### 2. Real-Time Message Delivery

**Test:** Open two browser windows (or incognito) as different users; send a message from User A
**Expected:** Message appears instantly in User B's MessageThread without refreshing the page; left-aligned navy bubble
**Why human:** onSnapshot real-time behavior requires two active Firestore client connections; cannot simulate cross-session WebSocket events in static analysis

### 3. Unread Badge Clearance and Seen Indicator

**Test:** User B has an unread message from User A; User B opens the conversation
**Expected:** (a) Envelope icon badge on User B's navbar clears to zero; (b) "Seen" label appears under User A's last message
**Why human:** Requires `markConversationRead` Server Action to fire and propagate Firestore write back to User A's onSnapshot listener; cross-session state propagation not verifiable statically

### 4. Online Presence Green Dot

**Test:** Both users are active (both have called `updateLastSeen` within the last 5 minutes); navigate to /messages
**Expected:** Green dot on the avatar of the active conversation partner in the conversation list
**Why human:** `updateLastSeen` is fire-and-forget, depends on actual Firestore `serverTimestamp()`, and the 5-minute window check compares against `Date.now()` — requires live timing conditions

---

## Supporting Data Layer Verification

### searchVideos and searchPosts Added to Existing Modules

- `src/lib/firestore/videos.ts`: `searchVideos()` confirmed present with `where('status', '==', 'published')` filter
- `src/lib/firestore/posts.ts`: `searchPosts()` confirmed present with `searchKeywords array-contains` query
- `src/lib/types/social.ts`: `lastSeen: Timestamp | null` field added to `UserProfile` interface

### Firestore Security Rules

- `firestore.rules`: `match /conversations/{conversationId}` block with participant-only read (`request.auth.uid in resource.data.participantUids`) and Admin-SDK-only write (`if false`)
- `firestore.rules`: nested `match /messages/{messageId}` with authenticated read and Admin-SDK-only write

### Git Commits

All 4 implementation commits verified in repository:
- `bc5febe` — feat(07-01): add searchVideos, searchPosts, and globalSearch aggregation module
- `671b760` — feat(07-01): build /search page, SearchResultsClient, SearchResultCard, SearchBar, navbar integration
- `c3ee21e` — feat(07-02): add messaging data layer
- `8e55143` — feat(07-02): build messaging UI and integrate into navbar and profiles

Note from SUMMARY: `npx next build` TypeScript compilation passes; prerender failures at static generation time are pre-existing issues caused by Firebase service account credentials not being available in the local build environment (unrelated to Phase 7).

---

_Verified: 2026-03-20_
_Verifier: Claude (gsd-verifier)_
