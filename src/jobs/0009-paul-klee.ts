import { draw, hatchRect, rect } from '../engine';
import { SRC } from './sources';
import { defineJob } from './types';

// After "À la recherche de Paul Klee" (1970–71): a chequerboard of squares, each filled with
// vertical, horizontal or diagonal lines, as in Klee's "Variations (Progressive Motif)", 1927.

const ANGLES = [Math.PI / 2, 0, Math.PI / 4, -Math.PI / 4]; // |  —  /  \

export default defineJob({
  no: '0009',
  title: 'À la recherche de Paul Klee',
  technique: 'squares filled with lines',
  reference: 'À la recherche de Paul Klee, 1970–71 — plotter drawing, ink on paper',
  sources: [SRC.damKlee, SRC.studioIntl],
  seed: 1970,
  params: [
    { key: 'grid', label: 'Grid', min: 2, max: 14, default: 7, show: (v) => `${v}×${v}` },
    { key: 'lines', label: 'Lines per square', min: 1, max: 14, default: 5 },
    { key: 'progress', label: 'Progression', min: 0, max: 100, default: 60, unit: '%' },
    { key: 'disrupt', label: 'Disruption', min: 0, max: 100, default: 15, unit: '%' },
    { key: 'frames', label: 'Frames', min: 0, max: 1, default: 1, show: (v) => (v ? 'on' : 'off') },
    { key: 'share', label: 'Pen 2 share', min: 0, max: 60, default: 8, unit: '%' },
  ],
  generate(p, R, plot) {
    const N = p.grid!, cell = 380 / N, pad = cell * 0.08;
    for (let i = 0; i < N; i++) for (let k = 0; k < N; k++) {
      const x = 10 + i * cell + pad, y = 10 + k * cell + pad, w = cell - 2 * pad;
      // the progressive motif: orientation cycles along the diagonals, density grows across the sheet
      let dir = (i + k) % 4;
      let count = Math.max(1, Math.round(p.lines! * (1 - p.progress! / 100 + (p.progress! / 100) * ((i + 1) / N) * 1.4)));
      // disruptions: the rule is broken now and then
      if (R.chance(p.disrupt! / 100)) dir = R.int(0, 3);
      if (R.chance(p.disrupt! / 200)) count = R.int(1, p.lines! + 3);
      const pen = R.chance(p.share! / 100) ? 2 : 1;
      if (p.frames) draw(plot, 1, rect(x, y, w, w));
      draw(plot, pen, ...hatchRect(x, y, w, w, ANGLES[dir]!, count));
      // occasionally a second direction is laid over the first
      if (R.chance(p.disrupt! / 300)) draw(plot, pen, ...hatchRect(x, y, w, w, ANGLES[(dir + 1) % 4]!, count));
    }
  },
  strokes: (p) => (p.grid! > 9 ? [0.6, 0.9] : [0.85, 1.3]),
  label: (p) => `${p.grid} by ${p.grid} squares filled with vertical, horizontal and diagonal lines`,
  caption: (p) => `${p.grid}×${p.grid} · ${p.lines} lines`,
  description:
    'Paul Klee’s <i>Variations (Progressive Motif)</i> of 1927 is a chequerboard of squares filled with vertical, horizontal and diagonal lines. Molnar went looking for the system behind it, working through combinations and permutations of lines within the limited space of a square — and introducing disruptions. Set <b>Progression</b> to 0 for a regular field, or let the density build up across the sheet.',
});
