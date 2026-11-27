# SEO & organic growth plan

*Started 25 Nov 2026. Owner: Harshit. Source audit: the SEO review of
airimation.in on 25 Nov 2026 (summary in §1). Every change here is also
logged in `DECISIONS.md` once it lands.*

Status key: ☐ not started · ◐ in progress · ☑ done · ⏸ needs the founder

**Phase 1 landed on 25 Nov 2026** (round 17 in `DECISIONS.md`): lint ✅,
553/553 unit tests ✅, build ✅ (56 formation pages prerendered), 82/82
e2e ✅ on a production build. Not yet pushed or deployed.

---

## 1. What the audit found

| # | Finding | Weight |
|---|---|---|
| A1 | Phones (< 768 px) see only the "best seen on a bigger screen" gate; the whole site is `display: none`. Google indexes from its phone crawler, and most Indian visitors (and every WhatsApp link) are on phones. | Critical |
| A2 | The site doesn't show up in search, even for its own name. Sitemap submitted to Search Console on 25 Nov 2026 — wait for indexing. | High (founder: in progress) |
| A3 | Design a Show is one URL with about 420 crawlable words. The 3D scene loads only in the browser, so Google sees none of the 56 formations; `?formation=` links all point to the hub as their canonical URL. | High |
| A4 | The live designer can't be shared: it reads the URL once, never writes it, and has no Share button. (The archived configurator had share links; the new one doesn't.) | High (growth) |
| A5 | Generic titles ("About \| Airimation") and thin descriptions on `/team` (76 characters) and `/contact` (91). The `keywords` meta tag does nothing. | Medium |
| A6 | Structured data is the Organization only: no WebSite, Service or Breadcrumb data. The address is "Greater Noida" in the structured data but "Noida" everywhere else. | Medium |
| A7 | No analytics, so there's no way to tell visits from enquiries. | Medium |
| A8 | No links from other sites: no Google Business Profile, no directory listings, no outreach. | Medium (off-site) |

## 2. Design rule for the formation pages (founder requirement)

> The visitor keeps today's UI: curating and checking formations in one
> live 3D sky, **with no page load on any change**. Search engines and
> shared links still get one real page per formation.

How both work at once:

1. **One URL per formation, built ahead of time:** `/design-your-show/<id>`
   (e.g. `/design-your-show/ganesha`), one for each of the 56 formations,
   generated with `generateStaticParams`. Unknown ids return 404. Each page's
   server HTML has its own title, description, canonical URL, share image,
   H1, copy, facts (minimum fleet, theme, model credit), breadcrumb data, and
   crawlable links to related formations.
2. **Same component, same sky.** The page mounts the same
   `CulturalShowcase` as the hub, opened on that formation. Hub and
   formation pages share one layout.
3. **Picking a formation is not navigation.** When the visitor clicks a
   chip (or changes fleet or LED hues), the showcase updates the address bar
   with `history.replaceState` to
   `/design-your-show/<id>?fleet=<n>&hues=<theme>`. The browser loads
   nothing, and the canvas, camera and loaded models stay as they are.
   Next.js (App Router, ≥ 14.1) syncs `usePathname`/`useSearchParams` with
   native `replaceState`. We use `replaceState`, not `pushState`, so Back
   leaves the designer instead of stepping through every chip. Auto-advance
   never touches the URL.
4. **The copy under the sky follows the pick.** The formation section is
   server-rendered for the page's own formation. When the visitor picks
   another formation, a small client component swaps in that formation's
   copy and updates `document.title`. The copy is a plain data module, with
   no three.js and no model data, so it's cheap on the client. If the visitor
   then refreshes or shares, the URL already points at the right page.
5. **The hub stays the hub.** `/design-your-show` keeps its canonical
   URL, copy and auto-advance tour, and gains a crawlable index of all 56
   formations grouped by theme. Old `?formation=` links keep working
   unchanged (the render scripts and capture mode depend on them).
6. **Honesty rules carry over.** Every formation page says "concept render,
   simulated, sped up" and claims no delivered shows. It never implies a
   temple, trust or civic body endorsed anything, and uses none of the
   retired words (`scripts/check-brand-spelling.mjs`).

## 3. Work items

### Phase 1: start now

