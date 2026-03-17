# Ekklesia Agora

## What This Is

Ekklesia Agora is the YouTube/Facebook of the Orthodox Christian online world — a platform where inquirers and Orthodox Christians can access reliable, trustworthy content and engage in a safe social community. It combines video sharing with an algorithmic feed, social media features, and a document research section, all grounded in canonical Eastern Orthodox tradition. The platform serves as a digital sacred gathering place ("The Assembly of the Marketplace") for the faithful.

## Core Value

Providing a trustworthy, canonically-grounded Orthodox Christian platform where users can find authentic content and community — verified against the Orthodox Study Bible, the Synaxarion, the Gospels, the Apostles, liturgical texts, and the writings of the Church Fathers.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Video sharing platform with algorithmic content feed (YouTube-like)
- [ ] Social media feed with posts, comments, likes, photo sharing (Facebook-like)
- [ ] User authentication with email/password and account management
- [ ] User profiles with avatar, jurisdiction, bio, and activity
- [ ] Content moderation system with verified/unverified account tiers
- [ ] Verified accounts (clergy, known teachers) post freely; unverified uploads require moderator approval
- [ ] Admin and moderator roles for content oversight
- [ ] Community flagging system for content review
- [ ] Liturgical calendar with Gregorian/Julian dates, feasts, fasts, and saints
- [ ] Orthodox Info Center — searchable library of Church Fathers, liturgical texts by topic/keyword/author
- [ ] Study guides — curated reading paths and study materials organized by topic
- [ ] Channel system for content creators (parishes, monasteries, teachers)
- [ ] Direct messaging between users
- [ ] People finder (Synodeia) — discover members by jurisdiction, location
- [ ] Video upload and streaming capability (not just YouTube embeds)
- [ ] Search across videos, posts, and people
- [ ] Mobile-responsive web design
- [ ] Browse content without account; account required to post/comment/interact
- [ ] Seed platform with curated existing Orthodox content alongside user uploads

### Out of Scope

- Wiki-style community articles — already exists elsewhere, don't want to compete
- Native mobile apps (iOS/Android) — future milestone after web prototype is validated
- Donation/payment processing — future milestone after blessing and funding secured
- 501(c)(3) nonprofit setup — organizational, not technical
- Real-time video streaming/live services — future milestone
- AI-powered content moderation — start with human moderators

## Context

**Origin:** This project is being built to present to the creator's priest and bishop for blessing to proceed at full scale. The immediate goal is a working prototype that demonstrates the full vision — not a production launch.

**Existing assets:**
- HTML/CSS mockup (index.html) built on a free Claude account — establishes the visual design language (navy/gold Byzantine aesthetic, Cinzel/EB Garamond typography, Orthodox iconographic elements)
- Firebase project already configured (ekklesia-agora) with Auth and Firestore
- Brand image (Ekklesia_Agora.jpg) — Byzantine church illustration used as logo
- Working social features (posts, comments, likes) and YouTube embed integration in the mockup

**Content foundation:** All platform content is evaluated against canonical Orthodox sources:
- Orthodox Study Bible
- The Synaxarion (lives of saints)
- The Gospels and Apostolic writings
- Liturgical texts (not limited to Biblical texts alone)
- Writings of the Church Fathers

**Content sourcing:** Both curated (existing Orthodox YouTube channels, monastery content) and user-uploaded content from the start.

**User tiers:**
- Guest: Browse videos, read posts, search content
- Registered user (unverified): Post in Agora, comment, DM — video uploads require moderator approval
- Verified user (clergy, known teachers): Post and upload freely, content can still be flagged
- Moderator: Review flagged content and pending uploads
- Admin: Full platform management

**Budget:** Minimal funds — tech stack must be cost-effective. Firebase free tier as starting point.

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
| Build on React/Next.js instead of single-file HTML | Single-file HTML doesn't scale; React enables component reuse, proper routing, and future React Native mobile apps | — Pending |
| Keep Firebase as backend | Already configured, free tier is generous, handles auth/database/storage; can be replaced later if needed | — Pending |
| Verified/unverified account tiers for moderation | Balances content quality (canonical integrity) with community growth; clergy post freely, others moderated | — Pending |
| Web-first, mobile later | Demonstrates full vision for blessing/pitch; React Native shares code when ready | — Pending |
| No wiki-style content | Orthodox Wiki already exists; avoid competition, focus on video + social + research library | — Pending |

---
*Last updated: 2026-03-16 after initialization*
