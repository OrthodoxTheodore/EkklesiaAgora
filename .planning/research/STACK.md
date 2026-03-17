# Technology Stack

**Project:** Ekklesia Agora
**Researched:** 2026-03-16
**Overall Confidence:** HIGH (core stack verified against official docs; video hosting tier has MEDIUM confidence due to pricing access limitations)

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Next.js | 15.x (stable) | Full-stack React framework | App Router provides Server Components + Server Actions — ideal for SEO-critical content pages (video listings, Church Fathers library) and secure server-side auth checks. Firebase App Hosting is an officially listed Next.js deployment adapter. React Native code-sharing path for future mobile app. |
| React | 19.x (stable, Dec 2024) | UI layer | `useActionState`, `useOptimistic`, and native `<form>` action support simplify feed interactions and moderation workflows without extra state libraries. Required by Next.js 15 App Router. |
| TypeScript | 5.x | Type safety | `next.config.ts` now natively supported. Catches data shape mismatches between Firestore documents and UI components — critical for content integrity across 5 user role tiers. |

**Confidence:** HIGH — verified against nextjs.org/blog/next-15 and react.dev/blog (official sources).

---

### Backend Services (Firebase)

The project already has `ekklesia-agora` Firebase project configured with Auth and Firestore. Stay on Firebase for the prototype. The free Spark plan covers prototype-scale usage.

| Service | Purpose | Why |
|---------|---------|-----|
| Firebase Authentication | Email/password auth, user management | Already configured. Handles password hashing, email verification, and password reset without custom backend code. Supports future OAuth providers (Google, etc.). |
| Firestore (Native Mode) | Primary database — users, posts, comments, likes, channels, DMs, liturgical calendar, moderation queue | Document model fits the varied content types (posts, video metadata, Church Fathers entries). Real-time listeners (`onSnapshot`) power the live social feed and DM inbox without extra infrastructure. |
| Firebase Storage | File storage — user avatars, post images, video file uploads (prototype scale) | Already in Firebase ecosystem. Free Spark tier: 5 GB storage, 1 GB/day download. Sufficient for prototype. |
| Firebase App Hosting | Deploy Next.js 15 app | First-party adapter for Next.js listed in official Next.js deployment docs. Handles Server Actions and SSR — no Vercel dependency. Uses existing Firebase project. |

**Confidence:** HIGH — Firebase services verified as existing project assets. App Hosting confirmed as supported Next.js adapter via nextjs.org/docs.

**Spark plan limits (prototype is safe within these):**
- Firestore: 1 GB storage, 50K reads/day, 20K writes/day, 20K deletes/day
- Storage: 5 GB stored, 1 GB/day download
- Auth: Unlimited users (free)
- App Hosting: Included in Firebase project

---

### Video Hosting

This is the most consequential infrastructure decision. Firebase Storage serves raw video files but does NOT transcode, does NOT produce HLS adaptive bitrate streams, and does NOT provide a video player. Raw MP4 delivery from Firebase Storage will produce a poor mobile experience and will fail on slow connections.

**For the prototype:** Use Firebase Storage for video uploads. Accept raw MP4 playback via HTML5 `<video>` tag. This is acceptable for demonstrating the vision to a priest/bishop — not production-ready.

**For production:** Migrate to Mux. Official Next.js docs recommend Mux for high-performance video in Next.js apps, and Mux provides a starter template specifically for Next.js.

| Technology | Tier | Purpose | Notes |
|------------|------|---------|-------|
| Firebase Storage | Prototype | Raw video file storage and playback | No transcoding. Use HTML5 `<video>` directly. Acceptable for blessing presentation. |
| Mux Video API | Production | Video transcoding, HLS streaming, thumbnail generation, analytics | Pay-per-minute stored + streamed. No free tier but $20 credit on signup. Integrates with `next-video` package. Next.js official recommendation. |

**Confidence:** MEDIUM — Mux recommendation from official Next.js docs (nextjs.org/docs/app/guides/videos). Mux pricing not verified due to access restrictions; treat cost estimate as LOW confidence.

**Video player library:** Use the `next-video` npm package (open source, referenced in official Next.js docs). Provides a `<Video>` component compatible with Firebase Storage URLs for prototype and Mux for production — same component interface, swap the provider.

---

### Styling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Tailwind CSS | 4.x (released Jan 22, 2025) | Utility-first CSS | v4 uses CSS-first config (`@theme` block in CSS instead of `tailwind.config.js`). 3-8x faster builds. The Byzantine color palette (navy `#0d1b2e`, gold `#c9a84c`) maps perfectly to Tailwind custom CSS variables. Built-in container queries replace need for extra plugin. |

