---
phase: 01-foundation
plan: "02"
subsystem: auth
tags: [auth, firebase, react-hook-form, zod, session-cookies, server-actions, testing, byzantine-ui]
dependency_graph:
  requires:
    - next.js-15-project-scaffold
    - tailwind-v4-byzantine-theme
    - firebase-client-sdk
    - firebase-admin-sdk
    - next-firebase-auth-edge-middleware
    - jest-test-infrastructure
  provides:
    - email-password-registration
    - email-password-login
    - session-cookie-auth
    - password-reset-flow
    - logout-flow
    - dashboard-server-auth-check
    - byzantine-ui-components
    - auth-zod-schemas
  affects:
    - 01-03 (role management — claims foundation laid here)
tech_stack:
  added:
    - "@testing-library/user-event@^14"
  patterns:
    - react-hook-form + zodResolver for form validation
    - fetch /api/login with Firebase ID token to create HttpOnly session cookie
    - Server Action for Admin SDK setCustomUserClaims (avoids client-SDK admin calls)
    - Double token refresh pattern: create user → set claims → force getIdToken(true) → re-POST /api/login
    - Anti-enumeration: reset password always shows success message regardless of email existence
    - Defense-in-depth: dashboard Server Component calls getTokens() independent of middleware
key_files:
  created:
    - src/components/ui/Button.tsx
    - src/components/ui/Input.tsx
    - src/components/ui/Card.tsx
    - src/lib/auth/schemas.ts
    - src/app/(auth)/layout.tsx
    - src/app/actions/auth.ts
  modified:
    - src/app/(auth)/register/page.tsx (replaced placeholder)
    - src/app/(auth)/login/page.tsx (replaced placeholder)
    - src/app/(auth)/reset-password/page.tsx (replaced placeholder)
    - src/app/(main)/dashboard/page.tsx (replaced placeholder)
    - src/components/nav/Navbar.tsx (added router.push('/') on logout)
    - tests/auth/register.test.ts (4 passing tests)
    - tests/auth/session.test.ts (2 passing tests)
    - tests/auth/reset.test.ts (4 passing tests)
    - tests/auth/logout.test.ts (3 passing tests)
decisions:
  - "Server Action used for setCustomUserClaims — keeps Admin SDK server-only and avoids exposing service account to client bundle"
  - "Double /api/login POST pattern: first creates initial session, second updates cookie after role claims are set"
  - "Anti-enumeration: reset-password always shows success even when Firebase throws auth/user-not-found"
  - "Logout tests mock useAuth directly (not AuthProvider context) — simpler than wrapping with context provider in tests"
  - "@testing-library/user-event added as devDependency for realistic form interaction testing"
metrics:
  duration_minutes: 7
  completed_date: "2026-03-18"
  tasks_completed: 2
  files_created: 6
  files_modified: 9
  commits: 2
---

# Phase 1 Plan 02: Authentication Flow Summary

Complete email/password authentication with HttpOnly session cookies, Byzantine-styled UI components, Zod validation schemas, and 13 passing behavioral tests covering registration, login persistence, password reset, and logout.

## What Was Built

### Byzantine UI Components

**`src/components/ui/Button.tsx`** — Reusable button with `gold` (gradient gold background, navy text) and `outline` (transparent, gold border) variants. Three sizes (sm/md/lg), loading spinner state, `forwardRef` for form compatibility.

**`src/components/ui/Input.tsx`** — Form input with Cinzel label (uppercase, gold-dim), gold-bordered input field (navy-light/50 background, EB Garamond text), and inline error display (gold-dim italic). `forwardRef` for react-hook-form `register()` compatibility.

**`src/components/ui/Card.tsx`** — Minimal card wrapper: navy-mid background, gold border at 0.15 opacity, 6px radius.

### Auth Validation Schemas (`src/lib/auth/schemas.ts`)

Three Zod schemas with exported TypeScript types:
- `registerSchema`: email, password (min 8, uppercase + lowercase + number), confirmPassword (must match)
- `loginSchema`: email, password (min 1 — no over-validation on login)
- `resetPasswordSchema`: email only

### Auth Pages

