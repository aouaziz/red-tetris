import { describe, it, expect } from 'vitest';
import { isValidPosition } from '../../server/src/engine/collision';
import { createBoard } from '../../server/src/engine/board';
import { PieceState } from '../../server/src/engine/types';

describe('Engine: Collision', () => {
  it('piece in empty board center -> true', () => {
    const board = createBoard();
    const piece: PieceState = { type: 'T', rotation: 0, x: 4, y: 10 };
    expect(isValidPosition(board, piece)).toBe(true);
  });

  it('piece partially left/right/top/bottom out of bounds -> false', () => {
    const board = createBoard();
    expect(isValidPosition(board, { type: 'I', rotation: 0, x: -1, y: 5 })).toBe(false);
    expect(isValidPosition(board, { type: 'I', rotation: 0, x: 8, y: 5 })).toBe(false);
    expect(isValidPosition(board, { type: 'I', rotation: 0, x: 4, y: -2 })).toBe(false);
    expect(isValidPosition(board, { type: 'I', rotation: 0, x: 4, y: 19 })).toBe(false);
  });

  it('piece overlapping occupied cell -> false', () => {
    const board = createBoard();
    board[10][5] = 'O';
    const piece: PieceState = { type: 'T', rotation: 0, x: 4, y: 9 };
    expect(isValidPosition(board, piece)).toBe(false);
  });

  it('piece at exact valid boundary -> true', () => {
    const board = createBoard();
    expect(isValidPosition(board, { type: 'O', rotation: 0, x: 0, y: 0 })).toBe(true);
    expect(isValidPosition(board, { type: 'O', rotation: 0, x: 8, y: 18 })).toBe(true);
  });
});
