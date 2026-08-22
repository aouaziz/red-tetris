import React from "react";
import { LobbyData } from "../hooks/useGame";
import { Socket } from "socket.io-client";

interface LobbyProps {
  lobby: LobbyData;
  socket: Socket;
  currentId: string;
}

const Lobby: React.FC<LobbyProps> = ({ lobby, socket, currentId }) => {
  const isLauncher = lobby.launcherId === currentId;

  const handleStart = () => {
    socket.emit("start");
  };

  return (
    <div className="lobby">
      <h2>Room: {lobby.room}</h2>
      <div className="lobby-players">
        <h3>Players</h3>
        <ul>
          {lobby.players.map((p) => (
            <li key={p.id} className={p.id === currentId ? "self" : ""}>
              {p.name}
              {p.isHost && <span className="badge host-badge">Host</span>}
              {p.id === currentId && (
                <span className="badge you-badge">You</span>
              )}
            </li>
          ))}
        </ul>
      </div>
      {isLauncher && (
        <button className="btn btn-start" onClick={handleStart}>
          Start Game
        </button>
      )}
      {!isLauncher && (
        <p className="waiting-msg">Waiting for host to start...</p>
      )}
    </div>
  );
};

export default Lobby;
