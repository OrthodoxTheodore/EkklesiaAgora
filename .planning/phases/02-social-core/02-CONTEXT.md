# Phase 2: Social Core - Context

**Gathered:** 2026-03-18
**Status:** Ready for planning

<domain>
## Phase Boundary

User profiles, the Agora social feed, post interactions (likes, comments), and Orthodox content category tagging. Comments live on post detail pages. DMs, video, full search, and liturgical calendar are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Comment Interaction Model
- Each post has a dedicated permalink/detail page at `/agora/[postId]`
- Feed cards show comment count as a clickable link; clicking navigates to post detail
- Comment threads on the detail page are **flat** (no nesting, no replies-to-replies)
- All comments load at once on the detail page (no pagination or infinite scroll)
- Users can **delete and edit** their own posts and comments after posting; show an "edited" timestamp on edited content
- Comments are restricted to registered users only
- Post author can restrict comments to **followers only** (set at post creation or edited after)
- Flags/reports on posts and comments go to the mod queue — content stays visible until a moderator acts (no auto-hide threshold)

### Profile Page Structure
- Twitter/X-style layout: large header banner area, circular avatar, display name, @handle, bio, jurisdiction badge, follower/following counts
- Profile URL uses @handle: `/profile/[handle]`
- Users have both a unique **@handle** (URL-safe, used in URLs and mentions) and a **display name** (free text shown on screen)
- Profile tabs: **Posts** and **Media** (photos/images only)
- Optional custom **banner/header image** upload; falls back to a default Byzantine gold/navy tile pattern if none set

### Jurisdiction Display
- Jurisdiction is a **content trust signal**, not just profile metadata
- Jurisdiction badge is **prominently displayed** on every profile page AND on every post card in the Agora feed (e.g., `@FrGeorge • ⛪ Antiochian`)
- All **canonically recognized Eastern Orthodox churches** are included in the jurisdiction list (including both the Orthodox Church of Ukraine and the Ukrainian Orthodox Church — listed as-is, reflecting current canonical status)
- Jurisdiction dropdown on profile edit has **two sections**: "Canonical Eastern Orthodox Churches" (full list per PROF-02) and a separator then "Other Christians" (Inquirer, Roman Catholic, Protestant, Oriental Orthodox per PROF-03)
- Patron saint field is optional and **secondary** — a fun personal detail, not a trust signal; shown on profile but not on post cards

### Profile Actions (viewing another user's profile)
- **Follow** button (primary action)
- **Message** button — present in the layout but **disabled/placeholder** in Phase 2 (DMs ship in Phase 7); shows "coming soon" tooltip
- Three-dot overflow menu contains: Block, Mute, and Report User (report is **de-emphasized** — listed last, no icon prominence)

### Category Tagging on Posts
- **Firebase AI / Gemini** auto-classifies post text into one of the 10 Orthodox categories on the compose form
- User **sees the AI suggestion** before posting and can override it with a manual picker
- If AI confidence is low or the post is too short to classify: **prompt user to pick manually** from the category list
- The 10 Orthodox categories (from CAT-01): Divine Liturgy, Holy Scripture, Holy Fathers, Iconography, Holy Trinity, Chanting & Music, Feast Days/Fast Days, Church History, Apologetics, Spiritual Life
- Category tag is displayed on every post card in the feed
- Agora feed has **horizontal scrollable category filter tabs** at the top: `All | Divine Liturgy | Holy Scripture | ...`

### Feed Layout & Post Cards
- Claude's discretion on exact layout, but must include per card: jurisdiction badge, avatar, @handle, display name, verification checkmark (if verified), relative timestamp, post text, optional image, category tag chip, like count, comment count

### Claude's Discretion
- Loading skeleton / placeholder states
- Exact spacing and typography within the Byzantine design system
- Error states and optimistic update behavior for likes
- Feed pagination/infinite scroll strategy
- Firebase AI prompt engineering for category classification

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase requirements
- `.planning/REQUIREMENTS.md` — PROF-01–06 (user profiles), AGRA-01–10 (Agora feed), CAT-01–02 (categories); these are the acceptance criteria for this phase

