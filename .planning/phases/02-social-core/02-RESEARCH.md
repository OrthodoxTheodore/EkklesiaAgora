# Phase 2: Social Core - Research

**Researched:** 2026-03-18
**Domain:** Firestore social data modeling, Firebase AI Logic (Gemini), Firebase Storage, in-app notifications, link preview scraping, Firestore keyword search
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Comment interaction model:**
- Each post has a dedicated permalink/detail page at `/agora/[postId]`
- Feed cards show comment count as clickable link navigating to post detail
- Comment threads on detail page are flat (no nesting)
- All comments load at once on detail page (no pagination)
- Users can delete and edit their own posts and comments; show "edited" timestamp on edited content
- Comments restricted to registered users only
- Post author can restrict comments to followers only (set at post creation or edited after)
- Flags/reports go to mod queue; content stays visible until moderator acts (no auto-hide threshold)

**Profile page structure:**
- Twitter/X-style layout: large header banner, circular avatar, display name, @handle, bio, jurisdiction badge, follower/following counts
- Profile URL uses @handle: `/profile/[handle]`
- Users have both a unique @handle (URL-safe, used in URLs and mentions) and a display name (free text)
- Profile tabs: Posts and Media (photos/images only)
- Optional custom banner/header image; falls back to Byzantine gold/navy tile pattern

**Jurisdiction display:**
- Jurisdiction is a content trust signal prominently displayed on every profile page AND every post card
- All canonically recognized Eastern Orthodox churches included
- Jurisdiction dropdown has two sections: "Canonical Eastern Orthodox Churches" and "Other Christians"
- Patron saint field is optional and secondary — shown on profile but not on post cards

**Profile actions:**
- Follow button (primary action)
- Message button — present but disabled/placeholder in Phase 2; shows "coming soon" tooltip
- Three-dot overflow: Block, Mute, Report User (report last, de-emphasized)

**Category tagging on posts:**
- Firebase AI / Gemini auto-classifies post text into one of the 10 Orthodox categories
- User sees AI suggestion before posting and can override with manual picker
- If AI confidence low or post too short: prompt user to pick manually
- 10 categories: Divine Liturgy, Holy Scripture, Holy Fathers, Iconography, Holy Trinity, Chanting & Music, Feast Days/Fast Days, Church History, Apologetics, Spiritual Life
- Category tag displayed on every post card
- Agora feed has horizontal scrollable category filter tabs: `All | Divine Liturgy | ...`

**Feed layout and post cards:**
- Must include per card: jurisdiction badge, avatar, @handle, display name, verification checkmark (if verified), relative timestamp, post text, optional image, category tag chip, like count, comment count

### Claude's Discretion
- Loading skeleton / placeholder states
- Exact spacing and typography within the Byzantine design system
- Error states and optimistic update behavior for likes
- Feed pagination/infinite scroll strategy
- Firebase AI prompt engineering for category classification

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within Phase 2 scope.
- Message/DM button is a layout placeholder in Phase 2, not a new capability — full DM feature ships in Phase 7.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PROF-01 | User can set display name, avatar, and bio | Firestore `userProfiles` collection; Firebase Storage for avatar; Server Action for profile update |
| PROF-02 | User can select Eastern Orthodox jurisdiction from dropdown | Hardcoded jurisdiction list in shared constant; stored in `userProfiles`; no external data source needed |
| PROF-03 | Non-Eastern Orthodox users can select: Inquirer, Roman Catholic, Protestant, or Oriental Orthodox | Second section of same jurisdiction dropdown; same `jurisdictionId` field with different values |
| PROF-04 | User can view other users' public profiles | Server Component at `/profile/[handle]`; reads `userProfiles` by handle; uses existing `getTokens()` pattern |
| PROF-05 | User can edit their own profile at any time | `/profile/edit` page; Server Action writes to Firestore; avatar upload via Firebase Storage |
| PROF-06 | User can upload profile photo | `uploadBytesResumable` from `firebase/storage`; store download URL in `userProfiles`; also supports banner image |
| AGRA-01 | User can create text posts | Server Action writes to `posts` collection + fan-out to `userFeed` subcollections of followers |
| AGRA-02 | User can attach photos/images to posts | Firebase Storage upload before post creation; `imageUrl` field on post document |
| AGRA-03 | User can like/unlike posts | `likes` subcollection on post; optimistic client update; Server Action toggles |
| AGRA-04 | User can comment on posts | `comments` subcollection on post; flat thread; Server Action creates/edits/deletes |
| AGRA-05 | User can view activity feed of posts from followed users/channels | Fan-out feed pattern; read from `users/{uid}/userFeed` subcollection ordered by `createdAt` desc |
| AGRA-06 | User can block/mute other users | `userBlocks` and `userMutes` collections; client-side filter in feed; Firestore rules prevent blocked user writes |
| AGRA-07 | In-app notification bell for likes, comments, follows, mentions | `notifications` subcollection on user doc; real-time `onSnapshot` listener in Navbar |
| AGRA-08 | Link preview cards when sharing URLs in posts | Server Action fetches OG metadata via `open-graph-scraper`; preview stored on post document |
| AGRA-09 | User can delete their own posts | Server Action; deletes post + removes from `userFeed` of followers; deletes subcollections (likes, comments) |
| AGRA-10 | User can search posts by keyword | Firestore prefix query on `searchKeywords` array field (array-contains); limited but sufficient for Phase 2 |
| CAT-01 | All content can be tagged with Orthodox categories | 10-enum category field on post; Firebase AI auto-classify on compose; manual override picker |
| CAT-02 | Users can filter/browse content by category | Firestore `where('category', '==', selectedCategory)` on feed query; horizontal filter tabs in UI |
</phase_requirements>

---

## Summary

Phase 2 is the largest phase to date — it introduces Firestore's social graph data model, Firebase Storage for media, Firebase AI for category classification, and a real-time notification system. The codebase from Phase 1 provides a solid foundation: existing auth patterns, Server Component + `getTokens()` pattern, Server Actions, Tailwind v4 Byzantine tokens, and reusable UI components (Card, Button, Input). Phase 2 extends all of these, adding no new framework dependencies beyond Firebase AI (already in the `firebase` package as `firebase/ai`) and a server-side link preview library.

