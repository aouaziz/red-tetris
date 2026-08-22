
# Red Tetris — Rules

The official subject is authoritative. If anything here conflicts with
it, the subject wins. Don't invent requirements it doesn't contain.

## Objective

Networked multiplayer Tetris, Full Stack JavaScript (TS allowed).
`client/` (browser SPA) + `server/` (Node.js), talking over HTTP +
Socket.IO. No database — in-memory state is enough.

Must support: solo play, multiplayer, multiple concurrent games,
real-time opponent spectrum, line-clear garbage penalty, host-controlled
start/restart, elimination until one player remains.

## Client

- SPA, modern framework (React preferred), functional components + Hooks.
- **No `this`** anywhere in client code (exception: subclassing `Error`).
- **Forbidden**: jQuery, DOM-manipulation libs, Canvas, SVG, HTML `<table>`.
  Board renders with plain HTML elements + CSS Grid/Flexbox.
- Owns: routing, rendering (board, spectra, players, status), keyboard
  input, accessible button controls, Socket.IO client, UI state.
- Sends *intentions* only — never declares authoritative outcomes
  (moves, line clears, garbage, victory).

## Server

- Node.js. OOP via classes/prototypes — minimum: `Player`, `Piece`, `Game`.
- Owns: game/player management, piece distribution, spectrum updates,
  lifecycle, host assignment, winner detection, Socket.IO, serving the SPA.
- `Game` orchestrates but doesn't contain Tetris algorithms — those live
  in the pure engine. Socket handlers stay transport/orchestration only,
  validate all incoming payloads.
- No `shared/` package — not required, don't add it for looks.

## Pure Game Engine

Board/piece rules (creation, placement, collision, movement, rotation,
gravity, locking, line clearing, garbage, spectrum, top-out, state
transitions) must be **pure functions**: deterministic, no side effects,
no DOM/socket/DB/timers, no hidden mutable state, no input mutation.

Suggested layout (adjust after inspecting the official boilerplate):

```text
server/src/
├── domain/   Player.ts  Piece.ts  Game.ts
└── engine/   board.ts  pieces.ts  collision.ts  movement.ts
            rotation.ts  gravity.ts  lines.ts  garbage.ts  spectrum.ts
```

## Tetris Rules

- Board: 10 cols × 20 rows. Original Tetrimino shapes + rotation.
- Constant-speed gravity. Lock: piece touching the pile stays adjustable
  for one more frame, then locks if still grounded.
- Controls: ← move left · → move right · ↑ rotate · ↓ soft drop · Space hard drop.
- Scoring is bonus-only, not mandatory.
- **Garbage**: clearing `n` lines sends opponents `n − 1` indestructible
  lines (1→0, 2→1, 3→2, 4→3). Garbage is inserted at the bottom, stays
  visually distinct, and can cause top-out.
- **Piece sequence**: all players in one game share the same sequence,
  same positions/coordinates (may arrive at different times). The
  `Game`/session owns distribution — never randomize per-player.
- **Spectrum**: 10 heights (highest occupied block per column), updates
  in real time. Full opponent boards need not be exposed.

## Server Authority

```text
Client intention → Socket.IO → Server validation → Game/domain
                → Pure engine function → New state → Broadcast → Client render
```

Client is never trusted for movement results, line clears, garbage,
victory, or authoritative positions.

## Game Management

- Join via URL containing room name + player name (SPA router, e.g.
  React Router).
- First joiner is host; host controls start/restart.
- If host leaves, server reassigns host to a remaining player.
- No joining mid-game — only before the next round.
- Game ends when one player remains. Solo (1-player) games are valid.
- Multiple concurrent games, state isolated per room.

## Testing

Unit tests mandatory, verifying behavior (not just coverage padding).
Coverage minimums — all four required:

| Metric     | Min |
|------------|-----|
| Statements | 70% |
| Functions  | 70% |
| Lines      | 70% |
| Branches   | 50% |

Cover: board/piece geometry, collision, movement, rotation, gravity,
lock timing, line clearing, garbage, spectrum, top-out, immutability,
player lifecycle, host reassignment, solo mode, concurrent rooms,
socket events + invalid payloads, mid-game join rejection, disconnects,
winner detection.

## Security

Never commit passwords, keys, credentials, tokens, secrets, `.env`
files. Use env vars; gitignore anything secret. Exposing secrets can
fail the project.

## No Unnecessary Architecture

Don't add: `shared/` package, database, Redis, microservices, Docker,
Kubernetes, complex monorepo, Redux (unless actually needed),
speculative abstractions. Simplest compliant architecture wins.

## Decision Rule

```text
Tetris rule?                        → pure engine function
Players/rooms/lifecycle/timing?     → server domain
Network transport/payload validity? → socket layer
Serving the SPA?                    → HTTP layer
Display/input?                      → client
```

## Priority Order (when things conflict)

1. Official mandatory requirements
2. Correct game behavior
3. Architecture compliance
4. Tests
5. Maintainability
6. Performance
7. UI polish
8. Bonus features

## Definition of Done

Implementation + tests + lint + typecheck + coverage + architecture
compliance all pass. "Works in my browser" is not sufficient.

```bash
npm run lint
npm run typecheck
npm test
npm run test:coverage
npm run build
```

## Bonus (only after mandatory is done and passing)

Scoring, persistent scores, extra modes, invisible pieces, increased
gravity — must never break mandatory behavior.