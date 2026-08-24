import { useState, useEffect } from "react";
import { Socket } from "socket.io-client";

export type Cell = 0 | "I" | "O" | "T" | "S" | "Z" | "J" | "L" | "G";
export type Board = Cell[][];
export type GameStatus = "lobby" | "playing" | "finished";

export interface LobbyData {
  room: string;
  status: GameStatus;
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
}

export interface GameState {
  room: string;
  status: GameStatus;
  hostId: string | null;
  launcherId: string | null;
  winnerId: string | null;
  self: { id: string; name: string; alive: boolean; board: Board } | null;
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
}

function useGame(socket: Socket | null): UseGameReturn {
  const [lobby, setLobby] = useState<LobbyData | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rejected, setRejected] = useState<RejectedData | null>(null);

  useEffect(() => {
    if (!socket) return;

    const onLobby = (data: LobbyData) => {
      setLobby(data);
      setRejected(null);
    };

    const onState = (data: GameState) => {
      setGameState(data);
      setLobby((prev) => (prev ? { ...prev, status: data.status } : null));
      setRejected(null);
    };

    const onError = (msg: string) => {
      setError(msg);
      setTimeout(() => setError(null), 4000);
    };

    const onRejected = (data: RejectedData) => {
      setRejected(data);
    };

    socket.on("lobby", onLobby);
    socket.on("state", onState);
    socket.on("error", onError);
    socket.on("rejected", onRejected);

    return () => {
      socket.off("lobby", onLobby);
      socket.off("state", onState);
      socket.off("error", onError);
      socket.off("rejected", onRejected);
    };
  }, [socket]);

  return { lobby, gameState, error, rejected };
}

export default useGame;
