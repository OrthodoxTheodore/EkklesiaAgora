---
phase: 01-foundation
plan: "03"
subsystem: auth
tags: [auth, firebase, roles, rbac, firestore-rules, admin-sdk, server-actions, testing, byzantine-ui]
dependency_graph:
  requires:
    - phase: 01-02
      provides: "session cookie auth, Admin SDK setup, dashboard Server Component pattern"
    - phase: 01-01
      provides: "Next.js scaffold, Byzantine theme, Firebase SDK, jest config"
  provides:
    - five-tier-role-hierarchy
    - setUserRole-server-function
    - role-audit-logging
    - firestore-security-rules-with-role-enforcement
    - super-admin-seed-script
    - admin-page-with-defense-in-depth
    - user-role-manager-ui
    - guest-prompt-modal
    - navbar-role-awareness
  affects:
    - 02 (Social Core — all user interactions gated by role)
    - 03 (Video Hub — mod console uses moderator/admin role)
    - all future phases (role system is the auth foundation)
tech_stack:
  added: []
  patterns:
    - "Server Component calls getTokens() for defense-in-depth role check beyond middleware"
    - "Server Action (actions.ts) validates caller role before calling Admin SDK"
    - "setUserRole writes to both Firebase Auth custom claims AND Firestore users doc (denormalization for queries)"
    - "Firestore rules use integer roleLevel comparison for role hierarchy enforcement"
    - "roleAuditLog writes via Admin SDK only (Firestore rules block client writes)"
    - "Privilege escalation guard: caller cannot assign role >= own level (except super admin)"
key_files:
  created:
    - src/lib/auth/claims.ts
    - src/app/(main)/admin/actions.ts
    - src/app/(main)/admin/page.tsx
    - src/components/admin/UserRoleManager.tsx
    - src/components/auth/GuestPromptModal.tsx
    - scripts/seed-super-admin.ts
    - firestore.rules
    - tests/auth/claims.test.ts
    - tests/auth/roles.test.ts
  modified:
    - src/components/auth/AuthProvider.tsx (added roleLevel from ID token claims)
    - src/components/nav/Navbar.tsx (added Admin link for admin+ roles)
    - package.json (added seed:admin npm script)
    - .env.example (added SUPER_ADMIN_EMAIL)
key_decisions:
  - "Admin page uses getTokens() directly in Server Component — not relying on middleware alone for role enforcement (defense-in-depth)"
  - "roleAuditLog collection is write:false in Firestore rules — only Admin SDK (server-side) can write audit entries"
  - "Firestore users doc denormalizes roleLevel for collection queries — Firebase Auth custom claims not queryable across users"
  - "Admin (roleLevel 3) limited to assigning up to moderator (2) — prevents admin proliferation without super admin approval"
  - "Privilege escalation prevention: non-super-admin callers cannot assign role >= own level"
  - "GuestPromptModal designed as reusable trigger — future phases pass action prop for context-specific messages"
patterns_established:
  - "Defense-in-depth: Server Components verify role independently of middleware"
  - "Permission gates in Server Actions before every mutation"
  - "Role hierarchy enforced at three layers: Firestore rules, Server Actions, and Server Components"
requirements_completed:
  - AUTH-06
  - AUTH-07
  - AUTH-08
metrics:
  duration_minutes: 45
  completed_date: "2026-03-17"
  tasks_completed: 2
  files_created: 9
  files_modified: 4
  commits: 3
---

# Phase 1 Plan 03: Role Hierarchy & Admin UI Summary

**Five-tier RBAC with admin promotion UI, Firestore rules enforcing integer roleLevel claims, audit logging, and 16 passing behavioral tests covering privilege escalation, super admin promotion, and role hierarchy ordering.**

## Performance

- **Duration:** ~45 min (across two sessions — interrupted and resumed)
- **Started:** 2026-03-17
- **Completed:** 2026-03-17
- **Tasks:** 2 (Task 3 is checkpoint:human-verify, not auto)
- **Files created:** 9
- **Files modified:** 4

## Accomplishments

- Five-tier role hierarchy (guest:0, registered:1, moderator:2, admin:3, superAdmin:4) fully enforced at Firestore rules, Server Actions, and Server Components
- Admin page with defense-in-depth: verifies roleLevel >= 3 in Server Component independently of middleware
- User search and role promotion UI with permission-filtered dropdowns and audit logging
- Guest prompt modal ready for future interaction gates with customizable `action` prop
- 16 behavioral tests passing: claims manipulation, privilege escalation prevention, hierarchy ordering

