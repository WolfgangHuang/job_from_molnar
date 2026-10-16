// Small helpers shared by pages and components.

/** Resolve a site-internal path against the configured base, e.g. url('job/0001/'). */
export function url(path = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
  return base + path.replace(/^\//, '');
}

export const jobUrl = (no: string) => url(`job/${no}/`);

export const PEN_COLOURS = [
  { id: 'red', name: 'Red', hex: '#D2372B' },
  { id: 'blue', name: 'Blue', hex: '#2747C9' },
  { id: 'magenta', name: 'Magenta', hex: '#C2257A' },
  { id: 'green', name: 'Green', hex: '#1E7A55' },
] as const;

export const pad4 = (n: number) => String(n).padStart(4, '0');
