import React, { useState } from "react";
import { LobbyData, GameMode } from "../hooks/useGame";
import { Socket } from "socket.io-client";

interface LobbyProps {
  lobby: LobbyData;
  socket: Socket;
  currentId: string;
}

const MODE_DESCRIPTIONS: Record<GameMode, { title: string; icon: string; desc: string }> = {
  classic: {
    title: "Classic Mode",
    icon: "🕹️",
    desc: "Standard gravity speed with full piece visibility.",
  },
  speed: {
    title: "Increased Gravity",
    icon: "⚡",
    desc: "Hyper fall speed (3x gravity). Fast reflexes required!",
  },
  invisible: {
    title: "Invisible Pieces",
    icon: "👻",
    desc: "Pieces vanish when locked onto the board. Play by memory!",
  },
};

const Lobby: React.FC<LobbyProps> = ({ lobby, socket, currentId }) => {
  const [copied, setCopied] = useState(false);
  const isHost = lobby.hostId === currentId;
  const isLauncher = lobby.launcherId === currentId;
  const currentMode = lobby.gameMode || "classic";

  const handleModeChange = (mode: GameMode) => {
    if (isHost) {
      socket.emit("set_mode", { mode });
    }
  };

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

      <div className="lobby-mode-section">
        <h3>Game Mode {isHost ? "(Host Choice)" : ""}</h3>
        <div className="mode-options-grid">
          {(["classic", "speed", "invisible"] as GameMode[]).map((mode) => {
            const info = MODE_DESCRIPTIONS[mode];
            const isSelected = currentMode === mode;
            return (
              <button
                key={mode}
                type="button"
                className={`mode-option-card ${isSelected ? "selected" : ""} ${!isHost ? "read-only" : ""}`}
                onClick={() => handleModeChange(mode)}
                disabled={!isHost}
              >
                <div className="mode-option-header">
                  <span className="mode-option-icon">{info.icon}</span>
                  <span className="mode-option-title">{info.title}</span>
                </div>
                <p className="mode-option-desc">{info.desc}</p>
                {isSelected && <span className="badge mode-active-badge">Selected</span>}
              </button>
            );
          })}
        </div>
      </div>

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
