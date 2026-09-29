# Show Configurator — build notes

Read this before touching `src/lib/show/` or `src/components/show/`.

## What it is

A public tool (route `/design-your-show`, not yet built) letting a visitor pick a
drone count and a sequence of formations and watch the show in 3D. It answers the
two questions a first-time buyer cannot answer alone: *how many drones do I need*
and *what do the formations look like*.

**Not positioned as an innovation.** SkyStage (US) already does this pattern. The
decision on 2026-09-29 was to build it as a value-add for site visitors and never
claim novelty for it.

## Scope, locked 2026-09-29

- No show-file export in any version. Not `.skyc`, not CSV, not ever.
- Curated formation library only — no user image or logo upload.
- Night sky **with a horizon silhouette**, not pure black. See the scale note below.
- Live drone-count comparison is a core feature, not a nicety.
- Counts are 50 / 100 / 200. Year-1 fleet is 100, so 200 is labelled
  "arranged in advance" rather than offered as routine.
- Text / initials formation is in.
- What a visitor builds is a **visual concept, not a flight-ready show**. Nothing in
  the UI may imply otherwise.

## Architecture: a recipe, never a trajectory

The only durable artefact is a ~100-byte `Recipe` (`{v, d, s, t}`), base64url-encoded
into a `?s=` query parameter — so sharing needs no database, no id resolution and
nothing that can 404. Trajectories are regenerated in the browser by `generateShow()`,
**measured at 6–9ms** for 50–200 drones. That measurement is why caching computed
shows was rejected: it would cost storage and make shared links slower to open, to
save single-digit milliseconds.

Determinism comes from `LIBRARY_VERSION` pinned in the recipe, plus seeded PRNGs
everywhere. **Never call `Math.random()` in a formation generator.**

Bump `LIBRARY_VERSION` only when an *existing* formation's geometry changes, and
retain the old generator set in `VERSIONS` so links already shared keep rendering
what their recipient saw.

## Why raw three.js rather than react-three-fiber

The scene is two `Points` objects, a horizon group and a camera. R3F solves
declarative composition of complex scene graphs — a problem this does not have — and
the rest of this codebase already animates imperatively with `requestAnimationFrame`.
Per-frame positions write into a `Float32Array`; nothing updating at 60fps enters
React state.

## Rendering lessons, each found by looking at a render

**Every element essential to recognition must share tier 1.** The diya was written as
`prioritise(bowl, rim, flame)` with 220 bowl points, so at 200 drones the renderer
never reached the flame and the formation was an anonymous arc. Tier boundaries are
hard cut-offs at low counts; progressive ordering distributes *within* a tier. Now
`prioritise([...bowl, ...flame], rim)`.

**Progressive ordering is what makes `take(n)` work.** Generators emit 600 canonical
points ordered by a van der Corput sequence so any prefix samples the whole shape.
Without it the first 50 of 600 would be a contiguous arc rather than a circle.

**An OrbitControls polar angle above 90° means the camera is below the target.** An
initial `maxPolarAngle: 88` silently clamped the camera above the formation and
wrecked the framing — the audience stands on the ground and looks up, so the cap must
exceed 90 (now 104). OrbitControls has no ground constraint of its own, so camera `y`
is clamped manually each frame.

**A black silhouette needs a non-black sky.** The treeline was invisible against pure
black. A sky dome now lifts to `#1d2433` at the horizon, which is also how real night
skies look under ground light. The horizon exists purely as a scale reference —
without it, 50 drones and 200 drones look identical and the tool defeats its own
purpose.

**Glyph formations must map their own bounding box, not the raster.** A single Om
character filled a third of the raster and rendered tiny. The font is now sized to
fill, and points map from the glyph's measured bounding box with aspect preserved.

**Coordinates are METRES.** This deliberately breaks from `swarmShapes.ts` and
`homeFormations.ts`, which work in normalised 0–1 space and need an `aspect`
correction. Working in metres removes that entire bug class — the old "ring looks
like an eclipse" problem and the `project()` fudge helper — and makes scale truthful,
which is the point of the tool.

## How to actually see the renderer

Typechecking and linting caught none of the four bugs above. To look at it:
stage `src/lib/show` and `src/components/show/renderer` into a container, bundle with
esbuild (alias `@` → `src`), serve statically, and screenshot with Playwright and
Chromium using `--use-gl=swiftshader`. Contact-sheet the results.

## Build gotchas, beyond the ones in CLAUDE.md

