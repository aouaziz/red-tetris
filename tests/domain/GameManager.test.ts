import { describe, it, expect } from 'vitest';
import { GameManager } from '../../server/src/domain/GameManager';

describe('GameManager', () => {
  it('getOrCreate(): creates new game, returns existing on second call', () => {
    const gm = new GameManager();
    const g1 = gm.getOrCreate('room1');
    expect(g1.id).toBe('room1');
    const g2 = gm.getOrCreate('room1');
    expect(g1).toBe(g2);
  });

  it('get(): returns game or undefined', () => {
    const gm = new GameManager();
    expect(gm.get('room1')).toBeUndefined();
    gm.getOrCreate('room1');
    expect(gm.get('room1')).toBeDefined();
  });

  it('remove(): deletes game', () => {
    const gm = new GameManager();
    gm.getOrCreate('room1');
    expect(gm.get('room1')).toBeDefined();
    gm.remove('room1');
    expect(gm.get('room1')).toBeUndefined();
  });
});
