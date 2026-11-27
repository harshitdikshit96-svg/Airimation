# Analytics: GTM + GA4 for airimation.in

Last updated 2026-11-28. **Status: plan approved 27 Nov 2026; code in place; GA4 property
and GTM container created and configured 28 Nov 2026; container imported into a workspace but
NOT published; `NEXT_PUBLIC_GTM_ID` not yet set in Vercel** (see §7). The GTM container will be generated from
`docs/analytics-plan.json`; change the plan, then rerun the generator. Never edit the
container by hand.

## 1. Context
| | |
|---|---|
| Business | Pre-first-show drone light-show company. The site earns **show enquiries** (civic bodies, temple trusts / festival committees, wedding planners, corporates) through the contact form; Design a Show is the main way visitors see what a show could look like. No online sales. |
| Model | Lead-gen, with an interactive 3D configurator as the core content |
| Stack | Next.js 16.2 (App Router, Turbopack), TypeScript, Vercel; contact leads in Neon Postgres (`leads` table) |
| GTM container | `GTM-5XBZ5K5M` ("airimation.in", account harshitcreates, Google login `authuser=2`) → `NEXT_PUBLIC_GTM_ID` |
| GA4 measurement ID | `G-E6GF8L77GF` — property "Airimation" (`p565985731`, account harshitcreates `a404683186`), web stream `16430927735` for https://airimation.in. Goes into GTM only, never into code. |
| Loads on | production only (`VERCEL_ENV === "production"`); never on `/internal/*` or `/api/*` |
| Markets / consent | **All markets.** Consent Mode v2: EEA / UK / Switzerland start *denied* and see a small consent banner; everywhere else starts *granted*, no banner. "Cookie settings" link in the footer for everyone. |
| Google Ads | No. No Ads tags, no conversion values. |
| Replaced | Vercel Web Analytics (its script and stub are gone); its `share` / `clip` events are now `share` / `clip_record` in GA4. |

## 2. Goals → key events
| Business goal | Question the owner asks | Key event | Completes where |
|---|---|---|---|
| Get show enquiries | How many real enquiries, from which kind of organisation, which channel and which page? | `generate_lead` | on site, after `/api/contact` returns 2xx (`src/components/ui/ContactForm.tsx:70`) |

That is the only key event. Everything below is a supporting event that explains *what visitors
looked at* and *what led to an enquiry*.

## 3. Events
**Tier:** `basic` = every site gets it; `extra` = chosen for Airimation (the "Why" column says
which question it answers). **Type:** R = GA4 recommended name, C = custom.

### `generate_lead` — R · basic · **key event**
| Trigger (file:line) | Params | Why |
|---|---|---|
| `src/components/ui/ContactForm.tsx:70`, after `res.ok` | `lead_type` (civic, temple_festival, wedding, corporate, investor_partner, other — from the org-type select), `lead_time` (event date bucket: under_1_month, 1_3_months, 3_6_months, 6_months_plus, not_given), `source_formation` (last formation viewed in Design a Show this session, or none) | The conversion. Which audiences enquire, how far ahead, and which formations lead to enquiries. Never the name, email, phone or message. |

### `form_start` / `form_submit_error` — C · basic / extra
| Trigger | Params | Why |
|---|---|---|
| first focus in the contact form (autotrack) | `form_id=contact` | Form completion rate: started vs `generate_lead`. |
| `ContactForm.tsx:66` (server error) and `:74` (network) | `form_id`, `error_type` (validation, server, network), `error_field` (field *name* only) | Are people failing to send enquiries? |

### `cta_click` — C · basic
| Trigger | Params | Why |
|---|---|---|
| `data-track="cta"` on every "Request a quote" / "Contact" button: `src/components/show/DesignShowcaseView.tsx:39`, `src/app/shows/page.tsx:46,221`, `src/app/vision/page.tsx:152`, `src/app/about/page.tsx:165`, `src/app/team/page.tsx:148`, home CTAs (`src/app/page.tsx:148…`), the header nav CTA | `cta_name` (e.g. `design_request_quote`, `shows_hero_contact`), `placement` | Which pages and buttons send people to the contact form. Intent only, never a conversion. |

### `contact_click` — C · basic
| Trigger | Params | Why |
|---|---|---|
| every `mailto:` / `tel:` link (autotrack): `src/components/layout/Footer.tsx:105`, `/contact`, `/team` | `method` (email, phone), `placement` | Enquiries that skip the form. A tap is not a lead (it completes in the mail app). |

