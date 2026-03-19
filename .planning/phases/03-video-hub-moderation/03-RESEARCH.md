# Phase 3: Video Hub + Moderation - Research

**Researched:** 2026-03-18
**Domain:** Firebase Storage resumable uploads, Firestore video/channel data modeling, Next.js 15 video playback, moderation console, channel identity
**Confidence:** HIGH — all major findings verified against existing project code, Firebase JS SDK v12 docs, and established Phase 1/2 patterns

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Video Player Experience**
- Videos are playable both inline (in feeds, channel pages) and on a dedicated page at `/videos/[id]`
- Inline playback: clicking the thumbnail starts playback in the card; no autoplay on scroll; title/metadata link still navigates to the full page
- Dedicated video page (`/videos/[id]`): YouTube-style layout — large player top-left, video metadata + like/share/flag/category below it, comments underneath; right sidebar shows related videos from the same channel or same Orthodox category
- Video card metadata (in feeds and channel pages): thumbnail with duration chip overlay, channel avatar, video title, view count, relative upload date, category tag chip — no description excerpt; clean grid card similar to YouTube

**Channel Identity and Types**
- Channels require moderator approval — a user must apply to create a channel; it is not auto-created on registration
- Any registered user can upload videos without a channel — those videos appear on their profile and always go into the moderation queue
- An approved channel unlocks a dedicated page at `/channel/[handle]` with its own identity (banner, logo/avatar, channel name, description, subscriber count) — distinct from the user's personal profile at `/profile/[handle]`
- Even approved channels: every video still goes through moderation — channel approval is about identity/trust, not bypassing the review queue
- Channel types: personal (individual creator) and institutional (parish, monastery, organization) — both go through the same approval process; type is a label on the channel profile
- Channel discovery: dedicated `/channels` browse page listing all approved channels with logo, name, primary Orthodox category, and subscriber count; filterable by Orthodox content category
- Subscribing to a channel follows the same fan-out pattern established in Phase 2 for user follows

**Upload Flow and Constraints**
- Firebase Storage resumable uploads — required for large files; show a progress bar during upload
- Accepted formats: `mp4`, `webm`, `mov` (standard web video formats); reasonable size cap (2 GB for prototype)
- After upload completes, video enters the moderation queue with status "pending review" — uploader sees this status clearly on their upload/profile page
- Uploader receives an in-app notification (bell) when moderation decision is made (approve / reject / request changes)
- Videos without an approved channel are listed on the uploader's profile page in a "Videos" section

**Moderation Console**
- Console lives at `/admin/moderation` (already within the existing `/admin` route)
- Two tabs: "Pending Uploads" (pre-publication review) and "Flagged Content" (post-publication reports) — separate workflows, separate tabs
- Pending upload review card shows: full video player, title, description, tags, thumbnail, category. Plus uploader context: account age, jurisdiction badge, post history count, verification status
- Three actions on each pending item: Approve (publishes video), Reject (removes permanently with reason), Request Changes (holds video for edits with a freeform moderator note)
- "Request changes" flow: moderator writes a freeform note explaining what to fix; uploader gets an in-app notification with the note and a direct link back to their upload to edit metadata and resubmit
- Flagged content tab shows: the flagged video, flag reason(s), flagger count, and same approve/reject/request-changes actions
- Moderator actions trigger notification to the uploader in all cases (approved, rejected, or changes requested)

