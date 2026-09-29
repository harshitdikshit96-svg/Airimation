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

## State as of 2026-09-29

Built, lint-clean and building in production: `src/lib/show/` (types, constants,
recipe, generate, assign, and formations: sampling, geometric, cultural, personal,
glyph) and `src/components/show/` (ShowStage, renderer/SwarmRenderer, horizon,
shaders), plus the internal harness at `/internal/show-lab`.

Ten formations verified rendering correctly at all three drone counts: ring, spiral,
wave, cube, starburst, lotus, diya, om, heart, text.

**Not yet built:** the public `/design-your-show` route, the configurator UI, share
links, enquiry capture. Long text strings render small — proportionate, but may want
a scale bump.
