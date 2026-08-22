import { Board, TetrominoType } from "../engine/types";
import { COLS, lockPiece } from "../engine/board";
import { isValidPosition } from "../engine/collision";
import { tryMove } from "../engine/movement";
import { tryRotate } from "../engine/rotation";
import { hardDrop } from "../engine/gravity";
import { clearLines } from "../engine/lines";
import { addGarbage } from "../engine/garbage";
import { getSpectrum } from "../engine/spectrum";
import { pieceCells, TETROMINOES } from "../engine/pieces";
import { Player } from "./Player";
import { Piece } from "./Piece";

export type GameStatus = "lobby" | "playing" | "finished";
export type ActionType = "left" | "right" | "rotate" | "soft" | "hard";

// Small deterministic PRNG so a seeded game replays an identical piece
// sequence (used for tests and reproducibility).
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface PublicPlayer {
  id: string;
  name: string;
  alive: boolean;
  isHost: boolean;
  spectrum: number[];
}

export interface LobbyView {
  room: string;
  status: GameStatus;
  hostId: string | null;
  launcherId: string | null;
  players: { id: string; name: string; isHost: boolean; alive: boolean }[];
}

export interface StateView {
  room: string;
  status: GameStatus;
  hostId: string | null;
  launcherId: string | null;
  winnerId: string | null;
  self: { id: string; name: string; alive: boolean; board: Board } | null;
  players: PublicPlayer[];
}

// Orchestrates a single room. The Game owns players, the shared piece sequence
// and lifecycle; all Tetris rules are delegated to the pure engine.
export class Game {
  readonly id: string;
  readonly players = new Map<string, Player>();
  order: string[] = [];
  hostId: string | null = null;
  status: GameStatus = "lobby";
  winnerId: string | null = null;

  private readonly seed: number;
  private rng: () => number;
  private sequence: TetrominoType[] = [];
  private startedWith = 0;

  constructor(id: string, seed?: number) {
    this.id = id;
    this.seed = seed ?? (Math.random() * 1e9) | 0;
    this.rng = mulberry32(this.seed);
  }

  // --- player management -------------------------------------------------

  addPlayer(id: string, name: string): Player | null {
    if (this.status === "playing") {
      return null; // no joining mid-game
    }
    const existing = this.players.get(id);
    if (existing) {
      return existing;
    }
    const player = new Player(id, name);
    this.players.set(id, player);
    this.order.push(id);
    if (this.hostId === null) {
      this.hostId = id;
    }
    return player;
  }

  removePlayer(id: string): void {
    if (!this.players.has(id)) {
      return;
    }
    this.players.delete(id);
    this.order = this.order.filter((x) => x !== id);
    if (this.hostId === id) {
      this.hostId = this.order[0] ?? null;
    }
    if (this.status === "playing") {
      this.checkEnd();
    }
    if (this.players.size === 0) {
      this.status = "lobby";
      this.hostId = null;
    }
  }

  isHost(id: string): boolean {
    return this.hostId === id;
  }

  // Who can (re)launch the game right now?
  // • finished → the winner, or the host if the winner already left
  // • lobby    → the host
  getLauncherId(): string | null {
    if (this.status === "finished") {
      if (this.winnerId && this.players.has(this.winnerId)) {
        return this.winnerId;
      }
      return this.hostId;
    }
    return this.hostId;
  }

  // --- shared piece sequence --------------------------------------------

  private bag(): TetrominoType[] {
    const b = TETROMINOES.slice();
    for (let i = b.length - 1; i > 0; i--) {
      const j = Math.floor(this.rng() * (i + 1));
      [b[i], b[j]] = [b[j], b[i]];
    }
    return b;
  }

  pieceAt(index: number): TetrominoType {
    while (this.sequence.length <= index) {
      this.sequence.push(...this.bag());
    }
    return this.sequence[index];
  }

  // --- lifecycle ---------------------------------------------------------

  start(byId: string): boolean {
    if (
      this.getLauncherId() !== byId ||
      this.status === "playing" ||
      this.players.size === 0
    ) {
      return false;
    }
    this.rng = mulberry32(this.seed);
    this.sequence = [];
    this.status = "playing";
    this.winnerId = null;
    this.startedWith = this.players.size;
    for (const player of this.players.values()) {
      player.reset();
      this.spawnFor(player);
    }
    return true;
  }

  restart(byId: string): boolean {
    if (this.status !== "finished") {
      return false;
    }
    return this.start(byId);
  }

  private spawnFor(player: Player): void {
    if (player.pendingGarbage > 0) {
      player.board = addGarbage(player.board, player.pendingGarbage);
      player.pendingGarbage = 0;
    }
    const type = this.pieceAt(player.index);
    player.index += 1;
    const piece = Piece.spawn(type, COLS);
    if (!isValidPosition(player.board, piece)) {
      this.eliminate(player);
      return;
    }
    player.piece = piece;
    player.lockPending = false;
  }

