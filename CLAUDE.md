# The McGarraugh Family Website

Family site for the American descendants of **Major Joseph McGarraugh (1738–1810)**: born in Ulster, officer in the American Revolutionary War, died in Fayette County, Pennsylvania.

The previous project in this repo (Ekklesia Agora) is preserved on the `ekklesia-agora-archive` branch.

## Rules

- **Never invent family facts.** Names, dates, units, spouses, and children go in only when the family supplies them, ideally with a source. General historical context is fine if accurate. Unknowns are listed as open questions.
- **Living people stay private** unless they have given permission.
- **Free hosting only, for now.** The site is a static export (`output: "export"`) so any free host works. A custom `.com` comes later.

## Stack

- Next.js 15 (App Router, static export to `/out`), React 19, Tailwind CSS v4, TypeScript
- Firebase (client SDK only; the site stays a static export): Auth (email/password; Google sign-in not yet enabled), Firestore. Free Spark plan, so no Cloud Storage: applicants paste record links or email documents. Config in `src/lib/firebase-config.ts`; when it is empty, membership pages show "opening soon"
- Security lives in `firestore.rules`, not in page code. Deploy them with the Firebase CLI after any change
- The "Share Your Line" form still opens the visitor's email app (`mailto:`)
- Fonts: IM Fell English (headings), Libre Caslon Text (body)
- Palette (in `src/app/globals.css`): Continental blue `#1f3354`, buff `#d6c08f`, parchment `#f5efe2`, claret `#7d2c2a`, Ulster green `#3d5a45`

## Membership

- Anyone can sign up; accounts start `pending`. An admin approves the application on `/admin/`, which sets `users/{uid}.status` to `member`
- Members add people to the tree (`people` collection, `parentId` → a curated id in `src/data/family.ts` or another `people` doc). Additions show at once, flagged "Not yet reviewed" until an admin marks them reviewed
- Living people added by members are readable by members only (enforced in `firestore.rules`)
- Applications (`applications/{uid}`) are readable only by the applicant and admins
- The first admin is set by hand in the Firestore console: `users/{uid}` → `status: "member"`, `role: "admin"`

## Where content lives

- `src/data/site.ts`: site name, nav, family contact email
- `src/data/family.ts`: the family tree (nested `children`) and surname spelling variants
- `src/data/timeline.ts`: timeline entries (`family` vs `history`)
- Pages: `src/app/{joseph,family,timeline,research,connect}/page.tsx`

## Commands

- `npm run dev`: local dev server
- `npm run build`: static build into `/out`
- `npm run lint`
