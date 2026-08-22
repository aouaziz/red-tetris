import { Board, PieceState } from './types';
import { isValidPosition } from './collision';

export function move(piece: PieceState, dx: number, dy: number): PieceState {
  return { ...piece, x: piece.x + dx, y: piece.y + dy };
}

// Returns the moved piece when the move is legal, otherwise null.
export function tryMove(
  board: Board,
  piece: PieceState,
  dx: number,
  dy: number,
): PieceState | null {
  const next = move(piece, dx, dy);
  return isValidPosition(board, next) ? next : null;
}
