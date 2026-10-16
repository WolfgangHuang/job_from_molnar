import { draw, path, type Pt } from '../engine';
import { defineJob } from './types';

// The magic square from Dürer's engraving "Melencolia I" (1514).
const MELENCOLIA = [
  [16, 3, 2, 13],
  [5, 10, 11, 8],
  [9, 6, 7, 12],
  [4, 15, 14, 1],
];

export default defineJob({
  no: '0008',
  title: 'Strukturen 8',
  technique: 'a path through a magic square',
  reference: 'Hommage à Dürer, c. 1990',
  seed: 1990,
  params: [
    { key: 'copies', label: 'Copies', min: 1, max: 10, default: 3 },
    { key: 'offset', label: 'Offset', min: 0, max: 20, default: 6 },
    { key: 'wander', label: 'Wander', min: 0, max: 40, default: 0 },
    { key: 'trace', label: 'Pen 2 trace', min: 0, max: 30, default: 12, show: (v) => (v ? `±${v}` : 'off') },
  ],
  generate(p, R, plot) {
    const pos: Record<number, Pt> = {};
    MELENCOLIA.forEach((row, r) => row.forEach((n, k) => { pos[n] = [60 + k * 94, 60 + r * 94]; }));
    const c = p.copies!;
    for (let m = 0; m < c; m++) {
      const o = (m - (c - 1) / 2) * p.offset!;
      const pts: Pt[] = [];
      for (let n = 1; n <= 16; n++) pts.push([pos[n]![0] + o + R.jitter(p.wander!), pos[n]![1] + o + R.jitter(p.wander!)]);
      draw(plot, 1, path(pts));
    }
    if (p.trace) {
      const pts = [1, 2, 3, 4, 8, 12, 16].map((q): Pt => [pos[q]![0] + R.jitter(p.trace!), pos[q]![1] + R.jitter(p.trace!)]);
      draw(plot, 2, path(pts));
    }
  },
  label: (p) => `${p.copies} lines joining the numbers 1 to 16 of Dürer's magic square in order`,
  caption: (p) => `4×4 · ${p.copies} copies`,
  description:
    'Take the magic square from Dürer’s <i>Melencolia I</i>, where every row, column and diagonal sums to 34, and join its numbers in counting order: 1, 2, 3 … 16. The arithmetic becomes a figure. Offset copies thicken the line the way a plotter would on repeated passes.',
});
