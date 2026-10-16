// Save a run as SVG (plotter), PNG (image) or PDF (print). Browser only.
import { optimizePlot, toSVGString, type Plot } from '../engine';

export type Format = 'svg' | 'png' | 'pdf';

export interface ExportInfo {
  plot: Plot;
  fileBase: string; // e.g. "job0001_run0003"
  title: string;
  description: string;
  pen1: string;
  pen2: string;
  strokes: [number, number];
}

const PAPER = '#F6F5F0';
/** physical sheet for SVG/PDF: 200 mm square, like Molnar's 20 × 20 cm plotter drawings */
const SHEET_MM = 200;

function svgFor(o: ExportInfo, opts: { background?: string; mm?: boolean }) {
  const plot = optimizePlot(o.plot);
  return toSVGString(plot, {
    pens: { 1: { color: o.pen1, width: o.strokes[0] }, 2: { color: o.pen2, width: o.strokes[1] } },
    physicalWidth: opts.mm ? `${SHEET_MM}mm` : undefined,
    physicalHeight: opts.mm ? `${SHEET_MM}mm` : undefined,
    background: opts.background,
    title: o.title,
    description: o.description,
  });
}

function download(blob: Blob, name: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export async function saveAs(format: Format, o: ExportInfo): Promise<string> {
  const name = `${o.fileBase}.${format}`;
  if (format === 'svg') {
    download(new Blob([svgFor(o, { mm: true })], { type: 'image/svg+xml' }), name);
  } else if (format === 'png') {
    download(await toPNG(o, 2400), name);
  } else {
    download(await toPDF(o), name);
  }
  return name;
}

async function toPNG(o: ExportInfo, px: number): Promise<Blob> {
  const svg = svgFor(o, { background: PAPER });
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = px;
    c.height = Math.round((px * o.plot.height) / o.plot.width);
    const ctx = c.getContext('2d')!;
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return await new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('PNG failed'))), 'image/png'));
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function toPDF(o: ExportInfo): Promise<Blob> {
  // loaded on demand: ~400 kB that most visitors never need
  const [{ jsPDF }] = await Promise.all([import('jspdf'), import('svg2pdf.js')]);
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const el = new DOMParser().parseFromString(svgFor(o, {}), 'image/svg+xml').documentElement;
  const holder = document.createElement('div');
  holder.style.cssText = 'position:fixed;left:-9999px;top:0;width:400px;height:400px';
  holder.append(el);
  document.body.append(holder);
  try {
    const x = (210 - SHEET_MM * 0.9) / 2, size = SHEET_MM * 0.9;
    await doc.svg(el, { x, y: 30, width: size, height: size });
    doc.setFont('courier', 'normal');
    doc.setFontSize(9);
    doc.text(o.title.toUpperCase(), x, 22);
    doc.text(o.description, x, 30 + size + 10, { maxWidth: size });
    doc.setProperties({ title: o.title, subject: o.description, creator: 'Job from Molnar' });
  } finally {
    holder.remove();
  }
  return doc.output('blob');
}
