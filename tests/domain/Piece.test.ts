import { describe, it, expect } from 'vitest';
import { Piece } from '../../server/src/domain/Piece';
import { TetrominoType } from '../../server/src/engine/types';
import { spawnState } from '../../server/src/engine/pieces';

describe('Piece', () => {
  it('spawn(): creates piece at correct spawn position for various types', () => {
    const p1 = Piece.spawn('I', 10);
    const s1 = spawnState('I', 10);
    expect(p1.type).toBe('I');
    expect(p1.rotation).toBe(0);
    expect(p1.x).toBe(s1.x);
    expect(p1.y).toBe(s1.y);

    const p2 = Piece.spawn('O', 10);
    const s2 = spawnState('O', 10);
    expect(p2.x).toBe(s2.x);
  });

  it('from(): creates piece from PieceState', () => {
    const state = { type: 'T' as TetrominoType, rotation: 1, x: 2, y: 3 };
    const p = Piece.from(state);
    expect(p.type).toBe('T');
    expect(p.rotation).toBe(1);
    expect(p.x).toBe(2);
    expect(p.y).toBe(3);
  });

  it('cells(): returns correct coordinates', () => {
    const p = new Piece('O', 0, 0, 0);
    const coords = p.cells();
    expect(coords).toContainEqual({ x: 0, y: 0 });
    expect(coords).toContainEqual({ x: 1, y: 0 });
    expect(coords).toContainEqual({ x: 0, y: 1 });
    expect(coords).toContainEqual({ x: 1, y: 1 });
  });
});
