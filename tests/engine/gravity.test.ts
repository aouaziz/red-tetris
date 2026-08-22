import { describe, it, expect } from 'vitest';
import { hardDrop } from '../../server/src/engine/gravity';
import { createBoard } from '../../server/src/engine/board';
import { PieceState } from '../../server/src/engine/types';

describe('Engine: Gravity', () => {
  describe('hardDrop', () => {
    it('drops to bottom on empty board', () => {
      const board = createBoard();
      const piece: PieceState = { type: 'O', rotation: 0, x: 4, y: 0 };
      const dropped = hardDrop(board, piece);
      
      expect(dropped.x).toBe(4);
      expect(dropped.y).toBe(18);
    });

    it('stops above obstacle', () => {
      const board = createBoard();
      board[10][4] = 'I';
      board[10][5] = 'I';
      
      const piece: PieceState = { type: 'O', rotation: 0, x: 4, y: 0 };
      const dropped = hardDrop(board, piece);
      
      expect(dropped.y).toBe(8);
    });

    it('already at bottom stays put', () => {
      const board = createBoard();
      const piece: PieceState = { type: 'O', rotation: 0, x: 4, y: 18 };
      const dropped = hardDrop(board, piece);
      
      expect(dropped.y).toBe(18);
    });
  });
});
