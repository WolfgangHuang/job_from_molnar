import { draw, jitteredSquare } from '../engine';
import { defineJob } from './types';

export default defineJob({
  no: '0007',
  title: 'Varianten 7',
  technique: 'distorted quadrilaterals',
  seed: 1985,
  params: [
    { key: 'grid', label: 'Grid', min: 2, max: 10, default: 5, show: (v) => `${v}×${v}` },
    { key: 'inner', label: 'Inner shapes', min: 0, max: 4, default: 1 },
    { key: 'distort', label: 'Distortion', min: 0, max: 100, default: 50, unit: '%' },
    { key: 'diagonal', label: 'Pen 2 diagonal', min: 0, max: 8, default: 4, show: (v) => (v ? `every ${v}` : 'off') },
  ],
  generate(p, R, plot) {
    const N = p.grid!, cell = 400 / N, d = p.distort! / 100;
    for (let i = 0; i < N; i++) for (let k = 0; k < N; k++) {
      const cx = cell * (i + 0.5), cy = cell * (k + 0.5), h = cell * 0.35;
      const pen = p.diagonal && (i + k) % p.diagonal === 0 ? 2 : 1;
      draw(plot, pen, jitteredSquare(R, cx, cy, h, h * d));
      for (let m = 1; m <= p.inner!; m++) {
        const hi = h * (1 - m / (p.inner! + 1.4));
        draw(plot, 1, jitteredSquare(R, cx, cy, hi, hi * d));
      }
    }
  },
  label: (p) => `${p.grid} by ${p.grid} quadrilaterals, ${p.distort}% distorted`,
  caption: (p) => `${p.grid}×${p.grid} · ${p.distort}%`,
  description:
    'Every cell starts as a square; every corner is then allowed to wander. The results are cousins — trapezes, kites, crooked boxes — variants of one figure rather than different ones.',
});