### Claude's Discretion
- Exact progress bar design during upload
- Loading skeleton states for video cards and channel pages
- Error states for failed uploads or playback errors
- Exact sidebar "related videos" algorithm (same channel first, then same category)
- Channel application/request form fields beyond name, type, and description

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within Phase 3 scope.
- (Channel application form and approval workflow are part of Phase 3's moderation console — not deferred.)
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| VID-01 | User can upload video files with title, description, tags, and thumbnail | Firebase Storage `uploadBytesResumable` (client) + Firestore video doc creation (Server Action) |
| VID-02 | Videos play with standard controls (play/pause/seek/volume/fullscreen) | HTML5 `<video controls>` with `w-full aspect-video`; native browser controls |
| VID-03 | Videos display view count, duration, and upload date | Denormalized on Video doc: `viewCount`, `durationSeconds`, `createdAt` |
| VID-04 | User can like/unlike a video | Pattern mirrors post likes: `videos/{id}/likes/{uid}` subcollection; existing `toggleLike` pattern |
| VID-05 | User can comment on a video | `videoComments` subcollection on video doc; mirrors Phase 2 comments pattern |
| VID-06 | User can share a video via copy link | Copy `/videos/[id]` URL via `navigator.clipboard.writeText` — no library needed |
| VID-07 | User can report/flag a video with reason | Extend existing `reportContent` Server Action to handle `contentType: 'video'` |
| VID-08 | User can subscribe/follow a channel | New `channelSubscribes` collection mirroring `follows` pattern; fan-out to subscriber feed |
| VID-09 | Upload progress indicator shown during video upload | `uploadBytesResumable` `on('state_changed')` snapshot + React state progress bar |
| VID-10 | Videos are mobile-responsive with adaptive playback | `w-full aspect-video` Tailwind; HTML5 native adaptive; no HLS needed for prototype |
| VID-11 | Video search by title, description, and tags | `searchKeywords` array field on Video doc; same pattern as post search in Phase 2 |
| VID-12 | Unverified user video uploads go to moderation queue before publishing | `status: 'pending_review'` on upload; every upload regardless of channel status |
| VID-13 | Videos organized by Orthodox content categories | `category` field on Video doc using existing `ORTHODOX_CATEGORIES` constants |
| CHAN-01 | User can create a personal channel page | Channel application form → mod approval → `/channel/[handle]` page |
| CHAN-02 | Parishes and monasteries can have institutional channel pages | `channelType: 'institutional'` label; same approval flow as personal |
| CHAN-03 | Channel page displays all videos, subscriber count, and description | `channels/{channelId}` doc with denormalized counts; query videos by channelId |
| CHAN-04 | User can browse all channels | `/channels` page; query `channels` collection where `status == 'approved'` with category filter |
| MOD-01 | Unverified user uploads enter pre-publication moderation queue | `videos` collection with `status: 'pending_review'`; moderator reads from this queue |
| MOD-02 | Any user can flag/report content with reason | Extend existing `reports` collection; `contentType: 'video'`; flagged video stays live until action |
| MOD-03 | Moderator dashboard shows pending uploads and flagged content | `/admin/moderation` — two tabs querying `videos where status==pending_review` and `reports where status==pending` |
| MOD-04 | Moderators can approve, reject, or request changes on queued content | `updateVideoStatus` Server Action gated on `isModerator()` check |
| MOD-05 | Users receive notification of moderation decisions on their content | Write to `users/{uid}/notifications` — existing Notification pattern extended with `type: 'moderation'` |
</phase_requirements>

---

## Summary

Phase 3 builds on the solid foundation of Phases 1 and 2. The primary technical domains are: (1) Firebase Storage resumable uploads with client-side progress tracking, (2) a new Firestore data model for videos, channels, channel subscriptions, and video flags, (3) HTML5 native video playback, and (4) extension of the existing moderation/notification infrastructure to cover video content and moderator decision-making.

The key architectural insight is that **uploads are inherently client-side** (Firebase Storage resumable uploads run in the browser, not in Server Actions), while **Firestore writes remain server-side** (the video metadata document is created via Server Action after the upload completes). This is a deliberate split: the file upload uses the Firebase client SDK directly in a Client Component, and when it resolves, calls a Server Action to record the video metadata and queue it for moderation.

The moderation console extends the existing `/admin` route and mirrors patterns already established: role-gated Server Components (roleLevel >= 2), Server Actions for state mutations, and notification writes via Admin SDK. The channel system closely parallels the user follow/profile system — channels have their own identity documents, subscription uses the same fan-out pattern as user follows, and the channel application is itself a moderation act.

**Primary recommendation:** Model the video upload as a two-step client operation — first `uploadBytesResumable` to Firebase Storage with progress tracking, then call a Server Action with the resulting download URL to create the Firestore `videos` doc with `status: 'pending_review'`. Everything downstream (moderation queue, notifications, channel pages) follows established Phase 1/2 patterns.

---

## Standard Stack

### Core (all already in package.json — no new dependencies required)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| firebase (client SDK) | 12.10.0 | `uploadBytesResumable`, `getDownloadURL`, `getStorage`, `ref` | Already installed; v12 modular API is the current standard |
| firebase-admin | 13.7.0 | Admin SDK for Server Actions (video CRUD, mod decisions, notifications) | Already installed; used throughout Phase 1/2 |
| next | 15.5.13 | App Router, Server Components, Server Actions | Already installed; established architecture |
| React | 19.1.0 | Client Components for upload form and progress bar | Already installed |
| lucide-react | 0.577.0 | Icons: `Play`, `Eye`, `ThumbsUp`, `Share2`, `Flag`, `Bell`, `CheckCircle` | Already installed; used in PostCard |
| zod | 4.3.6 | Validation in Server Actions (video metadata, channel application) | Already installed; used in profile actions |

### No New Dependencies
Phase 3 requires zero new npm packages. The stack covers:
- Video playback: HTML5 `<video>` native element (no video.js, plyr, or similar needed for prototype)
- Upload progress: Firebase Storage client SDK's `uploadBytesResumable` built-in progress events
- Video search: Firestore array-contains query on `searchKeywords` (same pattern as posts)
- HLS adaptive streaming: explicitly deferred to v2 (AVID-01) — Firebase Storage serves MP4/WebM directly

**Version verification:** Confirmed against `package.json` in project root. No version drift risk since dependencies are already pinned.

---

## Architecture Patterns

### Recommended Project Structure (new files for Phase 3)

```
src/
├── lib/
│   ├── types/
│   │   └── video.ts              # Video, Channel, VideoComment, ChannelSubscribe, VideoFlag types
│   ├── constants/
│   │   └── (categories.ts)       # Already exists — reuse ORTHODOX_CATEGORIES
│   └── firestore/
│       └── videos.ts             # getVideoById, getVideosByChannel, buildVideoSearchKeywords
├── app/
│   ├── actions/
│   │   ├── videos.ts             # createVideo, updateVideoStatus, deleteVideo, likeVideo Server Actions
│   │   ├── channels.ts           # createChannelApplication, approveChannel, subscribeChannel Server Actions
│   │   └── videoComments.ts      # createVideoComment, deleteVideoComment Server Actions
│   └── (main)/
│       ├── videos/
│       │   ├── page.tsx          # /videos — browse hub (Server Component)
│       │   └── [id]/
│       │       └── page.tsx      # /videos/[id] — detail page (Server Component)
│       ├── channel/
│       │   └── [handle]/
│       │       └── page.tsx      # /channel/[handle] — channel page (Server Component)
│       ├── channels/
│       │   └── page.tsx          # /channels — browse page (Server Component)
│       ├── upload/
│       │   └── page.tsx          # /upload — video upload form page (needs Client Component)
│       └── admin/
│           └── moderation/
│               └── page.tsx      # /admin/moderation — console (Server Component with role guard)
└── components/
    └── video/
        ├── VideoCard.tsx          # Grid card with thumbnail, duration chip, metadata
        ├── VideoPlayer.tsx        # HTML5 <video controls> wrapper with error state
        ├── VideoUploadForm.tsx    # Client Component: file picker + uploadBytesResumable + progress bar
        ├── UploadProgressBar.tsx  # Progress bar UI (progress % state prop)
        ├── ChannelCard.tsx        # Channel listing card for /channels browse
        └── ModerationReviewCard.tsx  # Full review card for /admin/moderation
```

### Pattern 1: Two-Step Upload (Client Upload + Server Action Metadata Write)

**What:** Firebase Storage resumable upload runs entirely client-side (cannot run in Server Actions — no browser File API on server). After upload resolves, a Server Action writes the video metadata to Firestore.

**When to use:** Any file upload to Firebase Storage where you need progress feedback.

**Example:**
```typescript
// VideoUploadForm.tsx (Client Component)
'use client';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import firebaseApp from '@/lib/firebase/client';

async function handleUpload(file: File, videoId: string, uid: string) {
  const storage = getStorage(firebaseApp);
  const storageRef = ref(storage, `videos/${uid}/${videoId}/${file.name}`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  uploadTask.on('state_changed',
    (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      setUploadProgress(Math.round(progress));
    },
    (error) => {
      setUploadError('Upload failed. Check your connection and try again.');
    },
    async () => {
      const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
      // Call Server Action with downloadUrl + metadata
      const result = await createVideo(uid, { ...formData, videoUrl: downloadUrl });
    }
  );
}
```

**Source:** Firebase Storage Web docs (upload-files) — `uploadBytesResumable` is the standard resumable upload API. HIGH confidence.

### Pattern 2: Firestore Video Document with status Field

**What:** Videos live in a top-level `videos` collection with a `status` field controlling visibility. Only `status: 'published'` videos render in public feeds and channel pages.

**When to use:** All video reads in public-facing pages must filter by `status == 'published'`.

```typescript
// Firestore query for public video browse
const snap = await db.collection('videos')
  .where('status', '==', 'published')
  .where('category', '==', selectedCategory)  // optional filter
  .orderBy('createdAt', 'desc')
  .limit(30)
  .get();
```

### Pattern 3: Channel Subscribe Fan-Out (mirrors followUser)

**What:** Subscribing to a channel increments the channel's `subscriberCount` and creates a subscribe document in `channelSubscribes/{channelId}/subscribers/{uid}`. No feed fan-out needed (channels don't push to subscriber feeds in Phase 3 — video browsing is pull-based).