**Register (`src/app/(auth)/register/page.tsx`)** — react-hook-form + zodResolver for inline validation. On valid submit: `createUserWithEmailAndPassword` → POST `/api/login` (initial cookie) → Server Action `registerUser(uid)` sets `roleLevel: 1` → `getIdToken(true)` force-refresh → POST `/api/login` again (cookie updated with role) → redirect to `/dashboard`. Firebase error codes mapped to user-friendly messages.

**Login (`src/app/(auth)/login/page.tsx`)** — `signInWithEmailAndPassword` → get ID token → POST `/api/login` → redirect to `/dashboard`. Auth/wrong-password and auth/invalid-credential both map to generic "Invalid email or password" (no enumeration).

**Reset Password (`src/app/(auth)/reset-password/page.tsx`)** — `sendPasswordResetEmail`, errors swallowed in finally block. Always shows "If an account exists with that email..." success state — prevents email enumeration.

**Auth Layout (`src/app/(auth)/layout.tsx`)** — Vertically and horizontally centered wrapper for all auth pages.

### Dashboard (`src/app/(main)/dashboard/page.tsx`)

Server Component using `getTokens(await cookies(), authConfig)` to verify the session cookie independently of middleware. Redirects to `/login` if tokens absent. Displays user email and role name (from decoded token's `roleLevel` claim via `getRoleName()`).

### Server Action (`src/app/actions/auth.ts`)

`registerUser(uid)` — calls `getAdminAuth().setCustomUserClaims(uid, { roleLevel: 1 })`. Server-only, safe to call from client components via the `'use server'` directive.

### Navbar Logout Update

Added `useRouter` and `router.push('/')` after `signOut` + `/api/logout` calls, completing the logout redirect flow.

### Behavioral Tests (13 passing)

| File | Tests |
|------|-------|
| `tests/auth/register.test.ts` | Form renders, weak password error, mismatched passwords error, Firebase called on valid submit |
| `tests/auth/session.test.ts` | setAuthCookies called with httpOnly config, session cookie max-age architecture |
| `tests/auth/reset.test.ts` | Form renders, sendPasswordResetEmail called, success message hides email existence, error still shows success |
| `tests/auth/logout.test.ts` | signOut called, /api/logout POSTed, router.push('/') called |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added @testing-library/user-event**
- **Found during:** Task 2 test implementation
- **Issue:** Tests required `userEvent.type()` for realistic form interaction; package was not in devDependencies from Plan 01-01
- **Fix:** `npm install --save-dev @testing-library/user-event`
- **Files modified:** `package.json`, `package-lock.json`
- **Commit:** `ea426bb`

**2. [Rule 1 - Bug] session.test.ts used `new Response()` not available in jsdom**
- **Found during:** First test run
- **Issue:** jsdom environment does not define `Response` globally; mock return value used `new Response(null, {status:200})` which threw `ReferenceError: Response is not defined`
- **Fix:** Changed mock return value to a plain object `{ status: 200, ok: true }`
- **Commit:** `ea426bb`

**3. [Rule 1 - Bug] logout.test.ts AuthProvider context not provided to Navbar**
- **Found during:** First test run
- **Issue:** Navbar uses `useAuth()` from AuthProvider context; rendering it without a provider wrapper returned the default context value (null user), causing the guest nav to render instead of the authenticated avatar menu
- **Fix:** Mocked `@/components/auth/AuthProvider` module directly to return an authenticated user from `useAuth()`, avoiding the need for a context wrapper
- **Commit:** `ea426bb`

**4. [Rule 2 - Missing Critical] Set process.env mock values in session.test.ts**
- **Found during:** Second test run
- **Issue:** `route.ts` reads env vars at module load time; when Jest required the module, `FIREBASE_PRIVATE_KEY` was undefined, causing `.replace()` to throw
- **Fix:** Added `process.env` assignments before the `require()` call in the test
- **Commit:** `ea426bb`

## Self-Check: PASSED

All key files exist on disk. Both task commits found in git log:
- `190eecd` feat(01-02): add Byzantine UI components and auth validation schemas
- `ea426bb` feat(01-02): implement complete auth flow and fill in auth test stubs

Build output: `next build` compiles with 0 errors, all 8 routes render correctly. Jest auth suite: 13 passing, 0 failures.
