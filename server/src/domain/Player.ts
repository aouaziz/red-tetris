import { Board } from '../engine/types';
import { createBoard } from '../engine/board';
import { Piece } from './Piece';

// A player in a game: their own board, the piece they currently control, their
// position in the shared piece sequence, and lifecycle flags.
export class Player {
  readonly id: string;
  readonly name: string;
  board: Board;
  piece: Piece | null = null;
  index = 0;
  alive = true;
  pendingGarbage = 0;
  lockPending = false;
  score = 0;
  linesCleared = 0;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
    this.board = createBoard();
  }

  reset(): void {
    this.board = createBoard();
    this.piece = null;
    this.index = 0;
    this.alive = true;
    this.pendingGarbage = 0;
    this.lockPending = false;
    this.score = 0;
    this.linesCleared = 0;
  }
}
