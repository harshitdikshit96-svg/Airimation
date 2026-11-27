# Compute sanity: airimation.in

2026-11-28 · Next 16.2.10 (app router, cacheComponents off) · DB `@neondatabase/serverless`
(HTTP driver) → `-pooler` host, AWS us-east-1 · functions: Vercel default region · scans:
`docs/compute-sanity/before.md`, `after.md`

## 1. Summary
- **Neon compute:** "wakes on public traffic" (scanner's verdict) → **sleeps between enquiries**.
  The before verdict was cautious: the two dynamic routes never read the DB. The only DB access
  is one `insert` per contact-form submit.
- **Public pages:** 16 static / 0 ISR / 2 dynamic → **18 static (incl. SSG) / 0 / 0**
  (`/api/contact` stays a function: it is the form POST).
- **Recurring triggers hitting the server:** none before, none after (no crons, polling,
  middleware, keep-warm pings or first-party page-view logging; GA4 is client-side via GTM).
- **Rough effect:** old shared-show links (`/design-your-show/s/<code>`) and their link-preview
  images ran a function on every open, including every WhatsApp/Slack/X preview fetch. Now each
  distinct code renders once and is served from the CDN until the next deploy. No price is
  quoted: the site was already well inside Hobby limits (Vercel dashboard, last 30 days: 65K of
  1M function invocations, shared across all projects on the account).
- **Still needs you:** 0 proposals, 3 dashboard settings (§7).

## 2. Who writes what (data map)
| Data | Public readers | Writers (file:line) | Invalidation | Freshness needed |
|---|---|---|---|---|
| leads | none (never shown on the site) | `src/app/api/contact/route.ts:38` | none needed | — |
| all page copy, formations | every page | code (`src/lib/content.ts`, `src/lib/cultural/`) | the deploy | changes only on deploy |

## 3. Routes
| Route | Before | After | Why it may stay dynamic |
|---|---|---|---|
| all public pages, `/design-your-show/[formation]` (56) | static / SSG | static / SSG | — |
| `/design-your-show/s/[code]` | dynamic (no `generateStaticParams`) | SSG on first visit, then cached | — |
| `/design-your-show/s/[code]/opengraph-image` | dynamic | SSG on first visit, then cached | — |
| `/api/contact` | function | function | form POST; the only DB writer |

## 4. Findings
| # | Severity | What | Where | Class | Status |
|---|---|---|---|---|---|
| 1 | medium | Shared-show page rendered per request | `src/app/design-your-show/s/[code]/page.tsx` | A | fixed |
| 2 | medium | Shared-show OG image drawn per request | `src/app/design-your-show/s/[code]/opengraph-image.tsx` | A | fixed |
Dismissed after reading: "write path with no invalidation" at `src/app/api/contact/route.ts:38`
(leads are never shown on a cached page); Neon "wakes on public traffic" (no public page reads
the DB). Checked by hand: no DB in layouts/header/footer, no server-side `searchParams` on public
pages, no middleware/proxy, sitemap and robots static, the Neon HTTP driver on the pooled host (no
connection pool to manage), the only browser `fetch` is the form submit.

---

## 5. Changes made
- `src/app/design-your-show/s/[code]/page.tsx`: `generateStaticParams()` → `[]`, so each code
  renders on its first visit and is cached (the page is a pure function of the code).
- `src/app/design-your-show/s/[code]/opengraph-image.tsx`: the same for the link-preview image.
- Verification:
  - fresh `next build` before and after; both routes `ƒ` → `●`
  - scan compare: 2 fixed, 0 new
  - probe (`next start`): 15/15 public paths `x-nextjs-cache: HIT`; a share code and its OG
    image go `MISS` then `HIT`, same title and a correct 1200×630 PNG
  - invalidation: not needed (no data on public pages changes between deploys)
  - `npm run lint` ✅, `npm test` 563/563 ✅, `npm run test:e2e` 96/96 ✅ (production build)

## 6. Proposals (behaviour changes, your call)
None.

## 7. Owner checklist (dashboards)
- [ ] **Vercel → airimation → Settings → Environment Variables → `DATABASE_URL`**: it is set for
  *Production and Preview*, so preview deployments (and anyone testing a preview's contact form)
  write into the production `leads` table. Point Preview at a Neon branch, or remove it from
  Preview (the route then logs instead of storing).
- [ ] **Vercel → Settings → Functions → Region:** Washington, D.C. (`iad1`), next to Neon
  us-east-1. Check it, since only `/api/contact` runs and it should not cross an ocean.
- [ ] **Neon → project → Branches → compute:** scale to zero on (5 min); autoscaling min
  0.25 CU, max 1 CU.
- [ ] After a few days: Neon Monitoring → Compute shows long suspended gaps; Vercel
  Observability → top routes is only `/api/contact`.

## 8. Not covered / later
- `/team` HTML also gets `max-age=86400` from the `/team/:path*` asset rule in
  `next.config.ts` (meant for `/team/*` photos), so a browser may show an old Team page for up
  to a day after a deploy. Harmless today; narrow the rule if that matters.
- Re-run this pass if a public page ever starts reading the database.
