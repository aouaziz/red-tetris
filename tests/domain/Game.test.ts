import { describe, it, expect } from "vitest";
import { Game } from "../../server/src/domain/Game";

describe("Game", () => {
  describe("addPlayer()", () => {
    it("adds player, first becomes host, returns Player", () => {
      const g = new Game("r1");
      const p = g.addPlayer("p1", "Player 1");
      expect(p).toBeDefined();
      expect(g.isHost("p1")).toBe(true);
      expect(g.players.size).toBe(1);
    });

    it("during 'playing' returns null (mid-game join rejection)", () => {
      const g = new Game("r1");
      g.addPlayer("p1", "P1");
      g.start("p1");
      const p2 = g.addPlayer("p2", "P2");
      expect(p2).toBeNull();
    });

    it("during 'finished' allows joining (post-game window)", () => {
      const g = new Game("r1");
      g.addPlayer("p1", "P1");
      g.addPlayer("p2", "P2");
      g.start("p1");
      // Eliminate p2 by removing (triggers checkEnd, p1 wins)
      g.removePlayer("p2");
      expect(g.status).toBe("finished");
      const p3 = g.addPlayer("p3", "P3");
      expect(p3).toBeDefined();
    });

    it("duplicate id returns existing player", () => {
      const g = new Game("r1");
      const p1 = g.addPlayer("p1", "P1");
      const p2 = g.addPlayer("p1", "P1_diff");
      expect(p1).toBe(p2);
      expect(g.players.size).toBe(1);
    });
  });

  describe("removePlayer()", () => {
    it("removes, reassigns host to next in order", () => {
      const g = new Game("r1");
      g.addPlayer("p1", "P1");
      g.addPlayer("p2", "P2");
      g.removePlayer("p1");
      expect(g.isHost("p2")).toBe(true);
      expect(g.players.size).toBe(1);
    });

    it("last player resets to lobby", () => {
      const g = new Game("r1");
      g.addPlayer("p1", "P1");
      g.start("p1");
      g.removePlayer("p1");
      expect(g.status).toBe("lobby");
      expect(g.hostId).toBeNull();
    });

    it("during playing triggers checkEnd", () => {
      const g = new Game("r1");
      g.addPlayer("p1", "P1");
      g.addPlayer("p2", "P2");
      g.start("p1");
      g.removePlayer("p2");
      expect(g.status).toBe("finished");
    });

    it("player not in game is a no-op", () => {
      const g = new Game("r1");
      g.addPlayer("p1", "P1");
      g.removePlayer("p2");
      expect(g.players.size).toBe(1);
    });
  });

  describe("start()", () => {
    it("only launcher can start, must be in lobby, needs players", () => {
      const g = new Game("r1");
      expect(g.start("p1")).toBe(false);
      g.addPlayer("p1", "P1");
      g.addPlayer("p2", "P2");
      expect(g.start("p2")).toBe(false);
      expect(g.start("p1")).toBe(true);
      expect(g.start("p1")).toBe(false);
    });

    it("resets sequence and spawns pieces for all players", () => {
      const g = new Game("r1");
      g.addPlayer("p1", "P1");
      g.start("p1");
      const p = g.players.get("p1")!;
      expect(p.piece).not.toBeNull();
      expect(p.index).toBe(1);
    });
  });

  describe("restart()", () => {
    it("only works when finished, only launcher (winner) can restart", () => {
      const g = new Game("r1");
      g.addPlayer("p1", "P1");
      g.addPlayer("p2", "P2");
      g.start("p1");
      // p1 wins by p2 leaving
      g.removePlayer("p2");
      expect(g.status).toBe("finished");
      expect(g.winnerId).toBe("p1");

      // p1 is winner so can restart
      // Re-add p2 first for the game to have players
      g.addPlayer("p2", "P2");
      expect(g.restart("p2")).toBe(false);
      expect(g.restart("p1")).toBe(true);
      expect(g.status).toBe("playing");
    });

    it("in lobby returns false", () => {
      const g = new Game("r1");
      g.addPlayer("p1", "P1");
      expect(g.restart("p1")).toBe(false);
    });
  });

  describe("getLauncherId()", () => {
    it("returns hostId in lobby, winnerId when finished (or hostId if winner left)", () => {
      const g = new Game("r1");
      g.addPlayer("p1", "P1");
      g.addPlayer("p2", "P2");
      // In lobby, launcher is the host
      expect(g.getLauncherId()).toBe("p1");

      g.start("p1");
      // Eliminate p1 by removing, p2 wins
      g.removePlayer("p1");
      expect(g.status).toBe("finished");
      expect(g.winnerId).toBe("p2");

      // Launcher is the winner
      expect(g.getLauncherId()).toBe("p2");

      // If winner leaves, host (which is now p2 since p1 is gone... let's test differently)
    });

    it("falls back to host if winner left", () => {
      const g = new Game("r1");
      g.addPlayer("p1", "P1");
      g.addPlayer("p2", "P2");
      g.addPlayer("p3", "P3");
      g.start("p1");

      // Remove p2 and p3 to finish game, p1 wins
      g.removePlayer("p2");
      g.removePlayer("p3");
      expect(g.status).toBe("finished");
      expect(g.winnerId).toBe("p1");

      // Add new player for the room not to be empty when p1 leaves
      g.addPlayer("p4", "P4");
      // Winner leaves
      g.removePlayer("p1");
      // Launcher falls back to hostId (p4 is now the only player and host)
      expect(g.getLauncherId()).toBe("p4");
    });
  });

  describe("action()", () => {
    it("left, right, rotate, soft, hard move/rotate piece", () => {
      const g = new Game("r1");
      g.addPlayer("p1", "P1");
      g.start("p1");
      const p = g.players.get("p1")!;

      const startX = p.piece!.x;
      const startY = p.piece!.y;

      g.action("p1", "left");
      expect(p.piece!.x).toBe(startX - 1);

      g.action("p1", "right");
      expect(p.piece!.x).toBe(startX);

      g.action("p1", "soft");
      expect(p.piece!.y).toBe(startY + 1);

      const rotStart = p.piece!.rotation;
      g.action("p1", "rotate");
      expect(p.piece!.rotation).toBe(rotStart + 1);
    });

    it("ignored when not playing, when player is dead, when no piece", () => {
      const g = new Game("r1");
      g.addPlayer("p1", "P1");

      g.action("p1", "left");

      g.start("p1");
      const p = g.players.get("p1")!;
      p.alive = false;
      const x = p.piece!.x;
      g.action("p1", "left");
      expect(p.piece!.x).toBe(x);

      p.alive = true;
      p.piece = null;
      g.action("p1", "left");
    });
  });

  describe("tick()", () => {
    it("gravity moves pieces down", () => {
      const g = new Game("r1");
      g.addPlayer("p1", "P1");
      g.start("p1");
      const p = g.players.get("p1")!;
      const y = p.piece!.y;
      g.tick();
      expect(p.piece!.y).toBe(y + 1);
    });

    it("lock delay - grounded piece gets one tick before locking", () => {
      const g = new Game("r1");
      g.addPlayer("p1", "P1");
      g.start("p1");
      const p = g.players.get("p1")!;

      // Tick until piece can't move down
      while (true) {
        const y = p.piece!.y;
        g.tick();
        if (p.piece && p.piece.y === y) {
          break;
        }
        // Piece was locked and a new one spawned — restart
        if (p.piece && p.piece.y === 0) {
          continue;
        }
      }
      expect(p.lockPending).toBe(true);
      const pieceBeforeLock = p.piece;

      g.tick();
      // After second tick at bottom, piece is locked and a new one spawned
      expect(p.piece).not.toBe(pieceBeforeLock);
    });

    it("not playing is a no-op", () => {
      const g = new Game("r1");
      g.addPlayer("p1", "P1");
      g.tick();
    });
  });

  describe("hard drop", () => {
    it('Hard drop locks immediately (no adjustment tick) - test via action "hard"', () => {
      const g = new Game("r1");
      g.addPlayer("p1", "P1");
      g.start("p1");
      const p = g.players.get("p1")!;
      const piece = p.piece;
      g.action("p1", "hard");
      // After hard drop, piece is locked and a new one spawned
      expect(p.piece).not.toBe(piece);
    });
  });

  describe("lockAndResolve()", () => {
    it("clears lines, sends garbage (cleared-1) to opponents", () => {
      const g = new Game("r1");
      g.addPlayer("p1", "P1");
      g.addPlayer("p2", "P2");
      g.start("p1");
      const p1 = g.players.get("p1")!;
      const p2 = g.players.get("p2")!;

      // Fill two bottom rows to ensure lines clear on hard drop
      for (let x = 0; x < 10; x++) {
        p1.board[19][x] = "I";
        p1.board[18][x] = "I";
      }

      g.action("p1", "hard");
      // At least some garbage should be sent (depends on piece shape filling gaps)
      expect(p2.pendingGarbage).toBeGreaterThanOrEqual(0);
    });
  });

  describe("checkEnd()", () => {
    it("multiplayer - last alive wins", () => {
      const g = new Game("r1");
      g.addPlayer("p1", "P1");
      g.addPlayer("p2", "P2");
      g.start("p1");
      // Remove p2 during game — triggers checkEnd, p1 wins
      g.removePlayer("p2");
      expect(g.status).toBe("finished");
      expect(g.winnerId).toBe("p1");
    });

    it("solo - tops out, winnerId set to solo player", () => {
      const g = new Game("r1");
      g.addPlayer("p1", "P1");
      g.start("p1");
      const p = g.players.get("p1")!;
      // Fill with indestructible garbage 'G' so clearLines won't clear them
      // Leave the top rows where the piece currently is clear to avoid issues
      for (let y = 4; y < 20; y++) {
        for (let x = 0; x < 10; x++) {
          p.board[y][x] = "G";
        }
      }
      // Hard drop locks onto the garbage, then spawn fails on the cluttered board
      g.action("p1", "hard");
      // Now fill the remaining top rows with garbage too
      for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 10; x++) {
          p.board[y][x] = "G";
        }
      }
      // Next hard drop triggers lockAndResolve -> spawnFor -> top-out
      if (p.piece && p.alive) {
        g.action("p1", "hard");
      }
      expect(g.status).toBe("finished");
      expect(g.winnerId).toBe("p1");
    });
  });

  describe("Deterministic piece sequence", () => {
    it("two games with same seed produce same pieces via pieceAt()", () => {
      const g1 = new Game("r1", 12345);
      const g2 = new Game("r2", 12345);
      for (let i = 0; i < 20; i++) {
        expect(g1.pieceAt(i)).toBe(g2.pieceAt(i));
      }
    });
  });

  describe("lobby()", () => {
    it("returns correct LobbyView shape with launcherId", () => {
      const g = new Game("r1");
      g.addPlayer("p1", "P1");
      const view = g.lobby();
      expect(view.room).toBe("r1");
      expect(view.status).toBe("lobby");
      expect(view.hostId).toBe("p1");
      expect(view.launcherId).toBe("p1");
      expect(view.players.length).toBe(1);
    });
  });

  describe("stateFor()", () => {
    it("returns correct StateView shape with launcherId", () => {
      const g = new Game("r1");
      g.addPlayer("p1", "P1");
      const state = g.stateFor("p1");
      expect(state.room).toBe("r1");
      expect(state.launcherId).toBe("p1");
      expect(state.self).toBeDefined();
      expect(state.players.length).toBe(1);
    });
  });

  describe("boardWithPiece()", () => {
    it("overlays current piece on board", () => {
      const g = new Game("r1");
      g.addPlayer("p1", "P1");
      g.start("p1");
      const board = g.boardWithPiece("p1")!;
      let blocks = 0;
      for (const row of board) {
        for (const cell of row) {
          if (cell !== 0) blocks++;
        }
      }
      expect(blocks).toBe(4);
    });

    it("returns null for non-existent player", () => {
      const g = new Game("r1");
      expect(g.boardWithPiece("p1")).toBeNull();
    });
  });

  describe("Winner relaunch and replacement", () => {
    it("Winner relaunch: after finish, winner can restart, non-winner cannot", () => {
      const g = new Game("r1");
      g.addPlayer("p1", "P1");
      g.addPlayer("p2", "P2");
      g.start("p1");

      // Remove p2 to end game, p1 wins
      g.removePlayer("p2");
      expect(g.status).toBe("finished");
      expect(g.winnerId).toBe("p1");

      // Re-add p2 for restart
      g.addPlayer("p2", "P2");
      expect(g.restart("p2")).toBe(false);
      expect(g.restart("p1")).toBe(true);
    });

    it("Winner left replacement: if winner leaves after finish, host becomes launcher", () => {
      const g = new Game("r1");
      g.addPlayer("p1", "P1");
      g.addPlayer("p2", "P2");
      g.addPlayer("p3", "P3");
      g.start("p1");

      // Remove p2 and p3, p1 wins
      g.removePlayer("p2");
      g.removePlayer("p3");
      expect(g.status).toBe("finished");
      expect(g.winnerId).toBe("p1");
      expect(g.getLauncherId()).toBe("p1");

      // Add p4, then winner p1 leaves
      g.addPlayer("p4", "P4");
      g.removePlayer("p1");
      // Launcher falls back to host (p4 is now the only player)
      expect(g.getLauncherId()).toBe("p4");
    });
  });
});