**Tailwind v4 config approach for this project:**
```css
@import "tailwindcss";

@theme {
  --color-byzantine-navy: #0d1b2e;
  --color-byzantine-gold: #c9a84c;
  --color-byzantine-gold-light: #e4c97e;
  --font-heading: "Cinzel", serif;
  --font-body: "EB Garamond", serif;
}
```

**Confidence:** HIGH — verified against tailwindcss.com/blog/tailwindcss-v4 (official source).

---

### UI Components

| Technology | Purpose | Why |
|------------|---------|-----|
| shadcn/ui | Accessible, unstyled component primitives (dialogs, dropdowns, sheets, toasts) | Copy-paste component model — no dependency lock-in. Components are Tailwind-compatible. Provides Dialog for video player overlays, Sheet for mobile navigation, Toast for moderation notifications. |
| Lucide React | Icon library | Maintained fork of Feather Icons. Tree-shakeable. Used by shadcn/ui internally so zero config overhead. |

**Do NOT use:** Material UI, Chakra UI, Ant Design — all impose design system opinions that fight against the Byzantine aesthetic. The custom design language requires unstyled primitives.

**Confidence:** MEDIUM — shadcn/ui and Lucide are industry-standard choices verified through training data; exact versions not confirmed via official docs due to access limitations. Use `npx shadcn@latest init` to get current version at install time.

---

### Forms and Validation

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Zod | 3.x | Schema validation | Explicitly recommended in Next.js official auth documentation for Server Action form validation. TypeScript-first. Used to validate user inputs before Firestore writes — critical for content integrity enforcement. |
| React Hook Form | 7.x | Client-side form state | Minimal re-renders. Pairs with Zod via `@hookform/resolvers` for unified client + server validation. Use for complex forms (channel creation, profile editing, content submission). For simple forms, use native React 19 `useActionState` with Server Actions instead. |

**Confidence:** HIGH for Zod (verified in official Next.js auth docs). MEDIUM for React Hook Form (training data; version not independently verified).

---

### State Management

**Do NOT add a global state library (Redux, Zustand, Jotai).** The combination of React Server Components (server-side data) + Firestore real-time listeners (`onSnapshot`) + React 19 `useOptimistic` handles 95% of state needs without additional libraries.

| Pattern | Use Case |
|---------|----------|
| React Server Components + Firestore SDK | Read operations — video listings, post feeds, user profiles, Church Fathers library |
| `onSnapshot` listeners | Real-time updates — DM inbox, moderation queue badge count, live feed |
| `useOptimistic` (React 19) | Optimistic UI — likes, follows, comment submission |
| `useActionState` (React 19) | Form state — auth forms, post creation, profile editing |
| React Context (minimal) | Auth state (current user UID + role) shared across client components |

---

### Search

| Technology | Purpose | Why |
|------------|---------|-----|
| Firestore full-text workaround | Basic search for prototype | Firestore does not support native full-text search. For prototype: use array-contains on keyword arrays stored on documents, or simple string prefix queries. Sufficient to demonstrate search capability to a priest/bishop. |
| Algolia (future) | Production full-text search across videos, posts, Church Fathers texts | Free tier: 10K searches/month, 10K records. Connects to Firestore via official Firebase Extension. Upgrade path when prototype is blessed. |

**Do NOT use:** Elasticsearch — over-engineered for this scale and budget. ElasticSearch Cloud has no generous free tier.

**Confidence:** MEDIUM — Algolia free tier details not independently verified due to access limitations. Confirm at algolia.com/pricing before committing.

---

### Typography and Fonts

| Technology | Purpose | Why |
|------------|---------|-----|
| `next/font` (Google Fonts) | Cinzel (headings), EB Garamond (body) | Next.js built-in font optimization: self-hosts Google Fonts at build time, eliminating external network requests, preventing FOUT, and satisfying privacy requirements for a religious community platform. Zero CLS impact. |

```typescript
// app/layout.tsx
import { Cinzel, EB_Garamond } from 'next/font/google'

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})

const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})
```

**Confidence:** HIGH — `next/font` is a core Next.js feature, verified in official docs.

---

### Testing

| Technology | Purpose | Why |
|------------|---------|-----|
| Vitest | Unit and integration tests | Faster than Jest for Vite/Next.js projects. Compatible with Next.js 15. |
| React Testing Library | Component tests | Standard for testing React components in user-centric way. |
| Playwright | End-to-end tests (auth flows, moderation workflows) | Official Next.js recommendation for E2E. Critical for testing the 5-tier role system. |

**For the prototype phase:** Skip comprehensive test coverage. Write E2E tests only for auth and the moderation approval flow — the two paths most likely to fail publicly during a bishop presentation.

---

### Development Tooling

