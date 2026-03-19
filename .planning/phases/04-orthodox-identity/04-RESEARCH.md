# Phase 4: Orthodox Identity - Research

**Researched:** 2026-03-19
**Domain:** Orthodox liturgical calendar computation, external calendar API integration, Firestore location privacy, Synodeia people finder
**Confidence:** HIGH (core stack verified against live sources and installed package inspection)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **Calendar data**: Hybrid — algorithm computes moveable feasts (Paschal cycle); static seeded dataset covers fixed feasts and saints' commemorations.
- **Calendar systems**: ONLY Old Julian and New (Revised) Julian. NO Gregorian calendar shown to users at all.
- **Date display**: Julian dates only. Old Julian shown as "6 March 2026 (O.S.)"; New Julian shown as "19 March 2026".
- **Primary view**: Day-focused hero view — today's date at top with commemorations, fasting, readings; prev/next day arrows.
- **Day structure**: date header + calendar toggle → feasts (with rank) → saints of the day → fasting rule → Gospel reference → Epistle reference.
- **Calendar toggle**: Persists as `calendarPreference: 'new_julian' | 'old_julian'` in `userProfiles` Firestore document. Guests default to `new_julian`.
- **Saints**: Expandable summary cards — compact shows name + feast type + 2-3 sentence excerpt; tap/click expands to full life inline.
- **Scripture reading references**: Stored as structured `{ book: string, chapter: number, verseStart: number, verseEnd: number }` — never plain text.
- **CAL-07 (Scripture links)**: Built in Phase 4 as disabled/coming-soon stubs; activated in Phase 5 with zero Phase 4 rework.
- **Synodeia access**: Registered users only. Non-Orthodox users (inquirers, Roman Catholics, etc.) are excluded — canonical Eastern Orthodox jurisdictions only.
- **Member card content**: Avatar, display name, jurisdiction badge, city/state (only shown if `locationSharingEnabled == true`).
- **Location granularity**: City + State/Region (e.g., "Atlanta, GA") — user types when enabling; stored in `userProfiles`.
- **Location privacy**: On/off toggle on profile edit page. When off, city/state hidden from member cards entirely. Data stays in Firestore but Server Action filters it out before returning to client.
- **Name search**: Full-text prefix match on `displayName` (same pattern as existing video/post search using `searchKeywords` array).

### Claude's Discretion

- Exact Firestore rules for location privacy (how to enforce "show city only when locationSharingEnabled == true" at the rules level)
- Loading skeleton states for calendar day view and Synodeia member grid
- Exact feast rank visual treatment (Great Feast vs. ordinary commemoration vs. fast)
- Paschal algorithm implementation details (library vs. custom)
- Exact visual styling of the disabled Scripture links

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CAL-01 | Calendar displays in both Old Julian and New/Revised Julian formats with toggle to switch | `orthocal.info` API has `/api/julian/` and `/api/gregorian/` endpoints returning different Julian dates; `orthodox-periods` supports `calendar: 'old'` and `calendar: 'new'` |
| CAL-02 | Calendar shows feast days with descriptions | orthocal.info returns `feasts`, `feast_level`, `feast_level_description`, `titles`, `summary_title` per day |
| CAL-03 | Calendar shows fasting periods and rules | orthocal.info returns `fast_level`, `fast_level_desc`, `fast_exception`, `fast_exception_desc` per day |
| CAL-04 | Calendar shows saints of the day with life summaries (Synaxarion) | orthocal.info returns `stories[]` with `title` and `story` (HTML narrative); `saints[]` array |
| CAL-05 | Calendar shows Gospel reading of the day | orthocal.info returns `readings[]` array with `source`, `book`, `display`, `short_display`, `passage[]`; `orthodox-periods` has `gospels.getByDate()` |
| CAL-06 | Calendar shows Epistle reading of the day | orthocal.info `readings[]` includes Epistle entries; `orthodox-periods` has `epistles.getByDate()` |
| CAL-07 | Daily readings link to Scripture Library (disabled stub in Phase 4) | Reading references stored as `{ book, chapter, verseStart, verseEnd }`; rendered as grayed-out text in Phase 4, activated in Phase 5 |
| SYN-01 | User can browse members by Eastern Orthodox jurisdiction | Filter Firestore `userProfiles` by `jurisdictionId` using `CANONICAL_ORTHODOX_JURISDICTIONS` — existing constant |
| SYN-02 | User can search for members by name | Add `displayNameKeywords: string[]` to `userProfiles`; prefix search via `array-contains` (same pattern as video search) |
| SYN-03 | User can optionally share location (city/state) for nearby member discovery | Add `locationSharingEnabled`, `city`, `stateRegion` fields to `userProfiles`; toggle on profile edit page |
| SYN-04 | Location sharing has privacy toggle (on/off) | Server Action filters out `city`/`stateRegion` when `locationSharingEnabled == false`; Firestore rule gating at document level |
</phase_requirements>

