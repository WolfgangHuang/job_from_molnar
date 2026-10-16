import { brokenPolygon, draw, squarePts, type Pt } from '../engine';
import { SRC } from './sources';
import { defineJob } from './types';

// Follows the variables of Molnar's program RESEAU-TO (Leonardo 1975): number of sets,
// squares per set, displacement, deformation, elimination of lines or whole figures.

export default defineJob({
  no: '0002',
  title: 'De la série (Des)Ordres',
  technique: 'concentric squares, shaken',
  reference: '(Des)Ordres, 1974 — plotter drawings, ink on paper',
  sources: [SRC.damDesOrdres, SRC.leonardo1975],
  seed: 1974,
  params: [
    { key: 'grid', label: 'Sets', min: 1, max: 12, default: 3, show: (v) => `${v}×${v}` },
    { key: 'rings', label: 'Squares per set', min: 1, max: 16, default: 8 },
    { key: 'shift', label: 'Displacement', min: 0, max: 100, default: 20, unit: '%' },
    { key: 'deform', label: 'Deformation', min: 0, max: 100, default: 45, unit: '%' },
    { key: 'lines', label: 'Missing lines', min: 0, max: 60, default: 0, unit: '%' },
    { key: 'figures', label: 'Missing squares', min: 0, max: 60, default: 0, unit: '%' },
    { key: 'share', label: 'Pen 2 share', min: 0, max: 60, default: 16, unit: '%' },
  ],
  thumbnail: { shift: 0 },
  generate(p, R, plot) {
    const N = p.grid!, rings = p.rings!, cell = 400 / N;
    for (let i = 0; i < N; i++) for (let k = 0; k < N; k++) {
      const cx = cell * (i + 0.5), cy = cell * (k + 0.5);
      for (let m = 1; m <= rings; m++) {
        if (R.chance(p.figures! / 100)) continue;
        const pen = R.chance(p.share! / 100) ? 2 : 1;
        const t = m / rings; // the further out, the more the square trembles
        const j = (p.deform! / 100) * t * cell * 0.15;
        const s = (p.shift! / 100) * t * cell * 0.05;
        const dx = R.jitter(s), dy = R.jitter(s);
        const corners = squarePts(cx + dx, cy + dy, m * (cell * 0.44 / rings))
          .map(([x, y]): Pt => [x + R.jitter(j), y + R.jitter(j)]);
        const keep = corners.map(() => !R.chance(p.lines! / 100));
        if (!keep.some(Boolean)) continue;
        draw(plot, pen, ...brokenPolygon(corners, keep));
      }
    }
  },
  strokes: (p) => (p.grid! > 5 ? [0.6, 0.9] : [0.85, 1.3]),
  label: (p) => `${p.grid} by ${p.grid} sets of ${p.rings} concentric squares, deformed and displaced towards the outside`,
  caption: (p) => `${p.grid}×${p.grid} · ${p.rings} squares`,
  note: (p, run) => `run ${run} — ${p.deform}%`,
  description:
    'Concentric squares on an orthogonal grid, disrupted as if by a vibrating force — the further out, the stronger the tremor. The title plays on <i>désordres</i> (disorders) and <i>des ordres</i> (some orders). The controls are the variables Molnar listed for her program RESEAU-TO: the number of sets, the squares in each, their displacement, their deformation, and the elimination of single lines or whole figures.',
});
