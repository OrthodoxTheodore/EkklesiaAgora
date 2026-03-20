# Phase 7: Discovery + Messaging - Research

**Researched:** 2026-03-19
**Domain:** Firestore cross-collection search aggregation + real-time direct messaging
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Search Entry Point**
- Search bar lives in the navbar on desktop (always visible, positioned center-right) AND as a dedicated /search page
- Typing in the navbar search bar navigates to `/search?q=...` with results
- Mobile: search bar is hidden — a magnifying glass icon appears in the navbar; tapping it navigates to `/search`
- The `/search` page is the canonical results surface; the navbar bar is a shortcut into it

**Search Scope**
- Global search covers all 5 content types: Videos, Posts, People, Scripture, Church Fathers (Patristic texts)
- Phase 6 explicitly built `searchPatristicTexts()` in `src/lib/firestore/patristic.ts` for this — call it without modification
- All types use the established `searchKeywords` array-contains Firestore query pattern

**Search Result Presentation**
- Compact cards: each result shows title/name, a type badge (VIDEO / POST / PERSON / SCRIPTURE / FATHERS), and one line of context (author name + date for videos/posts, jurisdiction for people, book/chapter for Scripture, author + era for Fathers)
- No thumbnails, no full text previews — scannable list
- All tab: up to 5 results per content type section (sections: Videos, Posts, People, Scripture, Church Fathers), each with a "See all [type] results" link that switches to the relevant tab
- Individual type tabs: 10 results initially, with a "Load more" button (not infinite scroll)
- Empty state before search: centered prompt with search input prominent. No recent searches, no suggestions.
- No results state: "No results for '[query]'" with a suggestion to try a shorter keyword

**Messaging Access and Initiation**
- Envelope icon added to navbar (positioned between search bar and notification bell): search | envelope | bell | avatar
- Envelope icon navigates to `/messages`
- Message button on user profile pages (`/profile/[handle]`) to initiate a conversation — navigates to `/messages?to=[uid]` which creates or opens the conversation
- No compose button inside /messages inbox (profile-page initiation is the only entry point)

**Messaging Layout**
- Split-pane layout on `/messages`:
  - Left sidebar: conversation list (avatar, name, last message preview, timestamp, unread dot)
  - Right panel: message thread (chronological, newest at bottom, text input + send button)
- Desktop: both panes visible simultaneously
- Mobile: conversation list is the default view; tapping a conversation navigates to a full-page thread (`/messages/[conversationId]`)

**Messaging Real-Time and Indicators**
- Unread count badge on the envelope icon in navbar (mirrors the notification bell badge pattern already in place) — shows count of conversations with unread messages, not total unread messages
- Firestore real-time listener on the message thread (onSnapshot) — new messages appear instantly without refresh
- "Seen" indicator on the last message in a thread: after the recipient opens the conversation, the sender's last message shows a small "Seen" label
- Online presence: green dot on user avatars in the conversation list when that user was active in the last 5 minutes. Tracked via a `lastSeen: Timestamp` field on the user profile document, updated on page load/focus.
- No typing indicators, no delivered receipts, no push notifications in this phase

### Claude's Discretion
- Exact Firestore data model for `conversations` and `messages` collections (subcollection vs flat collection)
- Unread count implementation (counter field vs query-time count)
- `lastSeen` update mechanism (onFocus event, periodic write, or middleware)
- Loading skeleton designs for search results and message threads
- Exact Tailwind v4 Byzantine token usage for the split-pane layout

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within Phase 7 scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SRCH-01 | Global search across videos, posts, people, and Scripture | Five search functions already exist; aggregation layer needed in a new `src/lib/firestore/search.ts` module |
| SRCH-02 | Search results grouped by type with tabs | Tab state managed as URL param (`?tab=videos`) on `/search` page; SearchResultsClient reads `searchParams` |
| MSG-01 | User can send private messages to other users | New `conversations` + `messages` Firestore collections; Server Action for message send |
| MSG-02 | User can view conversation list with message previews | `conversations` collection stores last message preview denormalized on each send; left panel lists them |
| MSG-03 | Messages display in chronological order within conversation | `messages` subcollection ordered by `createdAt asc`; real-time onSnapshot listener |
</phase_requirements>

---

## Summary

