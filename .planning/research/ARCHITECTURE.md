# Architecture Patterns

**Domain:** Video-sharing + social media platform (Orthodox Christian community)
**Project:** Ekklesia Agora
**Researched:** 2026-03-16
**Confidence:** MEDIUM — Core platform architecture is a well-established domain; Firebase-specific implementation details drawn from training knowledge (knowledge cutoff August 2025). Web/external tool access unavailable during this research session.

---

## Recommended Architecture

Ekklesia Agora is a **monolithic frontend / Firebase backend** architecture at prototype scale. A single Next.js application handles all UI surfaces. Firebase provides auth, database, storage, and serverless compute. This avoids the operational overhead of microservices while keeping component boundaries clean enough to extract services later if scale demands it.

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│  Next.js App (React)                                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │  Agora   │ │  Video   │ │  Info    │ │  Admin /         │  │
│  │  (Feed)  │ │  Hub     │ │  Center  │ │  Moderation      │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  │
└───────────────────────┬─────────────────────────────────────────┘
                        │  Firebase SDK (client-side calls)
┌───────────────────────▼─────────────────────────────────────────┐
│                     FIREBASE BACKEND                            │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐ │
│  │ Firebase     │  │  Firestore   │  │  Firebase Storage     │ │
│  │ Auth         │  │  (database)  │  │  (video/image files)  │ │
│  └──────────────┘  └──────────────┘  └───────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Cloud Functions (serverless triggers + API endpoints)   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                        │  (future)
┌───────────────────────▼─────────────────────────────────────────┐
│                  VIDEO DELIVERY LAYER                           │
│  Firebase Storage (prototype) → CDN/Transcoding Service later   │
│  (e.g., Cloudflare Stream, Mux, or self-hosted HLS)            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Boundaries

### Frontend Components (Next.js Routes / Feature Modules)

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **Auth Shell** | Login, registration, account management, session state | Firebase Auth, User Profile store |
| **Agora Feed** | Social posts, comments, likes, photo sharing — the Facebook-like feed | Firestore (posts, comments collections), Firebase Auth |
| **Video Hub** | Browse videos, channel pages, video player, upload flow | Firestore (video metadata), Firebase Storage (files), Cloud Functions (upload triggers) |
| **Info Center** | Searchable library of Church Fathers, liturgical texts, study guides | Firestore (documents collection), full-text search index |
| **Liturgical Calendar** | Feast days, fasts, saints — Gregorian/Julian | Firestore (calendar collection) or static data |
| **Synodeia (People Finder)** | Discover members by jurisdiction, location | Firestore (user profiles collection) |
| **Direct Messages** | 1:1 messaging between users | Firestore (conversations collection, real-time listeners) |
| **Moderation Console** | Review pending uploads, flagged content, user management | Firestore (moderation queues), Cloud Functions |
| **Admin Panel** | Role management, platform settings, bulk operations | Firestore (admin collections), Cloud Functions |
| **Search** | Cross-entity search across videos, posts, people | Firestore queries + optional Algolia/Typesense index |
| **User Profile** | Avatar, jurisdiction, bio, activity history, channel | Firestore (users collection), Firebase Storage (avatars) |

### Backend Components (Firebase)

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **Firebase Auth** | Identity — email/password, session tokens, role claims | All authenticated operations; Cloud Functions for role assignment |
| **Firestore** | Primary data store — users, posts, videos metadata, comments, channels, moderation queues | Client SDK (real-time), Cloud Functions (admin SDK) |
| **Firebase Storage** | Binary file storage — video files, thumbnails, profile images, document attachments | Client SDK (upload), Cloud Functions (post-processing triggers) |
| **Cloud Functions** | Server-side logic — video upload triggers, moderation workflow, role promotion, feed aggregation, search indexing | All Firebase services; optional external APIs |

---

## Data Flow

### 1. Video Upload Flow (core complexity)

```
User selects file
  → Client validates (type, size)
  → Upload directly to Firebase Storage (resumable upload)
  → Storage trigger fires Cloud Function
    → Extract metadata (duration, size)
    → Create Firestore document: status = "pending_review"
    → If user is Verified: status = "published" immediately
    → If user is Unverified: notify moderator queue
  → Moderator reviews → approves/rejects
    → Cloud Function updates Firestore status
    → User receives notification
  → Published video appears in Video Hub feed
```

