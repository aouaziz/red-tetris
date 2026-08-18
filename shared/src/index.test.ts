import { describe, it, expect } from 'vitest';
import { PROTOCOL_VERSION } from './index';

describe('Shared Protocol Constants', () => {
  it('has a valid protocol version', () => {
    expect(PROTOCOL_VERSION).toBe(1);
  });
});
