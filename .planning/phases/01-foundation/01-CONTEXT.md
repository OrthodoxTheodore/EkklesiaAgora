# Phase 1: Foundation - Context

**Gathered:** 2026-03-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can securely access the platform within a fully realized Byzantine design system, with all five role tiers enforced from day one. Delivers: email/password auth (register, login, logout, password reset, session persistence), role hierarchy (guest > registered > moderator > admin > super admin), and the Next.js + Firebase + Tailwind v4 project foundation with Byzantine theming.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion

User trusts Claude's judgment on all implementation areas. The following are Claude's recommended decisions, grounded in the existing HTML mockup and project requirements:

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

</decisions>

<specifics>
## Specific Ideas

- The HTML mockup (index (23).html) establishes the complete Byzantine design language: navy #0d1b2e, gold #c9a84c, Cinzel/EB Garamond typography, subtle gold grid overlay, card patterns with gold borders
- Mockup includes modal forms, sticky nav, button styles (.btn-gold, .btn-outline), avatar components, sidebar cards — all should be translated to Tailwind v4 + React components
- The Ekklesia_Agora.jpg logo is used in the nav and hero — carry forward into Next.js layout

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `index (23).html`: Full CSS design system with variables (--navy, --gold, --text-light, etc.), component patterns (nav, modals, forms, cards, buttons, avatars), and responsive structure
- `Ekklesia_Agora.jpg`: Brand logo image for nav and hero sections

### Established Patterns
- Color palette: CSS custom properties (--navy:#0d1b2e, --navy-mid:#152338, --navy-light:#1e3352, --gold:#c9a84c, --gold-bright:#e8c96a, --gold-dim:#8a6f30, --gold-pale:#f0dfa0, --text-light:#e8dfc8, --text-mid:#b8a888, --crimson:#8b1a1a)
- Typography: Cinzel (headings, labels, buttons — uppercase, letter-spacing), Cinzel Decorative (brand/hero titles), EB Garamond (body text, inputs)
- Form fields: dark semi-transparent backgrounds, gold-dim borders, gold-dim focus states
- Buttons: .btn-gold (gradient gold, navy text), .btn-outline (transparent, gold border)
- Cards: navy-mid background, gold border at 0.15 opacity, 6px border-radius
- Navigation: sticky top, gradient background, 70px height, gold-dim bottom border

### Integration Points
- Firebase project "ekklesia-agora" already configured — Auth and Firestore ready
- No existing Next.js project — clean initialization needed
- Tailwind v4 must be configured to match the mockup's CSS variable system

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-16*
