import { Coord, PieceState, TetrominoType } from '../engine/types';
import { pieceCells, spawnState } from '../engine/pieces';

// Domain wrapper around a tetromino. It is structurally a PieceState, so it can
// be passed directly to the pure engine functions, while offering a small OOP
// surface for the Game to work with.
export class Piece implements PieceState {
  type: TetrominoType;
  rotation: number;
  x: number;
  y: number;

  constructor(type: TetrominoType, rotation: number, x: number, y: number) {
    this.type = type;
    this.rotation = rotation;
    this.x = x;
    this.y = y;
  }

  static spawn(type: TetrominoType, cols: number): Piece {
    const s = spawnState(type, cols);
    return new Piece(s.type, s.rotation, s.x, s.y);
  }

  static from(state: PieceState): Piece {
    return new Piece(state.type, state.rotation, state.x, state.y);
  }

  cells(): Coord[] {
    return pieceCells(this);
  }
}
