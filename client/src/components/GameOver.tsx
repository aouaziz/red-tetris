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

  const handleRestart = () => {
    socket.emit("restart");
  };

  return (
    <div className="game-over-overlay">
      <div className="game-over-card">
        <h2>Game Over</h2>
        {winnerPlayer ? (
          <p className="winner-text">
            🏆{" "}
            {winnerPlayer.id === currentId
              ? "You win!"
              : `${winnerPlayer.name} wins!`}
          </p>
        ) : (
          <p className="winner-text">Game ended</p>
        )}
        {isLauncher && (
          <button className="btn btn-restart" onClick={handleRestart}>
            Play Again
          </button>
        )}
        {!isLauncher && (
          <p className="waiting-msg">Waiting for winner to restart...</p>
        )}
      </div>
    </div>
  );
};

export default GameOver;
