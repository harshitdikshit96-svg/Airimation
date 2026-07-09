# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install      # install dependencies
npm run dev      # start dev server (Turbopack) at http://localhost:3000
npm run build    # production build (also runs the TypeScript check)
npm run start    # serve the production build locally
npm run lint      # eslint (flat config, eslint.config.mjs)
```

There is no test suite in this repository yet.

Environment variables live in `.env` / `.env.local` (see `.env.example`).
Only one is used: `DATABASE_URL`, the Neon Postgres pooled connection string.
Next.js only reads env files at process start — after editing `.env`, fully
stop and restart `npm run dev` (Fast Refresh does not reload env vars).

## Architecture

This is the marketing website for **Airmation** (a Lucknow, Uttar
Pradesh drone-swarm light-show company) and its flagship product
**Biscope**. Next.js App Router, TypeScript, Tailwind CSS v4.

**Content lives in one place.** `src/lib/content.ts` is the single source of
truth for every fact, stat, and piece of copy used across the site (founders,
roadmap, market figures, client segments, positioning vs. competitors). Pages
import from it rather than hardcoding text — when the business facts change,
update `content.ts`, not the individual page files. The figures there are
sourced from Airmation's business plan / Biscope blueprint / pitch deck and
are explicitly marked illustrative and assumption-based at the source; treat
anything on `/investors` as needing founder sign-off before publishing.

**Design system is CSS-variable based**, defined in `src/app/globals.css` via
Tailwind v4's `@theme inline` block (not a `tailwind.config.js` — this
project uses Tailwind v4's CSS-first config). Custom color tokens
(`navy`, `panel`, `amber`, `cyan`, `violet`, `green`, each with a `-soft`
variant, plus `ink`/`muted`/`dim`/`line`) are usable directly as Tailwind
classes (e.g. `bg-navy`, `text-amber-soft`, `border-line-2`) because they're
registered as `--color-*` theme variables. This palette intentionally
matches Airmation's existing business-plan/blueprint documents for brand
consistency — don't introduce new colors without a reason.

Fonts (IBM Plex Sans/Serif/Mono) are self-hosted via `@fontsource/*` packages
imported in `src/app/layout.tsx`, not `next/font/google`. This was a
deliberate choice: the build sandbox this project was originally developed in
has no network access to `fonts.googleapis.com`, and self-hosting is also
one less external request at runtime in production.

**The particle-swarm visuals are the centerpiece.** Since Biscope has no real
show footage yet (pre-first-show), the hero and gallery use a canvas 2D
particle system instead of photography/video:
- `src/lib/swarmShapes.ts` — pure point-cloud generators, each returning an
  array of `{x, y}` points in 0–1 normalized space for one formation
  (`scatterPoints`, `lotusPoints`, `monogramPoints`, `ringPoints`,
  `wavePoints`). Adding a new formation means adding a function here.
- `src/components/visual/SwarmCanvas.tsx` — the full-bleed hero animation;
  cycles through scatter → lotus → monogram on a loop, respects
  `prefers-reduced-motion`.
- `src/components/visual/FormationPreview.tsx` — the smaller per-card
  version used on `/gallery`; toggles between scatter and a single target
  formation, takes a `formation` prop.

Both components read shapes from the shared `swarmShapes.ts` module rather
than duplicating point-generation logic. This is presented to visitors
honestly as "concept renders" (see `/gallery` copy and the footer note) —
don't remove that framing without real show footage to replace it.

**Data flow for the contact form:** `ContactForm.tsx` (client component) →
`POST /api/contact` (`src/app/api/contact/route.ts`) → `src/lib/db.ts`'s
`getSql()`, which returns a Neon `@neondatabase/serverless` tagged-template
SQL client, or `null` if `DATABASE_URL` isn't set. The route is written to
degrade gracefully when there's no database configured (logs to console,
still returns success to the visitor) rather than failing — this lets local
dev and CI builds work without real credentials. `@neondatabase/serverless`
is Neon's HTTP-based driver (works over `fetch`, not a raw TCP connection),
chosen specifically so this runs cleanly on serverless/edge deploys without
connection-pooling concerns. The `leads` table schema is defined in
README.md, not in a migrations folder — there's no ORM or migration tooling
in this project.

**Shared UI primitives** live in `src/components/ui/`: `Reveal` (Framer
Motion scroll-in-view wrapper, used to animate nearly every section),
`GlowCard` (colored hover-glow card, takes a `color` prop matching the theme
tokens), `Button`, `StatGrid`, `Timeline` (renders the Year 1–5 roadmap from
`content.ts`), `SectionLabel`, `ContactForm`. Page files compose these rather
than writing bespoke markup per section — follow that pattern for new pages.

## Pages

| Route | Purpose |
|---|---|
| `/` | Home — hero, process, audiences, positioning, roadmap, safety |
| `/biscope` | The flagship product in depth |
| `/about` | Company mission, honest positioning, founding team |
| `/vision` | Airmation Academy (Year 2+) and UAV R&D (Year 4+) |
| `/gallery` | Concept formation renders |
| `/investors` | Curated, PR-safe figures for investors/grant partners |
| `/contact` | Contact form (posts to `/api/contact`) |
