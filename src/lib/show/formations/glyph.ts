// Glyph sampling — turns text into a formation.
//
// SINGLE-STROKE, not filled.
//
// The first version filled the text and sampled its edges. That draws BOTH
// sides of every stroke, so each letter came out as a hollow double outline
// — an "A" became two nested A's a few metres apart. At 200 drones there
// were barely enough points to complete one outline, let alone two, so even
// three letters were unreadable.
//
// Now the text is STROKED with a thin pen and every lit pixel is sampled.
// One line of drones per pen stroke: the way a person would write a name in
// the sky with a sparkler, and the way real drone shows render lettering.
//
// BROWSER-ONLY: this is the one module under src/lib/show/ that touches a
// DOM API. Generation always runs client-side; the guard keeps it from
// exploding during SSR.

import type { Vec3 } from "../types";
import { SHOW_CENTRE_ALTITUDE } from "../constants";
import { orderProgressively } from "./sampling";

const RASTER_WIDTH = 900;
const RASTER_HEIGHT = 300;
const ALPHA_THRESHOLD = 110;

/**
 * Sampling grid, in raster pixels, coarsest first.
 *
 * The grid is chosen at run time so that the text yields at least as many
 * points as there are drones. If it yields fewer, generate.ts has to invent
 * the difference, and drones end up stacked on top of each other — which is
 * what turned a legible name into bright clumps at 500 drones.
 */
const STEPS = [4, 3, 2, 1];
const PEN_WIDTH = 3.2;

export type GlyphExtent = {
  /** Target width as a multiple of `scale`. */
  widthFactor: number;
  /** Target height as a multiple of `scale`. */
  heightFactor: number;
  /**
   * How many points the caller needs. The sampling grid is refined until
   * the stroke yields comfortably more than this.
   */
  minPoints?: number;
};

export function isGlyphSamplingAvailable(): boolean {
  return typeof document !== "undefined" && typeof document.createElement === "function";
}

export function glyphPoints(
  text: string,
  scale: number,
  fontStack: string,
  extent: GlyphExtent = { widthFactor: 2.4, heightFactor: 1.1 }
): Vec3[] {
  if (!isGlyphSamplingAvailable()) return [];

  const canvas = document.createElement("canvas");
  canvas.width = RASTER_WIDTH;
  canvas.height = RASTER_HEIGHT;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];

  ctx.clearRect(0, 0, RASTER_WIDTH, RASTER_HEIGHT);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Size the font to FILL the raster rather than merely fit inside it.
  const REFERENCE = 200;
  // A lighter weight gives a cleaner single stroke; a bold face strokes as
  // two nearly-parallel lines around a thick stem.
  const face = (size: number) => `400 ${size}px ${fontStack}`;
  ctx.font = face(REFERENCE);
  const metrics = ctx.measureText(text);
  const refWidth = Math.max(metrics.width, 1);
  const refHeight = Math.max(
    (metrics.actualBoundingBoxAscent ?? REFERENCE * 0.7) +
      (metrics.actualBoundingBoxDescent ?? REFERENCE * 0.2),
    1
  );
  const fontSize = Math.max(
    24,
    Math.floor(
      REFERENCE *
        Math.min((RASTER_WIDTH * 0.94) / refWidth, (RASTER_HEIGHT * 0.78) / refHeight)
    )
  );

  ctx.font = face(fontSize);
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = PEN_WIDTH;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.strokeText(text, RASTER_WIDTH / 2, RASTER_HEIGHT / 2);

  const { data } = ctx.getImageData(0, 0, RASTER_WIDTH, RASTER_HEIGHT);

  // Every lit pixel is on the stroke centreline, so there is no edge /
  // interior distinction to make — one tier, evenly ordered.
  const needed = Math.ceil((extent.minPoints ?? 0) * 1.15);
  let raster: { x: number; y: number }[] = [];
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const step of STEPS) {
    raster = [];
    minX = Infinity;
    maxX = -Infinity;
    minY = Infinity;
    maxY = -Infinity;
    for (let y = 0; y < RASTER_HEIGHT; y += step) {
      for (let x = 0; x < RASTER_WIDTH; x += step) {
        if (data[(y * RASTER_WIDTH + x) * 4 + 3] < ALPHA_THRESHOLD) continue;
        raster.push({ x, y });
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
    if (raster.length >= needed) break;
  }

  if (raster.length === 0) return [];

  // Map the text's own bounding box into the show volume, preserving aspect.
  const boxWidth = Math.max(maxX - minX, 1);
  const boxHeight = Math.max(maxY - minY, 1);
  const unit = Math.min(
    (scale * extent.widthFactor) / boxWidth,
    (scale * extent.heightFactor) / boxHeight
  );
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  return orderProgressively(
    raster.map(({ x, y }) => ({
      x: (x - cx) * unit,
      // Raster y grows downward; the sky does not.
      y: SHOW_CENTRE_ALTITUDE - (y - cy) * unit,
      z: 0,
    }))
  );
}
