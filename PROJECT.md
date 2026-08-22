---
status: Mandatory implementation plan
title: Red Tetris — Project Plan (Condensed)
version: 2
---

# Red Tetris — Project Plan

Build the mandatory project per `RULES.md`. Goal: the **simplest**
architecture that's fully compliant and defensible — not the most
complex one.

## Architecture

```text
red-tetris/
├── client/                React SPA
├── server/
│   ├── domain/            Player.ts  Piece.ts  Game.ts
│   ├── engine/             pure Tetris functions
│   ├── socket/             Socket.IO middleware (fully encapsulated)
│   ├── http/                static SPA delivery
│   └── entrypoint
├── tests/
├── package.json / tsconfig.json / eslint config / test config
├── README.md, RULES.md, .gitignore
```

Starting point only — inspect the official `red_tetris_boilerplate`
before rebuilding or replacing its tooling. No `shared/` package
without a concrete need (see RULES.md §"No Unnecessary Architecture").

Layer responsibilities (client / server domain / pure engine / socket /
HTTP) are defined once in `RULES.md` — don't restate them here.

## Execution Loop

Each phase: **Inspect → Implement → Test → Lint → Typecheck → Verify
architecture → Commit → Next.** Don't combine unrelated phases or move
on while a gate is red.

## Phases

**0 — Boilerplate inspection.** Read the official boilerplate's README,
`package.json`, source tree, build/test/coverage config. Inventory what
exists vs. is missing (server, client, bundler, Socket.IO, tests,
coverage, lint, TS) before touching architecture.

**1 — Baseline.** Get the inspected boilerplate running unchanged;
confirm equivalents of `npm test / build / lint / typecheck` exist or
document gaps.

**2 — Domain model.** Implement `Player`, `Piece`, `Game`. Test:
construction, joining, join order, host (re)assignment, lifecycle, solo
game.

**3 — Board.** Pure 10×20 board model: creation, cell access/updates,
bounds, occupied cells, immutability. Test dimensions, empty state,
valid/invalid access, immutability.

**4 — Tetrimino geometry.** Pure shape/rotation/spawn functions for all
required pieces. Test every piece, every rotation state, spawn
positions.

**5 — Movement & collision.** Pure left/right/down movement; wall,
floor, and block collision; rejected rotation. No invented wall-kicks.

**6 — Gravity & locking.** Constant gravity; touch-pile → stays
adjustable for that tick → locks next tick if still grounded. Hard
drop locks immediately, no adjustment tick.

**7 — Line clearing & top-out.** Detect/remove completed rows, shift
remaining rows, preserve dimensions, detect failed spawn → elimination.

**8 — Garbage & spectrum.** `n` lines cleared → `n−1` indestructible
garbage lines (bottom-inserted). Spectrum = 10 column heights. Test
amounts, insertion, indestructibility, top-out, accuracy, immutability.

**9 — Deterministic piece distribution.** `Game` owns one sequence per
game; if seeded, deterministic. Test two players get matching
corresponding pieces.

**10 — Engine ↔ domain integration.** `Game` orchestrates, engine
computes transitions. Gate: full local game lifecycle works with no
Socket.IO involved.

**11 — Socket.IO protocol.** Define events for join/lobby/start/
relaunch/actions/state/spectrum/end/errors/disconnects. Validate
payloads, use rooms, stay server-authoritative, and put all socket
wiring behind one middleware layer (no raw `socket.on` in domain
code). Gate: two real clients can join → lobby → start → play → get
state → clear lines → get garbage → finish → winner relaunches.

**12 — HTTP & SPA delivery.** Serve `index.html`, bundle, static
assets, SPA fallback. Gate: opening a hash-based room URL
(`/#<room>/<player_name>`) directly loads the app.

**13 — React client foundation.** Functional components, Hooks, no
`this`, `HashRouter` (URL is hash-based, not path-based), predictable
state, socket connection management. Gate: connect → join room →
receive lobby → display players.

**14 — Board UI.** CSS Grid, 10×20 cells, HTML/CSS only (no
Canvas/SVG/table/jQuery). Gate: board matches server state.

**15 — Spectrum & lobby UI.** Opponent names/spectra, lobby, host
controls, status, game-over — spectrum updates in real time.

**16 — Input controls.** ←/→/↑/↓/Space emit intentions; add clickable
HTML controls for accessibility. No game logic duplicated client-side.

**17 — Multiplayer hardening.** Verify: 2p, 3p, solo, host disconnect,
non-host disconnect, mid-game join rejection, join allowed in the
post-game/pre-relaunch window, winner relaunch, winner-left-so-
replacement relaunches, concurrent rooms, winner detection, room
cleanup. No cross-room leakage or orphaned lifecycles.

**18 — Coverage gate.** Meet RULES.md minimums (70/70/70/50); internal
stretch target 80/80/80/65. No tests written purely to pad numbers.

**19 — Compliance audit.** Confirm absence of client `this`, `<table>`,
`<canvas>`, `<svg>`, jQuery; confirm `Player`/`Piece`/`Game` as server
OOP and Tetris rules as pure functions; confirm no secrets committed.

**20 — Final verification.** Run `lint / typecheck / test /
test:coverage / build`, then manual browser check.

**21 — Documentation.** Finalize README, RULES.md, architecture
overview, setup, URL format, controls, protocol overview, test
commands, known limitations, bonus features.

**22 — Bonus** (only once mandatory is PERFECT — see RULES.md
§"Bonus"): see `BONUS.md` for the feature list, scope, and gate for
each.

## Final Invariant

```text
CLIENT (render + input + SPA state)
   │  Socket.IO
   ▼
SERVER DOMAIN (Player + Piece + Game)
   │
   ▼
PURE ENGINE (board + pieces + Tetris rules)
```

Tetris rules live in pure functions. Server objects orchestrate them.
The client renders authoritative state and sends intentions — nothing
more. Prefer the smaller architecture that clearly satisfies the
subject over a complicated one.