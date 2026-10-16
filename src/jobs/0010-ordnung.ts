import { draw, path, type Pt } from '../engine';
import { defineJob } from './types';

export default defineJob({
  no: '0010',
  title: 'Ordnung 10',
  technique: 'lines, order into disorder',
  seed: 1989,
  params: [
    { key: 'lines', label: 'Lines', min: 5, max: 90, default: 40 },
    { key: 'vertices', label: 'Vertices', min: 3, max: 60, default: 16 },
    { key: 'disorder', label: 'Disorder', min: 0, max: 50, default: 18 },
    { key: 'curve', label: 'Onset', min: 5, max: 40, default: 20, show: (v) => (v / 10).toFixed(1) },
    { key: 'share', label: 'Pen 2 share', min: 0, max: 60, default: 0, unit: '%' },
  ],
  generate(p, R, plot) {
    const rows = p.lines!, n = p.vertices!;
    for (let r = 0; r < rows; r++) {
      // disorder grows from the top row (none) to the bottom row (full)
      const j = Math.pow(r / rows, p.curve! / 10) * p.disorder!;
      const pts: Pt[] = [];
      for (let i = 0; i < n; i++) pts.push([20 + (i * 360) / (n - 1), 20 + (r * 360) / Math.max(1, rows - 1) + R.jitter(j)]);
      draw(plot, R.chance(p.share! / 100) ? 2 : 1, path(pts));
    }
  },
  label: (p) => `${p.lines} horizontal lines, straight at the top and increasingly disordered below`,
  caption: (p) => `${p.lines} lines · ${p.vertices} vertices`,
  description:
    'Ruled lines, perfectly straight at the top of the sheet. With each line down, the vertices are allowed a little more freedom. <b>Onset</b> decides whether the disorder creeps in slowly or breaks out late.',
});
