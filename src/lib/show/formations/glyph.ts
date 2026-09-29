// Glyph sampling — turns rendered text into a formation point set.
//
// Rather than digitising outlines by hand, we let the browser's text engine
// do the work: draw the string to an offscreen canvas, read the pixels, and
// sample the lit ones. This handles Devanagari and Latin identically,
// because font shaping is the browser's problem rather than ours.
//
// BROWSER-ONLY. This is the one module under src/lib/show/ that touches a
// DOM API. Generation always happens client-side, but the guard below keeps
// it from exploding if something ever calls it during SSR.

import type { Vec3 } from "../types";
import { SHOW_CENTRE_ALTITUDE } from "../constants";
import { prioritise } from "./sampling";

const RASTER_WIDTH = 320;
const RASTER_HEIGHT = 120;
const ALPHA_THRESHOLD = 128;

export function isGlyphSamplingAvailable(): boolean {
  return typeof document !== "undefined" && typeof document.createElement === "function";
}

/**
 * Rasterise `text` and sample it into a formation.
 *
 * Points are tiered: edge pixels first (the silhouette that makes the glyph
 * legible at low drone counts), interior pixels second. At 50 drones you get
 * an outline; at 200 the strokes fill in.
 */
export function glyphPoints(text: string, scale: number, fontStack: string): Vec3[] {
  if (!isGlyphSamplingAvailable()) return [];

  const canvas = document.createElement("canvas");
  canvas.width = RASTER_WIDTH;
  canvas.height = RASTER_HEIGHT;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];

  ctx.clearRect(0, 0, RASTER_WIDTH, RASTER_HEIGHT);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Size the font to FILL the raster, not merely to fit inside it.
  //
  // The first version only ever shrank from a 96px start, which was fine for
  // a long string but left a single character (the Om glyph) occupying a
  // third of the raster — so it sampled down to a tiny unreadable blob.
  // Measure once at a reference size and scale in both directions instead.
  const REFERENCE = 100;
  ctx.font = `700 ${REFERENCE}px ${fontStack}`;
  const metrics = ctx.measureText(text);
  const refWidth = Math.max(metrics.width, 1);
  const refHeight = Math.max(
    (metrics.actualBoundingBoxAscent ?? REFERENCE * 0.7) +
      (metrics.actualBoundingBoxDescent ?? REFERENCE * 0.2),
    1
  );

  const fontSize = Math.max(
    12,
    Math.floor(
      REFERENCE *
        Math.min((RASTER_WIDTH * 0.92) / refWidth, (RASTER_HEIGHT * 0.82) / refHeight)
    )
  );
  ctx.font = `700 ${fontSize}px ${fontStack}`;

  ctx.fillText(text, RASTER_WIDTH / 2, RASTER_HEIGHT / 2);

  const { data } = ctx.getImageData(0, 0, RASTER_WIDTH, RASTER_HEIGHT);
  const lit = (x: number, y: number): boolean => {
    if (x < 0 || y < 0 || x >= RASTER_WIDTH || y >= RASTER_HEIGHT) return false;
    return data[(y * RASTER_WIDTH + x) * 4 + 3] >= ALPHA_THRESHOLD;
  };

  // Collect in raster space first, then map the glyph's OWN bounding box to
  // the show volume. Mapping the whole raster instead would shrink anything
  // that does not fill it — which is what made a single Om character render
  // at a third of the intended size.
  type Sample = { x: number; y: number; edge: boolean };
  const samples: Sample[] = [];
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  const step = 2;
  for (let y = 0; y < RASTER_HEIGHT; y += step) {
    for (let x = 0; x < RASTER_WIDTH; x += step) {
      if (!lit(x, y)) continue;
      const isEdge =
        !lit(x - step, y) || !lit(x + step, y) || !lit(x, y - step) || !lit(x, y + step);
      samples.push({ x, y, edge: isEdge });
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  if (samples.length === 0) return [];

  const boxWidth = Math.max(maxX - minX, 1);
  const boxHeight = Math.max(maxY - minY, 1);
  // Preserve the glyph's aspect ratio: fit it inside the target box rather
  // than stretching it to fill, or wide strings would squash and single
  // characters would smear.
  const targetWidth = scale * 2.4;
  const targetHeight = scale * 1.1;
  const unit = Math.min(targetWidth / boxWidth, targetHeight / boxHeight);

  const edge: Vec3[] = [];
  const interior: Vec3[] = [];

  for (const sample of samples) {
    const point: Vec3 = {
      x: (sample.x - (minX + maxX) / 2) * unit,
      // Raster y grows downward; show space grows upward.
      y: SHOW_CENTRE_ALTITUDE - (sample.y - (minY + maxY) / 2) * unit,
      z: 0,
    };
    (sample.edge ? edge : interior).push(point);
  }

  if (edge.length === 0) return [];
  return prioritise(edge, interior);
}
