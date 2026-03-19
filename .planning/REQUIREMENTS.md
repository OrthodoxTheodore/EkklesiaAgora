# Requirements: Ekklesia Agora

**Defined:** 2026-03-16
**Core Value:** Providing a trustworthy, canonically-grounded Eastern Orthodox Christian platform where users can find authentic content and community.

## v1 Requirements

### Authentication & Accounts

- [x] **AUTH-01**: User can create account with email and password
- [x] **AUTH-02**: User can log in and stay logged in across sessions
- [x] **AUTH-03**: User can reset password via email link
- [x] **AUTH-04**: User can log out from any page
- [x] **AUTH-05**: Guest can browse all public content without an account
- [x] **AUTH-06**: Super admin can create other admin accounts with full or limited permissions
- [x] **AUTH-07**: Only admins can promote a standard account to moderator
- [x] **AUTH-08**: Role hierarchy enforced: guest → registered → moderator → admin → super admin

### User Profiles

- [x] **PROF-01**: User can set display name, avatar, and bio
- [x] **PROF-02**: User can select Eastern Orthodox jurisdiction from dropdown (Ecumenical Patriarchate, Antiochian, ROCOR, OCA, Serbian, Bulgarian, Romanian, Georgian, Greek, Albanian, Czech/Slovak, Polish, Alexandrian, Jerusalem, Church of Cyprus, Church of Finland, etc.)
- [x] **PROF-03**: Non-Eastern Orthodox users can select: Inquirer, Roman Catholic, Protestant, or Oriental Orthodox
- [x] **PROF-04**: User can view other users' public profiles
- [x] **PROF-05**: User can edit their own profile at any time
- [x] **PROF-06**: User can upload profile photo

### Video Platform

- [x] **VID-01**: User can upload video files with title, description, tags, and thumbnail
- [x] **VID-02**: Videos play with standard controls (play/pause/seek/volume/fullscreen)
- [x] **VID-03**: Videos display view count, duration, and upload date
- [x] **VID-04**: User can like/unlike a video
- [x] **VID-05**: User can comment on a video
- [x] **VID-06**: User can share a video via copy link
- [x] **VID-07**: User can report/flag a video with reason
- [x] **VID-08**: User can subscribe/follow a channel
- [x] **VID-09**: Upload progress indicator shown during video upload
- [x] **VID-10**: Videos are mobile-responsive with adaptive playback
- [x] **VID-11**: Video search by title, description, and tags
- [x] **VID-12**: Unverified user video uploads go to moderation queue before publishing
- [x] **VID-13**: Videos organized by Orthodox content categories

### Channels

- [x] **CHAN-01**: User can create a personal channel page
- [x] **CHAN-02**: Parishes and monasteries can have institutional channel pages
- [x] **CHAN-03**: Channel page displays all videos, subscriber count, and description
- [x] **CHAN-04**: User can browse all channels

### Social Feed (The Agora)

- [x] **AGRA-01**: User can create text posts
- [x] **AGRA-02**: User can attach photos/images to posts
- [x] **AGRA-03**: User can like/unlike posts
- [x] **AGRA-04**: User can comment on posts
- [x] **AGRA-05**: User can view activity feed of posts from followed users/channels
- [x] **AGRA-06**: User can block/mute other users
- [x] **AGRA-07**: In-app notification bell for likes, comments, follows, mentions
- [x] **AGRA-08**: Link preview cards when sharing URLs in posts
- [x] **AGRA-09**: User can delete their own posts
- [x] **AGRA-10**: User can search posts by keyword

### Direct Messaging

- [ ] **MSG-01**: User can send private messages to other users
- [ ] **MSG-02**: User can view conversation list with message previews
- [ ] **MSG-03**: Messages display in chronological order within conversation

### Liturgical Calendar

- [ ] **CAL-01**: Calendar displays in both Old Julian and New/Revised Julian formats with toggle to switch
- [ ] **CAL-02**: Calendar shows feast days with descriptions
- [ ] **CAL-03**: Calendar shows fasting periods and rules
- [ ] **CAL-04**: Calendar shows saints of the day with life summaries (Synaxarion)
- [ ] **CAL-05**: Calendar shows Gospel reading of the day
- [ ] **CAL-06**: Calendar shows Epistle reading of the day
- [ ] **CAL-07**: Daily readings link directly to the Scripture Library

### Content Categories

- [x] **CAT-01**: All content (videos, posts, articles) can be tagged with Orthodox categories: Divine Liturgy, Holy Scripture, Holy Fathers, Iconography, Holy Trinity, Chanting & Music, Feast Days/Fast Days, Church History, Apologetics, Spiritual Life
- [x] **CAT-02**: Users can filter/browse content by category

