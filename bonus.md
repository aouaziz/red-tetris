

# Red Tetris — Bonus

## Gate (read this first)

Bonus is only evaluated if the mandatory part is **PERFECT**: fully
completed, with behavior that can't be faulted by even the slightest
mistake or improper use. One mandatory flaw → **zero** bonus counted,
no matter how good the bonus work is.

Each bonus feature is graded individually, 0–5, and must be:

- **At least a little useful** (evaluator's discretion)
- **Well implemented and 100% functional** — no partial/half-working
  bonus features. A broken bonus is worse than no bonus.

There is **no fixed number of bonus features required** — this isn't
stated anywhere in the subject or the evaluation scale. Quality and
completeness per feature matter more than count. Don't build more
bonus than you can make airtight.

## Candidate Features

Only the ones the subject explicitly names, in order of simplicity.
Pick a subset you can finish *perfectly* — fewer, solid bonuses beat
many shaky ones.

1. **Scoring system** — points per player (e.g. per line/lines
   cleared). Simplest bonus to implement cleanly.
2. **Score persistence** — scores survive past one session/process
   restart. No DB required elsewhere in the project, but this is
   literally what this bonus asks for — a lightweight store (flat
   file, SQLite, etc.) is enough. Keep it isolated from mandatory
   game state.
3. **New game mode: increased gravity** — faster fall speed, toggle
   or selectable at game start.
4. **New game mode: invisible pieces** — pieces render then vanish
   (or never render), forcing memory-based play. Toggle at game start.
5. *(Optional, advanced — subject explicitly calls this an exploration,
   not a requirement)* Functional Reactive Programming with a library
   like `flyd`, instead of the default React approach. Only worth
   doing if you want to go deeper into FRP for its own sake — it does
   not "count more" as a bonus than the simpler ones above.

## Isolation Rule

Bonus code must never touch or risk the mandatory engine/domain/socket
logic. Prefer additive changes (new events, new optional fields, new
toggles) over modifying existing mandatory code paths. If a bonus
feature can't be added without touching mandatory logic, isolate that
touch point behind a flag/interface so mandatory behavior is
unaffected when the flag is off.

## Status

Track progress here as you go:

| Feature              | Status      | Notes |
|-----------------------|------------|-------|
| Scoring               | Completed ✅ | Pure scoring engine (`scoring.ts`), arcade point rules (100/300/500/800 per lines + drop bonuses), HUD counters, live opponent spectrum score tags |
| Score persistence      | Completed ✅ | Lightweight persistent JSON `ScoreStore`, REST endpoint `/api/leaderboard`, real-time Hall of Fame on Home, top scores recorded on match end |
| Increased gravity mode | Completed ✅ | Fast gravity mode (3x speed), toggleable in lobby by host, mode badges on HUD and lobby cards |
| Invisible pieces mode  | Completed ✅ | Memory challenge mode, locked pieces masked during gameplay, revealed on game over, selectable in lobby |

## Implementation Summary

All 4 candidate bonus features are 100% complete and fully tested:
- **Pure Engine**: [`scoring.ts`](file:///home/ghizlan/Desktop/redtetris/server/src/engine/scoring.ts) calculates line clear and drop points deterministically.
- **Persistent Storage**: [`scoreStore.ts`](file:///home/ghizlan/Desktop/redtetris/server/src/storage/scoreStore.ts) safely stores high scores to disk with automatic sorting and pruning.
- **Domain & Socket**: [`Game.ts`](file:///home/ghizlan/Desktop/redtetris/server/src/domain/Game.ts), [`Player.ts`](file:///home/ghizlan/Desktop/redtetris/server/src/domain/Player.ts), and [`handler.ts`](file:///home/ghizlan/Desktop/redtetris/server/src/socket/handler.ts) cleanly integrate modes, scoring, and leaderboard broadcasts without violating mandatory rules.
- **Client SPA**: [`Home.tsx`](file:///home/ghizlan/Desktop/redtetris/client/src/pages/Home.tsx), [`Lobby.tsx`](file:///home/ghizlan/Desktop/redtetris/client/src/components/Lobby.tsx), [`GamePage.tsx`](file:///home/ghizlan/Desktop/redtetris/client/src/pages/GamePage.tsx), and [`GameOver.tsx`](file:///home/ghizlan/Desktop/redtetris/client/src/components/GameOver.tsx) provide an arcade retro HUD, mode selector cards, and match standings table.
- **Strict Subject Rules**: 0 `this` on client, 0 canvas/svg/tables, 0 linter errors, 0 type errors, and **>91% test coverage across all metrics** (122 passing tests).