---

## Summary

Phase 4 has two independent sub-systems: (1) the liturgical calendar and (2) the Synodeia people finder. Both build on top of existing Phase 1–3 infrastructure with no new external service dependencies.

For the calendar, the `orthocal.info` REST API is the primary data source — it provides a well-structured JSON endpoint at `https://orthocal.info/api/{calendar}/YYYY/MM/DD/` that returns feast days, fasting rules, saints' Synaxarion stories, and Gospel/Epistle readings for any day. Critically, it supports both `julian` and `gregorian` endpoints. The `julian` endpoint returns the Old Julian date (currently 13 days behind civil date), while `gregorian` maps to what the project calls New/Revised Julian (fixed feasts on civil dates, Julian Paschalion). Calendar data should be fetched via a Server Component on each page load or cached as seed data — fetching at runtime is preferable to avoid staleness. The `orthodox-periods` npm package (v3.0.0, Proprietary license, depends on moment.js) provides an alternative local computation path supporting both `calendar: 'old'` and `calendar: 'new'` modes, but its Proprietary license and heavy moment.js dependencies make it a fallback rather than primary choice.

For Synodeia, everything is built from existing patterns: the `CANONICAL_ORTHODOX_JURISDICTIONS` constant for filter tabs, `CategoryFilterTabs` component pattern for jurisdiction pills, `buildVideoSearchKeywords` pattern for `displayNameKeywords`, and Server Actions that filter location fields based on `locationSharingEnabled`. The location privacy challenge requires careful implementation: Firestore security rules cannot gate individual fields within a readable document (reads are document-level), so the Server Action must strip `city`/`stateRegion` before returning data to clients when the flag is false.

**Primary recommendation:** Use the `orthocal.info` REST API for calendar data (no npm dependency, no license issues, returns all required fields in one call). Use `orthodox-periods` only as a fallback if the API becomes unavailable. Build Synodeia entirely with existing project patterns.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| orthocal.info REST API | N/A (external) | Liturgical calendar data per day — feasts, fasting, saints, readings | Verified live, Orthodox-specific, returns all required CAL-01–07 data in one call, MIT-licensed service |
| orthodox-periods | 3.0.0 | Local Paschal computation — feast/fast periods, Gospel/Epistle lookups by date | Supports `calendar: 'old'` and `calendar: 'new'`; fallback if API unavailable |
| date-easter | 1.0.3 | Julian Paschalion / Orthodox Easter date computation | MIT, zero dependencies, verified `julianEaster` / `orthodoxEaster` functions exist |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Next.js `fetch` with `next: { revalidate }` | 15.5.13 (existing) | Cache orthocal.info API responses per day | Server Components calling orthocal.info — cache daily |
| Zod | 4.3.6 (existing) | Validate orthocal.info API response before storing | Parsing external API data defensively |
| firebase-admin | 13.7.0 (existing) | Firestore writes for `userProfiles` updates (location, calendar preference) | All writes go through Server Actions with Admin SDK |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| orthocal.info API | orthodox-periods (local) | orthodox-periods has Proprietary license and heavy moment.js deps; API has no install cost but requires network |
| orthocal.info API | OCA.org scraping | OCA has no structured API; scraping is fragile and violates ToS |
| orthocal.info API | Pre-seed all data in Firestore | 365 documents × multi-year = storage cost and staleness; API is simpler |
| orthodox-periods | Custom Paschalion algorithm | Canon algorithm (Meeus) is well-documented but 100+ lines; library is verified correct |

**Installation (if using orthodox-periods as fallback):**
```bash
npm install orthodox-periods
npm install date-easter
```