**When to use:** Subscribe and unsubscribe Server Actions.

```typescript
// channels.ts Server Action — mirrors follows.ts pattern exactly
export async function subscribeChannel(uid: string, channelId: string) {
  const db = getAdminFirestore();
  const subRef = db.collection('channelSubscribes').doc(channelId)
    .collection('subscribers').doc(uid);
  await subRef.set({ uid, createdAt: FieldValue.serverTimestamp() });
  await db.collection('channels').doc(channelId)
    .update({ subscriberCount: FieldValue.increment(1) });
}
```

### Pattern 4: Moderation Decision Server Action (role-gated)

**What:** Moderator actions are Server Actions that check `roleLevel >= 2` before writing. Decision writes update the `videos` doc status, create a notification for the uploader, and (for reject) schedule video file deletion.

**When to use:** All three moderation actions (approve, reject, request changes).

```typescript
// videos.ts Server Action
export async function updateVideoStatus(
  moderatorUid: string,
  videoId: string,
  decision: 'published' | 'rejected' | 'changes_requested',
  note?: string  // required for 'changes_requested'
): Promise<{ success: boolean } | { error: string }> {
  const tokens = await getTokens(await cookies(), authConfig);
  const roleLevel = tokens?.decodedToken?.roleLevel ?? 0;
  if (roleLevel < 2) return { error: 'Insufficient permissions.' };

  const db = getAdminFirestore();
  await db.collection('videos').doc(videoId).update({
    status: decision,
    moderatorNote: note ?? null,
    moderatedAt: FieldValue.serverTimestamp(),
    moderatedBy: moderatorUid,
  });

  // Write notification to uploader — mirrors existing notification pattern
  const video = (await db.collection('videos').doc(videoId).get()).data();
  const notifRef = db.collection('users').doc(video.uploaderUid)
    .collection('notifications').doc();
  await notifRef.set({
    notificationId: notifRef.id,
    type: 'moderation',
    videoId,
    decision,
    moderatorNote: note ?? null,
    read: false,
    createdAt: FieldValue.serverTimestamp(),
  });

  return { success: true };
}
```

