// Detail page: parameter slip, re-runs, URL state and saving.
import { pathData } from '../engine';
import { DEFAULT_STROKES, defaults, jobByNo, runJob, sanitize, showParam, type Params } from '../jobs';
import { PEN_COLOURS, pad4 } from '../lib/site';
import { saveAs, type Format } from './export';

interface State {
  params: Params;
  seed: number;
  run: number;
  pen: string; // id from PEN_COLOURS
}

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initDetail() {
  const root = document.querySelector<HTMLElement>('[data-detail]');
  const job = root && jobByNo(root.dataset.job ?? '');
  if (!root || !job) return;

  const $ = <T extends Element = HTMLElement>(sel: string) => root.querySelector<T>(sel)!;
  const $$ = <T extends Element = HTMLElement>(sel: string) => Array.from(root.querySelectorAll<T>(sel));

  const svg = $<SVGSVGElement>('#plot');
  const path1 = svg.querySelector('[data-pen="1"]')!;
  const path2 = svg.querySelector('[data-pen="2"]')!;
  const inputs = $$<HTMLInputElement>('input[data-param]');
  const panelToggle = $<HTMLButtonElement>('[data-panel-toggle]');
  const saveToggle = $<HTMLButtonElement>('[data-save-toggle]');
  const saved = $('[data-saved]');

  // ---- state, seeded from the URL so runs can be shared ----
  const q = new URLSearchParams(location.search);
  const fromUrl: Partial<Params> = {};
  for (const d of job.params) if (q.has(d.key)) fromUrl[d.key] = Number(q.get(d.key));
  const num = (k: string, fallback: number) => {
    const v = Number(q.get(k));
    return q.has(k) && Number.isInteger(v) ? v : fallback;
  };
  const st: State = {
    params: sanitize(job, fromUrl),
    seed: num('seed', job.seed),
    run: Math.max(1, num('run', 1)),
    pen: PEN_COLOURS.some((c) => c.id === q.get('pen')) ? q.get('pen')! : PEN_COLOURS[0].id,
  };

  const penHex = () => PEN_COLOURS.find((c) => c.id === st.pen)!.hex;
  const fileBase = () => `job${job.no}_run${pad4(st.run)}`;

  function writeUrl() {
    const u = new URLSearchParams();
    const def = defaults(job!);
    for (const d of job!.params) if (st.params[d.key] !== def[d.key]) u.set(d.key, String(st.params[d.key]));
    if (st.seed !== job!.seed) u.set('seed', String(st.seed));
    if (st.run !== 1) u.set('run', String(st.run));
    if (st.pen !== PEN_COLOURS[0].id) u.set('pen', st.pen);
    const s = u.toString();
    history.replaceState(null, '', s ? `?${s}` : location.pathname);
  }

  let current = runJob(job, st.params, st.seed);
  let frame = 0;
  function render() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const p = st.params;
      current = runJob(job!, p, st.seed);
      const [w1, w2] = job!.strokes?.(p) ?? DEFAULT_STROKES;
      path1.setAttribute('d', pathData(current.pens[1]));
      path2.setAttribute('d', pathData(current.pens[2]));
      path1.setAttribute('stroke-width', String(w1));
      path2.setAttribute('stroke-width', String(w2));
      svg.setAttribute('aria-label', `Plot: ${job!.label(p)}`);
      $('[data-caption]').textContent = job!.caption(p);
      $('[data-note]').textContent = job!.note?.(p, st.run) ?? `run ${st.run}`;
      $$('[data-run]').forEach((el) => (el.textContent = pad4(st.run)));
      $$('[data-seed]').forEach((el) => (el.textContent = String(st.seed)));
      $('[data-file]').textContent = fileBase();
      for (const d of job!.params) $(`[data-show="${d.key}"]`).textContent = showParam(d, p[d.key]!);
      inputs.forEach((i) => (i.value = String(p[i.dataset.param!])));
      document.documentElement.style.setProperty('--pen', penHex());
      $$('[data-swatch]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.swatch === st.pen)));
      writeUrl();
    });
  }

  // ---- parameters ----
  inputs.forEach((input) =>
    input.addEventListener('input', () => {
      st.params = sanitize(job, { ...st.params, [input.dataset.param!]: Number(input.value) });
      clearSaved();
      render();
    }),
  );
  $$('[data-swatch]').forEach((b) =>
    b.addEventListener('click', () => {
      st.pen = b.dataset.swatch!;
      render();
    }),
  );
  $('[data-rerun]').addEventListener('click', () => {
    st.seed += 1;
    st.run += 1;
    clearSaved();
    render();
  });
  $('[data-reset]').addEventListener('click', () => {
    st.params = defaults(job);
    st.seed = job.seed;
    st.pen = PEN_COLOURS[0].id;
    st.run += 1;
    clearSaved();
    render();
  });

  // ---- panel ----
  function setPanel(open: boolean) {
    root!.toggleAttribute('data-panel-open', open);
    panelToggle.setAttribute('aria-expanded', String(open));
    panelToggle.textContent = open ? 'Hide parameters' : 'Parameters ▸';
  }
  panelToggle.addEventListener('click', () => setPanel(!root.hasAttribute('data-panel-open')));
  $('[data-panel-close]').addEventListener('click', () => {
    setPanel(false);
    panelToggle.focus();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || document.querySelector('[data-printer][data-menu-open]')) return;
    if (root.hasAttribute('data-panel-open')) {
      const inside = $('[data-slip]').contains(document.activeElement);
      setPanel(false);
      if (inside) panelToggle.focus();
    }
  });
  window.setTimeout(() => setPanel(true), reducedMotion() ? 0 : 700);

  // ---- saving ----
  function clearSaved() {
    saved.textContent = '';
    $$('[data-format]').forEach((b) => b.removeAttribute('data-on'));
  }
  saveToggle.addEventListener('click', () => {
    const open = !root.hasAttribute('data-save-open');
    root.toggleAttribute('data-save-open', open);
    saveToggle.setAttribute('aria-expanded', String(open));
    saveToggle.textContent = open ? 'Save ▴' : 'Save ▾';
    clearSaved();
  });
  $$('[data-format]').forEach((b) =>
    b.addEventListener('click', async () => {
      const format = b.dataset.format as Format;
      clearSaved();
      b.setAttribute('data-on', '');
      saved.textContent = '…';
      try {
        const name = await saveAs(format, {
          plot: current,
          fileBase: fileBase(),
          title: `Job ${job.no} · ${job.title} · run ${pad4(st.run)}`,
          description: `After Vera Molnar. ${job.caption(st.params)} · seed ${st.seed} · ${location.href}`,
          pen1: '#1A1A18',
          pen2: penHex(),
          strokes: job.strokes?.(st.params) ?? DEFAULT_STROKES,
        });
        saved.textContent = `→ ${name} ✓`;
      } catch (err) {
        console.error(err);
        saved.textContent = 'paper jam — try again';
      }
    }),
  );

  render();
}
