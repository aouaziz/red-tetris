import React, { useState } from "react";
import { LobbyData } from "../hooks/useGame";
import { Socket } from "socket.io-client";

interface LobbyProps {
  lobby: LobbyData;
  socket: Socket;
  currentId: string;
}

const Lobby: React.FC<LobbyProps> = ({ lobby, socket, currentId }) => {
  const [copied, setCopied] = useState(false);
  const isLauncher = lobby.launcherId === currentId;

  const handleStart = () => {
    socket.emit("start");
  };

  const handleLeave = () => {
    window.location.hash = "";
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/#${lobby.room}/Opponent`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {
      // Fallback
    });
  };

  return (
    <div className="lobby">
      <h2>Room: <span className="room-highlight">{lobby.room}</span></h2>

      <div className="lobby-players">
        <div className="lobby-players-header">
          <h3>Connected Players ({lobby.players.length})</h3>
          <button
            type="button"
            className="btn btn-secondary btn-icon"
            onClick={handleCopyLink}
            title="Copy invitation link for player 2"
          >
            {copied ? "✓ Copied!" : "📋 Copy Link"}
          </button>
        </div>

        <ul>
          {lobby.players.map((p) => (
            <li key={p.id} className={p.id === currentId ? "self" : ""}>
              <span className="player-name">{p.name}</span>
              <div className="player-badges">
                {p.isHost && <span className="badge host-badge">Host</span>}
                {p.id === currentId && (
                  <span className="badge you-badge">You</span>
                )}
              </div>
            </li>
          ))}
        </ul>

        {lobby.players.length === 1 ? (
          <p className="lobby-hint">
            💡 Waiting for another player. Open a second tab/window with this room name to play multiplayer!
          </p>
        ) : (
          <p className="lobby-hint lobby-ready">
            ⚔️ {lobby.players.length} players connected! Ready to play.
          </p>
        )}
      </div>

      <div className="lobby-actions">
        {isLauncher ? (
          <button className="btn btn-start btn-block" onClick={handleStart}>
            {lobby.players.length === 1 ? "Start Solo Game" : "Start Multiplayer Game"}
          </button>
        ) : (
          <p className="waiting-msg">Waiting for host to start the game...</p>
        )}
        <button className="btn btn-secondary btn-block" onClick={handleLeave}>
          Exit to Menu
        </button>
      </div>
    </div>
  );
};

export default Lobby;
