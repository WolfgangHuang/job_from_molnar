import { draw, jitteredSquare } from '../engine';
import { defineJob } from './types';

export default defineJob({
  no: '0004',
  title: 'Chaos 4',
  technique: 'nested squares, drifting centres',
  reference: 'Hypertransformations, 1975–76 (small parameter changes to regular squares)',
  seed: 1975,
  params: [
    { key: 'squares', label: 'Squares', min: 3, max: 50, default: 30 },
    { key: 'drift', label: 'Drift', min: 0, max: 40, default: 20 },
    { key: 'distort', label: 'Distortion', min: 0, max: 60, default: 28 },
    { key: 'every', label: 'Pen 2 every', min: 0, max: 12, default: 7, show: (v) => (v ? `${v}th` : 'off') },
  ],
  generate(p, R, plot) {
    const n = p.squares!;
    for (let m = 0; m < n; m++) {
      const cx = 200 + R.jitter(p.drift!), cy = 200 + R.jitter(p.drift!);
      const h = 40 + m * (150 / Math.max(1, n - 1));
      draw(plot, p.every && m % p.every === 0 ? 2 : 1, jitteredSquare(R, cx, cy, h, p.distort!));
    }
  },
  label: (p) => `${p.squares} nested squares with drifting centres and ${p.distort} units of distortion`,
  caption: (p) => `${p.squares} squares · drift ${p.drift}`,
  description:
    'One square, then a slightly larger one, and another — each centre nudged, each corner pulled. Order is still there in the sequence of sizes; the chaos lives only in the placement.',
});
