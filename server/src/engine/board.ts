import { Board, Cell, PieceState } from './types';
import { pieceCells } from './pieces';

export const COLS = 10;
export const ROWS = 20;

export function createBoard(rows: number = ROWS, cols: number = COLS): Board {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => 0 as Cell),
  );
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => row.slice());
}

export function inBounds(board: Board, x: number, y: number): boolean {
  return y >= 0 && y < board.length && x >= 0 && x < board[0].length;
}

export function cellAt(board: Board, x: number, y: number): Cell {
  return board[y][x];
}

// Immutably writes a piece's cells into the board using the piece's colour.
export function lockPiece(board: Board, piece: PieceState): Board {
  const next = cloneBoard(board);
  for (const cell of pieceCells(piece)) {
    if (inBounds(next, cell.x, cell.y)) {
      next[cell.y][cell.x] = piece.type;
    }
  }
  return next;
}
