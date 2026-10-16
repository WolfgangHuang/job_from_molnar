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
