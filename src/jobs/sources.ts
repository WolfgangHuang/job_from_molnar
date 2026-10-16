// Shared references for the job texts. Facts in the descriptions should come from these.
import type { Source } from './types';

const DAM = 'https://dam.org/museum/artists_ui/artists/molnar-vera';

export const SRC = {
  leonardo1975: {
    label: 'V. Molnar, “Toward Aesthetic Guidelines for Paintings with the Aid of a Computer”, Leonardo 8 (1975)',
    url: 'https://www.jstor.org/stable/1573236',
  },
  pompidou: {
    label: 'Centre Pompidou, “Vera Molnár, aux sources du code” (2023)',
    url: 'https://www.centrepompidou.fr/es/pompidou-plus/magazine/articulo/vera-molnar-aux-sources-du-code',
  },
  studioIntl: {
    label: 'Studio International, review of “Speak to the Eye” (2024)',
    url: 'https://studiointernational.com/index.php/vera-molnar-speak-to-the-eye-review-pompidou-centre-france',
  },
  damInterruptions: { label: 'DAM — Interruptions', url: `${DAM}/interruptions/` },
  damDesOrdres: { label: 'DAM — (Des)Ordres', url: `${DAM}/des-ordres/` },
  damDurer: { label: 'DAM — Hommage à Dürer', url: `${DAM}/works_vera_molnar/hommage-a-durer/` },
  damVictoire: { label: 'DAM — Sainte Victoire', url: `${DAM}/sainte-victoire` },
  damSaccades: { label: 'DAM — Saccades', url: `${DAM}/saccades/` },
  damKlee: { label: 'DAM — À la recherche de Paul Klee', url: `${DAM}/a-la-recherche-de-paul-klee/` },
  damArtist: { label: 'DAM — Vera Molnar', url: `${DAM}/` },
  spalter1pc: {
    label: 'Spalter Digital — 1% de désordre / Main ordinateur',
    url: 'https://spalterdigital.com/artworks/1-de-desordre-main-ordinateur-1-disorder-main-computer-4/',
  },
} satisfies Record<string, Source>;
