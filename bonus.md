

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
| Scoring               | Not started | |
| Score persistence      | Not started | |
| Increased gravity mode | Not started | |
| Invisible pieces mode  | Not started | |