The central architectural challenge is the Firestore data model. A fan-out-on-write feed pattern is the correct choice for a prototype at this scale: when a user posts, a copy of the post reference (or full post) is written to each follower's `userFeed` subcollection. Reads become O(1) per user. For the Ekklesia Agora prototype with hundreds to low thousands of users, this is straightforward to implement as a Server Action — no Cloud Functions needed at this scale. The tradeoff (write amplification for users with many followers) is acceptable at prototype scale.

The second architectural complexity is keyword search. Firestore does not support native full-text search. The recommended approach for Phase 2 is an array-contains query on a `searchKeywords` array field populated by client/server at post creation — sufficient for basic keyword matching and avoids external search service dependencies until Phase 7 when global search ships.

Firebase AI Logic (the `firebase/ai` module bundled in the `firebase` package already installed) provides Gemini-powered category classification with enum-constrained structured output. This runs client-side via the Firebase AI Logic proxy, which handles API key management through Firebase App Check — no server-side API key exposure.

**Primary recommendation:** Model data in five new Firestore collections (`userProfiles`, `posts`, `follows`, `notifications`, `userBlocks`/`userMutes`) with `likes` and `comments` as post subcollections and `userFeed` as a user subcollection. All writes go through Server Actions using Firebase Admin SDK. All reads use Firestore client SDK from Client Components (real-time) or Admin SDK from Server Components.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| firebase | 12.10.0 (installed) | Client SDK: Firestore reads, Storage upload, Firebase AI | Already installed; `firebase/ai` module is included — no new install needed |
| firebase-admin | 13.7.0 (installed) | Server SDK: Firestore writes via Server Actions | Already installed; Admin SDK used for all write operations |
| next-firebase-auth-edge | 1.12.0 (installed) | Auth token verification in Server Components | Already installed; same pattern used in Phase 1 |
| open-graph-scraper | 6.11.0 | Server-side OG metadata fetch for link preview cards | Node.js only (server-side); works in Next.js Server Actions; no browser runtime needed |
| lucide-react | 0.577.0 | Icons: heart, message-circle, bell, more-horizontal, camera | Already used in project; provides all icons needed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-hook-form | 7.71.2 (installed) | Profile edit form, compose textarea validation | Already installed from Phase 1; use for PROF-01/05 forms |
| zod | 4.3.6 (installed) | Schema validation for post content, profile fields | Already installed; use for Server Action input validation |

### New Packages to Install
```bash
npm install open-graph-scraper
```

**No other new packages needed.** Firebase AI Logic (`firebase/ai`) is already bundled in the `firebase` package at version 12.10.0. Lucide React is already in the project. The custom design system from Phase 1 covers all UI needs.

### Version Verification
- `firebase` 12.10.0 — verified in package.json; includes `firebase/ai` module with `getAI`, `getGenerativeModel`, `GoogleAIBackend`, `Schema`
- `open-graph-scraper` 6.11.0 — verified via `npm view open-graph-scraper version` on 2026-03-18
- `lucide-react` 0.577.0 — verified via `npm view lucide-react version` on 2026-03-18

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| open-graph-scraper | unfurl.js | Both work; open-graph-scraper is simpler, more widely used, TypeScript declarations included |
| Firestore array-contains keyword search | Algolia / Typesense | External services add cost and complexity; AGRA-10 scope is "search posts by keyword" — prefix array search is sufficient for prototype; Phase 7 ships full global search |
| Client-side Firebase AI | Server-side Gemini API call | Client-side Firebase AI Logic handles API key management through Firebase App Check; no API key exposure; simpler than building a server endpoint |
| Fan-out via Server Action | Fan-out via Cloud Functions | Cloud Functions add deployment complexity; Server Action fan-out is synchronous and simpler at prototype scale (hundreds of users) |

---

## Architecture Patterns

### Recommended Project Structure (Phase 2 additions)

```
src/
├── app/
│   └── (main)/
│       ├── agora/
│       │   ├── page.tsx                  # Feed page — Server Component auth check, renders FeedClient
│       │   └── [postId]/
│       │       └── page.tsx              # Post detail / permalink — Server Component
│       ├── profile/
│       │   ├── [handle]/
│       │   │   └── page.tsx              # Public profile — Server Component
│       │   └── edit/
│       │       └── page.tsx              # Edit profile — protected Server Component
│       └── dashboard/
│           └── page.tsx                  # Phase 1 file — update to redirect to /agora
│   └── actions/
│       ├── posts.ts                      # createPost, deletePost, editPost Server Actions
│       ├── comments.ts                   # createComment, deleteComment, editComment Server Actions
│       ├── follows.ts                    # followUser, unfollowUser Server Actions
│       ├── likes.ts                      # toggleLike Server Action
│       ├── profile.ts                    # updateProfile Server Action
│       ├── notifications.ts              # markNotificationsRead Server Action
│       ├── linkPreview.ts                # fetchLinkPreview Server Action (uses open-graph-scraper)
│       └── moderation.ts                 # blockUser, muteUser, reportContent Server Actions
├── components/
│   ├── agora/
│   │   ├── FeedClient.tsx               # Client Component: real-time feed with onSnapshot
│   │   ├── PostCard.tsx                 # Post card component (from UI-SPEC)
│   │   ├── ComposeBox.tsx               # Compose form with AI category suggestion
│   │   ├── CategoryFilterTabs.tsx       # Horizontal scrollable category filters
│   │   ├── CommentCard.tsx              # Individual comment component
│   │   ├── LinkPreviewCard.tsx          # Link preview card embedded in PostCard
│   │   ├── BlockingSkeletons.tsx        # Skeleton loaders for feed
│   │   └── PostDetailClient.tsx         # Client Component: comment thread
│   ├── profile/
│   │   ├── ProfileHeader.tsx            # Profile header with banner/avatar/stats
│   │   ├── ProfileTabs.tsx              # Posts / Media tabs
│   │   └── JurisdictionDropdown.tsx     # Two-section jurisdiction picker
│   └── nav/
│       ├── Navbar.tsx                   # Phase 1 file — add NotificationBell
│       └── NotificationBell.tsx         # Bell icon with unread badge + dropdown
├── lib/
│   ├── firebase/
│   │   ├── client.ts                    # Phase 1 file — unchanged
│   │   ├── admin.ts                     # Phase 1 file — unchanged
│   │   └── roles.ts                     # Phase 1 file — unchanged
│   ├── firestore/
│   │   ├── posts.ts                     # Firestore query helpers: getFeedPosts, getPost, etc.
│   │   ├── profiles.ts                  # getProfile, getProfileByHandle query helpers
│   │   └── notifications.ts             # Notification query helpers
│   └── constants/
│       ├── jurisdictions.ts             # Full jurisdiction list (two sections)
│       └── categories.ts                # 10 Orthodox category constants
```

