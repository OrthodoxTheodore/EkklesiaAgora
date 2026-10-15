# The McGarraugh Family Website

Family site for the American descendants of **Major Joseph McGarraugh (1738–1809)**: born in Ulster, officer in the American Revolutionary War, died in Fayette County, Pennsylvania.

The previous project in this repo (Ekklesia Agora) is preserved on the `ekklesia-agora-archive` branch.

## Rules

- **Never invent family facts.** Names, dates, units, spouses, and children go in only when the family supplies them, ideally with a source. General historical context is fine if accurate. Unknowns are listed as open questions.
- **Living people stay private** unless they have given permission.
- **Free hosting only, for now.** The site is a static export (`output: "export"`) so any free host works. A custom `.com` comes later.

## Stack

- Next.js 15 (App Router, static export to `/out`), React 19, Tailwind CSS v4, TypeScript
- No backend. The contact form opens the visitor's email app (`mailto:`)
- Fonts: IM Fell English (headings), Libre Caslon Text (body)
- Palette (in `src/app/globals.css`): Continental blue `#1f3354`, buff `#d6c08f`, parchment `#f5efe2`, claret `#7d2c2a`, Ulster green `#3d5a45`

## Where content lives

- `src/data/site.ts`: site name, nav, family contact email
- `src/data/family.ts`: the family tree (nested `children`) and surname spelling variants
- `src/data/timeline.ts`: timeline entries (`family` vs `history`)
- Pages: `src/app/{joseph,family,timeline,research,connect}/page.tsx`

## Commands

- `npm run dev`: local dev server
- `npm run build`: static build into `/out`
- `npm run lint`
