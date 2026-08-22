import { describe, it, expect } from 'vitest';
import { clearLines } from '../../server/src/engine/lines';
import { createBoard, COLS, ROWS } from '../../server/src/engine/board';

describe('Engine: Lines', () => {
  it('No full rows -> 0 cleared', () => {
    const board = createBoard();
    board[19][0] = 'T';
    const result = clearLines(board);
    expect(result.cleared).toBe(0);
    expect(result.board).toEqual(board);
  });

  it('Single full row -> 1 cleared, board resized correctly', () => {
    const board = createBoard();
    board[19] = new Array(COLS).fill('I');
    board[18][0] = 'T';
    
    const result = clearLines(board);
    expect(result.cleared).toBe(1);
    expect(result.board.length).toBe(ROWS);
    expect(result.board[19][0]).toBe('T');
    expect(result.board[0].every(c => c === 0)).toBe(true);
  });

  it('Multiple full rows -> all cleared', () => {
    const board = createBoard();
    board[17] = new Array(COLS).fill('J');
    board[18] = new Array(COLS).fill('Z');
    board[19] = new Array(COLS).fill('S');
    board[16][0] = 'O';
    
    const result = clearLines(board);
    expect(result.cleared).toBe(3);
    expect(result.board[19][0]).toBe('O');
  });

  it('Row with G garbage -> NOT cleared', () => {
    const board = createBoard();
    board[19] = new Array(COLS).fill('I');
    board[19][5] = 'G';
    
    const result = clearLines(board);
    expect(result.cleared).toBe(0);
    expect(result.board[19]).toEqual(board[19]);
  });
  
  it('Board dimensions preserved', () => {
    const board = createBoard(5, 5);
    board[4] = new Array(5).fill('I');
    const result = clearLines(board);
    
    expect(result.board.length).toBe(5);
    expect(result.board[0].length).toBe(5);
  });
});