- `next build` still fails in the host-synced folder with
  `EPERM ... rmdir .next/export/...`, **after** compiling and generating every page
  successfully. Build in `$HOME/build/airmation-website` instead.
- **Symlinking `node_modules` into that build path does not work** — Turbopack panics
  with "Symlink [project]/node_modules is invalid, it points out of the filesystem
  root". Run a real `npm install` there.
- `npm run lint` also runs `check:brand`, which fails on any "Airmation" spelled
  without the second `i`.
- React hooks rules are enforced strictly here. Do not mutate a ref during render,
  and do not `setState` inside an effect — use a lazy `useState(() => ...)`
  initialiser. Both were hit while building `ShowStage.tsx`.

## Round 2 — 3D forms, colour, and the public route

**Formations are now volumetric.** The first set were parametric curves in the
x/y plane: fine head-on, a flat line once the camera orbited. `shapes3d.ts` now
provides surfaces of revolution, petals as curved sheets, implicit-surface shell
sampling and rotation helpers. Ring is a torus, spiral a rising helix, starburst
radiates in every direction, heart is a Taubin solid sampled as a shell, diya is
a lathe-turned bowl with a teardrop flame.

**Generators receive `droneCount` and must simplify themselves.** This is the
most important lesson of the round. A lotus built from 24 petals gives each
petal eight drones at a 200-drone show, and eight points read as noise — the
result looked like a scatter, not a bloom. Organic forms need roughly **20+
drones per element** before an outline reads. The lotus now picks 4–6 petals
depending on fleet size and spends the budget on closed petal outlines. Prefer
fewer, larger, bolder elements over more, finer ones.

**Honest limit worth repeating to anyone who asks for more realism:** at
50–200 drones, figurative organic forms will read as *stylised*, not
photographic. Real drone-show lotuses use 500–1500 drones. This is a property of
the fleet, not of the code.

**Forms that open upward must be tilted toward the audience.** The crowd stands
on the ground and looks up, so a flower whose face points at the sky presents
only its underside — spiky and unreadable. The lotus is tilted ~83°, the diya
~29°. Physically the untilted version is more accurate; visually it is useless.

**Colour is back, under discipline.** `renderer/palette.ts` holds per-formation
LED patterns evaluated every frame, so they animate: a flame flickers, a heart
pulses, hue sweeps travel outward. Drones carry a per-point `aColor` attribute.
This reverses the earlier white-only rule from the 2D work — that rule was
really diagnosing a ~7x point-size spread plus four-colour confetti, not colour
itself. Keep point sizes tight and one coherent palette per formation and it
holds up. Key a colour ramp to the axis the form actually runs along: the lotus
ramp had to move from height to radius once the bloom was tilted to face front.

**Public route.** `/design-your-show` is the real deliverable; `/internal/show-lab`
remains a developer harness. The route is a server component for metadata and
SEO copy, with `ShowConfiguratorLoader.tsx` as a thin client wrapper holding the
`next/dynamic` call — **`ssr: false` is only legal inside a Client Component in
the App Router**, and putting it in the page itself fails the build. A CTA sits
on the home page at section 04 (team and contact renumbered to 05 and 06), and
"Design a Show" is first in `navLinks`.

**The comparison control is deliberately instant.** Changing fleet size does not
wait for a re-render of the show — it applies to the running plan immediately, so
a visitor can watch the same formation fill in from 50 to 200. Requiring a
Render press for that would destroy the feature the whole page exists for.

**React Compiler is enabled.** Manual `useCallback` / `useMemo` whose inferred
dependencies differ from the written ones fails lint with "Existing memoization
could not be preserved". Prefer plain functions and let the compiler handle it.

## Round 3 — horizon, orbit, and nav discoverability

**Scene geometry has to respect the camera's orbit range.** The treeline sat at
195–255m while the camera's default position is 200m out — so the viewer stood
*inside* the trees and a canopy metres from the lens filled half the frame with
a black polygon. The ring now starts at 440m, beyond `CAMERA.maxDistance` (380).
Any new scenery must clear that radius.

**Silhouettes need a lit background, not brighter silhouettes.** Real trees and
people at night ARE black. What was missing was something for them to be black
*against*: the sky now lifts to `#2b3550` at the horizon and the ground brightens
with distance, mostly within the first few hundred metres where the crowd
stands. Scene fog was also quietly dissolving the distant reference and has been
removed entirely — depth cueing comes from point-size attenuation instead.

