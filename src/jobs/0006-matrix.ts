import { draw, stick } from '../engine';
import { defineJob } from './types';

export default defineJob({
  no: '0006',
  title: 'Matrix 6',
  technique: 'line field with interruptions',
  reference: 'Interruptions, 1968–69',
  seed: 1969,
  params: [
    { key: 'grid', label: 'Grid', min: 6, max: 60, default: 24, show: (v) => `${v}×${v}` },
    { key: 'length', label: 'Line length', min: 40, max: 200, default: 125, unit: '%' },
    { key: 'spread', label: 'Angle spread', min: 0, max: 180, default: 180, unit: '°' },
    { key: 'gaps', label: 'Interruptions', min: 0, max: 50, default: 8, unit: '%' },
    { key: 'holes', label: 'Holes', min: 0, max: 6, default: 1 },
    { key: 'hole', label: 'Hole size', min: 4, max: 30, default: 12, unit: '%' },
  ],
  generate(p, R, plot) {
    const N = p.grid!, cell = 400 / N, len = cell * (p.length! / 100);
    // clusters of missing lines: the "interruptions"
    const holes = Array.from({ length: p.holes! }, () => ({
      x: R.between(60, 340), y: R.between(60, 340),
      rx: 400 * (p.hole! / 100) * R.between(0.7, 1.3), ry: 400 * (p.hole! / 100) * R.between(0.7, 1.3),
    }));
    const spread = (p.spread! * Math.PI) / 180;
    for (let i = 0; i < N; i++) for (let k = 0; k < N; k++) {
      if (R.chance(p.gaps! / 100)) continue;
      const x = cell * (i + 0.5), y = cell * (k + 0.5);
      const inHole = holes.some((h) => ((x - h.x) / h.rx) ** 2 + ((y - h.y) / h.ry) ** 2 < 1);
      if (inHole && R.chance(0.9)) continue;
      draw(plot, 1, stick(x, y, len, Math.PI / 2 + R.jitter(spread / 2)));
    }
  },
  strokes: (p) => (p.grid! > 36 ? [0.6, 0.9] : [0.85, 1.3]),
  label: (p) => `${p.grid} by ${p.grid} short lines at random angles, ${p.gaps}% interrupted, ${p.holes} holes`,
  caption: (p) => `${p.grid}×${p.grid} · ${p.gaps}% gaps`,
  description:
    'A grid of equal lines, each turned at random — and then some taken away. Single lines go missing, and here and there whole patches open up, like a hole in a woven cloth. Narrow the <b>Angle spread</b> to comb the field into order.',
});
