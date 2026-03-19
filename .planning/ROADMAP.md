# Roadmap: Ekklesia Agora

## Overview

Ekklesia Agora is built in seven phases that flow from the inside out: authentication and design system first (the shell that holds everything), then social interaction (the community layer), then video with its mandatory moderation infrastructure (the content engine), then the features that make the prototype unmistakably Orthodox (liturgical calendar, people finder), then the knowledge libraries (Scripture, Fathers, study guides), and finally global search and direct messaging (discovery and connection). Each phase delivers a complete, verifiable capability. After Phase 6 the platform is ready for its blessing presentation.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Auth flows, role hierarchy, and Byzantine design system on Next.js + Firebase (completed 2026-03-18)
- [x] **Phase 2: Social Core** - User profiles, the Agora social feed, and Orthodox content categories (completed 2026-03-18)
- [ ] **Phase 3: Video Hub + Moderation** - Video upload/playback, channels, and the moderation console (ships together)
- [ ] **Phase 4: Orthodox Identity** - Liturgical calendar and Synodeia people finder — the prototype differentiators
- [ ] **Phase 5: Scripture Library** - Full Septuagint + Orthodox NT stored, searchable, and navigable
- [ ] **Phase 6: Patristic Library + Study Guides** - Church Fathers texts and curated learning paths
- [ ] **Phase 7: Discovery + Messaging** - Global search and direct messaging

## Phase Details