Phase 7 adds two independent capabilities on top of the fully-built Phase 1–6 codebase. Global search requires no new Firestore infrastructure — it aggregates five existing search functions (`searchPatristicTexts`, `searchVerses`, `searchMembersByName`, and counterparts for videos and posts) via a new aggregation layer called in a Server Component, then passes results as props to a tabbed Client Component. The only new code is the aggregation module, the `/search` route, and the Navbar search input.

Direct messaging requires the only new Firestore collections in this phase: `conversations` (one document per user pair, keyed by a sorted-uid string) and `messages` (subcollection of each conversation). The split-pane layout mirrors established patterns: Server Component page + Client Component for real-time state. The envelope icon and its unread badge replicate the existing NotificationBell pattern exactly — same onSnapshot approach, same badge CSS.

The two plans (07-01 search, 07-02 messaging) are independent of each other and can be executed in either order. Search has no dependencies on messaging and vice versa.

**Primary recommendation:** Implement search first (07-01) because it touches the Navbar and profile pages that messaging also modifies — doing search first avoids merge conflicts on shared files.

---

## Standard Stack

### Core (all already installed — no new npm installs required)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| firebase (client SDK) | 12.10.0 | `onSnapshot` real-time listeners for message thread + unread badge | Already used by NotificationBell and FeedClient |
| firebase-admin | 13.7.0 | `getAdminFirestore()` for Server Component initial data fetches | Established pattern for every Server Component page |
| next | 15.5.13 | App Router, Server Components, `useSearchParams` / `useRouter` | Project framework |
| lucide-react | 0.577.0 | `Search`, `Mail`, `Send`, `Check` icons | Already used throughout (Bell, etc.) |
| tailwindcss | 4.2.1 | Byzantine design tokens | Project CSS framework |
| next-firebase-auth-edge | 1.12.0 | `getTokens()` in Server Component pages for auth | Established auth pattern |
| react-hook-form + zod | 7.71.2 / 4.3.6 | Message compose input validation | Already in project |

**Installation:** No new packages needed. All dependencies are already present.

---

## Architecture Patterns

### Recommended Project Structure (new files only)

```
src/
├── lib/
│   ├── firestore/
│   │   ├── search.ts          # NEW: aggregation layer calling 5 existing search fns
│   │   └── messages.ts        # NEW: conversations + messages Firestore helpers
│   └── types/
│       └── messages.ts        # NEW: Conversation + Message TypeScript interfaces
├── app/
│   └── (main)/
│       ├── search/
│       │   └── page.tsx       # NEW: Server Component, reads searchParams, calls search.ts
│       └── messages/
│           ├── page.tsx       # NEW: Server Component — loads uid, initial conversations
│           └── [conversationId]/
│               └── page.tsx   # NEW: Mobile full-page thread (mirrors conversation pane)
├── components/
│   ├── nav/
│   │   └── MessagesIcon.tsx   # NEW: envelope + unread badge (mirrors NotificationBell)
│   ├── search/
│   │   ├── SearchBar.tsx      # NEW: navbar search input (desktop) + icon (mobile)
│   │   └── SearchResultsClient.tsx  # NEW: tabbed results, "Load more" per tab
│   └── messages/
│       ├── ConversationList.tsx      # NEW: left sidebar
│       ├── MessageThread.tsx         # NEW: right panel with onSnapshot listener
│       └── MessageComposer.tsx       # NEW: text input + send button
└── app/
    └── actions/
        └── messages.ts        # NEW: sendMessage, createOrGetConversation Server Actions
```

### Pattern 1: Search Aggregation (Server Component + Promise.all)

**What:** A single Server Component fetches all 5 search result sets in parallel, then passes typed arrays to the client component.

**When to use:** Any time multiple independent async data sources must be merged for a single page render.

**Example:**
```typescript
// src/lib/firestore/search.ts
import { searchPatristicTexts } from './patristic';
import { searchVerses } from './scripture';
import { searchMembersByName } from './synodeia';
// videos and posts use Admin SDK directly

export interface GlobalSearchResults {
  videos: VideoSearchResult[];
  posts: PostSearchResult[];
  people: SynodeiaMember[];
  scripture: ScriptureVerse[];
  fathers: PatristicText[];
}

export async function globalSearch(query: string): Promise<GlobalSearchResults> {
  const keyword = query.toLowerCase().trim();
  if (!keyword) return { videos: [], posts: [], people: [], scripture: [], fathers: [] };

  const [videos, posts, people, scripture, fathers] = await Promise.all([
    searchVideos(keyword, 10),       // Admin SDK query on videos collection
    searchPosts(keyword, 10),        // Admin SDK query on posts collection
    searchMembersByName(keyword, null, 10),
    searchVerses(keyword, undefined, 10),
    searchPatristicTexts(keyword, 10),
  ]);

  return { videos, posts, people, scripture, fathers };
}
```

