// The formation sequence for the homepage's scroll-linked swarm canvas.
// Ported from the "Airimation Home v2" design export — each phase is a point
// cloud in normalized (0..1) space, and the canvas blends between adjacent
// phases based on overall page scroll progress.
//
// This is deliberately separate from `swarmShapes.ts` (used by the gallery
// page): those cycle a fixed set of formations on a timer, this one is
// driven by scroll position and needs a matched sequence of phase names to
// go with it.

export type Point = { x: number; y: number };

export const phaseNames = [
  "GROUND HOLD",
  "LIFT-OFF",
  "OPEN SKY",
  "FLIGHT WAVE",
  "LOTUS BLOOM",
  "HEART",
  "SNOWFLAKE",
  "SALUTE RINGS",
  "THE MONOGRAM",
];

// Small deterministic PRNG so the layout is stable across renders/reloads
// rather than reshuffling every mount.
function makeRand(seed: number) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

// Circular/symmetric formations (lotus, heart, snowflake, rings) are designed
// in an isotropic space where a "radius" of 1 means the same physical size
// in both directions — then projected to the page's actual normalized (0..1,
// 0..1) coordinates with `aspect` (viewport width / height) correcting the x
// axis. Without this, a shape that looks like a circle in x/y-fraction space
// renders as a squashed ellipse on any non-square (e.g. widescreen) viewport,
// which is exactly what made "SALUTE RINGS" read as an eclipse rather than a
// ring: the old code applied a flat 0.9 fudge factor to y instead of
// correcting for the real aspect ratio.
function project(rawX: number, rawY: number, cx: number, cy: number, aspect: number): Point {
  return { x: cx + rawX / aspect, y: cy + rawY };
}

