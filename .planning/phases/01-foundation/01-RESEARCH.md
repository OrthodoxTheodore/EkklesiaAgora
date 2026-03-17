# Phase 1: Foundation - Research

**Researched:** 2026-03-16
**Domain:** Next.js 15 App Router, Firebase Auth + Firestore, Tailwind CSS v4, Custom Claims RBAC
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
All implementation areas are Claude's discretion. The following are Claude's recommended decisions, grounded in the existing HTML mockup and project requirements:

**Auth page flow:**
- Dedicated full pages for login, register, and password reset (not modal overlays) — better for Next.js routing, deep linking, and back-button behavior
- Styled to match the mockup's modal aesthetic: centered card on navy background, gold-bordered form fields, Cinzel headings, EB Garamond body text
- Inline validation with styled error messages (gold-dim text below fields)
- Password reset via Firebase email link — simple confirmation page after submission

**App shell and navigation:**
- Sticky top navigation matching the mockup pattern (logo, nav links, search bar, auth buttons)
- Navigation adapts based on auth state: guest sees "Sign In / Register" buttons; logged-in user sees avatar dropdown with profile/settings/logout
- Launch pages: Home (landing/hero), Login, Register, Reset Password, Dashboard (post-login hub)
- Mobile: hamburger menu collapsing the nav links

**Role management UI:**
- Admin settings page with user search (by email/display name) and role promotion via dropdown
- Super admin account seeded directly in Firebase (custom claims set via script/CLI) — not created through the UI
- Moderator promotion requires admin role; admin creation requires super admin role
- Simple audit: role changes logged to Firestore (who promoted whom, when)

**Guest browsing experience:**
- Guests can view all public content without an account (per AUTH-05)
- Interaction attempts (like, comment, post) trigger a styled prompt modal: "Sign in to participate in the community"
- No hard walls on browsing — gentle nudges only
- Registration CTA in the hero section and nav bar

