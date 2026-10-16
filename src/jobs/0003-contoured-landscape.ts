import { draw, path, type Pt } from '../engine';
import { defineJob } from './types';

// Port of the earlier p5.js sketch (contour_landscape.js): one trend-driven random walk,
// smoothed by a moving average, copied to every line; steep stretches compress the
// spacing between lines, like contour lines crowding on a steep slope.

// probability ranges of following the segment's trend, by predictability level 1–5
const PREDICTABILITY: Record<number, [number, number]> = {
  1: [0.1, 0.3], 2: [0.3, 0.5], 3: [0.5, 0.7], 4: [0.7, 0.9], 5: [0.9, 1.0],
};
const TOP = 40, BOTTOM = 360, STEP = 2;

export default defineJob({
  no: '0003',
  title: 'Contoured Landscape',
  technique: 'stacked contour lines',
  seed: 1970,
  params: [
    { key: 'lines', label: 'Lines', min: 4, max: 60, default: 20 },
    { key: 'segments', label: 'Segments', min: 1, max: 12, default: 5 },
    { key: 'predict', label: 'Predictability', min: 1, max: 5, default: 3 },
    { key: 'smooth', label: 'Smoothing', min: 1, max: 15, default: 5 },
    { key: 'depth', label: 'Depth', min: 0, max: 100, default: 45, unit: '%' },
    { key: 'black', label: 'Pen 1 lines', min: 0, max: 100, default: 0, unit: '%' },
  ],
  thumbnail: { lines: 34 },

  generate(p, R, plot) {
    // 1 — the terrain profile: trend segments across the sheet
    const [lo, hi] = PREDICTABILITY[p.predict!]!;
    const segW = 400 / p.segments!;
    const segs = Array.from({ length: p.segments! }, () => ({
      trend: R.chance(0.33) ? -1 : R.chance(0.5) ? 1 : 0, // up (−y), down, straight
      prob: R.between(lo, hi),
    }));
    const raw: number[] = [0];
    for (let x = STEP; x <= 400; x += STEP) {
      const s = segs[Math.min(segs.length - 1, Math.floor(x / segW))]!;
      const dy = R.chance(s.prob) ? s.trend : R.pick([-1, 0, 1]);
      raw.push(raw[raw.length - 1]! + dy * STEP * 0.5);
    }

    // 2 — moving average
    const w = p.smooth!;
    const prof = raw.map((_, i) => {
      const from = Math.max(0, i - w + 1);
      let s = 0;
      for (let k = from; k <= i; k++) s += raw[k]!;
      return s / (i - from + 1);
    });

    // keep the walk on the sheet: centre it and limit its swing
    const mn = Math.min(...prof), mx = Math.max(...prof);
    const mid = (mn + mx) / 2, swing = Math.max(1, (mx - mn) / 2), limit = 110;
    const k = swing > limit ? limit / swing : 1;
    const y0 = prof.map((v) => (v - mid) * k);

    // 3 — local steepness (smoothed), used for the perspective squeeze
    let slope = 0;
    const slopes = y0.map((_, i) => {
      const j = Math.max(0, i - 8);
      const s = i > j ? Math.abs((y0[i]! - y0[j]!) / ((i - j) * STEP)) * 3 : 0;
      slope += 0.08 * (s - slope);
      return slope;
    });

    // 4 — one line per row, all sharing the profile
    const n = p.lines!;
    const blackRows = (p.black! / 100) * n;
    for (let r = 0; r < n; r++) {
      const t = n > 1 ? r / (n - 1) : 0.5;
      const base = TOP + t * (BOTTOM - TOP);
      const mid = (TOP + BOTTOM) / 2;
      const pts: Pt[] = y0.map((v, i) => {
        const comp = Math.max(0.2, Math.min(1, 1 - slopes[i]! * 0.7));
        // steep stretches pull the rows together (the original sketch did this only by ±2.5 px)
        const crowd = Math.max(0.25, 1 - (p.depth! / 100) * slopes[i]!);
        return [i * STEP, mid + (base - mid) * crowd + v * comp];
      });
      // pen 1 for the top rows, pen 2 below; the boundary row is dithered
      const pen = r + R.next() < blackRows ? 1 : 2;
      draw(plot, pen, path(pts));
    }
  },
  label: (p) => `${p.lines} contour lines following one random terrain profile in ${p.segments} segments`,
  caption: (p) => `${p.lines} lines · ${p.segments} segments`,
  note: (p, run) => `run ${run} — level ${p.predict}`,
  description:
    'One random walk across the sheet, nudged up, down or straight on by a handful of trends, then smoothed. Every line follows the same walk; where the land gets steep, the lines crowd together, the way contour lines do on a map. Lower <b>Predictability</b> and the trends lose their grip.',
});