**The sky dome must fit inside the camera's far plane.** A 2400m dome against a
2000m far plane got clipped, and the hole read as a black rounded rectangle
hanging over the scene. Far plane is now 6000.

**Below the horizon the sky must go dark.** The ground disc cannot cover every
sight line at every orbit distance; leaving the dome at full horizon brightness
produced a glowing band past the ground's edge that looked like a wall of light.

**Do not clamp the camera after `controls.update()`.** The orbit felt locked and
sticky near the bottom of its range because a manual `camera.position.y` clamp
was fighting OrbitControls' own state every frame. The constraint is now
expressed as a limit the controls respect, recomputed per frame because it
depends on zoom distance:

    maxPolarAngle = acos((minEyeHeight - targetY) / radius)

`minPolarAngle` also relaxed from 22° to 6° so the view can rise nearly overhead.

**The nav was undiscoverable on desktop.** The edge tab was `md:hidden`, leaving
desktop visitors with only an invisible hover hotzone. It is now shown on every
device with a vertical "Menu" label, and pulses gently (`.nav-nudge` in
globals.css) until the visitor opens the menu once — tracked in `localStorage`
under `airimation-nav-seen`, read via a lazy `useState` initialiser.

## Round 4 — SVG silhouette pipeline

`svgShape.ts` samples an SVG path into a formation: rasterise with Path2D,
sample lit pixels on a coarse grid, tier them edge-first, and map the shape's
own bounding box into the show volume with a slight forward bow so it is not
perfectly planar. Silhouette sources live in `svgLibrary.ts`, formations in
`iconic.ts`. This is how the library grows beyond what can be written as an
equation.

**A single fill rule cannot express a real glyph.** `evenodd` turns every
overlap into a hole; `nonzero` fills every counter solid. The Om needs its two
loops open AND its arm, crest and dot merged into the body. `SvgShape.holes`
takes sub-path indices (splitting on "M") and composites: solids unioned with
source-over, holes erased with destination-out.

**What the first four supplied silhouettes taught us — this is asset guidance,
not code:**

- **Temple — excellent, registered.** Stepped tiers of straight lines are
  close to ideal: bold masses, clean edges, reads instantly at 100 drones.
- **Om — improved but unregistered.** After the hole fix it reads, but the
  supplied path is a hand-approximation while the font-sampled `om` is the
  real Unicode glyph. The font version stays.
- **Blooming Lotus — unregistered.** The three tiers are crescents that union
  into a bowl, and the top element samples as a thin swoosh. It renders as a
  lamp, not a flower.
- **Ganesha — unregistered.** A single continuous outline whose curves do not
  resolve into a recognisable profile at any drone count.

**The rule this establishes:** a silhouette works when it is made of a few
BOLD CLOSED MASSES, and fails when it is made of thin strokes or crescents.
Sampling only ever draws the boundary between filled and empty — so a shape
whose filled regions are not themselves the subject will never read, however
good the sampler.

## Round 5 — real artwork, and the preprocessing that makes it usable

**Formations can now ship as pre-sampled point data** (`formations/pointData/`),
converted offline from artwork rather than sampled in the browser. Offline is
better: the conversion can be inspected before it ships, instead of a bad
threshold silently producing noise on a visitor's device. `fromPointData()` in
`iconic.ts` maps normalised [-1,1] pairs into the show volume.

**Interior detail is what kills a silhouette, not outline complexity.** Real
stock artwork of a lotus came with fine white hatching inside every petal. Edge
detection treats each hatch line as an edge, so tier 1 filled with thousands of
scattered interior marks and the flower never appeared — 8,300 candidate points,
none of them the outline.

**The preprocessing chain that fixed it**, and the settings to reuse:
threshold at 110 → Gaussian blur (sigma 4) → binary closing (15px) → fill holes
→ keep the largest connected component → sample on a 3px grid → order
edge-first then interior, each in van der Corput order. The blur and closing are
what erase interior linework; hole-filling is what reduces the artwork to its
true silhouette.

**Complexity ceiling, measured rather than guessed.** The same chain produced a
clean, correct Ganesha mask — and it still does not read at 200 drones. Six
arms, a trident, a crown and jewellery all compete for the same handful of
points. A figure needs either a much larger fleet or a radically simpler
silhouette (head, trunk and ears only, no arms). The lotus works at 100 and is
good at 200 because its identity lives entirely in one outer contour.

