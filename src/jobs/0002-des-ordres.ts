import { draw, jitteredSquare } from '../engine';
import { defineJob } from './types';

export default defineJob({
  no: '0002',
  title: 'De la série (Des)Ordres',
  technique: 'concentric squares, growing disorder',
  reference: '(Des)Ordres, 1974',
  seed: 1974,
  params: [
    { key: 'grid', label: 'Grid', min: 1, max: 8, default: 3, show: (v) => `${v}×${v}` },
    { key: 'rings', label: 'Rings', min: 2, max: 16, default: 8 },
    { key: 'disorder', label: 'Disorder', min: 0, max: 100, default: 45, unit: '%' },
    { key: 'gaps', label: 'Missing squares', min: 0, max: 50, default: 0, unit: '%' },
    { key: 'share', label: 'Pen 2 share', min: 0, max: 60, default: 16, unit: '%' },
  ],
  generate(p, R, plot) {
    const N = p.grid!, rings = p.rings!;
    const cell = 400 / N;
    for (let i = 0; i < N; i++) for (let k = 0; k < N; k++) {
      const cx = cell * (i + 0.5), cy = cell * (k + 0.5);
      for (let m = 1; m <= rings; m++) {
        if (R.chance(p.gaps! / 100)) continue;
        const pen = R.chance(p.share! / 100) ? 2 : 1;
        // the further out, the more the square trembles
        const j = (p.disorder! / 100) * (m / rings) * cell * 0.15;
        draw(plot, pen, jitteredSquare(R, cx, cy, m * (cell * 0.44 / rings), j));
      }
    }
  },
  strokes: (p) => (p.grid! > 5 ? [0.6, 0.9] : [0.85, 1.3]),
  label: (p) => `${p.grid} by ${p.grid} groups of ${p.rings} concentric squares, ${p.disorder}% disorder towards the outside`,
  caption: (p) => `${p.grid}×${p.grid} · ${p.rings} rings`,
  note: (p, run) => `run ${run} — ${p.disorder}%`,
  description:
    'Squares inside squares, each one a little less sure of itself than the one it encloses. The title plays on <i>désordres</i> (disorders) and <i>des ordres</i> (some orders): there is a rule inside the mess. Raise <b>Missing squares</b> to let some lines drop out entirely.',
});
