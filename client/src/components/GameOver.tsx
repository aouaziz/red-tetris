import React from "react";
import { Socket } from "socket.io-client";
import { GameState } from "../hooks/useGame";

interface GameOverProps {
  gameState: GameState;
  socket: Socket;
  currentId: string;
}

const GameOver: React.FC<GameOverProps> = ({
  gameState,
  socket,
  currentId,
}) => {
  const isLauncher = gameState.launcherId === currentId;
  const winnerPlayer = gameState.players.find(
    (p) => p.id === gameState.winnerId,
  );

  // Sort players by score descending
  const sortedPlayers = gameState.players
    .slice()
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  const handleRestart = () => {
    socket.emit("restart");
  };

  const handleExit = () => {
    window.location.hash = "";
  };

  return (
    <div className="game-over-overlay">
      <div className="game-over-card">
        <h2>Game Over</h2>
        {winnerPlayer ? (
          <p className="winner-text">
            🏆{" "}
            {winnerPlayer.id === currentId
              ? "Victory! You Win!"
              : `${winnerPlayer.name} Wins!`}
          </p>
        ) : (
          <p className="winner-text">Game Ended</p>
        )}

        <div className="game-over-scores">
          <h3>Final Standings</h3>
          <div className="game-over-table">
            {sortedPlayers.map((p, idx) => (
              <div
                key={p.id}
                className={`score-row ${p.id === currentId ? "score-row-self" : ""}`}
              >
                <span className="score-rank">
                  {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                </span>
                <span className="score-name">{p.name} {p.id === currentId ? "(You)" : ""}</span>
                <span className="score-lines">{p.linesCleared ?? 0} lines</span>
                <span className="score-pts">{p.score ?? 0} pts</span>
              </div>
            ))}
          </div>
        </div>

        <div className="game-over-actions">
          {isLauncher && (
            <button className="btn btn-restart" onClick={handleRestart}>
              Play Again
            </button>
          )}
          <button className="btn btn-secondary" onClick={handleExit}>
            Exit to Menu
          </button>
        </div>
        {!isLauncher && (
          <p className="waiting-msg">Waiting for host/winner to restart...</p>
        )}
      </div>
    </div>
  );
};

export default GameOver;