### `formation_view` — C · extra
| Trigger | Params | Why |
|---|---|---|
| Design a Show (`src/components/gallery/CulturalShowcase.tsx`), when a formation has been on screen for 2 s (so the auto tour and fast clicking don't flood it) | `formation_id`, `formation_theme`, `fleet_size`, `led_theme`, `pick_method` (link = opened from a URL, chip, tour = auto-advance, theme_filter) | **What visitors actually see**: the most-viewed formations, which ones people pick themselves vs. watch on tour, which fleet sizes. |

### `show_customise` — C · extra
| Trigger | Params | Why |
|---|---|---|
| `CulturalShowcase.tsx:569` (theme filter), `:597` (fleet), `:670` (LED hues), "View all" in `ChipRail.tsx`, play/pause `:621` | `control` (theme_filter, fleet, led_theme, view_all, pause), `option` (the chosen value), `formation_id` | Which controls people use and which choices are popular (e.g. 5,000-drone fleet, Holi hues). |

### `scene_3d` — C · extra
| Trigger | Params | Why |
|---|---|---|
| `SwarmCanvas` ready / fail (`src/components/swarm/SwarmCanvas.tsx`, `onFail` at `CulturalShowcase.tsx:514`), once per page view | `scene` (home, design), `result` (live, poster_fallback, failed), `quality_tier` (low, mid, high) | Did the visitor actually see the live 3D, or a still? Which devices get the low tier? |
| first orbit drag / zoom (`:544`), once per page view | `scene`, `action` (orbit, zoom) | Do people explore the sky, or just watch? |

### `home_story_progress` — C · extra
| Trigger | Params | Why |
|---|---|---|
| home scroll story (`src/components/home/homeStory.ts:33`), each beat once per page view | `beat` (1–4) | How far down the home story people get before leaving. |

### `select_content` — R · extra
| Trigger | Params | Why |
|---|---|---|
| a still in the home "Design a Show" strip (`src/components/home/DesignStrip.tsx:72`) | `content_type=formation_still`, `item_id` (formation id) | Which home stills pull people into Design a Show. |

### `share` — R · extra (replaces the Vercel `share`)
| Trigger | Params | Why |
|---|---|---|
| `src/components/gallery/ShareMenu.tsx:69` (copy), `:78` (native), `:148` (WhatsApp) | `method` (copy, native, whatsapp), `content_type=formation`, `item_id` | Which formations people share, and how. |

### `clip_record` — C · extra (replaces the Vercel `clip`)
| Trigger | Params | Why |
|---|---|---|
| `ShareMenu.tsx:101` and the download / share-clip buttons (`:159-169`) | `action` (record, download, share), `formation_id`, `fleet_size` | Is the 10-second clip feature used? |

### `page_not_found` / `exception` — C / R · basic
| Trigger | Params | Why |
|---|---|---|
| `src/app/not-found.tsx` (tiny client leaf) | — (GA4 adds page path + referrer) | Broken inbound links (old share links, typos). |
| `src/app/error.tsx:9` | `description` (error message, ≤100 chars, no stack), `fatal=false` | Pages that crash for visitors. |

### `web_vitals` — C · extra
| Trigger | Params | Why |
|---|---|---|
| `web-vitals` library, sampled 50 % of page views | `metric_name` (LCP, INP, CLS), `metric_rating`, `metric_value` (custom metric) | A 3D-heavy site: real-visitor speed by page and device, not just Lighthouse. |

**Automatic (Enhanced Measurement, no code):** visitors, sessions, engagement time, country,
device, traffic source, page views including client-side navigation (formation pages rewrite
the URL with `history.replaceState`, which EM counts as a page change), 90 % scroll, outbound
clicks (e.g. harshitcreates.in), file downloads.

**Click only (completes elsewhere):** `mailto:` / `tel:` taps (mail app / dialer) → recorded as
`contact_click`, never a lead.

## 4. Parameters, dimensions, user properties
| Param | Register as | Events |
|---|---|---|
| `page_type` (home, design_hub, formation, shows, about, vision, team, contact, credits, other) | event dimension (global) | all |
| `lead_type`, `lead_time`, `source_formation` | event dimensions | generate_lead |
| `form_id`, `error_type`, `error_field` | event dimensions | form events |
| `cta_name`, `placement` | event dimensions | cta_click, contact_click |
| `formation_id`, `formation_theme`, `fleet_size`, `led_theme`, `pick_method` | event dimensions | formation_view (+ others) |
| `control`, `option` | event dimensions | show_customise |
| `scene`, `result`, `quality_tier`, `action` | event dimensions | scene_3d, clip_record |
| `beat` | event dimension | home_story_progress |
| `metric_name`, `metric_rating` | event dimensions | web_vitals |
| `metric_value` | **custom metric** | web_vitals |

Built-in, not registered: `method`, `content_type`, `item_id`, `description`, `link_url`,
`percent_scrolled`. **23 of 50** event-scoped dimension slots used, 1 of 50 metrics.
`page_language` is left out: the site is English only.

**User properties:** none. **Internal traffic:** visiting `/internal` (the team academy) sets a
`traffic_type=internal` cookie, so the team's own visits are filtered out of reports.

### Also part of this plan
- **Consent banner (EEA / UK / CH only).** A small bar at the bottom: "We use cookies to
  understand how the site is used. Accept / Reject", plus a "Cookie settings" footer link for
  everyone. Google applies the denied default by the visitor's IP; the banner itself shows
  for European time zones (pages stay static — no server geo lookup). A European visitor
  with a non-European clock stays in the cookieless denied state and can still use Cookie
  settings, so it errs safe.
- **Privacy policy page (`/privacy`, new).** Google's terms require one that discloses GA4 and
  its cookies; the site has none today. Plain-language copy in `content.ts`, linked from the
  footer and the banner.
- **Where each lead came from, stored with the lead.** New nullable columns on `leads`:
  `utm_source`, `utm_medium`, `utm_campaign`, `landing_path`, `referrer`, `ga_client_id`,
  `source_formation`, so every enquiry in the database can be traced to its source even when
  GA4 is blocked or declined. SQL shown before it runs on Neon.
- **Vercel Web Analytics removed** (`layout.tsx:73-74`, `ANALYTICS_STUB`); `track()` in
  `src/lib/analytics.ts` becomes the dataLayer wrapper, so existing call sites keep working.

**Open questions for the owner**
1. Banner copy and look: the default above, in the site's dark style (preview before shipping).
2. `/privacy` copy needs the company's sign-off (it names Airimation as the data controller and
   hello@airimation.in as the contact).

