import { Board } from './types';

// The spectrum is the height of the highest occupied block in each column
// (0 when the column is empty). One value per column.
export function getSpectrum(board: Board): number[] {
  const rows = board.length;
  const cols = board[0].length;
  const spectrum: number[] = [];
  for (let x = 0; x < cols; x++) {
    let height = 0;
    for (let y = 0; y < rows; y++) {
      if (board[y][x] !== 0) {
        height = rows - y;
        break;
      }
    }
    spectrum.push(height);
  }
  return spectrum;
}
