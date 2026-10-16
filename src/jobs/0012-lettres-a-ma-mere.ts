import { draw, path, type Pt } from '../engine';
import { SRC } from './sources';
import { defineJob } from './types';

export default defineJob({
  no: '0012',
  title: 'Lettres à ma mère',
  technique: 'machine handwriting',
  reference: 'Lettres à ma mère, 1981–90',
  sources: [SRC.damArtist],
  seed: 1981,
  params: [
    { key: 'lines', label: 'Lines', min: 2, max: 28, default: 12 },
    { key: 'height', label: 'Letter height', min: 4, max: 24, default: 11 },
    { key: 'pace', label: 'Pace', min: 4, max: 24, default: 8 },
    { key: 'round', label: 'Roundness', min: 0, max: 100, default: 60, unit: '%' },
    { key: 'loops', label: 'Loops', min: 0, max: 60, default: 12, unit: '%' },
    { key: 'words', label: 'Word breaks', min: 0, max: 30, default: 9, unit: '%' },
    { key: 'slant', label: 'Slant', min: -30, max: 30, default: 12, unit: '°' },
  ],
  generate(p, R, plot) {
    const rows = p.lines!, lead = 340 / rows, sl = Math.tan((p.slant! * Math.PI) / 180);
    const round = p.round! / 100, H = p.height!;
    for (let r = 0; r < rows; r++) {
      const y0 = 30 + lead * (r + 0.75);
      let x = 24 + R.between(0, 12), pts: Pt[] = [];
      // the hand drifts a little off the ruled line
      const tilt = R.jitter(0.012);
      const at = (px: number, py: number): Pt => [px + (y0 - py) * sl, py + (px - 24) * tilt];
      while (x < 372) {
        const w = R.between(p.pace! * 0.7, p.pace! * 1.3), h = R.between(H * 0.5, H);
        if (R.chance(p.loops! / 100)) {
          // a tall loop, like an l
          const lh = h * 1.8;
          for (let s = 0; s <= 10; s++) {
            const a = (s / 10) * Math.PI * 2;
            pts.push(at(x + w * 0.5 + Math.sin(a) * w * 0.35, y0 - (lh / 2) * (1 - Math.cos(a))));
          }
        } else {
          // one stroke: down-up as a zigzag or a garland, blended by roundness
          for (let s = 0; s <= 6; s++) {
            const u = s / 6;
            const zig = u < 0.5 ? 1 - u * 2 : (u - 0.5) * 2; // 1 → 0 → 1
            const garland = 1 - Math.sin(u * Math.PI);
            const k = round * garland + (1 - round) * zig;
            pts.push(at(x + w * u, y0 - h * k));
          }
        }
        x += w;
        if (R.chance(p.words! / 100)) {
          if (pts.length > 1) draw(plot, 1, path(pts));
          pts = [];
          x += R.between(8, 18);
        }
      }
      if (pts.length > 1) draw(plot, 1, path(pts));
    }
  },
  label: (p) => `${p.lines} lines of unreadable, handwriting-like strokes`,
  caption: (p) => `${p.lines} lines · height ${p.height}`,
  description:
    'When her mother stopped writing to her, Molnar wrote the letters herself — with a program that imitated her mother’s handwriting. What comes out cannot be read: up-strokes and down-strokes, garlands, loops, broken now and then into words. The gesture of a hand, with the meaning taken out.',
});
