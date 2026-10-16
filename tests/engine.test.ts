import { describe, expect, it } from 'vitest';
// generators.js from the design handoff is the reference implementation for job 0001 and the hero
import { onePercentDisorder, buildStartPage } from './fixtures/handoff-generators.js';
import { jobs, jobByNo, runJob, defaults, sanitize } from '../src/jobs';
import { hero } from '../src/jobs/hero';
import { pathData, toSVGString, optimizePlot, stats } from '../src/engine';

describe('job 0001 matches the design prototype', () => {
  const job = jobByNo('0001')!;
  it.each([
    {},
    { grid: 10, rings: 14, disorder: 30, rotation: 45, share: 60, seed: 1970 },
    { grid: 1, rings: 1, disorder: 0, rotation: 90, share: 0, seed: 7 },
  ])('params %o', (params) => {
    const { seed = 1968, ...p } = params as Record<string, number>;
    const ref = onePercentDisorder({ ...p, seed });
    const plot = runJob(job, p, seed);
    expect(pathData(plot.pens[1])).toBe(ref.d);
    expect(pathData(plot.pens[2])).toBe(ref.d2);
  });
});

describe('hero matches the design prototype', () => {
  it('is identical to buildStartPage().hero (scaled 1:1, viewBox 400)', () => {
    const ref = buildStartPage().hero;
    const plot = hero();
    expect(pathData(plot.pens[1])).toBe(ref.d);
    expect(pathData(plot.pens[2])).toBe(ref.d2);
  });
});

describe('all jobs', () => {
  it('have unique four-digit numbers', () => {
    const nos = jobs.map((j) => j.no);
    expect(new Set(nos).size).toBe(nos.length);
    nos.forEach((n) => expect(n).toMatch(/^\d{4}$/));
  });

  it.each(jobs.map((j) => [j.no, j] as const))('job %s is deterministic and finite at min, default and max', (_, job) => {
    const at = (pick: 'min' | 'max') => Object.fromEntries(job.params.map((d) => [d.key, d[pick]]));
    for (const p of [at('min'), defaults(job), at('max'), job.thumbnail ?? {}]) {
      const a = runJob(job, p), b = runJob(job, p);
      expect(pathData(a.pens[1]) + pathData(a.pens[2])).toBe(pathData(b.pens[1]) + pathData(b.pens[2]));
      for (const pen of [1, 2] as const)
        for (const path of a.pens[pen]) for (const [x, y] of path.pts) {
          expect(Number.isFinite(x) && Number.isFinite(y)).toBe(true);
        }
    }
    // the default run draws something
    const plot = runJob(job);
    expect(plot.pens[1].length + plot.pens[2].length).toBeGreaterThan(0);
    // param texts render
    expect(job.label(defaults(job))).not.toMatch(/undefined|NaN/);
    expect(job.caption(defaults(job))).not.toMatch(/undefined|NaN/);
  });
});

describe('params', () => {
  it('clamps, snaps and drops unknown keys', () => {
    const job = jobByNo('0001')!;
    expect(sanitize(job, { grid: 99, disorder: -4, rings: 3.4, bogus: 1 })).toEqual({
      grid: 10, rings: 3, disorder: 0, rotation: 0, share: 4,
    });
  });
});

describe('export', () => {
  it('writes one Inkscape layer per pen with physical size', () => {
    const plot = runJob(jobByNo('0001')!, { share: 30 });
    const svg = toSVGString(plot, {
      pens: { 1: { color: '#000', width: 0.85 }, 2: { color: '#f00', width: 1.3 } },
      physicalWidth: '200mm', physicalHeight: '200mm',
    });
    expect(svg).toContain('width="200mm"');
    expect(svg).toContain('inkscape:label="1 pen 1"');
    expect(svg).toContain('inkscape:label="2 pen 2"');
    expect(svg.match(/<path /g)!.length).toBe(plot.pens[1].length + plot.pens[2].length);
  });

  it('path optimisation keeps every stroke and cuts pen-up travel', () => {
    const plot = runJob(jobByNo('0006')!);
    const opt = optimizePlot(plot);
    expect(opt.pens[1].length).toBe(plot.pens[1].length);
    expect(stats(opt, 1).travel).toBeLessThan(stats(plot, 1).travel);
  });
});