### Pattern 5: Video Search Keywords

**What:** Same `buildSearchKeywords` pattern as posts. Tokenize title + description + tags to lowercase terms, store as `searchKeywords` array on video doc. Query with `.where('searchKeywords', 'array-contains', term)`.

**Source:** Phase 2 established this pattern in `src/lib/firestore/posts.ts`. Reuse `buildSearchKeywords` directly or copy the function into `src/lib/firestore/videos.ts`.

### Anti-Patterns to Avoid
- **Running `uploadBytesResumable` in a Server Action:** File/Blob is not available in the Node.js runtime. Upload MUST happen client-side.
- **Using `<video src={storageRef.fullPath}>` directly:** Firebase Storage requires `getDownloadURL()` to get the HTTPS URL. Store the download URL, not the storage path, in Firestore.
- **Storing video `status: 'published'` client-side (unverified):** The `updateVideoStatus` Server Action must verify roleLevel — never trust a client-supplied status string.
- **Auto-publishing videos:** Every video, including those from approved channels, starts as `status: 'pending_review'`. No auto-publish path exists.
- **Blocking Storage rules on video files with file size check:** Firebase Storage rules cannot reliably enforce a 2 GB cap because `request.resource.size` has limits. The 2 GB cap is a UX-side validation in the upload form — not enforced at the rules level.
- **Cross-collection Firestore transactions for fan-out:** Fan-out subscribe counts (channel subscriber count) should use `FieldValue.increment()` atomically, not read-modify-write.

---

## Firestore Data Model

### New Collections for Phase 3

```
videos/{videoId}
  - videoId: string
  - uploaderUid: string
  - uploaderHandle: string
  - uploaderDisplayName: string
  - uploaderAvatarUrl: string | null
  - uploaderJurisdictionId: string | null
  - uploaderRoleLevel: number
  - channelId: string | null          // null if uploaded without a channel
  - channelHandle: string | null
  - title: string
  - description: string
  - tags: string[]
  - category: string                  // one of ORTHODOX_CATEGORIES
  - thumbnailUrl: string | null
  - videoUrl: string                  // Firebase Storage download URL
  - storagePath: string               // Firebase Storage path (for deletion)
  - durationSeconds: number           // set after upload, may be 0 until client reports it
  - viewCount: number                 // incremented server-side on each view
  - likeCount: number
  - commentCount: number
  - status: 'pending_review' | 'published' | 'rejected' | 'changes_requested'
  - moderatorNote: string | null
  - moderatedAt: Timestamp | null
  - moderatedBy: string | null
  - searchKeywords: string[]          // tokenized title + description + tags
  - createdAt: Timestamp
  - updatedAt: Timestamp | null

videos/{videoId}/likes/{uid}
  - uid: string
  - createdAt: Timestamp

videos/{videoId}/comments/{commentId}
  - commentId: string
  - videoId: string
  - authorUid: string
  - authorHandle: string
  - authorDisplayName: string
  - authorAvatarUrl: string | null
  - text: string
  - createdAt: Timestamp
  - updatedAt: Timestamp | null
  - isEdited: boolean

channels/{channelId}
  - channelId: string
  - ownerUid: string
  - handle: string                    // unique, URL-safe (e.g., "st-nicholas-parish")
  - name: string
  - channelType: 'personal' | 'institutional'
  - description: string
  - logoUrl: string | null
  - bannerUrl: string | null
  - primaryCategory: string           // one of ORTHODOX_CATEGORIES
  - subscriberCount: number
  - videoCount: number
  - status: 'pending_approval' | 'approved' | 'rejected'
  - createdAt: Timestamp
  - approvedAt: Timestamp | null
  - approvedBy: string | null

channelSubscribes/{channelId}/subscribers/{uid}
  - uid: string
  - createdAt: Timestamp

reports/{reportId}                    // extends existing reports collection from Phase 2
  - reportId: string
  - reporterUid: string
  - contentType: 'post' | 'comment' | 'user' | 'video'    // 'video' is new
  - contentId: string
  - reason: string
  - status: 'pending' | 'resolved'
  - flagCount: number                 // incremented when new reports come in for same video
  - createdAt: Timestamp
```

