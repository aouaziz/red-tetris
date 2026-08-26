import { useState, useEffect } from "react";
import { Socket } from "socket.io-client";

export type Cell = 0 | "I" | "O" | "T" | "S" | "Z" | "J" | "L" | "G";
export type Board = Cell[][];
export type GameStatus = "lobby" | "playing" | "finished";
export type GameMode = "classic" | "speed" | "invisible";

export interface ScoreEntry {
  id: string;
  name: string;
  score: number;
  lines: number;
  mode: string;
  date: string;
}

export interface LobbyData {
  room: string;
  status: GameStatus;
  gameMode: GameMode;
  hostId: string | null;
  launcherId: string | null;
  players: { id: string; name: string; isHost: boolean; alive: boolean }[];
}

export interface PublicPlayer {
  id: string;
  name: string;
  alive: boolean;
  isHost: boolean;
  spectrum: number[];
  score: number;
  linesCleared: number;
}

export interface GameState {
  room: string;
  status: GameStatus;
  gameMode: GameMode;
  hostId: string | null;
  launcherId: string | null;
  winnerId: string | null;
  self: {
    id: string;
    name: string;
    alive: boolean;
    score: number;
    linesCleared: number;
    board: Board;
  } | null;
  players: PublicPlayer[];
}

export interface RejectedData {
  reason: string;
  room: string;
}

export interface UseGameReturn {
  lobby: LobbyData | null;
  gameState: GameState | null;
  error: string | null;
  rejected: RejectedData | null;
  leaderboard: ScoreEntry[];
}

function useGame(socket: Socket | null): UseGameReturn {
  const [lobby, setLobby] = useState<LobbyData | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rejected, setRejected] = useState<RejectedData | null>(null);
  const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([]);

  useEffect(() => {
    if (!socket) return;

    const onLobby = (data: LobbyData) => {
      setLobby(data);
      setRejected(null);
    };

    const onState = (data: GameState) => {
      setGameState(data);
      setLobby((prev) => (prev ? { ...prev, status: data.status, gameMode: data.gameMode } : null));
      setRejected(null);
    };

    const onError = (msg: string) => {
      setError(msg);
      setTimeout(() => setError(null), 4000);
    };

    const onRejected = (data: RejectedData) => {
      setRejected(data);
    };

    const onLeaderboard = (data: ScoreEntry[]) => {
      setLeaderboard(data);
    };

    socket.on("lobby", onLobby);
    socket.on("state", onState);
    socket.on("error", onError);
    socket.on("rejected", onRejected);
    socket.on("leaderboard", onLeaderboard);

    socket.emit("get_leaderboard");

    return () => {
      socket.off("lobby", onLobby);
      socket.off("state", onState);
      socket.off("error", onError);
      socket.off("rejected", onRejected);
      socket.off("leaderboard", onLeaderboard);
    };
  }, [socket]);

  return { lobby, gameState, error, rejected, leaderboard };
}

export default useGame;
