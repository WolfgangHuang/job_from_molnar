import { draw, line } from '../engine';
import { SRC } from './sources';
import { defineJob } from './types';

// After "Saccades" (1977–79), following the parameters given by the DAM: lines per sheet
// (16, 31, 38, 61), length of the saccade (1 to 46 mm) and its location on the line.

const MM = 400 / 250; // the sheet is read as 250 mm wide

export default defineJob({
  no: '0011',
  title: 'Saccades',
  technique: 'horizontal lines, interrupted',
  reference: 'Saccades, 1977–79 — plotter drawings',
  sources: [SRC.damSaccades],
  seed: 1977,
  params: [
    { key: 'lines', label: 'Lines', min: 4, max: 80, default: 31 },
    { key: 'gap', label: 'Saccade up to', min: 1, max: 46, default: 46, unit: ' mm' },
    { key: 'field', label: 'Field width', min: 10, max: 100, default: 55, unit: '%' },
    { key: 'rows', label: 'Field height', min: 10, max: 100, default: 60, unit: '%' },
    { key: 'bias', label: 'Placement', min: 0, max: 100, default: 50, show: (v) => (v ? `log ${v}%` : 'even') },
    { key: 'share', label: 'Pen 2 share', min: 0, max: 60, default: 0, unit: '%' },
  ],
  generate(p, R, plot) {
    const n = p.lines!, left = 20, right = 380, top = 30, bottom = 370;
    const fw = (right - left) * (p.field! / 100), fh = (bottom - top) * (p.rows! / 100);
    const fx = 200 - fw / 2, fy = 200 - fh / 2;
    for (let r = 0; r < n; r++) {
      const y = n > 1 ? top + ((bottom - top) * r) / (n - 1) : 200;
      const pen = R.chance(p.share! / 100) ? 2 : 1;
      if (y < fy || y > fy + fh) { draw(plot, pen, line([left, y], [right, y])); continue; }
      // the saccade: a blank of random length, its location drawn on a logarithmic scale
      const g = Math.min(fw, R.between(1, p.gap!) * MM);
      const u = R.next(), b = p.bias! / 100;
      const pos = (1 - b) * u + b * (Math.log1p(u * (Math.E - 1)));
      const g0 = fx + pos * (fw - g);
      draw(plot, pen, line([left, y], [g0, y]), line([g0 + g, y], [right, y]));
    }
  },
  strokes: (p) => (p.lines! > 50 ? [0.6, 0.9] : [0.85, 1.3]),
  label: (p) => `${p.lines} horizontal lines, interrupted in a central field by gaps of up to ${p.gap} mm`,
  caption: (p) => `${p.lines} lines · ≤ ${p.gap} mm`,
  description:
    'Horizontal lines; in a rectangle at the centre of the sheet, each one is interrupted by a blank of random length — the <i>saccade</i>, like the jump of the eye while reading. Molnar varied three parameters: the number of lines per sheet (16, 31, 38 or 61), the length of the saccade (1 to 46 mm) and its location on the line, chosen on a logarithmic scale with random numbers.',
});
