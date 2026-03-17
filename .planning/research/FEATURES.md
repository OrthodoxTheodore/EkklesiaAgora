# Feature Landscape

**Domain:** Orthodox Christian video-sharing + social media + research library platform
**Researched:** 2026-03-16
**Confidence note:** External search tools unavailable. Analysis draws from training knowledge of YouTube, Vimeo, Rumble, Facebook, Instagram, Twitter/X, Ancient Faith Radio, Orthodox Christian Network, and analogous niche religious community platforms. Confidence rated accordingly.

---

## Table Stakes

Features users expect when arriving from YouTube, Facebook, or any religious content site. Missing any of these causes immediate abandonment.

### Video Platform Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Video playback with standard controls (play/pause/seek/volume/fullscreen) | Every video platform has this; absence feels broken | Low | HTML5 video or HLS.js; Firebase Storage for files |
| Video thumbnails auto-generated or uploaded | Users browse by thumbnail before clicking | Med | Require manual upload initially; auto-generation (FFmpeg) is a later enhancement |
| Video title, description, tags | Discoverability; users expect to understand content before playing | Low | Plain text fields |
| Video duration display | Users decide whether to watch based on length | Low | Computed at upload time |
| View count | Social proof; users skip content with 0 views if alternatives exist | Low | Firestore counter |
| Like/reaction on videos | Engagement signal; absence makes platform feel dead | Low | Single-tap like is sufficient at launch |
| Comment section on videos | Core engagement loop for video platforms | Med | Nested replies expected; moderation hooks required |
| Video channel/creator page | Users want to find more from the same source | Med | Maps to Channel system in PROJECT.md |
| Subscribe/follow channels | Repeat engagement; content feed personalization | Med | Notification delivery is the hard part |
| Video search | Minimum: title + description full-text search | Med | Firebase text search is limited; Algolia or simple keyword match needed |
| Share video (copy link) | Evangelism; how content spreads | Low | URL copy; social share buttons optional |
| Report/flag video | Content safety; without this moderators are blind | Low | Simple category-based flag form |
| Guest browsing | Users explore before committing to register | Low | Explicitly required in PROJECT.md |
| Mobile-responsive video playback | Majority of internet browsing is mobile | Med | CSS + HLS adaptive bitrate matters here |
| Upload progress indicator | Large video uploads take minutes; users need feedback | Low | Firebase Storage upload task progress API |

### Social Feed Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Text post creation | Core of any social feed | Low | |
| Photo/image attachment to posts | Expected from Facebook/Instagram era | Low | Firebase Storage |
| Post like/reaction | Minimum engagement signal | Low | |
| Comment on posts | Conversation; absence makes it a broadcast, not community | Low | |
| User profile with avatar, bio, display name | Identity; without this, community doesn't form | Low | |
| Activity feed (see posts from followed users/channels) | Core feed loop; without this users have no reason to return | Med | Firestore real-time queries or fan-out writes |
| Notification system (likes, comments, mentions) | Return trigger; users who get no notifications never come back | High | Push notifications complex; in-app notification bell is minimum viable |
| Block/mute user | Safety; without this, harassment has no recourse | Low | |
| Account registration with email/password | Entry point | Low | Firebase Auth |
| Password reset | Users forget passwords; absence = permanent churn | Low | Firebase Auth built-in |
| Profile edit (avatar, bio, jurisdiction) | Personalization; jurisdiction is unique to this domain | Low | |

### Religious Content Platform Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Content organized by topic/category | Users look for "homilies," "liturgy," "saints" — random feed is insufficient | Med | Taxonomy of Orthodox categories needed up front |
| Trustworthiness signals | Users need to know if content is canonically sound; verified/unverified badges | Med | Core to PROJECT.md verified account system |
| Attribution (who created content, what jurisdiction) | Canonical credibility depends on source | Low | Creator profile links |
| Liturgical calendar display | Orthodox users orient around the church calendar daily | Med | Gregorian/Julian dual display; saints' feasts; fasting rules |
| Saints' lives access | Synaxarion browsing is a daily practice for many Orthodox Christians | Med | Structured data (date, name, life summary, feast type) |

---

## Differentiators

