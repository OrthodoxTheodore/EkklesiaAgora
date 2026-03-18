# Ekklesia Agora

## What This Is

Ekklesia Agora is an Orthodox Christian video-sharing + social media platform — the "YouTube/Facebook of the Orthodox world." It combines video sharing, a social feed (the Agora), a Scripture library, Church Fathers texts, liturgical calendar, and people finder, all within a Byzantine aesthetic.

**Goal:** Build a working prototype to present to the creator's priest and bishop for blessing to proceed at full scale.

## Critical Rules

- **"Orthodox" always means canonically Eastern Orthodox** — never Oriental Orthodox, never generic. This applies to all code, UI text, content categories, and documentation.
- **Byzantine aesthetic must be maintained:** Navy `#0d1b2e`, gold `#c9a84c`, Cinzel headings, EB Garamond body text.
- **Content integrity:** All theological content evaluated against the Orthodox Study Bible, Synaxarion, Gospels, Apostolic writings, liturgical texts, and Church Fathers.
- **Budget is minimal** — use free-tier services (Firebase free tier, open-source tools) wherever possible.

## Tech Stack

- **Frontend:** React / Next.js 15, Tailwind CSS v4
- **Backend:** Firebase (Auth, Firestore, Storage) — project ID: `ekklesia-agora`
- **Fonts:** Cinzel (headings), EB Garamond (body)
- **Future mobile:** React Native (shared code architecture)

## Bible Text Sources

- **Old Testament:** Brenton's English Septuagint (1851) — public domain
- **New Testament:** Eastern Orthodox Bible (EOB), Patriarchal Text of 1904 — free for non-commercial Orthodox use
- **Church Fathers:** Ante-Nicene, Nicene, and Post-Nicene Fathers series — all public domain
- **NKJV:** Rejected (copyrighted by Thomas Nelson)
- **Catena Bible App:** Oriental Orthodox source — structural inspiration only, not a data source

## Project Structure

```
.planning/                    # GSD workflow planning directory
  PROJECT.md                  # Project definition and key decisions
  REQUIREMENTS.md             # 82 v1 requirements with traceability
  ROADMAP.md                  # 7-phase roadmap
  STATE.md                    # Current progress state
  config.json                 # GSD workflow config
  research/                   # Pre-planning research docs
  phases/01-foundation/       # Phase 1 plans and research
index (23).html               # Original HTML/CSS mockup (design reference)
Ekklesia_Agora.jpg            # Brand image / logo
```

## Current Status

- **Phase:** 1 of 7 (Foundation)
- **Progress:** 0% — planning complete, no code written yet
- **Phase 1 plans are ready** (3 plans in `.planning/phases/01-foundation/`)
- **Next step:** Execute Phase 1, Plan 01-01 (Next.js + Firebase init, Tailwind Byzantine theme, app shell)

## Phases Overview

1. **Foundation** — Auth, roles, Byzantine design system (3 plans ready)
2. **Social Core** — Profiles, Agora feed, notifications
3. **Video Hub + Moderation** — Upload, playback, channels, mod console
4. **Orthodox Identity** — Liturgical calendar, Synodeia people finder
5. **Scripture Library** — Brenton LXX + EOB NT, search, reader
6. **Patristic Library + Study Guides** — Church Fathers, learning paths
7. **Discovery + Messaging** — Global search, DMs

## GSD Workflow

This project uses the GSD (Get Stuff Done) planning framework. Key commands:
- `/gsd:progress` — Check current status and next action
- `/gsd:execute-phase` — Execute plans for current phase
- `/gsd:plan-phase` — Plan the next phase

## Key Decisions Already Made

- React/Next.js over single-file HTML (scalability)
- Firebase stays as backend (already configured, free tier)
- Verified/unverified account tiers for moderation
- Web-first, mobile later
- No wiki-style content (OrthodoxWiki exists)
- DMCA agent registration required before any user uploads go live
- Firestore data model uses fan-out feed pattern, likes as subcollections