### Claude's Discretion
All implementation decisions above are Claude's recommendations; user trusts Claude's judgment on all implementation areas.

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUTH-01 | User can create account with email and password | Firebase Auth `createUserWithEmailAndPassword` + server-side cookie creation via next-firebase-auth-edge |
| AUTH-02 | User can log in and stay logged in across sessions | Firebase Auth `signInWithEmailAndPassword` + HttpOnly session cookies via next-firebase-auth-edge middleware |
| AUTH-03 | User can reset password via email link | Firebase Auth `sendPasswordResetEmail` (client-side) + confirmation page route |
| AUTH-04 | User can log out from any page | next-firebase-auth-edge `removeServerCookies` + Firebase client `signOut` |
| AUTH-05 | Guest can browse all public content without an account | Middleware `handleInvalidToken` only blocks private routes; public routes pass through |
| AUTH-06 | Super admin can create other admin accounts with full or limited permissions | Firebase Admin SDK `setCustomUserClaims` + Admin Settings UI; super admin seeded via script |
| AUTH-07 | Only admins can promote a standard account to moderator | Custom claims checked server-side before claim mutation; UI blocked for non-admins |
| AUTH-08 | Role hierarchy enforced: guest → registered → moderator → admin → super admin | Integer role level in custom claims + Firestore security rules helper functions |
| DES-01 | Byzantine aesthetic maintained (navy #0d1b2e, gold #c9a84c, Cinzel/EB Garamond) | Tailwind v4 @theme directive with full color + font token system |
| DES-02 | Fully mobile-responsive web design | Tailwind responsive prefixes (sm/md/lg) + hamburger nav below md breakpoint |
| DES-03 | Architecture supports future React Native mobile apps sharing code | Logic in framework-agnostic modules under `/lib`; components isolated in `/components` |
</phase_requirements>

---

## Summary

Phase 1 establishes the entire project scaffolding: Next.js 15 App Router initialized fresh, Firebase Auth wired with secure server-side session cookies, Tailwind v4 configured with the Byzantine design token system, and a five-tier role hierarchy enforced via Firebase custom claims from the first commit.

The critical architectural choice is using **next-firebase-auth-edge** for session management. Firebase's client-side Auth SDK uses in-memory state that does not survive SSR. next-firebase-auth-edge solves this by running JWT verification in Next.js middleware (Edge runtime), converting Firebase ID tokens into signed HttpOnly cookies that survive page refreshes and server renders. This is the only approach that works cleanly with Next.js 15 App Router and is actively maintained as of 2026.

The five-tier role hierarchy is stored as an integer `roleLevel` in Firebase custom claims (0=guest, 1=registered, 2=moderator, 3=admin, 4=super admin). Integer comparison is simpler and more maintainable than string matching in both Firestore rules and server-side checks. After any role promotion, the new admin must call `user.getIdToken(true)` to force a token refresh — this is a known Firebase requirement and must be handled explicitly in the promotion flow. **SECURITY NOTE:** CVE-2025-29927 (March 2025) exposed that Next.js middleware alone cannot be trusted for auth enforcement. Defense-in-depth is mandatory: middleware handles routing redirects only; actual data protection is enforced redundantly in Firestore security rules and Server Components.

**Primary recommendation:** Initialize Next.js 15 clean (no built-in Tailwind), add Tailwind v4 manually, install next-firebase-auth-edge, and configure the Byzantine theme system in `globals.css` using `@theme` — this maps exactly from the mockup's CSS custom properties to Tailwind utility classes.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 15.2.3+ | App framework, App Router, Server Components | Must be >= 15.2.3 to have CVE-2025-29927 fix |
| react | 19.x | UI library | Bundled with Next.js 15 |
| firebase | 11.x | Client SDK: Auth, Firestore reads | Official SDK; modular tree-shakeable |
| firebase-admin | 13.x | Server SDK: custom claims, Admin operations | Only SDK that can set custom claims |
| next-firebase-auth-edge | 1.10.x+ | Middleware JWT verification, HttpOnly session cookies | Only library solving SSR + Firebase Auth correctly for App Router |
| tailwindcss | 4.x | Utility CSS with CSS-first config | v4 uses `@theme` directive matching mockup's CSS variable pattern |
| @tailwindcss/postcss | 4.x | PostCSS integration for Tailwind v4 | Required companion for v4 in Next.js |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next/font | (built-in) | Self-hosted Google Fonts as CSS variables | Fonts served from same origin — no layout shift, no external requests |
| @types/node | latest | Node.js type support | Required for env var types in server code |
| react-hook-form | 7.x | Form state, validation, error messages | AUTH page forms — inline validation with gold-dim error messages |
| zod | 3.x | Schema validation | Auth form schemas; reused server-side in Server Actions |
| jest | 29.x | Unit test runner | Official Next.js recommendation |
| @testing-library/react | 16.x | Component testing | Tests auth UI components |
| jest-environment-jsdom | 29.x | Browser-like DOM for Jest | Required for client component tests |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| next-firebase-auth-edge | next-auth (v5) with Firebase adapter | next-auth adds unnecessary abstraction layer; Firebase custom claims work natively |
| next-firebase-auth-edge | Manual session cookie API routes | next-firebase-auth-edge handles rotating keys, token refresh, Edge runtime — hand-rolling is dangerous |
| react-hook-form + zod | Formik | react-hook-form has less re-render overhead; zod schemas reusable for server validation |
| Tailwind v4 @theme | CSS modules + CSS variables | @theme generates utility classes matching mockup patterns; @theme is the v4 canonical approach |

### Installation
```bash
# 1. Create Next.js 15 project (do NOT select built-in Tailwind — add v4 manually)
npx create-next-app@latest ekklesia-agora --typescript --eslint --app --src-dir --import-alias "@/*"

# 2. Tailwind v4 (manual install)
npm install tailwindcss @tailwindcss/postcss postcss

# 3. Firebase
npm install firebase firebase-admin

# 4. Auth edge library
npm install next-firebase-auth-edge

# 5. Form handling
npm install react-hook-form zod @hookform/resolvers

# 6. Testing
npm install --save-dev jest @types/jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── (auth)/              # Auth route group — no shared layout with app
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── reset-password/page.tsx
│   ├── (main)/              # Authenticated route group
│   │   ├── dashboard/page.tsx
│   │   └── admin/page.tsx   # Role-gated: admin+
│   ├── api/
│   │   ├── login/route.ts   # next-firebase-auth-edge login handler
│   │   └── logout/route.ts  # next-firebase-auth-edge logout handler
│   ├── layout.tsx           # Root layout with AuthProvider
│   └── page.tsx             # Home (public landing)
├── components/
│   ├── nav/                 # Sticky navigation, hamburger, avatar dropdown
│   ├── auth/                # AuthProvider context, useAuth hook
│   └── ui/                  # Reusable primitives: Button, Card, Input (Byzantine styled)
├── lib/
│   ├── firebase/
│   │   ├── client.ts        # Firebase client SDK init (singleton)
│   │   ├── admin.ts         # Firebase Admin SDK init (server-only)
│   │   └── roles.ts         # Role constants, level helpers (shared logic)
│   └── auth/
│       └── claims.ts        # setUserRole, getUserRole server functions
├── middleware.ts             # next-firebase-auth-edge authMiddleware
└── styles/
    └── globals.css          # @import "tailwindcss"; @theme Byzantine tokens
```

### Pattern 1: Session Cookie Authentication (next-firebase-auth-edge)

**What:** Middleware validates Firebase ID token from cookie on every request, injects user into Server Component context via `getTokens()`.

**When to use:** All server-rendered pages that need to know the current user.

```typescript
// src/middleware.ts
// Source: https://next-firebase-auth-edge-docs.vercel.app/docs/usage/middleware
import { authMiddleware, redirectToLogin, redirectToHome } from 'next-firebase-auth-edge';
import { NextRequest } from 'next/server';

const PRIVATE_PATHS = ['/dashboard', '/admin'];
const AUTH_PATHS = ['/login', '/register', '/reset-password'];

export async function middleware(request: NextRequest) {
  return authMiddleware(request, {
    loginPath: '/api/login',
    logoutPath: '/api/logout',
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    cookieName: 'AuthToken',
    cookieSignatureKeys: [process.env.COOKIE_SECRET_CURRENT!, process.env.COOKIE_SECRET_PREVIOUS!],
    cookieSerializeOptions: {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 12, // 12 days
    },
    serviceAccount: {
      projectId: process.env.FIREBASE_PROJECT_ID!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    },
    handleValidToken: async ({ token }, headers) => {
      // Authenticated users redirected away from auth pages
      if (AUTH_PATHS.some(p => request.nextUrl.pathname.startsWith(p))) {
        return redirectToHome(request);
      }
      return NextResponse.next({ request: { headers } });
    },
    handleInvalidToken: async (reason) => {
      // Unauthenticated users blocked from private paths
      if (PRIVATE_PATHS.some(p => request.nextUrl.pathname.startsWith(p))) {
        return redirectToLogin(request, { reason });
      }
      return NextResponse.next();
    },
    handleError: async (error) => {
      console.error('Middleware auth error:', error);
      return NextResponse.next();
    },
  });
}

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)', '/'],
};
```

### Pattern 2: Tailwind v4 Byzantine Theme via @theme

**What:** All CSS custom properties from the mockup translated to Tailwind `@theme` tokens, generating utility classes like `bg-navy`, `text-gold`, `border-gold-dim`.

**When to use:** globals.css — configured once, used everywhere via utility classes.

```css
/* src/styles/globals.css */
/* Source: https://tailwindcss.com/docs/theme */
@import "tailwindcss";

@theme {
  /* Colors — matches mockup :root variables exactly */
  --color-navy:        #0d1b2e;
  --color-navy-mid:    #152338;
  --color-navy-light:  #1e3352;
  --color-gold:        #c9a84c;
  --color-gold-bright: #e8c96a;
  --color-gold-dim:    #8a6f30;
  --color-gold-pale:   #f0dfa0;
  --color-text-light:  #e8dfc8;
  --color-text-mid:    #b8a888;
  --color-crimson:     #8b1a1a;

  /* Typography */
  --font-cinzel:     'Cinzel', serif;
  --font-cinzel-dec: 'Cinzel Decorative', serif;
  --font-garamond:   'EB Garamond', serif;

  /* Spacing / sizing — carry mockup values forward */
  --spacing-nav: 70px;
}

/* Gold grid overlay — fixed background decorative element from mockup */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image:
    repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(201,168,76,0.04) 39px, rgba(201,168,76,0.04) 40px),
    repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(201,168,76,0.04) 39px, rgba(201,168,76,0.04) 40px);
  pointer-events: none;
  z-index: 0;
}
```

### Pattern 3: Font Setup via next/font with CSS Variables

**What:** Google Fonts loaded at build time, exposed as CSS variables, consumed by Tailwind @theme font tokens.

**When to use:** Root layout — fonts loaded once, zero external network requests after build.

```typescript
// src/app/layout.tsx
// Source: https://nextjs.org/docs/app/getting-started/fonts
import { Cinzel, Cinzel_Decorative, EB_Garamond } from 'next/font/google';

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '600', '700', '900'],
  variable: '--font-cinzel',
  display: 'swap',
});

const cinzelDecorative = Cinzel_Decorative({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-cinzel-dec',
  display: 'swap',
});

const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-garamond',
  display: 'swap',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${cinzel.variable} ${cinzelDecorative.variable} ${ebGaramond.variable}`}>
      <body className="bg-navy font-garamond text-text-light">
        {children}
      </body>
    </html>
  );
}
```

### Pattern 4: Custom Claims Role Hierarchy

**What:** Five-tier role stored as integer `roleLevel` in custom claims. Set server-side only via Admin SDK. Integer comparison in Firestore rules.

**When to use:** Auth-07, AUTH-08 implementation. Role promotion endpoint + Firestore security rules.

```typescript
// src/lib/auth/claims.ts  (server-only)
// Source: https://firebase.google.com/docs/auth/admin/custom-claims

