# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install      # install dependencies
npm run dev      # start dev server (Turbopack) at http://localhost:3000
npm run build    # production build (also runs the TypeScript check)
npm run start    # serve the production build locally
npm run lint      # eslint (flat config, eslint.config.mjs)
npm test          # vitest unit suite (formations, library rules, content)
npm run test:e2e -- http://localhost:3000   # Chrome checks against a running site

node scripts/build-skyline.mjs && node scripts/compress-assets.mjs   # skyline GLB
node scripts/render-poster.mjs http://localhost:3000                 # poster frames
node scripts/scan-colors.mjs <glb> <id>                              # a formation's real colours
node scripts/scan-manifest.mjs                                       # after adding/re-converting a model
npx vite-node scripts/preview-formations.ts -- <outDir> 1500 [ids]   # formation contact sheets
```

Environment variables live in `.env` / `.env.local` (see `.env.example`).
Only one is used: `DATABASE_URL`, the Neon Postgres pooled connection string.
Next.js only reads env files at process start — after editing `.env`, fully
stop and restart `npm run dev` (Fast Refresh does not reload env vars).

## Architecture

**Read `DECISIONS.md` first** — every company and site decision to date
(team presentation, retired words, masked registration numbers, 3D
performance rules) and the change log.
**Keep it current:** after any change, add a dated entry to its change
log, update §1–§3 if a decision changed, and run the §6 test suites
(`npm run lint`, `npm test`, `npm run build`, `npm run test:e2e`) and
update their "last run". When a rule changes, change its test too.

This is the marketing website for **Airimation**, a Noida (Delhi NCR)
drone-swarm light-show company. Next.js App Router, TypeScript, Tailwind
CSS v4.

**Retired words.** There is no flagship show name: "Biscope" was dropped
(Nov 2026) and the old `/biscope` page is now `/shows` (permanent
redirect in `next.config.ts`). The word "government" is not used in any
Airimation material — say "civic" or "public". `npm run lint` enforces
both (`scripts/check-brand-spelling.mjs`).

**Content lives in one place.** `src/lib/content.ts` is the single source of
truth for every fact, stat, and piece of copy used across the site (founders,
roadmap, market figures, client segments, positioning vs. competitors). Pages
import from it rather than hardcoding text — when the business facts change,
update `content.ts`, not the individual page files. The figures there are
sourced from Airimation's business plan / show blueprint / pitch deck and
are explicitly marked illustrative and assumption-based at the source; there is
no `/investors` page (removed Jul 2026); any investor-facing figure needs
founder sign-off before publishing. The only public email is
`contactInfo.email` = hello@airimation.in.

**Design system is CSS-variable based**, defined in `src/app/globals.css` via
Tailwind v4's `@theme inline` block (not a `tailwind.config.js` — this
project uses Tailwind v4's CSS-first config). Custom color tokens
(`navy`, `panel`, `amber`, `cyan`, `violet`, `green`, each with a `-soft`
variant, plus `ink`/`muted`/`dim`/`line`) are usable directly as Tailwind
classes (e.g. `bg-navy`, `text-amber-soft`, `border-line-2`) because they're
registered as `--color-*` theme variables. This palette intentionally
matches Airimation's existing business-plan/blueprint documents for brand
consistency — don't introduce new colors without a reason.

Fonts (IBM Plex Sans/Serif/Mono) are self-hosted via `@fontsource/*` packages
imported in `src/app/layout.tsx`, not `next/font/google`. This was a
deliberate choice: the build sandbox this project was originally developed in
has no network access to `fonts.googleapis.com`, and self-hosting is also
one less external request at runtime in production.

**The drone-swarm visuals are the centerpiece.** Airimation has no real show
footage yet (pre-first-show), so the site renders shows in real time.

*3D (home page story and `/design-your-show`)* — React Three Fiber, shared
module `src/components/swarm/`:
- `DroneSwarm.tsx` + `shaders.ts` — one `Points` draw; the vertex shader
  morphs between `aFrom`/`aTo` buffers on `uProgress` (stagger, arc, hover,
  lift-off light wave, twinkle, dissolve). Drivers write uniforms per frame;
  buffers are uploaded once per formation change. Trails and the river
  reflection are extra passes sharing the uniforms.
- `formations.ts` — generators for any drone count (parametric, 3D lotus,
  filled text, SVG). See README > Adding a formation.
- `SwarmCanvas.tsx` / `quality.ts` / `Effects.tsx` — canvas host, quality
  tiers (`?quality=low|mid|high` to force), bloom + AgX tone mapping, pause
  off-screen, poster fallback on context loss. `defer.ts` decides when the
  3D chunk may load (never during page load).
- `Environment.tsx`, `Water.tsx`, `Skyline.tsx` — dusk sky, stars, fog,
  river, and the skyline GLB (`public/models/skyline.glb`, generated by
  `scripts/build-skyline.mjs`, compressed by `scripts/compress-assets.mjs`).
- `audio.ts` — synthesised Web Audio, muted until the visitor unmutes.
- Home: `src/components/home/` (`HomeSwarmLoader` → `HomeSwarm`,
  GSAP ScrollTrigger in `homeStory.ts`). `?swarmBeat=0..4` pins a beat.
- Archived configurator: `src/components/show/ShowStage.tsx` drives the same swarm
  from a show plan. Formation library + share-link recipe stay in
  `src/lib/show/` (pure, version-pinned — see SHOW_CONFIGURATOR.md).
- Posters (`public/posters/`) are rendered from the live scene by
  `scripts/render-poster.mjs`; re-run it when the look changes.

*Design a Show formations* (`src/lib/cultural/`, live on `/design-your-show`
via `src/components/gallery/CulturalShowcase.tsx`, maths in
`showcaseMath.ts`) — **only formations made from a real 3D model**: museum
scans and CC0 / CC BY 4.0 models (`scan.ts`, `scans/`, made by
`scripts/scan-to-formation.mjs`, credited on the page), the 3D shapes from
the archived designer (`classic.ts`), and the Tiranga to its official spec
(`tiranga.ts`), plus symbols and figures modelled by us in Blender
(`scripts/blender/`, incl. Ram and the Ram Mandir). No hand-drawn
figures — no model, no formation. **Per-drone colour** (`paint` in
`scan.ts`): the model's real texture colours (`scripts/scan-colors.mjs`
writes `palette` + `ci` into the JSON) or hand-designed `ramp` / `palette`
/ `regions` hex codes — never one flat colour (`paint.test.ts`). Each
declares `minDrones`; a bigger fleet flies a bigger figure; a fleet change
redraws in place. **Choreography stays under 8 m/s** (`MAX_DRONE_SPEED`,
`__tests__/speed.test.ts`); the preview plays 1.8× (`PREVIEW_RATE`). Effects
are light only and never add drones outside the model (tested). LED hues
recolour by palette. The 3D sky is the page's full-width hero (controls
below, heading after); **the camera moves only when the visitor moves it**
(no auto-rotate); figures hold still; a plain wheel scrolls the page,
Ctrl/⌘ + wheel zooms. Model points load on demand (`scans/manifest.ts`);
Neutral tone mapping here, AgX on home. See README > Design a Show formations;
`scripts/export-formations.ts` exports them.

*Site backdrop* — every page except home and `/internal` sits on a still of
the home scene's dusk sky (`SiteBackdrop.tsx`, `public/posters/backdrop*.jpg`),
under a 55% overlay (white copy still reads).

*Phones* — below 768 px (`src/lib/phone.ts`) every route shows only
`PhoneGate.tsx`: the home scene's drone animation at the low tier
(`PhoneGateScene.tsx`, `phoneGateStory.ts`) and a "best seen on a bigger
screen" note with a hello@airimation.in button. The site is hidden by CSS
(`.site-shell`), not removed, so the HTML still carries every page.

Home starts its live scene right after load (not on scroll).

*Performance rules* — the swarm canvas caps at 60 fps (`MAX_FPS`), DPR at
1.5, no MSAA. The runtime monitor may lower DPR/bloom but never drone
count or materials (a mid-scroll rebuild is a visible freeze). 2D canvases
use `visibleRaf` so they sleep off-screen.

*2D (academy)* — canvas 2D: `src/lib/swarmShapes.ts`
generators, `AcademySwarmHero.tsx`. (The 2D
gallery cards were removed in Nov 2026.)

All of it is presented honestly as "concept renders" (gallery copy, the
footer note, the tag beside the home phase indicator, the configurator's
Simulation badge) — don't remove that framing without real show footage.

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
| `/shows` | The show in depth (was `/biscope`, redirects) |
| `/about` | Company mission, honest positioning, founding team |
| `/vision` | Build status, the two-track vision (shows, then R&D), dated roadmap |
| `/gallery` | 308 → `/design-your-show` |
| `/team` | Directors and advisors |
| `/contact` | Contact form (posts to `/api/contact`) |
| `/credits` | Credits for the CC BY 3D models (noindex, footer link) |
| `/design-your-show` | Full-width 3D sky hero (100–2,000 drones, 57 formations), controls below, then copy + quote CTA |
| `/design-your-show/classic` | ARCHIVED formation-picker configurator (noindex); old share links `/design-your-show/s/[code]` still open it |
