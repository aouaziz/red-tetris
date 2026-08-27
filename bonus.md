# Red Tetris — Bonus Documentation

This document details all **bonus features**, **architectural design**, and **modifications** implemented in Red Tetris, along with verification instructions.

---

## 1. Overview of Implemented Bonus Features

All 4 candidate bonus features from the subject have been implemented with **100% functionality**, comprehensive unit & integration tests, and strict adherence to the project rules (0 `this` on client, pure functional engine, 0 `<table>`/`<canvas>`/`<svg>`, no external UI frameworks).

| Bonus Feature | Description | Key Files |
| :--- | :--- | :--- |
| **1. Scoring System** | Standard arcade point calculation (100 / 300 / 500 / 800 pts for 1–4 lines) + soft/hard drop bonuses with real-time HUD and opponent score badges. | [`server/src/engine/scoring.ts`](file:///home/aouaziz/Desktop/red-tetris/server/src/engine/scoring.ts)<br>[`client/src/pages/GamePage.tsx`](file:///home/aouaziz/Desktop/red-tetris/client/src/pages/GamePage.tsx) |
| **2. Persistent Leaderboard** | High scores persist across server restarts via [`ScoreStore`](file:///home/aouaziz/Desktop/red-tetris/server/src/storage/scoreStore.ts) with JSON storage in `data/scores.json`, exposed via REST (`/api/leaderboard`) and socket sync, with an interactive Hall of Fame UI. | [`server/src/storage/scoreStore.ts`](file:///home/aouaziz/Desktop/red-tetris/server/src/storage/scoreStore.ts)<br>[`server/src/index.ts`](file:///home/aouaziz/Desktop/red-tetris/server/src/index.ts)<br>[`client/src/pages/Home.tsx`](file:///home/aouaziz/Desktop/red-tetris/client/src/pages/Home.tsx) |
| **3. Increased Gravity Mode** | Fast-paced mode (3x gravity: 333ms ticks) selectable in the lobby by the room host, synchronized across all players. | [`server/src/domain/Game.ts`](file:///home/aouaziz/Desktop/red-tetris/server/src/domain/Game.ts)<br>[`client/src/components/Lobby.tsx`](file:///home/aouaziz/Desktop/red-tetris/client/src/components/Lobby.tsx) |
| **4. Invisible Pieces Mode** | Memory challenge mode where locked pieces vanish from board rendering during play and are revealed upon game over. | [`server/src/domain/Game.ts`](file:///home/aouaziz/Desktop/red-tetris/server/src/domain/Game.ts)<br>[`client/src/hooks/useGame.ts`](file:///home/aouaziz/Desktop/red-tetris/client/src/hooks/useGame.ts) |

---

## 2. Architecture & Design Principles

### A. Non-Breaking Isolation Rule
Bonus features are strictly **additive** and do not alter mandatory mechanics in `classic` mode:
- Default mode is always `classic` (1000ms gravity tick rate, visible locked pieces).
- Core engine modules remain pure functions without side effects.
- Socket protocol remains 100% backwards-compatible.

### B. Pure Functional Scoring Engine
The scoring logic in [`server/src/engine/scoring.ts`](file:///home/aouaziz/Desktop/red-tetris/server/src/engine/scoring.ts) is implemented as pure functions:
- `calculateLineScore(linesCleared: number): number`
  - 1 Line: **100 pts**
  - 2 Lines: **300 pts**
  - 3 Lines: **500 pts**
  - 4 Lines (Tetris): **800 pts**
- `calculateDropScore(type: 'soft' | 'hard', rows: number): number`
  - Soft drop: **1 pt** per row
  - Hard drop: **2 pts** per row

### C. Persistent Storage Layer
Located in [`server/src/storage/scoreStore.ts`](file:///home/aouaziz/Desktop/red-tetris/server/src/storage/scoreStore.ts):
- Scores persist to `data/scores.json`.
- Automatic descending sort by score.
- Auto-prunes to the top 50 scores.
- Graceful in-memory fallback if the filesystem is read-only or in testing environments.
- Exposed via `GET /api/leaderboard` for REST queries and socket broadcasting.

---

## 3. How Each Feature Works

### Feature 1: Real-Time Scoring System
1. When a player soft/hard drops or clears lines, [`Game.ts`](file:///home/aouaziz/Desktop/red-tetris/server/src/domain/Game.ts) invokes `calculateLineScore` and `calculateDropScore`.
2. Score and lines cleared are tracked on the [`Player`](file:///home/aouaziz/Desktop/red-tetris/server/src/domain/Player.ts) model.
3. Every `state` broadcast includes the player's current `score` and `linesCleared`.
4. The Game HUD renders live `Score` and `Lines` counters with the active mode badge.

### Feature 2: High Score Persistence & Hall of Fame
1. When a player finishes a game with `score > 0`, their score is recorded in `ScoreStore` with player name, lines cleared, game mode, and timestamp.
2. On [`Home.tsx`](file:///home/aouaziz/Desktop/red-tetris/client/src/pages/Home.tsx), the **Leaderboard** tab displays the ranked Hall of Fame with medals (🥇, 🥈, 🥉), lines cleared, mode tags, and a live refresh button.
3. On [`GameOver.tsx`](file:///home/aouaziz/Desktop/red-tetris/client/src/components/GameOver.tsx), a match summary table shows final rankings, lines, and points.

### Feature 3: Increased Gravity Mode (`speed`)
1. In the lobby, the host can select the **Increased Gravity** mode card.
2. The host emits `set_mode` with `{ mode: "speed" }`, broadcasting updated lobby state to all players.
3. Upon launch, gravity runs at 333ms per tick (3x faster than classic 1000ms).
4. The in-game HUD displays a `⚡ Fast Gravity` badge.

### Feature 4: Invisible Pieces Mode (`invisible`)
1. In the lobby, the host selects **Invisible Pieces** mode (`set_mode` with `{ mode: "invisible" }`).
2. Falling active pieces remain visible so players can control their placement.
3. Once a piece locks into the grid, locked cells are masked from the client board rendering.
4. Opponent spectra are similarly masked to maintain competitive fairness.
5. When the game ends, the complete board is revealed.
6. The in-game HUD displays a `👻 Invisible` badge.

---

## 4. Socket Protocol Specifications

The following events support the bonus features:

| Event | Direction | Payload | Purpose |
| :--- | :--- | :--- | :--- |
| `set_mode` | Client → Server | `{ mode: 'classic' \| 'speed' \| 'invisible' }` | Host selects game mode in lobby |
| `get_leaderboard` | Client → Server | `{ limit?: number }` | Client requests top scores via socket |
| `leaderboard` | Server → Client | `ScoreEntry[]` | Server returns high score entries |
| `state` | Server → Client | *(extended)* `{ self: { score, linesCleared, ... }, gameMode, ... }` | Broadcasts live score & mode |

---

## 5. Testing & Verification

### Automated Test Suites
```bash
npm test                # Run all 122 tests
npm run test:coverage   # Run coverage report (91.71% statements, 92.40% branches, 98.55% functions)
```

### Manual Verification
1. **Start the server**: `./start.sh` and open `http://localhost:3000`.
2. **Leaderboard**: Click the **🏆 Leaderboard** tab on Home to view top scores. Test REST: `curl http://localhost:3000/api/leaderboard`.
3. **Scoring**: Play a game, perform soft/hard drops and line clears, observe real-time score updates.
4. **Fast Gravity**: In the lobby, host selects **Increased Gravity (⚡)** and starts match (pieces fall 3x faster).
5. **Invisible Mode**: In the lobby, host selects **Invisible Pieces (👻)** and starts match (locked pieces vanish until game over).