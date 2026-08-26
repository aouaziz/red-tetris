import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { io as ClientIO, Socket as ClientSocket } from 'socket.io-client';
import { AddressInfo } from 'net';
import { GameManager } from '../../server/src/domain/GameManager';
import { registerSocketHandlers } from '../../server/src/socket/handler';

describe('socket handler', () => {
  let httpServer: ReturnType<typeof createServer>;
  let io: SocketIOServer;
  let manager: GameManager;
  let port: number;

  beforeEach(async () => {
    manager = new GameManager();
    httpServer = createServer();
    io = new SocketIOServer(httpServer);
    registerSocketHandlers(io, manager);

    await new Promise<void>((resolve) => {
      httpServer.listen(0, () => {
        port = (httpServer.address() as AddressInfo).port;
        resolve();
      });
    });
  });

  afterEach(async () => {
    io.close();
    await new Promise<void>((resolve) => httpServer.close(() => resolve()));
  });

  function createClient(): Promise<ClientSocket> {
    return new Promise((resolve) => {
      const client = ClientIO(`http://localhost:${port}`, {
        transports: ['websocket'],
        forceNew: true,
      });
      client.on('connect', () => resolve(client));
    });
  }

  it('allows joining and receives lobby event', async () => {
    const client = await createClient();
    const lobbyPromise = new Promise<any>((resolve) => {
      client.on('lobby', (data) => resolve(data));
    });

    client.emit('join', { room: 'test-room', name: 'Alice' });
    const lobby = await lobbyPromise;

    expect(lobby.room).toBe('test-room');
    expect(lobby.status).toBe('lobby');
    expect(lobby.players.length).toBe(1);
    expect(lobby.players[0].name).toBe('Alice');
    expect(lobby.players[0].isHost).toBe(true);

    client.disconnect();
  });

  it('rejects invalid join payload', async () => {
    const client = await createClient();
    const errorPromise = new Promise<string>((resolve) => {
      client.on('error', (err) => resolve(err));
    });

    client.emit('join', { room: '', name: 'Alice' });
    const err = await errorPromise;
    expect(err).toBe('Invalid join payload');

    client.disconnect();
  });

  it('allows second player to join and start game', async () => {
    const p1 = await createClient();
    const p2 = await createClient();

    await new Promise<void>((resolve) => {
      p1.on('lobby', () => resolve());
      p1.emit('join', { room: 'game-room', name: 'Alice' });
    });

    const p1StatePromise = new Promise<any>((resolve) => {
      p1.on('state', (state) => {
        if (state.status === 'playing') resolve(state);
      });
    });

    await new Promise<void>((resolve) => {
      p2.on('lobby', (lobby) => {
        if (lobby.players.length === 2) resolve();
      });
      p2.emit('join', { room: 'game-room', name: 'Bob' });
    });

    // P2 cannot start because P1 is host
    const errorPromise = new Promise<string>((resolve) => {
      p2.on('error', (err) => resolve(err));
    });
    p2.emit('start');
    const err = await errorPromise;
    expect(err).toBe('Cannot start game');

    // P1 (host) starts the game
    p1.emit('start');
    const p1State = await p1StatePromise;
    expect(p1State.status).toBe('playing');
    expect(p1State.players.length).toBe(2);

    // Mid-game join should be rejected
    const p3 = await createClient();
    const p3ErrPromise = new Promise<string>((resolve) => {
      p3.on('error', (e) => resolve(e));
    });
    p3.emit('join', { room: 'game-room', name: 'Charlie' });
    expect(await p3ErrPromise).toBe('Cannot join game in progress');

    p1.disconnect();
    p2.disconnect();
    p3.disconnect();
  });

  it('handles player actions and disconnects', async () => {
    const p1 = await createClient();
    p1.emit('join', { room: 'action-room', name: 'Alice' });

    await new Promise<void>((resolve) => {
      p1.on('lobby', () => resolve());
    });

    p1.emit('start');

    await new Promise<void>((resolve) => {
      p1.on('state', (state) => {
        if (state.status === 'playing') resolve();
      });
    });

    // Send actions
    p1.emit('action', 'left');
    p1.emit('action', 'right');
    p1.emit('action', 'rotate');
    p1.emit('action', 'soft');
    p1.emit('action', 'hard');

    p1.disconnect();
  });

  it('handles set_mode and get_leaderboard', async () => {
    const p1 = await createClient();
    p1.emit('join', { room: 'mode-room', name: 'Alice' });

    await new Promise<void>((resolve) => {
      p1.on('lobby', () => resolve());
    });

    // Change mode to speed
    const lobbySpeedPromise = new Promise<any>((resolve) => {
      p1.on('lobby', (lobby) => {
        if (lobby.gameMode === 'speed') resolve(lobby);
      });
    });
    p1.emit('set_mode', { mode: 'speed' });
    const speedLobby = await lobbySpeedPromise;
    expect(speedLobby.gameMode).toBe('speed');

    // Reject invalid mode
    const errorPromise = new Promise<string>((resolve) => {
      p1.on('error', (err) => resolve(err));
    });
    p1.emit('set_mode', 'invalid_mode');
    expect(await errorPromise).toBe('Invalid game mode');

    // Request leaderboard
    const lbPromise = new Promise<any[]>((resolve) => {
      p1.on('leaderboard', (scores) => resolve(scores));
    });
    p1.emit('get_leaderboard');
    const leaderboard = await lbPromise;
    expect(Array.isArray(leaderboard)).toBe(true);

    p1.disconnect();
  });
});

