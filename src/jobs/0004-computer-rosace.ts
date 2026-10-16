import { BENDS, bentPts, brokenPolygon, draw, squarePts, type Bend, type Pt } from '../engine';
import { SRC } from './sources';
import { defineJob } from './types';

// After "Computer-rosace" (1974), Leonardo 1975 Fig. 4: one large set of concentric squares
// in which parts of the straight sides are replaced by segments of parabolas and sine curves.

export default defineJob({
  no: '0004',
  title: 'Computer-Rosace',
  technique: 'concentric squares, bent sides',
  reference: 'Computer-rosace, 1974 — computer drawings, 25 × 25 cm',
  sources: [SRC.leonardo1975],
  seed: 1974,
  params: [
    { key: 'rings', label: 'Squares', min: 3, max: 30, default: 16 },
    { key: 'parabola', label: 'Parabolas', min: 0, max: 100, default: 25, unit: '%' },
    { key: 'sine', label: 'Sine curves', min: 0, max: 100, default: 25, unit: '%' },
    { key: 'waves', label: 'Waves', min: 1, max: 8, default: 2 },
    { key: 'amp', label: 'Amplitude', min: 0, max: 300, default: 70, unit: '%' },
    { key: 'deform', label: 'Deformation', min: 0, max: 100, default: 10, unit: '%' },
    { key: 'share', label: 'Pen 2 share', min: 0, max: 60, default: 0, unit: '%' },
  ],
  thumbnail: { rings: 14, amp: 90 },
  generate(p, R, plot) {
    const n = p.rings!, gap = 180 / n;
    for (let m = 1; m <= n; m++) {
      const h = m * gap;
      const corners = squarePts(200, 200, h).map(([x, y]): Pt => [
        x + R.jitter((p.deform! / 100) * gap * 0.5),
        y + R.jitter((p.deform! / 100) * gap * 0.5),
      ]);
      // per side: straight, a parabola, or a sine curve on part of its length
      const sides = corners.map(() => {
        const r = R.next() * 100;
        const bend: Bend | null = r < p.parabola! ? BENDS.parabola : r < p.parabola! + p.sine! ? BENDS.sine(p.waves!) : null;
        const t0 = R.between(0, 0.45), t1 = R.between(0.55, 1);
        // outward (−) or inward (+) relative to the clockwise side direction
        const amp = (p.amp! / 100) * gap * R.sign() * (t1 - t0);
        return { bend, t0, t1, amp };
      });
      const pen = R.chance(p.share! / 100) ? 2 : 1;
      draw(plot, pen, ...brokenPolygon(corners, [true, true, true, true], (i, a, b) => {
        const s = sides[i]!;
        return s.bend ? bentPts(a, b, s.bend, s.amp, s.t0, s.t1, 18 * p.waves!) : [b];
      }));
    }
  },
  label: (p) => `${p.rings} concentric squares; ${p.parabola}% of the sides bent into parabolas, ${p.sine}% into sine curves`,
  caption: (p) => `${p.rings} squares · ${p.waves} waves`,
  note: (p, run) => `run ${run} — ${p.amp}%`,
  description:
    'One set of concentric squares, with parts of their sides replaced by segments of parabolas and sine curves. In 1975 Molnar described exactly this experiment: the straight version looked “indifferent” to her, parabolas improved it, sine segments more so — but too many waves, too large, and the picture became “disappointing”. Find the tipping point with <b>Waves</b> and <b>Amplitude</b>.',
});