export const ROLE_LEVELS = {
  guest: 0,
  registered: 1,
  moderator: 2,
  admin: 3,
  superAdmin: 4,
} as const;

export type RoleLevel = typeof ROLE_LEVELS[keyof typeof ROLE_LEVELS];

// Called from Server Action or API Route — never from client
import { getAdminAuth } from '@/lib/firebase/admin';

export async function setUserRole(uid: string, roleLevel: RoleLevel) {
  const auth = getAdminAuth();
  await auth.setCustomUserClaims(uid, { roleLevel });
  // Log to Firestore audit collection
}

export async function getUserRoleLevel(uid: string): Promise<RoleLevel> {
  const auth = getAdminAuth();
  const user = await auth.getUser(uid);
  return (user.customClaims?.roleLevel ?? ROLE_LEVELS.guest) as RoleLevel;
}
```

```javascript
// firestore.rules — excerpt
// Source: https://firebase.google.com/docs/firestore/security/rules-and-auth

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function roleLevel() {
      return request.auth.token.roleLevel != null
        ? request.auth.token.roleLevel
        : 0;
    }

    function isRegistered() { return roleLevel() >= 1; }
    function isModerator()  { return roleLevel() >= 2; }
    function isAdmin()      { return roleLevel() >= 3; }
    function isSuperAdmin() { return roleLevel() >= 4; }
    function isOwner(uid)   { return request.auth.uid == uid; }

    // Audit log: only backend Admin SDK writes, clients can only read own entries
    match /roleAuditLog/{entry} {
      allow read: if isAdmin();
      allow write: if false; // Admin SDK only
    }

    // Users collection
    match /users/{uid} {
      allow read: if request.auth != null;
      allow write: if isOwner(uid) || isAdmin();
    }
  }
}
```

### Pattern 5: Token Refresh After Role Promotion

**What:** After setting custom claims server-side, force the client to refresh their ID token so the new `roleLevel` is available immediately.

**When to use:** After any call to `setCustomUserClaims` — mandatory.

```typescript
// In the admin promotion Server Action — after setUserRole() call:
// Return a flag to the client instructing refresh

