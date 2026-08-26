import React, { useState, useEffect, FormEvent } from "react";

interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  lines: number;
  mode: string;
  date: string;
}

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
  const [mode, setMode] = useState<"solo" | "multiplayer" | "leaderboard">("solo");
  const [room, setRoom] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingScores, setLoadingScores] = useState(false);

  const fetchLeaderboard = () => {
    setLoadingScores(true);
    fetch("/api/leaderboard")
      .then((res) => res.json())
      .then((data: LeaderboardEntry[]) => {
        if (Array.isArray(data)) {
          setLeaderboard(data);
        }
      })
      .catch(() => {
        // Fallback
      })
      .finally(() => {
        setLoadingScores(false);
      });
  };

  useEffect(() => {
    if (mode === "leaderboard") {
      fetchLeaderboard();
    }
  }, [mode]);

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

        {mode !== "leaderboard" && (
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
        )}

        <div className="mode-tabs">
          <button
            type="button"
            className={`mode-tab ${mode === "solo" ? "active" : ""}`}
            onClick={() => {
              setMode("solo");
              setValidationError(null);
            }}
          >
            🎮 Solo
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
          <button
            type="button"
            className={`mode-tab ${mode === "leaderboard" ? "active" : ""}`}
            onClick={() => {
              setMode("leaderboard");
              setValidationError(null);
            }}
          >
            🏆 Leaderboard
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
        ) : mode === "multiplayer" ? (
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
        ) : (
          <div className="mode-panel leaderboard-panel">
            <div className="leaderboard-header">
              <h3>Hall of Fame — Top High Scores</h3>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={fetchLeaderboard}
                disabled={loadingScores}
              >
                {loadingScores ? "Loading..." : "🔄 Refresh"}
              </button>
            </div>
            {leaderboard.length === 0 ? (
              <p className="empty-scores">No scores recorded yet! Play a match to set the high score.</p>
            ) : (
              <div className="leaderboard-list">
                {leaderboard.map((entry, idx) => (
                  <div key={entry.id} className="leaderboard-item">
                    <span className="lb-rank">
                      {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                    </span>
                    <div className="lb-details">
                      <span className="lb-name">{entry.name}</span>
                      <span className="lb-mode">
                        {entry.mode === "speed" ? "⚡ Speed" : entry.mode === "invisible" ? "👻 Invisible" : "🕹️ Classic"}
                      </span>
                    </div>
                    <span className="lb-lines">{entry.lines} lines</span>
                    <span className="lb-score">{entry.score} pts</span>
                  </div>
                ))}
              </div>
            )}
          </div>
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
