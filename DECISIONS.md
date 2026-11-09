# Airimation — decisions and change log

*Living record of every decision taken so far about the company and this
website, and every change made to the site. Newest changes at the top of
the change log. Last updated: 10 November 2026 (round 4).*

Read this before changing copy, team, branding or the 3D swarm.

---

## 1. Company — decisions in force

### Identity and wording
| Decision | Since |
|---|---|
| Brand is **Airimation** (with the second "i"). "Airmation" is a misspelling; lint fails on it. | Jul 2026 |
| Legal entity: Airimation Technologies Private Limited (UP-registered Pvt Ltd). | Aug 2026 |
| **No flagship show name.** "Biscope"/"Bioscope" is dropped everywhere. A new name is undecided. | 7 Nov 2026 |
| **Never use the word "government"** in any Airimation material — say "civic" or "public". | 7 Nov 2026 |
| HQ wording: **Noida, Uttar Pradesh (Delhi NCR)**. (Older docs said Lucknow, then New Delhi — both superseded.) | Nov 2026 |
| Registration numbers (CIN, GSTIN, Udyam, DPIIT) are **not shown in full on the website** — masked. Full values are kept in `src/lib/registration.ts`, which no page imports. | 9 Nov 2026 |
| ⚠️ The CIN as supplied reads `…UW2026…`; UP is `UP`. Verify against the Certificate of Incorporation. | open |
| Logo: the drone-with-dotted-swirl mark. Colour and black versions exist; the no-colour one goes on the office name board. Vectorised from the black version (9 Nov 2026) — see §4. | Oct 2026 |

### Registrations (as last confirmed)
Incorporated (Pvt Ltd), GSTIN active, MSME/Udyam, DPIIT-recognised (Startup India). Startup UP expected. Still unconfirmed: PAN/TAN, bank, DIN/DSC, GeM, DGCA UIN/UAOP, trademark, social handles.

### Product and technology
| Decision | Since |
|---|---|
| **First prototype drone is built.** Now reducing its weight below 250 g. | 9 Nov 2026 |
| Show drone class: **sub-250 g, DGCA Nano category**. | 7 Nov 2026 |
| Flight firmware: **ArduPilot**. Show design/control: **Skybrush**. | Oct 2026 |
| Procurement: **drone components from Indian vendors only**. | 7 Nov 2026 |
| R&D plan: finalise circuit → outsource PCB → CAD + aerodynamics hire designs the frame around the PCB. Learning GCS software via "Sky deck". | Oct 2026 |
| Web stack: GitHub + Vercel + Neon. Year-1 software/cloud budget ₹15,000+/month. | Oct 2026 |

### Vision (two tracks, in order)
1. **Light shows.** Build a 100-drone fleet → test shows in UP → bigger shows → UP → NCR → pan-India → international. Long-range goal: **replace the fireworks at Formula 1.**
2. **R&D, once show operations are stable.** Grant-funded custom solutions: swarm-coordination IP for defence research partners (non-weaponised); civic/environmental work such as waste-site detection (camera payloads) and river-pollutant analysis (spectrometers). Research roadmap is owned by Neeraj Jain.

**Pledge:** Airimation will never make weapons of destruction — no armed drones, no kamikaze swarms — irrespective of the money.

**Culture:** inclusive and engaging; real money spent on people's growth (a crew that trusts each other is what keeps a show in sync).

### Fleet and operations
| Decision | |
|---|---|
| Timeline (year 0 = 2027) | 2 drones by Q2 2027 · 5 by end 2027 · **100 in 2028**, 6–8 shows by end 2028 · toward **500 in 2029** |
| Fleet unit | 50-drone packs; **minimum show = 2 packs (100 drones)**; never two shows in one night |
| Hiring | 7–8 interns, 2-month probation, confirm ≤5 at ₹10k/month; some go full-time from 2028; first ~15 people share the 10% ESOP pool |

