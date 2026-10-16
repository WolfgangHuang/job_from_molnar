// Printer head behaviour: carriage moves, printing / tearing the menu, AUTO key.

const HOME = '24%';
const EASE = 'cubic-bezier(.45,0,.25,1)';
const OPEN_STOPS = ['12%', '78%', '30%', '64%', '18%', '86%', '42%', '70%', '24%'];
const TEAR_STOPS = ['70%', '20%', '55%'];

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initPrinter() {
  const root = document.querySelector<HTMLElement>('[data-printer]');
  if (!root) return;
  const carriage = root.querySelector<HTMLElement>('[data-carriage]')!;
  const toggle = root.querySelector<HTMLButtonElement>('[data-menu-toggle]')!;
  const word = root.querySelector<HTMLElement>('[data-menu-word]')!;
  const sheet = root.querySelector<HTMLElement>('[data-menu-sheet]')!;
  let timers: number[] = [];

  const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));
  const move = (x: string, t: string) => {
    carriage.style.transition = reducedMotion() ? 'none' : `left ${t}`;
    carriage.style.left = x;
  };

  // park under the control panel, then roll out to the home position
  if (reducedMotion()) move(HOME, '0s');
  else later(() => move(HOME, `1.4s ${EASE}`), 500);

  function plotRun(open: boolean) {
    timers.forEach(clearTimeout);
    timers = [];
    if (reducedMotion()) return;
    const stops = open ? OPEN_STOPS : TEAR_STOPS;
    stops.forEach((x, i) =>
      later(() => {
        move(x, '0.14s linear');
        carriage.dataset.down = String(i % 2);
        root!.dataset.tracing = '';
      }, i * 150),
    );
    later(() => {
      move(HOME, `0.6s ${EASE}`);
      delete carriage.dataset.down;
      delete root!.dataset.tracing;
    }, stops.length * 150 + 60);
  }

  function setMenu(open: boolean, focus = true) {
    if (open === root!.hasAttribute('data-menu-open')) return;
    root!.toggleAttribute('data-menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Tear off the menu' : 'Print the menu');
    word.textContent = open ? 'TEAR' : 'MENU';
    plotRun(open);
    if (open && focus) sheet.querySelector<HTMLElement>('a')?.focus({ preventScroll: true });
    if (!open && focus && sheet.contains(document.activeElement)) toggle.focus();
  }

  toggle.addEventListener('click', () => setMenu(!root.hasAttribute('data-menu-open'), false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && root.hasAttribute('data-menu-open')) setMenu(false);
  });
  // clicking elsewhere tears off the menu
  document.addEventListener('click', (e) => {
    if (root.hasAttribute('data-menu-open') && !root.contains(e.target as Node)) setMenu(false, false);
  });

  // AUTO: run a random job other than the current one
  const auto = root.querySelector<HTMLAnchorElement>('[data-auto]');
  const nos = (root.dataset.jobs ?? '').split(',').filter((n) => n && n !== root.dataset.job);
  auto?.addEventListener('click', (e) => {
    if (!nos.length) return;
    e.preventDefault();
    const no = nos[Math.floor(Math.random() * nos.length)];
    window.location.href = `${root.dataset.base}job/${no}/`;
  });

  // fallback for browsers without container query units
  if (!CSS.supports('width', '1cqw')) {
    const casing = root.querySelector<HTMLElement>('.casing') ?? root;
    const paper = root.querySelector<HTMLElement>('[data-bay-paper]')!;
    const fit = () => {
      const w = casing.clientWidth, s = Math.min(w, 1240);
      paper.style.left = `${(w - s) / 2}px`;
      paper.style.width = `${s}px`;
    };
    fit();
    window.addEventListener('resize', fit);
  }
}
