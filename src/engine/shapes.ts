// The vocabulary of shapes. Molnar worked with squares, quadrilaterals, lines,
// later arcs and curves. Add new elements here; rendering and export stay untouched.
import { path, rotatePt, type Pt } from './geom';
import type { Chance } from './rng';

/** Axis-aligned square around (cx, cy) with half-size h, clockwise from top-left. */
export const squarePts = (cx: number, cy: number, h: number): Pt[] => [
  [cx - h, cy - h], [cx + h, cy - h], [cx + h, cy + h], [cx - h, cy + h],
];

export const square = (cx: number, cy: number, h: number) => path(squarePts(cx, cy, h), true);

export const rect = (x: number, y: number, w: number, h: number) =>
  path([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], true);

export const quad = (a: Pt, b: Pt, c: Pt, d: Pt) => path([a, b, c, d], true);

export const line = (a: Pt, b: Pt) => path([a, b]);

/** Line of length `len` centred on (cx, cy) at angle `a`. */
export const stick = (cx: number, cy: number, len: number, a: number) => {
  const dx = (len / 2) * Math.cos(a), dy = (len / 2) * Math.sin(a);
  return line([cx - dx, cy - dy], [cx + dx, cy + dy]);
};

/** Regular polygon; also a circle when `n` is large. */
export const ngon = (cx: number, cy: number, r: number, n: number, a0 = 0) =>
  path(Array.from({ length: n }, (_, i) => {
    const a = a0 + (i / n) * Math.PI * 2;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as Pt;
  }), true);

export const circle = (cx: number, cy: number, r: number, segments = Math.max(24, Math.round(r))) =>
  ngon(cx, cy, r, segments);

/** Arc from angle a0 to a1 (radians), as a polyline. */
export const arc = (cx: number, cy: number, r: number, a0: number, a1: number, segments = 24) =>
  path(Array.from({ length: segments + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / segments;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as Pt;
  }));

/** Sample y = fn(x) from x0 to x1. */
export const curve = (fn: (x: number) => number, x0: number, x1: number, step: number) => {
  const pts: Pt[] = [];
  for (let x = x0; x <= x1 + 1e-9; x += step) pts.push([x, fn(x)]);
  return path(pts);
};

// ---- disorder ------------------------------------------------------------

/** Move every vertex by up to ±j in x and y. */
export const jitterPts = (pts: Pt[], R: Chance, j: number): Pt[] =>
  pts.map(([x, y]) => [x + R.jitter(j), y + R.jitter(j)]);

/** Square whose four corners are each displaced by up to ±j (prototype order: x, y per corner). */
export const jitteredSquare = (R: Chance, cx: number, cy: number, h: number, j: number) =>
  path(squarePts(cx, cy, h).map(([x, y]) => [x + R.jitter(j), y + R.jitter(j)] as Pt), true);

/** Rotate a set of points around a centre. */
export const rotatePts = (pts: Pt[], a: number, cx: number, cy: number) => pts.map((p) => rotatePt(p, a, cx, cy));

// ---- bent lines (Molnar, Leonardo 1975: "replacement of straight lines by segments
//      of circles, parabolas, hyperbolas and sine curves") ----------------------

/** Offset profile along a line, t in [0, 1] → offset in units of the amplitude. */
export type Bend = (t: number) => number;

export const BENDS = {
  straight: (() => 0) as Bend,
  parabola: ((t) => 4 * t * (1 - t)) as Bend,
  arc: ((t) => Math.sqrt(Math.max(0, 1 - (2 * t - 1) ** 2))) as Bend,
  sine: (waves: number): Bend => (t) => Math.sin(t * Math.PI * waves),
};

/**
 * Points from a to b (a excluded unless `withStart`), displaced perpendicular to the line by
 * amp · bend(t) on the sub-interval [t0, t1] only; straight elsewhere.
 */
export function bentPts(a: Pt, b: Pt, bend: Bend, amp: number, t0 = 0, t1 = 1, segments = 24, withStart = false): Pt[] {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L, ny = dx / L;
  const out: Pt[] = [];
  // straight before t0, curve between t0 and t1, straight after t1
  if (withStart) out.push(a);
  if (t0 > 0) out.push([a[0] + dx * t0, a[1] + dy * t0]);
  for (let i = 1; i <= segments; i++) {
    const u = i / segments, t = t0 + (t1 - t0) * u, o = amp * bend(u);
    out.push([a[0] + dx * t + nx * o, a[1] + dy * t + ny * o]);
  }
  if (t1 < 1) out.push(b);
  return out;
}

// ---- polygons drawn side by side ---------------------------------------------

/**
 * Draw a closed polygon where some sides may be missing. Consecutive kept sides are chained
 * into one stroke so the plotter lifts the pen only at the gaps.
 * `side(i, a, b)` returns the points after `a` up to and including `b` for side i (straight by default).
 */
export function brokenPolygon(corners: Pt[], keep: boolean[], side?: (i: number, a: Pt, b: Pt) => Pt[]) {
  const n = corners.length;
  const seg = (i: number) => (side ? side(i, corners[i]!, corners[(i + 1) % n]!) : [corners[(i + 1) % n]!]);
  if (keep.every(Boolean)) {
    const pts: Pt[] = [corners[0]!];
    for (let i = 0; i < n; i++) pts.push(...seg(i));
    pts.pop(); // last point equals the first
    return [path(pts, true)];
  }
  const first = keep.findIndex((k) => !k); // start right after a gap
  const out = [];
  let cur: Pt[] = [];
  for (let s = 1; s <= n; s++) {
    const i = (first + s) % n;
    if (keep[i]) {
      if (!cur.length) cur.push(corners[i]!);
      cur.push(...seg(i));
    } else if (cur.length) {
      out.push(path(cur));
      cur = [];
    }
  }
  if (cur.length) out.push(path(cur));
  return out;
}

// ---- hatching ----------------------------------------------------------------

/** Clip the infinite line through p with direction d to the rectangle; null if it misses. */
export function clipToRect(p: Pt, d: Pt, x: number, y: number, w: number, h: number): [Pt, Pt] | null {
  let t0 = -Infinity, t1 = Infinity;
  const tests: [number, number, number][] = [[d[0], x - p[0], x + w - p[0]], [d[1], y - p[1], y + h - p[1]]];
  for (const [dd, lo, hi] of tests) {
    if (Math.abs(dd) < 1e-12) {
      if (lo > 0 || hi < 0) return null;
      continue;
    }
    const a = lo / dd, b = hi / dd;
    t0 = Math.max(t0, Math.min(a, b));
    t1 = Math.min(t1, Math.max(a, b));
  }
  if (t1 - t0 < 1e-9) return null;
  return [[p[0] + d[0] * t0, p[1] + d[1] * t0], [p[0] + d[0] * t1, p[1] + d[1] * t1]];
}

/** `count` parallel lines at angle `a` (radians), evenly spaced across the rectangle. */
export function hatchRect(x: number, y: number, w: number, h: number, a: number, count: number) {
  const d: Pt = [Math.cos(a), Math.sin(a)], nrm: Pt = [-d[1], d[0]];
  const cx = x + w / 2, cy = y + h / 2;
  // extent of the rectangle along the normal
  const ext = Math.abs(nrm[0]) * w / 2 + Math.abs(nrm[1]) * h / 2;
  const out = [];
  for (let i = 1; i <= count; i++) {
    const o = -ext + (2 * ext * i) / (count + 1);
    const seg = clipToRect([cx + nrm[0] * o, cy + nrm[1] * o], d, x, y, w, h);
    if (seg) out.push(path([seg[0], seg[1]]));
  }
  return out;
}
