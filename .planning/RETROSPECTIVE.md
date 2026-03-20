# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

---

## Milestone: v1.0 — MVP

**Shipped:** 2026-03-20
**Phases:** 7 | **Plans:** 29 | **Commits:** 157

### What Was Built
- Full Byzantine authentication system with 5-tier role hierarchy (Guest → Registered → Verified → Moderator → Admin), custom Firebase claims, session cookies, and privilege escalation guards
- Agora social feed with fan-out pattern, real-time notifications (onSnapshot), OG link previews, block/mute/report moderation, and AI-assisted content categorization
- Video hub with Firebase Storage upload pipeline, HTML5 player, channel system, category/tag search, and a moderator approval console that gates all unverified uploads
- Orthodox Identity layer — live liturgical calendar from orthocal.info with Old/New Julian toggle, saints of the day, reading refs cross-linked to Scripture Library, and Synodeia people finder across 30+ canonical jurisdictions
- Dual-testament Scripture Library: full Brenton LXX (OT) + EOB NT seeded in Firestore, Byzantine reader with keyword + reference search
- Church Fathers library: 5 seeded authors, 20+ texts, topic filter, text reader, keyword search, and 4 curated study guides
- Global search aggregating all 5 content types in parallel (Promise.all), and a real-time DM system with unread badge, seen receipts, and online presence

### What Worked
- **Phase-by-phase delivery with human verification checkpoints** — each phase ended with a user-verified walkthrough before proceeding; caught real issues (AGRA-05, CAL-05/06) before they compounded
- **Wave-based plan parallelization** — data layer (Wave 0) before UI (Wave 1) before integration (Wave 2) kept dependencies clean across all 7 phases
- **Server Actions + Server Components pattern** — consistent across all phases, kept client bundles thin and mutations type-safe; no client-side Firestore reads on detail pages
- **Fan-out feed + subcollection likes** — decided in research before writing a line of code; avoided redesign later
- **Decimal phase numbering for gap closures** — 02-07, 03-06 inserted cleanly without renumbering, addressing audit gaps without disrupting the roadmap
- **Nyquist test stubs in Wave 0** — seeding test files at the start of each phase prevented zero-coverage phases and caught real issues (auth ESM mock patterns, jest 30 flag rename)

### What Was Inefficient
- **Firestore rules had to be updated multiple times** — each phase added new collections, but rules were scoped per-phase; a single rules file updated incrementally caused merge confusion on some phases
- **ESM/jest friction recurring** — firebase-admin ESM errors required jest.mock() hoisting + require() workaround in multiple phases; a shared jest setup resolving this once would have saved repeated debugging
- **orthocal.info abbreviation format not discovered until Phase 5** — the CAL-05/CAL-06 ReadingRef bug (abbreviation mismatch with Scripture book names) wasn't found until the Scripture Library was built; could have been caught earlier by cross-referencing the API response format against planned book name keys during Phase 4 research

### Patterns Established
- Server Actions for all mutations, Server Components for all data fetching — no client-side Firestore reads on page load
- Firestore security rules: `allow write: if false` for all admin-SDK-only collections (posts, videos, feed); direct writes only for user-owned data (likes, follows, profile)
- `getTokens()` in Server Component for defense-in-depth role check beyond middleware
- `onSnapshot` for real-time UI (notifications, messaging) scoped to authenticated user only
- Human verification checkpoint as the final plan in each phase before proceeding
- Wave 0 test stubs created at phase start, not after implementation

### Key Lessons
1. **Research the API format before building the consumer** — the orthocal.info abbreviation mismatch (CAL-05/06) would have been found in Phase 4 research if the ReadingRef → Scripture URL format had been cross-checked against actual API response data
2. **Mock ESM modules once, centrally** — firebase-admin jest mock pattern needed in 4+ phases; extract to `tests/setup/firebase-admin.ts` or a shared jest config to avoid repeating the workaround
3. **Fan-out decisions must be made before any social feature is coded** — changing from pull-feed to fan-out after implementing Agora would have required rewriting all social write paths; research locked this correctly
4. **Moderator bypass for delete is a day-one permission, not a feature** — AGRA-05 (moderator deletePost) was missed because moderation was scoped to video uploads; content moderation applies to all content types equally; include moderator bypass in all CRUD permissions from Phase 1

### Cost Observations
- Model mix: balanced profile throughout (Sonnet 4.6 primary, Opus 4.6 for research/planning)
- Sessions: ~20+ across 4 days
- Notable: 7 phases, 29 plans, 157 commits, 22K+ LOC in 4 days — wave-based parallelization with pre-planned PLAN.md files was the primary efficiency driver

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Commits | Phases | Key Change |
|-----------|---------|--------|------------|
| v1.0 | 157 | 7 | First milestone — established all base patterns |

### Cumulative Quality

| Milestone | Plans | LOC | Phases |
|-----------|-------|-----|--------|
| v1.0 | 29 | ~22,200 TS/TSX | 7 |

### Top Lessons (Verified Across Milestones)

1. Cross-check external API response formats against downstream consumers during research — mismatches discovered late cause gap-closure phases
2. ESM mock patterns for firebase-admin should be centralized from the start to avoid repeated workarounds