## Task Commits

Each task was committed atomically:

1. **Task 1: Role promotion server logic, Firestore rules, seed script, role tests** - `9d3d8a0` (feat)
2. **Task 2 (part 1): UserRoleManager, GuestPromptModal, AuthProvider roleLevel, Navbar admin links** - `dae6fe4` (feat)
3. **Task 2 (part 2): Admin page** - `de1da0f` (feat)

## Files Created/Modified

- `src/lib/auth/claims.ts` — setUserRole (sets Firebase Auth custom claims, denormalizes to Firestore, logs to roleAuditLog), getUserRoleLevel, searchUsersByEmail
- `src/app/(main)/admin/actions.ts` — promoteUser Server Action with caller permission check, searchUsers Server Action
- `src/app/(main)/admin/page.tsx` — Admin settings page (Server Component with defense-in-depth role check)
- `src/components/admin/UserRoleManager.tsx` — User search and role promotion UI (Client Component)
- `src/components/auth/GuestPromptModal.tsx` — Sign-in prompt modal for guest interaction attempts
- `src/components/auth/AuthProvider.tsx` — Updated to read roleLevel from ID token custom claims via onIdTokenChanged
- `src/components/nav/Navbar.tsx` — Shows Admin nav link for admin+ users
- `firestore.rules` — Firestore security rules with roleLevel helper functions, role hierarchy enforcement, roleAuditLog read-only
- `scripts/seed-super-admin.ts` — CLI script to set initial super admin via SUPER_ADMIN_EMAIL env var
- `tests/auth/claims.test.ts` — 11 tests: setUserRole claims/Firestore/audit-log behavior, promoteUser permission logic
- `tests/auth/roles.test.ts` — 5 tests: ROLE_LEVELS values, isAtLeast logic, hierarchy ordering, getRoleName display

## Decisions Made

- **Defense-in-depth on admin page:** `getTokens()` called in the Server Component to verify roleLevel >= 3 independently. Middleware blocks unauthenticated users but does not check role — this layer prevents middleware bypass from exposing admin functionality.
- **roleAuditLog write:false in Firestore rules:** Audit log entries are written exclusively via Admin SDK (Server Actions). Client-side writes are blocked at the rules layer, ensuring log integrity.
- **Denormalized roleLevel in Firestore users doc:** Firebase Auth custom claims are not queryable across users in Firestore rules or client queries. Denormalizing to users/{uid} enables admin search by role and future feed filtering.
- **Admin capped at moderator promotion:** Admin (3) can only assign up to moderator (2). Creating another admin requires super admin, preventing admin proliferation.
- **Privilege escalation guard:** Non-super-admin callers cannot set a role equal to or higher than their own. Super admin (4) is exempt as they are the ceiling.

## Deviations from Plan

None — plan executed exactly as written. The execution was split across two sessions (interrupted and resumed), but no unplanned changes were required.

## Issues Encountered

None — tests passed first run. TypeScript compiled cleanly with no errors.

## User Setup Required

To seed the initial super admin:

1. Add `SUPER_ADMIN_EMAIL=your@email.com` to `.env.local`
2. Run `npm run seed:admin`
3. Log out and back in to pick up the new super admin claims
4. Visit `/admin` — the Administration page should render with full permissions

## Next Phase Readiness

- Role system is complete and ready for Phase 2 (Social Core)
- All future content features (posts, likes, comments, moderation) can gate on roleLevel from AuthProvider
- GuestPromptModal is ready to be triggered by any interaction attempt — import and pass `isOpen`/`onClose`/`action` props
- Firestore rules are extensible — Phase 2 will add collections (posts, likes, comments) following the same roleLevel helper pattern

## Self-Check: PASSED

All key files exist on disk. All three task commits found in git log:
- `9d3d8a0` feat(01-03): role promotion server logic, Firestore rules, seed script, role tests
- `dae6fe4` feat(01-03): add admin navbar links, roleLevel in AuthContext, UserRoleManager, GuestPromptModal
- `de1da0f` feat(01-03): add admin page with defense-in-depth role check

Jest auth suite: 16 passing, 0 failures. TypeScript: 0 errors.

---
*Phase: 01-foundation*
*Completed: 2026-03-17*
