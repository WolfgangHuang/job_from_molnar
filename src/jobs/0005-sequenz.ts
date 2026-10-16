import { draw, ngon, jitterPts, path } from '../engine';
import { defineJob } from './types';

export default defineJob({
  no: '0005',
  title: 'Sequenz 5',
  technique: 'rotation sequence',
  seed: 1971,
  params: [
    { key: 'grid', label: 'Grid', min: 2, max: 14, default: 6, show: (v) => `${v}×${v}` },
    { key: 'turn', label: 'Total turn', min: 0, max: 180, default: 45, unit: '°' },
    { key: 'size', label: 'Size', min: 20, max: 110, default: 72, unit: '%' },
    { key: 'disorder', label: 'Disorder', min: 0, max: 30, default: 0, unit: '%' },
    { key: 'share', label: 'Pen 2 share', min: 0, max: 60, default: 0, unit: '%' },
  ],
  generate(p, R, plot) {
    const N = p.grid!, cell = 400 / N;
    const r = (cell / 2) * (p.size! / 100) * Math.SQRT2;
    for (let i = 0; i < N; i++) for (let k = 0; k < N; k++) {
      const t = N > 1 ? (i + k) / (2 * (N - 1)) : 0;
      const a = (p.turn! * Math.PI / 180) * t + Math.PI / 4;
      const sq = ngon(cell * (i + 0.5), cell * (k + 0.5), r, 4, a);
      const pts = jitterPts(sq.pts, R, (p.disorder! / 100) * cell * 0.3);
      draw(plot, R.chance(p.share! / 100) ? 2 : 1, path(pts, true));
    }
  },
  label: (p) => `${p.grid} by ${p.grid} squares turning through ${p.turn} degrees across the grid`,
  caption: (p) => `${p.grid}×${p.grid} · ${p.turn}°`,
  description:
    'A single square, repeated, turning a few degrees with every step across the sheet. The sequence is fully determined — the movement you see is the rule itself. Add <b>Disorder</b> to let it stumble.',
});
