import { draw, rect } from '../engine';
import { defineJob } from './types';

export default defineJob({
  no: '0009',
  title: 'Systeme 9',
  technique: 'recursive rectangle division',
  seed: 1972,
  params: [
    { key: 'depth', label: 'Depth', min: 1, max: 9, default: 5 },
    { key: 'stop', label: 'Early stop', min: 0, max: 60, default: 25, unit: '%' },
    { key: 'balance', label: 'Cut range', min: 0, max: 40, default: 20, unit: '%' },
    { key: 'gap', label: 'Gap', min: 0, max: 16, default: 6 },
    { key: 'share', label: 'Pen 2 share', min: 0, max: 60, default: 12, unit: '%' },
  ],
  generate(p, R, plot) {
    const g = p.gap! / 2, b = p.balance! / 100;
    const split = (x: number, y: number, w: number, h: number, depth: number) => {
      if (depth === 0 || (w < 60 && h < 60) || (depth < p.depth! - 2 && R.chance(p.stop! / 100))) {
        draw(plot, R.chance(p.share! / 100) ? 2 : 1, rect(x + g, y + g, w - 2 * g, h - 2 * g));
        return;
      }
      const t = R.between(0.5 - b, 0.5 + b);
      if (w > h) { split(x, y, w * t, h, depth - 1); split(x + w * t, y, w * (1 - t), h, depth - 1); }
      else { split(x, y, w, h * t, depth - 1); split(x, y + h * t, w, h * (1 - t), depth - 1); }
    };
    split(12, 12, 376, 376, p.depth!);
  },
  label: (p) => `a square divided into rectangles, ${p.depth} levels deep`,
  caption: (p) => `depth ${p.depth} · gap ${p.gap}`,
  description:
    'Cut the sheet in two, then cut each half, and so on — always across the longer side, never quite in the middle. A system with one rule produces a whole architecture of rooms.',
});