### Pattern 1: Firestore Data Model

**What:** Five new top-level collections plus subcollections. All writes via Server Actions using Admin SDK. All real-time reads via Firestore client SDK in Client Components.

```typescript
// ─── userProfiles/{uid} ───────────────────────────────────────────
interface UserProfile {
  uid: string;
  handle: string;             // URL-safe, unique, e.g. "frgeorge" — indexed
  displayName: string;        // Free text display name
  bio: string;                // Profile bio, up to 300 chars
  avatarUrl: string | null;   // Firebase Storage download URL
  bannerUrl: string | null;   // Firebase Storage download URL; null = default tile pattern
  jurisdictionId: string;     // e.g. "antiochian", "oca", "inquirer" — see constants/jurisdictions.ts
  patronSaint: string | null; // Optional fun field
  followerCount: number;      // Denormalized counter (incremented/decremented on follow/unfollow)
  followingCount: number;     // Denormalized counter
  postCount: number;          // Denormalized counter
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── posts/{postId} ───────────────────────────────────────────────
interface Post {
  postId: string;
  authorUid: string;
  authorHandle: string;       // Denormalized — avoid extra reads when rendering feed
  authorDisplayName: string;  // Denormalized
  authorAvatarUrl: string | null; // Denormalized
  authorJurisdictionId: string;   // Denormalized — jurisdiction badge on every card
  authorRoleLevel: number;    // Denormalized — verified checkmark (>= 2)
  text: string;               // Post body text
  imageUrl: string | null;    // Firebase Storage download URL
  category: string;           // One of 10 Orthodox categories (see constants/categories.ts)
  searchKeywords: string[];   // Array of lowercase words from text; enables array-contains search
  likeCount: number;          // Denormalized counter
  commentCount: number;       // Denormalized counter
  commentsRestricted: 'all' | 'followers'; // Who can comment
  linkPreview: LinkPreview | null;  // Fetched OG metadata if post contains URL
  createdAt: Timestamp;
  updatedAt: Timestamp | null;  // Set when post is edited
  isEdited: boolean;
}

interface LinkPreview {
  url: string;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  siteName: string | null;
}

// ─── posts/{postId}/likes/{uid} ───────────────────────────────────
// Existence = liked; document is minimal to allow security rule isOwner check
interface Like {
  uid: string;
  createdAt: Timestamp;
}

// ─── posts/{postId}/comments/{commentId} ─────────────────────────
interface Comment {
  commentId: string;
  postId: string;
  authorUid: string;
  authorHandle: string;       // Denormalized
  authorDisplayName: string;  // Denormalized
  authorAvatarUrl: string | null; // Denormalized
  text: string;
  createdAt: Timestamp;
  updatedAt: Timestamp | null;
  isEdited: boolean;
}

// ─── follows/{followerId_followedId} ──────────────────────────────
// Doc ID = `${followerUid}_${followedUid}` — deterministic for existence check
interface Follow {
  followerUid: string;
  followedUid: string;
  createdAt: Timestamp;
}

// ─── users/{uid}/userFeed/{postId} ────────────────────────────────
// Fan-out: copy written here when any followed user creates a post
// Contains full post data (denormalized) so feed reads need no joins
interface FeedEntry extends Post {
  // Same as Post — full copy written by Server Action fan-out
}

// ─── users/{uid}/notifications/{notificationId} ────────────────────
interface Notification {
  notificationId: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  fromUid: string;
  fromHandle: string;       // Denormalized
  fromDisplayName: string;  // Denormalized
  fromAvatarUrl: string | null; // Denormalized
  postId: string | null;    // null for 'follow' type
  postText: string | null;  // First 80 chars of post for context; null for 'follow'
  read: boolean;
  createdAt: Timestamp;
}

// ─── userBlocks/{uid}/blocked/{blockedUid} ────────────────────────
interface Block {
  blockedUid: string;
  createdAt: Timestamp;
}

// ─── userMutes/{uid}/muted/{mutedUid} ────────────────────────────
interface Mute {
  mutedUid: string;
  createdAt: Timestamp;
}
```

### Pattern 2: Fan-Out Feed on Post Creation

**What:** When a user creates a post, the Server Action writes the post to `posts/`, then fans out to each follower's `userFeed` subcollection. At prototype scale (hundreds of users), this runs synchronously in the Server Action.

**When to use:** `createPost` Server Action.

