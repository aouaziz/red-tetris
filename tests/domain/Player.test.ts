import { describe, it, expect } from "vitest";
import { Player } from "../../server/src/domain/Player";
import { Piece } from "../../server/src/domain/Piece";

describe("Player", () => {
  it("constructor sets id, name, creates 10x20 board, alive=true, index=0", () => {
    const player = new Player("id1", "p1");
    expect(player.id).toBe("id1");
    expect(player.name).toBe("p1");
    expect(player.alive).toBe(true);
    expect(player.index).toBe(0);
    expect(player.board).toBeDefined();
    expect(player.board.length).toBe(20);
    expect(player.board[0].length).toBe(10);
    expect(player.piece).toBeNull();
    expect(player.pendingGarbage).toBe(0);
    expect(player.lockPending).toBe(false);
  });

  it("reset() clears board, sets alive=true, index=0, piece=null, pendingGarbage=0, lockPending=false", () => {
    const player = new Player("id1", "p1");
    player.alive = false;
    player.index = 5;
    player.piece = new Piece("T", 0, 0, 0);
    player.pendingGarbage = 3;
    player.lockPending = true;
    player.board[0][0] = "T";

    player.reset();

    expect(player.alive).toBe(true);
    expect(player.index).toBe(0);
    expect(player.piece).toBeNull();
    expect(player.pendingGarbage).toBe(0);
    expect(player.lockPending).toBe(false);
    expect(player.board[0][0]).toBe(0);
  });
});