### Phase 1: Foundation
**Goal**: Users can securely access the platform within a fully realized Byzantine design system, with all five role tiers enforced from day one
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07, AUTH-08, DES-01, DES-02, DES-03
**Success Criteria** (what must be TRUE):
  1. A visitor can browse the site, register an account with email/password, log in, stay logged in across sessions, and log out from any page
  2. A registered user who forgets their password can reset it via email link
  3. An admin can promote another account to moderator; a super admin can create new admin accounts with configurable permissions
  4. The role hierarchy (guest → registered → moderator → admin → super admin) is enforced — lower roles cannot perform higher-role actions
  5. All pages render correctly on mobile and desktop in the Byzantine aesthetic (navy #0d1b2e, gold #c9a84c, Cinzel headings, EB Garamond body)
**Plans:** 4/4 plans complete

Plans:
- [x] 01-01-PLAN.md — Next.js 15 + Firebase project init, Tailwind v4 Byzantine theme, fonts, app shell with responsive nav, middleware
- [x] 01-02-PLAN.md — Auth flows (register, login, logout, password reset, session cookies) and reusable UI components
- [x] 01-03-PLAN.md — Role hierarchy (custom claims), Firestore security rules, admin promotion UI, guest prompt modal
- [ ] 01-04-PLAN.md — Gap closure: Fill DES-01 theme test stubs with real assertions

### Phase 2: Social Core
**Goal**: Users can build profiles, post in the Agora, interact with community content, and see a feed from the people they follow
**Depends on**: Phase 1
**Requirements**: PROF-01, PROF-02, PROF-03, PROF-04, PROF-05, PROF-06, AGRA-01, AGRA-02, AGRA-03, AGRA-04, AGRA-05, AGRA-06, AGRA-07, AGRA-08, AGRA-09, AGRA-10, CAT-01, CAT-02
**Success Criteria** (what must be TRUE):
  1. A user can set their display name, avatar, bio, and jurisdiction (or non-Orthodox category); other users can view their public profile
  2. A user can create text posts with optional photo attachments, like and comment on posts, and delete their own posts
  3. A user can see an activity feed of posts from people and channels they follow, with link preview cards on shared URLs
  4. A user receives in-app notifications (bell) for likes, comments, follows, and mentions
  5. A user can block or mute others, and can search posts by keyword
**Plans:** 8/8 plans complete

Plans:
- [ ] 02-00-PLAN.md — Wave 0: Create all 12 test stub files for Nyquist compliance
- [ ] 02-01-PLAN.md — Shared types, constants (jurisdictions, categories), Firestore/Storage rules, profile Server Actions
- [ ] 02-02-PLAN.md — Profile view page (/profile/[handle]), profile edit page, jurisdiction dropdown, avatar/banner upload
- [ ] 02-03-PLAN.md — All Server Actions: posts CRUD with fan-out, follows, likes, comments, link previews, notifications, block/mute
- [ ] 02-04-PLAN.md — Agora feed page (/agora), ComposeBox with AI category, CategoryFilterTabs, infinite scroll, PostCard
- [ ] 02-05-PLAN.md — Post detail page (/agora/[postId]), flat comment thread, comment CRUD UI
- [ ] 02-06-PLAN.md — NotificationBell (real-time), navbar integration, profile block/mute/report wiring
- [ ] 02-07-PLAN.md — Human verification checkpoint: end-to-end social flow testing

### Phase 3: Video Hub + Moderation
**Goal**: Users can upload and watch videos through verified channels, and moderators have a working console to process every pending upload before it goes live
**Depends on**: Phase 2
**Requirements**: VID-01, VID-02, VID-03, VID-04, VID-05, VID-06, VID-07, VID-08, VID-09, VID-10, VID-11, VID-12, VID-13, CHAN-01, CHAN-02, CHAN-03, CHAN-04, MOD-01, MOD-02, MOD-03, MOD-04, MOD-05
**Success Criteria** (what must be TRUE):
  1. A user can upload a video with title, description, tags, and thumbnail; an upload progress indicator is shown; unverified uploads enter a pending queue
  2. Videos play with standard controls (play/pause/seek/volume/fullscreen) on both mobile and desktop, displaying view count, duration, and upload date
  3. A user can like, comment on, share (copy link), and flag a video; they can subscribe to a channel
  4. A user or institution can create a channel page showing all their videos, subscriber count, and description; all channels are browsable
  5. A moderator can open the console, see all pending uploads and flagged content with uploader context, and approve, reject, or request changes — with the uploader notified of the outcome
**Plans:** 2/5 plans executed

Plans:
- [x] 03-01-PLAN.md — Types, Firestore/Storage rules, indexes, search keyword helper, Wave 0 test stubs
- [ ] 03-02-PLAN.md — Server Actions: video CRUD, likes, comments, channels, subscribe, moderation decisions
- [ ] 03-03-PLAN.md — Video upload flow with progress bar, channel creation UI, channel page, channel browse
- [ ] 03-04-PLAN.md — VideoCard, VideoPlayer, video browse (/videos), video detail page (/videos/[id])
- [ ] 03-05-PLAN.md — Moderation console, navbar integration, NotificationBell moderation type, human verification

### Phase 4: Orthodox Identity
**Goal**: The platform is unmistakably Orthodox — users can navigate the liturgical calendar for their tradition and find fellow Orthodox Christians by jurisdiction
**Depends on**: Phase 1
**Requirements**: CAL-01, CAL-02, CAL-03, CAL-04, CAL-05, CAL-06, CAL-07, SYN-01, SYN-02, SYN-03, SYN-04
**Success Criteria** (what must be TRUE):
  1. A user can view the liturgical calendar in either Old Julian or New/Revised Julian format, toggling between them, and see feast days with descriptions and fasting periods with rules
  2. A user can see the saint(s) of the day with life summaries and the Gospel and Epistle readings of the day, with readings linking directly to the Scripture Library
  3. A user can browse the people finder (Synodeia) by Eastern Orthodox jurisdiction and search by name
  4. A user can optionally share their city/state location for nearby member discovery and toggle location sharing on or off at any time
**Plans**: TBD

Plans:
- [ ] 04-01: Liturgical calendar data (feast days, fasts, saints, Old/New Calendar distinction, timezone-aware seed data)
- [ ] 04-02: Calendar UI (toggle, feast day descriptions, fasting rules, saints of the day, Gospel/Epistle readings, Scripture Library links)
- [ ] 04-03: Synodeia people finder (browse by jurisdiction, name search, optional location sharing with privacy toggle)

### Phase 5: Scripture Library
**Goal**: Users can read, search, and navigate the full Orthodox canon of Scripture in the Byzantine UI aesthetic
**Depends on**: Phase 1
**Requirements**: LIB-01, LIB-02, LIB-03, LIB-04, LIB-05, LIB-06
**Success Criteria** (what must be TRUE):
  1. The full Brenton's English Septuagint (OT) and Eastern Orthodox NT (Patriarchal Text) are accessible, structured by book/chapter/verse
  2. A user can search Scripture by keyword, phrase, or reference and navigate by book/chapter/verse
  3. Scripture text is rendered in the Byzantine aesthetic (EB Garamond body, Cinzel headings, navy/gold theme)
  4. The data architecture supports adding multilingual translations in the future without restructuring
**Plans**: TBD

Plans:
- [ ] 05-01: Scripture data ingestion — Brenton LXX and Orthodox NT as structured Firestore documents (book/chapter/verse)
- [ ] 05-02: Scripture reader UI — Byzantine aesthetic, book/chapter/verse navigation, keyword/reference search, multilingual architecture

### Phase 6: Patristic Library + Study Guides
**Goal**: Users can explore Church Fathers writings by author and topic, and follow curated study paths that draw from Scripture and patristic sources
**Depends on**: Phase 5
**Requirements**: PAT-01, PAT-02, PAT-03, PAT-04, PAT-05, PAT-06, STD-01, STD-02, STD-03
**Success Criteria** (what must be TRUE):
  1. A user can browse curated Church Fathers texts organized by author, with at least 20 seeded entries from public domain Ante-Nicene, Nicene, and Post-Nicene Fathers series
  2. A user can search patristic texts by topic, keyword, quote, or author, and visit individual Church Father author pages
  3. Patristic texts render in the Byzantine UI with a clean reading experience
  4. A user can view study guides (curated reading/viewing paths) organized by topic, with each guide referencing Scripture Library and Patristic Library entries in order
**Plans**: TBD

Plans:
- [ ] 06-01: Patristic data ingestion — public domain Church Fathers texts (CCEL/Project Gutenberg pre-1928 translations) as structured Firestore documents
- [ ] 06-02: Patristic library UI — author pages, browse by category/topic, search, Byzantine aesthetic reading view
- [ ] 06-03: Study guides — topic-based ordered sequences referencing Scripture and Patristic Library entries

### Phase 7: Discovery + Messaging
**Goal**: Users can find any content or person across the platform with a single search, and communicate privately with other members
**Depends on**: Phase 3
**Requirements**: SRCH-01, SRCH-02, MSG-01, MSG-02, MSG-03
**Success Criteria** (what must be TRUE):
  1. A user can enter a search query and find results across videos, posts, people, and Scripture in grouped tabs
  2. A user can send a private message to another user, view their conversation list with message previews, and read messages in chronological order
**Plans**: TBD

Plans:
- [ ] 07-01: Global search (Firestore prefix queries across videos, posts, people, Scripture) with tabbed results
- [ ] 07-02: Direct messaging (conversation list, message thread, chronological order, Firestore real-time listeners)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7
Note: Phase 4 depends only on Phase 1 (architecturally independent of social/video) and can be built after Phase 1 completes if needed.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 4/4 | Complete    | 2026-03-18 |
| 2. Social Core | 8/8 | Complete   | 2026-03-18 |
| 3. Video Hub + Moderation | 2/5 | In Progress|  |
| 4. Orthodox Identity | 0/3 | Not started | - |
| 5. Scripture Library | 0/2 | Not started | - |
| 6. Patristic Library + Study Guides | 0/3 | Not started | - |
| 7. Discovery + Messaging | 0/2 | Not started | - |