### Content Moderation

- [x] **MOD-01**: Unverified user uploads enter pre-publication moderation queue
- [x] **MOD-02**: Any user can flag/report content with reason
- [ ] **MOD-03**: Moderator dashboard shows pending uploads and flagged content
- [x] **MOD-04**: Moderators can approve, reject, or request changes on queued content
- [x] **MOD-05**: Users receive notification of moderation decisions on their content

### Scripture Library

- [ ] **LIB-01**: Full Brenton's English Septuagint (OT) stored as structured machine-readable data (book/chapter/verse)
- [ ] **LIB-02**: Full Eastern Orthodox Bible NT (Patriarchal Text) stored as structured machine-readable data
- [ ] **LIB-03**: Scripture text rendered in Byzantine UI aesthetic (EB Garamond body, Cinzel headings, navy/gold theme)
- [ ] **LIB-04**: User can search Scripture by keyword, phrase, or reference
- [ ] **LIB-05**: User can navigate Scripture by book/chapter/verse
- [ ] **LIB-06**: Architecture supports future multilingual translations (French, German, Spanish, Greek, Russian, Arabic, Romanian, Georgian)

### Patristic Library (Info Center)

- [ ] **PAT-01**: Curated selections of essential Church Fathers writings stored as structured data
- [ ] **PAT-02**: Texts sourced from public domain Ante-Nicene, Nicene, and Post-Nicene Fathers series
- [ ] **PAT-03**: User can search patristic texts by topic, keyword, quote, or author
- [ ] **PAT-04**: User can browse by Church Father (author pages)
- [ ] **PAT-05**: Recommended reading lists curated by topic
- [ ] **PAT-06**: Rendered in Byzantine UI with clean reading experience

### Study Guides

- [ ] **STD-01**: Curated reading/viewing paths organized by topic (e.g., Introduction to Orthodoxy, Theosis, Liturgical Life, Prayer)
- [ ] **STD-02**: Study guides reference Scripture Library and Patristic Library entries
- [ ] **STD-03**: Study guides display as ordered content sequences with descriptions

### People Finder (Synodeia)

- [ ] **SYN-01**: User can browse members by Eastern Orthodox jurisdiction
- [ ] **SYN-02**: User can search for members by name
- [ ] **SYN-03**: User can optionally share location (city/state level) for nearby member discovery
- [ ] **SYN-04**: Location sharing has privacy toggle (on/off)

### Search

- [ ] **SRCH-01**: Global search across videos, posts, people, and Scripture
- [ ] **SRCH-02**: Search results grouped by type with tabs

### Design & Platform