### Pattern 2: Tabbed Results with URL-Driven Tab State

**What:** Active tab stored as `?tab=videos` query param. Server Component reads `searchParams`, passes initial active tab to client.

**When to use:** When results need to be shareable/bookmarkable per tab.

```typescript
// src/app/(main)/search/page.tsx (Server Component)
interface SearchPageProps {
  searchParams: Promise<{ q?: string; tab?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = '', tab = 'all' } = await searchParams;
  const results = q ? await globalSearch(q) : null;

  return <SearchResultsClient query={q} initialTab={tab} results={results} />;
}
```

### Pattern 3: Conversation Firestore Data Model

**Recommendation (Claude's Discretion):** Subcollection model — `conversations/{conversationId}/messages/{messageId}`.

**Why:** Subcollection keeps message documents isolated per conversation, supports `orderBy('createdAt', 'asc')` without a composite index across the full messages collection, and aligns with how Firestore pricing works (reads only for the relevant conversation).

**Conversation document** (`conversations/{conversationId}`):
```typescript
// conversationId = sorted uid pair: `${uid1}_${uid2}` (uid1 < uid2 alphabetically)
interface Conversation {
  conversationId: string;
  participantUids: string[];           // [uid1, uid2]
  participantProfiles: {               // Denormalized for list rendering
    [uid: string]: {
      displayName: string;
      avatarUrl: string | null;
      handle: string;
    };
  };
  lastMessage: string;                 // Truncated preview (first 80 chars)
  lastMessageAt: Timestamp;
  lastMessageSenderUid: string;
  unreadCounts: { [uid: string]: number };  // Per-participant unread counter
  createdAt: Timestamp;
}
```

**Message document** (`conversations/{conversationId}/messages/{messageId}`):
```typescript
interface Message {
  messageId: string;
  senderUid: string;
  senderDisplayName: string;
  senderAvatarUrl: string | null;
  text: string;
  createdAt: Timestamp;
  seenAt: Timestamp | null;  // Set when recipient opens thread
  seenBy: string[];          // UIDs that have seen (just recipient for 1:1)
}
```

**Unread count implementation (Claude's Discretion):** Counter field on the conversation document (`unreadCounts[uid]`). Incremented by `+1` on send via Admin SDK Server Action. Reset to 0 when recipient opens the conversation thread. This avoids an extra query-time count and supports the navbar badge calculation with a simple where clause.

**lastSeen update mechanism (Claude's Discretion):** Update `userProfiles/{uid}.lastSeen` via a Server Action called from a `useEffect` on page load inside any authenticated page. Use `window.addEventListener('focus', ...)` to re-update on tab re-focus. Write is fire-and-forget (no await in UI path). Batching is unnecessary — single document write on a profile doc.

### Pattern 4: Real-Time Message Thread (onSnapshot)

**What:** Client Component subscribes to the messages subcollection. Mirrors FeedClient's onSnapshot pattern from Phase 2 social feed but applied to a single conversation.

```typescript
// src/components/messages/MessageThread.tsx
'use client';

useEffect(() => {
  const db = getFirestore(firebaseApp);
  const messagesRef = collection(db, 'conversations', conversationId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'asc'));  // chronological, newest at bottom

  const unsub = onSnapshot(q, (snap) => {
    const msgs = snap.docs.map(d => ({ messageId: d.id, ...d.data() }) as Message);
    setMessages(msgs);
  });

  return () => unsub();
}, [conversationId]);
```

### Pattern 5: MessagesIcon (Envelope Badge)

**What:** Exact structural mirror of NotificationBell. onSnapshot on `conversations` where `unreadCounts.{uid} > 0`.

```typescript
// src/components/nav/MessagesIcon.tsx
'use client';

useEffect(() => {
  const db = getFirestore(firebaseApp);
  const q = query(
    collection(db, 'conversations'),
    where(`participantUids`, 'array-contains', uid),
    where(`unreadCounts.${uid}`, '>', 0)   // NOTE: see Pitfall #3 below
  );
  const unsub = onSnapshot(q, (snap) => setUnreadCount(snap.size));
  return () => unsub();
}, [uid]);
```

### Anti-Patterns to Avoid

- **Flat `messages` collection:** Do not store all messages in a top-level collection with `conversationId` field. Requires a composite index for `conversationId + createdAt`, creates unbounded collection growth, and gives no natural security boundary.
- **Client-side conversation creation:** Do not create conversation documents from the client. Use a Server Action so the Admin SDK can set the `conversationId` deterministically (sorted uid pair) and atomically write the conversation doc only if it doesn't already exist.
- **Fetching all conversations client-side on mount:** The conversation list should be pre-fetched by the Server Component on initial load. onSnapshot is for incremental updates after the initial render.
- **Storing full message text in conversation preview:** Store only a truncated preview (`lastMessage.slice(0, 80)`) in the conversation doc to keep it lightweight.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Search keyword tokenization | Custom tokenizer for search queries | Existing `buildPatristicKeywords`, `buildVerseKeywords`, `buildVideoSearchKeywords`, `buildSearchKeywords`, `buildDisplayNameKeywords` in their respective modules | All 5 functions already exist with tested edge cases (punctuation, minimum length, deduplication) |
| Full-text search across 5 collections | Algolia, Elasticsearch, or custom indexing | Firestore `array-contains` on `searchKeywords` field | Already used by every content type; consistent; free tier; no extra service |
| Conversation ID generation | UUID / random ID | Sorted uid pair: `[uid1, uid2].sort().join('_')` | Deterministic — avoids duplicate conversation docs for the same two users; enables `getDoc` by ID instead of a query |
| Message pagination | Custom cursor logic | Firestore `orderBy('createdAt', 'asc')` + onSnapshot | Prototype DMs won't have thousands of messages; load all in one subscription; add pagination only if needed |
| Unread badge count | Server-side calculation on every page load | `unreadCounts[uid]` counter field on conversation doc + onSnapshot | Avoids expensive aggregation query; counter is maintained at write time |
| Online presence infrastructure | WebSockets / dedicated presence service | `lastSeen: Timestamp` field on `userProfiles` doc, updated on page load | Sufficient for "active in last 5 minutes" green dot; no separate infrastructure |

**Key insight:** Every search problem in this project is already solved. Phase 7 search is purely a composition and UI task — no new Firestore query logic needed.

---

## Common Pitfalls

### Pitfall 1: Firestore Does Not Support Full-Word-Match Search
**What goes wrong:** A search for "grace" will not match documents indexed with "gracefulness" when using `array-contains`. It only matches exact tokens.
**Why it happens:** `array-contains` is an equality check on array elements, not a substring match.
**How to avoid:** The existing keyword builders generate prefix substrings (e.g., `buildDisplayNameKeywords` generates all prefixes >= 2 chars). Scripture and patristic builders filter to whole words >= 3 chars. The UX already accounts for this: the "No results" state suggests trying a shorter keyword.
**Warning signs:** Users searching for partial words in Scripture getting zero results.

### Pitfall 2: Multiple array-contains Clauses in One Firestore Query
**What goes wrong:** Combining `array-contains` on `searchKeywords` AND another `array-contains` (e.g., `participantUids`) in the same query throws a Firestore error — only one `array-contains` or `array-contains-any` clause is allowed per query.
**Why it happens:** Firestore limitation.
**How to avoid:** The unread conversations query uses `array-contains` on `participantUids`. It cannot also filter on `unreadCounts` with array-contains. Use `where('participantUids', 'array-contains', uid)` as the primary filter, then filter unread conversations client-side (`snap.docs.filter(d => (d.data().unreadCounts[uid] ?? 0) > 0)`).

### Pitfall 3: Querying a Nested Map Field with where() May Require a Composite Index
**What goes wrong:** `where('unreadCounts.uid', '>', 0)` with a dynamic uid key in the field path may not use a standard index and can fail or require a manually created Firestore index.
**Why it happens:** Firestore indexes map field paths literally; dynamic field path segments are not natively indexed.
**How to avoid:** Filter the conversation list client-side after fetching all conversations for the user: `conversations.filter(c => (c.unreadCounts[uid] ?? 0) > 0)`. The number of conversations per user is small enough that client filtering is acceptable.

### Pitfall 4: Duplicate Conversations for Same User Pair
**What goes wrong:** Two users start messaging each other from two different sessions simultaneously, creating two separate conversation documents.
**Why it happens:** Race condition if conversation creation checks existence then creates.
**How to avoid:** Use deterministic `conversationId = [uid1, uid2].sort().join('_')` and use `db.collection('conversations').doc(conversationId).set(data, { merge: false })` inside a Server Action with a transaction or `createIfNotExists` guard. Since the conversationId is deterministic, two simultaneous creates will both try to write the same document ID — Firestore set() without merge will silently overwrite (acceptable for a prototype since both writes contain identical data).

### Pitfall 5: Message Thread Auto-Scroll to Bottom
**What goes wrong:** New messages append at the bottom but the viewport doesn't scroll down, requiring the user to manually scroll.
**Why it happens:** DOM doesn't auto-scroll on state updates.
**How to avoid:** Use a `scrollRef` to the bottom of the messages container. In the onSnapshot effect, after setting messages, call `scrollRef.current?.scrollIntoView({ behavior: 'smooth' })`. Apply `behavior: 'instant'` on initial load, `smooth` for incremental new messages.

### Pitfall 6: Search Race Condition (Stale Results)
**What goes wrong:** User types quickly; two search requests are in-flight; the first (slower) one resolves after the second, replacing newer results with stale ones.
**Why it happens:** No cancellation of in-flight Server Component navigations.
**How to avoid:** The search page is a Server Component — each navigation to `/search?q=...` is a full page navigation in Next.js App Router, which inherently cancels the previous navigation. No debounce needed on the server side. A 300ms debounce on the navbar input before calling `router.push` is sufficient to prevent unnecessary navigations.

### Pitfall 7: Seen Receipt Overwriting on Both Sides
**What goes wrong:** Setting `seenAt` on the message document when either participant opens the thread, incorrectly marking the sender's own sent messages as "seen" by themselves.
**Why it happens:** Incorrect condition on the mark-as-seen logic.
**How to avoid:** Only update `seenAt` and `seenBy` if the current user is NOT the sender of that message. The "Seen" indicator only appears on the sender's last message to indicate the recipient has seen it.

---

## Code Examples

Verified patterns from existing codebase:

### Existing onSnapshot Pattern (from NotificationBell.tsx)
```typescript
// Source: src/components/nav/NotificationBell.tsx (lines 92-111)
useEffect(() => {
  const db = getFirestore(firebaseApp);
  const q = query(
    collection(db, 'users', uid, 'notifications'),
    where('read', '==', false),
    orderBy('createdAt', 'desc'),
    limit(50),
  );
  const unsub = onSnapshot(q, (snap) => {
    setUnreadCount(snap.size);
  });
  return () => unsub();
}, [uid]);
```

### Unread Badge Markup Pattern (from NotificationBell.tsx)
```typescript
// Source: src/components/nav/NotificationBell.tsx (lines 149-153)
{unreadCount > 0 && (
  <span className="absolute top-1.5 right-1.5 min-w-4 h-4 bg-gold text-navy font-cinzel text-xs font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
    {unreadCount > 99 ? '99+' : unreadCount}
  </span>
)}
```

### searchPatristicTexts (from src/lib/firestore/patristic.ts — call without modification)
```typescript
// Source: src/lib/firestore/patristic.ts (lines 79-93)
export async function searchPatristicTexts(query: string, limit = 20): Promise<PatristicText[]> {
  const keyword = query.toLowerCase().trim();
  if (!keyword) return [];
  const db = getAdminFirestore();
  const snap = await db
    .collection('patristic_texts')
    .where('searchKeywords', 'array-contains', keyword)
    .limit(limit)
    .get();
  return snap.docs.map(d => d.data() as PatristicText);
}
```

### Server Component + Client Component Split (from src/app/(main)/agora/page.tsx)
```typescript
// Source: src/app/(main)/agora/page.tsx
export default async function AgoraPage() {
  const tokens = await getTokens(await cookies(), authConfig);
  if (!tokens) redirect('/login');
  return <FeedClient uid={tokens.decodedToken.uid} />;
}
```

### Conversation ID Derivation
```typescript
// Deterministic key for any two users — guarantees uniqueness
function getConversationId(uid1: string, uid2: string): string {
  return [uid1, uid2].sort().join('_');
}
```

### createOrGetConversation Server Action (pattern)
```typescript
// src/app/actions/messages.ts
'use server';
export async function createOrGetConversation(
  currentUid: string,
  otherUid: string,
): Promise<string> {
  const conversationId = getConversationId(currentUid, otherUid);
  const db = getAdminFirestore();
  const ref = db.collection('conversations').doc(conversationId);
  const snap = await ref.get();
  if (!snap.exists) {
    // Fetch both profiles for denormalized participant data
    const [p1, p2] = await Promise.all([
      db.collection('userProfiles').doc(currentUid).get(),
      db.collection('userProfiles').doc(otherUid).get(),
    ]);
    await ref.set({
      conversationId,
      participantUids: [currentUid, otherUid],
      participantProfiles: {
        [currentUid]: pick(p1.data(), ['displayName', 'avatarUrl', 'handle']),
        [otherUid]: pick(p2.data(), ['displayName', 'avatarUrl', 'handle']),
      },
      lastMessage: '',
      lastMessageAt: FieldValue.serverTimestamp(),
      lastMessageSenderUid: '',
      unreadCounts: { [currentUid]: 0, [otherUid]: 0 },
      createdAt: FieldValue.serverTimestamp(),
    });
  }
  return conversationId;
}
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Client-side Firestore reads in page components | Server Component fetches with `getAdminFirestore()`, passes as props | No client bundle reads on initial render; established since Phase 1 |
| Separate search service (Algolia) | Firestore `array-contains` on pre-built `searchKeywords` arrays | Already in use; no new service needed; free tier |
| Polling for new messages | Firestore `onSnapshot` real-time listener | Used by NotificationBell; same pattern for message thread |
| Per-message unread tracking | Per-conversation `unreadCounts` counter object | Simpler; badge shows conversation count not message count (per locked decision) |

**No deprecated approaches to avoid in this phase.**

---

## Firestore Rules Required

Phase 7 must add rules for two new collections. Following the established pattern of "Admin SDK writes only, client reads with ownership guard":

```javascript
// conversations/{conversationId}
//   READ:  participants only (participantUids array-contains request.auth.uid)
//   WRITE: false — Server Actions only via Admin SDK
match /conversations/{conversationId} {
  allow read: if request.auth != null
    && request.auth.uid in resource.data.participantUids;
  allow write: if false;

  // conversations/{conversationId}/messages/{messageId}
  //   READ:  participants only (checked on parent doc via get())
  //   WRITE: false — Server Actions only
  match /messages/{messageId} {
    allow read: if request.auth != null;  // Simplified: parent rule enforces participant check
    allow write: if false;
  }
}
```

**Note:** Firestore security rules cannot easily reference the parent document in a subcollection rule without using `get()`, which counts as an extra read. For a prototype, the simpler approach is to allow reads on messages for any authenticated user (the `conversationId` itself is secret enough for a prototype — it's a non-guessable sorted uid pair). This matches the security posture of other subcollections in this project.

---

## Open Questions

1. **Search result type coverage for Videos**
   - What we know: `buildVideoSearchKeywords` exists and `videos` collection has `searchKeywords` field
   - What's unclear: There is no standalone `searchVideos(query, limit)` function in `src/lib/firestore/videos.ts` — it only has `buildVideoSearchKeywords`, `getVideoById`, and `getChannelById`
   - Recommendation: The `search.ts` aggregation module must inline a `searchVideos` Admin SDK query, or a `searchVideos()` helper must be added to `videos.ts`. The latter is cleaner.

2. **Search result type coverage for Posts**
   - What we know: `buildSearchKeywords` exists in `src/lib/firestore/posts.ts` and posts have `searchKeywords` field
   - What's unclear: There is no `searchPosts(query, limit)` function
   - Recommendation: Same as above — add `searchPosts()` to `posts.ts` or inline in the aggregation module.

3. **People search field name**
   - What we know: `buildDisplayNameKeywords` generates keywords stored in `displayNameKeywords` on `userProfiles` documents; `searchMembersByName` uses `displayNameKeywords array-contains`
   - What's unclear: Whether all existing user profiles have `displayNameKeywords` populated
   - Recommendation: Phase 7 search for people can call `searchMembersByName` unchanged; unindexed profiles will simply not appear in results (acceptable for prototype).

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 30 + jest-environment-jsdom |
| Config file | `jest.config.ts` (root) |
| Quick run command | `npx jest --testPathPatterns=tests/lib/search` |
| Full suite command | `npx jest` |

**Note:** Jest 30 uses `--testPathPatterns` (plural). All verify commands must use the plural flag (established in Phase 2 decisions).

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SRCH-01 | `globalSearch()` returns results across all 5 types | unit | `npx jest --testPathPatterns=tests/lib/search` | Wave 0 |
| SRCH-01 | `globalSearch('')` returns empty for all types | unit | `npx jest --testPathPatterns=tests/lib/search` | Wave 0 |
| SRCH-02 | Tab state renders correct result subset | manual | Navigate `/search?q=grace&tab=scripture` | manual-only |
| MSG-01 | `sendMessage()` creates message document | unit | `npx jest --testPathPatterns=tests/lib/messages` | Wave 0 |
| MSG-01 | `createOrGetConversation()` is idempotent (same ID both calls) | unit | `npx jest --testPathPatterns=tests/lib/messages` | Wave 0 |
| MSG-02 | Conversation list renders with last message preview | manual | Open `/messages` as test user | manual-only |
| MSG-03 | Messages ordered chronological asc in thread | manual | Open `/messages/[id]` with 3+ messages | manual-only |

### Sampling Rate
- **Per task commit:** `npx jest --testPathPatterns=tests/lib/search tests/lib/messages`
- **Per wave merge:** `npx jest`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/lib/search.test.ts` — covers SRCH-01 (globalSearch aggregation, empty query guard)
- [ ] `tests/lib/messages.test.ts` — covers MSG-01 (sendMessage, createOrGetConversation idempotency)
- [ ] `tests/lib/messages.test.ts` — covers getConversationId sort determinism

*(Firebase admin is mocked via `jest.mock()` hoisting + `require()` pattern established in Phase 3 for `tests/lib/videos.test.ts`)*

---

## Sources

### Primary (HIGH confidence)
- Direct source code audit: `src/components/nav/NotificationBell.tsx` — onSnapshot pattern, badge markup, dropdown structure
- Direct source code audit: `src/components/nav/Navbar.tsx` — layout structure, fathersOpen pattern for managing dropdown state
- Direct source code audit: `src/lib/firestore/patristic.ts` — `searchPatristicTexts()` exact signature (call without modification)
- Direct source code audit: `src/lib/firestore/scripture.ts` — `searchVerses()` pattern
- Direct source code audit: `src/lib/firestore/synodeia.ts` — `searchMembersByName()` pattern
- Direct source code audit: `src/lib/firestore/posts.ts` — `buildSearchKeywords()` (no searchPosts function exists — gap)
- Direct source code audit: `src/lib/firestore/videos.ts` — `buildVideoSearchKeywords()` (no searchVideos function exists — gap)
- Direct source code audit: `firestore.rules` — security rule patterns for new collections
- Direct source code audit: `src/app/(main)/agora/page.tsx` — Server Component + Client Component split pattern
- Direct source code audit: `src/lib/types/social.ts` — UserProfile type (has `displayNameKeywords` confirmed)
- Direct source code audit: `package.json` — exact installed versions of all dependencies
- Direct source code audit: `jest.config.ts` — test runner configuration

### Secondary (MEDIUM confidence)
- Firestore documentation pattern: subcollection vs flat collection tradeoffs — standard Firestore best practice for hierarchical 1:N data (messages per conversation)
- Firestore documentation: `array-contains` limitation of one per query — well-documented constraint

### Tertiary (LOW confidence — not needed; all critical knowledge sourced from codebase directly)
None.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries confirmed from package.json; no new installs needed
- Architecture: HIGH — all patterns derived from existing working code in the same project; data model follows Firestore conventions
- Search gap (missing searchVideos/searchPosts): HIGH — confirmed by reading source files; both files have only keyword builders and getById helpers
- Pitfalls: HIGH — array-contains limit and map field query issues are documented Firestore constraints; others derived from code patterns in this codebase
- Test framework: HIGH — confirmed from jest.config.ts, package.json, and existing test files

**Research date:** 2026-03-19
**Valid until:** 2026-06-19 (stable stack; all dependencies confirmed from lockfile)
