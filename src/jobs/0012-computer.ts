import { draw, path, type Pt } from '../engine';
import { defineJob } from './types';

export default defineJob({
  no: '0012',
  title: 'Computer 12',
  technique: 'machine handwriting',
  reference: 'Lettres à ma mère, 1981–90 (handwriting imitated by program)',
  seed: 1981,
  params: [
    { key: 'lines', label: 'Lines', min: 2, max: 28, default: 12 },
    { key: 'height', label: 'Letter height', min: 4, max: 24, default: 10 },
    { key: 'pace', label: 'Pace', min: 4, max: 24, default: 7 },
    { key: 'words', label: 'Word breaks', min: 0, max: 30, default: 8, unit: '%' },
    { key: 'slant', label: 'Slant', min: -30, max: 30, default: 0, unit: '°' },
  ],
  generate(p, R, plot) {
    const rows = p.lines!, lead = 340 / rows, sl = Math.tan((p.slant! * Math.PI) / 180);
    const hMin = p.height! * 0.6, step = p.pace! / 2;
    for (let r = 0; r < rows; r++) {
      const y = 30 + lead * (r + 0.7);
      let x = 24, pts: Pt[] = [];
      while (x < 376) {
        pts.push([x, y + R.jitter(2)]); x += R.between(step * 0.6, step * 1.4);
        const h = R.between(hMin, p.height!);
        pts.push([x + h * sl, y - h]); x += R.between(step * 0.6, step * 1.4);
        if (R.chance(p.words! / 100)) { draw(plot, 1, path(pts)); pts = []; x += R.between(8, 18); }
      }
      if (pts.length > 1) draw(plot, 1, path(pts));
    }
  },
  label: (p) => `${p.lines} lines of zigzag strokes imitating handwriting`,
  caption: (p) => `${p.lines} lines · height ${p.height}`,
  description:
    'Lines of writing that cannot be read: up-strokes and down-strokes in an even rhythm, broken now and then into words. It is the gesture of handwriting with the meaning taken out — what a machine keeps when it copies a hand.',
});
