# Phase 3: Video Hub + Moderation - Context

**Gathered:** 2026-03-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Video upload and playback through verified channels, plus a moderation console for processing pending uploads and flagged content. Channels are separate approved identities (not auto-created). Videos always go through moderation regardless of channel status. Global search, DMs, and algorithmic video recommendations are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Video Player Experience
- Videos are playable **both inline** (in feeds, channel pages) and on a **dedicated page** at `/videos/[id]`
- **Inline playback**: clicking the thumbnail starts playback in the card; no autoplay on scroll; title/metadata link still navigates to the full page
- **Dedicated video page** (`/videos/[id]`): YouTube-style layout — large player top-left, video metadata + like/share/flag/category below it, comments underneath; right sidebar shows related videos from the same channel or same Orthodox category
- **Video card metadata** (in feeds and channel pages): thumbnail with duration chip overlay, channel avatar, video title, view count, relative upload date, category tag chip — no description excerpt; clean grid card similar to YouTube

### Channel Identity & Types
- Channels require **moderator approval** — a user must apply to create a channel; it is not auto-created on registration
- Any registered user can upload videos **without a channel** — those videos appear on their profile and always go into the moderation queue
- An **approved channel** unlocks a dedicated page at `/channel/[handle]` with its own identity (banner, logo/avatar, channel name, description, subscriber count) — distinct from the user's personal profile at `/profile/[handle]`
- Even approved channels: **every video still goes through moderation** — channel approval is about identity/trust, not bypassing the review queue
- Channel types: **personal** (individual creator) and **institutional** (parish, monastery, organization) — both go through the same approval process; type is a label on the channel profile
- Channel discovery: dedicated `/channels` browse page listing all approved channels with logo, name, primary Orthodox category, and subscriber count; **filterable by Orthodox content category**
- Subscribing to a channel follows the same fan-out pattern established in Phase 2 for user follows

### Upload Flow & Constraints
- **Firebase Storage resumable uploads** — required for large files; show a progress bar during upload
- Accepted formats: `mp4`, `webm`, `mov` (standard web video formats); reasonable size cap (2 GB for prototype)
- After upload completes, video enters the moderation queue with status **"pending review"** — uploader sees this status clearly on their upload/profile page
- Uploader receives an **in-app notification** (bell) when moderation decision is made (approve / reject / request changes)
- Videos without an approved channel are listed on the uploader's profile page in a "Videos" section

### Moderation Console
- Console lives at `/admin/moderation` (already within the existing `/admin` route)
- **Two tabs**: "Pending Uploads" (pre-publication review) and "Flagged Content" (post-publication reports) — separate workflows, separate tabs
- **Pending upload review card** shows: full video player, title, description, tags, thumbnail, category. Plus uploader context: account age, jurisdiction badge, post history count, verification status
- **Three actions** on each pending item: Approve (publishes video), Reject (removes permanently with reason), Request Changes (holds video for edits with a freeform moderator note)
- **"Request changes" flow**: moderator writes a freeform note explaining what to fix; uploader gets an in-app notification with the note and a direct link back to their upload to edit metadata and resubmit
- Flagged content tab shows: the flagged video, flag reason(s), flagger count, and same approve/reject/request-changes actions
- Moderator actions trigger **notification to the uploader** in all cases (approved, rejected, or changes requested)

### Claude's Discretion
- Exact progress bar design during upload
- Loading skeleton states for video cards and channel pages
- Error states for failed uploads or playback errors
- Exact sidebar "related videos" algorithm (same channel first, then same category)
- Channel application/request form fields beyond name, type, and description

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase requirements
- `.planning/REQUIREMENTS.md` — VID-01–13 (video platform), CHAN-01–04 (channels), MOD-01–05 (moderation); these are the acceptance criteria for this phase

### Phase scope and dependencies
- `.planning/ROADMAP.md` §"Phase 3: Video Hub + Moderation" — phase goal, dependency on Phase 2, full requirement list, suggested plan breakdown