  private eliminate(player: Player): void {
    player.alive = false;
    player.piece = null;
  }

  // --- input & simulation ------------------------------------------------

  action(id: string, type: ActionType): void {
    if (this.status !== "playing") {
      return;
    }
    const player = this.players.get(id);
    if (!player || !player.alive || !player.piece) {
      return;
    }
    switch (type) {
      case "left": {
        const next = tryMove(player.board, player.piece, -1, 0);
        if (next) player.piece = Piece.from(next);
        break;
      }
      case "right": {
        const next = tryMove(player.board, player.piece, 1, 0);
        if (next) player.piece = Piece.from(next);
        break;
      }
      case "rotate": {
        const next = tryRotate(player.board, player.piece, 1);
        if (next) player.piece = Piece.from(next);
        break;
      }
      case "soft": {
        const next = tryMove(player.board, player.piece, 0, 1);
        if (next) {
          player.piece = Piece.from(next);
          player.lockPending = false;
        }
        break;
      }
      case "hard": {
        player.piece = Piece.from(hardDrop(player.board, player.piece));
        this.lockAndResolve(player);
        break;
      }
    }
  }

  // One gravity step for every active player. Lock delay: a grounded piece
  // stays adjustable for one tick before it locks.
  tick(): void {
    if (this.status !== "playing") {
      return;
    }
    for (const player of this.players.values()) {
      if (!player.alive || !player.piece) {
        continue;
      }
      const down = tryMove(player.board, player.piece, 0, 1);
      if (down) {
        player.piece = Piece.from(down);
        player.lockPending = false;
      } else if (!player.lockPending) {
        player.lockPending = true;
      } else {
        this.lockAndResolve(player);
      }
    }
  }

  private lockAndResolve(player: Player): void {
    if (!player.piece) {
      return;
    }
    player.board = lockPiece(player.board, player.piece);
    const { board, cleared } = clearLines(player.board);
    player.board = board;
    player.lockPending = false;
    if (cleared > 1) {
      this.sendGarbage(player.id, cleared - 1);
    }
    this.spawnFor(player);
    this.checkEnd();
  }

  private sendGarbage(fromId: string, amount: number): void {
    for (const player of this.players.values()) {
      if (player.id !== fromId && player.alive) {
        player.pendingGarbage += amount;
      }
    }
  }

  private checkEnd(): void {
    if (this.status !== "playing") {
      return;
    }
    const alive = [...this.players.values()].filter((p) => p.alive);
    if (this.startedWith >= 2 && alive.length <= 1) {
      this.status = "finished";
      this.winnerId = alive[0]?.id ?? null;
    } else if (this.startedWith === 1 && alive.length === 0) {
      this.status = "finished";
      // Solo player is both the only participant and the "winner" for relaunch
      this.winnerId = [...this.players.values()][0]?.id ?? null;
    }
  }

  // --- views for the socket layer ---------------------------------------

  boardWithPiece(id: string): Board | null {
    const player = this.players.get(id);
    if (!player) {
      return null;
    }
    const board = player.board.map((row) => row.slice());
    if (player.piece) {
      for (const cell of pieceCells(player.piece)) {
        if (
          cell.y >= 0 &&
          cell.y < board.length &&
          cell.x >= 0 &&
          cell.x < board[0].length
        ) {
          board[cell.y][cell.x] = player.piece.type;
        }
      }
    }
    return board;
  }

  lobby(): LobbyView {
    return {
      room: this.id,
      status: this.status,
      hostId: this.hostId,
      launcherId: this.getLauncherId(),
      players: this.order.map((id) => {
        const p = this.players.get(id)!;
        return {
          id: p.id,
          name: p.name,
          isHost: p.id === this.hostId,
          alive: p.alive,
        };
      }),
    };
  }

  publicPlayers(): PublicPlayer[] {
    return this.order.map((id) => {
      const p = this.players.get(id)!;
      return {
        id: p.id,
        name: p.name,
        alive: p.alive,
        isHost: p.id === this.hostId,
        spectrum: getSpectrum(p.board),
      };
    });
  }

  stateFor(id: string): StateView {
    const player = this.players.get(id);
    return {
      room: this.id,
      status: this.status,
      hostId: this.hostId,
      launcherId: this.getLauncherId(),
      winnerId: this.winnerId,
      self: player
        ? {
            id: player.id,
            name: player.name,
            alive: player.alive,
            board: this.boardWithPiece(id)!,
          }
        : null,
      players: this.publicPlayers(),
    };
  }
}