// On the client (in admin UI component):
import { getAuth } from 'firebase/auth';

async function handlePromotionComplete() {
  // Force token refresh — new roleLevel claim available immediately
  const idToken = await getAuth().currentUser?.getIdToken(true);
  // Re-fetch session cookie via /api/login to update HttpOnly cookie
}
```

### Pattern 6: Firebase Admin SDK Initialization (Next.js safe)

**What:** Admin SDK initialized once server-side with getApps() guard to prevent hot-reload re-initialization.

```typescript
// src/lib/firebase/admin.ts  (server-only — never import in client components)
import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

let adminApp: App;

function getAdminApp(): App {
  if (getApps().length === 0) {
    adminApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID!,
        privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      }),
    });
  } else {
    adminApp = getApps()[0];
  }
  return adminApp;
}

export const getAdminAuth = () => getAuth(getAdminApp());
export const getAdminFirestore = () => getFirestore(getAdminApp());
```

### Anti-Patterns to Avoid

- **Middleware-only auth enforcement:** Middleware is bypassable (CVE-2025-29927). Always enforce auth in Firestore rules AND server components, never only in middleware.
- **Custom claims as strings:** Storing `role: "admin"` requires exact string matching. Integer levels allow hierarchy checks with `>=` — much simpler rules.
- **Client-side custom claims setting:** `setCustomUserClaims` requires the Admin SDK. Any client-facing endpoint for role management must be a Server Action or API Route with the Admin SDK, never client-side.
- **Forgetting token refresh:** After promoting a user's role, their current session token still has the OLD claims until they call `getIdToken(true)`. The promotion UI must trigger this.
- **Importing firebase-admin in client components:** Admin SDK has Node.js dependencies that crash in the browser. Mark `admin.ts` as server-only (`import 'server-only'`).
- **Using tailwind.config.js with Tailwind v4:** v4 uses CSS-first config via `@theme` in globals.css. A `tailwind.config.js` is ignored in v4.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Session persistence across SSR | Custom cookie API routes | next-firebase-auth-edge | Handles JWT verification, rotating signing keys, Edge runtime, token expiry |
| JWT validation in middleware | Custom JOSE/node-jose code | next-firebase-auth-edge | Cryptographic pitfalls, clock skew handling, Firebase key rotation |
| Form validation + error display | Custom state machines | react-hook-form + zod | Uncontrolled inputs, debounce, async validation, accessibility attributes |
| Font loading optimization | Manual `<link>` tags or @import | next/font | next/font eliminates FOUT, self-hosts fonts, sets `font-display: optional` |
| Environment variable management | Hardcoded config objects | .env.local + Next.js env system | Secrets never in source code; Next.js distinguishes NEXT_PUBLIC_ vs server-only |

**Key insight:** The auth stack (Firebase Auth + next-firebase-auth-edge) handles all cryptographic token management. Any attempt to roll this manually will miss key rotation, token expiry edge cases, and cookie security attributes.

---

## Common Pitfalls

### Pitfall 1: CVE-2025-29927 Middleware Bypass
**What goes wrong:** Auth logic lives only in middleware. Attacker sends `x-middleware-subrequest` header, bypasses all route protection, reads private data.
**Why it happens:** Middleware was mistakenly treated as the single security layer.
**How to avoid:** Middleware = routing convenience only. Firestore security rules + Server Component `getTokens()` checks = actual security enforcement.
**Warning signs:** Any route that only redirects in middleware but doesn't verify auth in the Server Component or Firestore rule.

### Pitfall 2: Stale Custom Claims After Role Promotion
**What goes wrong:** Admin promotes user to moderator. User's token still shows `roleLevel: 1`. They can't access moderator features despite being promoted.
**Why it happens:** Custom claims are embedded in the JWT. Firebase does not push new claims to existing tokens. Token refresh is required.
**How to avoid:** After every `setCustomUserClaims()` call, the promoted user's client must call `getAuth().currentUser.getIdToken(true)` AND re-POST to `/api/login` to refresh the session cookie.
**Warning signs:** Role changes appear to do nothing until user logs out and back in.

### Pitfall 3: Firebase Dynamic Links Deprecated
**What goes wrong:** Using the old `actionCodeSettings` with Firebase Dynamic Links for password reset email. Dynamic Links was **deprecated August 2025**.
**Why it happens:** Old tutorials still reference Dynamic Links.
**How to avoid:** Use plain `sendPasswordResetEmail(auth, email)` without `ActionCodeSettings.dynamicLinkDomain`. Firebase now uses direct links.
**Warning signs:** `firebasedynamiclinks.googleapis.com` anywhere in your code.

### Pitfall 4: Private Key Newline in Environment Variables
**What goes wrong:** `FIREBASE_PRIVATE_KEY` pasted into `.env.local` has literal `\n` instead of real newlines. Admin SDK throws `PEM_read_bio_PrivateKey` error.
**Why it happens:** PEM format requires real newlines but env vars serialize them as `\n`.
**How to avoid:** Always apply `.replace(/\\n/g, '\n')` when reading `process.env.FIREBASE_PRIVATE_KEY`.
**Warning signs:** "Error: Invalid PEM formatted message" during Admin SDK operations.

### Pitfall 5: Tailwind v4 Config File is Ignored
**What goes wrong:** Developer creates `tailwind.config.js` expecting v3-style configuration. Custom colors don't appear.
**Why it happens:** Tailwind v4 is CSS-first. The JS config file is not read.
**How to avoid:** All configuration goes in `globals.css` under the `@theme` directive.
**Warning signs:** Utility classes like `bg-navy` don't resolve even though they're defined in `tailwind.config.js`.

### Pitfall 6: Importing firebase-admin in Client Components
**What goes wrong:** Build fails with "Module not found: Can't resolve 'fs'" or crashes at runtime in browser.
**Why it happens:** firebase-admin requires Node.js built-ins (fs, net, tls) that don't exist in the browser.
**How to avoid:** Add `import 'server-only'` at the top of `admin.ts`. Next.js will throw a build error if a client component tries to import it.
**Warning signs:** Webpack errors about Node built-ins; `fs` module missing.

### Pitfall 7: Next.js 15 cookies() is Async
**What goes wrong:** `const cookieStore = cookies()` — missing `await`. TypeScript may not catch this. Silent auth failures.
**Why it happens:** Next.js 15 made cookies() and headers() async (breaking change from Next.js 14).
**How to avoid:** Always `const cookieStore = await cookies()` in Server Components and middleware.
**Warning signs:** `getTokens` returns null unexpectedly; users appear unauthenticated even with valid cookies.

---

## Code Examples

### Firebase Client SDK Initialization (Singleton)
```typescript
// src/lib/firebase/client.ts
// Source: Firebase JS SDK documentation
import { initializeApp, getApps, getApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export default app;
```

### User Registration with Session Cookie Creation
```typescript
// src/app/(auth)/register/actions.ts — Server Action
'use server';
import { getAdminAuth } from '@/lib/firebase/admin';
import { ROLE_LEVELS } from '@/lib/auth/claims';

export async function registerUser(uid: string) {
  // Set initial role claim on new account
  await getAdminAuth().setCustomUserClaims(uid, { roleLevel: ROLE_LEVELS.registered });
}

// src/app/(auth)/register/page.tsx — Client Component
// 1. createUserWithEmailAndPassword (client SDK)
// 2. getIdToken() from new user
// 3. POST to /api/login with idToken — creates session cookie
// 4. Redirect to /dashboard
```

### Server Component Auth Check (Defense-in-Depth)
```typescript
// src/app/(main)/admin/page.tsx
// Source: https://next-firebase-auth-edge-docs.vercel.app/docs/getting-started/layout
import { getTokens } from 'next-firebase-auth-edge';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ROLE_LEVELS } from '@/lib/auth/claims';