**Language-model-authored SVG path data never worked.** Two attempts produced
syntactically valid Béziers that rendered as overlapping blobs — verified by
rasterising the paths as plain SVG, before any sampling. Text models draw
blind. Use real artwork and convert it; do not ask for path coordinates.

## Round 6 — wireframes win, and text as a single stroke

**Figurative silhouettes are out of the library entirely.** The temple and the
converted lotus both shipped briefly and both looked weak next to a wireframe.
The pattern across six rounds is now unambiguous: **at 50–500 points of light,
line structures read and filled forms do not.** The cube, ring, torus, helix,
starburst, globe, diamond, knot, atom and pyramid all work for the same reason.
The sampling pipeline is kept (svgShape.ts, iconic.ts) for artwork good enough
to beat that bar; nothing in it is registered.

**Six new 3D formations** in `playful.ts` — globe, diamond, torus knot, double
helix, atom, pyramid — all built from edges and curves, all genuinely
volumetric so orbiting reveals structure.

**Max fleet is now 500.** `DRONE_COUNTS` and the renderer's `MAX_DRONES` both
moved; buffers are still allocated once at the maximum and drawn with
`setDrawRange`, so switching counts stays allocation-free.

**Text is now a SINGLE STROKE, and this was the real bug.** The old sampler
filled the glyph and sampled its edges — which draws both sides of every
stroke, so each letter rendered as two nested copies of itself. At 200 drones
there were barely enough points for one outline, let alone two, so even three
letters were unreadable. It now uses `strokeText` with a thin pen (3.2px
against a 4px sampling grid) and samples every lit pixel: one line of drones
per pen stroke. A 400-weight face is used deliberately — a bold face strokes as
two near-parallel lines around a thick stem, reintroducing the doubling.
"Aarav & Diya" is fully legible at 500 drones, "AVI" at 200.

**A first-visit hint over the canvas** tells visitors the scene is interactive —
nothing about a canvas says "you can move this". It breathes gently, disappears
on the first drag, scroll or tap, and never returns (`localStorage`,
`airimation-show-hint-seen`, read via a lazy initialiser).

## Round 7 — the real text bug, and a festive palette

**Stroking the text was only half the fix. The other half was in generate.ts.**
When a generator returns fewer points than there are drones, the surplus has to
go somewhere, and the padding loop was assigning them coordinates that already
existed — `taken.push(taken[i % available])`. Identical positions stack drones
on top of each other, and additive blending turns every stack into a hotspot.
That is why a stroked name still read as bright clumps at 500 drones.

Two changes:
- **`glyph.ts` now picks its sampling grid at run time.** It takes the drone
  count as `minPoints` and refines the grid (4 → 3 → 2 → 1 px) until the stroke
  yields ~15% more candidates than drones, so padding is rarely needed at all.
- **Padding never stacks.** Surplus drones are nudged off their source point
  along the golden angle, in widening rings, so they read as a slightly thicker
  stroke instead of a blob.

**Never pad a formation by duplicating coordinates.** It is invisible in a
point count, invisible in a type check, and glaring on screen.

**Default colour is now a Diwali shimmer, not white.** `DIWALI` in palette.ts
gives each drone a stable hue from a warm-weighted festive set (saffron, amber
and gold roughly twice as frequent as rose, emerald and cyan — an even spread
around the wheel reads as a generic RGB rainbow rather than Diwali), drifting
slowly, with a sharp per-drone twinkle closer to a flame than a sine glow. The
ground and landing stages use warmer, calmer navigation lights so lift-off
reads as the show beginning. `WHITE` is retained but unused.

## State as of 2026-09-29

Built, lint-clean and building in production: `src/lib/show/` (types, constants,
recipe, generate, assign, and formations: sampling, geometric, cultural, personal,
glyph) and `src/components/show/` (ShowStage, renderer/SwarmRenderer, horizon,
shaders), plus the internal harness at `/internal/show-lab`.

Ten formations verified rendering correctly at all three drone counts: ring, spiral,
wave, cube, starburst, lotus, diya, om, heart, text.

**Built:** the public `/design-your-show` route with its configurator UI, the
instant fleet-size comparison, URL-encoded share links, the home-page CTA, and
the nav entry. Production build clean at 15 routes.

**Not yet built:** enquiry capture (`/api/show-enquiry` and the form), timeline
scrubbing, and formation reordering. The lotus reads as a stylised rosette
rather than a botanical lotus — see the honest limit above before attempting to
"fix" it with more petals.
