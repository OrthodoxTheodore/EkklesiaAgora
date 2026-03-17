# Domain Pitfalls

**Domain:** Orthodox Christian video-sharing + social media + religious content platform
**Project:** Ekklesia Agora
**Researched:** 2026-03-16
**Confidence:** MEDIUM — based on well-documented engineering patterns; web verification blocked during this session

---

## Critical Pitfalls

Mistakes that cause rewrites, community collapse, or canonical integrity failures.

---

### Pitfall 1: Firebase Storage Is Not a Video Platform

**What goes wrong:** Treating Firebase Storage as a video CDN/streaming service. Teams upload video files to Firebase Storage, serve them via direct download URLs, and discover: no adaptive bitrate streaming (HLS/DASH), no transcoding (users upload 4K .mov files), terrible mobile playback, massive egress bills, and no thumbnail generation.

**Why it happens:** Firebase Storage works great for images and documents, so teams assume it scales to video. It does not. Firebase Storage is object storage — it has no video pipeline.

**Consequences:**
- Playback fails on slow connections (no HLS chunking)
- Storage fills with incompatible raw formats (.mov, .avi, .mkv)
- Egress costs explode: Firebase Storage charges ~$0.12/GB download. A 1-hour sermon at 720p is ~1.5GB. 100 views = $18 in egress for a single video.
- Free tier: 5GB storage, 1GB/day download. One popular video destroys the free tier in hours.
- No seek/resume capability without proper streaming infrastructure.

**Prevention:**
- Do NOT store raw video files in Firebase Storage for anything beyond prototype demo.
- Use a dedicated video pipeline: Cloudflare Stream, Mux, or Bunny.net (cheapest) for actual video hosting. These transcode, chunk into HLS, and serve via CDN.
- Firebase Storage is acceptable for: thumbnails, profile avatars, document uploads (PDFs of patristic texts).
- For prototype: embed YouTube/Vimeo links as a placeholder; replace with real video pipeline before any real user uploads.

**Detection (warning signs):**
- Someone uploads a .mov file and playback breaks
- Free tier bandwidth exhausted after a handful of video views
- Users complain about buffering or inability to seek

**Phase to address:** Phase 1 (architecture decision) — never assume Firebase Storage handles video. Decide on video pipeline before building upload UI.

---

### Pitfall 2: Content Moderation Bottleneck Kills Community Growth

**What goes wrong:** All unverified video uploads require moderator approval (correct requirement), but no moderator queue UI, SLA, or workflow is built. Uploads sit pending for days/weeks. Legitimate content creators give up and the platform gets a reputation for being slow or arbitrary.

**Why it happens:** Moderation is treated as a backend flag (`status: "pending"`) rather than a workflow product. The UI for moderators is an afterthought built after the user-facing features.

**Consequences:**
- Parish content creators submit one video, wait a week, never return.
- Moderators burn out reviewing a disorganized queue with no context (who is this uploader? what jurisdiction? what is this video about?).
- Backlog grows; quality degrades as moderators rush.
- Verified-account tiers lose meaning if the verification process itself is informal/undocumented.

