# Airmation Website

The marketing website for **Airmation** and its flagship product **Biscope**
— synchronised LED drone-swarm light shows for government, festival, wedding
and corporate events, based in New Delhi.

Built with Next.js (App Router, TypeScript), Tailwind CSS v4, and Framer
Motion. Content is drawn from the Airmation business plan, Biscope blueprint,
pitch deck and products blueprint — see `src/lib/content.ts` for every fact
used on the site and where to update it.

## Design direction

Matches the visual language already used across Airmation's business
collateral (business plan, blueprint docs): a dark navy base with amber/cyan
accent colours, IBM Plex Sans / Serif / Mono typography, and a starfield
ambient background. Fonts are self-hosted via `@fontsource` (no external
Google Fonts request at runtime).

The hero and gallery visuals are canvas-based particle simulations — a swarm
of points that assembles into formations (a lotus, the Airmation monogram,
concentric rings, a flight chevron). **These are concept renders, not real
show footage** — Biscope's first live shows are still in preparation, and
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
| `/vision` | Airmation Academy (Year 2+) and UAV R&D (Year 4+) |
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
      Google Workspace address (currently a placeholder: `hello@airmation.in`).
- [ ] Set up Neon (above) so contact-form leads aren't lost.
- [ ] Replace concept formation renders on `/gallery` with real photography
      or footage once Biscope's first shows are delivered.
- [ ] Add a real founder headshot / team photo section if desired (currently
      text-only initials avatars).
- [ ] Update `metadataBase` in `src/app/layout.tsx` if the production domain
      differs from `airmation.in`.
- [ ] Deploy (Vercel is the path of least resistance for Next.js) and add the
      `DATABASE_URL` env var there too.

## Replacing the visuals

The particle-swarm formations live in `src/lib/swarmShapes.ts` (point-cloud
generators) and are animated by `src/components/visual/SwarmCanvas.tsx`
(hero) and `FormationPreview.tsx` (gallery cards). Add a new formation by
writing a function that returns an array of `{ x, y }` points in the 0–1
range, then referencing it from either component.