### Notification Type Extension

Extend the existing `Notification` interface in `src/lib/types/social.ts`:
```typescript
// Add 'moderation' to the union type:
type: 'like' | 'comment' | 'follow' | 'mention' | 'moderation';
// Add these optional fields:
videoId: string | null;
decision: 'published' | 'rejected' | 'changes_requested' | null;
moderatorNote: string | null;
```

### Firestore Indexes Required (add to firestore.indexes.json)
```json
{ "collectionGroup": "videos", "fields": [
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
]},
{ "collectionGroup": "videos", "fields": [
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "category", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
]},
{ "collectionGroup": "videos", "fields": [
    { "fieldPath": "channelId", "order": "ASCENDING" },
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
]},
{ "collectionGroup": "videos", "fields": [
    { "fieldPath": "searchKeywords", "arrayConfig": "CONTAINS" },
    { "fieldPath": "status", "order": "ASCENDING" }
]},
{ "collectionGroup": "channels", "fields": [
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "primaryCategory", "order": "ASCENDING" }
]}
```

### Firebase Storage Rules Extension (add to storage.rules)
```
// Videos: owner can write, anyone can read published videos
match /videos/{uid}/{videoId}/{allPaths=**} {
  allow read: if true;
  allow write: if request.auth != null && request.auth.uid == uid
    && request.resource.contentType.matches('video/.*');
}

// Video thumbnails: owner can write, anyone can read
match /thumbnails/{videoId}/{allPaths=**} {
  allow read: if true;
  allow write: if request.auth != null;
}

// Channel logos and banners: owner can write, anyone can read
match /channels/{channelId}/{allPaths=**} {
  allow read: if true;
  allow write: if request.auth != null;
}
```

### Firestore Security Rules Extensions (add to firestore.rules)
```
// /videos/{videoId}
// READ: published videos are public; pending/rejected only to uploader or moderator+
// WRITE: false — Server Actions only
match /videos/{videoId} {
  allow read: if resource.data.status == 'published'
    || (request.auth != null && request.auth.uid == resource.data.uploaderUid)
    || isModerator();
  allow write: if false;

  match /likes/{uid} {
    allow read: if true;
    allow write: if isOwner(uid) && isRegistered();
  }

  match /comments/{commentId} {
    allow read: if true;
    allow write: if false;
  }
}

// /channels/{channelId}
// READ: approved channels are public; pending only to owner or moderator+
// WRITE: false — Server Actions only
match /channels/{channelId} {
  allow read: if resource.data.status == 'approved'
    || (request.auth != null && request.auth.uid == resource.data.ownerUid)
    || isModerator();
  allow write: if false;
}

// /channelSubscribes/{channelId}/subscribers/{uid}
// READ: authenticated (for subscribe state check)
// WRITE: false — Server Actions only
match /channelSubscribes/{channelId}/subscribers/{uid} {
  allow read: if request.auth != null;
  allow write: if false;
}
```

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Resumable file uploads with progress | Custom XMLHttpRequest or fetch with ReadableStream | `uploadBytesResumable` from firebase/storage | Handles chunking, retry, pause/resume, progress events |
| Video search | Custom full-text index | `searchKeywords` array + `array-contains` query | Already proven in Phase 2 for posts; consistent pattern |
| Notification delivery | Push notifications, email | Firestore `onSnapshot` on notifications subcollection | Already built and working in Phase 2; in-app bell is the v1 notification channel |
| Subscription counts | Separate count document or client-side count | `FieldValue.increment()` on channel doc | Atomic increment prevents race conditions |
| Video duration | Server-side MediaInfo or ffprobe | Client-side `HTMLVideoElement.duration` after metadata loads | Runs in browser where file is available; no server dependency |
| Role gating on moderation console | Custom middleware or cookies inspection | `getTokens()` in Server Component + roleLevel check (Phase 1 pattern) | Defense-in-depth already established; consistent with admin page |
| Video playback | video.js, plyr, react-player | HTML5 `<video controls>` | Prototype scope; native controls are fully functional; no new dependencies |

**Key insight:** The most complex problem (resumable upload with progress) is fully solved by the Firebase SDK already installed. The second most complex problem (moderation + notifications) is fully solved by the patterns established in Phases 1 and 2.

---

## Common Pitfalls

### Pitfall 1: Uploading Files in Server Actions
**What goes wrong:** Calling `uploadBytesResumable` or any `firebase/storage` function inside a `'use server'` file causes a runtime error — the `File`/`Blob` Web API is unavailable in Node.js and the Firebase client SDK requires a browser environment.
**Why it happens:** Developers see that Firestore writes go through Server Actions and incorrectly apply the same pattern to Storage uploads.
**How to avoid:** The upload Component must be `'use client'`. The Server Action is called only after the upload completes, receiving the download URL as a string argument.
**Warning signs:** "Cannot find name 'File'" TypeScript error, or runtime crash in Server Action when handling `FormData` with a video file.

