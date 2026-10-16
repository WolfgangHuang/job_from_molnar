// Geometry primitives. A drawing is nothing but polylines: what a pen plotter can do.

export type Pt = readonly [number, number];

/** One pen-down stroke. `closed` returns to the first point. */
export interface Path {
  pts: Pt[];
  closed: boolean;
}

export const path = (pts: Pt[], closed = false): Path => ({ pts, closed });

export const rotatePt = ([x, y]: Pt, a: number, cx = 0, cy = 0): Pt => {
  const c = Math.cos(a), s = Math.sin(a), dx = x - cx, dy = y - cy;
  return [cx + dx * c - dy * s, cy + dx * s + dy * c];
};

export const mapPts = (p: Path, fn: (q: Pt, i: number) => Pt): Path => ({ pts: p.pts.map(fn), closed: p.closed });

export const translate = (p: Path, dx: number, dy: number) => mapPts(p, ([x, y]) => [x + dx, y + dy]);
export const scale = (p: Path, sx: number, sy = sx, cx = 0, cy = 0) =>
  mapPts(p, ([x, y]) => [cx + (x - cx) * sx, cy + (y - cy) * sy]);
export const rotate = (p: Path, a: number, cx = 0, cy = 0) => mapPts(p, (q) => rotatePt(q, a, cx, cy));

export const dist = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1]);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const lerpPt = (a: Pt, b: Pt, t: number): Pt => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Drawn length of a path. */
export function length(p: Path): number {
  let L = 0;
  for (let i = 1; i < p.pts.length; i++) L += dist(p.pts[i - 1]!, p.pts[i]!);
  if (p.closed && p.pts.length > 1) L += dist(p.pts[p.pts.length - 1]!, p.pts[0]!);
  return L;
}

/** Points where the pen goes down / comes up. */
export const startOf = (p: Path): Pt => p.pts[0]!;
export const endOf = (p: Path): Pt => (p.closed ? p.pts[0]! : p.pts[p.pts.length - 1]!);
