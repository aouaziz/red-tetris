// Shared value types for the pure Tetris engine.

export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

// A board cell is either empty (0), a locked tetromino (its letter), or an
// indestructible garbage block ('G').
export type Cell = 0 | TetrominoType | 'G';

export type Board = Cell[][];

export interface PieceState {
  type: TetrominoType;
  rotation: number;
  x: number;
  y: number;
}

export interface Coord {
  x: number;
  y: number;
}