### Money
- No current investment or investor (as of 7 Nov 2026).
- Nov 2026 pitch deck is for **grants** and asks for no amount.
- PoC investor talks (Oct 2026): vision mismatch. Final stand: PoC-only investment with later talks after the PoC, or a funded contract giving the funder a free licence to the IP while Airimation keeps it.

### Team
| Person | Website (public) | Internal role |
|---|---|---|
| Harshit Dixit | Co-founder & **Director** — technology, hardware, operations | CEO, only full-time member |
| Madhuri Mishra | Co-founder & **Director** — research and strategy | Lead Researcher (part-time) |
| Dr. Gaurav Tripathi | **Advisor** — operations and communication | COO (part-time) |
| Dr. Neeraj Jain | **Advisor** — technology and research | CTO (part-time) |
| Prof. Rajeev Tripathi, Dr. Deepak Kumar Singh, Dr. Vishal Krishna Singh | in config, **hidden** | advisors |

Rules: on the website, directors first, then advisors (9 Nov 2026). In **grant materials, name no advisors** (possible conflict of interest) and keep the core team untitled (commitment + responsibilities only). Never publish the cap table or majority-shareholder detail. Sandeep Srivastava, Anshuman and Adarsh Shukla are no longer part of the team.

---

## 2. Website — standing rules

**Honesty**
- Pre-first-show: every visual is labelled a **concept render / simulation**. No implied delivered shows, named clients, testimonials or case studies until real ones exist.
- No generated or stock photos of real people. Team photos are real headshots only.

**Content**
- All copy lives in `src/lib/content.ts`. Change facts there, not in pages.
- Retired words enforced by `npm run lint` (`scripts/check-brand-spelling.mjs`): "Airmation", "Biscope/Bioscope", "government".
- `/biscope` → `/shows` (permanent redirect in `next.config.ts`).
- No full registration numbers or street address anywhere the browser receives (footer, contact page, JSON-LD).

**Design**
- Dark near-black base, IBM Plex fonts self-hosted, amber as the single highlight colour.
- Home page copy stays monochrome and borderless over the swarm.
- Logo: white mark on dark surfaces, black mark on the light `/internal` theme.