Features that set Ekklesia Agora apart from YouTube + a Facebook Group. Not universally expected, but highly valued by the target audience.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Verified clergy/teacher badge system | Trust is the #1 problem with Orthodox content online; a bishop-blessed verification process is unique | High | Requires off-platform verification workflow (email confirmation + admin approval); badge visible on all content |
| Canonical content evaluation framework | Content evaluated against OSB, Church Fathers, Synaxarion — not just user votes | High | Requires editorial policy, moderator training, possibly an advisory board; visible "canonically reviewed" tag |
| Jurisdiction-aware user profiles | Orthodox Christians strongly identify by jurisdiction (OCA, Antiochian, ROCOR, Greek, etc.); no mainstream platform surfaces this | Low | Dropdown field on profile; filter in people-finder |
| People finder by jurisdiction/location (Synodeia) | Finding nearby Orthodox Christians is a real, underserved need | Med | Requires location (city/state or coordinates); privacy controls needed |
| Orthodox Info Center (patristic library) | Searchable access to Church Fathers, liturgical texts, dogmatic writings in one place | High | Content licensing/sourcing is the hard problem; display is straightforward |
| Study guides / catechetical paths | Curated reading/viewing paths by topic (e.g., "Introduction to Orthodoxy," "Theosis," "Liturgical Life") | Med | Editorial labor-intensive but technically simple; ordered content list with descriptions |
| Fasting calendar with jurisdiction variants | Fasting rules differ by jurisdiction; a smart calendar that knows your jurisdiction is unique | Med | Data model must support rule variants; jurisdiction profile field feeds this |
| Saints of the day with detailed lives | Daily Synaxarion entry surfaced automatically on home screen | Med | Requires structured saints database; daily cron or calendar-driven display |
| Content pre-moderation queue for uploads | Unverified users' content reviewed before publication; mainstream platforms don't do this | Med | Moderation dashboard; status states (pending/approved/rejected); notifications to uploader |
| Channel pages for parishes and monasteries | Institutional presence, not just individual creators; parish can have official channel | Med | Channel creation flow; distinction between personal profile and institutional channel |
| Curated seed content from existing Orthodox sources | Platform isn't empty at launch; content from Ancient Faith Radio, OCA, monastery YouTube channels | High | Rights/permission questions; embedding vs. re-hosting; relationship-building |

---

## Anti-Features

Features to explicitly NOT build — they dilute focus, invite problems, or are already served better elsewhere.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Wiki-style community-editable articles | OrthodoxWiki already exists; competing invites comparison where we lose; editorial drift toward heresy is a moderation nightmare | Link to OrthodoxWiki where appropriate; use the Info Center as curated read-only library |
| Algorithmic recommendation engine (ML-based) | Requires massive data, ongoing ML ops, and risks amplifying controversial content; undermines the "trustworthy" brand | Use liturgical calendar, category browsing, and curated featured content as discovery; simple chronological channel feeds |
| Trending/viral content features | Virality rewards controversy and sensationalism, antithetical to Orthodox ascetic values | Feature content editorially; highlight verified creators; "feast day content" surfacing instead |
| Monetization / ads | Ads introduce misaligned incentives; religious community will distrust ad-supported platform | Donation model when blessed; subscriptions or parish memberships in future |
| Real-time live streaming | Enormous infrastructure cost; requires CDN + real-time ingest; not needed for prototype | Pre-recorded video upload only at launch; revisit after validation |
| Native mobile apps | React Native deferred to post-prototype; premature to build before web is validated | Mobile-responsive web covers 80% of mobile use cases at launch |
| AI-generated content or AI summaries | Canonically unreliable; risks producing heretical content under platform branding | Human-curated only; flag AI-generated content if users submit it |
| Polls/surveys on theological questions | Creates false sense of democracy on doctrinal matters; Orthodoxy is not democratic | Discussion threads instead; moderators can close inflammatory threads |
| Public user statistics / leaderboards | Gamification is spiritually harmful (pride, vainglory); not compatible with Orthodox anthropology | Engagement features should be functional, not competitive |
| Third-party social login (Google, Facebook) | Creates dependency on platforms whose values conflict with platform mission; data-sharing concerns | Email/password only at launch; Apple Sign-In possible later given iOS audience |