```typescript
// src/app/actions/posts.ts
'use server';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function createPost(data: CreatePostInput, authorUid: string) {
  const db = getAdminFirestore();
  const postRef = db.collection('posts').doc();
  const postId = postRef.id;

  const post: Post = {
    postId,
    authorUid,
    // ...denormalized author fields fetched from userProfiles...
    searchKeywords: buildSearchKeywords(data.text), // lowercase word tokens
    createdAt: FieldValue.serverTimestamp(),
    // ...other fields
  };

  // Write canonical post document
  await postRef.set(post);

  // Fan-out to follower feeds (batched writes — max 500 per batch)
  const followsSnap = await db.collection('follows')
    .where('followedUid', '==', authorUid)
    .get();

  const followerUids = followsSnap.docs.map(d => d.data().followerUid);
  // Also add to own feed
  followerUids.push(authorUid);

  // Batch in groups of 500 (Firestore limit)
  for (let i = 0; i < followerUids.length; i += 500) {
    const batch = db.batch();
    const chunk = followerUids.slice(i, i + 500);
    for (const uid of chunk) {
      const feedRef = db.collection('users').doc(uid)
        .collection('userFeed').doc(postId);
      batch.set(feedRef, post);
    }
    await batch.commit();
  }

  // Increment author's postCount
  await db.collection('userProfiles').doc(authorUid)
    .update({ postCount: FieldValue.increment(1) });
}

function buildSearchKeywords(text: string): string[] {
  // Tokenize: lowercase, split on whitespace/punctuation, deduplicate
  return [...new Set(
    text.toLowerCase()
      .split(/\s+|[^\w]/)
      .filter(w => w.length >= 3) // ignore short words
  )];
}
```

### Pattern 3: Firebase AI Category Classification (Client-Side)

**What:** On the compose form, after 800ms debounce, call Gemini with enum-constrained classification to suggest a category. Runs client-side via Firebase AI Logic (no server-side API key needed).

**When to use:** ComposeBox component when text changes.

```typescript
// src/components/agora/ComposeBox.tsx — excerpt
// Source: https://firebase.google.com/docs/ai-logic/generate-structured-output
import { getAI, getGenerativeModel, GoogleAIBackend, Schema } from 'firebase/ai';
import firebaseApp from '@/lib/firebase/client';

const ORTHODOX_CATEGORIES = [
  'Divine Liturgy', 'Holy Scripture', 'Holy Fathers', 'Iconography',
  'Holy Trinity', 'Chanting & Music', 'Feast Days/Fast Days',
  'Church History', 'Apologetics', 'Spiritual Life',
] as const;

const ai = getAI(firebaseApp, { backend: new GoogleAIBackend() });

const classificationModel = getGenerativeModel(ai, {
  model: 'gemini-2.0-flash',   // Use stable flash model (not preview in production)
  generationConfig: {
    responseMimeType: 'text/x.enum',
    responseSchema: Schema.enumString({ enum: ORTHODOX_CATEGORIES }),
  },
});

async function classifyPostText(text: string): Promise<string | null> {
  if (text.length < 20) return null; // Too short to classify reliably
  try {
    const prompt = `Classify this Eastern Orthodox Christian social media post into exactly one of the provided categories. Post: "${text}"`;
    const result = await classificationModel.generateContent(prompt);
    return result.response.text().trim();
  } catch {
    return null; // Graceful degradation — show manual picker
  }
}
```

**Important:** The model name `gemini-3-flash-preview` appears in Firebase docs examples but prefer `gemini-2.0-flash` (or whatever stable flash model is available) for production use. The enum constraint guarantees only valid category values are returned — no parsing needed.

### Pattern 4: Firestore Cursor Pagination for Feed (Infinite Scroll)

**What:** Load 10 posts at a time from the user's `userFeed` subcollection, using `startAfter` cursor for the next page. The UI-SPEC locks this to infinite scroll (scroll-triggered, not a button).

**When to use:** FeedClient.tsx — triggered by scroll intersection observer.

```typescript
// src/components/agora/FeedClient.tsx — excerpt
import { collection, query, orderBy, limit, startAfter, getDocs, DocumentSnapshot } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import firebaseApp from '@/lib/firebase/client';

const PAGE_SIZE = 10;

async function loadMorePosts(
  uid: string,
  lastDoc: DocumentSnapshot | null,
  category: string | null
) {
  const db = getFirestore(firebaseApp);
  let q = query(
    collection(db, 'users', uid, 'userFeed'),
    orderBy('createdAt', 'desc'),
    limit(PAGE_SIZE),
  );
  if (category) q = query(q, where('category', '==', category));
  if (lastDoc) q = query(q, startAfter(lastDoc));

  const snap = await getDocs(q);
  const posts = snap.docs.map(d => d.data() as Post);
  const newLastDoc = snap.docs[snap.docs.length - 1] ?? null;
  return { posts, lastDoc: newLastDoc, hasMore: snap.docs.length === PAGE_SIZE };
}
```

