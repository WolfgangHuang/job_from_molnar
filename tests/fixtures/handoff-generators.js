// Job from Molnar — plot generators
// Plain ES module, no dependencies. Every generator returns SVG path data:
//   { d: string, d2: string }
//   d  = strokes for pen 1 (black)
//   d2 = strokes for pen 2 (accent colour)
// All plots live in a 200×200 viewBox (thumbnails) unless noted.
// Ported 1:1 from the design prototype so output matches the mockups.

// ---------------------------------------------------------------------------
// Seeded PRNG (LCG). Same seed => same drawing.
export function lcg(seed = 1968) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const f = (x) => x.toFixed(1);

export function poly(pts, close = false) {
  return 'M' + pts.map((p) => f(p[0]) + ' ' + f(p[1])).join(' L') + (close ? ' Z' : '');
}

function jitteredSquare(R, cx, cy, h, j) {
  const u = (a, b) => a + R() * (b - a);
  return [
    [cx - h + u(-j, j), cy - h + u(-j, j)],
    [cx + h + u(-j, j), cy - h + u(-j, j)],
    [cx + h + u(-j, j), cy + h + u(-j, j)],
    [cx - h + u(-j, j), cy + h + u(-j, j)],
  ];
}

// ---------------------------------------------------------------------------
// Detail page: "1% Disorder" — parametric, viewBox 0 0 400 400.
// Params (ranges used in the parameter slip):
//   grid     1–10   (default 6)    cells per side
//   rings    1–14   (default 7)    concentric squares per cell
//   disorder 0–30 % (default 1)    jitter amount + chance of a "wild" square
//   rotation 0–90 ° (default 0)    rotation, ramping across the grid diagonal
//   share    0–60 % (default 4)    share of squares drawn with pen 2
//   seed     int    (default 1968) "Re-run job" increments it
export const DISORDER_DEFAULTS = { grid: 6, rings: 7, disorder: 1, rotation: 0, share: 4, seed: 1968 };

export function onePercentDisorder(params = {}) {
  const st = { ...DISORDER_DEFAULTS, ...params };
  const R = lcg(st.seed);
  const u = (j) => (R() * 2 - 1) * j;
  const N = st.grid, cell = 360 / N, d = [], d2 = [];
  for (let i = 0; i < N; i++) for (let k = 0; k < N; k++) {
    const cx = 20 + cell * (i + 0.5), cy = 20 + cell * (k + 0.5);
    const a = (st.rotation * Math.PI / 180) * (N > 1 ? (i + k) / (2 * (N - 1)) : 0);
    const ca = Math.cos(a), sa = Math.sin(a);
    for (let m = 1; m <= st.rings; m++) {
      const h = m * (cell * 0.44 / st.rings);
      const wild = R() < st.disorder * 0.03;
      const j = wild ? cell * 0.07 : st.disorder / 100 * cell * 0.15;
      const pts = [[-h, -h], [h, -h], [h, h], [-h, h]].map(([px, py]) => {
        const x = px + u(j), y = py + u(j);
        return f(cx + x * ca - y * sa) + ' ' + f(cy + x * sa + y * ca);
      });
      (R() < st.share / 100 ? d2 : d).push('M' + pts.join(' L') + ' Z');
    }
  }
  return { d: d.join(' '), d2: d2.join(' ') };
}

