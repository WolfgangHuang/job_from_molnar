// A Plot is the output of a job: a sheet size and, per pen, a list of strokes.
// Pen 1 is black ink, pen 2 the accent colour.
import { dist, endOf, length, startOf, type Path } from './geom';

export type PenId = 1 | 2;

export interface Plot {
  width: number;
  height: number;
  pens: Record<PenId, Path[]>;
}

export function newPlot(width: number, height = width): Plot {
  return { width, height, pens: { 1: [], 2: [] } };
}

export function draw(plot: Plot, pen: PenId, ...paths: Path[]): Plot {
  plot.pens[pen].push(...paths);
  return plot;
}

export const isEmpty = (plot: Plot, pen: PenId) => plot.pens[pen].length === 0;

/** Which pens actually carry ink, e.g. "Pen 1+2". */
export function pensLabel(plot: Plot): string {
  const a = !isEmpty(plot, 1), b = !isEmpty(plot, 2);
  return a && b ? 'Pen 1+2' : b ? 'Pen 2' : 'Pen 1';
}

export interface PlotStats {
  strokes: number;
  drawn: number;
  travel: number;
}

/** Pen-down length and pen-up travel, per pen in drawing order (useful for plotter output). */
export function stats(plot: Plot, pen: PenId): PlotStats {
  const ps = plot.pens[pen];
  let drawn = 0, travel = 0;
  ps.forEach((p, i) => {
    drawn += length(p);
    if (i > 0) travel += dist(endOf(ps[i - 1]!), startOf(p));
  });
  return { strokes: ps.length, drawn, travel };
}