export default async function AdminPage() {
  const tokens = await getTokens(await cookies(), {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    cookieName: 'AuthToken',
    cookieSignatureKeys: [process.env.COOKIE_SECRET_CURRENT!],
    serviceAccount: {
      projectId: process.env.FIREBASE_PROJECT_ID!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    },
  });

  // Defense-in-depth: verify in Server Component even if middleware already checked
  if (!tokens || (tokens.decodedToken.roleLevel ?? 0) < ROLE_LEVELS.admin) {
    redirect('/dashboard');
  }

  return <AdminDashboard />;
}
```

### Seed Super Admin Script
```typescript
// scripts/seed-super-admin.ts — run once via ts-node
// Source: Firebase Admin SDK docs
import * as admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID!,
    privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
  }),
});

async function seedSuperAdmin(email: string) {
  const user = await admin.auth().getUserByEmail(email);
  await admin.auth().setCustomUserClaims(user.uid, { roleLevel: 4 });
  console.log(`Super admin set for: ${email}`);
}

seedSuperAdmin(process.env.SUPER_ADMIN_EMAIL!).then(() => process.exit(0));
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| tailwind.config.js | CSS-first @theme in globals.css | Tailwind v4 (Jan 2025) | No JS config file needed; CSS variables are the source of truth |
| Dynamic Links for email actions | Direct Firebase Auth links | August 2025 (deprecation) | Remove `dynamicLinkDomain` from ActionCodeSettings |
| `cookies()` synchronous | `await cookies()` async | Next.js 15 (stable Oct 2024) | All server cookie reads must be awaited |
| Middleware-only auth | Defense-in-depth (middleware + rules + server checks) | CVE-2025-29927 (March 2025) | Middleware is routing convenience, not security |
| create-next-app --tailwind (v3) | Manual Tailwind v4 install | Next.js 15.2 (2025) | create-next-app now supports v4 flag as of 15.2 |