// ---------------------------------------------------------------------------
// Start page: hero plot (viewBox 0 0 400 400) and the 12 job thumbnails.
// NOTE: in the prototype all of these share ONE random stream (seed 1968),
// generated in this exact order: hero, then jobs 1..12. buildStartPage()
// reproduces that. If each job later gets its own seed, outputs will change.
export function buildStartPage(seed = 1968) {
  const R = lcg(seed);
  const u = (a, b) => a + R() * (b - a);
  const sq = (cx, cy, h, j) => jitteredSquare(R, cx, cy, h, j);
  let d, d2, pts, x, y;

  // hero: 5×5 concentric squares, order drifting into disorder; one cell in pen 2
  d = []; d2 = [];
  for (let i = 0; i < 5; i++) for (let k = 0; k < 5; k++) {
    const j = Math.pow((i + k) / 8, 2.2) * 9;
    for (let m = 1; m <= 8; m++) {
      const s = poly(sq(40 + i * 80, 40 + k * 80, m * 4.4, j * (0.4 + m / 8)), true);
      (i === 3 && k === 1 ? d2 : d).push(s);
    }
  }
  const hero = { d: d.join(' '), d2: d2.join(' ') };

  const jobs = [];
  // 0001 1% Disorder
  d = [];
  for (let i = 0; i < 4; i++) for (let k = 0; k < 4; k++) for (let m = 1; m <= 5; m++)
    d.push(poly(sq(25 + i * 50, 25 + k * 50, m * 4.2, R() > 0.12 ? 0.5 : 2.4), true));
  jobs.push({ title: '1% Disorder', d: d.join(' '), d2: '' });
  // 0002 (Des)Ordres
  d = []; d2 = [];
  for (let i = 0; i < 3; i++) for (let k = 0; k < 3; k++) for (let m = 1; m <= 8; m++)
    (R() < 0.16 ? d2 : d).push(poly(sq(33 + i * 67, 33 + k * 67, m * 3.7, m * 0.55), true));
  jobs.push({ title: 'De la série (Des)Ordres', d: d.join(' '), d2: d2.join(' ') });
  // 0003 Contoured Landscape (drawn entirely in pen 2)
  d = [];
  for (let r = 0; r < 34; r++) {
    pts = [];
    for (x = 0; x <= 200; x += 5) {
      const h = 18 * Math.exp(-Math.pow((x - 120) / 38, 2)) * Math.sin(r / 5) + 8 * Math.exp(-Math.pow((x - 55) / 20, 2));
      pts.push([x, 20 + r * 5 - Math.max(0, h) + u(-0.6, 0.6)]);
    }
    d.push(poly(pts));
  }
  jobs.push({ title: 'Contoured Landscape', d: d.join(' '), d2: '', allPen2: true });
  // 0004 Chaos 4
  d = []; d2 = [];
  for (let m = 0; m < 30; m++) (m % 7 === 0 ? d2 : d).push(poly(sq(100 + u(-10, 10), 100 + u(-10, 10), 20 + m * 2.6, 14), true));
  jobs.push({ title: 'Chaos 4', d: d.join(' '), d2: d2.join(' ') });
  // 0005 Sequenz 5 — rotation ramp
  d = [];
  for (let i = 0; i < 6; i++) for (let k = 0; k < 6; k++) {
    const a = (i + k) * Math.PI / 40, cx = 17 + i * 33, cy = 17 + k * 33; pts = [];
    for (let m = 0; m < 4; m++) pts.push([cx + 17 * Math.cos(a + m * Math.PI / 2 + Math.PI / 4), cy + 17 * Math.sin(a + m * Math.PI / 2 + Math.PI / 4)]);
    d.push(poly(pts, true));
  }
  jobs.push({ title: 'Sequenz 5', d: d.join(' '), d2: '' });
  // 0006 Matrix 6 — "Interruptions"-style line field with a hole
  d = [];
  for (let i = 0; i < 24; i++) for (let k = 0; k < 24; k++) {
    if (R() < 0.08) continue;
    if (i > 8 && i < 14 && k > 11 && k < 18 && R() < 0.9) continue;
    const b = u(0, Math.PI), px = 8 + i * 8, py = 8 + k * 8;
    d.push('M' + f(px - 5 * Math.cos(b)) + ' ' + f(py - 5 * Math.sin(b)) + ' L' + f(px + 5 * Math.cos(b)) + ' ' + f(py + 5 * Math.sin(b)));
  }
  jobs.push({ title: 'Matrix 6', d: d.join(' '), d2: '' });
  // 0007 Varianten 7 — distorted quadrilaterals
  d = []; d2 = [];
  for (let i = 0; i < 5; i++) for (let k = 0; k < 5; k++) {
    ((i + k) % 4 === 0 ? d2 : d).push(poly(sq(20 + i * 40, 20 + k * 40, 14, 7), true));
    d.push(poly(sq(20 + i * 40, 20 + k * 40, 8, 4), true));
  }
  jobs.push({ title: 'Varianten 7', d: d.join(' '), d2: d2.join(' ') });
  // 0008 Strukturen 8 — path through Dürer's magic square
  const ms = [[16, 3, 2, 13], [5, 10, 11, 8], [9, 6, 7, 12], [4, 15, 14, 1]], pos = {};
  for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) pos[ms[r][k]] = [30 + k * 47, 30 + r * 47];
  d = [];
  for (let m = 0; m < 3; m++) { pts = []; for (let i = 1; i <= 16; i++) pts.push([pos[i][0] + m * 3 - 3, pos[i][1] + m * 3 - 3]); d.push(poly(pts)); }
  pts = []; [1, 2, 3, 4, 8, 12, 16].forEach((q) => pts.push([pos[q][0] + u(-6, 6), pos[q][1] + u(-6, 6)]));
  jobs.push({ title: 'Strukturen 8', d: d.join(' '), d2: poly(pts) });
  // 0009 Systeme 9 — recursive rectangle subdivision
  d = []; d2 = [];
  const split = (x0, y0, w, hh, depth) => {
    if (depth === 0 || (w < 30 && hh < 30) || (depth < 3 && R() < 0.25)) {
      (R() < 0.12 ? d2 : d).push(poly([[x0 + 3, y0 + 3], [x0 + w - 3, y0 + 3], [x0 + w - 3, y0 + hh - 3], [x0 + 3, y0 + hh - 3]], true));
      return;
    }
    let c;
    if (w > hh) { c = u(0.3, 0.7) * w; split(x0, y0, c, hh, depth - 1); split(x0 + c, y0, w - c, hh, depth - 1); }
    else { c = u(0.3, 0.7) * hh; split(x0, y0, w, c, depth - 1); split(x0, y0 + c, w, hh - c, depth - 1); }
  };
  split(6, 6, 188, 188, 5);
  jobs.push({ title: 'Systeme 9', d: d.join(' '), d2: d2.join(' ') });
  // 0010 Ordnung 10 — lines, order into disorder
  d = [];
  for (let r = 0; r < 40; r++) {
    const jj = Math.pow(r / 40, 2) * 9; pts = [];
    for (x = 10; x <= 190; x += 12) pts.push([x, 10 + r * 4.6 + u(-jj, jj)]);
    d.push(poly(pts));
  }
  jobs.push({ title: 'Ordnung 10', d: d.join(' '), d2: '' });
  // 0011 Zufall 11 — one random orthogonal walk (pen 2)
  x = 100; y = 100; pts = [[x, y]];
  for (let m = 0; m < 140; m++) {
    if (m % 2 === 0) x = Math.min(190, Math.max(10, x + (R() < 0.5 ? -1 : 1) * u(4, 22)));
    else y = Math.min(190, Math.max(10, y + (R() < 0.5 ? -1 : 1) * u(4, 22)));
    pts.push([x, y]);
  }
  jobs.push({ title: 'Zufall 11', d: '', d2: poly(pts) });
  // 0012 Computer 12 — "handwriting" zigzag lines
  d = [];
  for (let r = 0; r < 12; r++) {
    y = 22 + r * 14; x = 12; pts = [];
    while (x < 188) {
      pts.push([x, y + u(-1, 1)]); x += u(2, 5);
      pts.push([x, y - u(3, 7)]); x += u(2, 5);
      if (R() < 0.08) { d.push(poly(pts)); pts = []; x += u(4, 9); }
    }
    if (pts.length) d.push(poly(pts));
  }
  jobs.push({ title: 'Computer 12', d: d.join(' '), d2: '' });

  jobs.forEach((j, i) => { j.no = String(i + 1).padStart(4, '0'); });
  return { hero, jobs };
}

// ---------------------------------------------------------------------------
// Helper: wrap a plot into a standalone SVG string (useful for "Save → SVG").
export function toSVG({ d, d2 }, { size = 200, pen1 = '#1A1A18', pen2 = '#D2372B', stroke = 0.75 } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">` +
    (d ? `<path d="${d}" fill="none" stroke="${pen1}" stroke-width="${stroke}" stroke-linejoin="round"/>` : '') +
    (d2 ? `<path d="${d2}" fill="none" stroke="${pen2}" stroke-width="${stroke * 1.5}" stroke-linejoin="round"/>` : '') +
    `</svg>`;
}
