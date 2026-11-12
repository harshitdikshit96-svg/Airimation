# Airimation Website

The marketing website for **Airimation** — synchronised LED drone-swarm
light shows for civic, festival, wedding and corporate events, based in
Noida (Delhi NCR).

Built with Next.js (App Router, TypeScript), Tailwind CSS v4, and Framer
Motion. Content is drawn from the Airimation business plan, show blueprint,
pitch deck and products blueprint — see `src/lib/content.ts` for every fact
used on the site and where to update it.

## Design direction

Matches the visual language already used across Airimation's business
collateral (business plan, blueprint docs): a dark navy base with amber/cyan
accent colours, IBM Plex Sans / Serif / Mono typography, and a starfield
ambient background. Fonts are self-hosted via `@fontsource` (no external
Google Fonts request at runtime).

The hero and gallery visuals are canvas-based particle simulations — a swarm
of points that assembles into formations (a lotus, the Airimation monogram,
concentric rings, a flight chevron). **These are concept renders, not real
show footage** — Airimation's first live shows are still in preparation, and
the site says so plainly rather than implying otherwise. Swap in real
photography/video once available (see "Replacing the visuals" below).

## Getting started

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

```bash
npm run build   # production build
npm run start   # run the production build locally
npm run lint    # eslint
```

## Pages

| Route | Purpose |
|---|---|
| `/` | Home — cinematic scroll-driven experience, swarm canvas tied to scroll position |
| `/biscope` | The flagship product in depth |
| `/about` | Company mission, honest positioning, founding team |
| `/team` | Full founder bios and photos |
| `/vision` | Airimation Academy (Year 2+) and UAV R&D (Year 4+) |
| `/gallery` | Concept formation renders |
| `/contact` | Contact form (posts to `/api/contact`) |

## Contact form → database

`/api/contact` accepts form submissions and, if configured, inserts them into
a Neon (Postgres) table called `leads`. Without Neon configured it still
works in development — it just logs the submission to the server console
instead of erroring, so you can build and test without a database.

### Setting up Neon

