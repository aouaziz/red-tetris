import { Board, PieceState } from './types';
import { isValidPosition } from './collision';

export function rotate(piece: PieceState, dir: number): PieceState {
  return { ...piece, rotation: (((piece.rotation + dir) % 4) + 4) % 4 };
}

// Returns the rotated piece when the rotation is legal, otherwise null.
// No wall kicks: if the rotated piece collides, the rotation is rejected.
export function tryRotate(
  board: Board,
  piece: PieceState,
  dir: number,
): PieceState | null {
  const next = rotate(piece, dir);
  return isValidPosition(board, next) ? next : null;
}