**Deprecated/outdated:**
- `tailwind.config.js`: Ignored by Tailwind v4 — use @theme in CSS
- Firebase Dynamic Links: Deprecated August 2025 — use plain sendPasswordResetEmail
- Synchronous `cookies()` / `headers()`: Deprecated in Next.js 15 — must await both
- `next-firebase-auth` (gladly-team): Older library, not updated for App Router — use `next-firebase-auth-edge` instead

---

## Open Questions

1. **Firebase project "ekklesia-agora" — is it already initialized with Auth and Firestore enabled?**
   - What we know: CONTEXT.md states "Firebase project ekklesia-agora already configured — Auth and Firestore ready"
   - What's unclear: Whether the service account JSON/credentials have been downloaded, and whether the NEXT_PUBLIC_ env vars are already available
   - Recommendation: Plan 01-01 wave 0 task should verify/document the Firebase project config and obtain service account credentials

2. **Firestore data model for `users` collection**
   - What we know: STATE.md mandates Firestore data model designed in Phase 1
   - What's unclear: Whether the users collection needs a `roleLevel` field mirroring the custom claim (denormalized for Firestore rule queries that can't read custom claims from other users)
   - Recommendation: Store `roleLevel` in both custom claims (for token-based checks) AND in the `users/{uid}` document (for queries that need to filter by role). Keep them in sync via the same Admin SDK endpoint.