| Technology | Purpose | Why |
|------------|---------|-----|
| ESLint 9 | Linting | Supported natively in Next.js 15. Use flat config format. |
| Prettier | Code formatting | Consistent style across files. |
| Turbopack | Dev server bundler | Stable in Next.js 15 (`next dev --turbo`). Up to 76.7% faster startup than webpack. |

---

## Deployment Architecture

```
Firebase App Hosting (Next.js 15 SSR)
    |
    ├── Firebase Auth (user sessions)
    ├── Firestore (all structured data)
    ├── Firebase Storage (images, avatars, prototype video files)
    └── Mux Video API (production video — future upgrade)
```

**Host:** Firebase App Hosting — first-party Next.js adapter, uses existing Firebase project. Supports Server Actions and SSR. Free tier included.

**Do NOT use Vercel** for this project. Vercel adds cost without benefit given the Firebase-first backend. The project already has Firebase configured and App Hosting is now a supported deployment path per official Next.js docs.

**Do NOT use Firebase Hosting (the old static hosting)** — it does not support Next.js Server Actions or SSR. App Hosting is the correct product.

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Framework | Next.js 15 | Remix, SvelteKit | React Native code-sharing requirement for future mobile rules out non-React frameworks. Next.js has official Firebase App Hosting adapter. |
| Database | Firestore | Supabase (Postgres), PlanetScale | Firestore already configured and running. Supabase would require migration. Firestore's real-time listeners are better for live social feed. |
| Auth | Firebase Auth | NextAuth.js, Clerk | Already configured. Firebase Auth is free at any scale for registered users. Clerk costs money at scale. |
| Styling | Tailwind v4 | Tailwind v3, CSS Modules | v4 is current stable; v3 support ends. CSS Modules lacks the design token system needed for consistent Byzantine theming. |
| Video (prototype) | Firebase Storage + HTML5 video | Cloudinary, Bunny.net | Firebase Storage zero marginal cost for prototype. Cloudinary free tier has 25 GB bandwidth/month — acceptable alternative if Firebase Storage proves limiting. |
| Video (production) | Mux | Cloudinary, Bunny.net | Next.js official docs recommend Mux; has dedicated Next.js starter template; `next-video` package supports Mux natively. Bunny.net is cheaper but less DX-optimized for Next.js. |
| Search | Firestore array-contains (prototype), Algolia (production) | MeiliSearch, Typesense | Algolia has Firebase Extension for automatic Firestore sync. MeiliSearch/Typesense require self-hosting or paid cloud — higher ops burden for a solo developer. |
| UI Components | shadcn/ui | Radix UI (direct), Headless UI | shadcn/ui wraps Radix with sensible defaults while keeping components fully ownable. Less config than raw Radix. |
| Deployment | Firebase App Hosting | Vercel, Railway | Firebase App Hosting uses existing Firebase project. Vercel adds $20+/month cost unnecessarily. |

---

## Installation

### Bootstrap

```bash
npx create-next-app@15 ekklesia-agora \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"
```

### Core Dependencies

```bash
# Firebase
npm install firebase firebase-admin

# Forms and validation
npm install zod react-hook-form @hookform/resolvers

# UI components
npx shadcn@latest init
npm install lucide-react

# Video (prototype)
npm install next-video

# Session management (for Next.js middleware auth checks)
npm install jose server-only
```

### Dev Dependencies

```bash
npm install -D \
  vitest \
  @vitejs/plugin-react \
  @testing-library/react \
  @testing-library/jest-dom \
  @playwright/test
```

### Tailwind v4 CSS

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  /* Byzantine palette */
  --color-byzantine-navy: #0d1b2e;
  --color-byzantine-navy-light: #1a2e4a;
  --color-byzantine-gold: #c9a84c;
  --color-byzantine-gold-light: #e4c97e;
  --color-byzantine-cream: #f5f0e8;

  /* Typography */
  --font-heading: var(--font-cinzel), serif;
  --font-body: var(--font-eb-garamond), serif;
}
```

---

## Sources

- Next.js 15 Release Blog: https://nextjs.org/blog/next-15 (verified)
- Next.js Video Guide: https://nextjs.org/docs/app/guides/videos (verified)
- Next.js Authentication Guide: https://nextjs.org/docs/app/guides/authentication (verified)
- Next.js Deployment Options: https://nextjs.org/docs/app/getting-started/deploying (verified — lists Firebase App Hosting as supported adapter)
- React 19 Release Blog: https://react.dev/blog/2024/04/25/react-19 (verified — stable since Dec 2024)
- Tailwind CSS v4 Release: https://tailwindcss.com/blog/tailwindcss-v4 (verified — released Jan 22, 2025)
- Mux for Next.js (cited in official Next.js video docs): https://www.mux.com/for/nextjs
- next-video package (cited in official Next.js video docs): https://next-video.dev/docs
