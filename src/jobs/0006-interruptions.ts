import { draw, stick } from '../engine';
import { SRC } from './sources';
import { defineJob } from './types';

export default defineJob({
  no: '0006',
  title: 'Interruptions',
  technique: 'line field with interruptions',
  reference: 'Interruptions, 1968–69 — plotter drawings, 28 × 28 cm',
  sources: [SRC.damInterruptions],
  seed: 1969,
  params: [
    { key: 'grid', label: 'Grid', min: 6, max: 70, default: 36, show: (v) => `${v}×${v}` },
    { key: 'length', label: 'Line length', min: 40, max: 200, default: 130, unit: '%' },
    { key: 'spread', label: 'Angle spread', min: 0, max: 180, default: 180, unit: '°' },
    { key: 'gaps', label: 'Single gaps', min: 0, max: 50, default: 3, unit: '%' },
    { key: 'holes', label: 'Interruptions', min: 0, max: 12, default: 4 },
    { key: 'hole', label: 'Size', min: 2, max: 30, default: 9, unit: '%' },
  ],
  thumbnail: { grid: 24, holes: 2, hole: 12 },
  generate(p, R, plot) {
    const N = p.grid!, cell = 400 / N, len = cell * (p.length! / 100);
    // the interruptions: irregular patches where lines are erased
    const holes = Array.from({ length: p.holes! }, () => ({
      x: R.between(40, 360), y: R.between(40, 360),
      rx: 400 * (p.hole! / 100) * R.between(0.6, 1.4), ry: 400 * (p.hole! / 100) * R.between(0.6, 1.4),
    }));
    const spread = (p.spread! * Math.PI) / 180;
    for (let i = 0; i < N; i++) for (let k = 0; k < N; k++) {
      const x = cell * (i + 0.5), y = cell * (k + 0.5);
      const a = Math.PI / 2 + R.jitter(spread / 2);
      if (R.chance(p.gaps! / 100)) continue;
      // ragged edge: lines near the rim of a patch survive with falling probability
      const d = Math.min(...holes.map((h) => Math.hypot((x - h.x) / h.rx, (y - h.y) / h.ry)), Infinity);
      if (d < 1 && R.chance(1 - Math.max(0, d - 0.7) / 0.3)) continue;
      draw(plot, 1, stick(x, y, len, a));
    }
  },
  strokes: (p) => (p.grid! > 40 ? [0.55, 0.9] : [0.75, 1.3]),
  label: (p) => `${p.grid} by ${p.grid} short lines at random angles with ${p.holes} interruptions`,
  caption: (p) => `${p.grid}×${p.grid} · ${p.holes} interruptions`,
  description:
    'A grid of straight lines of equal length, each given a random rotation — then, in random sections, lines are erased. The result is the tension Molnar was after: a regular structure pulled at by forces that bring chaos into it, and holes that show the order was never quite complete. Narrow the <b>Angle spread</b> to comb the field back into order.',
});
