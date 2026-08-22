import React, { useEffect } from "react";
import { Socket } from "socket.io-client";
import useGame from "../hooks/useGame";
import useKeyboard from "../hooks/useKeyboard";
import Board from "../components/Board";
import PlayerList from "../components/PlayerList";
import Lobby from "../components/Lobby";
import GameOver from "../components/GameOver";

interface GamePageProps {
  socket: Socket;
  room: string;
  playerName: string;
}

const GamePage: React.FC<GamePageProps> = ({ socket, room, playerName }) => {
  const { lobby, gameState, error } = useGame(socket);
  const status = gameState?.status ?? lobby?.status ?? "lobby";
  const selfAlive = gameState?.self?.alive ?? false;

  useKeyboard(socket, status === "playing" && selfAlive);

  useEffect(() => {
    socket.emit("join", { room, name: playerName });
  }, [socket, room, playerName]);

  const currentId = socket.id ?? "";

  const handleAction = (action: string) => {
    socket.emit("action", action);
  };

  return (
    <div className="game-page">
      {error && <div className="error-bar">{error}</div>}

      {status === "lobby" && lobby && (
        <Lobby lobby={lobby} socket={socket} currentId={currentId} />
      )}

      {(status === "playing" || status === "finished") && gameState && (
        <div className="game-layout">
          <div className="game-main">
            {gameState.self && <Board board={gameState.self.board} />}

            {status === "playing" && selfAlive && (
              <div className="controls">
                <button
                  className="ctrl-btn"
                  onClick={() => handleAction("left")}
                >
                  ←
                </button>
                <button
                  className="ctrl-btn"
                  onClick={() => handleAction("rotate")}
                >
                  ↑
                </button>
                <button
                  className="ctrl-btn"
                  onClick={() => handleAction("soft")}
                >
                  ↓
                </button>
                <button
                  className="ctrl-btn"
                  onClick={() => handleAction("right")}
                >
                  →
                </button>
                <button
                  className="ctrl-btn ctrl-space"
                  onClick={() => handleAction("hard")}
                >
                  ⎵
                </button>
              </div>
            )}
          </div>

          <PlayerList players={gameState.players} currentId={currentId} />

          {status === "finished" && (
            <GameOver
              gameState={gameState}
              socket={socket}
              currentId={currentId}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default GamePage;
