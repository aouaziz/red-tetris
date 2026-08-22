import { describe, it, expect } from 'vitest';
import { move, tryMove } from '../../server/src/engine/movement';
import { createBoard } from '../../server/src/engine/board';
import { PieceState } from '../../server/src/engine/types';

describe('Engine: Movement', () => {
  describe('move', () => {
    it('pure translation dx, dy', () => {
      const piece: PieceState = { type: 'J', rotation: 1, x: 5, y: 5 };
      const moved = move(piece, -1, 2);
      expect(moved).toEqual({ type: 'J', rotation: 1, x: 4, y: 7 });
    });
  });

  describe('tryMove', () => {
    it('successful move returns new piece', () => {
      const board = createBoard();
      const piece: PieceState = { type: 'T', rotation: 0, x: 4, y: 5 };
      const moved = tryMove(board, piece, 1, 0);
      expect(moved).toEqual({ type: 'T', rotation: 0, x: 5, y: 5 });
    });

    it('wall block returns null', () => {
      const board = createBoard();
      const piece: PieceState = { type: 'O', rotation: 0, x: 8, y: 5 };
      expect(tryMove(board, piece, 1, 0)).toBeNull();
    });

    it('floor block returns null', () => {
      const board = createBoard();
      const piece: PieceState = { type: 'O', rotation: 0, x: 4, y: 18 };
      expect(tryMove(board, piece, 0, 1)).toBeNull();
    });

    it('occupied cell block returns null', () => {
      const board = createBoard();
      board[6][5] = 'Z';
      const piece: PieceState = { type: 'O', rotation: 0, x: 4, y: 4 };
      expect(tryMove(board, piece, 0, 1)).toBeNull();
    });
  });
});