1. Create a free project at [neon.tech](https://neon.tech).
2. In the Neon SQL editor, run:

   ```sql
   create table leads (
     id uuid primary key default gen_random_uuid(),
     created_at timestamptz default now(),
     name text not null,
     email text not null,
     phone text,
     organization_type text not null,
     event_date date,
     message text not null
   );
   ```

3. Copy `.env.example` to `.env.local` and fill in:
   - `DATABASE_URL` — Dashboard → Connection Details → **Pooled connection**
     string (keep this secret — it's only ever used server-side in
     `/api/contact`, never exposed to the browser)

The API route uses `@neondatabase/serverless`, Neon's HTTP-based driver —
it works over fetch rather than a raw TCP connection, so it runs cleanly in
serverless/edge deployments (e.g. Vercel) without connection-pooling issues.

## Before this goes live — checklist

- [ ] Point `contactInfo.email` in `src/lib/content.ts` at your real
      Google Workspace address (currently a placeholder: `hello@airimation.in`).
- [ ] Set up Neon (above) so contact-form leads aren't lost.
- [ ] Replace concept formation renders on `/gallery` with real photography
      or footage once Airimation's first shows are delivered.
- [ ] Add real founder headshots: drop files in `public/team/` and set each
      founder's `photo` path in `src/lib/content.ts` (see `public/team/README.md`).
      Until then, `/` and `/team` show initials placeholders instead of photos.
- [ ] Update `metadataBase` in `src/app/layout.tsx` if the production domain
      differs from `airimation.in`.
- [ ] Deploy (Vercel is the path of least resistance for Next.js) and add the
      `DATABASE_URL` env var there too.

## Replacing the visuals

The home page story and `/design-your-show` render the drone swarm in
real time with React Three Fiber (`src/components/swarm/`); /shows uses
the older 2D canvas (`src/lib/swarmShapes.ts`). See
CLAUDE.md for the map. When real show footage exists, it replaces the
posters and the hero, and the "concept render" labels can go.

### Adding a formation

A formation is a function from a drone count to that many `x, y, z`
positions in metres (`y` = altitude, `z` toward the audience). Add it to
`src/components/swarm/formations.ts`:

```ts
// Parametric: a wide six-turn spiral.
export const galaxy = defineFormation("galaxy", "Galaxy", (n) => spiral(n, 70, 6));

// Text, filled with drones (await document.fonts.load(...) first).
export const welcome = defineFormation("welcome", "Swagat", (n) =>
  fromText("SWAGAT", n, { width: 160 }));

// SVG silhouette: any path, any viewBox.
export const diya = defineFormation("diya", "Diya", (n) =>
  fromSvg(DIYA_PATH_D, n, { viewBox: 100, width: 90 }));
```

Use it wherever a formation's positions are needed, e.g. a beat in
`src/components/home/HomeSwarm.tsx` (`buildBeats`). Generators must be
deterministic: use `makeRand(seed)`, never `Math.random()`.

To offer it in the configurator, register it in
`src/lib/show/formations/index.ts` instead (that library is pinned for
share links: adding is free, changing an existing one needs a
`LIBRARY_VERSION` bump — see SHOW_CONFIGURATOR.md).

### Design a Show formations (3D models only)

`src/lib/cultural/` holds the formations on `/design-your-show`
(`src/components/gallery/CulturalShowcase.tsx`). **Every one is made from
a real 3D model** — a museum scan or an openly licensed model, an exact
geometric shape, or the flag to its official spec. No hand-drawn figures.

Each is an `AnimatedFormation` (see `kit.ts`): `build(n)` once per drone
count, `pose(rig, t, pos, col)` every frame. Colours are LINEAR rgb
(`hex()` converts); black = LED off. Keep `pose` allocation-free.

To add one from a model (GLB):

```bash
node scripts/scan-to-formation.mjs path/to/model.glb my-id \
  --label "My figure" --credit "Title by Creator (Sketchfab), CC BY 4.0" \
  [--licence "CC BY 4.0"] [--rotate-x 90] [--rotate-y 90] [--tilt-x 40] [--crop-bottom 0.12]
```

then register `scans/my-id.json` in `src/lib/cultural/scans/index.ts`
with `scanFormation(file, { blurb, colors, motion, effect, minDrones })`,
and add it to `src/lib/cultural/__tests__/scanFiles.ts`. **Licences:
CC0 / public domain, or CC BY 4.0 with the credit** (shown on the page).
Never NC, ND or SA. Record the source in `Airimation/Scans/SOURCES.md`.
`npm test` then checks the licence, credit, file and that no drone
strays outside the model.

Export for Blender / Skybrush and the asset spec:

```bash
npx vite-node scripts/export-formations.ts -- ../Formations 500 24
```

writes, per formation, a 600-point cloud (`.points.json`, spec format), a
preview SVG, one CSV per drone for one loop, and `REPORT.md` with max
speed and minimum separation.

### Tests

```bash
npm test                                   # 129 unit tests (vitest), seconds
npm run build && npm run start             # then, in another terminal:
npm run test:e2e -- http://localhost:3000  # 54 checks in Chrome
```

Run both before pushing. What each covers, and the rule behind it, is in
DECISIONS.md §6 — when a rule changes, change its test in the same commit.

### 3D assets

- `node scripts/build-skyline.mjs` regenerates the skyline into
  `assets/src/` (git-ignored), and `node scripts/compress-assets.mjs`
  compresses every GLB there into `public/models/` with Meshopt +
  quantization (`--ktx2` adds KTX2 textures; needs `toktx`). The script
  fails if the total exceeds the 1.5 MB budget.
- `node scripts/render-poster.mjs http://localhost:3000` re-renders the
  poster frames in `public/posters/` from the live scene, using the locally
  installed Chrome.
