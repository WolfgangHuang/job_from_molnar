import { clamp, draw, path, type Pt } from '../engine';
import { defineJob } from './types';

export default defineJob({
  no: '0011',
  title: 'Zufall 11',
  technique: 'one random orthogonal line',
  seed: 1977,
  params: [
    { key: 'steps', label: 'Steps', min: 10, max: 600, step: 10, default: 140 },
    { key: 'reach', label: 'Max step', min: 10, max: 120, default: 44 },
    { key: 'margin', label: 'Margin', min: 0, max: 120, default: 20 },
  ],
  // one single line, drawn with pen 2
  generate(p, R, plot) {
    const lo = p.margin!, hi = 400 - p.margin!, minStep = p.reach! * 0.18;
    let x = 200, y = 200;
    const pts: Pt[] = [[x, y]];
    for (let m = 0; m < p.steps!; m++) {
      if (m % 2 === 0) x = clamp(x + R.sign() * R.between(minStep, p.reach!), lo, hi);
      else y = clamp(y + R.sign() * R.between(minStep, p.reach!), lo, hi);
      pts.push([x, y]);
    }
    draw(plot, 2, path(pts));
  },
  label: (p) => `a single line taking ${p.steps} random right-angled steps`,
  caption: (p) => `${p.steps} steps · reach ${p.reach}`,
  description:
    'One line, never lifted. At every step it turns ninety degrees and runs on for a random distance — left or right, up or down, decided by the dice. The walls of the sheet are the only rule.',
});
