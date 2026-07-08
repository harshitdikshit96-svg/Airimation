# Airmation Website

The marketing website for **Airmation** and its flagship product **Biscope**
— synchronised LED drone-swarm light shows for government, festival, wedding
and corporate events, based in Lucknow, Uttar Pradesh.

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
| `/` | Home — hero, process, audiences, positioning, roadmap, safety |
| `/biscope` | The flagship product in depth |
| `/about` | Company mission, honest positioning, founding team |
| `/vision` | Airmation Academy (Year 2+) and UAV R&D (Year 4+) |
| `/gallery` | Concept formation renders |
| `/investors` | Curated, PR-safe figures for investors/grant partners |
| `/contact` | Contact form (posts to `/api/contact`) |

## Contact form → database

`/api/contact` accepts form submissions and, if configured, inserts them into
a Supabase table called `leads`. Without Supabase configured it still works
in development — it just logs the submission to the server console instead
of erroring, so you can build and test without a database.

### Setting up Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. In the SQL editor, run:

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

   alter table leads enable row level security;
   -- No public policies are added — all access goes through the
   -- service-role key from the API route, never the browser.
   ```

3. Copy `.env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` — Project Settings → API → Project URL
   - `SUPABASE_SERVICE_ROLE_KEY` — Project Settings → API → `service_role` key
     (keep this secret — it's only ever used server-side in `/api/contact`)

## Before this goes live — checklist

- [ ] Point `contactInfo.email` in `src/lib/content.ts` at your real
      Google Workspace address (currently a placeholder: `hello@airmation.in`).
- [ ] Set up Supabase (above) so contact-form leads aren't lost.
- [ ] Have someone at Airmation review the `/investors` page — it includes
      figures from the business plan / pitch deck that were marked
      illustrative and assumption-based in the source documents.
- [ ] Replace concept formation renders on `/gallery` with real photography
      or footage once Biscope's first shows are delivered.
- [ ] Add a real founder headshot / team photo section if desired (currently
      text-only initials avatars).
- [ ] Update `metadataBase` in `src/app/layout.tsx` if the production domain
      differs from `airmation.in`.
- [ ] Deploy (Vercel is the path of least resistance for Next.js) and add the
      Supabase env vars there too.

## Replacing the visuals

The particle-swarm formations live in `src/lib/swarmShapes.ts` (point-cloud
generators) and are animated by `src/components/visual/SwarmCanvas.tsx`
(hero) and `FormationPreview.tsx` (gallery cards). Add a new formation by
writing a function that returns an array of `{ x, y }` points in the 0–1
range, then referencing it from either component.
