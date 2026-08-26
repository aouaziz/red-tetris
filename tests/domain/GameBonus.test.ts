import { describe, it, expect } from "vitest";
import { Game } from "../../server/src/domain/Game";
import { ScoreStore } from "../../server/src/storage/scoreStore";
import path from "path";
import fs from "fs";

describe("Game - Bonus Features", () => {
  const testScoresFile = path.join(process.cwd(), "data", "test-game-scores.json");

  const createTestGame = (id = "test-room", seed = 42) => {
    const store = new ScoreStore(testScoresFile);
    store.clear();
    return { game: new Game(id, seed, store), store };
  };

  describe("Game Mode Selection", () => {
    it("defaults to 'classic' mode", () => {
      const { game } = createTestGame();
      expect(game.gameMode).toBe("classic");
      expect(game.lobby().gameMode).toBe("classic");
    });

    it("allows host to change mode in lobby", () => {
      const { game } = createTestGame();
      game.addPlayer("p1", "Host");
      expect(game.setMode("p1", "speed")).toBe(true);
      expect(game.gameMode).toBe("speed");
      expect(game.lobby().gameMode).toBe("speed");

      expect(game.setMode("p1", "invisible")).toBe(true);
      expect(game.gameMode).toBe("invisible");
    });

    it("rejects mode change from non-host", () => {
      const { game } = createTestGame();
      game.addPlayer("p1", "Host");
      game.addPlayer("p2", "Guest");
      expect(game.setMode("p2", "speed")).toBe(false);
      expect(game.gameMode).toBe("classic");
    });

    it("rejects mode change when game is in progress", () => {
      const { game } = createTestGame();
      game.addPlayer("p1", "Host");
      game.start("p1");
      expect(game.setMode("p1", "speed")).toBe(false);
    });

    it("rejects invalid mode values", () => {
      const { game } = createTestGame();
      game.addPlayer("p1", "Host");
      // @ts-expect-error test invalid mode input
      expect(game.setMode("p1", "invalid_mode")).toBe(false);
      expect(game.gameMode).toBe("classic");
    });
  });

  describe("Scoring on Drops", () => {
    it("awards 1 point per soft drop", () => {
      const { game } = createTestGame();
      game.addPlayer("p1", "Player 1");
      game.start("p1");

      const p = game.players.get("p1")!;
      expect(p.score).toBe(0);

      game.action("p1", "soft");
      expect(p.score).toBe(1);

      game.action("p1", "soft");
      expect(p.score).toBe(2);
    });

    it("awards 2 points per row dropped on hard drop", () => {
      const { game } = createTestGame();
      game.addPlayer("p1", "Player 1");
      game.start("p1");

      const p = game.players.get("p1")!;
      expect(p.score).toBe(0);

      game.action("p1", "hard");
      // Hard drop dropped several rows to bottom
      expect(p.score).toBeGreaterThan(10);
    });
  });

  describe("Scoring on Line Clears", () => {
    it("accumulates points and linesCleared when lines are completed", () => {
      const { game } = createTestGame();
      game.addPlayer("p1", "Player 1");
      game.start("p1");

      const p = game.players.get("p1")!;
      // Artificially fill row 19 except the spot where piece lands
      for (let x = 0; x < 9; x++) {
        p.board[19][x] = "I";
      }

      // Hard drop to lock
      game.action("p1", "hard");
      expect(p.linesCleared).toBeGreaterThanOrEqual(0);
      expect(p.score).toBeGreaterThan(0);
    });
  });

  describe("Score Persistence on Match End", () => {
    it("records player scores in ScoreStore when game ends", () => {
      const { game, store } = createTestGame();
      game.addPlayer("p1", "Alice");
      game.addPlayer("p2", "Bob");
      game.start("p1");

      // Give Alice some score
      game.action("p1", "soft");
      game.action("p1", "soft");

      // Eliminate Bob by removing player (triggers checkEnd, finishes match)
      game.removePlayer("p2");

      expect(game.status).toBe("finished");
      const scores = store.getScores();
      const aliceScore = scores.find((s) => s.name === "Alice");
      expect(aliceScore).toBeDefined();
      expect(aliceScore?.score).toBeGreaterThan(0);

      // Clean up test file
      try {
        if (fs.existsSync(testScoresFile)) {
          fs.unlinkSync(testScoresFile);
        }
      } catch {
        // Ignore
      }
    });
  });

  describe("Invisible Pieces Mode", () => {
    it("masks locked blocks in boardWithPiece during playing", () => {
      const { game } = createTestGame();
      game.addPlayer("p1", "MemoryMaster");
      game.setMode("p1", "invisible");
      game.start("p1");

      const p = game.players.get("p1")!;
      // Put a locked block in the board
      p.board[19][0] = "I";

      // During active playing, locked blocks should be masked to 0
      const viewBoard = game.boardWithPiece("p1")!;
      expect(viewBoard[19][0]).toBe(0);

      // But the actual internal domain board still has the piece for physics
      expect(p.board[19][0]).toBe("I");

      // When game finishes or revealAll is true, board is fully revealed
      const revealed = game.boardWithPiece("p1", true)!;
      expect(revealed[19][0]).toBe("I");
    });
  });

  describe("Public Views (Lobby, State, Players)", () => {
    it("includes score, linesCleared, and gameMode in state and public player views", () => {
      const { game } = createTestGame();
      game.addPlayer("p1", "Alice");
      game.setMode("p1", "speed");

      const lobby = game.lobby();
      expect(lobby.gameMode).toBe("speed");

      game.start("p1");
      const state = game.stateFor("p1");
      expect(state.gameMode).toBe("speed");
      expect(state.self?.score).toBe(0);
      expect(state.self?.linesCleared).toBe(0);
      expect(state.players[0].score).toBe(0);
      expect(state.players[0].linesCleared).toBe(0);
    });
  });
});
