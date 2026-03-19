# Phase 4: Orthodox Identity - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Liturgical calendar with Old Julian / New Julian toggle showing feast days, fasting periods, saints of the day (with Synaxarion summaries), and Gospel/Epistle readings — plus the Synodeia people finder (browse by jurisdiction, name search, optional city/state location sharing). Scripture Library links built as disabled stubs, activated when Phase 5 ships. No algorithmic recommendations, no social feed integration.

</domain>

<decisions>
## Implementation Decisions

### Calendar data sourcing
- **Hybrid approach**: Algorithm computes moveable feasts (Pascha and the feasts/fasts that shift with it — Paschal cycle); static seeded dataset covers fixed feasts (saints' commemorations, fixed-date major feasts)
- **Calendar systems**: ONLY Old Julian and New (Revised) Julian — NO Gregorian calendar at all
- The Old Julian calendar is currently 13 days behind the civil (Gregorian) date; the New Revised Julian aligns fixed feasts with civil dates but uses the Julian Paschalion for Pascha
- **Date display**: Show Julian dates only — no civil/Gregorian date shown alongside. Old Julian displayed as e.g. "6 March 2026 (O.S.)"; New Julian displayed as e.g. "19 March 2026"
- Researcher should find an npm library that handles Orthodox Paschal computation (Julian Paschalion, both calendar systems); if none is suitable, implement from canonical rules

### Calendar layout
- **Primary view**: Day-focused hero view — today's date at the top with all commemorations, fasting rules, and readings for that day; navigate forward/backward by day with prev/next arrows
- Structure per day (top to bottom): date header + calendar toggle, feasts (with feast rank), saints of the day, fasting rule for the day, Gospel reading reference, Epistle reading reference
- **Old/New Julian toggle**: Persists as a user profile preference in Firestore (`userProfiles`); logged-in users set it once; guests default to New Julian (most common for English-speaking Orthodox)
- **Saints of the day**: Expandable summary cards — compact card shows saint name + feast type + 2-3 sentence Synaxarion excerpt; tapping/clicking expands to full life summary inline

### Scripture Library links (CAL-07)
- Reading references stored as structured objects: `{ book: string, chapter: number, verseStart: number, verseEnd: number }` — NOT plain text strings
- Links rendered in Phase 4 as disabled/coming-soon state (e.g., grayed-out text or a "coming soon" tooltip) so the UI shows the reference without a broken link
- When Phase 5 (Scripture Library) ships, it maps this data structure to its URL scheme (e.g., `/scripture/john/3#v16`) — zero Phase 4 rework required
- CAL-07 is considered "built" in Phase 4 (references structured and rendered); it is "activated" in Phase 5

### Synodeia people finder
- **Access**: Registered users only — must be logged in to browse or search. Not a public directory.
- **Browse by jurisdiction**: Uses existing `CANONICAL_ORTHODOX_JURISDICTIONS` constant — only canonical Eastern Orthodox jurisdictions shown; non-Orthodox users (inquirers, Roman Catholics, etc.) are excluded from Synodeia
- **Member card content**: Avatar, display name, jurisdiction badge, city/state (only shown if the member has location sharing enabled)
- **Location granularity**: City + State/Region (e.g., "Atlanta, GA") — user types this when enabling location sharing; stored in `userProfiles`
- **Location privacy toggle**: On/off toggle on the profile edit page; when off, city/state field is hidden from member cards entirely; the data stays in Firestore but is not returned by Firestore rules to other users
- **Name search**: Full-text prefix match on display name (same pattern as existing video/post search)

### Claude's Discretion
- Exact Firestore rules for location privacy (how to enforce "show city only when locationSharingEnabled == true" at the rules level)
- Loading skeleton states for calendar day view and Synodeia member grid
- Exact feast rank visual treatment (Great Feast vs. ordinary commemoration vs. fast)
- Paschal algorithm implementation details (library vs. custom)
- Exact visual styling of the disabled Scripture links

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase requirements
- `.planning/REQUIREMENTS.md` — CAL-01–07 (liturgical calendar), SYN-01–04 (Synodeia); these are the acceptance criteria for this phase

### Phase scope and dependencies
- `.planning/ROADMAP.md` §"Phase 4: Orthodox Identity" — phase goal, dependency on Phase 1 only, full requirement list, suggested plan breakdown

### Prior phase patterns to follow
- `.planning/phases/01-foundation/01-CONTEXT.md` — established patterns: Byzantine aesthetic, Firebase/Firestore auth, role hierarchy
- `.planning/phases/02-social-core/02-CONTEXT.md` — userProfiles Firestore schema (calendar preference + location fields will be added here); fan-out pattern; jurisdiction constants usage
- `.planning/phases/03-video-hub-moderation/03-CONTEXT.md` — Server Component + Server Action patterns, VideoCard/CategoryFilterTabs reuse patterns

### Existing reusable code
- `src/lib/constants/jurisdictions.ts` — `CANONICAL_ORTHODOX_JURISDICTIONS` and `OTHER_CHRISTIAN_JURISDICTIONS` arrays; `getJurisdictionLabel()` helper — used for Synodeia jurisdiction filter and badge display
- `src/components/profile/JurisdictionDropdown.tsx` — jurisdiction picker; reuse or adapt for Synodeia filter
- `src/components/agora/CategoryFilterTabs.tsx` — filter tab pattern; adapt for Synodeia jurisdiction filter
- `src/components/ui/Card.tsx` — base card for Synodeia member cards and saint detail cards
- `src/lib/types/social.ts` — userProfiles type; calendar preference and location fields will be added here

No external specs — requirements are fully captured in decisions above and REQUIREMENTS.md.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `JurisdictionDropdown`: existing two-section picker (Canonical Orthodox + Other Christians); Synodeia uses only the Canonical Orthodox section for jurisdiction filter
- `CANONICAL_ORTHODOX_JURISDICTIONS`: the full list of canonical jurisdictions with id/label — directly usable as the Synodeia browse filter options
- `CategoryFilterTabs`: tab-based filter pattern; adapt for Synodeia jurisdiction tabs or pill filters
- `Card` (navy-mid bg, gold border, rounded): base for Synodeia member cards and saint summary cards
- `userProfiles` Firestore collection: already established with displayName, avatar, jurisdiction, bio fields — add `calendarPreference: 'new_julian' | 'old_julian'`, `locationSharingEnabled: boolean`, `city: string`, `stateRegion: string`

### Established Patterns
- **Server Component + Server Action**: all Firestore writes go through Server Actions; calendar and Synodeia pages follow this pattern
- **Server Component auth gating**: `getTokens()` in Server Component for role/auth checks (Synodeia is registered-only)
- **Fan-out pattern**: not directly relevant here, but notification system from Phase 2 may be leveraged if future calendar reminders are added
- **Prefix search keywords**: existing `buildVideoSearchKeywords` helper pattern can be adapted for Synodeia name search

### Integration Points
- `userProfiles` Firestore document: extend with `calendarPreference`, `locationSharingEnabled`, `city`, `stateRegion` fields
- Profile edit page (`/profile/edit`): add location sharing toggle and city/state input, plus calendar preference toggle
- Navbar: add calendar and Synodeia nav links
- Phase 5 Scripture Library: calendar reading references (`{book, chapter, verseStart, verseEnd}`) resolve to internal `/scripture/[book]/[chapter]#v[verse]` routes when Phase 5 ships

</code_context>

<specifics>
## Specific Ideas

- Old Julian date display uses "(O.S.)" suffix (Old Style) — canonically standard abbreviation
- The calendar should feel like a daily office companion, not a scheduling app — the day-focused hero reinforces this
- Synodeia is members-only intentionally: community for the faithful, not a public directory for anyone to browse Orthodox Christians
- Non-Orthodox users (inquirers, Roman Catholic, Protestant, Oriental Orthodox) do NOT appear in Synodeia browse — it is specifically for canonical Eastern Orthodox Christians finding one another by jurisdiction

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 04-orthodox-identity*
*Context gathered: 2026-03-19*
