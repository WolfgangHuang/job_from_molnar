// Re-order strokes so the plotter pen travels less while lifted.
// Greedy nearest neighbour; open paths may be drawn backwards.
import { dist, endOf, startOf, type Path, type Pt } from './geom';
import type { Plot } from './plot';

export function orderPaths(paths: Path[], from: Pt = [0, 0]): Path[] {
  const left = paths.slice();
  const out: Path[] = [];
  let at = from;
  while (left.length) {
    let best = 0, bestD = Infinity, flip = false;
    for (let i = 0; i < left.length; i++) {
      const p = left[i]!;
      const d = dist(at, startOf(p));
      if (d < bestD) { bestD = d; best = i; flip = false; }
      if (!p.closed) {
        const e = dist(at, endOf(p));
        if (e < bestD) { bestD = e; best = i; flip = true; }
      }
    }
    const p = left.splice(best, 1)[0]!;
    const q = flip ? { pts: p.pts.slice().reverse(), closed: false } : p;
    out.push(q);
    at = endOf(q);
  }
  return out;
}

export function optimizePlot(plot: Plot): Plot {
  return { ...plot, pens: { 1: orderPaths(plot.pens[1]), 2: orderPaths(plot.pens[2]) } };
}
