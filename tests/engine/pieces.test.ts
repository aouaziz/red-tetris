import { describe, it, expect } from 'vitest';
import { TETROMINOES, pieceMatrix, pieceCells, spawnState } from '../../server/src/engine/pieces';
import { PieceState } from '../../server/src/engine/types';

describe('Engine: Pieces', () => {
  it('TETROMINOES has 7 types', () => {
    expect(TETROMINOES.length).toBe(7);
    expect(new Set(TETROMINOES).size).toBe(7);
  });

  describe('pieceMatrix', () => {
    it('each type has valid matrix and rotation wraps around 0-3', () => {
      TETROMINOES.forEach(type => {
        const r0 = pieceMatrix(type, 0);
        const r4 = pieceMatrix(type, 4);
        const r_minus4 = pieceMatrix(type, -4);
        
        expect(r0).toEqual(r4);
        expect(r0).toEqual(r_minus4);
        
        expect(r0.length).toBeGreaterThan(0);
        expect(r0.length).toBe(r0[0].length);
      });
    });
  });

  describe('pieceCells', () => {
    it('returns correct absolute coords for various positions', () => {
      const piece: PieceState = { type: 'O', rotation: 0, x: 5, y: 10 };
      const cells = pieceCells(piece);
      expect(cells.length).toBe(4);
      expect(cells).toContainEqual({ x: 5, y: 10 });
      expect(cells).toContainEqual({ x: 6, y: 10 });
      expect(cells).toContainEqual({ x: 5, y: 11 });
      expect(cells).toContainEqual({ x: 6, y: 11 });
    });
  });

  describe('spawnState', () => {
    it('centers horizontally, y=0, rotation=0 for all 7 types', () => {
      TETROMINOES.forEach(type => {
        const state = spawnState(type, 10);
        expect(state.type).toBe(type);
        expect(state.rotation).toBe(0);
        expect(state.y).toBe(0);
        
        const expectedX = type === 'O' ? 4 : 3;
        expect(state.x).toBe(expectedX);
      });
    });
  });
});
