# Phase 7: Discovery + Messaging - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Two capabilities ship together: (1) a unified global search bar covering all five content types (videos, posts, people, Scripture, Church Fathers texts) with tabbed results on a /search page; and (2) a private direct messaging system with conversation list, split-pane layout, real-time Firestore listeners, unread badge, read receipts, and online presence. No new content types, no group messaging, no push notifications — those are future phases.

</domain>

<decisions>
## Implementation Decisions

### Search Entry Point
- Search bar lives in the **navbar on desktop** (always visible, positioned center-right) AND as a dedicated **/search page**
- Typing in the navbar search bar navigates to `/search?q=...` with results
- **Mobile**: search bar is hidden — a magnifying glass icon appears in the navbar; tapping it navigates to `/search`
- The `/search` page is the canonical results surface; the navbar bar is a shortcut into it

### Search Scope
- Global search covers **all 5 content types**: Videos, Posts, People, Scripture, Church Fathers (Patristic texts)
- Phase 6 explicitly built `searchPatristicTexts()` in `src/lib/firestore/patristic.ts` for this — call it without modification
- All types use the established `searchKeywords` array-contains Firestore query pattern

### Search Result Presentation
- **Compact cards**: each result shows title/name, a type badge (VIDEO / POST / PERSON / SCRIPTURE / FATHERS), and one line of context (author name + date for videos/posts, jurisdiction for people, book/chapter for Scripture, author + era for Fathers)
- No thumbnails, no full text previews — scannable list
- **All tab**: up to 5 results per content type section (sections: Videos, Posts, People, Scripture, Church Fathers), each with a "See all [type] results" link that switches to the relevant tab
- **Individual type tabs**: 10 results initially, with a "Load more" button (not infinite scroll — keeps it simple and avoids Firestore cursor complexity for a prototype)
- **Empty state before search**: centered prompt — "Search across videos, posts, people, Scripture, and Church Fathers" with the search input prominent. No recent searches, no suggestions.
- **No results state**: "No results for '[query]'" with a suggestion to try a shorter keyword

### Messaging Access & Initiation
- **Envelope icon** added to navbar (positioned between search bar and notification bell): `✉️ 🔔 👤`
- Envelope icon navigates to `/messages`
- **Message button** on user profile pages (`/profile/[handle]`) to initiate a conversation — navigates to `/messages?to=[uid]` which creates or opens the conversation
- No compose button inside /messages inbox (profile-page initiation is the only entry point)

### Messaging Layout
- **Split-pane layout** on `/messages`:
  - Left sidebar: conversation list (avatar, name, last message preview, timestamp, unread dot)
  - Right panel: message thread (chronological, newest at bottom, text input + send button)
- **Desktop**: both panes visible simultaneously
- **Mobile**: conversation list is the default view; tapping a conversation navigates to a full-page thread (`/messages/[conversationId]`)

### Messaging Real-Time & Indicators
- **Unread count badge** on the envelope icon in navbar (mirrors the notification bell badge pattern already in place) — shows count of conversations with unread messages, not total unread messages
- **Firestore real-time listener** on the message thread (onSnapshot) — new messages appear instantly without refresh
- **"Seen" indicator** on the last message in a thread: after the recipient opens the conversation, the sender's last message shows a small "Seen ✔" label
- **Online presence**: green dot on user avatars in the conversation list when that user was active in the last 5 minutes. Tracked via a `lastSeen: Timestamp` field on the user profile document, updated on page load/focus.
- No typing indicators, no delivered receipts, no push notifications in this phase

### Claude's Discretion
- Exact Firestore data model for `conversations` and `messages` collections (subcollection vs flat collection)
- Unread count implementation (counter field vs query-time count)
- `lastSeen` update mechanism (onFocus event, periodic write, or middleware)
- Loading skeleton designs for search results and message threads
- Exact Tailwind v4 Byzantine token usage for the split-pane layout

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase requirements
- `.planning/ROADMAP.md` §"Phase 7: Discovery + Messaging" — phase goal, SRCH-01, SRCH-02, MSG-01, MSG-02, MSG-03 requirement IDs, plan breakdown (07-01, 07-02)
- `.planning/REQUIREMENTS.md` §"Search" — SRCH-01, SRCH-02 acceptance criteria
- `.planning/REQUIREMENTS.md` §"Direct Messaging" — MSG-01, MSG-02, MSG-03 acceptance criteria

