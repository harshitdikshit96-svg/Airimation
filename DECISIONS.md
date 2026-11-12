# Airimation — decisions and change log

*Living record of every decision taken so far about the company and this
website, and every change made to the site. Newest changes at the top of
the change log. Last updated: 12 November 2026 (round 10).*

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
| Company email: **hello@airimation.in** — footer, contact, JSON-LD and the phone screen. The team's own addresses (harshit@, madhuri@, gaurav@airimation.in) stay on /team. The old Gmail address is gone. | 12 Nov 2026 |
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

**Phones** (12 Nov 2026)
- Below 768 px wide the site shows only the home scene's live drone animation (low quality tier, poster first) and a gentle note: "Airimation is best seen on a bigger screen", with a hello@airimation.in button (`PhoneGate.tsx`, `src/lib/phone.ts`). The pages stay in the server HTML (hidden by CSS) so search engines still read them; the gate's 3D loads only on phones.

**Design**
- Dark near-black base, IBM Plex fonts self-hosted, amber as the single highlight colour.
- Home page copy stays monochrome and borderless over the swarm.
- Inner-page backdrop overlay: 55% plus a 60% left gradient behind the text (was 80% + 70%), so the dusk sky shows while white copy stays legible.
- **Design a Show:** the 3D sky is the hero — full width, straight under the header; controls below it; the heading and copy after.
- Logo: white mark on dark surfaces, black mark on the light `/internal` theme.