export function buildFormations(n: number, aspect: number = 1.6): Point[][] {
  const rand = makeRand(42);

  const ground: Point[] = [];
  const cols = Math.ceil(Math.sqrt(n * 2.4));
  for (let i = 0; i < n; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    // No per-particle x jitter here — every drone in a column sits on
    // exactly the same x, so the resting grid reads as clean, stable lines
    // rather than a slightly wavy scatter.
    ground.push({
      x: 0.08 + (col / (cols - 1)) * 0.84,
      y: 0.93 - row * 0.016,
    });
  }

  const lift: Point[] = ground.map((p) => ({
    x: p.x + (rand() - 0.5) * 0.05,
    y: 0.66 + (rand() - 0.5) * 0.1,
  }));

  const scatter: Point[] = [];
  for (let i = 0; i < n; i++) {
    scatter.push({ x: 0.04 + rand() * 0.92, y: 0.05 + rand() * 0.75 });
  }

  const wave: Point[] = [];
  {
    const rows = 6;
    const perRow = Math.floor(n / rows);
    for (let r = 0; r < rows; r++) {
      for (let i = 0; i < perRow; i++) {
        const t = i / perRow;
        wave.push({
          x: 0.12 + t * 0.76,
          y: 0.62 - r * 0.07 + Math.sin(t * Math.PI) * 0.08,
        });
      }
    }
    while (wave.length < n) wave.push({ x: 0.5, y: 0.45 });
  }

  const lotus: Point[] = [];
  {
    const petals = 8;
    const rings = 3;
    const perRing = Math.floor(n / rings);
    for (let r = 0; r < rings; r++) {
      const ringScale = 0.16 + r * 0.095;
      for (let i = 0; i < perRing; i++) {
        const theta = (i / perRing) * Math.PI * 2;
        const petal = Math.abs(Math.cos(petals * theta * 0.5));
        const radius = ringScale * (0.35 + 0.65 * petal);
        lotus.push(
          project(Math.cos(theta) * radius, Math.sin(theta) * radius, 0.5, 0.42, aspect)
        );
      }
    }
    while (lotus.length < n) lotus.push({ x: 0.5, y: 0.42 });
  }

  // A classic parametric heart curve, traced in isotropic space and then
  // aspect-projected like the other round shapes.
  const heart: Point[] = [];
  {
    const radius = 0.34;
    const norm = 17; // roughly the curve's peak magnitude, for normalizing to [-1, 1]
    for (let i = 0; i < n; i++) {
      const t = (i / n) * Math.PI * 2;
      const hx = 16 * Math.pow(Math.sin(t), 3);
      const hy =
        13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      // hy is inverted (subtracted) because the curve's "up" is positive in
      // math convention, but canvas y grows downward.
      heart.push(project((hx / norm) * radius, -(hy / norm) * radius, 0.5, 0.46, aspect));
    }
  }

  // A six-armed snowflake: one straight spoke per arm plus two branch pairs
  // along each spoke, all built in isotropic space first.
  const snowflake: Point[] = [];
  {
    const radius = 0.34;
    const arms = 6;
    type Seg = { x0: number; y0: number; x1: number; y1: number; len: number };
    const segs: Seg[] = [];
    for (let a = 0; a < arms; a++) {
      const baseAngle = (a / arms) * Math.PI * 2 - Math.PI / 2;
      const ex = Math.cos(baseAngle) * radius;
      const ey = Math.sin(baseAngle) * radius;
      segs.push({ x0: 0, y0: 0, x1: ex, y1: ey, len: radius });

      for (const frac of [0.45, 0.72]) {
        const ox = ex * frac;
        const oy = ey * frac;
        const branchLen = radius * (0.5 - frac * 0.3);
        for (const sign of [-1, 1]) {
          const bAngle = baseAngle + sign * 0.6;
          const bx = ox + Math.cos(bAngle) * branchLen;
          const by = oy + Math.sin(bAngle) * branchLen;
          segs.push({ x0: ox, y0: oy, x1: bx, y1: by, len: branchLen });
        }
      }
    }

    const totalLen = segs.reduce((s, seg) => s + seg.len, 0) || 1;
    let assigned = 0;
    segs.forEach((seg, idx) => {
      const isLast = idx === segs.length - 1;
      const count = isLast
        ? Math.max(1, n - assigned)
        : Math.max(2, Math.round((seg.len / totalLen) * n));
      assigned += count;
      for (let i = 0; i < count; i++) {
        const t = count === 1 ? 0 : i / (count - 1);
        const rawX = seg.x0 + (seg.x1 - seg.x0) * t;
        const rawY = seg.y0 + (seg.y1 - seg.y0) * t;
        snowflake.push(project(rawX, rawY, 0.5, 0.46, aspect));
      }
    });
    while (snowflake.length < n) snowflake.push({ x: 0.5, y: 0.46 });
    snowflake.length = n;
  }

  const ringsF: Point[] = [];
  {
    const rings = 4;
    const perRing = Math.floor(n / rings);
    for (let r = 1; r <= rings; r++) {
      const radius = r * 0.085;
      for (let i = 0; i < perRing; i++) {
        const theta = (i / perRing) * Math.PI * 2;
        ringsF.push(
          project(Math.cos(theta) * radius, Math.sin(theta) * radius, 0.5, 0.42, aspect)
        );
      }
    }
    while (ringsF.length < n) ringsF.push({ x: 0.5, y: 0.42 });
  }

  const mono: Point[] = [];
  {
    const legPoints = Math.floor(n * 0.38);
    const barPoints = Math.floor(n * 0.12);
    // Alternating small perpendicular offsets so each stroke reads as a
    // clear ~2-drone-wide line rather than a single thin scatter of points.
    const strokeOffsets = [-0.012, 0.012];

    for (let i = 0; i < legPoints; i++) {
      const t = i / legPoints;
      const offset = strokeOffsets[i % 2];
      mono.push({ x: 0.5 - 0.02 - t * 0.26 + offset, y: 0.74 - t * 0.56 });
    }
    for (let i = 0; i < legPoints; i++) {
      const t = i / legPoints;
      const offset = strokeOffsets[i % 2];
      mono.push({ x: 0.5 + 0.02 + t * 0.26 + offset, y: 0.74 - t * 0.56 });
    }
    for (let i = 0; i < barPoints; i++) {
      const t = i / barPoints;
      const offset = strokeOffsets[i % 2] * 0.6;
      mono.push({ x: 0.35 + t * 0.3, y: 0.52 + offset });
    }
    while (mono.length < n) {
      mono.push({ x: 0.5 + (rand() - 0.5) * 0.04, y: 0.16 + rand() * 0.04 });
    }
    mono.length = n;
  }

  return [ground, lift, scatter, wave, lotus, heart, snowflake, ringsF, mono];
}

export function easeInOutCubic(x: number) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
