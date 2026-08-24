import { describe, it, expect } from 'vitest';
import { parseJoin, parseAction } from '../../server/src/socket/protocol';

describe('protocol', () => {
  describe('parseJoin', () => {
    it('valid {room, name} -> trimmed values', () => {
      expect(parseJoin({ room: ' r1 ', name: ' n1 ' })).toEqual({ room: 'r1', name: 'n1' });
    });
    it('missing/non-string fields -> null', () => {
      expect(parseJoin({ room: 'r1' })).toBeNull();
      expect(parseJoin({ name: 'n1' })).toBeNull();
      expect(parseJoin({ room: 123, name: 'n1' })).toBeNull();
    });
    it('empty strings after trim -> null', () => {
      expect(parseJoin({ room: '   ', name: 'n1' })).toBeNull();
    });
    it('too long (>50 chars) -> null', () => {
      expect(parseJoin({ room: 'a'.repeat(51), name: 'n1' })).toBeNull();
    });
    it('disallows delimiter characters in room or name', () => {
      expect(parseJoin({ room: 'r/1', name: 'n1' })).toBeNull();
      expect(parseJoin({ room: 'r[1]', name: 'n1' })).toBeNull();
      expect(parseJoin({ room: 'r1', name: 'n/1' })).toBeNull();
      expect(parseJoin({ room: 'r1', name: 'n[1]' })).toBeNull();
    });
    it('null/undefined/number input -> null', () => {
      expect(parseJoin(null)).toBeNull();
      expect(parseJoin(undefined)).toBeNull();
      expect(parseJoin(123)).toBeNull();
    });
  });

  describe('parseAction', () => {
    it('each valid action string -> returns action', () => {
      expect(parseAction('left')).toBe('left');
      expect(parseAction('right')).toBe('right');
      expect(parseAction('rotate')).toBe('rotate');
      expect(parseAction('soft')).toBe('soft');
      expect(parseAction('hard')).toBe('hard');
    });
    it('valid {type: action} object -> returns action', () => {
      expect(parseAction({ type: 'left' })).toBe('left');
    });
    it('invalid action string -> null', () => {
      expect(parseAction('up')).toBeNull();
    });
    it('null/undefined/number -> null', () => {
      expect(parseAction(null)).toBeNull();
      expect(parseAction(undefined)).toBeNull();
      expect(parseAction(123)).toBeNull();
    });
  });
});
