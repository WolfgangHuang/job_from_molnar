import { draw, magicSquare, path, type Pt } from '../engine';
import { SRC } from './sources';
import { defineJob } from './types';

export default defineJob({
  no: '0008',
  title: 'Hommage à Dürer',
  technique: 'a line through a magic square',
  reference: 'Hommage à Dürer, 1990 — plotter drawing, ink on paper, 30 × 30 cm',
  sources: [SRC.damDurer],
  seed: 1990,
  params: [
    { key: 'order', label: 'Order', min: 3, max: 9, default: 4, show: (v) => `${v}×${v}` },
    { key: 'copies', label: 'Copies', min: 1, max: 10, default: 3 },
    { key: 'offset', label: 'Offset', min: 0, max: 20, default: 6 },
    { key: 'wander', label: 'Wander', min: 0, max: 30, default: 0 },
    { key: 'pen2', label: 'Pen 2 copies', min: 0, max: 10, default: 1 },
  ],
  thumbnail: { pen2: 1 },
  generate(p, R, plot) {
    const n = p.order!, sq = magicSquare(n), step = 280 / (n - 1);
    const pos: Pt[] = [];
    sq.forEach((row, r) => row.forEach((v, k) => { pos[v] = [60 + k * step, 60 + r * step]; }));
    const c = p.copies!;
    for (let m = 0; m < c; m++) {
      const o = (m - (c - 1) / 2) * p.offset!;
      const pts: Pt[] = [];
      for (let v = 1; v <= n * n; v++) pts.push([pos[v]![0] + o + R.jitter(p.wander!), pos[v]![1] + o + R.jitter(p.wander!)]);
      // the last copies go to pen 2
      draw(plot, m >= c - p.pen2! ? 2 : 1, path(pts));
    }
  },
  label: (p) => `${p.copies} lines joining the numbers 1 to ${p.order! ** 2} of a ${p.order} by ${p.order} magic square in ascending order`,
  caption: (p) => `${p.order}×${p.order} · ${p.copies} copies`,
  description:
    'Dürer’s engraving <i>Melencolia I</i> (1514) contains a magic square: every row, column and diagonal of the numbers 1 to 16 sums to 34. Molnar connected the numbers with one line, in ascending order, and the arithmetic became a figure. Order 4 is Dürer’s own square; the other orders use classic constructions, so you can see what other magic squares look like as drawings.',
});