**Prototype shortcut:** Firebase Storage serves the raw video file directly via its download URL with range request support (partial content). This works for small-scale prototypes but has no transcoding — only the uploaded format/resolution plays. HLS adaptive bitrate requires an external transcoding step (Mux, Cloudflare Stream, or FFmpeg pipeline).

### 2. Social Feed Flow (Agora)

```
User creates post (text, optional photo)
  → Client writes to Firestore: posts/{postId}
  → Firestore real-time listener updates other clients' feeds
  → Feed ordering: newest-first (prototype) → algorithmic ranking (future)

User comments / likes:
  → Write to comments/{commentId} sub-collection or likes counter
  → Firestore security rules enforce auth requirement
```

### 3. Authentication + Role Flow

```
User registers (email/password)
  → Firebase Auth creates account
  → Cloud Function onCreate trigger creates Firestore user profile
  → Default role: "user" (unverified)
  → Verification request → Moderator/Admin reviews
    → Admin SDK sets custom claim: { verified: true }
    → User re-authenticates to receive updated token
  → Role hierarchy: guest → user → verified → moderator → admin
```

### 4. Content Moderation Flow

```
Upload submitted by unverified user
  → Firestore document: status = "pending", moderationQueue = true
  → Moderator console queries: where moderationQueue == true
  → Moderator approves → status = "published", moderationQueue = false
  → Moderator rejects → status = "rejected", user notified

Community flag on existing content:
  → Firestore: flags/{flagId} referencing content
  → Moderator console surfaces flagged content
  → Same approve/remove decision flow
```

### 5. Info Center / Library Flow

```
Admin seeds document library (Church Fathers, liturgical texts)
  → Firestore: documents/{docId} with fields: author, category, text, keywords
  → Search: Firestore compound queries (by author, category)
  → Full-text search: requires external index (Algolia/Typesense) — Firestore has no native full-text
```

### 6. Read Flow (Unauthenticated)

```
Guest visits platform
  → Firestore security rules: published content is readable without auth
  → Videos, posts, Info Center: open read access
  → Comments, DMs, profile details: require auth
  → Any write action → redirect to login
```

---

## Patterns to Follow

### Pattern 1: Firestore Security Rules as the Authorization Layer

**What:** All read/write permissions enforced in Firestore security rules, not just client-side UI gating.
**When:** Every Firestore collection — non-negotiable.
**Why:** Client-side checks are trivially bypassed. Rules are the only server-enforced boundary.

```javascript
// Example: Only verified users or admins can publish directly
match /videos/{videoId} {
  allow write: if request.auth != null
    && (request.auth.token.verified == true
        || request.auth.token.role == 'admin');
  allow read: if resource.data.status == 'published'
    || request.auth.token.role in ['moderator', 'admin'];
}
```

### Pattern 2: Denormalize for Read Performance

**What:** Store frequently-read data redundantly (e.g., author name + avatar on each post document).
**When:** Any collection that renders in a feed.
**Why:** Firestore charges per document read. Joining across collections is expensive and not natively supported. Embed what you display.

```javascript
// Post document stores author snapshot, not just authorId
{
  authorId: "uid123",
  authorName: "Fr. John Smith",  // denormalized
  authorAvatar: "https://...",   // denormalized
  content: "...",
  createdAt: timestamp
}
```

### Pattern 3: Cloud Functions for All State Transitions

**What:** Any status change with side effects (video published, user verified, content removed) goes through a Cloud Function, not direct client writes.
**When:** Moderation workflow, role changes, notification triggers.
**Why:** Enforces business logic server-side; enables auditing; prevents clients from self-promoting roles.

### Pattern 4: Pagination Over Infinite Firestore Reads

**What:** All feed and list queries use cursor-based pagination (startAfter).
**When:** Any list that grows over time — posts, videos, comments.
**Why:** Fetching all documents in a collection is slow and expensive. Firestore pagination is built around document cursors.

### Pattern 5: Separate Collections for Separate Concerns

**What:** Distinct top-level Firestore collections per content type.
**When:** Always — don't put posts and videos in the same collection.

