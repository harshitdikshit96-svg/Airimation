// Per-drone LED colours for one formation, computed once per stage change.
//
// The animated colour patterns in patterns.ts were written for a per-frame
// CPU renderer. On the GPU path they are sampled once at a fixed instant,
// then normalised so every drone has full brightness — twinkle and
// lift-off lighting are the shader's job, and baking a random brightness in
// here would freeze one frame of flicker into the formation.

import { getPalette } from "@/lib/show/palettes";
import { patternFor } from "./patterns";

export function seeded(i: number, salt = 0): number {
  const v = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return v - Math.floor(v);
}

/**
 * Patterns and palettes are authored in sRGB; the shader works in linear
 * light (bloom and additive blending are only physically right there) and
 * three converts back to sRGB on output.
 */
export function toLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/**
 * Colours for `count` drones at `positions` (xyz flattened, metres).
 *
 * `paletteId` other than "auto" overrides the formation's own scheme with
 * a height gradient through the palette (saffron over white over green for
 * the tricolour), sprinkled with a few accent drones so it is not banded.
 * Ground and landing stages always keep the fleet's navigation colours.
 */
export function stageColors(
  stageId: string,
  positions: Float32Array,
  count: number,
  paletteId?: string,
  out: Float32Array = new Float32Array(count * 3)
): Float32Array {
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < count; i++) {
    const y = positions[i * 3 + 1];
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  const span = Math.max(maxY - minY, 1);

  const palette = getPalette(paletteId);
  const grounded = stageId === "__ground" || stageId === "__land";
  const pattern = patternFor(stageId);
  const ramp = palette.colors.map(hexToRgb);

  for (let i = 0; i < count; i++) {
    const o = i * 3;
    const x = positions[o];
    const y = positions[o + 1];
    const z = positions[o + 2];
    const h = (y - minY) / span;
    const r = seeded(i, 3);

    let rgb: [number, number, number];
    if (!grounded && ramp.length > 0) {
      if (r > 0.88) {
        rgb = ramp[Math.floor(seeded(i, 7) * ramp.length) % ramp.length];
      } else {
        // Top of the formation gets the first colour.
        const t = (1 - h) * (ramp.length - 1);
        const k = Math.min(ramp.length - 2, Math.floor(t));
        const f = ramp.length === 1 ? 0 : t - k;
        const a = ramp[Math.max(0, k)];
        const b = ramp[Math.min(ramp.length - 1, k + 1)];
        rgb = [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
      }
    } else {
      rgb = pattern({ i, n: count, x, y, z, t: 0, r, h });
    }

    const peak = Math.max(rgb[0], rgb[1], rgb[2], 0.001);
    out[o] = toLinear(rgb[0] / peak);
    out[o + 1] = toLinear(rgb[1] / peak);
    out[o + 2] = toLinear(rgb[2] / peak);
  }
  return out;
}

/** One colour for every drone (home page beats, unlit ground). */
export function solidColors(count: number, rgb: [number, number, number], out = new Float32Array(count * 3)) {
  for (let i = 0; i < count; i++) {
    out[i * 3] = toLinear(rgb[0]);
    out[i * 3 + 1] = toLinear(rgb[1]);
    out[i * 3 + 2] = toLinear(rgb[2]);
  }
  return out;
}
