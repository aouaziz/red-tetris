import { Coord, PieceState, TetrominoType } from './types';

// Original Tetrimino spawn shapes in their bounding boxes. Rotations are
// derived by rotating each box clockwise (no wall kicks — see RULES.md).
const BASE: Record<TetrominoType, number[][]> = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
};

export const TETROMINOES: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

function rotateCW(matrix: number[][]): number[][] {
  const n = matrix.length;
  const out = matrix.map((row) => row.slice());
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      out[x][n - 1 - y] = matrix[y][x];
    }
  }
  return out;
}

// Precompute the four rotation states of every piece.
const ROTATIONS: Record<TetrominoType, number[][][]> = (() => {
  const out = {} as Record<TetrominoType, number[][][]>;
  for (const type of TETROMINOES) {
    const states: number[][][] = [BASE[type]];
    for (let i = 1; i < 4; i++) {
      states.push(rotateCW(states[i - 1]));
    }
    out[type] = states;
  }
  return out;
})();

export function pieceMatrix(type: TetrominoType, rotation: number): number[][] {
  return ROTATIONS[type][((rotation % 4) + 4) % 4];
}

// Absolute board coordinates occupied by a piece at its current position.
export function pieceCells(piece: PieceState): Coord[] {
  const matrix = pieceMatrix(piece.type, piece.rotation);
  const cells: Coord[] = [];
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      if (matrix[y][x]) {
        cells.push({ x: piece.x + x, y: piece.y + y });
      }
    }
  }
  return cells;
}

// Spawn position: horizontally centred at the top of the board.
export function spawnState(type: TetrominoType, cols: number): PieceState {
  const size = BASE[type].length;
  return { type, rotation: 0, x: Math.floor((cols - size) / 2), y: 0 };
}