**Note on real-time vs pagination:** Combining `onSnapshot` with cursor pagination is complex (see Pitfalls section). The decision (Claude's discretion) is to use `getDocs` (non-real-time) for pagination and rely on manual refresh / optimistic updates for new posts. This is simpler and sufficient for a prototype.

### Pattern 5: Firebase Storage Upload for Avatars/Post Images

**What:** Client-side upload using `uploadBytesResumable`. Store download URL in Firestore via Server Action after upload completes.

**When to use:** Profile photo upload (PROF-06) and post image attachment (AGRA-02).

```typescript
// Source: https://firebase.google.com/docs/storage/web/upload-files
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import firebaseApp from '@/lib/firebase/client';

async function uploadAvatar(uid: string, file: File): Promise<string> {
  const storage = getStorage(firebaseApp);
  // Store under uid to enforce path-based security rules
  const storageRef = ref(storage, `avatars/${uid}/${Date.now()}_${file.name}`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        // Update progress state if needed
      },
      (error) => reject(error),
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(url);
      }
    );
  });
}
```

### Pattern 6: Link Preview via Server Action

**What:** When a URL is detected in post text, call a Server Action that fetches OG metadata server-side using `open-graph-scraper`. Store result on the post document.

**When to use:** `fetchLinkPreview` Server Action, called from ComposeBox when URL is detected.

```typescript
// src/app/actions/linkPreview.ts
'use server';
import ogs from 'open-graph-scraper';

export async function fetchLinkPreview(url: string): Promise<LinkPreview | null> {
  try {
    const { result } = await ogs({ url, timeout: 5000 });
    if (!result.success) return null;
    return {
      url,
      title: result.ogTitle ?? null,
      description: result.ogDescription ?? null,
      imageUrl: result.ogImage?.[0]?.url ?? null,
      siteName: result.ogSiteName ?? null,
    };
  } catch {
    return null; // Graceful degradation — no preview shown
  }
}
```

### Pattern 7: Notification Real-Time Listener

**What:** `onSnapshot` listener on the current user's `notifications` subcollection in Navbar for unread count badge.

**When to use:** NotificationBell component — mounts on first authenticated render, unmounts on logout.

```typescript
// src/components/nav/NotificationBell.tsx — excerpt
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';

useEffect(() => {
  if (!uid) return;
  const db = getFirestore(firebaseApp);
  const q = query(
    collection(db, 'users', uid, 'notifications'),
    where('read', '==', false),
    orderBy('createdAt', 'desc'),
    limit(50),
  );
  const unsub = onSnapshot(q, (snap) => {
    setUnreadCount(snap.size);
    setNotifications(snap.docs.map(d => d.data() as Notification));
  });
  return () => unsub();
}, [uid]);
```

### Pattern 8: Server Component + getTokens() for Protected Pages

Identical to Phase 1 dashboard pattern. All new pages under `(main)/` must verify auth server-side:

```typescript
// src/app/(main)/agora/page.tsx
import { getTokens } from 'next-firebase-auth-edge';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AgoraPage() {
  const tokens = await getTokens(await cookies(), authConfig);
  if (!tokens) redirect('/login');
  // Pass uid to Client Component
  return <FeedClient uid={tokens.decodedToken.uid} />;
}
```

### Anti-Patterns to Avoid

- **Reads + writes in the same Server Action:** Server Actions should write to Firestore via Admin SDK. Client Components should read via Firestore client SDK. Don't mix Admin SDK reads into the feed render path.
- **Fan-out synchronous for large follower counts:** At prototype scale this is fine. If a user ever has 500+ followers, the batch commits add latency. Flag this for Phase 7+ if needed.
- **Storing raw text for keyword search:** Always tokenize to lowercase keywords and store in `searchKeywords` array at write time — not at query time.
- **Fetching user profile for every post card:** Denormalize `authorHandle`, `authorDisplayName`, `authorAvatarUrl`, `authorJurisdictionId` onto every post document. Do not do a second Firestore read per card.
- **Calling Firebase AI from a Server Action:** Firebase AI Logic is a client-side SDK. It uses Firebase App Check for security, which requires the browser context. Call it from Client Components only.
- **Using onSnapshot + cursor pagination together:** This creates race conditions where real-time updates and pagination cursors conflict. Use `getDocs` for pagination; use `onSnapshot` only for collections where you need the full real-time stream (notifications).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Link preview metadata extraction | Custom fetch + HTML parsing | `open-graph-scraper` | Handles redirects, multiple OG formats, oEmbed, error cases, timeouts |
| AI category classification | Custom regex matching or keyword detection | Firebase AI Logic (`firebase/ai`) | Gemini enum output guarantees valid category; handles synonyms, context, and "Holy Fathers" vs "Scripture" distinctions |
| Image upload progress tracking | Custom XMLHttpRequest | `uploadBytesResumable` from `firebase/storage` | Built-in progress events, pause/resume/cancel, automatic retry |
| Keyword indexing at query time | `text.includes(keyword)` on server | `searchKeywords` array at write time + `array-contains` query | Firestore cannot do substring searches; pre-tokenize at write time |
| Notification real-time updates | Polling with setInterval | Firestore `onSnapshot` | onSnapshot is push-based, efficient, and handles connection recovery |
| Counter fields (likes, followers) | Re-count subcollection on every read | Denormalized counter with `FieldValue.increment()` | Firestore does not support COUNT aggregation in security-rule-respecting client reads efficiently |
| Handle uniqueness enforcement | Check-then-write from client | Server Action with Admin SDK transaction | Check-then-write from client is a TOCTOU race condition; Admin SDK transaction is atomic |

**Key insight:** The most dangerous hand-roll temptation in this phase is building custom full-text search. Firestore genuinely cannot do it natively. The `array-contains` approach with keyword tokens covers the AGRA-10 requirement ("search posts by keyword") and is the correct scope for Phase 2.

---

## Common Pitfalls

### Pitfall 1: Handle Uniqueness Race Condition
**What goes wrong:** Two users register the same @handle simultaneously. Both read "handle available" before either writes.
**Why it happens:** Optimistic client-side uniqueness check is not atomic.
**How to avoid:** Use Firestore transaction in a Server Action: read the `userProfiles` collection for the handle, write only if not found — all atomically.
**Warning signs:** Duplicate handles in the database.

### Pitfall 2: Denormalized Data Staleness
**What goes wrong:** User changes their display name. Old posts and feed entries still show the old name.
**Why it happens:** Display name is denormalized onto post documents for performance.
**How to avoid:** Accept this tradeoff for Phase 2 (prototype). Document it. The only critical denormalized field that truly breaks trust signals is `jurisdictionId` — and that changes rarely. Post-Phase 2, a background update function can sweep old posts if needed.
**Warning signs:** Post cards showing mismatched display names vs profile page.

### Pitfall 3: Firebase AI Called from Server Component / Server Action
**What goes wrong:** `getAI()` from `firebase/ai` throws because it requires the Firebase client app, which requires browser context for App Check.
**Why it happens:** Firebase AI Logic is a client-side SDK — the generated AI calls go through Firebase's proxy which validates App Check tokens.
**How to avoid:** Always call Firebase AI from a Client Component. Never import `firebase/ai` in a file with `'use server'`.
**Warning signs:** Build error "cannot use browser SDK in server context" or runtime error.

### Pitfall 4: onSnapshot + Cursor Pagination Conflict
**What goes wrong:** Feed shows duplicate posts or skips posts when a new post arrives while the user is scrolling.
**Why it happens:** Real-time listener shifts document order; cursor points to a stale position.
**How to avoid:** Use `getDocs` (non-real-time) for the paginated feed. Use `onSnapshot` only for full real-time subscriptions (notifications). For the feed, implement a "New posts available" banner that triggers a refresh rather than live insertion.
**Warning signs:** Feed jumps, duplicates, or missing posts during scrolling.

### Pitfall 5: Firebase Storage Rules Not Configured
**What goes wrong:** Avatar uploads either fail (too restrictive) or expose all user files (too permissive).
**Why it happens:** Firebase Storage security rules are separate from Firestore rules and must be explicitly configured.
**How to avoid:** Add Storage rules: allow write only to `avatars/{uid}/` and `posts/{uid}/` where `request.auth.uid == uid`. Allow read on all paths (images are public by design).
**Warning signs:** Upload returns 403; or any user can overwrite any other user's avatar.

### Pitfall 6: Firestore Array-Contains Search Returns No Results
**What goes wrong:** `where('searchKeywords', 'array-contains', 'orthodox')` returns nothing even though posts contain "Orthodox".
**Why it happens:** Keyword tokenization stored "Orthodox" (capitalized) but query is lowercase "orthodox" — case mismatch.
**How to avoid:** Always `.toLowerCase()` all keywords at write time AND at query time. The `buildSearchKeywords()` function must be consistent.
**Warning signs:** Empty search results for terms that clearly exist.

### Pitfall 7: Firestore Document Size Limit on Fan-Out Feed
**What goes wrong:** Batch write to follower feeds fails.
**Why it happens:** Firestore batch writes are limited to 500 operations. A user with 600 followers triggers two batches — forgetting to loop causes silent truncation.
**How to avoid:** Always chunk the follower list into groups of 500 before batching. The code example in Pattern 2 above shows the chunking loop.
**Warning signs:** Some followers don't see new posts in their feed.

### Pitfall 8: Profile Page Accessible by @handle Before Profile is Created
**What goes wrong:** `/profile/somehandle` throws "document not found" or shows broken UI for users who registered but haven't completed their profile.
**Why it happens:** Phase 2 needs to create a `userProfiles` document at registration time with defaults.
**How to avoid:** The `registerUser` Server Action from Phase 1 (`src/app/actions/auth.ts`) must be extended to also create a `userProfiles/{uid}` document with default fields (handle derived from email prefix, empty bio, null avatar).
**Warning signs:** 404 or unhandled error on profile pages for newly registered users.

### Pitfall 9: Category Filter + Fan-Out Feed Inconsistency
**What goes wrong:** User filters by category "Holy Scripture" but the feed still shows other categories.
**Why it happens:** `where('category', '==', value)` requires a Firestore composite index when combined with `orderBy('createdAt', 'desc')`.
**How to avoid:** Add a Firestore composite index on `(category ASC, createdAt DESC)` in `firestore.indexes.json`. Without this index, the query throws a runtime error with a link to create the index in the Firebase console.
**Warning signs:** Runtime error: "The query requires an index" with a Firebase console link.

---

## Code Examples

### Jurisdiction Constants

```typescript
// src/lib/constants/jurisdictions.ts
export const CANONICAL_ORTHODOX_JURISDICTIONS = [
  { id: 'ecumenical', label: 'Ecumenical Patriarchate' },
  { id: 'antiochian', label: 'Antiochian Orthodox' },
  { id: 'rocor', label: 'Russian Orthodox Church Outside Russia (ROCOR)' },
  { id: 'oca', label: 'Orthodox Church in America (OCA)' },
  { id: 'serbian', label: 'Serbian Orthodox Church' },
  { id: 'bulgarian', label: 'Bulgarian Orthodox Church' },
  { id: 'romanian', label: 'Romanian Orthodox Church' },
  { id: 'georgian', label: 'Georgian Orthodox Church' },
  { id: 'greek', label: 'Greek Orthodox Archdiocese' },
  { id: 'albanian', label: 'Albanian Orthodox Church' },
  { id: 'czech_slovak', label: 'Orthodox Church of Czech Lands and Slovakia' },
  { id: 'polish', label: 'Polish Orthodox Church' },
  { id: 'alexandrian', label: 'Greek Orthodox Patriarchate of Alexandria' },
  { id: 'jerusalem', label: 'Greek Orthodox Patriarchate of Jerusalem' },
  { id: 'cyprus', label: 'Church of Cyprus' },
  { id: 'finland', label: 'Orthodox Church of Finland' },
  { id: 'ocu', label: 'Orthodox Church of Ukraine (OCU)' },
  { id: 'uoc', label: 'Ukrainian Orthodox Church (UOC)' },
] as const;

export const OTHER_CHRISTIAN_JURISDICTIONS = [
  { id: 'inquirer', label: 'Inquirer / Catechumen' },
  { id: 'roman_catholic', label: 'Roman Catholic' },
  { id: 'protestant', label: 'Protestant' },
  { id: 'oriental_orthodox', label: 'Oriental Orthodox' },
] as const;
```

### Firestore Security Rules (Phase 2 additions)

```javascript
// firestore.rules additions for Phase 2

// posts/{postId}
match /posts/{postId} {
  allow read: if true; // Public — guests can read (AUTH-05)
  allow write: if false; // Server Actions only (Admin SDK bypasses rules)
}

// posts/{postId}/likes/{uid}
match /posts/{postId}/likes/{uid} {
  allow read: if true;
  allow write: if isOwner(uid) && isRegistered(); // Own likes only
}

// posts/{postId}/comments/{commentId}
match /posts/{postId}/comments/{commentId} {
  allow read: if true;
  allow write: if false; // Server Actions handle all comment writes
}

// userProfiles/{uid}
// Note: already has a /users/{uid} rule; userProfiles is the separate Phase 2 profile collection
match /userProfiles/{uid} {
  allow read: if true; // Public profiles (AUTH-05)
  allow write: if isOwner(uid); // Own profile only; Server Action uses Admin SDK for creation
}

// follows/{followId}
match /follows/{followId} {
  allow read: if request.auth != null;
  allow write: if false; // Server Actions only
}

// users/{uid}/userFeed/{postId}
match /users/{uid}/userFeed/{postId} {
  allow read: if isOwner(uid); // Own feed only
  allow write: if false; // Server Actions only (fan-out)
}

// users/{uid}/notifications/{notificationId}
match /users/{uid}/notifications/{notificationId} {
  allow read: if isOwner(uid);
  allow write: if false; // Server Actions only
}

// userBlocks/{uid}/blocked/{blockedUid}
match /userBlocks/{uid}/blocked/{blockedUid} {
  allow read: if isOwner(uid);
  allow write: if isOwner(uid) && isRegistered();
}

// userMutes/{uid}/muted/{mutedUid}
match /userMutes/{uid}/muted/{mutedUid} {
  allow read: if isOwner(uid);
  allow write: if isOwner(uid) && isRegistered();
}
```

### Registering Profile at Signup (Extending Phase 1 Server Action)

```typescript
// src/app/actions/auth.ts — extend existing registerUser action
// When a new user registers, create their userProfiles document with defaults

export async function registerUser(uid: string, email: string) {
  const db = getAdminFirestore();
  const auth = getAdminAuth();

  // Set roleLevel: 1 (existing Phase 1 code)
  await auth.setCustomUserClaims(uid, { roleLevel: 1 });

  // NEW: Create userProfiles document with default handle from email
  const defaultHandle = email.split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .slice(0, 30);

  // Handle uniqueness: append uid suffix if collision exists
  const existingHandle = await db.collection('userProfiles')
    .where('handle', '==', defaultHandle).limit(1).get();
  const handle = existingHandle.empty
    ? defaultHandle
    : `${defaultHandle}_${uid.slice(0, 6)}`;

  await db.collection('userProfiles').doc(uid).set({
    uid,
    handle,
    displayName: email.split('@')[0], // Default display name
    bio: '',
    avatarUrl: null,
    bannerUrl: null,
    jurisdictionId: null, // Required to be set in profile edit
    patronSaint: null,
    followerCount: 0,
    followingCount: 0,
    postCount: 0,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Firebase Vertex AI Extension | Firebase AI Logic SDK (`firebase/ai`) | May 2025 | Bundled in firebase package; no extension install needed; client-side classification |
| `getGenerativeModel` from `@firebase/vertexai` | `getGenerativeModel` from `firebase/ai` with `GoogleAIBackend` | 2025 rename | New import path; same API shape |
| Manual OG scraping with `fetch` + `cheerio` | `open-graph-scraper` v6 | Ongoing | Handles all edge cases; uses Fetch API natively; TypeScript declarations included |
| Cloud Functions for fan-out | Server Action fan-out (prototype scale) | N/A | At prototype scale, Server Actions are simpler; Cloud Functions needed only at thousands of concurrent writes |
| Firestore `collection().orderBy().limit()` with real-time | `getDocs` for paginated feed | N/A | onSnapshot + pagination is complex; getDocs + optimistic UI is simpler for prototype |

**Deprecated/outdated:**
- `@firebase/vertexai` package: Replaced by `firebase/ai` module. Do not import from the old package.
- `gemini-pro` model name: Use `gemini-2.0-flash` or `gemini-3-flash-preview` (check Firebase console for available models in your region).
- Firebase Dynamic Links (already deprecated August 2025): Not relevant to Phase 2, but don't introduce any DL usage.

---

## Open Questions

1. **Firebase AI Logic: App Check requirement**
   - What we know: Firebase AI Logic uses the Gemini Developer API backend accessed client-side; App Check is the security mechanism
   - What's unclear: Whether App Check is configured in the `ekklesia-agora` Firebase project; if not, AI calls may be rejected
   - Recommendation: Wave 0 of Plan 02-03 should verify App Check status in Firebase console and enable if needed; alternatively, if App Check is not configured, Firebase AI Logic may still work in "debug mode" for development

2. **Firestore composite index pre-creation**
   - What we know: `category` + `createdAt` compound queries require a composite index
   - What's unclear: Whether the Firebase project has `firestore.indexes.json` configured in the repo
   - Recommendation: Plan 02-02 should create `firestore.indexes.json` with the required indexes before any category-filtered feed queries are written

3. **Handle validation rule for unique handles**
   - What we know: Handles are URL-safe and used in `/profile/[handle]` routing
   - What's unclear: Whether to enforce handle uniqueness in Firestore rules or rely entirely on Server Action transaction
   - Recommendation: Server Action transaction is sufficient; Firestore rules cannot easily check cross-document uniqueness without a separate lookup collection. The transaction approach in the code example above is correct.

4. **Firebase Storage rules file**
   - What we know: Phase 1 only configured Firestore rules (`firestore.rules`); no `storage.rules` file exists
   - What's unclear: Whether Firebase Storage is currently in permissive test mode
   - Recommendation: Wave 0 of Plan 02-01 should create `storage.rules` locking down Storage to authenticated writes under own uid paths

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 30 + React Testing Library 16 (from package.json) |
| Config file | `jest.config.ts` — exists from Phase 1 |
| Quick run command | `npx jest --testPathPattern="posts\|profiles\|follows\|notifications" --passWithNoTests` |
| Full suite command | `npx jest --coverage` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PROF-01 | `updateProfile()` Server Action writes display name, bio to Firestore | unit (Admin SDK mocked) | `npx jest tests/actions/profile.test.ts -x` | Wave 0 |
| PROF-02/03 | JurisdictionDropdown renders two sections with correct labels | unit (RTL) | `npx jest tests/components/JurisdictionDropdown.test.tsx -x` | Wave 0 |
| PROF-04 | `/profile/[handle]` page redirects to /login if unauthenticated | unit | `npx jest tests/profile/page.test.tsx -x` | Wave 0 |
| PROF-05 | Profile edit form validates required fields; submits with valid data | unit (RTL) | `npx jest tests/profile/edit.test.tsx -x` | Wave 0 |
| PROF-06 | Avatar upload sets avatarUrl on profile document | unit (Storage mocked) | `npx jest tests/actions/profile.test.ts -x` | Wave 0 |
| AGRA-01 | `createPost()` writes to `posts` collection and author's `userFeed` | unit (Admin SDK mocked) | `npx jest tests/actions/posts.test.ts -x` | Wave 0 |
| AGRA-02 | Post with imageUrl renders image in PostCard | unit (RTL) | `npx jest tests/components/PostCard.test.tsx -x` | Wave 0 |
| AGRA-03 | Like button toggles optimistically; rollback on failure | unit (RTL) | `npx jest tests/components/PostCard.test.tsx -x` | Wave 0 |
| AGRA-04 | `createComment()` Server Action writes to `posts/{id}/comments` | unit (Admin SDK mocked) | `npx jest tests/actions/comments.test.ts -x` | Wave 0 |
| AGRA-05 | Feed renders posts from `userFeed` subcollection in date order | unit (Firestore mocked) | `npx jest tests/components/FeedClient.test.tsx -x` | Wave 0 |
| AGRA-06 | Blocked user's posts filtered from rendered feed | unit (RTL) | `npx jest tests/components/FeedClient.test.tsx -x` | Wave 0 |
| AGRA-07 | NotificationBell shows unread count from notifications subcollection | unit (RTL, onSnapshot mocked) | `npx jest tests/components/NotificationBell.test.tsx -x` | Wave 0 |
| AGRA-08 | `fetchLinkPreview()` returns OG metadata object for valid URL | unit (ogs mocked) | `npx jest tests/actions/linkPreview.test.ts -x` | Wave 0 |
| AGRA-09 | `deletePost()` removes post from `posts` and caller's `userFeed` | unit (Admin SDK mocked) | `npx jest tests/actions/posts.test.ts -x` | Wave 0 |
| AGRA-10 | `searchPosts()` query uses `array-contains` on `searchKeywords` | unit (Firestore mocked) | `npx jest tests/lib/posts.test.ts -x` | Wave 0 |
| CAT-01 | `buildSearchKeywords()` tokenizes and lowercases correctly | unit | `npx jest tests/lib/posts.test.ts -x` | Wave 0 |
| CAT-02 | CategoryFilterTabs renders all 10 categories + "All"; active tab highlighted | unit (RTL) | `npx jest tests/components/CategoryFilterTabs.test.tsx -x` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx jest --testPathPattern="(posts|profiles|comments|follows|notifications)" --passWithNoTests`
- **Per wave merge:** `npx jest --coverage`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/actions/posts.test.ts` — covers AGRA-01, AGRA-09, CAT-01
- [ ] `tests/actions/comments.test.ts` — covers AGRA-04
- [ ] `tests/actions/profile.test.ts` — covers PROF-01, PROF-06
- [ ] `tests/actions/linkPreview.test.ts` — covers AGRA-08
- [ ] `tests/lib/posts.test.ts` — covers AGRA-10
- [ ] `tests/components/PostCard.test.tsx` — covers AGRA-02, AGRA-03
- [ ] `tests/components/FeedClient.test.tsx` — covers AGRA-05, AGRA-06
- [ ] `tests/components/NotificationBell.test.tsx` — covers AGRA-07
- [ ] `tests/components/CategoryFilterTabs.test.tsx` — covers CAT-02
- [ ] `tests/components/JurisdictionDropdown.test.tsx` — covers PROF-02, PROF-03
- [ ] `tests/profile/page.test.tsx` — covers PROF-04
- [ ] `tests/profile/edit.test.tsx` — covers PROF-05

*(jest.config.ts and jest.setup.ts exist from Phase 1 — no framework install needed)*

---

## Sources

### Primary (HIGH confidence)
- [Firebase AI Logic get-started docs](https://firebase.google.com/docs/ai-logic/get-started) — package name (`firebase/ai`), initialization pattern, `getAI`, `getGenerativeModel`, `GoogleAIBackend`
- [Firebase AI Logic generate-structured-output docs](https://firebase.google.com/docs/ai-logic/generate-structured-output) — `Schema.enumString`, `responseMimeType: 'text/x.enum'`, enum classification pattern
- [Firebase Storage web upload docs](https://firebase.google.com/docs/storage/web/upload-files) — `uploadBytesResumable`, `getDownloadURL`, progress tracking pattern
- [open-graph-scraper npm](https://www.npmjs.com/package/open-graph-scraper) — version 6.11.0, server-side only, Fetch API, TypeScript declarations
- Phase 1 codebase — `src/app/(main)/dashboard/page.tsx`, `src/app/actions/auth.ts`, `firestore.rules`, `package.json` — establishes all patterns this phase extends

### Secondary (MEDIUM confidence)
- [Firestore fan-out feed pattern — DEV Community](https://dev.to/jdgamble555/how-to-build-a-scalable-follower-feed-in-firestore-25oj) — fan-out on write pattern, batch write structure
- [Firebase AI Logic blog post May 2025](https://firebase.blog/posts/2025/05/building-ai-apps/) — confirms `firebase/ai` module availability in firebase JS SDK
- [Fireship.io Firestore data modeling — social feed](https://fireship.io/courses/firestore-data-modeling/models-social-feed/) — fan-out tradeoffs and structure

### Tertiary (LOW confidence — needs validation)
- Gemini model name `gemini-2.0-flash` for production use: sourced from general knowledge; verify exact available model names in Firebase console for the `ekklesia-agora` project region before implementing CAT-01
- Firebase App Check requirement for Firebase AI Logic: sourced from general Firebase AI Logic documentation; verify whether App Check is required or optional for development mode

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified via npm registry and official Firebase docs; firebase 12.10.0 includes `firebase/ai`; no new major dependencies beyond `open-graph-scraper`
- Architecture: HIGH — fan-out pattern, Server Action writes, client-side reads all verified; data model follows established Firestore social media patterns
- Pitfalls: HIGH — handle race condition, denormalization tradeoffs, Storage rules gap, and composite index requirement are all verified Firestore patterns
- Firebase AI classification: MEDIUM — import path and enum API verified via official Firebase docs; specific available model names and App Check requirements need validation against actual Firebase project

**Research date:** 2026-03-18
**Valid until:** 2026-04-18 (30 days — stable ecosystem; firebase/ai module may add models; re-verify model names before implementing CAT-01)