---

## Feature Dependencies

```
Account Registration → All social features (posting, commenting, DM, subscribing)
Account Registration → Video upload (unverified path)
Verified Account Badge → Free upload without moderation queue
Moderation Queue → Moderator role → Admin role hierarchy

Video Upload → Video Playback → Comments on Videos
Video Upload → Channel Page → Subscribe to Channel → Activity Feed

User Profile (jurisdiction field) → People Finder (Synodeia) filter
User Profile (jurisdiction field) → Fasting Calendar jurisdiction variants

Liturgical Calendar (feast data) → Saints of the Day display
Liturgical Calendar (feast data) → Fasting Calendar display

Orthodox Info Center (patristic texts) → Study Guides (curated paths reference Info Center items)

Content Flag/Report → Moderation Dashboard → Admin Review

Search → Video index + Post index + People index (three separate scopes)
```

---

## MVP Recommendation

For the prototype (purpose: demonstrate vision to priest/bishop for blessing):

**Must have (prototype incomplete without these):**
1. Video upload, playback, and channel pages — this is the YouTube half of the vision
2. Social feed (posts, comments, likes) — this is the Facebook half
3. Verified/unverified account tiers with moderation queue — this is the trust/safety differentiator
4. Liturgical calendar with saints of the day — demonstrates Orthodox-specific value immediately
5. User profiles with jurisdiction field — establishes the community identity dimension

**Should have (adds credibility to the demonstration):**
6. Orthodox Info Center (even with 20-30 seeded texts) — shows the research library vision
7. People finder (basic jurisdiction filter) — shows Synodeia vision
8. Content categories/taxonomy — shows the platform isn't a generic YouTube clone

**Defer post-blessing:**
- Study guides (editorial labor; build after content exists)
- Full patristic library (rights/sourcing; start with public domain Fathers)
- Push notifications (infrastructure complexity; in-app bell only)
- Direct messaging (build after community forms)
- Advanced search (start with basic keyword; Algolia later)

---

## Complexity Legend

- **Low:** 1-3 days for a solo developer familiar with the stack
- **Med:** 1-2 weeks; requires design decisions, data modeling, or integration work
- **High:** 2+ weeks; requires infrastructure decisions, external integrations, editorial policy, or significant unknowns

---

## Confidence Assessment

| Area | Confidence | Basis |
|------|------------|-------|
| Video platform table stakes | HIGH | Well-established norms from YouTube, Vimeo, Rumble; stable for years |
| Social feed table stakes | HIGH | Well-established norms from Facebook, Instagram, Twitter/X |
| Religious platform table stakes | MEDIUM | Synthesized from Ancient Faith Radio, OCN, and analogous platforms; not exhaustively surveyed |
| Differentiators | MEDIUM | Derived from gap analysis between mainstream platforms and Orthodox community needs; validated against PROJECT.md requirements |
| Anti-features | HIGH | Project explicitly rules out several (wiki, live streaming, apps); remainder are principled decisions from platform mission |
| Complexity estimates | MEDIUM | Firebase stack is well-understood; estimates assume solo developer with React/Firebase experience |

Note: External web search was unavailable during this research session. Findings rely on training knowledge (cutoff August 2025) of the platforms named. No LOW-confidence claims are presented as fact; the MEDIUM ratings above reflect the absence of live verification.

---

## Sources

- Platform analysis: YouTube feature set (training data, HIGH confidence)
- Platform analysis: Facebook/Meta social features (training data, HIGH confidence)
- Platform analysis: Rumble, Odysee — alternative video platforms (training data, MEDIUM confidence)
- Platform analysis: Ancient Faith Radio (ancientfaith.com) — Orthodox audio/video platform (training data, MEDIUM confidence)
- Platform analysis: Orthodox Christian Network (myocn.net) — Orthodox social platform (training data, MEDIUM confidence)
- Platform analysis: MeWe, Gab — niche community platforms (training data, MEDIUM confidence)
- Domain knowledge: Orthodox liturgical practice, fasting rules, jurisdictional structure (training data, HIGH confidence)
- Project context: .planning/PROJECT.md (primary, HIGH confidence)
