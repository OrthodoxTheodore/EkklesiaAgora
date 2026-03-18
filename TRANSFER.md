# Ekklesia Agora — Project Transfer Guide

## For the New Developer

This document explains how to pick up this project on a new Claude Pro account.

## What You're Getting

A fully planned Orthodox Christian platform project with:
- Complete project definition, requirements (82 v1 requirements), and 7-phase roadmap
- Phase 1 (Foundation) has 3 detailed execution plans ready to go
- Deep research documents covering architecture, tech stack, features, and pitfalls
- An HTML mockup (`index (23).html`) showing the visual design language
- A brand image (`Ekklesia_Agora.jpg`)

**No application code has been written yet.** You're starting from the planning stage, ready to execute Phase 1.

## Setup Steps

### 1. Clone or Copy the Repository

Make sure you have this entire directory including the `.planning/` folder and `.git/` history.

### 2. Install Claude Code

If not already installed:
```bash
npm install -g @anthropic-ai/claude-code
```

### 3. Open the Project

```bash
cd "path/to/Ekklesia Agora"
claude
```

Claude Code will automatically read `CLAUDE.md` on startup and understand the project context.

### 4. Set Up GSD (Optional but Recommended)

The project uses the GSD planning framework. If your Claude Code instance has GSD installed, you can run:
- `/gsd:progress` to see current status
- `/gsd:execute-phase` to start building Phase 1

If GSD is not installed, you can still work from the plans directly — they're detailed enough to follow manually.

### 5. Firebase Setup

The Firebase project `ekklesia-agora` is already configured. You'll need:
- Access to the Firebase console for this project
- Firebase CLI installed: `npm install -g firebase-tools`
- Log in: `firebase login`

Ask Charles for Firebase project access if needed.

## Key Files to Read First

1. **`CLAUDE.md`** — Project rules and context (Claude reads this automatically)
2. **`.planning/PROJECT.md`** — Full project definition
3. **`.planning/ROADMAP.md`** — 7-phase build plan
4. **`.planning/REQUIREMENTS.md`** — All 82 requirements with traceability
5. **`.planning/phases/01-foundation/01-01-PLAN.md`** — First execution plan (start here)

## Important Context

- **"Orthodox" = Eastern Orthodox** — never Oriental Orthodox. This is a hard rule throughout the project.
- **Byzantine aesthetic** is non-negotiable: navy #0d1b2e, gold #c9a84c, Cinzel/EB Garamond fonts.
- **Budget is minimal** — free-tier Firebase, open-source everything.
- **This is a prototype** for presenting to clergy for blessing, not a production launch.
- **DMCA agent must be registered** ($6/year) before any user-uploaded content goes live.

## Git History

The repo has full commit history of all planning work. Run `git log --oneline` to see it.

## Questions?

Contact Charles McGarraugh (Cmcgarraugh@live.com) for:
- Firebase project access
- Design/theological questions
- Vision and priority decisions
