import { draw, path, type Pt } from '../engine';
import { defineJob } from './types';

const bump = (x: number, c: number, w: number) => Math.exp(-(((x - c) / w) ** 2));

export default defineJob({
  no: '0003',
  title: 'Contoured Landscape',
  technique: 'stacked contour lines',
  seed: 1970,
  params: [
    { key: 'lines', label: 'Lines', min: 8, max: 70, default: 34 },
    { key: 'relief', label: 'Relief', min: 0, max: 80, default: 36 },
    { key: 'swell', label: 'Swell', min: 1, max: 20, default: 5 },
    { key: 'tremble', label: 'Tremble', min: 0, max: 40, default: 6, show: (v) => (v / 10).toFixed(1) },
  ],
  // the whole landscape is drawn with pen 2
  generate(p, R, plot) {
    const rows = p.lines!, relief = p.relief!, tremble = p.tremble! / 10;
    const peakA = R.between(200, 290), widthA = R.between(60, 90);
    const peakB = R.between(80, 140), widthB = R.between(30, 50);
    const top = 40, spacing = 330 / rows;
    for (let r = 0; r < rows; r++) {
      const pts: Pt[] = [];
      for (let x = 0; x <= 400; x += 10) {
        const h = relief * bump(x, peakA, widthA) * Math.sin(r / p.swell!) + (relief * 0.45) * bump(x, peakB, widthB);
        pts.push([x, top + r * spacing - Math.max(0, h) + R.jitter(tremble)]);
      }
      draw(plot, 2, path(pts));
    }
  },
  label: (p) => `${p.lines} contour lines forming a landscape, relief ${p.relief}`,
  caption: (p) => `${p.lines} lines · relief ${p.relief}`,
  description:
    'Horizontal lines, one under the next, pushed up where a hill should be. Nothing but a stack of rows — yet the eye reads terrain. Drawn entirely with pen 2. A fuller port of the earlier contour-landscape sketch is planned.',
});
