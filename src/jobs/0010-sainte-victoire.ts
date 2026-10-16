import { draw, path, type Pt } from '../engine';
import { SRC } from './sources';
import { defineJob } from './types';

// After "Variations Sainte-Victoire" (1989–96): the Gaussian curve read as the silhouette
// of Cézanne's mountain, repeated with variations ("déportées vers la droite").

export default defineJob({
  no: '0010',
  title: 'Sainte-Victoire',
  technique: 'variations of a Gaussian curve',
  reference: 'Variations Sainte-Victoire, 1989–96 — series of 13 prints, 28 × 40 cm',
  sources: [SRC.damVictoire, SRC.pompidou],
  seed: 1996,
  params: [
    { key: 'curves', label: 'Curves', min: 1, max: 40, default: 13 },
    { key: 'drift', label: 'Drift right', min: 0, max: 100, default: 35, unit: '%' },
    { key: 'width', label: 'Width', min: 20, max: 100, default: 50 },
    { key: 'height', label: 'Height', min: 20, max: 100, default: 70, unit: '%' },
    { key: 'vertices', label: 'Vertices', min: 5, max: 80, default: 18 },
    { key: 'tremble', label: 'Tremble', min: 0, max: 20, default: 3 },
    { key: 'tears', label: 'Tears', min: 0, max: 40, default: 4, unit: '%' },
  ],
  generate(p, R, plot) {
    const n = p.curves!, base = 300, H = 220 * (p.height! / 100), sigma = p.width!;
    for (let c = 0; c < n; c++) {
      const t = n > 1 ? c / (n - 1) : 0;
      // each variation drifts a little further to the right and sinks a little
      const mu = 160 + t * 160 * (p.drift! / 100) + R.jitter(4);
      const sink = t * 40;
      let pts: Pt[] = [];
      const flush = () => { if (pts.length > 1) draw(plot, c === 0 ? 2 : 1, path(pts)); pts = []; };
      const v = p.vertices!;
      for (let i = 0; i <= v; i++) {
        const x = 20 + (360 * i) / v;
        const y = base + sink - H * Math.exp(-(((x - mu) / sigma) ** 2) / 2) + R.jitter(p.tremble!);
        pts.push([x, y]);
        // a tear: the line stops and starts again a little further on
        if (i > 0 && i < v && R.chance(p.tears! / 100)) { flush(); pts.push([x, y]); pts = []; }
      }
      flush();
    }
  },
  label: (p) => `${p.curves} Gaussian curves like a mountain silhouette, drifting to the right`,
  caption: (p) => `${p.curves} curves · ${p.vertices} vertices`,
  note: (p, run) => `run ${run} — ${p.drift}% →`,
  description:
    'Molnar found the Gaussian bell curve in a book first — and later recognised it from a window in Aix as the silhouette of Mont Sainte-Victoire, the mountain Cézanne painted again and again. Her variations repeat the curve, shift it, break it. The first curve here is drawn with pen 2; each following one drifts to the right.',
});