## 5. Files
- `src/lib/analytics.ts` — the only dataLayer writer: `track()`, page_type, PII filter, one
  helper per event; `src/lib/autotrack.ts` — cta_click / contact_click / form_start from markup.
- `src/lib/gtmBootstrap.ts`, `src/lib/consent.ts` — inline loader and Consent Mode defaults,
  rendered in `src/app/layout.tsx` (production only; `/internal`, `/api` excluded).
- `src/components/analytics/` — `AnalyticsInit` (autotrack, attribution, Web Vitals),
  `ConsentBanner` (+ footer "Cookie settings"), `TrackView` (404), `InternalTrafficMark`.
- Call sites: `ContactForm.tsx`, `CulturalShowcase.tsx`, `ChipRail.tsx`, `ShareMenu.tsx`,
  `DesignStrip.tsx`, `HomeSwarmLoader.tsx`, `homeStory.ts`, `SwarmCanvas.tsx` (tier),
  `Button.tsx` (`cta` prop), `not-found.tsx`, `error.tsx`, `internal/layout.tsx`.
- `/privacy` (`src/app/privacy/page.tsx`, copy `privacyPolicy` in `content.ts`).
- Tests: `src/lib/__tests__/analytics.test.ts`; e2e "analytics" section in `scripts/e2e.mjs`.

## 6. Where each lead came from
`ContactForm` sends `attribution` (`src/lib/attribution.ts`): `utm_source`, `utm_medium`,
`utm_campaign`, `landing_path`, `referrer` (first landing in 90 days, replaced by a later
campaign visit), `ga_client_id` (from the `_ga` cookie) and `source_formation`. Validated in
`checkAttribution()` (known keys, strings, ≤300 chars), stored in 7 nullable `leads` columns.
**The columns must be added once** (SQL in README > Setting up Neon); until then the route
stores leads without them (Postgres 42703 fallback), so no enquiry is ever lost.

## 7. Owner's checklist (needs your Google login)
1. **Create** a GA4 property (Airimation, India time zone, INR) with a web stream for
   airimation.in, and a GTM web container. Put the GTM ID in Vercel → Project → Settings →
   Environment Variables → `NEXT_PUBLIC_GTM_ID` (Production), then redeploy.
2. Put the `G-…` ID into `docs/analytics-plan.json` (`measurementId`) and the GTM ID into
   `gtmId`, then generate and import the container:
   `node ~/.claude/skills/gtm-ga4-analytics/scripts/build-gtm-container.mjs docs/analytics-plan.json --out docs/gtm-container.json --checklist docs/gtm-manual-steps.md`
   GTM → Admin → **Import Container** → `docs/gtm-container.json` → New workspace →
   **Merge** → Rename conflicting. Admin → Container settings → enable **consent overview**.
