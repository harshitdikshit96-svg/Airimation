# Airimation — decisions and change log

*Living record of every decision taken so far about the company and this
website, and every change made to the site. Newest changes at the top of
the change log. Last updated: 9 November 2026.*

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

## 3. Animated formations

Library: `src/lib/cultural/` (pure TypeScript, deterministic). Live in 3D on `/gallery`. Each formation declares the smallest fleet at which it still reads; the fleet dropdown shows only those.

| Fleet | Formations offered |
|---|---|
| 100 | Tiranga, Diya, Kamal (lotus), Dil (heart) |
| 200 | + Om, Damru, Dhanush-baan |
| 500, 800, 1,500, 2,000 | + Ganesha, Mahadev, Dragon (all 10) |

**Flight feasibility** (from the export script at 500 drones — see `Formations/REPORT.md`): the web versions are concept animations. Real show drones fly ~3–8 m/s with ~2–3 m separation.
- Already near real speed: **Om (3.8 m/s), Ganesha (4.6), Tiranga (6.9)** — spacing still needs widening.
- Mahadev ~2× too fast (the Ganga flow should become a light effect).
- Diya, Kamal, Dil 3–4× too fast.
- Damru, Dhanush-baan, Dragon move far faster than drones can — in a real show these become **light effects** (LEDs chasing along drones that hold still) or much slower motion.

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

## 5. Change log

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

---

## 6. Open items
- [ ] Push `feat/3d-swarm` and check the Vercel preview on a real phone and a MacBook.
- [ ] Verify the CIN state code ("UW" vs "UP").
- [ ] Iconography review of Ganesha, Mahadev and Om before promoting them.
- [ ] Test-import one `*.skybrush.zip` in Skybrush Studio for Blender.
- [ ] Pick 1–2 CC0 museum scans (Nataraja 1930.331, Ganesha 1970.62) to turn into 3D formations — needs downloading from your Sketchfab account.
- [ ] `Airimation_Context_Brief.md` in the workspace is stale (Biscope, New Delhi, Sandeep) — update before sharing.
- [ ] Choose a new flagship show name (or decide not to have one).
