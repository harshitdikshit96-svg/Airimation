export type Point = { x: number; y: number };

export function scatterPoints(n: number): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i < n; i++) {
    pts.push({ x: Math.random(), y: Math.random() });
  }
  return pts;
}

// A stylised "A" monogram — two converging strokes and a crossbar.
export function monogramPoints(n: number): Point[] {
  const pts: Point[] = [];
  const legPoints = Math.floor(n * 0.42);
  const barPoints = Math.floor(n * 0.16);

  for (let i = 0; i < legPoints; i++) {
    const t = i / legPoints;
    pts.push({ x: 0.5 - t * 0.34, y: 0.86 - t * 0.72 });
  }
  for (let i = 0; i < legPoints; i++) {
    const t = i / legPoints;
    pts.push({ x: 0.5 + t * 0.34, y: 0.86 - t * 0.72 });
  }
  for (let i = 0; i < barPoints; i++) {
    const t = i / barPoints;
    pts.push({ x: 0.5 - 0.17 + t * 0.34, y: 0.6 });
  }
  while (pts.length < n) {
    const t = Math.random();
    pts.push({ x: 0.5 + (Math.random() - 0.5) * 0.06, y: 0.14 + t * 0.05 });
  }
  return pts.slice(0, n);
}

// Circular/symmetric formations (lotus, ring, heart, snowflake) are designed
// in an isotropic space — a "radius" of 1 means the same physical size in
// both directions — then projected into the card's actual normalized (0..1,
// 0..1) coordinates with `aspect` (container width / height) correcting the
// x axis. Without this, a shape that's circular in x/y-fraction space renders
// squashed on any non-square container (this is why the ring formation used
// to read as an "eclipse" rather than a circle).
function project(rawX: number, rawY: number, cx: number, cy: number, aspect: number): Point {
  return { x: cx + rawX / aspect, y: cy + rawY };
}

// Lotus / bloom formation.
export function lotusPoints(n: number, aspect: number = 1.33): Point[] {
  const pts: Point[] = [];
  const petals = 8;
  const rings = 3;
  const perRing = Math.floor(n / rings);

  for (let r = 0; r < rings; r++) {
    const ringScale = 0.2 + r * 0.11;
    for (let i = 0; i < perRing; i++) {
      const theta = (i / perRing) * Math.PI * 2;
      const petal = Math.abs(Math.cos(petals * theta * 0.5));
      const radius = ringScale * (0.35 + 0.65 * petal);
      pts.push(project(Math.cos(theta) * radius, Math.sin(theta) * radius, 0.5, 0.52, aspect));
    }
  }
  while (pts.length < n) {
    pts.push({ x: 0.5, y: 0.52 });
  }
  return pts.slice(0, n);
}

// Concentric rings — a simple, formal "salute" formation.
export function ringPoints(n: number, aspect: number = 1.33): Point[] {
  const pts: Point[] = [];
  const rings = 4;
  const perRing = Math.floor(n / rings);
  for (let r = 1; r <= rings; r++) {
    const radius = r * 0.1;
    for (let i = 0; i < perRing; i++) {
      const theta = (i / perRing) * Math.PI * 2;
      pts.push(project(Math.cos(theta) * radius, Math.sin(theta) * radius, 0.5, 0.5, aspect));
    }
  }
  while (pts.length < n) {
    pts.push({ x: 0.5, y: 0.5 });
  }
  return pts.slice(0, n);
}

// A rising wave / chevron — evokes a swarm in flight formation.
export function wavePoints(n: number): Point[] {
  const pts: Point[] = [];
  const rows = 6;
  const perRow = Math.floor(n / rows);
  for (let r = 0; r < rows; r++) {
    for (let i = 0; i < perRow; i++) {
      const t = i / perRow;
      const y = 0.75 - r * 0.08 + Math.sin(t * Math.PI) * 0.08;
      pts.push({ x: 0.12 + t * 0.76, y });
    }
  }
  while (pts.length < n) {
    pts.push({ x: 0.5, y: 0.5 });
  }
  return pts.slice(0, n);
}

// A classic parametric heart curve, traced in isotropic space and then
// aspect-projected like the other round shapes.
export function heartPoints(n: number, aspect: number = 1.33): Point[] {
  const pts: Point[] = [];
  const radius = 0.36;
  const norm = 17;
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    const hx = 16 * Math.pow(Math.sin(t), 3);
    const hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    pts.push(project((hx / norm) * radius, -(hy / norm) * radius, 0.5, 0.5, aspect));
  }
  return pts;
}

// A six-armed snowflake: one straight spoke per arm plus two branch pairs
// along each spoke, all built in isotropic space first.
export function snowflakePoints(n: number, aspect: number = 1.33): Point[] {
  const radius = 0.36;
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
  const pts: Point[] = [];
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
      pts.push(project(rawX, rawY, 0.5, 0.5, aspect));
    }
  });
  while (pts.length < n) pts.push({ x: 0.5, y: 0.5 });
  return pts.slice(0, n);
}
