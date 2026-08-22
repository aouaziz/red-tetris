import { Board, PieceState } from './types';
import { pieceCells } from './pieces';

// A position is valid when every occupied cell is inside the board and lands
// on an empty square.
export function isValidPosition(board: Board, piece: PieceState): boolean {
  const rows = board.length;
  const cols = board[0].length;
  for (const cell of pieceCells(piece)) {
    if (cell.x < 0 || cell.x >= cols || cell.y < 0 || cell.y >= rows) {
      return false;
    }
    if (board[cell.y][cell.x] !== 0) {
      return false;
    }
  }
  return true;
}
