# Ekklesia Agora

## What This Is

Ekklesia Agora is the YouTube/Facebook of the Orthodox Christian online world — a platform where inquirers and Orthodox Christians can access reliable, trustworthy content and engage in a safe social community. It combines video sharing with an algorithmic feed, social media features, a Scripture library, Church Fathers texts, liturgical calendar, and people finder, all grounded in canonical Eastern Orthodox tradition. The platform serves as a digital sacred gathering place ("The Assembly of the Marketplace") for the faithful.

## Core Value

Providing a trustworthy, canonically-grounded Orthodox Christian platform where users can find authentic content and community — verified against the Orthodox Study Bible, the Synaxarion, the Gospels, the Apostles, liturgical texts, and the writings of the Church Fathers.

## Requirements

### Validated — v1.0 MVP

- ✓ User authentication with email/password and account management — v1.0
- ✓ Byzantine design system (Navy/Gold, Cinzel/EB Garamond) — v1.0
- ✓ User profiles with avatar, jurisdiction, bio, and activity — v1.0
- ✓ Social media feed with posts, comments, likes, photo sharing — v1.0
- ✓ Content moderation system with verified/unverified account tiers — v1.0
- ✓ Video sharing platform with algorithmic content feed — v1.0
- ✓ Channel system for content creators (parishes, monasteries, teachers) — v1.0
- ✓ Orthodox Info Center — Church Fathers searchable library — v1.0
- ✓ Study guides — curated reading paths and study materials — v1.0
- ✓ Liturgical calendar with Gregorian/Julian dates, feasts, fasts, and saints — v1.0
- ✓ People finder (Synodeia) — discover members by jurisdiction, location — v1.0
- ✓ Scripture library (Brenton LXX OT + EOB NT) — searchable, navigable, with Byzantine reader — v1.0
- ✓ Global search across videos, posts, people, Scripture, and Church Fathers — v1.0
- ✓ Direct messaging between users with real-time threads, unread badges, seen receipts, online presence — v1.0

### Active

*(v1.0 complete — define next milestone requirements with `/gsd:new-milestone`)*

### Out of Scope

- Wiki-style community articles — already exists elsewhere, don't want to compete
- Native mobile apps (iOS/Android) — future milestone after web prototype is validated
- Donation/payment processing — future milestone after blessing and funding secured
- 501(c)(3) nonprofit setup — organizational, not technical
- Real-time video streaming/live services — future milestone
- AI-powered content moderation — start with human moderators

## Context

**Shipped:** v1.0 MVP — 2026-03-20. All 7 phases and 29 plans delivered in 4 days.

**Codebase state:** ~22,200 LOC TypeScript/TSX across 306 files. Tech stack: Next.js 15, Tailwind CSS v4, Firebase (Auth, Firestore, Storage), orthocal.info API for liturgical calendar.

**What was built:**
- Authentication with 5-tier role system (Guest, Registered, Verified, Moderator, Admin)
- Agora social feed: posts, likes, comments, follows, real-time notifications, block/mute/report, link previews, fan-out feed pattern
- Video hub: channel creation, video upload to Firebase Storage, HTML5 player, category/search browse, moderation approval queue
- Orthodox Identity: live liturgical calendar (Old/New Julian toggle), Synodeia people finder across 30+ canonical jurisdictions
- Scripture Library: full Brenton LXX (OT) + EOB NT seeded in Firestore, Byzantine reader with keyword + reference search, cross-linked reading refs
- Church Fathers library: 5 authors and 20+ texts seeded, topic-filtered browse, text reader, study guides
- Global search: aggregates videos, posts, people, Scripture, Church Fathers via Promise.all
- Direct messaging: Firestore conversations, real-time onSnapshot threads, unread badge, seen receipts, online presence

**Known gaps (from v1.0 audit):**
- AGRA-05: Moderator bypass for deletePost not implemented — moderators cannot delete others' posts
- CAL-05/CAL-06: Scripture abbreviation mismatch in orthocal.info reading refs may produce broken links for some books
- VID-12: Full-text video search across all channels not implemented; search limited to title/tags/channel
- CHAN-03: VideoCard not wired into channel detail page — channel page shows upload UI but not video grid

**Next step:** Present prototype to priest and bishop for blessing. Then define v1.1 requirements targeting the known gaps and any feedback received.

**Content foundation:** All platform content evaluated against canonical Orthodox sources:
- Orthodox Study Bible
- The Synaxarion (lives of saints)
- The Gospels and Apostolic writings
- Liturgical texts
- Writings of the Church Fathers

**User tiers:**
- Guest: Browse videos, read posts, search content
- Registered user (unverified): Post in Agora, comment, DM — video uploads require moderator approval
- Verified user (clergy, known teachers): Post and upload freely, content can still be flagged
- Moderator: Review flagged content and pending uploads
- Admin: Full platform management

**Budget:** Minimal funds — Firebase free tier as starting point.

## Constraints

- **Budget**: Minimal funds available — must use free-tier services where possible (Firebase free tier, open-source tools)
- **Tech stack**: Must scale from prototype to production without rewrite — React/Next.js for web, React Native for future mobile, Firebase for backend services
- **Design**: Must maintain the existing Byzantine aesthetic (navy #0d1b2e, gold #c9a84c, Cinzel/EB Garamond typography) established in the HTML mockup
- **Content integrity**: All content categories and features must align with canonical Eastern Orthodox tradition
- **Platform**: Web-first (responsive), with architecture that supports future mobile apps sharing code
- **Video**: Must support actual video upload and streaming, not just YouTube embeds

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Build on React/Next.js instead of single-file HTML | Single-file HTML doesn't scale; React enables component reuse, proper routing, and future React Native mobile apps | ✓ Good — enabled clean phase-by-phase delivery; component reuse across pages was significant |
| Keep Firebase as backend | Already configured, free tier is generous, handles auth/database/storage; can be replaced later if needed | ✓ Good — free tier held throughout v1.0; Firestore security rules provided clean access control |
| Verified/unverified account tiers for moderation | Balances content quality (canonical integrity) with community growth; clergy post freely, others moderated | ✓ Good — moderation console ships as Phase 3 core, not afterthought |
| Web-first, mobile later | Demonstrates full vision for blessing/pitch; React Native shares code when ready | ✓ Good — prototype complete and ready for presentation |
| No wiki-style content | Orthodox Wiki already exists; avoid competition, focus on video + social + research library | ✓ Good — differentiation is clear; platform fills real gaps |
| Fan-out feed pattern for Agora | Firestore read costs outweigh write costs at scale; fan-out keeps feed reads cheap | ✓ Good — clean feed query on home and profile pages |
| Server Actions for all mutations | Next.js 15 App Router pattern; keeps client bundles thin, mutations type-safe | ✓ Good — consistent pattern across all phases |
| Likes as subcollections, not field arrays | Avoids document size limits; enables efficient per-user like queries | ✓ Good — scales without redesign |
| orthocal.info API for liturgical calendar | Authoritative Eastern Orthodox API; covers both Old and New Julian calendars, feasts, fasts, saints | ⚠️ Revisit — abbreviation format mismatch with Scripture Library causes some broken ReadingRef links (CAL-05/CAL-06) |
| Decimal phase numbering for gap-closure phases | Allows inserting urgent gap-closure work between delivered phases without renumbering | ✓ Good — 03-06 and 02-07 gap closures integrated cleanly |

---
*Last updated: 2026-03-20 after v1.0 milestone*
