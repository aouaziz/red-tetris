import { Board, Cell } from './types';

// Removes completed rows and drops the rows above down. Garbage lines are
// indestructible: a full row containing any garbage cell is never cleared.
export function clearLines(board: Board): { board: Board; cleared: number } {
  const cols = board[0].length;
  const kept = board.filter(
    (row) => !(row.every((c) => c !== 0) && !row.some((c) => c === 'G')),
  );
  const cleared = board.length - kept.length;
  const empty = Array.from({ length: cleared }, () =>
    Array.from({ length: cols }, () => 0 as Cell),
  );
  return { board: [...empty, ...kept], cleared };
}