```
/users/{uid}
/posts/{postId}
/videos/{videoId}
/channels/{channelId}
/comments/{commentId}         ← or sub-collection under parent
/flags/{flagId}
/messages/{conversationId}/messages/{messageId}
/documents/{docId}            ← Info Center library
/calendar/{entryId}           ← Liturgical calendar
/moderationQueue/{itemId}     ← pending review items
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Giant User Document

**What:** Storing all user data (posts, video list, followers, settings) inside a single Firestore user document.
**Why bad:** Firestore documents have a 1MB limit. Arrays inside documents cannot be efficiently queried. Follower lists of any real size will exceed limits.
**Instead:** User document stores profile fields only. Activity lives in separate collections with userId as a field, queryable via index.

### Anti-Pattern 2: Real-Time Listeners on Large Collections

**What:** Attaching `onSnapshot` to an entire collection (e.g., all posts) with no filters.
**Why bad:** Every write to that collection pushes a full re-read to every connected client. At scale this is catastrophic cost and bandwidth.
**Instead:** Always filter listeners: `where('status', '==', 'published').orderBy('createdAt', 'desc').limit(20)`.

### Anti-Pattern 3: Firebase Storage for Video Streaming Without Range Support Awareness

**What:** Assuming Firebase Storage download URLs work like a proper video CDN.
**Why bad:** Firebase Storage supports range requests (required for seek/resume), but it is not a CDN — latency and egress costs grow with audience. No adaptive bitrate transcoding.
**Instead:** For prototype: acceptable. For production: route video through Cloudflare (free CDN caching) or migrate to Mux/Cloudflare Stream for transcoding.

### Anti-Pattern 4: Storing Role Logic Only in Firestore

**What:** Reading role from Firestore document on every request to determine permissions.
**Why bad:** Requires an extra database read per request. Can be stale. Not enforced at the auth token level.
**Instead:** Use Firebase Auth custom claims for roles (`admin`, `moderator`, `verified`). Set via Admin SDK in Cloud Functions. Claims travel with the JWT — no extra read required.

### Anti-Pattern 5: Full-Text Search in Firestore

**What:** Attempting substring or keyword search using Firestore `.where()` queries.
**Why bad:** Firestore only supports exact-match and range queries on indexed fields. No `LIKE` or full-text.
**Instead:** For prototype: search by exact category/author fields (good enough for Info Center). For production: sync documents to Algolia (free tier: 10k records) or self-hosted Typesense.

### Anti-Pattern 6: Video Transcoding in Cloud Functions

**What:** Using Firebase Cloud Functions to transcode uploaded video files.
**Why bad:** Cloud Functions have a 9-minute timeout (2nd gen). Video transcoding is CPU-intensive and can take much longer for large files. Memory limits apply.
**Instead:** Trigger an external service (Mux, Cloudflare Stream) or use Cloud Run (longer timeouts) for any transcoding pipeline. For prototype, skip transcoding — serve raw uploads.

---

## Scalability Considerations

| Concern | Prototype (< 100 users) | Growth (1K–10K users) | Production (10K+) |
|---------|-----------------------|----------------------|-------------------|
| Video storage | Firebase Storage (free 5GB) | Firebase Storage (paid) or migrate to Cloudflare R2 | Cloudflare R2 + Cloudflare Stream for CDN + transcoding |
| Video delivery | Storage download URL | Cloudflare CDN in front of Storage | Mux or Cloudflare Stream (adaptive bitrate HLS) |
| Database | Firestore free tier (50K reads/day) | Firestore paid tier | Firestore paid or evaluate PostgreSQL migration |
| Full-text search | Category/author field filters | Algolia free tier (10K records) | Algolia/Typesense dedicated |
| Feed algorithm | Chronological (newest first) | Basic engagement scoring via Cloud Function | Dedicated ranking service |
| Moderation | Manual human review queue | Same + community flags | Same + possible ML-assist (out of scope) |
| Auth | Firebase Auth (free) | Firebase Auth (free, scales well) | Firebase Auth (free at any scale) |
| Functions | Firebase Cloud Functions (free tier: 2M/month) | Same | Same — migrate hot paths to Cloud Run if needed |

---

## Suggested Build Order

Components have dependencies. Build in this order to avoid blocking work:

**Phase 1 — Foundation (nothing works without this)**
1. Firebase project configuration (Auth, Firestore rules, Storage rules)
2. Next.js project scaffold with Firebase SDK wiring
3. Auth component: register, login, session management
4. User profile creation (Cloud Function onCreate trigger)
5. Firestore security rules baseline

**Phase 2 — Social Core (Agora Feed)**
6. Post creation (text + optional photo)
7. Feed display with pagination
8. Comments sub-system
9. Likes / reactions
10. User profiles (public view)

**Phase 3 — Video Core (Video Hub)**
11. Video upload flow (Firebase Storage, resumable)
12. Video metadata document creation
13. Moderation queue for unverified uploads
14. Video player page
15. Channel pages

**Phase 4 — Moderation System**
16. Moderator console (pending uploads queue)
17. Community flagging flow
18. Admin role management (custom claims via Cloud Functions)
19. Verified account promotion flow

**Phase 5 — Discovery and Search**
20. People finder (Synodeia) — filter users by jurisdiction
21. Cross-entity search (by category/author field queries)
22. Liturgical calendar (can be static data seeded into Firestore)

**Phase 6 — Info Center**
23. Document library schema and seed data
24. Browse by author, category, topic
25. Study guides (curated reading paths)

**Phase 7 — Direct Messaging**
26. Conversation creation
27. Real-time message listener
28. (Last because it's isolated complexity — doesn't block other features)

**Dependency map:**
```
Auth
  └─→ User Profile
        ├─→ Agora Feed (posts, comments, likes)
        ├─→ Video Hub
        │     └─→ Moderation System
        ├─→ Synodeia (People Finder)
        └─→ Direct Messages

