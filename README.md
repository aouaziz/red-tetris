# 🟥 Red Tetris

A fast, real-time networked multiplayer Tetris game built with **Full Stack TypeScript** (React 18 + Node.js + Socket.IO).

---

## ⚡ What is Red Tetris?

**Red Tetris** is a competitive multiplayer puzzle game built strictly to official 42 school specifications. 

You can play **solo** to practice stacking, or create **multiplayer battle rooms** to compete against friends in real time.

```text
               ┌────────────────┐
               │   React SPA    │ (Sends movement intentions only)
               └───────┬────────┘
                       │ Socket.IO
                       ▼
               ┌────────────────┐
               │ Server Domain  │ (Manages Rooms, Players & Lifecycle)
               └───────┬────────┘
                       │
                       ▼
               ┌────────────────┐
               │  Pure Engine   │ (100% Deterministic Tetris Physics)
               └────────────────┘
```

### ✨ Core Features
- 🎮 **Solo & Multiplayer**: 1-click single-player mode, or custom battle rooms with live lobbies.
- 🎯 **Server-Authoritative Game State**: The browser only sends player inputs (`left`, `right`, `rotate`, `soft`, `hard`). The server calculates collisions, gravity, line clears, and piece distribution via pure deterministic functions.
- 🎲 **Identical Piece Sequence**: Every player in a room receives the exact same pieces in the exact same order (7-bag randomizer), ensuring 100% fair competition.
- 📊 **Real-Time Opponent Spectrum**: Watch your rivals' 10 column heights live on your HUD.
- 💥 **Garbage Line Penalties**: Clearing $n$ lines ($n \ge 2$) pushes $n - 1$ indestructible grey penalty lines to the bottom of all active opponents.
- 👑 **Host & Winner Privileges**: The first joiner is Host and starts the match. The last player standing wins and earns the right to relaunch the next game.
- 🚫 **Strict Architectural Rules**: No `this` keyword in client code, no `<canvas>`, no `<svg>`, no HTML `<table>`, and no jQuery. Rendered purely with Semantic HTML + modern CSS Grid/Flexbox.

### 🌟 Bonus Features Included
- 🏆 **Arcade Scoring System**: Line clears awarded with points (100 / 300 / 500 / 800 pts for Single, Double, Triple, Tetris) + soft & hard drop distance bonuses.
- 💾 **Persistent Hall of Fame**: High scores persist across server restarts in `data/scores.json` and are queryable via REST (`/api/leaderboard`) and in-game UI.
- ⚡ **Increased Gravity Mode**: 3x gravity mode (333ms tick rate) selectable by the room host in the lobby.
- 👻 **Invisible Pieces Mode**: Memory challenge where locked pieces vanish from board rendering during play and reappear on game over.

---

## 🚀 Quick Start (Play in 10 Seconds)

```bash
./start.sh
```
This builds both the client & server, then starts the game at **`http://localhost:3000`**.

---

## 👥 How to Test Multiplayer & Bonus Modes

Testing multiplayer on your local machine is super easy:

1. Run `./start.sh` (or `npm start`).
2. **Tab 1 (Player 1 - Host)**: Open [`http://localhost:3000/#battle/Alice`](http://localhost:3000/#battle/Alice).
   - Alice will see the lobby with **Connected Players (1)**.
   - Alice can choose the game mode: **🕹️ Classic**, **⚡ Increased Gravity**, or **👻 Invisible Pieces**.
3. **Tab 2 (Player 2 - Opponent)**: Open [`http://localhost:3000/#battle/Bob`](http://localhost:3000/#battle/Bob) in a new tab or incognito window.
   - Both tabs immediately update to **Connected Players (2)** and show the selected mode.
4. **Launch**: Click **"Start Multiplayer Game"** in Alice's tab.
   - Both screens start playing at the exact same moment!
   - Watch live scores, lines cleared, and opponent spectra update in real time.
   - Clear 2+ lines to send grey garbage penalty lines to your opponent!
   - When one player tops out, the other is crowned winner and final ranked scores are displayed.

---

## 🕹️ Controls & Navigation

### Keyboard & Touch Controls

| Key / Input | Action |
| :--- | :--- |
| `←` Left Arrow | Move piece left |
| `→` Right Arrow | Move piece right |
| `↑` Up Arrow | Rotate piece clockwise (90°) |
| `↓` Down Arrow | Soft drop (+1 pt per row) |
| `Space` | Hard drop (+2 pts per row, instant lock) |

*Clickable on-screen buttons are also available below the board.*

### URL Routing Format
- `http://<host>:<port>/#<room>/<player_name>`
- `http://<host>:<port>/#<room>[<player_name>]`

---

## 🛠️ Development Setup

Run with live TypeScript watching and Vite Hot-Module Replacement (HMR):

```bash
./dev.sh
```

Or separately in two terminals:
```bash
# Terminal 1: Backend auto-watch (port 3000)
npm run dev:server

# Terminal 2: Frontend with Vite HMR (port 5173 with proxy to 3000)
npm run dev:client
```

Open `http://localhost:5173/` in your browser.

---

## 🏗️ Project Architecture

```
red-tetris/
├── client/                     # Browser React SPA (Vite + React 18)
│   └── src/
│       ├── components/         # Board, Spectrum, PlayerList, Lobby, GameOver
│       ├── hooks/              # useGame, useKeyboard, useSocket
│       ├── pages/              # Home (mode selector & leaderboard), GamePage
│       └── styles.css          # Neon retro arcade styling (CSS Grid/Flexbox)
├── server/                     # Node.js backend
│   └── src/
│       ├── domain/             # OOP models (Player, Piece, Game, GameManager)
│       ├── engine/             # 100% Pure Tetris functions (board, pieces, scoring, etc.)
│       ├── socket/             # Encapsulated Socket.IO middleware & protocol
│       ├── storage/            # ScoreStore (JSON persistence)
│       └── index.ts            # Express server & static asset host
└── tests/                      # Vitest unit & integration test suite (18 suites, 122 tests)
```

### Layer Responsibilities

1. **Pure Game Engine (`server/src/engine/`)**
   - Board creation, piece spawn geometry, collisions, rotation matrices, 1-tick lock delay, line clearing, garbage insertion, spectrum calculation, and scoring formulas.
   - **100% pure functions** — zero side effects, zero mutation, zero timers.

2. **Server Domain (`server/src/domain/`)**
   - **`Player`**: Player board, active piece, bag index, score, lines, and alive flag.
   - **`Piece`**: OOP wrapper around tetromino states.
   - **`Game`**: Manages room state, game mode (`classic`/`speed`/`invisible`), shared 7-bag piece sequence, gravity tick loop, and elimination/winner detection.
   - **`GameManager`**: Isolates concurrent game rooms independently.

3. **Storage Layer (`server/src/storage/`)**
   - **`ScoreStore`**: Persists high scores to `data/scores.json`, sorts descending, auto-prunes, with in-memory fallback.

4. **Socket.IO Layer (`server/src/socket/`)**
   - Fully encapsulated transport layer. All client intentions are validated before reaching domain models.
   - **Client → Server**: `join` (strict name & room validation), `start`, `restart`, `action`, `set_mode`, `get_leaderboard`.
   - **Server → Client**: `lobby`, `state`, `leaderboard`, `rejected` (mid-game block), `error`.

---

## 🧪 Testing & Code Quality

Run the test suite and quality checks:

```bash
npm test                # Run all 122 unit tests across 18 test suites
npm run test:coverage   # Run tests with V8 coverage report
npm run lint            # ESLint static analysis (0 errors, 0 warnings)
npm run typecheck       # TypeScript compiler check (0 errors)
npm run build           # Production bundle build
```

### Coverage Thresholds

| Metric | Required Min | Current Score | Status |
| :--- | :---: | :---: | :---: |
| **Statements** | $\ge 70\%$ | **91.71%** | ✅ Passed |
| **Lines** | $\ge 70\%$ | **91.71%** | ✅ Passed |
| **Functions** | $\ge 70\%$ | **98.55%** | ✅ Passed |
| **Branches** | $\ge 50\%$ | **92.40%** | ✅ Passed |

---

## 🔒 Security & Subject Compliance
- No credentials, tokens, or environment secrets are committed. `.env` is gitignored.
- Fully compliant with all **42 Red Tetris subject rules** (`RULES.md` and `red-tetris.pdf`).
- Complete bonus documentation available in [`bonus.md`](file:///home/aouaziz/Desktop/red-tetris/bonus.md).