### Phase scope and dependencies
- `.planning/ROADMAP.md` §"Phase 2: Social Core" — phase goal, dependency on Phase 1, full requirement list

### Design reference
- `index (23).html` — original HTML/CSS mockup; establishes visual language (Byzantine aesthetic, component styling patterns) to reference when building new UI

### Existing reusable components
- `src/components/ui/Card.tsx` — base card (navy-mid bg, gold border, rounded-6px, p-8)
- `src/components/ui/Button.tsx` — gold and outline variants, loading state, Cinzel font
- `src/components/ui/Input.tsx` — existing input component
- `src/components/nav/Navbar.tsx` — navigation shell; profile link and notifications bell will integrate here

### Auth pattern (from Phase 1)
- `src/app/(main)/dashboard/page.tsx` — Server Component pattern using `getTokens()` for auth + role check; follow this for all new protected pages
- `src/app/actions/` — Server Actions pattern for Admin SDK operations

No external specs — requirements are fully captured in decisions above and REQUIREMENTS.md.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Card` component: use as the base for post cards, profile info blocks, and comment cards; already styled with Byzantine navy/gold border
- `Button` (gold/outline/loading): use for Follow, Like, Post submit, and category override picker
- `Input`: use for compose box, comment input, bio edit fields
- `Navbar` + `MobileMenu`: notifications bell integration point; follow/unfollow activity should trigger notification count here

### Established Patterns
- **Server Components + `getTokens()`**: all new protected pages (profile, feed, post detail) should follow the dashboard pattern — verify auth server-side, redirect to `/login` if no tokens
- **`(main)` route group**: all authenticated pages live under `src/app/(main)/`; new routes: `/agora`, `/agora/[postId]`, `/profile/[handle]`, `/profile/edit`
- **Server Actions**: use for write operations (create post, like, follow, update profile) following the `src/app/actions/` pattern
- **Tailwind v4 Byzantine tokens**: `text-gold`, `bg-navy-mid`, `font-cinzel`, `font-garamond`, `border-gold/[0.15]` — use these throughout, no new color values
- **Firestore fan-out feed + likes as subcollections**: already decided in Phase 1 planning; researcher must verify the exact data model from Phase 1 plans before designing Phase 2 Firestore writes

### Integration Points
- Navbar: add notification bell (AGRA-07) and profile avatar/link for logged-in users
- Dashboard page: post-Phase 2, this becomes a redirect to `/agora` (the feed) — the "features coming soon" placeholder card becomes obsolete
- Firebase Auth `roleLevel` claim: used to show/hide verified checkmark on post cards and profile (roleLevel >= 2 = verified)
- Firestore: new collections needed — `posts`, `comments`, `follows`, `notifications`, `userProfiles`; researcher should map exact schema

</code_context>

<specifics>
## Specific Ideas

- Jurisdiction is a **spiritual trust signal** — the display should communicate "this person is from X canonical church" with the weight that carries for Orthodox Christians. It is not merely a demographic tag.
- The Ukrainian church situation (OCU vs UOC) is deliberately included with both listed — the platform does not take sides on intra-Orthodox jurisdictional disputes. All canonically recognized churches as of today are included.
- The post detail page / permalink is important for **moderation**: flagged content needs a stable URL for moderators to review and act on.
- The Message button placeholder on profiles sets up the Phase 7 DM feature — the layout slot should be reserved even though it's inactive in Phase 2.
- Patron saint is "a fun fact about the person" — treat it like a bio field, not a required trust field.

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within Phase 2 scope.

*(Message/DM button is a **layout placeholder** in Phase 2, not a new capability — full DM feature ships in Phase 7.)*

</deferred>

---

*Phase: 02-social-core*
*Context gathered: 2026-03-18*