**Version verification (run before planning):**
```bash
npm view orthodox-periods version  # 3.0.0
npm view date-easter version       # 1.0.3
```

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/(main)/
│   ├── calendar/
│   │   └── page.tsx              # Server Component — fetches orthocal.info for today
│   └── synodeia/
│       └── page.tsx              # Server Component — auth-gated, fetches members
├── components/
│   ├── calendar/
│   │   ├── CalendarDayView.tsx   # Client Component — hero day display + day navigation
│   │   ├── SaintCard.tsx         # Client Component — expandable saint summary
│   │   ├── ReadingRef.tsx        # Client Component — disabled Scripture link stub
│   │   └── CalendarSkeleton.tsx  # Loading skeleton for day view
│   └── synodeia/
│       ├── SynodeiaClient.tsx    # Client Component — jurisdiction filter + name search
│       ├── MemberCard.tsx        # Presentational — avatar, name, jurisdiction, city
│       └── SynodiaSkeleton.tsx   # Loading skeleton for member grid
├── lib/
│   ├── firestore/
│   │   └── synodeia.ts           # getMembers, searchByName, buildDisplayNameKeywords
│   ├── calendar/
│   │   └── orthocal.ts           # fetchDayData(date, calendar) → wraps orthocal.info API
│   └── types/
│       └── calendar.ts           # OrthodocalDay, ReadingRef, SaintStory types
└── app/actions/
    └── profile.ts                # Extended: updateCalendarPreference, updateLocationSharing
```

### Pattern 1: orthocal.info API Fetch with Date Logic

**What:** Server Component fetches current day from orthocal.info based on user's calendar preference and today's civil date.

**Calendar mapping:**
- User preference `new_julian` → call `https://orthocal.info/api/gregorian/YYYY/MM/DD/` using the civil date (the Revised Julian calendar aligns fixed feasts with civil dates)
- User preference `old_julian` → call `https://orthocal.info/api/julian/YYYY/MM/DD/` using the civil date — the API internally translates to the Julian date (returns `day: 6` when you pass March 19 during the current 13-day offset period)

**Date display logic:**
- For `new_julian`: display `response.month`/`response.day`/`response.year` without suffix
- For `old_julian`: display `response.month`/`response.day`/`response.year` with "(O.S.)" suffix

**Navigation:** Pass `?date=YYYY-MM-DD` query param; Server Component reads it for day navigation arrows.

**When to use:** Every calendar page load.

**Example:**
```typescript
// src/lib/calendar/orthocal.ts
// Source: https://orthocal.info/api/

export interface OrthodocalDay {
  year: number;
  month: number;
  day: number;
  weekday: number;
  tone: number;
  titles: string[];
  summary_title: string;
  feast_level: number;
  feast_level_description: string;
  feasts: string[];
  fast_level: number;
  fast_level_desc: string;
  fast_exception: number;
  fast_exception_desc: string;
  saints: string[];
  stories: Array<{ title: string; story: string }>;
  readings: Array<{
    source: string;
    book: string;
    display: string;
    short_display: string;
    passage: Array<{
      book: string;
      chapter: number;
      verse: number;
      content: string;
    }>;
  }>;
  pascha_distance: number;
}

export async function fetchDayData(
  civilDate: Date,
  calendar: 'new_julian' | 'old_julian'
): Promise<OrthodocalDay> {
  const y = civilDate.getFullYear();
  const m = civilDate.getMonth() + 1;
  const d = civilDate.getDate();
  const endpoint = calendar === 'old_julian' ? 'julian' : 'gregorian';
  const url = `https://orthocal.info/api/${endpoint}/${y}/${m}/${d}/`;

  const res = await fetch(url, {
    next: { revalidate: 86400 }, // cache 24 hours — day data never changes
  });
  if (!res.ok) throw new Error(`orthocal.info fetch failed: ${res.status}`);
  return res.json() as Promise<OrthodocalDay>;
}
```

### Pattern 2: Reading Reference Structured Object

**What:** Gospel and Epistle readings stored as structured objects, not display strings. Phase 4 renders these as disabled stubs. Phase 5 activates links with no Phase 4 changes.

**When to use:** Wherever reading references are stored or displayed.

**Example:**
```typescript
// src/lib/types/calendar.ts
export interface ReadingRef {
  book: string;       // e.g., "John", "Romans"
  chapter: number;    // e.g., 3
  verseStart: number; // e.g., 16
  verseEnd: number;   // e.g., 21
  display: string;    // e.g., "John 3:16-21" — pre-formatted for display
}

