// A job describes one artwork: its parameters and the algorithm that plots it.
// Everything else (start-page tile, menu entry, detail page, parameter slip,
// URL state, export file names) is derived from this description.
import { chance, newPlot, type Chance, type Plot } from '../engine';

export type Params = Record<string, number>;

export interface ParamDef {
  key: string;
  label: string;
  min: number;
  max: number;
  step?: number;
  default: number;
  /** appended to the value on the slip, e.g. "%" or "°" */
  unit?: string;
  /** custom display, e.g. 6 → "6×6" */
  show?: (v: number) => string;
}

export interface Source {
  label: string;
  url?: string;
}

export interface JobDef {
  /** four digits, e.g. "0001" */
  no: string;
  title: string;
  /** short technical description for the subline, e.g. "concentric squares" */
  technique: string;
  /** the original work this job is after (shown on the detail page) */
  reference?: string;
  /** where the facts in the description come from */
  sources?: Source[];
  /** default seed; "Re-run job" counts up from here */
  seed: number;
  params: ParamDef[];
  /** parameter overrides for the start-page tile */
  thumbnail?: Params;
  /** viewBox size of the plot (square). Defaults to 400. */
  size?: number;
  /** the algorithm: draw into `plot` using only `R` for randomness */
  generate(p: Params, R: Chance, plot: Plot): void;
  /** stroke widths [pen 1, pen 2] in viewBox units at size 400 */
  strokes?(p: Params): [number, number];
  /** accessible description of a run, e.g. "6 by 6 concentric squares, 1% disorder" */
  label(p: Params): string;
  /** small caps line under the plot, e.g. "6×6 · 7 rings" */
  caption(p: Params): string;
  /** pencil note under the plot */
  note?(p: Params, run: number): string;
  /** paragraph(s) for the detail page, may contain simple HTML (<b>, <i>) */
  description: string;
}

export const defineJob = (job: JobDef) => job;

export const DEFAULT_STROKES: [number, number] = [0.85, 1.3];
/** Thumbnail strokes from the prototype (0.75 / 1.1 in a 200 viewBox), in 400 units. */
export const THUMB_STROKES: [number, number] = [1.5, 2.2];

export function defaults(job: JobDef): Params {
  return Object.fromEntries(job.params.map((d) => [d.key, d.default]));
}

/** Clamp and snap values to the parameter definitions; unknown keys are dropped. */
export function sanitize(job: JobDef, input: Partial<Params>): Params {
  const out = defaults(job);
  for (const d of job.params) {
    const v = input[d.key];
    if (typeof v !== 'number' || !Number.isFinite(v)) continue;
    const step = d.step ?? 1;
    const snapped = Math.round((v - d.min) / step) * step + d.min;
    out[d.key] = Math.min(d.max, Math.max(d.min, +snapped.toFixed(6)));
  }
  return out;
}

export function runJob(job: JobDef, params: Partial<Params> = {}, seed = job.seed): Plot {
  const p = sanitize(job, params);
  const plot = newPlot(job.size ?? 400);
  job.generate(p, chance(seed), plot);
  return plot;
}

export function showParam(d: ParamDef, v: number): string {
  return d.show ? d.show(v) : `${v}${d.unit ?? ''}`;
}
