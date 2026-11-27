# final-sanity scan: airmation-website
Next 16.2.10 (app router) · DB: @neondatabase/serverless · regions: default
- DB host (.env DATABASE_URL): ep-still-violet-at3o1dfk-pooler.c-9.us-east-1.aws.neon.tech (pooled) · us-east-1

**Neon compute:** wakes on public traffic (every visit or bot hit to a dynamic page queries it)

## Routes (build 2026-11-27T19:07:38.913Z)
Public pages: 16 static, 0 ISR, 2 dynamic.
| Route | Class | Revalidate | DB | Scope |
|---|---|---|---|---|
| / | static | – | no | public |
| /about | static | – | no | public |
| /api/contact | dynamic | – | yes | api |
| /apple-icon.png | static | – | ? | public |
| /contact | static | – | no | public |
| /credits | static | – | no | public |
| /design-your-show | static | – | no | public |
| /design-your-show/[formation] | static-params (56) | – | no | public |
| /design-your-show/classic | static | – | no | public |
| /design-your-show/s/[code] | dynamic | – | no | public |
| /design-your-show/s/[code]/opengraph-image | dynamic | – | no | public |
| /icon.png | static | – | ? | public |
| /internal | static | – | no | private |
| /internal/quiz | static | – | no | private |
| /internal/show-lab | static | – | no | private |
| /internal/swarm-bench | static | – | no | private |
| /opengraph-image.jpg | static | – | ? | public |
| /privacy | static | – | no | public |
| /robots.txt | static | – | no | public |
| /shows | static | – | no | public |
| /sitemap.xml | static | – | no | public |
| /team | static | – | no | public |
| /vision | static | – | no | public |

## Findings (2)
- **medium** `params-no-static-params` src/app/design-your-show/s/[code]/page.tsx:33: /design-your-show/s/[code] has no generateStaticParams, so each path renders per request. Export generateStaticParams (top N paths, or [] to render each on first visit and cache it).
  `export default async function SharedShowPage({ params }: Params) {`
- **medium** `public-dynamic-route` src/app/design-your-show/s/[code]/page.tsx: Build output: public page /design-your-show/s/[code] is dynamic (rendered per request). Find what opts it out (request APIs, uncached fetch, searchParams, a dynamic layout).

## Write paths with no cache invalidation (1)
Fine if what they write is never shown on a cached page (leads, logs). If a cached public page shows it, add revalidateTag/revalidatePath here when you make that page static.
- src/app/api/contact/route.ts:38
