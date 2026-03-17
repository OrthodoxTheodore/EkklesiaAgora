# Project Research Summary

**Project:** Ekklesia Agora
**Domain:** Orthodox Christian video-sharing + social media + patristic research library
**Researched:** 2026-03-16
**Confidence:** MEDIUM-HIGH (stack HIGH, features HIGH, architecture MEDIUM, pitfalls MEDIUM-HIGH)

## Executive Summary

Ekklesia Agora is a rare hybrid: part YouTube, part Facebook, part digital library — built specifically for the Orthodox Christian community. Research confirms this class of platform is technically well-understood (Firebase + Next.js social platforms are documented territory), but the domain layer introduces unique complexity around jurisdictional politics, canonical content integrity, liturgical data accuracy, and a blessing-dependent release gate. The recommended approach is a Firebase-first monolith (Next.js 15 App Router + Firestore + Firebase Auth + Firebase App Hosting) that leverages the existing `ekklesia-agora` Firebase project. The prototype delivers enough to earn a bishop's blessing; production-grade video infrastructure (Mux) and full-text search (Algolia) are deferred, but their migration paths are designed in from day one.

The single most important architectural decision is the Firestore data model — specifically the feed fan-out pattern and like subcollections. This must be designed before writing the first feature. Getting it wrong after data exists is a painful migration. The second most important decision is the video pipeline: Firebase Storage is acceptable for the prototype demo but must never be treated as a production video CDN. Both decisions are well-understood and the right patterns are documented. The prototype goal (demonstrate vision to clergy for blessing) is achievable within Firebase's free Spark tier if demo prep follows the precautions identified in research.

The primary non-technical risk is jurisdictional balance: an Orthodox platform that appears to favor one jurisdiction will fail to earn the broad canonical endorsement it needs. Seed content, verification decisions, and moderation calls must be jurisdiction-neutral from day one. Legal groundwork (DMCA agent registration, content policy) must precede any user-uploaded content — even in prototype form shown to clergy. The platform's differentiating value (verified clergy badges, canonical content evaluation, liturgical calendar, patristic library) is what separates it from "just use YouTube + a Facebook group" and must be present in the prototype to communicate the vision clearly.

---

## Key Findings

### Recommended Stack

The stack is entirely Firebase-native with Next.js 15 as the full-stack framework. The existing `ekklesia-agora` Firebase project with Auth and Firestore already configured is a strong anchor — do not migrate to another backend. Firebase App Hosting is the confirmed deployment path (listed in official Next.js deployment docs), eliminating any dependency on Vercel. Tailwind CSS v4 (CSS-first config with `@theme`) handles the Byzantine aesthetic (navy `#0d1b2e`, gold `#c9a84c`) cleanly through CSS custom properties. shadcn/ui provides accessible component primitives without imposing design opinions that would fight the custom visual language.

**Core technologies:**
- **Next.js 15 + React 19:** Full-stack framework — App Router gives SSR for SEO-critical content pages; Server Actions + `useActionState`/`useOptimistic` handle forms and optimistic UI without a state management library
- **Firebase Auth:** Identity layer — already configured; free at any scale; handles email/password, verification, and password reset
- **Firestore (Native Mode):** Primary database — real-time listeners (`onSnapshot`) power feed and DM inbox; document model fits varied content types
- **Firebase Storage:** File storage for images, avatars, and prototype-scale video — acceptable for demo, not for production video streaming
- **Firebase App Hosting:** Deployment — first-party Next.js 15 adapter, uses existing Firebase project, supports Server Actions and SSR
- **Mux (production video):** Video transcoding + HLS streaming — official Next.js recommendation via `next-video` package; swap from Firebase Storage is same component interface
- **Tailwind CSS v4:** Utility CSS with CSS-first config — maps Byzantine palette directly to CSS variables; 3-8x faster builds than v3
- **shadcn/ui + Lucide React:** Accessible unstyled primitives — Dialog, Sheet, Toast components without MUI/Chakra design system fighting the aesthetic
- **Zod + React Hook Form:** Validation — Zod is explicitly recommended in Next.js official auth docs; critical for content integrity across 5 user role tiers
- **`next/font`:** Typography — self-hosts Cinzel + EB Garamond at build time; eliminates FOUT and CLS

