import { Board, Cell } from './types';

// Inserts `count` indestructible garbage lines at the bottom of the board.
// Existing rows shift up; rows pushed past the top are lost (which can cause a
// top-out on the next spawn).
export function addGarbage(board: Board, count: number): Board {
  const rows = board.length;
  const cols = board[0].length;
  const n = Math.max(0, Math.min(count, rows));
  if (n === 0) {
    return board.map((row) => row.slice());
  }
  const kept = board.slice(n).map((row) => row.slice());
  const garbage = Array.from({ length: n }, () =>
    Array.from({ length: cols }, () => 'G' as Cell),
  );
  return [...kept, ...garbage];
}