| Id | Item | Files | Status |
|---|---|---|---|
| P1 | **Phones see the real site.** Remove the CSS gate; every page renders responsively below 768 px (the header already has a phone menu). The 3D at phone width uses the low tier, which phones already run in the gate today. `PhoneGate` is retired, and e2e checks change from "gate shown" to "site shown, no sideways scroll, controls usable". | `globals.css`, `layout.tsx`, `PhoneGate*.tsx`, `phone.ts`, `scripts/e2e.mjs` | ☑ 25 Nov |
| P2 | **Formation pages** as specified in §2: the route, data module, copy for all 56, the related-formation index on the hub, and sitemap entries. | `src/app/design-your-show/[formation]/page.tsx`, `src/lib/cultural/pages.ts`, `DesignShowcaseView.tsx`, `CulturalShowcase(Loader).tsx`, `seo.ts`, `sitemap.ts` | ☑ 25 Nov |
| P3 | **URL sync and Share.** `replaceState` on pick, fleet or hue change; a Share button (the native share sheet on phones; otherwise WhatsApp, plus copy link). | `CulturalShowcase.tsx`, new `ShareMenu.tsx` | ☑ 25 Nov |
| P4 | **Per-formation images.** Render all 56 at 5,000 drones with the existing scripts, producing a page still (`public/renders/f/<id>.webp`) and a 1200×630 share image (`public/renders/og/<id>.jpg`). | `scripts/render-formations.ts`, new `scripts/compress-formation-pages.mjs` | ☑ 25 Nov |
| P5 | **Save a clip.** Record about 10 s of the live sky in the browser (MediaRecorder, MP4 where supported, otherwise WebM), cropped and watermarked "airimation.in · Concept render · <formation> · <n> drones", for Reels and WhatsApp Status. | `CulturalShowcase.tsx`, new `src/components/gallery/recordClip.ts` | ☑ 25 Nov |
| P6 | **Titles and descriptions.** Keyword-led titles and descriptions for `/shows`, `/about`, `/team`, `/contact` and the hub; drop the `keywords` meta tag. | page files, `layout.tsx` | ☑ 25 Nov |
| P7 | **Structured data.** Add WebSite and Service (on `/shows`) data, and BreadcrumbList on formation pages. Give the Organization an `@id` so the other entries can reference it. | `jsonld.ts`, pages | ☑ 25 Nov |
| P8 | **Analytics.** Vercel Web Analytics (cookieless, no consent banner needed), loaded as Vercel's first-party script rather than the npm package (npm ERESOLVE on its optional SvelteKit peer). Founder must enable it in the Vercel dashboard. | `layout.tsx`, `src/lib/analytics.ts` | ☑ 25 Nov |
| P9 | **Home strip links** point to the formation pages, so they become crawlable internal links. | `DesignStrip.tsx` | ☑ 25 Nov |
| P10 | **Tests.** Unit: every formation has a page entry and copy, slugs are valid and don't collide with `s` or `classic`, sitemap includes formation pages, copy follows the brand and honesty rules. E2E: a formation page loads with the right H1 and canonical, a chip click changes the URL without navigating (same canvas element, no document request), Share works, phones see the site. | `src/lib/__tests__/`, `scripts/e2e.mjs` | ☑ 25 Nov |
| P11 | `DECISIONS.md` change log, §2 phone rule, §6 test runs; README "formation pages". | docs | ☑ 25 Nov |

### Phase 2: needs founder input

| Id | Item | Status |
|---|---|---|
| F1 | Bing Webmaster Tools (import from Search Console); request indexing for the hub and the top formation pages. | ⏸ |
| F2 | Google Business Profile as a **service-area business** (UP + NCR, no public address). Genuine reviews only. | ⏸ |
| F3 | Choose one address form, Noida or Greater Noida, and use it everywhere (structured data, GBP, directories). | ⏸ |
| F4 | Guides, each with the simulator embedded: "How many drones does a drone show need?", "Drone show permission in India (DGCA Digital Sky, NOCs, lead times)", "Drone show vs fireworks", and "Drone show cost in India" only if a published price range is signed off. | ⏸ |
| F5 | Outreach: the museums credited (Minneapolis Institute of Art, Cleveland Museum of Art, Virtual Małopolska, the Smithsonian), Sketchfab CC BY authors, a Show HN or r/threejs write-up, and Noida editions of Hindi dailies. Draft notes are in `docs/seo/OUTREACH.md`. | ⏸ |
| F6 | Festival calendar: refresh or feature formation pages about 6 weeks ahead. Republic Day (26 Jan 2027): Tiranga. Holi (Mar 2027): Holi theme. Ram Navami: Ram Mandir. Wedding season (Oct–Dec): Dil, Rose, Kamal, Taj Mahal. | ⏸ |
| F7 | Turn on Vercel Web Analytics in the dashboard (P8 adds the code). | ⏸ |

## 4. Regression guard

Before and after each phase:
`npm run lint` · `npm test` · `npm run build` · `npm run test:e2e` against a
production build. Baseline on 25 Nov 2026: lint ✅, 546/546 unit tests ✅,
build and e2e recorded in `DECISIONS.md` §6.

Specific risks to watch:

- **`replaceState` with a new pathname inside the App Router** must not
  re-render the route. The e2e checks that the canvas element is the same
  node and that no document request is made after a chip click.
- **The new `[formation]` segment** sits beside the static `classic` and
  `s/[code]` routes. Static routes take precedence; a test makes sure no
  formation id equals `classic` or `s`.
- **Capture mode and the render scripts** use `/design-your-show?formation=…&capture=1`.
  That URL is left exactly as it is.
- **Phones**: no sideways scroll at 390 px on every page; the designer's
  dock stays usable; the home scene runs on the low tier.
- **Bundle size**: the formation copy module is plain text and must not
  pull `src/lib/cultural` (three.js, scan code) into the page bundle.

## 5. How we'll know it works

- Search Console: indexed pages (target: all 7 core pages plus 56 formation pages);
  impressions for "drone show" + {Noida, Delhi NCR, wedding, Ganesh
  Chaturthi, Diwali, Republic Day}.
- Analytics: visits to `/design-your-show/*`; shares and clip saves (once
  custom events are available); **quote requests from the contact form**,
  which is the only number that matters.
- Honest expectation: most designer traffic will be curious visitors, not
  buyers. Judge the work by enquiries per month, not page views.