**Do not add:** Redux/Zustand/Jotai (React Server Components + Firestore listeners + React 19 hooks cover 95% of state needs), Vercel (adds cost without benefit), MUI/Chakra/Ant Design (fight Byzantine aesthetic).

See `.planning/research/STACK.md` for full installation commands, alternatives considered, and confidence notes per technology.

---

### Expected Features

The feature landscape covers three converging domains: video platform, social feed, and religious content platform. Each has well-established table stakes. The differentiators are what make Ekklesia Agora worth building.

**Must have (table stakes for the prototype to communicate the vision):**
- Video upload, playback, channel pages, subscribe — the YouTube half
- Social feed (text posts, photo attachments, comments, likes) — the Facebook half
- Verified/unverified account tiers with pre-moderation queue — the trust/safety differentiator that neither YouTube nor Facebook provides
- Liturgical calendar with saints of the day — the first thing that proves this is not a generic platform
- User profiles with jurisdiction field — establishes community identity

**Should have (adds demonstration credibility):**
- Orthodox Info Center (even 20-30 seeded patristic texts) — shows the research library vision
- People finder by jurisdiction (basic Synodeia) — shows the community-formation vision
- Content categories/taxonomy — proves the platform is content-aware, not just a feed

**Defer post-blessing (v2+):**
- Study guides and curated catechetical paths (editorial labor; build after content exists)
- Full patristic library (rights/sourcing; start with public domain Church Fathers)
- Push notifications (infrastructure complexity; in-app bell is sufficient for prototype)
- Direct messaging (build after community forms; also carries pastoral manipulation risks to manage)
- Algorithmic recommendations (requires content density that won't exist at launch)
- Advanced full-text search (Algolia integration; Firestore prefix queries are sufficient to demonstrate search)
- Native mobile apps (mobile-responsive web covers 80% of mobile use cases)

**Explicit anti-features (do not build):**
- Wiki-style community-editable articles (OrthodoxWiki exists; editorial drift toward heresy is a moderation nightmare)
- Algorithmic/viral recommendation engine (rewards controversy, antithetical to platform mission)
- Real-time live streaming (enormous infrastructure cost, not needed for prototype)
- Third-party OAuth (Google/Facebook login creates dependency on platforms with conflicting values)
- Ads or monetization (donation model when blessed)

See `.planning/research/FEATURES.md` for full complexity estimates and feature dependency graph.

---

### Architecture Approach

Ekklesia Agora is a monolithic frontend / Firebase backend at prototype scale. One Next.js app handles all UI surfaces; Firebase provides auth, database, storage, and serverless compute via Cloud Functions. This avoids microservice operational overhead while keeping component boundaries clean enough to extract services at scale. The architecture's most critical constraint is Firestore's NoSQL document model — everything about the data schema and query design must be planned before development begins, not discovered incrementally.

**Major components:**
1. **Auth Shell** — registration, login, session state; Firebase Auth + custom claims for role hierarchy (guest → user → verified → moderator → admin)
2. **Agora Feed** — social posts, comments, likes; Firestore real-time listeners with cursor-based pagination and fan-out write pattern for followed-user feeds
3. **Video Hub** — upload flow, video player, channel pages; Firebase Storage (prototype) → Mux (production); Cloud Functions handle upload triggers and moderation routing
4. **Moderation Console** — pending upload queue, flag review, role promotion; first-class product built alongside upload feature, not as an afterthought
5. **Info Center** — patristic library browse by author/category; Firestore documents collection; full-text search via Algolia/Typesense for production
6. **Liturgical Calendar** — feast days, fasts, saints; can be static seed data in Firestore; must be timezone-aware and support Old/New Calendar distinction
7. **Synodeia (People Finder)** — jurisdiction/location filter; state-level granularity only; opt-out required
8. **Cloud Functions** — all state transitions with side effects (video approval, role promotion, notification triggers, search indexing)

**Key patterns to follow:**
- Firestore security rules as the only server-enforced authorization boundary (client-side checks are trivially bypassed)
- Denormalize author data (name + avatar) into feed documents to avoid expensive cross-collection joins
- Fan-out-on-write for activity feeds (write to follower subcollections at post time; reads are cheap)
- Likes as subcollections (`likes/{postId}/users/{uid}`), never as arrays inside post documents
- Firebase Auth custom claims for roles (travel with JWT; no extra Firestore read per request)
- Cloud Functions for all state transitions with side effects (moderation workflow, role changes, notifications)
- Cursor-based pagination (`startAfter`) on every list query that grows over time

See `.planning/research/ARCHITECTURE.md` for full data model schema, Cloud Functions surface, and scalability considerations.

---

### Critical Pitfalls

1. **Firebase Storage is not a video platform** — Object storage has no transcoding, no HLS adaptive bitrate, no CDN. A single popular sermon at 720p will exhaust the free tier's 1GB/day download limit in hours. Decision rule: decide on video pipeline (prototype accepts raw MP4 via HTML5 `<video>`; production requires Mux or Cloudflare Stream) before building the upload UI. Never treat this as a later migration — design it in from Phase 1.

2. **Naive Firestore data model is unmigratable at scale** — Storing `likedBy: [uid1, uid2, ...]` arrays inside post documents hits the 1MB document limit and cannot be efficiently queried. "Show me posts from people I follow" requires O(n) reads per load. Design the fan-out feed pattern and like subcollections before writing the first feature. This is the highest-impact technical decision in the entire project.

3. **Moderation queue as an afterthought kills creator retention** — If uploads sit pending for days because the moderator UI was never built as a real product, legitimate content creators give up after one submission. The moderation console must ship in the same sprint as the video upload feature, not after. It needs: pending count, upload preview, uploader context, approve/reject with reason, SLA definition.

4. **Prototype demo becomes entrenched commitment** — Religious communities don't distinguish prototype from product. Once a hierarch blesses something, changing it feels like acting without blessing. Mitigation: prepare a one-page "What Will Change Before Launch" document for the blessing meeting. Lock the UI/UX design language (what they are blessing); keep the backend flexible. Use YouTube embeds for video in the prototype to avoid Firebase Storage egress during the demo.

5. **Jurisdictional politics fracture the community** — Seeding content primarily from one jurisdiction, or making moderation calls that implicitly favor one tradition, will prevent broad canonical endorsement. Seed with intentional jurisdictional balance. Content policy must benchmark against the Seven Ecumenical Councils and Holy Tradition — not any one jurisdiction's practice. This must be addressed in Phase 1, before any public content is visible.

6. **DMCA exposure from re-hosted seed content** — Informal "sure, share it" permission from a monk does not protect against takedown by a diocese or publisher that owns the rights. Register a DMCA agent with the U.S. Copyright Office ($6/year) before accepting any uploads. Use YouTube embeds for seed content (not re-hosting). This is a legal prerequisite, not an optional step.

See `.planning/research/PITFALLS.md` for full pitfall descriptions, detection signs, and phase-specific warning table.

---

## Implications for Roadmap

Based on the combined research, the architecture file's suggested build order is validated and refined into these phases:

### Phase 1: Foundation + Legal Groundwork
**Rationale:** Nothing works without authentication, Firestore schema design, and security rules. Legal prerequisites (DMCA agent registration, content policy document) must also happen before any user-visible content — even in prototype. The data model must be designed here before any feature development; it cannot be corrected cheaply later. Byzantine design system (fonts, color palette, Tailwind v4 theme) must be locked here since it is what clergy are blessing.
**Delivers:** Working Firebase project wired to Next.js 15; auth flows (register, login, password reset, session); Firestore security rules baseline; typed data model schema; DMCA agent registered; content policy drafted; design system (Cinzel/EB Garamond, Byzantine palette) implemented and tested on Android
**Addresses:** Account registration, guest browsing, mobile-responsive shell, font fallback safety (Pitfall 14)
**Avoids:** Naive Firestore schema (Pitfall 5), prototype-becomes-product (Pitfall 7), DMCA exposure (Pitfall 6), Firebase Storage video assumption (Pitfall 1)
**Research flag:** Standard patterns — no research-phase needed. Firebase Auth + Next.js 15 setup is extensively documented.

### Phase 2: Social Core (Agora Feed)
**Rationale:** Social feed has the most complex Firestore query patterns (follows, fan-out writes, likes subcollections). Building it early validates the data model before Video Hub compounds the complexity. Establishes the community interaction layer that makes everything else worth using.
**Delivers:** Post creation (text + photo), paginated feed with followed-user posts, comments, likes, user profiles (public view), block/mute
**Addresses:** All social feed table stakes from FEATURES.md
**Avoids:** Array-based likes (Pitfall 5), real-time listeners on full collections (Architecture Anti-Pattern 2)
**Research flag:** Standard patterns — fan-out feed and Firestore social patterns are canonical and well-documented.

### Phase 3: Video Hub + Moderation (Must Ship Together)
**Rationale:** Video upload and the moderation queue are a single atomic feature. Shipping upload without moderation leaves unverified content in limbo with no workflow to resolve it. Architecture research explicitly flags: "Video Hub + Moderation System → these must ship together, not separately." This phase also includes the moderation console as a first-class product.
**Delivers:** Video upload (Firebase Storage, resumable, with progress indicator), video metadata, HTML5 playback, channel pages, subscribe, moderation queue UI (pending uploads, approve/reject with reason, uploader context), moderator role, community flagging
**Addresses:** All video platform table stakes; verified/unverified upload paths; moderator console; content flag/report
**Avoids:** Moderation bottleneck killing creator retention (Pitfall 2), Firebase Storage egress during prototype (Pitfall 11 — use YouTube embeds if demo is imminent)
**Research flag:** Needs research-phase for video upload UX patterns and Firebase Storage resumable upload implementation details.

### Phase 4: Orthodox Identity Layer (Liturgical Calendar + Synodeia)
**Rationale:** This phase delivers the features that make the prototype demonstrably different from YouTube + a Facebook group. The liturgical calendar and people finder are the visual proof of the platform's unique value during the blessing presentation. They are architecturally standalone (no dependencies on Agora or Video Hub) but must exist in the prototype.
**Delivers:** Liturgical calendar (feast days, fasts, saints of the day, Old/New Calendar distinction, timezone-aware), people finder by jurisdiction (Synodeia, state-level granularity, opt-out), content categories/taxonomy
**Addresses:** Religious platform table stakes; jurisdiction-aware profiles; Synodeia vision
**Avoids:** Single-jurisdiction calendar data (Pitfall 8), timezone-naive date rendering (Pitfall 15), people finder stalking risk (Pitfall 13)
**Research flag:** Needs research-phase for liturgical calendar data sourcing (OCA.org, ROCOR calendar) and structured saints database schema.

### Phase 5: Patristic Library (Info Center)
**Rationale:** Even a small seeded Info Center (20-30 texts) communicates the research library vision during the blessing presentation. This phase is architecturally independent and can be built in parallel with Phase 4. Content sourcing (public domain Church Fathers) is the main challenge, not the technology.
**Delivers:** Document library (browse by author, category, topic), basic search by author/category field queries, 20-50 seeded patristic texts from public domain sources
**Addresses:** Orthodox Info Center differentiator; study guide foundation
**Avoids:** Copyright exposure (use public domain pre-1927 translations; Project Gutenberg, CCEL)
**Research flag:** Needs research-phase for public domain patristic text sources and structured data schema for the Synaxarion.

### Phase 6: Prototype Polish + Blessing Preparation
**Rationale:** Before presenting to clergy, the prototype needs a content seeding sprint, demo preparation (pre-cached data, YouTube embeds for video to avoid Storage egress), and a "What Will Change Before Launch" one-pager. This is not a feature phase — it is a quality gate.
**Delivers:** Jurisdictionally balanced seed content (target 50+ items across categories and jurisdictions), demo environment configured, blessing presentation materials, "What Will Change Before Launch" document
**Addresses:** Content seeding prerequisite (Pitfall 3), prototype-becomes-product framing (Pitfall 7), jurisdictional balance (Pitfall 4)
**Avoids:** Firebase free tier exhaustion during demo (Pitfall 11)
**Research flag:** No research-phase needed — this is execution and preparation work.

### Phase 7: Post-Blessing Production Hardening (After Blessing Granted)
**Rationale:** After the blessing, migrate from prototype-grade to production-grade infrastructure. This is the phase where Mux replaces Firebase Storage for video, Algolia or Typesense is integrated for full-text search, and the Firestore schema is stress-tested with real user data.
**Delivers:** Mux video pipeline (transcoding + HLS + `next-video` component swap), full-text search (Algolia with Firebase Extension or Typesense), notification system (in-app bell minimum), advanced moderation tooling, Firebase Blaze plan upgrade
**Addresses:** Production video quality, search across all entity types
**Avoids:** Firebase Storage video limitations at scale (Pitfall 1), Firestore full-text search gap (Pitfall 9)
**Research flag:** Needs research-phase for Mux pricing verification and Algolia/Typesense Firebase integration patterns.

### Phase 8: Community Expansion (Post-Launch)
**Rationale:** Direct messaging, study guides, and push notifications are deferred because they require an existing community to be useful and carry risks (DM pastoral manipulation, notification infrastructure complexity) that are best addressed after the platform has demonstrated viability.
**Delivers:** Direct messaging (with mutual-follow default and block/report), study guides (curated reading/viewing paths), push notifications, advanced people finder, Channel pages for parishes/monasteries
**Addresses:** DM feature (with Pitfall 12 safeguards), study guide editorial workflow
**Avoids:** DM weaponization for spiritual manipulation (Pitfall 12 — mutual-follow default, privacy controls)
**Research flag:** Standard patterns for DM at this scale. Push notifications may need research-phase depending on chosen provider (FCM vs. web push).

---

### Phase Ordering Rationale

- **Foundation before everything:** Firestore schema is the most consequential decision in the project. Changing it after data exists is expensive and politically complicated. It must be locked in Phase 1.
- **Social before video:** Agora Feed has the most complex Firestore query patterns. Validating them on posts (lower stakes, simpler schema) before Video Hub compounds the complexity reduces rework risk.
- **Video and moderation are atomic:** The architecture research explicitly states these must ship together. Splitting them creates a broken half-feature that damages creator trust from the start.
- **Orthodox identity layer before blessing:** Liturgical calendar and Synodeia are what distinguish this from a generic social platform. Clergy must see these in the prototype or the blessing presentation fails to communicate the vision.
- **Content seeding as a dedicated phase:** Research identifies insufficient content density as a pitfall that renders the platform feel dead. A dedicated seeding sprint with an SLA (target content count by jurisdiction and category) is the mitigation.
- **Production hardening deferred until after blessing:** Mux, Algolia, push notifications, and DM are all post-blessing. They would add weeks of development before validation. The prototype goal is the blessing; the production goal is after.

---

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3 (Video Hub):** Firebase Storage resumable upload API specifics, `next-video` component integration with Firebase Storage URLs, video metadata extraction options
- **Phase 4 (Liturgical Calendar):** Authoritative data sources for Old/New Calendar saints and feasts; structured Synaxarion databases; whether usable APIs exist (OCA.org, etc.)
- **Phase 5 (Info Center):** Public domain patristic text sources (CCEL, Project Gutenberg Orthodox texts); structured data schema for Church Fathers library
- **Phase 7 (Production Hardening):** Mux pricing verification; Algolia Firebase Extension setup; Typesense self-hosting vs. cloud decision

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** Next.js 15 + Firebase Auth setup is extensively documented with official guides
- **Phase 2 (Social Feed):** Fan-out feed pattern and Firestore social patterns are canonical and well-documented
- **Phase 6 (Blessing Preparation):** Execution work, no research needed
- **Phase 8 (DM/Study Guides):** Standard Firestore real-time messaging patterns; well-documented

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Core stack (Next.js 15, React 19, Tailwind v4, Firebase) verified against official sources. Mux pricing is MEDIUM — not independently verified. shadcn/ui version is MEDIUM — use `npx shadcn@latest` at install time. |
| Features | HIGH | Video platform and social feed table stakes are well-established norms (YouTube, Facebook). Religious platform features are MEDIUM — synthesized from Ancient Faith Radio, OCN, domain knowledge. Anti-features are HIGH — principled decisions from platform mission. |
| Architecture | MEDIUM | Core Firebase + Next.js patterns are well-documented. Firebase Storage range-request behavior for prototype video is MEDIUM. Cloud Functions timeout limits and 2nd-gen runtime specifics should be verified against current Firebase docs. |
| Pitfalls | MEDIUM-HIGH | Firebase Storage limits and Firestore full-text search gap are HIGH (official docs). Jurisdictional politics and moderation workflow pitfalls are MEDIUM (ecclesial knowledge + niche platform post-mortems). DMCA safe harbor is HIGH (stable U.S. law). |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- **Mux pricing:** Not independently verified due to web access limitations during research. Verify at mux.com/pricing before committing to production video plan. Cloudflare Stream and Bunny.net are documented alternatives if Mux pricing is prohibitive.
- **Algolia free tier:** 10K searches/month and 10K records cited from training knowledge. Verify at algolia.com/pricing before building Algolia integration. Typesense self-hosted is the fallback with no per-query cost.
- **Firebase App Hosting maturity:** Listed in official Next.js deployment docs, but it is a relatively new product (2024). Verify current feature parity with Vercel for Server Actions and edge middleware before committing to deployment strategy.
- **Liturgical calendar data sources:** Research identified OCA.org and ROCOR calendar as sources but could not verify whether structured data APIs or downloadable datasets exist. This is the primary unknown for Phase 4 — resolve early.
- **Cloud Functions 2nd-gen vs. 1st-gen:** 2nd-gen has longer timeouts and better cold start performance but different configuration. Verify which generation is appropriate for the upload trigger and moderation workflow functions.
- **Content rights for seed content:** Even public domain patristic texts may have translation-level copyright (a 2005 translation of St. John Chrysostom is not public domain). Resolve text sourcing strategy (use pre-1928 translations from CCEL/Project Gutenberg) before Phase 5.

---

## Sources

### Primary (HIGH confidence — official sources verified)
- Next.js 15 Release Blog: https://nextjs.org/blog/next-15
- Next.js Video Guide: https://nextjs.org/docs/app/guides/videos
- Next.js Authentication Guide: https://nextjs.org/docs/app/guides/authentication
- Next.js Deployment Options: https://nextjs.org/docs/app/getting-started/deploying (confirms Firebase App Hosting)
- React 19 Release Blog: https://react.dev/blog/2024/04/25/react-19
- Tailwind CSS v4 Release: https://tailwindcss.com/blog/tailwindcss-v4
- DMCA Safe Harbor (17 USC 512): https://www.copyright.gov/dmca/

### Secondary (MEDIUM confidence — training knowledge, stable patterns)
- Firebase Firestore data modeling: https://firebase.google.com/docs/firestore/solutions/aggregation
- Firestore full-text search limitation: https://firebase.google.com/docs/firestore/solutions/search
- Mux for Next.js: https://www.mux.com/for/nextjs (cited in official Next.js docs)
- next-video package: https://next-video.dev/docs
- Platform analysis: YouTube, Facebook, Ancient Faith Radio, Orthodox Christian Network (training data)
- Orthodox jurisdictional structure and ecclesiology (training data, HIGH confidence for domain knowledge)

### Tertiary (LOW confidence — needs verification before implementation)
- Mux pricing: https://www.mux.com/pricing — not verified during research session
- Algolia pricing/free tier: https://www.algolia.com/pricing — not verified during research session
- Firebase App Hosting current feature parity: https://firebase.google.com/docs/app-hosting — verify against current docs before deploying

---
*Research completed: 2026-03-16*
*Ready for roadmap: yes*
