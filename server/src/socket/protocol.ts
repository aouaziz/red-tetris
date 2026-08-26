import { ActionType, GameMode } from '../domain/Game';

export const ACTIONS: readonly ActionType[] = ['left', 'right', 'rotate', 'soft', 'hard'];
export const MODES: readonly GameMode[] = ['classic', 'speed', 'invisible'];

// Validate an incoming join payload. Returns the trimmed values or null.
export function parseJoin(payload: unknown): { room: string; name: string } | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }
  const { room, name } = payload as { room?: unknown; name?: unknown };
  if (typeof room !== 'string' || typeof name !== 'string') {
    return null;
  }
  const r = room.trim();
  const n = name.trim();
  if (!r || !n || r.length > 50 || n.length > 50) {
    return null;
  }
  if (
    n.includes('/') ||
    n.includes('[') ||
    n.includes(']') ||
    r.includes('/') ||
    r.includes('[') ||
    r.includes(']')
  ) {
    return null;
  }
  return { room: r, name: n };
}

// Validate an incoming action payload. Accepts either a bare string or an
// object with a `type` field.
export function parseAction(payload: unknown): ActionType | null {
  const raw =
    typeof payload === 'string'
      ? payload
      : payload && typeof payload === 'object'
        ? (payload as { type?: unknown }).type
        : undefined;
  return ACTIONS.includes(raw as ActionType) ? (raw as ActionType) : null;
}

// Validate an incoming set_mode payload. Accepts string or { mode: string }.
export function parseSetMode(payload: unknown): GameMode | null {
  const raw =
    typeof payload === 'string'
      ? payload
      : payload && typeof payload === 'object'
        ? (payload as { mode?: unknown }).mode
        : undefined;
  return MODES.includes(raw as GameMode) ? (raw as GameMode) : null;
}
