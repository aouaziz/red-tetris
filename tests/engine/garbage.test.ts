import { describe, it, expect } from 'vitest';
import { addGarbage } from '../../server/src/engine/garbage';
import { createBoard, ROWS } from '../../server/src/engine/board';

describe('Engine: Garbage', () => {
  it('Insert N rows of G at bottom, existing rows shift up', () => {
    const board = createBoard();
    board[19][0] = 'T';
    
    const result = addGarbage(board, 2);
    
    expect(result.length).toBe(ROWS);
    expect(result[19].every(c => c === 'G')).toBe(true);
    expect(result[18].every(c => c === 'G')).toBe(true);
    expect(result[17][0]).toBe('T');
  });

  it('Count 0 -> board cloned unchanged', () => {
    const board = createBoard();
    board[19][0] = 'T';
    
    const result = addGarbage(board, 0);
    expect(result).not.toBe(board);
    expect(result).toEqual(board);
  });

  it('Count > rows -> clamped to rows', () => {
    const board = createBoard();
    const result = addGarbage(board, 30);
    
    expect(result.length).toBe(ROWS);
    expect(result.every(row => row.every(c => c === 'G'))).toBe(true);
  });

  it('Original board not mutated', () => {
    const board = createBoard();
    addGarbage(board, 1);
    expect(board[19].every(c => c === 0)).toBe(true);
  });
});
