import { describe, it, expect } from 'vitest';
import { rotate, tryRotate } from '../../server/src/engine/rotation';
import { createBoard } from '../../server/src/engine/board';
import { PieceState } from '../../server/src/engine/types';

describe('Engine: Rotation', () => {
  describe('rotate', () => {
    it('wraps 0->1->2->3->0, handles negative direction', () => {
      const piece: PieceState = { type: 'T', rotation: 0, x: 5, y: 5 };
      
      expect(rotate(piece, 1).rotation).toBe(1);
      expect(rotate(piece, 4).rotation).toBe(0);
      expect(rotate(piece, -1).rotation).toBe(3);
      expect(rotate(piece, -5).rotation).toBe(3);
    });
  });

  describe('tryRotate', () => {
    it('successful returns new piece', () => {
      const board = createBoard();
      const piece: PieceState = { type: 'I', rotation: 0, x: 3, y: 5 };
      const rotated = tryRotate(board, piece, 1);
      expect(rotated).not.toBeNull();
      expect(rotated?.rotation).toBe(1);
    });

    it('collision returns null', () => {
      const board = createBoard();
      const piece: PieceState = { type: 'I', rotation: 1, x: 8, y: 5 };
      const rotated = tryRotate(board, piece, 1);
      expect(rotated).toBeNull();
    });
  });
});
