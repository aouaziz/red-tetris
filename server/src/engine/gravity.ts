import { Board, PieceState } from './types';
import { tryMove } from './movement';

// Drops a piece straight down until it can no longer move, returning the
// resting position (the piece is not locked here).
export function hardDrop(board: Board, piece: PieceState): PieceState {
  let current = piece;
  for (;;) {
    const next = tryMove(board, current, 0, 1);
    if (!next) {
      return current;
    }
    current = next;
  }
}
