# Red Tetris

Networked multiplayer Tetris — Full Stack JavaScript/TypeScript.

## Architecture

```
red-tetris/
├── client/                React SPA (Vite + React 18)
│   └── src/
│       ├── components/    Board, Spectrum, PlayerList, Lobby, GameOver
│       ├── hooks/         useSocket, useGame, useKeyboard
│       └── pages/         Home, GamePage
├── server/
│   └── src/
│       ├── domain/        Player, Piece, Game, GameManager (OOP classes)
│       ├── engine/        Pure Tetris functions (board, pieces, collision, etc.)
│       └── socket/        Socket.IO middleware (fully encapsulated)
└── tests/                 Vitest test suite
```

**Client** → sends intentions only via Socket.IO  
**Server Domain** → orchestrates Player/Piece/Game lifecycle  
**Pure Engine** → deterministic Tetris rules (no side effects)

## Setup

```bash
npm install
```

## Development

```bash
# Terminal 1: start server
npm run dev:server

# Terminal 2: start client dev server
npm run dev:client
```

Then open `http://localhost:5173/#roomName/playerName`

## Production

```bash
npm run build
npm start
```

Open `http://localhost:3000/#roomName/playerName`

## URL Format

```
http://<host>:<port>/#<room>/<player_name>
```

- **room** — room name (max 50 chars)
- **player_name** — your display name (max 50 chars)
- First player to join becomes the host and can start the game
- After a game ends, the winner can restart

## Controls

| Key   | Action     |
| ----- | ---------- |
| ←     | Move left  |
| →     | Move right |
| ↑     | Rotate     |
| ↓     | Soft drop  |
| Space | Hard drop  |

Accessible HTML button controls are also available below the board.

## Game Rules

- **Board**: 10 columns × 20 rows
- **Pieces**: I, O, T, S, Z, J, L — standard Tetrimino shapes
- **Gravity**: constant speed, 1-tick lock delay (hard drop locks immediately)
- **Garbage**: clearing `n` lines sends `n − 1` indestructible lines to opponents
- **Spectrum**: 10 column heights shown for each opponent
- **Piece sequence**: all players share the same deterministic sequence
- **Winner**: last player standing in multiplayer; solo play supported

## Testing

```bash
npm test                # run all tests
npm run test:coverage   # run tests with coverage report
npm run lint            # ESLint
npm run typecheck       # TypeScript type checking
```

### Coverage Thresholds

| Metric     | Min |
| ---------- | --- |
| Statements | 70% |
| Functions  | 70% |
| Lines      | 70% |
| Branches   | 50% |

## Socket.IO Protocol

### Client → Server

| Event     | Payload                                          | Description                           |
| --------- | ------------------------------------------------ | ------------------------------------- |
| `join`    | `{ room: string, name: string }`                 | Join a room                           |
| `start`   | —                                                | Start the game (host/launcher only)   |
| `restart` | —                                                | Restart after game over (winner only) |
| `action`  | `string` (`left`/`right`/`rotate`/`soft`/`hard`) | Player intention                      |

### Server → Client

| Event   | Payload     | Description                         |
| ------- | ----------- | ----------------------------------- |
| `lobby` | `LobbyView` | Lobby state update                  |
| `state` | `StateView` | Game state (board, spectra, status) |
| `error` | `string`    | Error message                       |
