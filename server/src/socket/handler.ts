import { Server as SocketIOServer } from 'socket.io';
import { GameManager } from '../domain/GameManager';
import { Game } from '../domain/Game';
import { parseJoin, parseAction } from './protocol';

const intervals = new Map<string, NodeJS.Timeout>();

function broadcastState(io: SocketIOServer, game: Game, room: string): void {
  if (game.status === 'finished') {
    const interval = intervals.get(room);
    if (interval) {
      clearInterval(interval);
      intervals.delete(room);
    }
  }

  io.in(room)
    .fetchSockets()
    .then((sockets) => {
      for (const socket of sockets) {
        socket.emit('state', game.stateFor(socket.id));
      }
    })
    .catch(console.error);
}

function broadcastLobby(io: SocketIOServer, game: Game, room: string): void {
  io.to(room).emit('lobby', game.lobby());
}

export function registerSocketHandlers(io: SocketIOServer, manager: GameManager): void {
  const socketData = new Map<string, { room: string; playerId: string }>();

  io.on('connection', (socket) => {
    socket.on('join', (payload: unknown) => {
      const parsed = parseJoin(payload);
      if (!parsed) {
        socket.emit('error', 'Invalid join payload');
        return;
      }

      const { room, name } = parsed;
      const game = manager.getOrCreate(room);

      const player = game.addPlayer(socket.id, name);
      if (!player) {
        socket.emit('error', 'Cannot join game in progress');
        socket.emit('rejected', {
          reason: 'This room is currently in progress. You cannot join mid-game.',
          room,
        });
        return;
      }

      socketData.set(socket.id, { room, playerId: socket.id });
      socket.join(room);
      if (game.status === 'playing') {
        socket.emit('state', game.stateFor(socket.id));
      } else {
        broadcastLobby(io, game, room);
      }
    });

    socket.on('start', () => {
      const data = socketData.get(socket.id);
      if (!data) return;
      const { room } = data;
      const game = manager.get(room);
      if (!game) return;

      if (!game.start(socket.id)) {
        socket.emit('error', 'Cannot start game');
        return;
      }

      const interval = setInterval(() => {
        const g = manager.get(room);
        if (g) {
          g.tick();
          broadcastState(io, g, room);
        } else {
          clearInterval(interval);
          intervals.delete(room);
        }
      }, 1000);
      intervals.set(room, interval);

      broadcastState(io, game, room);
    });

    socket.on('restart', () => {
      const data = socketData.get(socket.id);
      if (!data) return;
      const { room } = data;
      const game = manager.get(room);
      if (!game) return;

      if (!game.restart(socket.id)) {
        socket.emit('error', 'Cannot restart game');
        return;
      }

      const interval = setInterval(() => {
        const g = manager.get(room);
        if (g) {
          g.tick();
          broadcastState(io, g, room);
        } else {
          clearInterval(interval);
          intervals.delete(room);
        }
      }, 1000);
      intervals.set(room, interval);

      broadcastState(io, game, room);
    });

    socket.on('action', (payload: unknown) => {
      const actionType = parseAction(payload);
      if (!actionType) return;

      const data = socketData.get(socket.id);
      if (!data) return;
      const { room } = data;
      const game = manager.get(room);
      if (!game) return;

      game.action(socket.id, actionType);
      broadcastState(io, game, room);
    });

    socket.on('disconnect', () => {
      const data = socketData.get(socket.id);
      if (!data) return;
      const { room } = data;
      const game = manager.get(room);
      if (!game) {
        socketData.delete(socket.id);
        return;
      }

      game.removePlayer(socket.id);
      socketData.delete(socket.id);

      if (game.players.size === 0) {
        manager.remove(room);
        const interval = intervals.get(room);
        if (interval) {
          clearInterval(interval);
          intervals.delete(room);
        }
      } else {
        if (game.status === 'finished') {
          const interval = intervals.get(room);
          if (interval) {
            clearInterval(interval);
            intervals.delete(room);
          }
          broadcastState(io, game, room);
        } else {
          broadcastLobby(io, game, room);
          if (game.status === 'playing') {
            broadcastState(io, game, room);
          }
        }
      }
    });
  });
}
