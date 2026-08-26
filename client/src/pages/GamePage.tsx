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

const MODE_NAMES: Record<string, string> = {
  classic: "🕹️ Classic",
  speed: "⚡ Fast Gravity",
  invisible: "👻 Invisible",
};

const GamePage: React.FC<GamePageProps> = ({ socket, room, playerName }) => {
  const { lobby, gameState, error, rejected } = useGame(socket);
  const status = gameState?.status ?? lobby?.status ?? "lobby";
  const selfAlive = gameState?.self?.alive ?? false;

  useKeyboard(socket, status === "playing" && selfAlive);

  useEffect(() => {
    const emitJoin = () => {
      socket.emit("join", { room, name: playerName });
    };

    if (socket.connected) {
      emitJoin();
    }
    socket.on("connect", emitJoin);

    return () => {
      socket.off("connect", emitJoin);
    };
  }, [socket, room, playerName]);

  const currentId = socket.id ?? "";

  const handleAction = (action: string) => {
    socket.emit("action", action);
  };

  const handleLeave = () => {
    window.location.hash = "";
  };

  if (rejected) {
    return (
      <div className="game-page">
        <div className="lobby">
          <h2>⚠️ Game In Progress</h2>
          <p className="mode-desc">
            Room <strong className="room-highlight">{room}</strong> is currently playing a match.
            New players cannot enter while a round is active.
          </p>
          <div className="lobby-actions">
            <button
              className="btn btn-join btn-block"
              onClick={() => socket.emit("join", { room, name: playerName })}
            >
              🔄 Retry Joining
            </button>
            <button className="btn btn-secondary btn-block" onClick={handleLeave}>
              Back to Main Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-page">
      {error && <div className="error-bar">{error}</div>}

      {status === "lobby" && lobby && (
        <Lobby lobby={lobby} socket={socket} currentId={currentId} />
      )}

      {(status === "playing" || status === "finished") && gameState && (
        <div className="game-layout">
          <div className="game-main">
            <div className="game-hud">
              <div className="hud-item">
                <span className="hud-label">Score</span>
                <span className="hud-value">{gameState.self?.score ?? 0}</span>
              </div>
              <div className="hud-item">
                <span className="hud-label">Lines</span>
                <span className="hud-value">{gameState.self?.linesCleared ?? 0}</span>
              </div>
              <div className="hud-item hud-mode">
                <span className="hud-label">Mode</span>
                <span className="hud-mode-badge">{MODE_NAMES[gameState.gameMode] ?? gameState.gameMode}</span>
              </div>
            </div>

            {gameState.self && <Board board={gameState.self.board} />}

            {status === "playing" && selfAlive && (
              <div className="controls">
                <button
                  className="ctrl-btn"
                  onClick={() => handleAction("left")}
                  aria-label="Move left"
                >
                  ←
                </button>
                <button
                  className="ctrl-btn"
                  onClick={() => handleAction("rotate")}
                  aria-label="Rotate"
                >
                  ↑
                </button>
                <button
                  className="ctrl-btn"
                  onClick={() => handleAction("soft")}
                  aria-label="Soft drop"
                >
                  ↓
                </button>
                <button
                  className="ctrl-btn"
                  onClick={() => handleAction("right")}
                  aria-label="Move right"
                >
                  →
                </button>
                <button
                  className="ctrl-btn ctrl-space"
                  onClick={() => handleAction("hard")}
                  aria-label="Hard drop"
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