**3D performance rules** (don't regress these)
- Frame rate capped at 60 fps (`MAX_FPS`); 120 Hz screens no longer render twice as often.
- DPR capped at 1.5 (high), 1.25 (mid), 1 (low). No MSAA.
- The runtime monitor may lower DPR, then bloom — **never** drone count or materials (a mid-scroll rebuild is a visible freeze).
- Bloom chain at half resolution. No `backdrop-filter` over a live canvas.
- 2D canvases sleep off-screen (`visibleRaf`).
- Orbit views allow a **full 360°** round the figure and from 12° off vertical down to the audience's eye. **The camera moves only when the visitor moves it** — no idle auto-rotate (removed 12 Nov 2026). The one reframe is right after the visitor changes the fleet size, and it stops the moment they touch the view.
- **Figures hold still**, facing the audience (no turntable, no sway); only light effects move (flame, heartbeat, drum, arrow, fire ring, the Tiranga's wave and chakra, the shapes' rising light). The visitor orbits to see them in the round.
- **A full-screen canvas never traps scrolling:** a plain wheel (and a vertical swipe on touch) scrolls the page; zoom is Ctrl/⌘ + wheel (a trackpad pinch), or the +/− buttons.
- Design a Show uses **Neutral tone mapping** (Khronos PBR Neutral) and a less white-hot drone core, so each drone's colour reads; the home page keeps AgX and the white-hot core (`SwarmCanvas toneMapping`, `uWhiten`/`uCoreGain`/`uHaloGain` uniforms).
- **Formation data loads on demand:** the page ships a small manifest (`scans/manifest.ts`, generated by `scripts/scan-manifest.mjs`); a model's points (~20 KB) download the first time it is shown, the next one is prefetched. Still figures are posed and uploaded once, not every frame.

**Git / deploy**
- Work on `feat/showcase-models` (merges to `main` later; `feat/3d-swarm` is the earlier branch). Commits made by Claude land in the local repo; **pushing is done from Harshit's machine** (`git push origin feat/3d-swarm`), then Vercel deploys.
- macOS is case-insensitive and git can keep stale casing (`sandeep.JPG` incident): check `git ls-files` when a renamed file 404s on Vercel.

---

## 3. Formations — on Design a Show

Library: `src/lib/cultural/` (pure TypeScript, deterministic). Live in 3D on **`/design-your-show`**. One flat list of buttons — no group headings (removed 12 Nov 2026).

**Rule (12 Nov 2026): only formations made from a real 3D model.** A museum scan or an openly licensed model (`scans/`), a symbol **we model ourselves in Blender** (`scripts/blender/make-symbols.py`), an exact geometric shape (`classic.ts`), or the national flag drawn to its official specification (`tiranga.ts`). No hand-drawn 2D figures. Mahadev was removed (the Nataraja scans cover Shiva); Kamal and Om came back as our own models. Licences: CC0 / public domain, CC BY 4.0 (credited on `/credits`), or our own. Never NC, ND or SA.

| Formation | Model | Licence | From fleet |
|---|---|---|---|
| Tiranga | Flag Code of India spec; chakra with 24 spokes | — | 200 |
| Diya | "Terracotta lamp", Institute of Classical Studies, London (harlehrenberg) + a light-only flame | CC BY 4.0 | 100 |
| Dil | Heart-shaped snuffbox, Sosenko Family Foundation / Virtual Małopolska | CC0 | 100 |
| Damru | "Damru – Small Two Headed Drum" (INDIANMONSTERYT) | CC BY 4.0 | 100 |
| Dhanush-baan | "Bow & Arrow" (MOJackal); arrow nocked by `scripts/nock-arrow.mjs`. **Fires:** string and arrow draw back 8 m, the arrow is loosed and flies 56 m at 7 m/s, returns dark, relights (24 s loop) | CC BY 4.0 | 100 |
| Shankh | "Hindu God Conch Shell" (rushat_saiyush) | CC BY 4.0 | 100 |
| Trishul | modelled by Airimation (with a damru below the head) | own | 100 |
| Kalash | modelled by Airimation (pot, mango leaves, coconut) | own | 100 |
| Om | modelled by Airimation from the Noto Sans Devanagari glyph (SIL OFL) | own | 200 |
| Kamal | modelled by Airimation; petals as outlines, bloom faces the audience | own | 200 |
| Taj Mahal | "Taj Mahal" (choi464); building + minarets only (`--only`) | CC BY 4.0 | 200 |
| Nandi | Chola-period Nandi, Dallas Museum of Art scan (pressefr) | CC BY 4.0 | 500 |
| Hanuman | *Hanuman Conversing*, Scan the World | CC0 | 500 |
| Ganesha | Ganesha, 10th–11th C, Minneapolis Institute of Art | CC0 | 500 |
| Dragon | "Dragon statuette" (norgeotloic, from a jschmidtcreaform scan) | CC BY 4.0 | 500 |
| Nataraja | 1930.331, Cleveland Museum of Art (ring of fire) | CC0 | 800 |
| Vishnu on Garuda | 12–13th C bronze, Minneapolis Institute of Art | CC0 | 800 |
| Dancing Shiva | Shiva Nataraja, Minneapolis Institute of Art | CC0 | 800 |
| Somaskanda | Minneapolis Institute of Art | CC0 | 1,500 |
| **Ram** | modelled by Airimation (`scripts/blender/make-ram.py`): standing, Kodanda bow in the left hand, arrow in the right, crown and halo | own | 500 |
| **Ram Mandir** | modelled by Airimation from published dimensions (380 × 250 ft, 161 ft shikhara, five mandapas, Nagara style) | own | 800 |
| 9 3D shapes | globe, double helix, atom, torus knot, cube, rising spiral, diamond, pyramid, starburst | — | 100 |

**From Sketchfab (12 Nov 2026), 29 more** in `scans/sketchfab.ts` — all CC0 or CC BY 4.0, credited on `/credits`:
- *Culture:* Standing Ganesha (CMA 1970.62, CC0), Temple tower (CMA 1971.167 Sikhara, CC0), and a clay **Diya** with a lit wick (replaces the Roman lamp).
- *Landmarks:* Charminar, India Gate, Qutub Minar, Eiffel Tower, Burj Khalifa, Statue of Liberty, Big Ben.
- *Animals:* tiger, elephant, lion, horse (galloping), eagle, owl, butterfly, dolphin (leaping), whale, koi.
- *Travel:* classic car (the Hindustan Ambassador model — labelled "Classic car", the name is a trademark), auto-rickshaw, bicycle, biplane (CC0), Space Shuttle Discovery (Smithsonian, CC0), hot-air balloon.
- *Objects:* sitar, violin, rose.
- Tried and dropped: steam train (flattens to a slab), crown (reads as a dome), junk ship (150 MB).

A **Theme** filter (All / Culture & devotion / Landmarks / Animals / Travel / Objects / Shapes) sits beside Fleet — 55 formations at 2,000 drones. Long models are capped at 130 m (`--max-extent`).

All GLBs and their record numbers: workspace `Scans/SOURCES.md`. **Credits are on `/credits`** (linked from the footer, noindex), not on Design a Show (12 Nov 2026) — CC BY 4.0 requires the attribution to be on the site.

**Motion and light.** Models turn on a turntable; flat ones (lamp, heart, bow) sway ±24–30° so they never go edge-on. Effects are light only and add no drones outside the model: diya flame (10% of the fleet, at the spout), heartbeat pulse, drum heads flashing, a pulse running along the arrow, Nataraja's ring of fire. A test checks every drone stays within the model's bounds (the old Dhanush-baan's streak of extra lights is gone).

**Speeds.** Choreography stays under **8 m/s** (speed test). The **preview plays 1.8× faster** (12 Nov 2026: "mid-way between the old fast version and real speed"); the page copy says it is sped up. Transitions 4.5–14 s.

**Fleet size = picture size.** Drones keep their spacing, so a bigger fleet flies a **bigger** figure (size ∝ √fleet, ×0.5 at 100 to ×2 at 2,000), higher up, and the camera eases back once to frame it — more detail, not just more density. Changing the fleet redraws the current figure **in place** — no drones flying up from the ground (only the first load lifts off).

**Per-drone colour** (12 Nov 2026) — so a figure's features read instead of one flat colour. Two sources, set per formation in `paint` (`scan.ts > Paint`):
- **The model's real colours.** `scripts/scan-colors.mjs` samples each source GLB's texture (the museum's photograph, or the artist's paint) at every drone, and stores a short hex palette plus a per-drone index in the formation JSON. The formation points were made with unrecorded orientation options, so the script finds the alignment itself (24 right-angle starts + ICP); fit error is printed (most < 1% of height; butterfly 2.4%, Somaskanda 3.8%). Done for 38 models.
- **Hand-designed config**, from photographs of the real subject: a `ramp` (hex codes dark → light: a bronze's folds deep amber, its raised face gold; the white-tiger model flown as an orange tiger with dark stripes), a `palette` override (Ambassador white, auto-rickshaw green and yellow, India Gate buff with red base) and `regions` by position (Qutub Minar red sandstone below, marble storeys above; Taj white marble with gold finials; trishul, kalash, Om, kamal, Hanuman, Ram's blue skin / yellow pitambar / gold crown and bow). Untextured models use regions only.
Brightness follows texture brightness (never below a floor, so a dark drone still draws the shape), then surface shading. Tested: every scanned figure has varied colour (`paint.test.ts`). Check by eye with `npx vite-node scripts/preview-formations.ts -- <outDir> 1500` (contact sheets in Chrome).

**LED hues** (restored 12 Nov 2026): Per formation, Diwali gold, Royal, Moonlight, Tiranga, Wedding rose. A palette keeps each drone's brightness and takes the hue from a top-to-bottom gradient (`showcaseMath.ts > applyHues`).

**Adding a model:** `node scripts/scan-to-formation.mjs <glb> <id> [--rotate-x] [--rotate-y] [--tilt-x] [--crop-bottom] [--box …] [--only nodeA,nodeB] --label … --credit … [--licence "CC BY 4.0" | "Airimation"]`, then `node scripts/scan-colors.mjs <glb> <id>` for its real colours, `node scripts/scan-manifest.mjs` to list it, give it a `paint` config, and register it in `scans/index.ts` and `__tests__/scanFiles.ts`. The tests check licence, credit, bounds, palette indices and that it isn't one flat colour.

**Export** (`npx vite-node scripts/export-formations.ts -- ../Formations 500 24`): Skybrush zipped CSV + static CSV + points JSON + preview SVG + `REPORT.md` per formation (unchanged).

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

## 4b. Research — what Indian drone shows fly, and which have open 3D models (12 Nov 2026)

### What has been flown in India (reported)
| Event | Fleet | Formations reported | Source |
|---|---|---|---|
| Beating Retreat 2022 (BotLab) | ~1,000 | globe, map of India, Indian flag | [Careers360](https://news.careers360.com/republic-day-2022-iit-delhi-startup-behind-drone-show-at-beating-retreat-ceremony) |
| Beating Retreat 2023 (BotLab) | 3,500 | not itemised in coverage | [Wikipedia — Drone art](https://en.wikipedia.org/wiki/Drone_art) |
| Maha Kumbh, Prayagraj, Jan 2025 (UP Tourism) | "hundreds" (2,000 planned) | Samudra Manthan, Amrit Kalash, deities drinking amrit, Mahakumbh + UP logos, tricolour | [Outlook Traveller](https://www.outlooktraveller.com/whats-new/all-about-the-prayagraj-maha-kumbh-2025-drone-show), [India TV](https://www.indiatvnews.com/uttar-pradesh/mahakumbh-drone-show-at-kumbh-mela-a-visual-spectacle-as-prayagraj-night-sky-lights-up-2025-01-24-972966) |
| Ayodhya Deepotsav 2024 | 500 | Ram, Lakshman, Hanuman, Ravan vadh (+ lasers, voiceover) | [Asianet](https://newsable.asianetnews.com/india/ayodhya-deepotsav-2024-spectacular-500-drone-show-to-dazzle-devotees-gcw-sljw0q) |
| Ayodhya Deepotsav 2025 | 1,000+ | Ram holding his bow, Hanuman carrying Sanjeevani, building the Ram Setu, Ram Janmabhoomi temple | [The Statesman](https://www.thestatesman.com/india/ayodhya-deepotsav-2025-to-feature-spectacular-1000-drone-show-on-october-19-1503480891.html), [Organiser](https://organiser.org/2025/10/19/321760/bharat/deepawali-2025-ayodhya-lights-up-with-special-drone-show/) |
| Ayodhya Deepotsav 2026 | 2,100 | 12 Ramayana scenes: Ram heroic pose, Ravana's killing, Pushpak Viman, Ram Darbar, temple, Lakshman, Hanuman, Valmiki, Tulsidas | [ThePrint](https://theprint.in/india/ayodhyas-deepotsav-draws-foreign-tourists-drone-show-recreates-ramayana-scenes/3093454/) |
| IPL Final 2026, Ahmedabad (BotLab) | — | trishul, damru, Nataraja, IPL trophy | [OfficeChai](https://officechai.com/startups/iit-delhi-incubated-botlab-dynamics-lights-up-skies-with-its-lord-shiva-themed-drone-show-during-ipl-final/) |
| Mysuru Dasara 2025 / 2026 (BotLab) | 3,000 / 3,473 | tiger (Guinness record), peacock (Guinness record) | [Outlook Business](https://www.outlookbusiness.com/spotlight/pr-wire/mysuru-dasara-drone-shows-by-botlab-dynamics-sets-guinness-world-record-with-a-spectacular-3473-drone-peacock) |
| Durga Puja, Eden Gardens (BotLab) | 3,000 | Durga Puja theme (company claim, no itemised list) | [Tribune](https://www.tribuneindia.com/news/business/botlab-dynamics-performs-landmark-ipl-final-drone-show-captivating-128000-fans-in-the-stadium-and-millions-more-online/) |
| Crunchyroll Ani-May, Mumbai, May 2026 | — | anime (licensed: One Piece and others) | [Outlook Respawn](https://respawn.outlookindia.com/pop-culture/pop-culture-news/crunchyroll-brings-ani-may-anime-party-and-drone-show-to-mumbai) |

Most coverage is press releases from the operators (mainly BotLab), so counts are self-reported. Not found: itemised Ganesh Chaturthi or Krishna (Janmashtami) shows, or a Chandrayaan formation.

**Pattern:** Indian shows are **narrative** — a story in 8–12 scenes (Ramayana, Samudra Manthan), each a figure plus a symbol — not loose abstract patterns. Big operators win on scale (2,000–3,500 drones, Guinness records). At 100–200 drones, Airimation competes on **symbols and small scenes**: diya, kalash, conch, trishul + damru, bow and arrow, a deity bust, a temple, a name.

### Which motifs have usable open 3D models
Found by searching Zenodo's mirrors of Sketchfab and museum releases (GLB, direct download, no login), checked record by record. CC0 = free, no credit needed; CC BY 4.0 = free, credit on `/credits`.

| Motif | Best model found | Licence | Verdict |
|---|---|---|---|
| **Krishna** | *1973.106 Krishna Lifting Mount Govardhan*, Cleveland Museum of Art (Zenodo 10310709) | CC0 | **Add** — a classic scene, true 3D |
| **Vishnu on Garuda** | Minneapolis Institute of Art, 12–13th C bronze (10313308) | CC0 | **Add** |
| **Hanuman** | *Hanuman Conversing*, Scan the World (21172993) | CC0 | **Add** (check pose reads; 838 KB) |
| **Garuda** | Cambodian bronze terminal, MIA (10289935) | CC0 | maybe |
| **Stupa** | *Miniature Votive Stupa*, CMA (10229791) | CC0 | maybe (Buddhist events) |
| **Eagle**, **rearing horse**, **lion** | Golden eagle (21370003), Hunt Museum horse (21355020), stone lion (10319589) | CC0 | abstract/civic options |
| **Nandi** | *Nandi Bull*, Chola c. 13th C, Dallas Museum of Art scan (10228512) | CC BY 4.0 | **Add** (pairs with Nataraja) |
| **Conch (shankh)** | *Hindu God Conch Shell* (10362732) | CC BY 4.0 | **Add** — small, reads at 100 |
| **Lakshmi** | statue (10285416) | CC BY 4.0 | check quality |
| **Durga** | student model, Balinese-styled (10236060) | CC BY 4.0 | weak — iconography off for Durga Puja |
| **Krishna–Radha** | (10290127) | CC BY 4.0 | check quality |
| **Taj Mahal** | (10334151, low-poly 10294785) | CC BY 4.0 | **Add** for weddings/tourism |
| **Hampi, Hazara Rama temple wall** | (10329748) | CC BY 4.0 | relief; weak as drones |
| Peacock | only a Tiffany-style *Peacock Table Lamp*, CMA (10244114, CC0) | CC0 | not a peacock figure — **no good model** |
| Tiger, elephant | "Tiger 1" is a tank; elephant is a Zimbabwean serpentine sculpture | CC BY | **no good model** |
| Ram (with bow), Sita, Lakshman, Ram Mandir, Pushpak Viman, Amrit Kalash, trishul, Om, lotus, kalash, kite, Chandrayaan | none open | — | **none found** |
| Anime characters | fan models exist, but the characters are the studios' copyright/trademark | — | **never from open models** — see below |

**Other open sources to try next** (need a browser/login or format conversion):
- **Sketchfab CC0 filter** — Cleveland Museum of Art's *Ganesha 1970.62* and *1971.167 Model of a Sikhara* (temple tower) are CC0 there but not on Zenodo. Needs your Sketchfab login to download.
- **Smithsonian 3D** (3d.si.edu, CC0, GLB) — mostly science/history; few Indian objects. [FAQ](https://dashboard.si.edu/openaccess/faq)
- **NASA 3D Resources** (free, GLB; credit NASA, no insignia) — rockets, satellites, Moon/ISS for a space theme. [nasa.gov/3d-resources](https://www.nasa.gov/3d-resources/)
- **Quaternius / Kenney / Poly Pizza** (CC0 game assets; FBX → convert) — generic animals, no tiger/elephant/peacock found. [Quaternius](https://quaternius.itch.io/lowpoly-animated-animals)
- **Scan the World** — per-object licences; several Ganesha scans there are **CC BY-NC-SA → not usable**.

**Make it ourselves.** Simple symbols with no open model — **trishul, kalash, Om, lotus, diya, kite, Amrit Kalash** — are an hour each in Blender (free). A model we make is a real 3D model, owned outright; it is the right route for these. Figures like Ram or Ram Mandir need a sculptor/3D artist (or a commissioned scan) — budget it per show.

### Anime and brands
Anime drone shows are real and popular (Yokohama STARDANCE 2023: Demon Slayer, Evangelion, Ultraman — [Siliconera](https://www.siliconera.com/stardance-parade-drones-make-demon-slayer-and-evangelion-characters/); Pokémon; Netflix's One Piece 2023; Crunchyroll Mumbai 2026). All of them are **licensed by the rights holder** (e.g. Toei for a 2026 DoReMi show). A CC-licensed fan model on Sketchfab does **not** license the character. Rule: **no anime or brand characters in the public library**; only for a client who holds the licence, built for that show. Same for logos and trophies (IPL trophy, Mahakumbh logo).

### Abstract
Industry guidance favours animation and story over still images, and 3D shapes need 300+ drones to read ([Sky Elements](https://skyelementsdrones.com/custom-drone-shows)). Our 9 geometric shapes cover the abstract set (globe, helix, atom, knot, cube, spiral, diamond, pyramid, starburst); next abstract wins would be **transitions** between them and music-reactive light, not more static shapes.

### Recommended next formations (in order)
1. Krishna lifting Govardhan (CC0) · 2. Conch (CC BY, reads at 100) · 3. Nandi (CC BY) · 4. Vishnu on Garuda (CC0) · 5. Hanuman (CC0) · 6. Taj Mahal (CC BY) · 7. Blender-made trishul, kalash, Om, lotus · 8. Cleveland Ganesha 1970.62 and Sikhara from Sketchfab (your login).

---

## 5. Change log

### 12 Nov 2026 — round 10
- **Scrolling fixed:** the wheel over the full-screen sky scrolls the page; Ctrl/⌘ + wheel (or pinch) and new +/− buttons zoom.
- **Figures hold still** (every scanned model and the 3D shapes); only light effects animate.
- **Colour:** real-colour palettes re-sampled at 8 colours (was 5) for smoother shading; Neutral tone mapping and a softer drone core on Design a Show (AgX had turned orange to salmon and bright colours to white); brighter floor so dim drones don't sink into the sky; warmer Charminar, India Gate, Big Ben, bronzes.
- **Performance:** model data split out of the bundle — the page no longer downloads 1.3 MB (≈890 KB gzipped) of points up front; each model loads on first view (~20 KB) with the next prefetched. Still figures pose once instead of every frame (no per-frame GPU upload); `pose` is allocation-free; fleet/theme counts memoised.

### 12 Nov 2026 — round 9
- **Design a Show:** the 3D sky is now the full-width hero straight under the header; Theme / Fleet / Play, the formation list and LED hues sit below it; the heading, intro and quote CTA after.
- **Camera moves only when the visitor moves it:** idle auto-rotate removed; tilt range widened (12°–104°), orbit 360° round.
- **Per-drone colour** for every scanned formation (§3): real texture colours (`scripts/scan-colors.mjs`, 38 models) and hand-designed ramps / palettes / regions; shading contrast raised. Preview tool `scripts/preview-formations.ts`.
- **Ram** and **Ram Mandir** added, modelled by Airimation in Blender (`scripts/blender/make-ram.py`; GLBs in workspace `Scans/made/`). 57 formations at 2,000 drones.
- **Lighter backdrop overlay** on inner pages (80% → 55%).
- **Phones:** the live drone animation and a "best seen on a bigger screen" note with the email button, on every route (§2).
- **One company email, hello@airimation.in**: JSON-LD's Gmail address removed; JSON-LD moved to `src/lib/jsonld.ts` and tested. The team's own addresses stay on /team (briefly removed, restored the same day at Harshit's request).
- Docs: README, CLAUDE.md, SHOW_CONFIGURATOR.md brought up to date; workspace `Airimation_Context_Brief.md` rewritten from this file (no more Biscope / New Delhi / Sandeep).

### 12 Nov 2026 — round 8
- **29 formations from Sketchfab** (§3) — Indian and world landmarks, animals, vehicles, instruments; Cleveland Ganesha and Sikhara; a proper clay diya.
- **Theme filter** on Design a Show.
- Converter: `--rotate-z`, `--max-extent`, `--only` exact names with `Name*` prefixes.

### 12 Nov 2026 — round 7
- **Nine new formations** from §4b: Shankh, Nandi, Taj Mahal (CC BY); Hanuman, Vishnu on Garuda (CC0); Trishul, Kalash, Om, Kamal **modelled by Airimation** in Blender (`scripts/blender/make-symbols.py`, GLBs in `Scans/made/`). 27 formations in all.
- Dropped *Krishna Lifting Govardhan* (CMA): the scan is a broken fragment (legs missing, mountain a slab) and does not read as drones.
- Converter: `--box` and `--only` (keep named nodes) options.

### 12 Nov 2026 — round 6
- **Dhanush-baan fires** (draw, loose, flight, dark return); bow faces the audience instead of swaying.
- Model credits moved off Design a Show to **`/credits`**, linked from the footer.
- **`/shows` hero** now matches the other pages (no own 2D animation or solid background; the site backdrop shows). `CinematicSwarmHero` removed.

### 12 Nov 2026 — round 5 (branch `feat/showcase-models`)
- **Home:** the live 3D scene starts right after load, not on the first scroll (the still poster used to "come alive" with a shimmer). Scroll only drives the drones.
- **Steady backdrop on every page:** the dusk sky, river and skyline the home page settles on (under the team section), darkened the same way. A still image (`public/posters/backdrop*.jpg`, rendered from the live scene), not WebGL. Not on `/internal`.
- **Design a Show:** only formations from real 3D models (§3); Kamal, Om and Mahadev removed; Ganesha, Diya, Dil, Damru, Dhanush-baan and Dragon rebuilt from models; group headings removed; model credit under the preview; **LED hues** picker back; fleet change redraws in place; bigger fleet = bigger picture; preview 1.8× faster; Tiranga chakra now shows 24 spokes (it read as rings) and needs 200 drones.
- **UI pass:** every inner page and the footer now share the header's 1100 px column (left edges used to jump between 4xl/5xl/6xl sections); over-long paragraphs capped; `/shows` hero aligned; logo tap target 44 px.
- **Tests:** unit suite grown to 129 tests (library rules, licences, 24 spokes, no stray drones, LED hues, fleet scaling, content); new `npm run test:e2e` (47 checks in Chrome against a running site). See §6.

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

## 6. Tests — run before every push

| Command | What it covers | Last run |
|---|---|---|
| `npm run lint` | ESLint + retired words ("Airmation", "Biscope", "government") | ✅ 12 Nov 2026 (round 10) |
| `npm test` | 459 unit tests: share links; every formation exact-count, deterministic, in the show box, under 8 m/s; library rules (model-based only, removed formations stay out, credits, CC0/CC BY only, files intact); no drone outside its model; diya flame on the spout; Tiranga 24 spokes at 200–2,000; band colours; preview maths (bigger fleet = bigger figure, base above skyline, LED hues keep brightness); content (directors, visible advisors, removed members, copy names only existing formations and says "sped up") ; per-drone colour (palette indices valid, no figure one flat colour); hello@ the company email in content and JSON-LD, team addresses only on team members; phone-gate story; manifest in sync with the model files | ✅ 459/459, 12 Nov 2026 (round 10) |
| `npm run build` | type check + production build | ✅ 12 Nov 2026 (round 10) |
| `npm run test:e2e -- <url>` | in Chrome, against a running site: every page 200 with no errors; no sideways scroll at 390 and 1456 px; h1 aligned with the header; backdrop on inner pages; masked numbers + harshitcreates.in credit; `/biscope` and `/gallery` redirects; home 3D starts before any scroll; concept-render label; Design a Show flat list, no credit line, LED hues, fleet change; /credits page + footer link; phone gate at 390 px on every page (content hidden but in the HTML, no scroll, 44 px button; laptops never load it); hello@ the only company email (team addresses only on /team); Design a Show hero full width, then controls, then heading; wheel over the sky scrolls the page, Ctrl+wheel zooms | ✅ 69/69, 12 Nov 2026 (round 10) |

When a rule in this file changes, change its test in the same commit. The round-3 manual checklist (9 Nov) is now covered by these suites.

---

## 7. Open items
- [ ] Push `feat/showcase-models`, check the Vercel preview on a real phone (the gate) and a MacBook, then merge to `main`.
- [ ] Verify the CIN state code ("UW" vs "UP").
- [ ] Iconography review of Ganesha, Om, and the new **Ram** figure and **Ram Mandir** model before promoting them (Mahadev was removed).
- [ ] Test-import one `*.skybrush.zip` in Skybrush Studio for Blender.
- [x] CC0 scans → 3D formations (Nataraja ×2, Somaskanda shipped, 10 Nov).
- [x] A Ganesha 3D scan: Cleveland 1970.62 from Sketchfab (CC0) shipped as Standing Ganesha (12 Nov).
- [ ] Widen spacing to ≥2 m in Skybrush for the drawn figures before any real flight (speeds are already real).
- [x] `Airimation_Context_Brief.md` updated from this file (12 Nov, round 9).
- [ ] Choose a new flagship show name (or decide not to have one).
- [x] One public email: hello@airimation.in everywhere (12 Nov, round 9).
- [ ] **Make sure hello@airimation.in actually receives mail before launch** — on phones it is now the only way to reach us.
- [ ] `/internal` academy progress bar still uses `backdrop-blur` over its 2D hero canvas (internal page only; low priority).
- [ ] Iconography review of the scanned Ganesha (it is a Javanese depiction) and the Natarajas before promoting them.
- [x] Ram figure and Ram Mandir: modelled by Airimation in Blender (12 Nov, round 9). A professional 3D artist could still improve the face, dhoti folds and the Mandir's carving; the Mandir reads from 800 drones.
- [ ] With 57 formations, consider a search box (phones now see the gate, so it's a desktop-only question).
- [x] Clay diya: Sketchfab "Diya in Blender" (CC BY) replaced the Roman lamp (12 Nov).
- [ ] Re-run `scripts/render-poster.mjs` after any change to the scene's look (posters and backdrop are stills of it).
- [ ] Phones: watch analytics and Search Console after launch — a phone visitor sees only the gate, which may weigh on mobile ranking; revisit if most traffic is mobile.
- [ ] Store the converter options with each formation (`scan-to-formation.mjs` doesn't record them; `scan-colors.mjs` had to re-find the alignment).

