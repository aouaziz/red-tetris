import { describe, it, expect } from 'vitest';
import { createBoard, cloneBoard, inBounds, cellAt, lockPiece, ROWS, COLS } from '../../server/src/engine/board';
import { PieceState } from '../../server/src/engine/types';

describe('Engine: Board', () => {
  describe('createBoard', () => {
    it('creates board with default dimensions 10x20', () => {
      const board = createBoard();
      expect(board.length).toBe(ROWS);
      expect(board[0].length).toBe(COLS);
      expect(board.every(row => row.every(cell => cell === 0))).toBe(true);
    });
    
    it('creates board with custom dimensions', () => {
      const board = createBoard(15, 5);
      expect(board.length).toBe(15);
      expect(board[0].length).toBe(5);
    });
  });

  describe('cloneBoard', () => {
    it('returns a new array and modifying it does not affect original', () => {
      const board = createBoard();
      const clone = cloneBoard(board);
      
      expect(clone).not.toBe(board);
      expect(clone).toEqual(board);
      
      clone[0][0] = 'I';
      expect(board[0][0]).toBe(0);
      expect(clone[0][0]).toBe('I');
    });
  });

  describe('inBounds', () => {
    it('returns true for valid coordinates', () => {
      const board = createBoard();
      expect(inBounds(board, 0, 0)).toBe(true);
      expect(inBounds(board, COLS - 1, ROWS - 1)).toBe(true);
      expect(inBounds(board, 5, 10)).toBe(true);
    });

    it('returns false for out-of-bounds coordinates', () => {
      const board = createBoard();
      expect(inBounds(board, -1, 0)).toBe(false);
      expect(inBounds(board, 0, -1)).toBe(false);
      expect(inBounds(board, COLS, 0)).toBe(false);
      expect(inBounds(board, 0, ROWS)).toBe(false);
    });
  });

  describe('cellAt', () => {
    it('returns correct cell value', () => {
      const board = createBoard();
      board[5][5] = 'T';
      expect(cellAt(board, 5, 5)).toBe('T');
      expect(cellAt(board, 0, 0)).toBe(0);
    });
  });

  describe('lockPiece', () => {
    it('burns piece cells into a board copy without mutating original', () => {
      const board = createBoard();
      const piece: PieceState = { type: 'T', rotation: 0, x: 4, y: 18 };
      const nextBoard = lockPiece(board, piece);
      
      expect(nextBoard).not.toBe(board);
      expect(board[18][5]).toBe(0); // Center of T piece block
      expect(nextBoard[18][5]).toBe('T');
    });
  });
});