3. **PostCSS configuration file format**
   - What we know: Tailwind v4 requires `postcss.config.mjs` (ESM)
   - What's unclear: Whether `create-next-app` creates `postcss.config.js` (CJS) — if so, it needs to be replaced
   - Recommendation: After `create-next-app`, delete any `postcss.config.js` and create `postcss.config.mjs` with the `@tailwindcss/postcss` plugin

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 29 + React Testing Library 16 |
| Config file | `jest.config.ts` — Wave 0 (does not exist yet) |
| Quick run command | `npx jest --testPathPattern="auth\|roles\|theme" --passWithNoTests` |
| Full suite command | `npx jest --coverage` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | `registerUser()` sets `roleLevel: 1` claim after account creation | unit | `npx jest tests/auth/register.test.ts -x` | Wave 0 |
| AUTH-02 | `getTokens()` returns valid user from cookie; returns null for missing cookie | unit | `npx jest tests/auth/session.test.ts -x` | Wave 0 |
| AUTH-03 | `sendPasswordResetEmail` called with correct email — no throw | unit (mocked) | `npx jest tests/auth/reset.test.ts -x` | Wave 0 |
| AUTH-04 | Logout clears session cookie | unit | `npx jest tests/auth/logout.test.ts -x` | Wave 0 |
| AUTH-05 | Middleware `handleInvalidToken` returns `NextResponse.next()` for public paths | unit | `npx jest tests/middleware/public-routes.test.ts -x` | Wave 0 |
| AUTH-06 | `setUserRole(uid, 3)` calls `auth.setCustomUserClaims` with `{ roleLevel: 3 }` | unit (Admin SDK mocked) | `npx jest tests/auth/claims.test.ts -x` | Wave 0 |
| AUTH-07 | Promotion endpoint rejects caller with `roleLevel < 3`; accepts caller with `roleLevel >= 3` | unit | `npx jest tests/auth/claims.test.ts -x` | Wave 0 |
| AUTH-08 | `isModerator()` returns false for roleLevel 1; true for roleLevel 2+ | unit | `npx jest tests/auth/roles.test.ts -x` | Wave 0 |
| DES-01 | `--color-navy` CSS variable resolves to `#0d1b2e` in rendered output | snapshot | `npx jest tests/ui/theme.test.ts -x` | Wave 0 |
| DES-02 | Nav renders hamburger menu element below md breakpoint | unit (RTL) | `npx jest tests/components/nav.test.tsx -x` | Wave 0 |
| DES-03 | Auth logic lives in `/lib` with no Next.js-specific imports | lint/static | manual review | N/A |

