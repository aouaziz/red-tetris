import { Game } from './Game';

// Holds every active room. State is fully isolated per room, enabling multiple
// concurrent games.
export class GameManager {
  readonly games = new Map<string, Game>();

  getOrCreate(room: string, seed?: number): Game {
    let game = this.games.get(room);
    if (!game) {
      game = new Game(room, seed);
      this.games.set(room, game);
    }
    return game;
  }

  get(room: string): Game | undefined {
    return this.games.get(room);
  }

  remove(room: string): void {
    this.games.delete(room);
  }
}
