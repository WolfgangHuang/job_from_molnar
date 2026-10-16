// Magic squares: every row, column and diagonal has the same sum.
// Order 4 defaults to the square from Dürer's "Melencolia I" (1514).

export const MELENCOLIA = [
  [16, 3, 2, 13],
  [5, 10, 11, 8],
  [9, 6, 7, 12],
  [4, 15, 14, 1],
];

/** Siamese method (odd orders). */
function odd(n: number): number[][] {
  const m = Array.from({ length: n }, () => Array<number>(n).fill(0));
  let i = 0, j = Math.floor(n / 2);
  for (let v = 1; v <= n * n; v++) {
    m[i]![j] = v;
    const ni = (i - 1 + n) % n, nj = (j + 1) % n;
    if (m[ni]![nj]) i = (i + 1) % n;
    else { i = ni; j = nj; }
  }
  return m;
}

/** Doubly even orders (4, 8, 12 …). */
function doublyEven(n: number): number[][] {
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => {
      const v = i * n + j + 1;
      return i % 4 === j % 4 || (i % 4) + (j % 4) === 3 ? n * n + 1 - v : v;
    }),
  );
}

/** Singly even orders (6, 10 …), Strachey's method. */
function singlyEven(n: number): number[][] {
  const h = n / 2, sub = odd(h), q = h * h;
  const m = Array.from({ length: n }, () => Array<number>(n).fill(0));
  for (let i = 0; i < h; i++) for (let j = 0; j < h; j++) {
    const v = sub[i]![j]!;
    m[i]![j] = v; m[i + h]![j + h] = v + q; m[i]![j + h] = v + 2 * q; m[i + h]![j] = v + 3 * q;
  }
  const k = (n - 2) / 4;
  for (let i = 0; i < h; i++) {
    const cols: number[] = [];
    for (let j = 0; j < k; j++) cols.push(i === Math.floor(h / 2) ? j + 1 : j);
    for (let j = n - k + 1; j < n; j++) cols.push(j);
    for (const j of cols) [m[i]![j], m[i + h]![j]] = [m[i + h]![j]!, m[i]![j]!];
  }
  return m;
}

export function magicSquare(n: number): number[][] {
  if (n === 4) return MELENCOLIA.map((r) => r.slice());
  if (n % 2 === 1) return odd(n);
  if (n % 4 === 0) return doublyEven(n);
  return singlyEven(n);
}