Video Hub + Moderation System → (these must ship together, not separately)
Search → (can be added to any phase as an enhancement layer)
Info Center → (standalone; no dependencies on social features)
Liturgical Calendar → (standalone; can be static data)
```

---

## Firebase-Specific Architecture Notes

### Firestore Data Model Sketch

```
users/
  {uid}/
    displayName, email, jurisdiction, bio, avatarUrl
    role: "user" | "moderator" | "admin"
    verified: boolean
    createdAt, lastActive

channels/
  {channelId}/
    name, description, ownerUid, type: "parish"|"monastery"|"teacher"
    subscriberCount, videoCount

videos/
  {videoId}/
    title, description, channelId, uploaderUid
    storageUrl, thumbnailUrl, duration
    status: "pending_review" | "published" | "rejected"
    viewCount, likeCount
    createdAt, publishedAt
    tags[], category

posts/
  {postId}/
    authorId, authorName, authorAvatar  ← denormalized
    content, imageUrl
    likeCount, commentCount
    createdAt
    status: "published" | "removed"

  {postId}/comments/
    {commentId}/
      authorId, authorName, content, createdAt

flags/
  {flagId}/
    contentType: "video" | "post" | "comment"
    contentId, reporterId, reason, createdAt
    status: "pending" | "reviewed" | "dismissed"

messages/
  {conversationId}/       ← sorted participant uids joined: "uid1_uid2"
    participants: [uid1, uid2]
    lastMessage, lastMessageAt

    messages/
      {messageId}/
        senderId, content, createdAt, read: boolean

documents/               ← Info Center library
  {docId}/
    title, author, category, topic, excerpt, fullText
    source, tags[]

calendar/
  {entryId}/
    date (Gregorian), dateJulian, type: "feast"|"fast"|"commemoration"
    name, description, saints[]
```

### Cloud Functions Surface

| Function | Trigger | Purpose |
|----------|---------|---------|
| `onUserCreate` | Auth: user created | Create Firestore user profile |
| `onVideoUploaded` | Storage: file created in videos/ | Create pending video document, route to queue |
| `onVideoApproved` | Firestore: video status changed to published | Notify uploader, increment channel video count |
| `promoteToVerified` | HTTP callable (admin only) | Set custom claim, update Firestore role |
| `promoteToModerator` | HTTP callable (admin only) | Set custom claim, update Firestore role |
| `onFlagCreated` | Firestore: flag created | Notify moderators of new flag |

---

## Sources

- Architecture patterns drawn from training knowledge of Firebase, Next.js, and video platform system design (knowledge cutoff August 2025). MEDIUM confidence — these are well-established patterns unlikely to have changed materially.
- Firebase documentation structure (Firestore data modeling, Security Rules, Cloud Functions triggers) — verified against known stable API surface.
- Video platform architecture (upload pipeline, CDN, transcoding separation) — industry-standard patterns, HIGH confidence for the structural recommendations, MEDIUM confidence for specific Firebase Storage range-request behavior.
- External tool access (WebSearch, WebFetch) was unavailable during this research session. Firebase-specific version details and any breaking changes after August 2025 should be verified against official Firebase docs before implementation.