### Search infrastructure to build on
- `src/lib/firestore/patristic.ts` — `searchPatristicTexts()` already built for Phase 7 to call without modification
- `src/lib/firestore/scripture.ts` — `searchVerses()` pattern (array-contains on searchKeywords)
- `src/lib/firestore/posts.ts` — `buildSearchKeywords()` pattern
- `src/lib/firestore/videos.ts` — `buildVideoSearchKeywords()` pattern
- `src/lib/firestore/synodeia.ts` — `buildDisplayNameKeywords()` + prefix search pattern for people

### Messaging patterns to follow
- `.planning/phases/02-social-core/02-CONTEXT.md` — notification bell + badge pattern (mirrors what we need for envelope + unread badge)
- `src/components/nav/NotificationBell.tsx` — existing unread badge implementation to mirror for envelope icon

### Prior phase context (patterns to mirror)
- `.planning/phases/06-patristic-library-study-guides/06-CONTEXT.md` — code context section documents all established patterns (Server Component + Client Component split, Tailwind v4 Byzantine tokens, getAdminFirestore usage)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/nav/NotificationBell.tsx` — unread badge pattern; mirror for envelope/messages icon with unread count
- `src/components/nav/Navbar.tsx` — add search input (desktop) + search icon (mobile) + envelope icon; fathersOpen dropdown pattern shows how to manage open/close state
- `src/components/nav/MobileMenu.tsx` — add Messages link for mobile nav
- `src/components/ui/` — Byzantine UI primitives (cards, inputs, buttons) for search result cards and message composer
- `src/lib/firestore/patristic.ts`, `scripture.ts`, `posts.ts`, `videos.ts`, `synodeia.ts` — all expose search functions with `searchKeywords` array-contains; Phase 7 aggregates them
- `src/app/(main)/agora/page.tsx` — FeedClient pattern with Firestore real-time listener (onSnapshot) to adapt for message thread

### Established Patterns
- **`searchKeywords` array-contains**: universal search pattern across all content types — no full-text search engine needed, Firestore handles it
- **Server Component + Client Component split**: Server Component fetches initial data, passes as props to Client Component — follow the `src/app/(main)/calendar/page.tsx` and `src/app/(main)/scripture/` templates
- **`(main)` route group**: new routes at `src/app/(main)/search/`, `src/app/(main)/messages/`, `src/app/(main)/messages/[conversationId]/`
- **Tailwind v4 Byzantine tokens**: `text-gold`, `bg-navy`, `bg-navy-mid`, `font-cinzel`, `font-garamond`, `border-gold/[0.15]` — no new color values
- **`getAdminFirestore()`** from `src/lib/firebase/admin` — use for all Server Components
- **500-op Firestore batch chunks** — established pattern; messaging writes are small, not batched

### Integration Points
- **Navbar** (`src/components/nav/Navbar.tsx`): add search input (center, desktop only) + search icon (mobile) + envelope icon (between search and bell)
- **Profile pages** (`src/app/(main)/profile/[handle]/page.tsx`): add "Message" button that navigates to `/messages?to=[uid]`
- **All content types**: search aggregates existing Firestore query functions — no changes to existing collections or documents
- **Firestore rules** (`firestore.rules`): will need rules for `conversations` and `messages` collections (users can only read/write their own conversations)

</code_context>

<specifics>
## Specific Ideas

- Unread badge on envelope mirrors the existing notification bell badge exactly — same visual treatment, same positioning logic
- Online presence green dot: simple `lastSeen` timestamp field on user profile, updated on page load. No complex presence infrastructure.
- Split-pane layout: left sidebar ~280-320px fixed width, right panel fills remaining space. On mobile, left panel is the default route; thread is a sub-route.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within Phase 7 scope.

</deferred>

---

*Phase: 07-discovery-messaging*
*Context gathered: 2026-03-19*