// Phase 4 disabled stub rendering (ReadingRef.tsx):
// <span className="text-text-mid/50 cursor-not-allowed" title="Coming soon — Scripture Library">
//   {ref.display}
// </span>
```

### Pattern 3: Synodeia Name Search Keywords

**What:** Same prefix-search pattern as `buildVideoSearchKeywords` from `src/lib/firestore/videos.ts` — adapted for display names.

**When to use:** When adding a member to Synodeia (on profile save) and when querying by name.

**Example:**
```typescript
// src/lib/firestore/synodeia.ts
export function buildDisplayNameKeywords(displayName: string): string[] {
  const tokens = displayName.toLowerCase().split(/[\s\W]+/).filter(t => t.length >= 2);
  // Also add prefix tokens for partial match: "john" → ["j", "jo", "joh", "john"]
  const prefixes: string[] = [];
  for (const token of tokens) {
    for (let i = 2; i <= token.length; i++) {
      prefixes.push(token.slice(0, i));
    }
  }
  return [...new Set([...tokens, ...prefixes])];
}

export async function searchMembersByName(
  query: string,
  jurisdictionFilter: string | null
): Promise<SynodeiaMember[]> {
  const db = getAdminFirestore();
  const keyword = query.toLowerCase().trim();
  let q = db.collection('userProfiles')
    .where('displayNameKeywords', 'array-contains', keyword)
    .where('jurisdictionId', 'in', CANONICAL_ORTHODOX_JURISDICTION_IDS);

  if (jurisdictionFilter) {
    q = db.collection('userProfiles')
      .where('displayNameKeywords', 'array-contains', keyword)
      .where('jurisdictionId', '==', jurisdictionFilter);
  }
  // ... filter location after fetch
}
```

### Pattern 4: Location Privacy via Server Action Filtering

**What:** Since Firestore reads are document-level (rules cannot gate individual fields within a readable document), the Server Action strips `city`/`stateRegion` before returning to the client when `locationSharingEnabled` is false.

**When to use:** Every Synodeia member list fetch and search.

**Example:**
```typescript
// In synodeia Server Action or lib/firestore/synodeia.ts
function sanitizeMember(profile: UserProfile): SynodeiaMember {
  return {
    uid: profile.uid,
    handle: profile.handle,
    displayName: profile.displayName,
    avatarUrl: profile.avatarUrl,
    jurisdictionId: profile.jurisdictionId,
    // Location only included when user has opted in:
    city: profile.locationSharingEnabled ? (profile.city ?? null) : null,
    stateRegion: profile.locationSharingEnabled ? (profile.stateRegion ?? null) : null,
  };
}
```

**Firestore rules for Synodeia reads:** The `userProfiles` document is already publicly readable (`allow read: if true`). No rule change needed for location fields — the Server Action enforces the privacy contract. To add defense-in-depth, consider requiring `isRegistered()` for Synodeia queries in a separate `/synodeia` collection view — but adding a second collection is over-engineering for this phase. The Server Action is the enforcement layer.

### Anti-Patterns to Avoid

- **Storing reading references as plain strings** — "John 3:16-21" as a string breaks Phase 5 activation. Always use `{ book, chapter, verseStart, verseEnd }` structured objects.
- **Calling orthocal.info on every client-side navigation** — Use Server Components and Next.js fetch caching (`revalidate: 86400`). Calendar data for a given day is immutable.
- **Using Gregorian dates for Old Julian display** — The orthocal.info `julian` endpoint returns the translated Julian date in `month`/`day`/`year` fields. Use those fields for display, not the civil date passed in the URL.
- **Querying userProfiles without isRegistered check in Server Component** — Synodeia is registered-only; gate with `getTokens()` in the Server Component before any Firestore call.
- **Directly reading location fields on client** — Always go through Server Action that applies `sanitizeMember()`; never expose raw `userProfiles` docs to client for Synodeia.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Orthodox Paschal date computation | Custom Julian Paschalion formula | orthocal.info API or `orthodox-periods` | Julian calendar + 19-year Metonic cycle + Lua/anno mundi epoch = 100+ lines of subtle math; both solutions are verified correct |
| Feast level lookup tables | Custom feast rank data | orthocal.info `feast_level` + `feast_level_description` fields | The API provides `0=Liturgy`, higher values for major feasts — no custom table needed |
| Fasting rule logic | Custom fasting period calculator | orthocal.info `fast_level_desc` + `fast_exception_desc` | Complex interaction of Lenten Fast, Apostles Fast, Dormition Fast, weekly rules — already computed |
| Saints' Synaxarion text | Manually entered saint bios | orthocal.info `stories[].story` | HTML narrative per saint per day — already sourced from OCA Synaxarion |
| Scripture reading schedules | Custom lectionary tables | orthocal.info `readings[]` | The daily lectionary is complex (Lukan jump, Lucan restart, epistle cycle) — all computed by the API |
| Prefix search indexing | Client-side display name filter | `displayNameKeywords` Firestore array + `array-contains` query | Client-side search requires loading all members; Firestore array-contains scales correctly |

**Key insight:** The orthocal.info API eliminates the need for any liturgical computation in Phase 4. Every complex calendar problem (Paschal cycle, fasting rules, lectionary, Synaxarion) is already solved and returned in a single API call.

---

## Common Pitfalls

### Pitfall 1: Calendar Endpoint Confusion (Julian vs Gregorian URL Segment)

**What goes wrong:** Developer calls `/api/gregorian/` for Old Julian display and `/api/julian/` for New Julian — the opposite of correct.
**Why it happens:** "Gregorian" sounds like the modern Western calendar, so it seems wrong for New Revised Julian. But in this project, New Julian's fixed feasts align with civil (Gregorian) dates, so `/api/gregorian/` is the correct endpoint for New Julian users.
**How to avoid:** Map `calendar: 'new_julian'` → `gregorian` URL segment; `calendar: 'old_julian'` → `julian` URL segment. Document this mapping explicitly in `orthocal.ts`.
**Warning signs:** Old Julian users see dates 13 days ahead of expected; or New Julian users see dates 13 days behind civil date.

### Pitfall 2: Displaying Civil Date for Old Julian Users

**What goes wrong:** Calendar header shows "19 March 2026" for Old Julian users because the Server Component reads `new Date()` directly instead of the API response's `month`/`day`/`year` fields.
**Why it happens:** It's tempting to use the civil date for the header and only use API data for feast info.
**How to avoid:** Always derive display date from `OrthodocalDay.year`, `.month`, `.day` fields — these are the Julian date for `old_julian` users (e.g., "6 March 2026 (O.S.)").

### Pitfall 3: Firestore Field-Level Privacy Misconception

**What goes wrong:** Developer writes a Firestore rule like `allow read: if resource.data.locationSharingEnabled == true` expecting it to expose location fields only when enabled — but it blocks the entire document from non-sharing users, breaking their Synodeia appearance entirely.
**Why it happens:** Firestore rule field access is document-level for reads — you cannot allow reading some fields but not others in one document.
**How to avoid:** Privacy enforcement lives in the Server Action `sanitizeMember()` function, not in Firestore rules. The `userProfiles` document remains fully readable by registered users (matching current rule). Only city/state are stripped in the Server Action.
**Warning signs:** Members with `locationSharingEnabled: false` completely disappear from Synodeia instead of appearing without a city.

### Pitfall 4: orthodox-periods Proprietary License

**What goes wrong:** `orthodox-periods` is included in production bundle without license review — it has a `Proprietary` license, not MIT.
**Why it happens:** npm install succeeds without license warnings.
**How to avoid:** Use `orthodox-periods` only as a server-side fallback (never in client bundle) or not at all. The orthocal.info API has no license restriction on API calls. For Phase 4, prefer the API.
**Warning signs:** License audit flags `orthodox-periods` in production dependencies.

### Pitfall 5: Synodeia Query Compound Index Requirement

**What goes wrong:** Firestore query combining `where('displayNameKeywords', 'array-contains', keyword)` and `where('jurisdictionId', '==', id)` throws a "requires an index" error.
**Why it happens:** Compound queries on array fields require composite indexes in Firestore.
**How to avoid:** Create composite index on `userProfiles`: `displayNameKeywords ASC` + `jurisdictionId ASC` in `firestore.indexes.json` before writing the query.
**Warning signs:** Console error: "The query requires an index. You can create it here: [link]"

### Pitfall 6: jest 30 Flag (Known Project Pattern)

**What goes wrong:** Test run command uses `--testPathPattern` (singular) — fails with jest 30.
**Why it happens:** jest 30 renamed the flag to `--testPathPatterns` (plural). This is documented in STATE.md Phase 2 decision.
**How to avoid:** All test commands in plans must use `--testPathPatterns` (plural).

---

## Code Examples

Verified patterns from live API inspection and existing codebase:

### orthocal.info Response Shape (verified against live API, 2026-03-19)

```typescript
// Response from GET https://orthocal.info/api/julian/2026/3/19/
// Returns Julian calendar data: day shown is March 6 (13 days behind civil)
{
  year: 2026,
  month: 3,
  day: 6,               // Julian date — 13 days behind civil March 19
  weekday: 4,           // Thursday
  tone: 7,
  titles: ["Thursday of the Fourth Week of Lent"],
  summary_title: "Thursday of the Fourth Week of Lent",
  feast_level: 0,
  feast_level_description: "Liturgy",
  feasts: [],
  fast_level: 2,
  fast_level_desc: "Lenten Fast",
  fast_exception: 0,
  fast_exception_desc: "",
  saints: ["Forty-two Martyrs of Ammoria"],
  stories: [{
    title: "Forty-two Martyrs of Ammoria (845)",
    story: "<p>These holy martyrs were kept in a miserable dungeon...</p>"
  }],
  readings: [{
    source: "6th Hour",
    book: "OT",
    display: "Isaiah 28.14-22",
    short_display: "Isa 28.14-22",
    passage: [{ book: "Isa", chapter: 28, verse: 14, content: "..." }]
  }],
  pascha_distance: -24   // 24 days before Pascha
}
```

### Synodeia Member Query (Firestore, Server Action)

```typescript
// src/lib/firestore/synodeia.ts
import { getAdminFirestore } from '@/lib/firebase/admin';
import { CANONICAL_ORTHODOX_JURISDICTIONS } from '@/lib/constants/jurisdictions';

