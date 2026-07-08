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

// Lotus / bloom formation.
export function lotusPoints(n: number): Point[] {
  const pts: Point[] = [];
  const petals = 8;
  const rings = 3;
  const perRing = Math.floor(n / rings);

  for (let r = 0; r < rings; r++) {
    const ringScale = 0.22 + r * 0.13;
    for (let i = 0; i < perRing; i++) {
      const theta = (i / perRing) * Math.PI * 2;
      const petal = Math.abs(Math.cos(petals * theta * 0.5));
      const radius = ringScale * (0.35 + 0.65 * petal);
      pts.push({
        x: 0.5 + Math.cos(theta) * radius,
        y: 0.55 + Math.sin(theta) * radius * 0.85,
      });
    }
  }
  while (pts.length < n) {
    pts.push({ x: 0.5, y: 0.55 });
  }
  return pts.slice(0, n);
}

// Concentric rings — a simple, formal "salute" formation.
export function ringPoints(n: number): Point[] {
  const pts: Point[] = [];
  const rings = 4;
  const perRing = Math.floor(n / rings);
  for (let r = 1; r <= rings; r++) {
    const radius = r * 0.11;
    for (let i = 0; i < perRing; i++) {
      const theta = (i / perRing) * Math.PI * 2;
      pts.push({
        x: 0.5 + Math.cos(theta) * radius,
        y: 0.5 + Math.sin(theta) * radius * 0.9,
      });
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