**Prevention:**
- Build the moderator queue UI as a first-class feature, not a bolt-on. It needs: pending count, upload preview, uploader profile (jurisdiction, account age, prior approvals), approve/reject with reason, and bulk actions.
- Define SLA: "All uploads reviewed within 48 hours" — publish this publicly so creators know what to expect.
- Build a fast-path for known-good submitters: once a user has 5 approved uploads with no flags, consider auto-approval with post-hoc review.
- Verification workflow: document what makes someone "verified" (clergy letter? bishop's office confirmation?). Build a formal request flow, not ad-hoc admin edits.

**Detection (warning signs):**
- Pending queue length is not visible to admins on the dashboard
- No email/notification sent to uploader when video is approved/rejected
- Moderators accessing Firestore console directly to manage content

**Phase to address:** Phase 2 (content moderation system) — must be built alongside upload feature, not after.

---

### Pitfall 3: Algorithmic Feed Without Enough Content = Dead Platform

**What goes wrong:** An algorithmic feed is built (engagement-based, like YouTube's recommendation engine), but the platform launches with insufficient content. The feed shows the same 5 videos repeatedly, new users see stale content on day 2, and engagement metrics crater.

**Why it happens:** The algorithm requires a minimum content density to function. Below that threshold it degenerates into a popularity contest among a handful of videos, or falls back to chronological order — but then looks broken compared to what users expected.

**Consequences:**
- First-impression failure: users open the app and see the same Divine Liturgy video for the third time.
- Creators see no engagement growth, stop uploading.
- Platform enters a death spiral: no content → no users → no content.

**Prevention:**
- Seed aggressively before launch. The requirement to "seed platform with curated existing Orthodox content" is correct — treat it as a hard prerequisite, not a nice-to-have. Target minimum 200-500 pieces of content across categories (videos, posts, liturgical data) before any real-user traffic.
- Build a simple curation feed (chronological + category filter) as a fallback that works with sparse content. Algorithmic recommendations should be an enhancement layered on top, not the primary discovery mechanism at launch.
- Curate from existing Orthodox YouTube channels: OCA, GOARCH, SVS Press, Ancient Faith Radio — these have existing catalogs that can be imported as embeds or with permission.
- Track content-per-category health: if any category (e.g., "Great Lent") drops below 10 items, surface it to admins.

**Detection (warning signs):**
- Algorithm returns fewer than 10 unique results for a given user session
- Same video appearing in top recommendations for all users regardless of watch history
- Feed is purely chronological because recommendation logic has no signal to work with

**Phase to address:** Phase 1 (content seeding strategy) and Phase 3 (recommendation engine) — separate concerns intentionally.

---

### Pitfall 4: Schism-Bait: Platform Gets Pulled Into Jurisdictional Politics

**What goes wrong:** Orthodox Christianity has multiple jurisdictions (OCA, GOARCH, Antiochian, ROCOR, Serbian, Bulgarian, etc.) with real historical tensions. A platform that appears to favor one jurisdiction — in its seed content, verification decisions, or moderation calls — becomes a flashpoint. Users from other jurisdictions feel excluded or view the platform as a partisan instrument.

**Why it happens:** The founder is typically in one jurisdiction and naturally seeds content from their own jurisdiction first. Moderation decisions reflect implicit theological or jurisdictional preferences. Canonical questions arise (e.g., "Is jurisdiction X in communion with X?") and the platform either takes a stance or refuses to and gets accused of enabling schismatics.

**Consequences:**
- Platform becomes associated with one jurisdiction, losing the broader Orthodox audience.
- Clergy from non-represented jurisdictions withhold blessing/endorsement.
- Theological disputes in comments devolve into jurisdiction wars.
- In the worst case, a bishop's office asks the platform to de-platform content from a jurisdiction they don't recognize.

**Prevention:**
- Content policy must explicitly state: "This platform serves all canonical Orthodox jurisdictions in communion with the Ecumenical Patriarchate and other autocephalous Orthodox churches." Name the principle, not specific jurisdictions.
- Seed content with intentional jurisdictional balance from day one.
- The "Content Integrity" standard (OSB, Synaxarion, Church Fathers) is correct — use these as the canonical benchmark, not any one jurisdiction's practice.
- Verification of clergy: tie to canonical standing in their jurisdiction, not the founder's jurisdiction's standards.
- Do not moderate theological disputes between traditions. Moderate personal attacks and calumny, not doctrinal disagreements.
- Add jurisdiction field to user profiles (already planned) — use it to surface content from the user's own jurisdiction as a personalization signal, not an exclusion mechanism.

**Detection (warning signs):**
- Seed content is 80%+ from one jurisdiction
- Comments sections turn into "your jurisdiction does X wrong" arguments
- Moderation decisions consistently favor or disfavor content from specific jurisdictions
- A hierarch from any jurisdiction publicly distances themselves from the platform

**Phase to address:** Phase 1 (content policy document) and Phase 2 (seed content curation) — before any public launch.

---

### Pitfall 5: Firestore Data Model Cannot Support Feed at Scale

**What goes wrong:** Social feed is modeled naively in Firestore: a `posts` collection where each document has an array of `likedBy: [uid1, uid2, ...]`. Queries like "show me all posts from people I follow, sorted by time, paginated" require either a fan-out write pattern or expensive collection-group queries that Firestore charges per document read.

**Why it happens:** Firestore works beautifully for simple CRUD. Social feed features (follows, likes, algorithmic ranking) require patterns that are not obvious from the documentation and become expensive at scale.

**Consequences:**
- Free tier exhausted by Firestore reads: 50K reads/day free. A feed refresh reading 20 posts = 20 reads. 2,500 feed refreshes/day = free tier blown.
- Array-based likes (`likedBy: [...]`) hit Firestore's 1MB document limit at scale and cannot be queried efficiently.
- "Posts from people I follow" requires reading a follows list, then querying each followed user's posts — O(n) reads per feed load.
- Real-time listeners on a busy feed trigger unbounded read billing.

**Prevention:**
- Use the activity-feed / fan-out-on-write pattern: when User A posts, write a copy to every follower's `feed/{uid}/posts/{postId}` subcollection. Reads are cheap; writes are slightly expensive but bounded.
- Likes: use a separate `likes/{postId}/users/{uid}` subcollection or a counter document (with distributed counters for high-traffic posts). Never store likes as an array inside the post document.
- Cache aggressively on the client: React Query or SWR with appropriate stale-while-revalidate. Most feed content doesn't change in 30 seconds.
- Design Firestore schema before writing a single line of application code. It is very painful to migrate Firestore schemas after data exists.
- For prototype: naive schema is acceptable. Flag this as a known technical debt item with a documented migration plan before real-user launch.

**Detection (warning signs):**
- Firestore reads counter visible in Firebase console trending toward 50K/day in prototype
- Post documents growing beyond 100KB (sign of embedded arrays)
- Feed queries taking >1s on a nearly empty database

**Phase to address:** Phase 1 (data model design) — schema decisions made before any feature development.

---

### Pitfall 6: Video Copyright and DMCA Exposure from Seeded Content

**What goes wrong:** Platform seeds content by importing videos from Orthodox YouTube channels "with permission" — but permission is informal (a comment reply, a DM). Later, the original uploader requests takedown, or their channel is managed by an entity with IP rights (a diocese, a publisher). The platform has no DMCA compliance infrastructure.

**Why it happens:** Small religious communities operate informally. A monk replies "sure, share it" — but the monastery's bishop owns the content. Liturgical music is often composed music with copyright held by publishers (e.g., SVS Press, Orthodox Christian Music Project). Homily recordings from parish websites may have congregational recording rights issues.

**Consequences:**
- DMCA takedown notices arrive with no process to handle them.
- Hosting a video platform without a registered DMCA agent is legal exposure.
- If platform re-hosts (not just embeds) video files, it is responsible for every copyright violation.
- A cease-and-desist from a diocese or publisher can force sudden mass deletion of seeded content.

**Prevention:**
- Register a DMCA agent with the U.S. Copyright Office before accepting any user-uploaded content. This is a legal requirement for safe harbor protection. Cost: $6/year.
- Use YouTube embeds (not re-hosting) for seeded content wherever possible. Embeds keep the video on YouTube's servers and under YouTube's copyright management. Safe harbor does not require re-hosting.
- For any re-hosted content: get written permission (email is sufficient), document it, store it.
- Build DMCA takedown workflow before accepting unverified uploads: receive notice, remove content within 48h, notify uploader, allow counter-notice.
- Content policy must explicitly state that all uploaded content must be original or licensed.

**Detection (warning signs):**
- Seed content sourced by copying YouTube URLs and re-uploading (not embedding)
- No DMCA agent registered
- No documented permission trail for seeded content
- Platform has no takedown/dispute workflow

**Phase to address:** Phase 1 (legal groundwork) — register DMCA agent before platform accepts any uploads. Even in prototype stage if it will be shown to a bishop.

---

### Pitfall 7: Prototype Shown to Bishop Becomes the Production Commitment

**What goes wrong:** The prototype is shown to clergy for blessing. The prototype uses Firebase free tier, has hardcoded data, and uses YouTube embeds as placeholders. The blessing is granted — but now stakeholders (priest, bishop, potential donors) believe what they saw IS the product. Switching the video backend from embeds to Mux, or migrating from the naive Firestore schema, becomes politically difficult ("why does it look different from what we were shown?").

**Why it happens:** Prototype demos are persuasive. Religious communities often don't distinguish between "prototype" and "finished product." Once a hierarch blesses something, changing the fundamental shape of it feels like acting without blessing.

**Consequences:**
- Technical debt becomes religiously/politically entrenched.
- Development team is locked into demonstrating features rather than building correctly.
- Real-user launch is delayed because the "prototype" was never built to be launchable.

**Prevention:**
- The prototype presentation should include explicit verbal and written framing: "This demonstrates the vision and the design. The technical infrastructure will be replaced with production-grade services before real users join. The aesthetic and features will remain the same."
- Prepare a one-page "What Will Change Before Launch" document for the blessing meeting. This sets correct expectations and gives the hierarch insight into the full plan.
- Lock the UI/UX design language (Byzantine aesthetic, color palette, typography, navigation) — this is what they are blessing. Keep the backend flexible.
- Use feature flags or clear "DEMO MODE" indicators in the prototype so viewers understand the data is not live.

**Detection (warning signs):**
- Priest/bishop says "can you add X to what you showed me?" treating prototype as production
- Team feels unable to change the video backend after the demo
- Stakeholders are surprised when prototype data is replaced with real content

**Phase to address:** Phase 1 (prototype preparation) — frame the demo correctly from the start.

---

## Moderate Pitfalls

### Pitfall 8: Liturgical Calendar Data Is Wrong

**What goes wrong:** Liturgical calendar data (feasts, fasts, saints, Julian/Gregorian dates) is sourced from a single source (e.g., a web scrape, a single jurisdiction's calendar) and contains errors or omissions. Different jurisdictions use different calendars (Old vs. New Calendar). Platform shows incorrect fasting information during Great Lent or lists wrong saints for a given day.

**Prevention:**
- Source calendar data from multiple authoritative Orthodox sources: OCA.org (New Calendar), ROCOR calendar (Old Calendar), the Synaxarion text itself.
- Build calendar data as a structured dataset (JSON/Firestore documents) with source attribution per entry, not a hardcoded display.
- Clearly label calendar entries with which calendar they belong to (Revised Julian / Old Julian).
- Allow user preference for calendar style (New/Old) tied to their jurisdiction profile field.
- Have a canonically-informed reviewer (ideally a priest or knowledgeable layperson) audit the calendar data before launch.

**Detection (warning signs):**
- Calendar shows only one calendar style without user preference
- Feast descriptions lack source citation
- Users from Old Calendar jurisdictions (ROCOR, Serbian) report wrong dates

**Phase to address:** Phase 3 (liturgical calendar feature).

---

### Pitfall 9: Search Across Firestore Collections Is Not Native

**What goes wrong:** The requirement to "search across videos, posts, and people" cannot be fulfilled natively by Firestore. Firestore supports simple equality queries and range queries on indexed fields — it does not support full-text search, fuzzy matching, or cross-collection keyword queries.

**Prevention:**
- Integrate Algolia, Typesense (self-hosted, free), or Meilisearch for full-text search from the beginning of search feature development.
- Typesense has a generous free cloud tier and is significantly simpler to self-host than Elasticsearch.
- Index content to the search engine on write (Cloud Functions triggered on Firestore write).
- For prototype: a simple Firestore query on `title` field with `>=` / `<=` range hack gives approximate prefix search as a placeholder.

**Detection (warning signs):**
- Developer attempts to do `where("body", "contains", searchTerm)` in Firestore — this query doesn't exist
- Search returns only exact title matches
- Search is limited to a single collection

**Phase to address:** Phase 3 or 4 (search feature implementation).

---

### Pitfall 10: Heterodox or Ecumenist Content Floods the Platform

**What goes wrong:** A platform explicitly for Orthodox Christians attracts well-meaning but heterodox users who post content that syncretizes Orthodoxy with other traditions, promotes ecumenism beyond canonical limits, or misrepresents Orthodox teaching (e.g., "all paths lead to God," Protestant interpretations of Orthodox practices). Moderators must judge theological content without clear standards.

**Prevention:**
- Content policy must define "Orthodox content" positively and specifically: content that affirms the Seven Ecumenical Councils, the Holy Tradition, and the canonical teaching of the Church. Name this clearly.
- Content policy must define what is outside scope: proselytizing other religions, syncretic teaching, content contradicting conciliar definitions of faith.
- Moderators need a rubric, not just a flag button. Create a moderation guide that gives concrete examples of content to approve vs. reject.
- The "verified account" tier is the right mechanism: clergy and known teachers are trusted; unverified users' theological content goes through review.

**Detection (warning signs):**
- Moderation queue grows with "is this Orthodox?" debates between moderators
- Users complaining that clearly non-Orthodox content is approved
- Content from non-Orthodox users promoting interfaith syncretism goes unchallenged

**Phase to address:** Phase 2 (content policy document and moderation workflow).

---

### Pitfall 11: Firebase Free Tier Exhausted During Prototype Demo

**What goes wrong:** The prototype is demo'd to a priest/bishop with Firebase free tier. A well-attended demo (multiple people on phones, refreshing the app, watching videos) triggers Firebase quota limits. The app stops working mid-demo.

**Prevention:**
- Know the free tier limits: Firestore 50K reads/day, 20K writes/day, 20K deletes/day; Firebase Storage 5GB storage, 1GB/day download; Firebase Hosting 10GB/month bandwidth.
- For the demo: disable real-time listeners (don't use `onSnapshot`) and use one-time reads (`getDocs`) to reduce read counts.
- Pre-cache all demo data client-side before the meeting.
- If videos are re-hosted in Firebase Storage: move them to YouTube embeds for the demo to eliminate egress.
- Have a Firebase project with Blaze plan (pay-as-you-go) on standby — actual cost for a single demo is under $1, but it removes quota anxiety.

**Detection (warning signs):**
- Firebase console showing daily read quota above 30K (approaching limit)
- Videos buffering or failing during testing the day before demo
- Storage download counter above 500MB/day

**Phase to address:** Phase 1 (prototype preparation, specifically before the blessing demo).

---

## Minor Pitfalls

### Pitfall 12: Direct Messages (DMs) as a Vector for Pastoral Manipulation

**What goes wrong:** DM feature is built without safeguards. Bad actors (online "startsy" offering unsolicited spiritual direction, schismatic recruiters, individuals with unhealthy attachments) use DMs to target vulnerable users (inquirers, those in spiritual crisis). Platform gets associated with harmful encounters even though DM content is private.

**Prevention:**
- Allow users to control DM privacy: "Anyone can DM me" / "Only people I follow" / "DMs off."
- Default for new users: DMs only from mutual follows.
- Provide a "block and report" option prominently within DM conversations.
- Add a community guideline visible in the DM UI: "For spiritual guidance, please consult your priest or bishop."

**Phase to address:** Phase 4 (DM feature).

---

### Pitfall 13: People Finder (Synodeia) Creates Stalking/Privacy Vectors

**What goes wrong:** The people finder allows searching by jurisdiction and location. This combination makes it possible to identify and locate specific individuals in a geographic area — a safety concern, particularly for vulnerable users (domestic abuse situations, individuals who have left abusive parishes).

**Prevention:**
- Location granularity: offer "State/Region" not city or zip code. Never expose precise location.
- People finder should require a logged-in account to use (already planned).
- Allow users to opt out of appearing in people finder entirely.
- Do not combine location + jurisdiction in a way that creates a sub-10-person result set.

**Phase to address:** Phase 4 (Synodeia feature).

---

### Pitfall 14: Cinzel/EB Garamond Typography Fails on Android

**What goes wrong:** The existing Byzantine aesthetic uses Google Fonts (Cinzel, EB Garamond). These load fine on desktop and iOS. On certain Android browsers with poor font rendering or constrained connections, these fonts either fail to load (showing system fallback), render poorly at small sizes, or cause layout shift (CLS) that breaks the liturgical aesthetic.

**Prevention:**
- Define robust font stacks with appropriate serif fallbacks: `font-family: 'EB Garamond', Garamond, Georgia, serif;`
- Preload critical font files in the `<head>`.
- Use `font-display: swap` to prevent invisible text during font load.
- Test on a mid-range Android device (not just Chrome DevTools mobile emulation) early in development.

**Phase to address:** Phase 1 (design system implementation).

---

### Pitfall 15: Timezone-Naive Liturgical Calendar Ruins Fasting Guidance

**What goes wrong:** Liturgical calendar shows feast/fast days without timezone awareness. A user in California sees today as a fast day when in their timezone it is still yesterday. For the Eucharistic fast, this matters practically.

**Prevention:**
- Store all liturgical calendar dates as UTC dates, not strings.
- Render calendar dates in the user's local timezone (use `Intl.DateTimeFormat`).
- For fasting guidance, always display the user's local date prominently.

**Phase to address:** Phase 3 (liturgical calendar feature).

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Video upload/streaming (any phase) | Firebase Storage egress costs destroy free tier | Decide on video pipeline (Bunny.net/Mux/Cloudflare Stream) before building upload UI |
| Data model design (Phase 1) | Naive Firestore schema impossible to migrate at scale | Design fan-out feed pattern and like subcollections before writing first feature |
| Prototype demo preparation (Phase 1) | Demo breaks on free tier quota, or prototype becomes locked-in commitment | Pre-cache, use YouTube embeds, frame demo as "vision" not "product" |
| Content seeding (Phase 2) | Copyright exposure from re-hosted video; jurisdictional imbalance | Embed don't re-host; diversify sources; register DMCA agent |
| Moderation workflow (Phase 2) | Moderator queue is an afterthought, creator experience suffers | Build moderator UI as first-class product in same sprint as upload feature |
| Content policy (Phase 2) | No clear Orthodox content standard → moderators make inconsistent calls | Write a moderation rubric with concrete examples before queue goes live |
| Search (Phase 3-4) | Firestore has no full-text search | Integrate Typesense or Algolia at search feature start, not after discovery breaks |
| Liturgical calendar (Phase 3) | Wrong dates, single-jurisdiction data, timezone bugs | Source from multiple jurisdictions, label calendar style, use UTC dates |
| Algorithm/feed (Phase 3) | Insufficient content density renders algorithm useless | Require content seeding SLA before activating algorithmic feed |
| People finder (Phase 4) | Location precision creates stalking risk | State-level granularity only; opt-out available |
| Direct messaging (Phase 4) | DMs weaponized for spiritual manipulation | Privacy controls, mutual-follow default, block/report in DM UI |
| Jurisdictional balance (ongoing) | Platform perceived as one jurisdiction's instrument | Monitor content distribution by jurisdiction; diversify verification approvals |

---

## Confidence Assessment

| Pitfall Area | Confidence | Notes |
|-------------|------------|-------|
| Firebase Storage video limitations | HIGH | Well-documented, exact limits known from official docs |
| Firebase free tier quotas | HIGH | Published limits, stable over years |
| Firestore social feed data model | HIGH | Fan-out pattern is canonical, extensively documented |
| Firestore full-text search gap | HIGH | Documented limitation, confirmed in official docs |
| Orthodox jurisdictional dynamics | MEDIUM | Based on knowledge of Orthodox ecclesiology and community dynamics; specific platform failures are anecdotal |
| DMCA agent registration requirement | HIGH | U.S. Copyright Act 17 USC 512, DMCA safe harbor, stable law |
| Content moderation workflow pitfalls | MEDIUM | Based on well-known patterns from niche social platform post-mortems |
| Font rendering on Android | MEDIUM | General web development knowledge; specific Cinzel/EB Garamond behavior on Android not web-verified |
| Liturgical calendar timezone issues | HIGH | Standard web date/timezone problem, applicable to any calendar feature |

---

## Sources

- Firebase Storage limits and pricing: https://firebase.google.com/pricing (web verification blocked; limits from training knowledge, stable)
- Firestore data modeling for social feeds: https://firebase.google.com/docs/firestore/solutions/aggregation (official pattern documentation)
- DMCA safe harbor, 17 USC 512: U.S. Copyright Office, https://www.copyright.gov/dmca/
- Firestore full-text search limitation: https://firebase.google.com/docs/firestore/solutions/search (official documentation acknowledging limitation)
- Typesense (free self-hosted search): https://typesense.org/
- Orthodox jurisdictions in North America: OCA (oca.org), GOARCH (goarch.org), ROCOR (synod.com) — knowledge of ecclesial landscape
- Font loading best practices: https://web.dev/font-best-practices/

**Note:** Web search and WebFetch were unavailable during this research session. All findings are based on training knowledge (cutoff August 2025). Confidence levels reflect this. Before production, verify Firebase pricing at firebase.google.com/pricing and DMCA agent registration at copyright.gov/dmca-agent.
