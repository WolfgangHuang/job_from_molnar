import { draw, path, squarePts, type Pt } from '../engine';
import { SRC } from './sources';
import { defineJob } from './types';

// After the "Carrés" computer drawings of 1972–73 (Leonardo 1975, Fig. 1 bottom and Fig. 2):
// squares on a grid, displaced, resized and deformed, some left out.

export default defineJob({
  no: '0007',
  title: 'Carrés',
  technique: 'distorted squares',
  reference: 'Carrés, 1972–73 — computer drawings, 25 × 25 cm',
  sources: [SRC.leonardo1975],
  seed: 1973,
  params: [
    { key: 'grid', label: 'Grid', min: 3, max: 16, default: 11, show: (v) => `${v}×${v}` },
    { key: 'size', label: 'Size', min: 20, max: 100, default: 70, unit: '%' },
    { key: 'vary', label: 'Size variation', min: 0, max: 100, default: 20, unit: '%' },
    { key: 'shift', label: 'Displacement', min: 0, max: 100, default: 10, unit: '%' },
    { key: 'deform', label: 'Deformation', min: 0, max: 100, default: 40, unit: '%' },
    { key: 'missing', label: 'Missing', min: 0, max: 60, default: 8, unit: '%' },
    { key: 'share', label: 'Pen 2 share', min: 0, max: 60, default: 6, unit: '%' },
  ],
  thumbnail: { grid: 7 },
  generate(p, R, plot) {
    const N = p.grid!, cell = 400 / N;
    for (let i = 0; i < N; i++) for (let k = 0; k < N; k++) {
      if (R.chance(p.missing! / 100)) continue;
      const h = (cell / 2) * (p.size! / 100) * (1 - R.next() * (p.vary! / 100) * 0.7);
      const s = (p.shift! / 100) * cell * 0.5, j = (p.deform! / 100) * h;
      const cx = cell * (i + 0.5) + R.jitter(s), cy = cell * (k + 0.5) + R.jitter(s);
      const pts = squarePts(cx, cy, h).map(([x, y]): Pt => [x + R.jitter(j), y + R.jitter(j)]);
      draw(plot, R.chance(p.share! / 100) ? 2 : 1, path(pts, true));
    }
  },
  strokes: (p) => (p.grid! > 12 ? [0.6, 0.9] : [0.85, 1.3]),
  label: (p) => `${p.grid} by ${p.grid} squares, ${p.deform}% deformed, ${p.missing}% missing`,
  caption: (p) => `${p.grid}×${p.grid} · ${p.deform}%`,
  description:
    'Squares in a grid, each one allowed to move, to shrink, and to bend its corners until it becomes a trapeze, a kite or almost a triangle — and a few left out. Molnar produced such series on an IBM 370, changed the parameters while watching the screen, and sent only the versions she chose to the Benson plotter.',
});
