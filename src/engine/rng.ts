// Seeded randomness. Same seed => same drawing, on every machine.
// LCG s = s·1664525 + 1013904223 (mod 2^32), as in the design prototype.

export type Rng = () => number;

export function lcg(seed = 1968): Rng {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Convenience wrapper with the helpers every generator needs. */
export interface Chance {
  /** raw value in [0, 1) */
  next: Rng;
  /** uniform in [a, b) */
  between(a: number, b: number): number;
  /** uniform in [-j, j) */
  jitter(j: number): number;
  /** true with probability p (0–1) */
  chance(p: number): boolean;
  /** -1 or +1 */
  sign(): number;
  /** integer in [a, b] */
  int(a: number, b: number): number;
  pick<T>(xs: readonly T[]): T;
  shuffle<T>(xs: T[]): T[];
}

export function chance(seed: number): Chance {
  const next = lcg(seed);
  return {
    next,
    between: (a, b) => a + next() * (b - a),
    jitter: (j) => (next() * 2 - 1) * j,
    chance: (p) => next() < p,
    sign: () => (next() < 0.5 ? -1 : 1),
    int: (a, b) => a + Math.floor(next() * (b - a + 1)),
    pick: (xs) => xs[Math.floor(next() * xs.length)]!,
    shuffle(xs) {
      for (let i = xs.length - 1; i > 0; i--) {
        const k = Math.floor(next() * (i + 1));
        [xs[i], xs[k]] = [xs[k]!, xs[i]!];
      }
      return xs;
    },
  };
}