3. **GTM Preview** on airimation.in — each action, exactly one tag:
   | Action | Tag | Params to see |
   |---|---|---|
   | Open `/design-your-show/ganesha`, wait 2 s | `GA4 - formation_view` | formation_id=ganesha, pick_method=link |
   | Change the fleet | `GA4 - show_customise` | control=fleet |
   | Share → Copy link | `GA4 - share` | method=copy |
   | `/shows` → "Book a Show" | `GA4 - cta_click` | cta_name=shows_hero_book |
   | Footer email link | `GA4 - contact_click` | method=email |
   | Submit a real test enquiry | `GA4 - generate_lead` | lead_type, lead_time, source_formation |
   | `/nope` | `GA4 - page_not_found` | — |
   Consent tab on the first event: "On-page default"; with a European VPN, Accept → "update".
4. **GA4 DebugView**: the same events arrive; `generate_lead` shows as a key event.
5. **GA4 admin** (Admin → …):
   - Custom definitions → create the 23 event-scoped dimensions in §4 and the custom metric
     `metric_value` (not retroactive — do it the day the container is published).
   - Key events → New key event → `generate_lead`.
   - Data retention → **14 months**.
   - Data streams → web → Enhanced Measurement: page changes on browser history **on**;
     form interactions **off** (the site sends its own form events); scrolls, outbound,
     downloads on.
   - Data filters → Internal traffic → define `traffic_type = internal` → **Active**.
   - Link Search Console; BigQuery export (free, keeps raw events beyond 14 months).
   - Content group: use `page_type` in explorations instead of URL rules.
6. Publish the GTM workspace only after 3–5 pass. Delete the test enquiry from `leads`.
7. ~~Run the README's `alter table leads …` on Neon~~ — done 27 Nov 2026.

**Progress, 28 Nov 2026** (owner chose to put both inside the existing harshitcreates accounts,
so no new Google terms were accepted):
- ✅ 1 GA4 property + web stream (India time, INR, Arts & Entertainment, small); GTM web
  container. ⏳ Vercel env var + redeploy — waiting on the owner.
- ✅ 2 Container generated (16 tags, 15 triggers, 33 variables) and imported into workspace
  "Analytics plan import" (Merge → Rename; 67 added, 0 modified/deleted). Consent overview on.
  **Not published.**
- ✅ 5 GA4 admin: 23 event-scoped dimensions + `metric_value` (Standard); `generate_lead` key
  event (no default value); event retention 14 months; Enhanced Measurement with history page
  changes on and form interactions off (scrolls, outbound, site search, video, downloads on);
  Internal Traffic filter (`traffic_type = internal`, Exclude) **Active**; Search Console
  (airimation.in domain property) linked. `description` / `fatal` (exception) are not
  registered — §4's 23 stand; the generator's checklist lists 25. GA4 also auto-starred
  `close_convert_lead` / `qualify_lead` (from the "Generate leads" objective); the site never
  sends them, so they are left as they are. BigQuery export: not set up (owner to decide).
- ⏳ 3, 4, 6 Preview / DebugView / publish — after the deploy.

## 8. Verification (27 Nov 2026, production build)
Lighthouse, mobile, median of 3 runs; before = the site before this change, after = with the
analytics code, consent banner and Clash Display (GTM itself loads only after interaction,
so it is never inside a Lighthouse run):

| Page | Score | LCP | TBT | CLS |
|---|---|---|---|---|
| `/` | 98 → 98 | 906 → 905 ms | 173 → 145 ms | 0.003 → 0 |
| `/design-your-show` | 75 → 79 | 3,475 → 3,542 ms | 300 → 158 ms | 0.195 → 0.195 (pre-existing) |
| `/contact` | 100 → 100 | 754 → 754 ms | 15 → 16 ms | 0 → 0 |

`check-datalayer.mjs` (test container id, Google requests blocked): 13/13 — no GTM before
interaction, loads on first interaction and at once on `?gclid`, gtm.js after the consent
commands and before queued events, noscript present, never on `/internal`, plan events
pushed with their params, no PII. `npm run test:e2e`: 96/96, including generate_lead only
after a successful (intercepted) submit, the consent banner by region, and no GA requests on
non-production builds.

## 9. Blind spots
- Ad blockers and declined consent hide a share of visits: GA4 is a sample, not a census.
  The `leads` table is the record of enquiries; compare it with `generate_lead` monthly.
- `mailto:` / `tel:` taps complete in the mail app or dialer: `contact_click` only.
- `formation_view` counts figures shown for 2 s; the auto tour counts too (`pick_method=tour`).
- The banner uses the time zone, not the IP (see §4); Google's IP-based default still applies.

## 10. Adding an event later
Add a helper to `src/lib/analytics.ts` (snake_case name, enum params, never typed text),
call it, add the event to `docs/analytics-plan.json` with a `why`, regenerate and **Merge**-
import the container (§7.2), and register any new param as a GA4 custom dimension the same day.
