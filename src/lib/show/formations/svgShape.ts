// Sampling formations from SVG silhouettes.
//
// This is the pipeline that lets the library grow beyond what can be written
// as an equation. A silhouette is rasterised with Path2D, the lit pixels are
// sampled, and the result is tiered exactly like every other formation:
// outline pixels first (the shape that makes it recognisable at 50 drones),
// interior fill second.
//
// BROWSER-ONLY, like glyph.ts — it needs a 2D canvas. Generation always runs
// client-side; the guard keeps it from exploding if anything calls it during
// SSR, and callers fall back to a procedural shape.

import type { Vec3 } from "../types";
import { SHOW_CENTRE_ALTITUDE } from "../constants";
import { prioritise } from "./sampling";

const RASTER = 460;

export type SvgShape = {
  /** The `d` attribute of the path. */
  path: string;
  /** Square viewBox extent the path was authored in. */
  viewBox: number;
  /**
   * Counters (the holes in an Om, say) need "evenodd"; stacked or
   * overlapping sub-shapes (a tiered temple) need "nonzero", or the overlaps
   * punch themselves out.
   */
  fillRule?: CanvasFillRule;
  /**
   * Indices of sub-paths that are HOLES rather than solid shapes.
   *
   * A single fill rule cannot express "these three sub-shapes union, and
   * those two are counters" — evenodd turns every overlap into a hole,
   * nonzero fills every counter solid. When `holes` is set, each sub-path is
   * drawn separately: solids are unioned, then holes are erased with
   * destination-out. That is the only way to get a glyph like the Om, whose
   * loops must stay open while its arm and crest merge into the body.
   *
   * Indices count sub-paths in order, splitting on "M".
   */
  holes?: number[];
};

/** Split a path's `d` into its sub-paths, one per "M" command. */
function splitSubPaths(d: string): string[] {
  const parts = d.match(/[Mm][^Mm]*/g);
  return parts ? parts.map((p) => p.trim()).filter(Boolean) : [d];
}

export type SvgExtent = {
  /** Target width as a multiple of `scale`. */
  widthFactor: number;
  /** Target height as a multiple of `scale`. */
  heightFactor: number;
  /**
   * Gentle forward bow, in metres, so the formation is not perfectly planar.
   * Real shows give flat iconography a slight curve; it catches the light
   * differently across the shape and stops it reading as a decal.
   */
  bow?: number;
};

export function canSampleSvg(): boolean {
  return (
    typeof document !== "undefined" &&
    typeof Path2D !== "undefined" &&
    typeof document.createElement === "function"
  );
}

export function svgPoints(
  shape: SvgShape,
  scale: number,
  extent: SvgExtent = { widthFactor: 1.9, heightFactor: 1.9, bow: 6 }
): Vec3[] {
  if (!canSampleSvg()) return [];

  const canvas = document.createElement("canvas");
  canvas.width = RASTER;
  canvas.height = RASTER;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];

  ctx.clearRect(0, 0, RASTER, RASTER);
  ctx.fillStyle = "#fff";
  const unit = RASTER / shape.viewBox;
  ctx.setTransform(unit, 0, 0, unit, 0, 0);
  if (shape.holes && shape.holes.length > 0) {
    const subPaths = splitSubPaths(shape.path);
    const holes = new Set(shape.holes);
    subPaths.forEach((d, index) => {
      if (holes.has(index)) return;
      ctx.globalCompositeOperation = "source-over";
      ctx.fill(new Path2D(d), "nonzero");
    });
    subPaths.forEach((d, index) => {
      if (!holes.has(index)) return;
      ctx.globalCompositeOperation = "destination-out";
      ctx.fill(new Path2D(d), "nonzero");
    });
    ctx.globalCompositeOperation = "source-over";
  } else {
    ctx.fill(new Path2D(shape.path), shape.fillRule ?? "nonzero");
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  const { data } = ctx.getImageData(0, 0, RASTER, RASTER);
  const lit = (x: number, y: number): boolean => {
    if (x < 0 || y < 0 || x >= RASTER || y >= RASTER) return false;
    return data[(y * RASTER + x) * 4 + 3] >= 128;
  };

  type Sample = { x: number; y: number; edge: boolean };
  const samples: Sample[] = [];
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  // A coarse grid rather than every pixel: 600 canonical points do not need
  // 200k candidates, and the grid spaces them evenly for free.
  const step = 3;
  for (let y = 0; y < RASTER; y += step) {
    for (let x = 0; x < RASTER; x += step) {
      if (!lit(x, y)) continue;
      const edge =
        !lit(x - step, y) || !lit(x + step, y) || !lit(x, y - step) || !lit(x, y + step);
      samples.push({ x, y, edge });
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  if (samples.length === 0) return [];

  // Map the shape's OWN bounding box into the show volume, preserving aspect.
  const boxWidth = Math.max(maxX - minX, 1);
  const boxHeight = Math.max(maxY - minY, 1);
  const metresPerPixel = Math.min(
    (scale * extent.widthFactor) / boxWidth,
    (scale * extent.heightFactor) / boxHeight
  );
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const halfSpan = (Math.max(boxWidth, boxHeight) / 2) * metresPerPixel;
  const bow = extent.bow ?? 0;

  const edgePoints: Vec3[] = [];
  const interiorPoints: Vec3[] = [];

  for (const sample of samples) {
    const px = (sample.x - cx) * metresPerPixel;
    // Raster y grows downward; the sky does not.
    const py = (cy - sample.y) * metresPerPixel;
    const radial = Math.min(1, Math.hypot(px, py) / Math.max(halfSpan, 1));
    const point: Vec3 = {
      x: px,
      y: SHOW_CENTRE_ALTITUDE + py,
      z: -bow * (1 - radial * radial),
    };
    (sample.edge ? edgePoints : interiorPoints).push(point);
  }

  return prioritise(edgePoints, interiorPoints);
}
