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

import { magicSquare, MELENCOLIA, brokenPolygon, hatchRect, bentPts, BENDS, squarePts } from '../src/engine';

describe('magic squares', () => {
  it.each([3, 4, 5, 6, 7, 8, 9, 10])('order %i is magic and uses 1..n² once', (n) => {
    const m = magicSquare(n), sum = (n * (n * n + 1)) / 2;
    expect(new Set(m.flat())).toEqual(new Set(Array.from({ length: n * n }, (_, i) => i + 1)));
    for (let i = 0; i < n; i++) {
      expect(m[i]!.reduce((a, b) => a + b, 0)).toBe(sum);
      expect(m.reduce((a, r) => a + r[i]!, 0)).toBe(sum);
    }
    expect(m.reduce((a, r, i) => a + r[i]!, 0)).toBe(sum);
    expect(m.reduce((a, r, i) => a + r[n - 1 - i]!, 0)).toBe(sum);
  });
  it('order 4 is Dürer’s square', () => expect(magicSquare(4)).toEqual(MELENCOLIA));
});

describe('shapes', () => {
  const sq = squarePts(0, 0, 10);
  it('brokenPolygon: all sides kept → one closed stroke', () => {
    const ps = brokenPolygon(sq, [true, true, true, true]);
    expect(ps).toHaveLength(1);
    expect(ps[0]!.closed).toBe(true);
    expect(ps[0]!.pts).toHaveLength(4);
  });
  it('brokenPolygon: one side missing → one open stroke over three sides', () => {
    const ps = brokenPolygon(sq, [true, false, true, true]);
    expect(ps).toHaveLength(1);
    expect(ps[0]!.closed).toBe(false);
    expect(ps[0]!.pts).toEqual([sq[2], sq[3], sq[0], sq[1]]);
  });
  it('brokenPolygon: opposite sides missing → two strokes', () => {
    expect(brokenPolygon(sq, [true, false, true, false])).toHaveLength(2);
  });
  it('hatchRect keeps every line inside the rectangle', () => {
    for (const a of [0, Math.PI / 2, Math.PI / 4, -Math.PI / 4, 0.3]) {
      const ls = hatchRect(10, 20, 50, 30, a, 7);
      expect(ls).toHaveLength(7);
      for (const l of ls) for (const [x, y] of l.pts) {
        expect(x).toBeGreaterThanOrEqual(10 - 1e-9); expect(x).toBeLessThanOrEqual(60 + 1e-9);
        expect(y).toBeGreaterThanOrEqual(20 - 1e-9); expect(y).toBeLessThanOrEqual(50 + 1e-9);
      }
    }
  });
  it('bentPts ends exactly at b and leaves straight parts straight', () => {
    const pts = bentPts([0, 0], [100, 0], BENDS.parabola, 10, 0.2, 0.8, 10);
    expect(pts[0]).toEqual([20, 0]);
    expect(pts[pts.length - 1]).toEqual([100, 0]);
    expect(Math.max(...pts.map((p) => Math.abs(p[1])))).toBeCloseTo(10, 5);
  });
});