### Sampling Rate
- **Per task commit:** `npx jest --testPathPattern="(auth|roles|claims)" --passWithNoTests`
- **Per wave merge:** `npx jest --coverage`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `jest.config.ts` — base Jest configuration with jsdom environment and path aliases
- [ ] `jest.setup.ts` — jest-dom matchers
- [ ] `tests/auth/register.test.ts` — covers AUTH-01
- [ ] `tests/auth/session.test.ts` — covers AUTH-02
- [ ] `tests/auth/reset.test.ts` — covers AUTH-03
- [ ] `tests/auth/logout.test.ts` — covers AUTH-04
- [ ] `tests/middleware/public-routes.test.ts` — covers AUTH-05
- [ ] `tests/auth/claims.test.ts` — covers AUTH-06, AUTH-07
- [ ] `tests/auth/roles.test.ts` — covers AUTH-08
- [ ] `tests/ui/theme.test.ts` — covers DES-01
- [ ] `tests/components/nav.test.tsx` — covers DES-02
- [ ] Framework install: `npm install --save-dev jest @types/jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom`

---

## Sources

### Primary (HIGH confidence)
- [next-firebase-auth-edge GitHub](https://github.com/awinogrodzki/next-firebase-auth-edge) — middleware config, getTokens, Next.js 15 compatibility
- [next-firebase-auth-edge docs](https://next-firebase-auth-edge-docs.vercel.app/docs/usage/middleware) — authMiddleware options, handleValidToken/handleInvalidToken
- [Tailwind CSS v4 official blog](https://tailwindcss.com/blog/tailwindcss-v4) — @theme directive, CSS-first config
- [Tailwind CSS theme docs](https://tailwindcss.com/docs/theme) — @theme token syntax and --color-* naming
- [Tailwind CSS + Next.js install guide](https://tailwindcss.com/docs/guides/nextjs) — exact v4 installation steps
- [Next.js Font Optimization docs](https://nextjs.org/docs/app/getting-started/fonts) — next/font Google Fonts with CSS variables
- [Firebase custom claims docs](https://firebase.google.com/docs/auth/admin/custom-claims) — setCustomUserClaims, size limits, token refresh
- [Firebase Firestore security rules](https://firebase.google.com/docs/firestore/security/rules-and-auth) — request.auth.token access pattern

### Secondary (MEDIUM confidence)
- [CVE-2025-29927 analysis - ProjectDiscovery](https://projectdiscovery.io/blog/nextjs-middleware-authorization-bypass) — vulnerability details and affected versions
- [Firebase RBAC with Custom Claims - FreeCodeCamp](https://www.freecodecamp.org/news/firebase-rbac-custom-claims-rules/) — role hierarchy patterns in Firestore rules
- [Initializing Firebase Admin with env vars - Ben Ilegbodu](https://www.benmvp.com/blog/initializing-firebase-admin-node-sdk-env-vars/) — private key \n replacement pattern
- [Next.js 15 Jest testing guide - Wisp CMS](https://www.wisp.blog/blog/how-to-use-jest-with-nextjs-15-a-comprehensive-guide) — jest.config.ts setup for App Router

### Tertiary (LOW confidence, flag for validation)
- Firebase Dynamic Links deprecated August 2025 — sourced from search snippet, not official deprecation notice. Verify in Firebase console or changelog before removing ActionCodeSettings entirely.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Next.js 15, Firebase, Tailwind v4, next-firebase-auth-edge all verified via official docs and active repos
- Architecture: HIGH — patterns derived from official next-firebase-auth-edge docs and Firebase Admin SDK docs
- Pitfalls: HIGH (CVE verified, Next.js 15 async cookies verified) / MEDIUM (Dynamic Links deprecation — verify independently)
- Validation: MEDIUM — Jest setup pattern verified via official Next.js testing docs; specific test file contents are Wave 0 outputs not yet validated

**Research date:** 2026-03-16
**Valid until:** 2026-04-16 (30 days — stable ecosystem; re-verify next-firebase-auth-edge version before planning if more than 2 weeks pass)