### Prior phase patterns to follow
- `.planning/phases/02-social-core/02-CONTEXT.md` — established patterns: PostCard structure, jurisdiction badge display, category tags, flat comment threads, notification bell, fan-out follows, Server Actions for writes, Server Component auth pattern
- `.planning/phases/02-social-core/02-01-SUMMARY.md` — Firestore data model for posts/follows/notifications; channel subscribe should follow the same fan-out pattern
- `.planning/phases/01-foundation/01-03-SUMMARY.md` — role hierarchy and admin route patterns; moderation console requires moderator roleLevel check

### Design reference
- `index (23).html` — original HTML/CSS mockup; establishes visual language (Byzantine aesthetic, component styling) to reference when building new UI

### Existing reusable components
- `src/components/ui/Card.tsx` — base card; use for video cards and channel cards
- `src/components/ui/Button.tsx` — gold and outline variants with loading state; use for approve/reject/subscribe actions
- `src/components/ui/Input.tsx` — existing input; use for upload form fields and moderator notes
- `src/components/agora/PostCard.tsx` — reference pattern for video card structure (jurisdiction badge, avatar, category chip, action counts)
- `src/components/agora/CategoryFilterTabs.tsx` — reuse or adapt for channel browse page category filter
- `src/app/(main)/admin/` — existing admin route; moderation console extends this

No external specs — requirements are fully captured in decisions above and REQUIREMENTS.md.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Card` component: base for video cards and channel listing cards (navy-mid bg, gold border, rounded-6px)
- `Button` (gold/outline/loading): approve, reject, request-changes actions in console; subscribe button on channel pages
- `PostCard`: structural reference for VideoCard — same jurisdiction badge, avatar, category chip pattern; adapt for video-specific fields (duration chip, view count)
- `CategoryFilterTabs`: adapt for the `/channels` browse page category filter
- `NotificationBell` + notification fan-out: moderator decisions trigger uploader notifications via the same Firestore notification pattern from Phase 2
- Existing admin pages at `src/app/(main)/admin/`: moderation console lives here; inherits roleLevel guard pattern

### Established Patterns
- **Fan-out follows**: channel subscribe uses the same Firestore fan-out pattern as user follows (Phase 2)
- **Flat comment threads**: video comments follow the same flat, all-at-once model as post comments (Phase 2)
- **Server Components + `getTokens()`**: all new protected pages follow this auth pattern
- **Server Actions**: all write operations (upload metadata, like, subscribe, mod decisions) use Server Actions
- **Tailwind v4 Byzantine tokens**: `text-gold`, `bg-navy-mid`, `font-cinzel`, `font-garamond`, `border-gold/[0.15]` — no new color values
- **`(main)` route group**: new routes live here — `/videos/[id]`, `/channel/[handle]`, `/channels`, `/admin/moderation`
- **Firebase AI / Gemini**: video category auto-classification follows same pattern as post category (Phase 2); uploader sees suggestion and can override

### Integration Points
- Navbar: "Videos" nav link to `/videos` (video browse/home page); channel subscribe count visible on channel pages
- Admin sidebar: add "Moderation" link to the existing admin nav
- Notification system: moderator decisions write to `users/{uid}/notifications` — same structure as Phase 2 notifications
- Firestore: new collections needed — `channels`, `videos`, `videoComments` (or extend `comments` collection); researcher should map exact schema
- Firebase Storage: `videos/{uid}/{videoId}/` for raw video files, `thumbnails/{videoId}` for thumbnail images

</code_context>

<specifics>
## Specific Ideas

- **Channel approval as trust gate**: The two-tier model (profile uploads vs. approved channels) reflects the platform's canonical integrity mission — not everyone gets an "official" publisher identity. The channel approval process is itself a moderation act.
- **Moderation console is a tool for human judgment**: The full video + uploader context (jurisdiction, post history, account age) is intentional — Orthodox content moderation requires understanding who is speaking, not just what is said. A video from a parish priest carries different weight than an anonymous upload.
- **"Request changes" is pastoral, not punitive**: The freeform note allows moderators to guide uploaders toward compliant content rather than just rejecting. This fits the Orthodox pastoral model.

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within Phase 3 scope.

*(Channel application form and approval workflow are part of Phase 3's moderation console — not deferred.)*

</deferred>

---

*Phase: 03-video-hub-moderation*
*Context gathered: 2026-03-18*