- [x] **DES-01**: Byzantine aesthetic maintained (navy #0d1b2e, gold #c9a84c, Cinzel/EB Garamond typography)
- [x] **DES-02**: Fully mobile-responsive web design
- [x] **DES-03**: Architecture supports future React Native mobile apps sharing code

## v2 Requirements

### Notifications (Enhanced)

- **NOTF-01**: Push notifications via browser
- **NOTF-02**: Email notifications for key events (new followers, comments on own content)
- **NOTF-03**: User can configure notification preferences

### Multilingual Support

- **LANG-01**: Full UI translation into French, German, Spanish, Greek, Russian, Arabic, Romanian, Georgian
- **LANG-02**: Scripture Library available in multiple translations/languages

### Advanced Video

- **AVID-01**: Production video pipeline (Mux or equivalent) for HLS adaptive streaming
- **AVID-02**: Auto-generated video thumbnails
- **AVID-03**: Live streaming capability for liturgical services

### Donation System

- **DON-01**: Donation-based funding mechanism
- **DON-02**: 501(c)(3) integration when nonprofit established

### Key Liturgical Texts

- **LITX-01**: Full text of Divine Liturgy of St. John Chrysostom
- **LITX-02**: Full text of Vespers, Matins, and other services
- **LITX-03**: Complete Synaxarion with full saint lives

## Out of Scope

| Feature | Reason |
|---------|--------|
| Wiki-style community articles | OrthodoxWiki already exists; avoid competition |
| ML-based algorithmic recommendation | Requires massive data, risks amplifying controversy, undermines trust |
| Trending/viral content features | Virality rewards sensationalism, antithetical to Orthodox values |
| Monetization / ads | Misaligned incentives; religious community distrusts ad-supported platforms |
| Native mobile apps | Deferred to post-prototype; mobile-responsive web covers 80% of use cases |
| AI-generated content | Canonically unreliable; risks heretical content under platform branding |
| Polls on theological questions | Creates false democracy on doctrinal matters; Orthodoxy is not democratic |
| Public leaderboards/gamification | Spiritually harmful (pride, vainglory); incompatible with Orthodox anthropology |
| Third-party social login (Google/Facebook) | Dependency on platforms with conflicting values; data-sharing concerns |
| NKJV Bible text | Copyrighted by Thomas Nelson; requires commercial license for full embedding |
| Catena Bible app data | Founded by Oriental (Coptic) Orthodox; theological curation reflects different tradition |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 1 | Complete |
| AUTH-04 | Phase 1 | Complete |
| AUTH-05 | Phase 1 | Complete |
| AUTH-06 | Phase 1 | Complete |
| AUTH-07 | Phase 1 | Complete |
| AUTH-08 | Phase 1 | Complete |
| DES-01 | Phase 1 | Complete |
| DES-02 | Phase 1 | Complete |
| DES-03 | Phase 1 | Complete |
| PROF-01 | Phase 2 | Complete |
| PROF-02 | Phase 2 | Complete |
| PROF-03 | Phase 2 | Complete |
| PROF-04 | Phase 2 | Complete |
| PROF-05 | Phase 2 | Complete |
| PROF-06 | Phase 2 | Complete |
| AGRA-01 | Phase 2 | Complete |
| AGRA-02 | Phase 2 | Complete |
| AGRA-03 | Phase 2 | Complete |
| AGRA-04 | Phase 2 | Complete |
| AGRA-05 | Phase 2 | Complete |
| AGRA-06 | Phase 2 | Complete |
| AGRA-07 | Phase 2 | Complete |
| AGRA-08 | Phase 2 | Complete |
| AGRA-09 | Phase 2 | Complete |
| AGRA-10 | Phase 2 | Complete |
| CAT-01 | Phase 2 | Complete |
| CAT-02 | Phase 2 | Complete |
| VID-01 | Phase 3 | Complete |
| VID-02 | Phase 3 | Complete |
| VID-03 | Phase 3 | Complete |
| VID-04 | Phase 3 | Complete |
| VID-05 | Phase 3 | Complete |
| VID-06 | Phase 3 | Complete |
| VID-07 | Phase 3 | Complete |
| VID-08 | Phase 3 | Complete |
| VID-09 | Phase 3 | Complete |
| VID-10 | Phase 3 | Complete |
| VID-11 | Phase 3 | Complete |
| VID-12 | Phase 3 | Complete |
| VID-13 | Phase 3 | Complete |
| CHAN-01 | Phase 3 | Complete |
| CHAN-02 | Phase 3 | Complete |
| CHAN-03 | Phase 3 | Complete |
| CHAN-04 | Phase 3 | Complete |
| MOD-01 | Phase 3 | Complete |
| MOD-02 | Phase 3 | Complete |
| MOD-03 | Phase 3 | Pending |
| MOD-04 | Phase 3 | Complete |
| MOD-05 | Phase 3 | Complete |
| CAL-01 | Phase 4 | Pending |
| CAL-02 | Phase 4 | Pending |
| CAL-03 | Phase 4 | Pending |
| CAL-04 | Phase 4 | Pending |
| CAL-05 | Phase 4 | Pending |
| CAL-06 | Phase 4 | Pending |
| CAL-07 | Phase 4 | Pending |
| SYN-01 | Phase 4 | Pending |
| SYN-02 | Phase 4 | Pending |
| SYN-03 | Phase 4 | Pending |
| SYN-04 | Phase 4 | Pending |
| LIB-01 | Phase 5 | Pending |
| LIB-02 | Phase 5 | Pending |
| LIB-03 | Phase 5 | Pending |
| LIB-04 | Phase 5 | Pending |
| LIB-05 | Phase 5 | Pending |
| LIB-06 | Phase 5 | Pending |
| PAT-01 | Phase 6 | Pending |
| PAT-02 | Phase 6 | Pending |
| PAT-03 | Phase 6 | Pending |
| PAT-04 | Phase 6 | Pending |
| PAT-05 | Phase 6 | Pending |
| PAT-06 | Phase 6 | Pending |
| STD-01 | Phase 6 | Pending |
| STD-02 | Phase 6 | Pending |
| STD-03 | Phase 6 | Pending |
| SRCH-01 | Phase 7 | Pending |
| SRCH-02 | Phase 7 | Pending |
| MSG-01 | Phase 7 | Pending |
| MSG-02 | Phase 7 | Pending |
| MSG-03 | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 82 total
- Mapped to phases: 82
- Unmapped: 0

---
*Requirements defined: 2026-03-16*
*Last updated: 2026-03-16 after roadmap creation — traceability populated*
