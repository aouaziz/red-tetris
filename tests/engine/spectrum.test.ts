import { describe, it, expect } from 'vitest';
import { getSpectrum } from '../../server/src/engine/spectrum';
import { createBoard, COLS, ROWS } from '../../server/src/engine/board';

describe('Engine: Spectrum', () => {
  it('Empty board -> all zeros', () => {
    const board = createBoard();
    const spectrum = getSpectrum(board);
    expect(spectrum).toHaveLength(COLS);
    expect(spectrum.every(h => h === 0)).toBe(true);
  });

  it('Single block -> correct height', () => {
    const board = createBoard();
    board[19][0] = 'T';
    board[10][5] = 'I';
    
    const spectrum = getSpectrum(board);
    expect(spectrum[0]).toBe(1);
    expect(spectrum[5]).toBe(10);
    expect(spectrum[1]).toBe(0);
  });

  it('Full column -> height 20', () => {
    const board = createBoard();
    for (let y = 0; y < ROWS; y++) {
      board[y][3] = 'S';
    }
    
    const spectrum = getSpectrum(board);
    expect(spectrum[3]).toBe(ROWS);
  });

  it('Mixed columns -> each correct', () => {
    const board = createBoard(4, 4);
    board[3][0] = 'I';
    board[2][1] = 'J';
    board[0][2] = 'L';
    
    const spectrum = getSpectrum(board);
    expect(spectrum).toEqual([1, 2, 4, 0]);
  });
});
