import { draw, path, type Pt } from '../engine';
import { SRC } from './sources';
import { defineJob } from './types';

export default defineJob({
  no: '0001',
  title: '1% Disorder',
  technique: 'concentric squares',
  reference: '“1 % de désordre” — and works such as “1% de désordre / Main ordinateur”',
  sources: [SRC.pompidou, SRC.spalter1pc, SRC.leonardo1975],
  seed: 1968,
  params: [
    { key: 'grid', label: 'Grid', min: 1, max: 10, default: 6, show: (v) => `${v}×${v}` },
    { key: 'rings', label: 'Rings', min: 1, max: 14, default: 7 },
    { key: 'disorder', label: 'Disorder', min: 0, max: 30, default: 1, unit: '%' },
    { key: 'rotation', label: 'Rotation', min: 0, max: 90, default: 0, unit: '°' },
    { key: 'share', label: 'Pen 2 share', min: 0, max: 60, default: 4, unit: '%' },
  ],
  thumbnail: { grid: 4, rings: 5, disorder: 3, share: 0 },

  // Ported 1:1 from the design prototype (same random stream for the same seed).
  generate(p, R, plot) {
    const N = p.grid!, rings = p.rings!, dis = p.disorder!;
    const cell = 360 / N;
    for (let i = 0; i < N; i++) for (let k = 0; k < N; k++) {
      const cx = 20 + cell * (i + 0.5), cy = 20 + cell * (k + 0.5);
      const a = (p.rotation! * Math.PI / 180) * (N > 1 ? (i + k) / (2 * (N - 1)) : 0);
      const ca = Math.cos(a), sa = Math.sin(a);
      for (let m = 1; m <= rings; m++) {
        const h = m * (cell * 0.44 / rings);
        const wild = R.chance(dis * 0.03);
        const j = wild ? cell * 0.07 : dis / 100 * cell * 0.15;
        const pts = ([[-h, -h], [h, -h], [h, h], [-h, h]] as Pt[]).map(([px, py]): Pt => {
          const x = px + R.jitter(j), y = py + R.jitter(j);
          return [cx + x * ca - y * sa, cy + x * sa + y * ca];
        });
        draw(plot, R.chance(p.share! / 100) ? 2 : 1, path(pts, true));
      }
    }
  },
  strokes: (p) => (p.grid! > 7 ? [0.6, 0.9] : [0.85, 1.3]),
  label: (p) => `${p.grid} by ${p.grid} concentric squares, ${p.disorder}% disorder`,
  caption: (p) => `${p.grid}×${p.grid} · ${p.rings} rings`,
  note: (p, run) => `run ${run} — ${p.disorder}%`,
  description:
    'A strict grid of concentric squares, disturbed by a measured dose of chance. Molnar called it her “1 % de désordre”: a small error injected on purpose to unsettle the system. Here every square trembles by the <b>Disorder</b> percentage, and now and then one breaks loose entirely. Push it from 0 to 30 and watch order give way, one percent at a time.',
});
