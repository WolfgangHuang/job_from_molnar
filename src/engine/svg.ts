// Plot → SVG. Used for on-screen rendering (path data) and for the plotter export.
import type { Path } from './geom';
import type { PenId, Plot } from './plot';

const num = (x: number, digits: number) => {
  const s = x.toFixed(digits);
  return s === '-0.0' || s === '-0.00' ? s.slice(1) : s;
};

/** SVG path data for a list of strokes, e.g. "M10.0 10.0 L20.0 10.0 Z M…". */
export function pathData(paths: Path[], digits = 1): string {
  return paths
    .map((p) => 'M' + p.pts.map(([x, y]) => num(x, digits) + ' ' + num(y, digits)).join(' L') + (p.closed ? ' Z' : ''))
    .join(' ');
}

export interface PenStyle {
  color: string;
  width: number;
}

export interface SvgOptions {
  pens: Record<PenId, PenStyle>;
  /** physical size, e.g. "200mm"; omitted => unitless */
  physicalWidth?: string;
  physicalHeight?: string;
  /** background fill; omitted => transparent */
  background?: string;
  title?: string;
  description?: string;
  digits?: number;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Standalone SVG document. Each pen is its own Inkscape layer, so plotter software
 * (Inkscape/AxiDraw, vpype, …) can draw pen 1 and pen 2 as separate passes.
 */
export function toSVGString(plot: Plot, o: SvgOptions): string {
  const w = o.physicalWidth ?? String(plot.width);
  const h = o.physicalHeight ?? String(plot.height);
  const layer = (pen: PenId, name: string) => {
    const paths = plot.pens[pen];
    if (!paths.length) return '';
    const st = o.pens[pen];
    return (
      `<g inkscape:groupmode="layer" inkscape:label="${pen} ${name}" id="pen${pen}" fill="none" stroke="${st.color}" ` +
      `stroke-width="${st.width}" stroke-linejoin="round" stroke-linecap="round">` +
      paths.map((p) => `<path d="${pathData([p], o.digits ?? 2)}"/>`).join('') +
      `</g>`
    );
  };
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" ` +
    `width="${w}" height="${h}" viewBox="0 0 ${plot.width} ${plot.height}">` +
    (o.title ? `<title>${esc(o.title)}</title>` : '') +
    (o.description ? `<desc>${esc(o.description)}</desc>` : '') +
    (o.background ? `<rect width="${plot.width}" height="${plot.height}" fill="${o.background}"/>` : '') +
    layer(1, 'pen 1') +
    layer(2, 'pen 2') +
    `</svg>`
  );
}