const CANONICAL_IDS = CANONICAL_ORTHODOX_JURISDICTIONS.map(j => j.id);

export interface SynodeiaMember {
  uid: string;
  handle: string;
  displayName: string;
  avatarUrl: string | null;
  jurisdictionId: string;
  city: string | null;       // null when locationSharingEnabled == false
  stateRegion: string | null;
}

export async function getMembersByJurisdiction(
  jurisdictionId: string | null,
  limit = 50
): Promise<SynodeiaMember[]> {
  const db = getAdminFirestore();
  let query = db.collection('userProfiles')
    .where('jurisdictionId', 'in', CANONICAL_IDS)
    .limit(limit);

  if (jurisdictionId) {
    query = db.collection('userProfiles')
      .where('jurisdictionId', '==', jurisdictionId)
      .limit(limit);
  }

  const snap = await query.get();
  return snap.docs.map(doc => {
    const data = doc.data();
    return {
      uid: doc.id,
      handle: data.handle,
      displayName: data.displayName,
      avatarUrl: data.avatarUrl ?? null,
      jurisdictionId: data.jurisdictionId,
      city: data.locationSharingEnabled ? (data.city ?? null) : null,
      stateRegion: data.locationSharingEnabled ? (data.stateRegion ?? null) : null,
    };
  });
}
```

### UserProfile Type Extension

```typescript
// Extension to src/lib/types/social.ts UserProfile interface:
// Add these fields to the existing UserProfile interface
calendarPreference: 'new_julian' | 'old_julian';  // default 'new_julian'
locationSharingEnabled: boolean;                   // default false
city: string | null;                               // null when not sharing
stateRegion: string | null;                        // null when not sharing
displayNameKeywords: string[];                     // for Synodeia name search
```

### Feast Level Visual Treatment (Claude's Discretion)

The orthocal.info API returns `feast_level` as an integer. Based on OCA standards, the hierarchy is:
- `0` = Liturgy (ordinary weekday)
- `1` = Minor Feast (black letter)
- `2` = Minor Feast with Doxasticon
- `3` = Polyeleos
- `4` = Vigil
- `5` = Great Feast (one of the 12 Feasts + Pascha)

Recommended visual treatment:
- `feast_level >= 5`: Gold text + gold border + icon (cross or star)
- `feast_level 3–4`: Gold text, standard card border
- `feast_level 1–2`: Normal text, subtle highlight
- `feast_level 0`: Normal text, no highlight

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Custom Julian date math | orthocal.info API `/julian/` endpoint | N/A — API preference | Zero calendar logic to maintain |
| moment.js date handling | Native `Date` + Next.js `fetch` caching | 2023–2024 (moment deprecated) | `orthodox-periods` still uses moment internally; avoid it in new code |
| Client-side Firestore `onSnapshot` for live data | Server Component + Server Action fetch | Phase 2 pattern (project standard) | Calendar data is immutable for a day; no live subscription needed |
| Storing plain text reading references | `{ book, chapter, verseStart, verseEnd }` structured object | Decision locked in CONTEXT.md | Enables Phase 5 activation with zero Phase 4 changes |

**Deprecated/outdated:**
- Direct OCA.org/ROCOR.org scraping: Flagged in STATE.md as a concern; resolved — orthocal.info API is cleaner, structured, and already sources from OCA Synaxarion data
- `orthodox-periods` as primary calendar engine: Proprietary license + moment.js deps; use only as server-side Paschal math fallback

---

## Open Questions

1. **orthocal.info API rate limits and availability**
   - What we know: API is free, publicly accessible, returns correctly formatted data (verified live 2026-03-19). Project brianglass/orthocal-python is the active backend (MIT licensed source code).
   - What's unclear: Whether there is a published rate limit or SLA for the free API tier.
   - Recommendation: Cache aggressively (`revalidate: 86400` — 24 hours). Calendar data for a given day is immutable once generated. Consider a lightweight in-memory fallback for CI/test environments that mocks the API response.

2. **Synodeia query with `in` operator for canonical jurisdictions array**
   - What we know: Firestore `where('jurisdictionId', 'in', array)` supports up to 30 items; `CANONICAL_ORTHODOX_JURISDICTIONS` has 18 entries — within limit.
   - What's unclear: Whether `in` query + `limit()` requires a composite index.
   - Recommendation: Test in development; if index required, add to `firestore.indexes.json` in Plan 04-01.

3. **orthocal.info Gospel/Epistle reading format mapping to `ReadingRef`**
   - What we know: orthocal.info returns readings as `{ source, book, display, short_display, passage[] }`. The `display` field is already a formatted string like "John 3:16-21". The `passage` array has individual verse objects with `chapter` and `verse`.
   - What's unclear: Whether `source` reliably differentiates "Gospel" from "Epistle" readings vs. other services (Orthros, Liturgy, 6th Hour).
   - Recommendation: Parse `readings[]` filtering by `source` containing "Liturgy" or specific liturgical hour names. For `ReadingRef` structured object, derive `book`/`chapter`/`verseStart`/`verseEnd` from `passage[0]` (first verse) and `passage[passage.length-1]` (last verse).

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 30 + jsdom + @testing-library/react |
| Config file | `jest.config.ts` (root) — matches `tests/**/*.test.{ts,tsx}` |
| Quick run command | `npx jest --testPathPatterns="04" --no-coverage` |
| Full suite command | `npx jest --no-coverage` |

Note: Jest 30 uses `--testPathPatterns` (plural) — not `--testPathPattern`. See STATE.md Phase 2 decision.

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CAL-01 | `fetchDayData` returns julian date (day-13) for old_julian and civil date for new_julian | unit | `npx jest --testPathPatterns="calendar" --no-coverage` | Wave 0 |
| CAL-02 | Day view renders feast day title from API response | unit | `npx jest --testPathPatterns="CalendarDayView" --no-coverage` | Wave 0 |
| CAL-03 | Day view renders fasting rule text from `fast_level_desc` | unit | `npx jest --testPathPatterns="CalendarDayView" --no-coverage` | Wave 0 |
| CAL-04 | SaintCard renders collapsed + expanded states correctly | unit | `npx jest --testPathPatterns="SaintCard" --no-coverage` | Wave 0 |
| CAL-05 | Gospel reading reference extracted from readings array | unit | `npx jest --testPathPatterns="calendar" --no-coverage` | Wave 0 |
| CAL-06 | Epistle reading reference extracted from readings array | unit | `npx jest --testPathPatterns="calendar" --no-coverage` | Wave 0 |
| CAL-07 | ReadingRef renders as disabled stub (no href, grayed style) | unit | `npx jest --testPathPatterns="ReadingRef" --no-coverage` | Wave 0 |
| SYN-01 | `getMembersByJurisdiction` only returns canonical Orthodox jurisdictions | unit | `npx jest --testPathPatterns="synodeia" --no-coverage` | Wave 0 |
| SYN-02 | `buildDisplayNameKeywords` generates prefix tokens; query returns matching members | unit | `npx jest --testPathPatterns="synodeia" --no-coverage` | Wave 0 |
| SYN-03 | `sanitizeMember` includes city/stateRegion when `locationSharingEnabled == true` | unit | `npx jest --testPathPatterns="synodeia" --no-coverage` | Wave 0 |
| SYN-04 | `sanitizeMember` strips city/stateRegion when `locationSharingEnabled == false` | unit | `npx jest --testPathPatterns="synodeia" --no-coverage` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx jest --testPathPatterns="04" --no-coverage`
- **Per wave merge:** `npx jest --no-coverage`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/lib/calendar.test.ts` — covers CAL-01, CAL-05, CAL-06 (fetchDayData, reading extraction)
- [ ] `tests/lib/synodeia.test.ts` — covers SYN-01, SYN-02, SYN-03, SYN-04 (member query, keyword builder, sanitizeMember)
- [ ] `tests/components/CalendarDayView.test.tsx` — covers CAL-02, CAL-03
- [ ] `tests/components/SaintCard.test.tsx` — covers CAL-04 (expand/collapse)
- [ ] `tests/components/ReadingRef.test.tsx` — covers CAL-07 (disabled stub rendering)
- [ ] `tests/components/MemberCard.test.tsx` — covers SYN-03, SYN-04 (city shown/hidden)

---

## Sources

### Primary (HIGH confidence)
- Live API call: `https://orthocal.info/api/julian/2026/3/19/` — verified response shape, all fields, date offset confirmed (13 days behind)
- Live API call: `https://orthocal.info/api/gregorian/2026/3/19/` — confirmed gregorian endpoint structure
- `npm view orthodox-periods` + tarball inspection — confirmed `calendar: 'old'` and `calendar: 'new'` support, Proprietary license, version 3.0.0
- `npm view date-easter` — confirmed version 1.0.3, MIT license, zero deps
- `C:/Users/Owner/Downloads/Claude Projects/Ekklesia_Agora/firestore.rules` — confirmed document-level read rules, existing `userProfiles` structure
- `C:/Users/Owner/Downloads/Claude Projects/Ekklesia_Agora/src/lib/firestore/videos.ts` — confirmed `buildVideoSearchKeywords` pattern to adapt
- `C:/Users/Owner/Downloads/Claude Projects/Ekklesia_Agora/src/lib/constants/jurisdictions.ts` — confirmed 18 canonical jurisdictions, `in` array limit safe
- `C:/Users/Owner/Downloads/Claude Projects/Ekklesia_Agora/src/lib/types/social.ts` — confirmed UserProfile fields to extend
- Firebase docs (WebSearch + official URL) — confirmed Firestore reads are document-level; field-level privacy enforced via Server Action

### Secondary (MEDIUM confidence)
- [orthodox-periods Bitbucket README](https://bitbucket.org/anothradam/orthodox-periods) — API usage verified from tarball Readme.md
- [orthocal.info GitHub gist](https://gist.github.com/brianglass/8e8f9f4ea9543911198bd6edf74dd77b) — confirmed endpoint URL pattern
- [feast_level scale](https://www.oca.org/fs) — OCA Feasts & Saints page; feast level semantics inferred from API response values

### Tertiary (LOW confidence)
- `orthodox-periods` feast level mapping — inferred from library behavior; not verified against OCA official spec

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — orthocal.info API verified live; package versions verified via npm registry; existing project patterns confirmed from source
- Architecture: HIGH — patterns derived from existing codebase (videos.ts, firestore.rules, CategoryFilterTabs) with direct code review
- Pitfalls: HIGH for calendar endpoint confusion, Firestore field-level privacy, and jest 30 flag (all verified); MEDIUM for feast level taxonomy (inferred from API values)

**Research date:** 2026-03-19
**Valid until:** 2026-06-19 (orthocal.info API responses are immutable per day; npm package versions stable)
