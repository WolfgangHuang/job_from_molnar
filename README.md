# Job from Molnar

Eine Website zur Würdigung von Vera Molnar (1924–2023). Die Seite ist ein Plotter: Jeder „Job“ ist ein Algorithmus nach einer ihrer Arbeiten, den man mit Parametern verändern, neu laufen lassen und als SVG, PNG oder PDF speichern kann.

Das Design stammt aus `../Design-Vorlage/job-from-molnar-handoff/` (siehe `HANDOFF.md` dort).

## Befehle

```sh
npm install        # einmalig
npm run dev        # Entwicklungsserver auf http://localhost:4321
npm test           # Engine-Tests (Vitest)
npm run build      # statische Seite nach dist/
npm run preview    # dist/ lokal ansehen
npm run check      # Typprüfung (Astro + TypeScript)
```

Das Ergebnis in `dist/` ist rein statisch und lässt sich auf jedem Webspace hosten. Liegt die Seite in einem Unterordner (z. B. GitHub Pages), setzt man `base` in `astro.config.mjs`.

## Aufbau

```
src/
  engine/        Zeichen-Engine, ohne Abhängigkeiten
    rng.ts         deterministischer Zufall (LCG, Seed)
    geom.ts        Punkte, Linienzüge, Transformationen
    shapes.ts      Formvokabular: Quadrat, Rechteck, Viereck, Linie, Kreis, Bogen, Kurve, Jitter
    plot.ts        Plot = Blattgröße + Linienzüge pro Stift (1 = schwarz, 2 = Farbe)
    svg.ts         Plot → SVG-Pfaddaten bzw. SVG-Dokument (Inkscape-Ebene pro Stift)
    optimize.ts    Strich-Reihenfolge für weniger Leerfahrt am Plotter
  jobs/          ein Job pro Datei (NNNN-name.ts), werden automatisch gefunden
    types.ts       JobDef, Parameter, runJob()
    hero.ts        Hero-Plot der Startseite
  components/    PrinterHead (Druckerkopf + Menü), PaperSheet, ParameterSlip, JobCard, …
  scripts/       Browser-Logik: printer.ts, detail.ts, export.ts
  pages/         index.astro (Start), job/[no].astro (eine Seite pro Job)
  styles/        global.css (Tokens aus dem Handoff)
tests/           Engine-Tests; Job 0001 und Hero werden gegen generators.js der Vorlage geprüft
```

## Einen Job hinzufügen

1. Datei `src/jobs/0013-mein-job.ts` anlegen:

   ```ts
   import { draw, square } from '../engine';
   import { defineJob } from './types';

   export default defineJob({
     no: '0013',
     title: 'Mein Job',
     technique: 'squares in a row',
     reference: 'Titel des Originals, Jahr',   // optional
     seed: 1979,
     params: [
       { key: 'count', label: 'Squares', min: 1, max: 20, default: 8 },
       { key: 'disorder', label: 'Disorder', min: 0, max: 30, default: 2, unit: '%' },
     ],
     generate(p, R, plot) {
       const n = p.count!;
       for (let i = 0; i < n; i++) {
         const pen = R.chance(0.1) ? 2 : 1;
         draw(plot, pen, square(20 + (i + 0.5) * (360 / n), 200, 12 + R.jitter(p.disorder!)));
       }
     },
     label: (p) => `${p.count} squares in a row`,
     caption: (p) => `${p.count} squares`,
     description: 'Kurzer englischer Text für die Detailseite.',
   });
   ```

2. Fertig: Kachel auf der Startseite, Menüeintrag, Detailseite `/job/0013/`, Parameterzettel, URL-Parameter und Export entstehen automatisch.

Regeln für Generatoren:

- Koordinaten liegen im Raster 0–400 (`size` in der JobDef ändert das).
- Zufall **nur** über `R` (nie `Math.random`), sonst sind Läufe nicht reproduzierbar.
- Alles ist Linie: Kreise und Kurven werden als Linienzüge erzeugt (`circle`, `arc`, `curve`). Neue Formen kommen nach `engine/shapes.ts`.
- `npm test` prüft jeden Job automatisch bei Minimal-, Default- und Maximalwerten.

## Export

- **SVG** (plotter): 200 × 200 mm, eine Inkscape-Ebene pro Stift, Striche nach kürzester Leerfahrt sortiert. Geeignet für Inkscape/AxiDraw oder vpype.
- **PNG** (image): 2400 × 2400 px auf Papierfarbe.
- **PDF** (print): A4, Vektor, mit Titel und Lauf-Info; jsPDF/svg2pdf werden erst beim Klick geladen.

## Teilbare Läufe

Parameter, Seed, Lauf und Stiftfarbe stehen in der URL, z. B. `/job/0001/?disorder=12&seed=1969&run=2&pen=blue`. Defaults werden weggelassen.