**3D performance rules** (don't regress these)
- Frame rate capped at 60 fps (`MAX_FPS`); 120 Hz screens no longer render twice as often.
- DPR capped at 1.5 (high), 1.25 (mid), 1 (low). No MSAA.
- The runtime monitor may lower DPR, then bloom — **never** drone count or materials (a mid-scroll rebuild is a visible freeze).
- Bloom chain at half resolution. No `backdrop-filter` over a live canvas.
- 2D canvases sleep off-screen (`visibleRaf`).
- Orbit views allow a **full 360°**; idle auto-rotate stops the moment the visitor touches it and never pulls the camera back.

**Git / deploy**
- Work on `feat/3d-swarm`. Commits made by Claude land in the local repo; **pushing is done from Harshit's machine** (`git push origin feat/3d-swarm`), then Vercel deploys.
- macOS is case-insensitive and git can keep stale casing (`sandeep.JPG` incident): check `git ls-files` when a renamed file 404s on Vercel.

---

## 3. Animated formations — on Design a Show

Library: `src/lib/cultural/` (pure TypeScript, deterministic). Live in 3D on **`/design-your-show`** (the gallery page now redirects there). Each formation declares the smallest fleet at which it still reads; the fleet dropdown (100 / 200 / 500 / 800 / 1,500 / 2,000) shows only those, grouped as *Story & culture*, *Sculptures — real 3D scans*, *3D shapes*.

| Fleet | Formations offered |
|---|---|
| 100 | Tiranga, Diya, Kamal, Dil + 9 3D shapes (globe, double helix, atom, torus knot, cube, rising spiral, diamond, pyramid, starburst) |
| 200 | + Om, Damru, Dhanush-baan |
| 500 | + Ganesha, Mahadev, Dragon |
| 800 | + **Nataraja** (Cleveland 1930.331 scan, ring of fire), **Dancing Shiva** (Minneapolis scan) |
| 1,500, 2,000 | + **Somaskanda** (Minneapolis scan) — all 22 |

**Real drone speeds (decided 10 Nov 2026).** Every drone in every formation stays **under 8 m/s**, enforced by `src/lib/cultural/__tests__/speed.test.ts` (every drone, every frame, including the loop wrap). Anything faster is done with **light** on drones that hold still, as real shows do:
- Dhanush-baan: the draw takes 6 s; at release the arrow's flight is a light-chase along drones parked on the flight path; string and arrow reset in the dark.
- Damru: one slow turn per 40 s; the beat is a white flash on the drumhead each time a bead's swing peaks.
- Mahadev: the Ganga holds its shape; ripples of light run down it.
- Diya: the flame's shape moves slowly; the flicker is brightness and colour.
- Dragon: one lap per 80 s; fire breath is light on parked drones.
- Dil: the beat is a light pulse with a 2% swell.
- Transitions between formations last as long as the distance needs (6–24 s).

Export at 500 drones (`Formations/REPORT.md`): max speed 2.2–7.5 m/s for all. Remaining gap to flight-ready is **separation**: only the scan sculptures (2.8–4.6 m) and Mahadev (2.1 m) already meet ~2–3 m; the rest need spacing widened in Skybrush.

**Depth.** Flat drawings are "inflated" into rounded reliefs (each part bulges from its own edge, `kit.ts > inflate`), so Ganesha, Mahadev, Om, Diya and Dil have volume when orbited. The scans and 3D shapes are true 3D.

**Scans** (`scripts/scan-to-formation.mjs`): GLB → surface samples → farthest-point ordering (any prefix is evenly spread, so one file serves every fleet size) → `src/lib/cultural/scans/<id>.json` (~24 KB). Shading is light: brightness follows each surface normal against a fixed light while the figure turns. Source files and licences: `Airimation/Scans/SOURCES.md`.

**Export** (`npx vite-node scripts/export-formations.ts -- ../Formations 500 24`) writes per formation:
- `<id>.skybrush.zip` — Skybrush Studio for Blender "zipped CSV" import: one CSV per drone, `Time_msec,x_m,y_m,z_m,Red,Green,Blue`, metres, Z up, linear colour. Works on the free community server.
- `<id>.formation.csv` — static formation, Skybrush "static CSV": `Name,x_m,y_m,z_m,Red,Green,Blue`.
- `<id>.points.json` — 600 points, our Formation Asset Spec format.
- `<id>.preview.svg` and `REPORT.md` (speed and separation).

Before any depiction of a deity is used publicly, have someone who knows the iconography review it.

---

## 4. Research — free/open sources for Indian show content (9 Nov 2026)

**What Indian drone shows actually show** (benchmark): Beating Retreat (BotLab, ~1,000 drones), and Ayodhya **Deepotsav, 7 Nov 2026: 2,100 indigenous drones, 12 formations narrating the Ramayana**, including a purpose-built Lord Ram formation, with a laser show, over 30 lakh diyas on 56 Saryu ghats. Typical motifs: Ram, Sita, Lakshman, Hanuman, the temple, bow and arrow, diyas, lotus, Om, the tricolour, Chandrayaan, national leaders.

**Competitive risk:** the temple-town wedge in our own plan is already being served at 2,000+ drones by an established operator, in Ayodhya, two days ago. A 100-drone Airimation show in 2028 cannot compete on scale there; it has to compete on access, price, availability on peak dates, and smaller venues (district events, weddings, ghats other than the flagship ones).

**Free 3D sources (verified in Chrome, Sketchfab, filter: CC0 + downloadable)**
- Museum open-access scans released **CC0 (public domain)** — free for commercial use, no attribution required. Found: two **Ganesha** sculptures (incl. Cleveland Museum of Art 1970.62), three **Shiva Nataraja** (incl. Cleveland 1930.331, with the ring of fire — an ideal drone subject), a **Somaskanda** bronze (Shiva, Uma, Skanda), **Uma-Maheshvara**, and **1971.167 Model of a Sikhara** (temple tower).
- Path to a formation: download the mesh (needs a Sketchfab login on your account) → sample its surface in Blender or our kit → Skybrush. Real 3D sculptures give true 3D drone figures, not flat reliefs.
- No CC0 Varanasi ghat, Taj Mahal or India Gate model found. Free models on CGTrader/RenderHub are under their own (usually non-redistributable) licences — check each one; buying a commercial-use licence is often cheaper than modelling.

**2D sources**
- Flag of India and Ashoka Chakra SVGs on Wikimedia Commons are public domain. (Our Tiranga is built in code.)
- **Map of India: avoid unless drawn from the official Survey of India outline.** Wrong boundaries carry legal risk, and the proposed Geospatial Information Regulation Bill provided for heavy fines; use the official map or don't show one.
- Don't trace copyrighted illustrations, characters or logos (per the Formation Asset Spec).

**Skybrush import formats** (from its docs): static CSV and zipped per-drone CSV work on the free community server; **SVG import and DSS .path files need a paid (PRO) licence**. Our exporter targets the free formats.

Sources: [Republic World — Ayodhya Deepotsav 2026](https://www.republicworld.com/india/ayodhya-witnesses-grand-spectacle-as-2100-indigenous-drones-lights-up-night-sky-narrates-epic-tale-of-ramayana-2026-11-07-140630) · [ThePrint — BotLab at Beating Retreat](https://theprint.in/india/the-make-in-india-dream-of-an-iit-delhi-startup-whose-drones-lit-up-sky-at-beating-the-retreat/816737) · [Skybrush — Formations panel](https://docs.skybrush.io/public/skybrush-studio-for-blender/latest/panels/formations/formations.html) · [Sketchfab — public domain for cultural heritage](https://sketchfab.com/blogs/community/sketchfab-launches-public-domain-dedication-for-3d-cultural-heritage) · [Cleveland Museum of Art on Sketchfab](https://sketchfab.com/clevelandart/models) · [Scroll — incorrect map of India penalties](https://scroll.in/latest/807682/scroll_in) · [Mondaq — maps in publications](https://www.mondaq.com/india/publishing/812872/maps-in-publications-permissions-restrictions-and-legal-consequences)

---

### Research → implementation status (10 Nov 2026)
| Research item | Status |
|---|---|
| CC0 museum scans → 3D formations | ✅ 5 downloaded from **Zenodo** (CC0 mirrors; no Sketchfab login): 3 Nataraja, Somaskanda, Uma-Maheshvara. 3 shipped (Nataraja 1930.331, Minneapolis Nataraja, Somaskanda). Uma-Maheshvara (flat stele) and Nataraja c.1100 (duplicate) not shown. |
| Ganesha scans (Cleveland 1970.62, Minneapolis) and shikhara | ❌ not available as CC0 on Zenodo; Sketchfab needs a login. Our drawn Ganesha stays. |
| Other Zenodo Natarajas | ⛔ CC BY-NC (non-commercial) — not usable. |
| Flag and Ashoka Chakra | ✅ Tiranga built in code (3:2, 24 spokes). |
| Map of India — official outline only | ✅ none on the site (checked both formation libraries). |
| No traced copyrighted art | ✅ all figures are code, CC0 scans or our own drawings. |
| Skybrush import formats | ✅ exporter writes zipped-CSV and static-CSV exactly as documented. |
| Ghat / Taj Mahal / India Gate models | ⏸ no free CC0 source; commercial licence needed — your call. |
| Competitive risk (Deepotsav, 2,100 drones) | ℹ strategy, not a site change — see §4. |

## 5. Change log

### 10 Nov 2026 — round 4
- **Design a Show = the 3D showcase.** `/design-your-show` now shows the fleet-size showcase (100–2,000 drones) with a Request-a-quote CTA. The old formation-picker configurator is **archived** at `/design-your-show/classic` (noindex, not linked) with a note pointing to the new page; old share links `/design-your-show/s/…` still open it. `/gallery` → 308 to `/design-your-show`; Gallery removed from the nav.
- **Real drone speeds:** every formation re-choreographed under 8 m/s (see §3); speed test added; all motion now loops seamlessly.
- **3D:** reliefs inflated; 3 CC0 scan sculptures added; 9 3D shapes from the archived designer carried over.
- Formation buttons grouped; transitions scale with distance.
- `Scans/` folder in the workspace with the 5 GLBs and `SOURCES.md`; exports regenerated (22 formations).

### 9 Nov 2026 — round 3
- **Verified** the whole doc against a production build (§6).
- **Performance rule fix:** the show sound toggle (home, configurator) and the configurator's first-visit hint used `backdrop-blur` over the live canvas. Blur removed; backgrounds made a little more opaque instead.
- `public/team/README.md` rewritten: it still listed Anshuman and Adarsh Shukla.
- This file: §6 Verification added; open items renumbered to §7.

### 9 Nov 2026 — round 2
- **Footer:** registration numbers masked (`U823xxxx…`), full street address replaced by "Greater Noida, Uttar Pradesh"; full numbers removed from the browser bundle and from JSON-LD (moved to `src/lib/registration.ts`). Site links in **two columns**.
- **Contact page:** same masking; short registered office.
- **Logo:** attached logo vectorised (potrace) with transparent background. White mark in the header and footer (black on `/internal`), favicon (`src/app/icon.png`), Apple touch icon, `logo` in JSON-LD. Files: `public/brand/airimation-mark-white.svg`, `-black.svg`, `airimation-logo-512.png`; 2048 px PNGs in the workspace `Brand/` folder.
- **About:** member cards show round photo thumbnails. **Home:** team photos reduced (112–144 px).
- **Gallery showcase:** fleet dropdown **100 / 200 / 500 / 800 / 1,500 / 2,000**; capacity raised to 2,000; each fleet lists only formations that read at that size (≥4 at 100). New formations: **Tiranga** (waving, chakra turning), **Diya** (flickering flame), **Kamal** (lotus blooming toward the audience), **Dil** (heartbeat), **Om** (light running along the strokes). Damru and Dhanush-baan now from 200 drones. Growing the fleet launches the new drones from the ground.
- **360° orbit fixed:** the gallery camera was clamped to ±63° and an idle drift pulled it back. Now unrestricted; idle auto-rotate stops on touch.
- **Removed** the 2D "formation library" cards from `/gallery` and the `FormationPreview` component.
- **Exporter** now writes Skybrush-ready zips and static formation CSVs in Skybrush's documented column format (linear colour), plus lit-vs-dark speed in the report.
- This file.

### 9 Nov 2026 — round 1 (commits `8c94955`, `9e3fc39`, `5281da3`)
- **Performance:** 60 fps cap, DPR 1.5, no MSAA, half-res bloom; runtime monitor no longer rebuilds the swarm; low tier skips the 85k-triangle city ring on home; scroll scrub 1.1 s → 0.7 s; header backdrop-blur removed; 2D canvases sleep off-screen. High tier measured ~2.9× faster per frame (software GPU), before the 120 Hz halving.
- **Animated cultural formations:** figure kit + Ganesha, Mahadev, Damru, Dhanush-baan, Dragon; live 3D showcase on `/gallery`; export script; tests.
- **Content:** "Where we are" section (prototype built, going Nano, ArduPilot + Skybrush, Indian parts) on home and `/vision`; `/vision` rewritten around the two tracks, dated roadmap, pledge, principles; directors/advisors as in §1; Biscope retired (`/shows`, AIRIMATION wordmark); "government" removed; HQ Noida; lint guard for retired words.

### Before November 2026 (summary)
- Jul 2026: Next.js site built; Neon contact form; IBM Plex self-hosted; homepage v2 scroll story; monochrome/borderless rules; white swarm; `/investors` removed; `/team`; `/internal` Academy + quiz with its own pink/yellow theme; brand spelling fixed to Airimation sitewide; sandeep.jpg casing fix.
- Sep–Oct 2026: 3D R3F swarm with GPU morphing, home scroll story, `/design-your-show` configurator with share links and OG images, poster frames, synthesised show sound, statutory details in footer, advisors kept in config but hidden.

## 6. Verification — 9 Nov 2026 (round 3)

Every claim in §1–§5 that the site can show was checked against the code
and a production build (`npm run build && npm run start`), in Chrome.
Re-run this list after any change to copy, team, branding or the swarm.

| Check | How | Result |
|---|---|---|
| Lint + retired words | `npm run lint` | ✅ pass |
| Tests | `npm test` | ✅ 29/29 |
| Production build | `npm run build` | ✅ pass |
| `/biscope` → `/shows` | `curl -I` | ✅ 308 to `/shows` |
| Retired words, removed members, hidden advisors in served HTML (/, /shows, /about, /vision, /gallery, /team, /contact, /design-your-show) | grep | ✅ none |
| Full CIN/GSTIN/street address in HTML or `.next/static` bundle | grep | ✅ none; footer shows `U823xxx…`, `09xxx…`, `UDYAM-UP-xxx…`, `DIPPxxx…`, "Greater Noida, Uttar Pradesh" |
| JSON-LD | read `/` | ✅ logo URL, locality only, no numbers |
| HQ wording | read pages | ✅ "Noida, Uttar Pradesh (Delhi NCR)" |
| Concept-render / simulation labels | read pages | ✅ on /, /shows, /gallery, /design-your-show, footer |
| Team order and roles | read /, /about, /team | ✅ Directors Harshit, Madhuri; Advisors Gaurav, Neeraj; other three hidden |
| Home team photos | Chrome | ✅ 144 px (desktop) |
| /about thumbnails | Chrome | ✅ round, 64 px |
| Logo | Chrome | ✅ white mark in header + footer, black on `/internal`, `icon.png` + `apple-icon.png` served |
| Footer | Chrome | ✅ two link columns, masked numbers, harshitcreates.in credit |
| "Where we are" | read / and /vision | ✅ prototype, Nano, ArduPilot, Skybrush, Indian parts; pledge and F1 goal on /vision |
| Gallery fleets + formations | Chrome, every option | ✅ exactly as the §3 table |
| 2D formation cards removed | code + Chrome | ✅ |
| 360° orbit | Chrome, dragged ~270° | ✅ goes behind the figure, no pull-back |
| 60 fps cap, DPR caps, no MSAA, half-res bloom, monitor never rebuilds | code (`quality.ts`, `SwarmCanvas.tsx`, `Effects.tsx`) + Chrome (canvas at 1.5× on a 1.8× screen) | ✅ |
| No `backdrop-filter` over a live canvas | code + Chrome | ❌ → fixed: sound toggle and configurator hint still blurred; blur removed (round 3) |
| Exporter column format | code | ✅ matches §3 |

Not checkable from the site: company facts in §1 (registrations, fleet
plan, money, internal roles) and the research in §4 — recorded as given.

---

## 7. Open items
- [ ] Push `feat/3d-swarm` and check the Vercel preview on a real phone and a MacBook.
- [ ] Verify the CIN state code ("UW" vs "UP").
- [ ] Iconography review of Ganesha, Mahadev and Om before promoting them.
- [ ] Test-import one `*.skybrush.zip` in Skybrush Studio for Blender.
- [x] CC0 scans → 3D formations (Nataraja ×2, Somaskanda shipped, 10 Nov).
- [ ] A CC0 or licensed Ganesha 3D scan, if one turns up (none free on Zenodo).
- [ ] Widen spacing to ≥2 m in Skybrush for the drawn figures before any real flight (speeds are already real).
- [ ] `Airimation_Context_Brief.md` in the workspace is stale (Biscope, New Delhi, Sandeep) — update before sharing.
- [ ] Choose a new flagship show name (or decide not to have one).
- [ ] Two public emails disagree: the footer/contact show `hello@airimation.in` (marked TODO in `content.ts` until Google Workspace is set up) while JSON-LD uses `teamairimation@gmail.com`. Pick one; make sure hello@ actually receives mail before launch.
- [ ] `/internal` academy progress bar still uses `backdrop-blur` over its 2D hero canvas (internal page only; low priority).
