import { draw, jitterPts, ngon, path, type Pt } from '../engine';
import { SRC } from './sources';
import { defineJob } from './types';

export default defineJob({
  no: '0005',
  title: 'Transformations',
  technique: 'one square, stepwise altered',
  reference: 'Molnar’s method of series in which “only one parameter will have been varied” (Leonardo, 1975)',
  sources: [SRC.leonardo1975, SRC.pompidou],
  seed: 1975,
  params: [
    { key: 'grid', label: 'Grid', min: 2, max: 14, default: 6, show: (v) => `${v}×${v}` },
    { key: 'turn', label: 'Total turn', min: 0, max: 180, default: 45, unit: '°' },
    { key: 'from', label: 'Size at start', min: 10, max: 110, default: 72, unit: '%' },
    { key: 'to', label: 'Size at end', min: 10, max: 110, default: 72, unit: '%' },
    { key: 'corners', label: 'Corners', min: 3, max: 8, default: 4 },
    { key: 'disorder', label: 'Disorder', min: 0, max: 30, default: 0, unit: '%' },
    { key: 'share', label: 'Pen 2 share', min: 0, max: 60, default: 0, unit: '%' },
  ],
  generate(p, R, plot) {
    const N = p.grid!, cell = 400 / N, n = p.corners!;
    for (let i = 0; i < N; i++) for (let k = 0; k < N; k++) {
      // position in the sequence, reading order: left to right, top to bottom
      const t = N > 1 ? (k * N + i) / (N * N - 1) : 0;
      const size = (p.from! + (p.to! - p.from!) * t) / 100;
      // circumradius so a square of `size` fills that share of the cell
      const r = (cell / 2) * size / Math.cos(Math.PI / n);
      const a = (p.turn! * Math.PI / 180) * t + Math.PI / 2 + Math.PI / n;
      const shape = ngon(cell * (i + 0.5), cell * (k + 0.5), r, n, a);
      const pts: Pt[] = jitterPts(shape.pts, R, (p.disorder! / 100) * cell * 0.3);
      draw(plot, R.chance(p.share! / 100) ? 2 : 1, path(pts, true));
    }
  },
  label: (p) => `${p.grid} by ${p.grid} figures with ${p.corners} corners, turning through ${p.turn} degrees and scaling from ${p.from} to ${p.to} percent`,
  caption: (p) => `${p.grid}×${p.grid} · ${p.turn}°`,
  description:
    'Molnar worked in series: each picture differs from the one before it in a single parameter — scale, shape, angle. Here the whole series sits on one sheet. Read it like a text, left to right, top to bottom: the figure turns and grows a little with every step. Change <b>Corners</b> to watch the square become a triangle or a hexagon.',
});
