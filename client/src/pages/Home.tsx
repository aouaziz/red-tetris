import React, { useState, FormEvent } from "react";

const RANDOM_ROOMS = [
  "matrix",
  "arcade",
  "cyber",
  "phoenix",
  "galaxy",
  "nebula",
  "retro",
  "vortex",
  "arena",
  "titan",
];

const Home: React.FC = () => {
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"solo" | "multiplayer">("solo");
  const [room, setRoom] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const getRandomRoom = (): string => {
    const randomIndex = Math.floor(Math.random() * RANDOM_ROOMS.length);
    const randNum = Math.floor(100 + Math.random() * 900);
    return `${RANDOM_ROOMS[randomIndex]}-${randNum}`;
  };

  const handleRandomRoomClick = () => {
    setRoom(getRandomRoom());
    setValidationError(null);
  };

  const handleStartSolo = (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setValidationError("Please enter your player name before starting.");
      return;
    }
    if (trimmedName.includes("/") || trimmedName.includes("[") || trimmedName.includes("]")) {
      setValidationError("Player name cannot contain '/', '[', or ']'.");
      return;
    }
    setValidationError(null);
    const soloRoom = `solo-${Math.random().toString(36).substring(2, 8)}`;
    window.location.hash = `#${soloRoom}/${encodeURIComponent(trimmedName)}`;
  };

  const handleJoinMultiplayer = (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const targetRoom = (room || getRandomRoom()).trim();

    if (!trimmedName) {
      setValidationError("Please enter your player name before joining.");
      return;
    }
    if (trimmedName.includes("/") || trimmedName.includes("[") || trimmedName.includes("]")) {
      setValidationError("Player name cannot contain '/', '[', or ']'.");
      return;
    }
    if (targetRoom.includes("/") || targetRoom.includes("[") || targetRoom.includes("]")) {
      setValidationError("Room name cannot contain '/', '[', or ']'.");
      return;
    }

    setValidationError(null);
    window.location.hash = `#${targetRoom}/${encodeURIComponent(trimmedName)}`;
  };

  return (
    <div className="home">
      <div className="home-card">
        <header className="home-header">
          <h1 className="brand-title">RED TETRIS</h1>
          <p className="brand-subtitle">Networked Multiplayer Tetris</p>
        </header>

        {validationError && (
          <div className="error-bar">{validationError}</div>
        )}

        <div className="name-input-group">
          <label htmlFor="player-name-input" className="input-label">
            Player Name <span className="required-star">*</span>
          </label>
          <input
            id="player-name-input"
            type="text"
            className="text-input text-input-lg"
            placeholder="Enter your username (e.g. Alex)"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (validationError) setValidationError(null);
            }}
            maxLength={50}
            required
            autoFocus
          />
        </div>

        <div className="mode-tabs">
          <button
            type="button"
            className={`mode-tab ${mode === "solo" ? "active" : ""}`}
            onClick={() => {
              setMode("solo");
              setValidationError(null);
            }}
          >
            🎮 Single Player
          </button>
          <button
            type="button"
            className={`mode-tab ${mode === "multiplayer" ? "active" : ""}`}
            onClick={() => {
              setMode("multiplayer");
              setValidationError(null);
            }}
          >
            ⚔️ Multiplayer
          </button>
        </div>

        {mode === "solo" ? (
          <form className="mode-panel" onSubmit={handleStartSolo}>
            <p className="mode-desc">
              Play classic Tetris solo. Master your stacking and clear lines at your own pace.
            </p>
            <button
              className="btn btn-start btn-block"
              type="submit"
              disabled={!name.trim()}
            >
              Play Solo Now
            </button>
          </form>
        ) : (
          <form className="mode-panel" onSubmit={handleJoinMultiplayer}>
            <p className="mode-desc">
              Battle live opponents. Clear lines to send indestructible garbage penalty lines!
            </p>
            <div className="room-input-group">
              <input
                type="text"
                className="text-input"
                placeholder="Room name (or generate random)"
                value={room}
                onChange={(e) => {
                  setRoom(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                maxLength={50}
              />
              <button
                type="button"
                className="btn btn-secondary btn-icon"
                onClick={handleRandomRoomClick}
                title="Generate random room name"
              >
                🎲 Random
              </button>
            </div>
            <button
              className="btn btn-join btn-block"
              type="submit"
              disabled={!name.trim()}
            >
              Join / Create Room
            </button>
          </form>
        )}

        <footer className="home-controls-guide">
          <h4>Controls Cheat Sheet</h4>
          <div className="key-guide-grid">
            <div className="key-guide-item">
              <span className="key-badge">←</span>
              <span className="key-badge">→</span>
              <span className="key-desc">Move</span>
            </div>
            <div className="key-guide-item">
              <span className="key-badge">↑</span>
              <span className="key-desc">Rotate</span>
            </div>
            <div className="key-guide-item">
              <span className="key-badge">↓</span>
              <span className="key-desc">Soft Drop</span>
            </div>
            <div className="key-guide-item">
              <span className="key-badge">Space</span>
              <span className="key-desc">Hard Drop</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;