### Pitfall 2: Serving Firebase Storage URLs Without getDownloadURL
**What goes wrong:** Storing `storageRef.fullPath` (e.g., `videos/uid/videoId/file.mp4`) instead of the HTTPS download URL causes video playback to fail — the `<video src>` attribute needs an HTTPS URL, not a storage path.
**Why it happens:** The storage path is easily available immediately after creating the ref, before the upload completes.
**How to avoid:** Always call `getDownloadURL(uploadTask.snapshot.ref)` in the upload completion handler and store the returned HTTPS URL in the Firestore doc.
**Warning signs:** Video player shows error state; URL in Firestore starts with `videos/` instead of `https://firebasestorage.googleapis.com/`.

### Pitfall 3: Firestore Rules Blocking Pending Video Reads
**What goes wrong:** If Firestore rules only allow reading `status == 'published'` videos, the uploader cannot see their own pending/rejected/changes-requested videos on their profile, and the moderator cannot load the review queue.
**Why it happens:** Over-restrictive security rules that mirror the public browse case without carve-outs for owner and moderator reads.
**How to avoid:** Use the three-condition read rule: `status == 'published' || isOwner || isModerator()`.
**Warning signs:** Profile page "Videos" section shows empty; moderator queue shows empty despite pending videos in Firestore.

### Pitfall 4: Missing Composite Index for Status + Category Filter
**What goes wrong:** Querying `videos where status == 'published' AND category == 'X' ORDER BY createdAt DESC` fails in production with a "requires an index" Firestore error.
**Why it happens:** Multi-field queries on different fields require explicit composite indexes.
**How to avoid:** Add all required composite indexes to `firestore.indexes.json` before deploying. See the index definitions in the Architecture Patterns section above.
**Warning signs:** Query works in emulator but fails in production; Firebase console shows "Index required" error message.

### Pitfall 5: Notification Type Mismatch Breaking NotificationBell
**What goes wrong:** Adding `type: 'moderation'` notifications to the existing `users/{uid}/notifications` subcollection without updating the `Notification` TypeScript interface causes `NotificationBell` to break or show incorrect UI for moderation notifications.
**Why it happens:** The Phase 2 `Notification` interface uses a literal union type for `type`.
**How to avoid:** Extend the `Notification` interface in `src/lib/types/social.ts` before writing any moderation notifications. Add `videoId`, `decision`, and `moderatorNote` optional fields alongside the `'moderation'` type literal.
**Warning signs:** TypeScript error on notification write; NotificationBell renders empty for moderation events.

### Pitfall 6: Channel Handle Collision with User Handle
**What goes wrong:** Channel handles share the same namespace as user profile handles if not distinguished — `/channel/[handle]` and `/profile/[handle]` are different routes but the handle uniqueness constraint must be applied separately within the `channels` collection.
**Why it happens:** User handles are unique within `userProfiles`; channel handles need uniqueness within `channels` only.
**How to avoid:** Channel handle uniqueness is checked within the `channels` collection, not globally across both collections. The routes are already different (`/channel/` vs `/profile/`), so cross-collision is not a functional problem.

### Pitfall 7: View Count Race Condition
**What goes wrong:** Multiple simultaneous reads of a video page increment `viewCount` using a read-modify-write pattern, causing count loss under concurrent load.
**Why it happens:** Standard Firestore update of a counter without atomic increment.
**How to avoid:** Always use `FieldValue.increment(1)` in the Server Action that records a view. This is an atomic server-side operation.

---

## Code Examples

### Upload Form with Progress (Client Component)
```typescript
// Source: Firebase Storage Web docs (uploadBytesResumable pattern)
// Adapted for project conventions

'use client';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import firebaseApp from '@/lib/firebase/client';
import { createVideo } from '@/app/actions/videos';

export default function VideoUploadForm({ uid }: { uid: string }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'uploading' | 'processing' | 'done' | 'error'>('idle');

  async function handleSubmit(formData: FormData) {
    const file = formData.get('video') as File;
    if (!file) return;

    const videoId = crypto.randomUUID();
    const storage = getStorage(firebaseApp);
    const storageRef = ref(storage, `videos/${uid}/${videoId}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    setPhase('uploading');

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        setProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
      },
      () => setPhase('error'),
      async () => {
        setPhase('processing');
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        await createVideo(uid, {
          videoId,
          videoUrl: downloadUrl,
          storagePath: storageRef.fullPath,
          title: formData.get('title') as string,
          // ... rest of form fields
        });
        setPhase('done');
      }
    );
  }
  // ... render
}
```

### Server Action: createVideo
```typescript
// Source: established project pattern from posts.ts
'use server';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function createVideo(
  uid: string,
  data: {
    videoId: string;
    videoUrl: string;
    storagePath: string;
    channelId: string | null;
    title: string;
    description: string;
    tags: string[];
    category: string;
    thumbnailUrl: string | null;
    durationSeconds: number;
  }
): Promise<{ success: true } | { success: false; error: string }> {
  const db = getAdminFirestore();
  const profile = await getProfileByUid(uid);
  if (!profile) return { success: false, error: 'Profile not found.' };

  const searchKeywords = buildVideoSearchKeywords(data.title, data.description, data.tags);

  await db.collection('videos').doc(data.videoId).set({
    ...data,
    uploaderUid: uid,
    uploaderHandle: profile.handle,
    uploaderDisplayName: profile.displayName,
    uploaderAvatarUrl: profile.avatarUrl,
    uploaderJurisdictionId: profile.jurisdictionId,
    status: 'pending_review',   // always pending, no auto-publish
    viewCount: 0,
    likeCount: 0,
    commentCount: 0,
    moderatorNote: null,
    moderatedAt: null,
    moderatedBy: null,
    searchKeywords,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: null,
  });

  return { success: true };
}
```

### Moderation Console Page (Server Component role guard)
```typescript
// Source: established pattern from src/app/(main)/admin/page.tsx
import { cookies } from 'next/headers';
import { getTokens } from 'next-firebase-auth-edge';
import { redirect } from 'next/navigation';

