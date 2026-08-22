import React from "react";
import { PublicPlayer } from "../hooks/useGame";
import Spectrum from "./Spectrum";

interface PlayerListProps {
  players: PublicPlayer[];
  currentId: string;
}

const PlayerList: React.FC<PlayerListProps> = ({ players, currentId }) => {
  const opponents = players.filter((p) => p.id !== currentId);
  if (opponents.length === 0) return null;

  return (
    <div className="player-list">
      <h3>Opponents</h3>
      {opponents.map((p) => (
        <Spectrum
          key={p.id}
          spectrum={p.spectrum}
          name={p.name}
          alive={p.alive}
        />
      ))}
    </div>
  );
};

export default PlayerList;
