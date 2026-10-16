// Start-page hero: 5×5 concentric squares, order drifting into disorder; one cell in pen 2.
// Ported from the design prototype (seed 1968, first draws of its random stream).
import { chance, draw, jitteredSquare, newPlot } from '../engine';

export function hero(seed = 1968) {
  const R = chance(seed);
  const plot = newPlot(400);
  for (let i = 0; i < 5; i++) for (let k = 0; k < 5; k++) {
    const j = Math.pow((i + k) / 8, 2.2) * 9;
    for (let m = 1; m <= 8; m++)
      draw(plot, i === 3 && k === 1 ? 2 : 1, jitteredSquare(R, 40 + i * 80, 40 + k * 80, m * 4.4, j * (0.4 + m / 8)));
  }
  return plot;
}