export default async function ModerationPage() {
  const tokens = await getTokens(await cookies(), authConfig);
  if (!tokens) redirect('/login');
  const roleLevel = (tokens.decodedToken as { roleLevel?: number }).roleLevel ?? 0;
  if (roleLevel < 2) redirect('/');  // moderator (2) or higher required

  // Fetch pending queue
  const db = getAdminFirestore();
  const pendingSnap = await db.collection('videos')
    .where('status', '==', 'pending_review')
    .orderBy('createdAt', 'asc')
    .limit(20)
    .get();
  // ... render ModerationConsoleClient
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Firebase SDK v8 namespaced (`firebase.storage()`) | Firebase SDK v12 modular (`getStorage`, `uploadBytesResumable` from `'firebase/storage'`) | SDK v9+ (2021) | Already using modular API in project — no change needed |
| Custom HLS player (video.js) for adaptive streaming | HTML5 native for prototype; Mux/HLS deferred to v2 | v1 prototype decision | No external video player library needed |
| Server-side file processing before storage | Direct client-to-Storage upload with `uploadBytesResumable` | Firebase Storage Web SDK | Progress tracking works natively; no server proxy needed |

**Deprecated/outdated in this project's context:**
- `firebase.storage().ref().put()` (Firebase v8 compat): project uses modular v12 — do not use compat syntax
- `video.js` or `plyr`: not needed for this prototype; HTML5 native suffices

---

## Open Questions

1. **Video duration capture**
   - What we know: `durationSeconds` needs to be stored on the video doc for the duration chip in VideoCard
   - What's unclear: When exactly can the duration be read? `HTMLVideoElement.duration` is available after `loadedmetadata` event fires
   - Recommendation: Read duration client-side in `VideoUploadForm` after the user selects the file (`URL.createObjectURL` + temporary `<video>` element), then pass it to the `createVideo` Server Action. Store `0` as fallback if detection fails.

2. **Channel handle uniqueness enforcement**
   - What we know: Channel handles need to be unique within the `channels` collection; `isHandleAvailable` helper pattern exists for user profiles in `src/lib/firestore/profiles.ts`
   - What's unclear: Whether channel handles should share a global uniqueness constraint with user handles
   - Recommendation: Enforce uniqueness within `channels` collection only (separate from `userProfiles`). The routes `/channel/[handle]` and `/profile/[handle]` are distinct — no cross-collection collision risk.

3. **View count increment timing**
   - What we know: View count must increment on video views; confirmed anti-pattern is read-modify-write
   - What's unclear: Should every page load increment, or only unique views per user per day?
   - Recommendation: For prototype, increment on every page load via Server Action (`FieldValue.increment(1)`). Unique-view deduplication is a v2 concern.

4. **Thumbnail upload flow**
   - What we know: Videos need thumbnails; Storage path planned as `thumbnails/{videoId}/`
   - What's unclear: Whether thumbnail is uploaded at same time as video or separately
   - Recommendation: Upload thumbnail as a separate Storage operation in the same `VideoUploadForm` submit handler (before or after video upload). Store the download URL in the `videos` doc.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 30 + jest-environment-jsdom |
| Config file | `jest.config.ts` (root) |
| Quick run command | `npx jest --testPathPatterns tests/actions/videos` (note: plural `--testPathPatterns` — Phase 2 established decision) |
| Full suite command | `npx jest` |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| VID-01 | `createVideo` writes Firestore doc with `status: 'pending_review'` | unit | `npx jest --testPathPatterns tests/actions/videos` | Wave 0 |
| VID-04 | `likeVideo` toggles like subcollection and increments/decrements `likeCount` | unit | `npx jest --testPathPatterns tests/actions/videos` | Wave 0 |
| VID-05 | `createVideoComment` creates comment and increments `commentCount` | unit | `npx jest --testPathPatterns tests/actions/videoComments` | Wave 0 |
| VID-07 | `reportContent` with `contentType: 'video'` writes to `reports` collection | unit | `npx jest --testPathPatterns tests/actions/videos` | Wave 0 |
| VID-11 | `buildVideoSearchKeywords` tokenizes title, description, tags | unit | `npx jest --testPathPatterns tests/lib/videos` | Wave 0 |
| VID-12 | `createVideo` always sets `status: 'pending_review'` regardless of uploader role | unit | `npx jest --testPathPatterns tests/actions/videos` | Wave 0 |
| VID-13 | `createVideo` rejects invalid category strings | unit | `npx jest --testPathPatterns tests/actions/videos` | Wave 0 |
| CHAN-01 | `createChannelApplication` writes channel doc with `status: 'pending_approval'` | unit | `npx jest --testPathPatterns tests/actions/channels` | Wave 0 |
| CHAN-03 | `approveChannel` updates status to `'approved'` and writes approver + timestamp | unit | `npx jest --testPathPatterns tests/actions/channels` | Wave 0 |
| MOD-04 | `updateVideoStatus` rejects callers with roleLevel < 2 | unit | `npx jest --testPathPatterns tests/actions/videos` | Wave 0 |
| MOD-04 | `updateVideoStatus` with `'published'` updates status and moderatedBy | unit | `npx jest --testPathPatterns tests/actions/videos` | Wave 0 |
| MOD-05 | `updateVideoStatus` writes notification to uploader's `users/{uid}/notifications` | unit | `npx jest --testPathPatterns tests/actions/videos` | Wave 0 |
| VID-02 | `VideoPlayer` renders `<video>` with `controls` attribute | component | `npx jest --testPathPatterns tests/components/VideoPlayer` | Wave 0 |
| VID-09 | `VideoUploadForm` shows progress bar when upload is in-flight | component | `npx jest --testPathPatterns tests/components/VideoUploadForm` | Wave 0 |
| VID-08 | `subscribeChannel` increments `subscriberCount` and creates subscriber doc | unit | `npx jest --testPathPatterns tests/actions/channels` | Wave 0 |

Manual-only (no automated test):
- VID-06 (share via `navigator.clipboard` — requires real browser clipboard API, mocking is trivial but low value)
- VID-10 (mobile responsive — visual; verify by resizing browser)

### Sampling Rate
- Per task commit: `npx jest --testPathPatterns tests/actions/videos tests/actions/channels tests/actions/videoComments`
- Per wave merge: `npx jest`
- Phase gate: Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/actions/videos.test.ts` — covers VID-01, VID-04, VID-07, VID-12, VID-13, MOD-04, MOD-05
- [ ] `tests/actions/channels.test.ts` — covers CHAN-01, CHAN-03, VID-08
- [ ] `tests/actions/videoComments.test.ts` — covers VID-05
- [ ] `tests/lib/videos.test.ts` — covers VID-11 (`buildVideoSearchKeywords`)
- [ ] `tests/components/VideoPlayer.test.tsx` — covers VID-02
- [ ] `tests/components/VideoUploadForm.test.tsx` — covers VID-09

---

## Sources

### Primary (HIGH confidence)
- Existing project code: `src/app/actions/posts.ts`, `follows.ts`, `notifications.ts`, `moderation.ts` — established Server Action patterns, fan-out, notification writes
- Existing project code: `src/lib/types/social.ts` — Notification type and interface extension point
- Existing project code: `firestore.rules`, `storage.rules` — current security model to extend
- Existing project code: `src/components/agora/PostCard.tsx` — VideoCard structural reference
- Firebase Storage Web docs: `https://firebase.google.com/docs/storage/web/upload-files` — `uploadBytesResumable` API and `on('state_changed')` progress pattern
- Phase 2 SUMMARY (02-01): fan-out batch chunks at 500 ops, Admin SDK-only write pattern

### Secondary (MEDIUM confidence)
- WebSearch: Firebase JS SDK v12 `uploadBytesResumable` + `on('state_changed')` pattern — confirmed consistent with official docs structure
- Phase 3 UI-SPEC (03-UI-SPEC.md): Component contracts, layout specs, copywriting — already approved

### Tertiary (LOW confidence)
- Video duration capture via `HTMLVideoElement.duration` after `loadedmetadata` — standard HTML5 API, well-documented, but implementation detail not yet verified in this project's setup

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all dependencies already in package.json; zero new packages required
- Firestore data model: HIGH — directly derived from established Phase 2 patterns; new fields follow same conventions
- Architecture patterns: HIGH — two-step upload pattern is the standard Firebase web approach; all Server Action patterns mirror existing code
- Firebase Storage rules: HIGH — extends existing storage.rules with same pattern
- Pitfalls: HIGH — items 1-3, 5 are direct consequences of established project architecture; items 4, 6, 7 are standard Firestore gotchas
- Validation architecture: HIGH — test infrastructure established in Phase 2; Jest 30 + jsdom already configured

**Research date:** 2026-03-18
**Valid until:** 2026-06-18 (stable stack — Firebase SDK, Next.js 15, Jest 30 are all stable releases)
