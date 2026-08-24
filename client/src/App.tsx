import React, { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import Home from "./pages/Home";
import GamePage from "./pages/GamePage";

function parseHash(): { room: string; playerName: string } | null {
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) return null;

  // Support #room[playerName] (42 subject notation)
  const bracketMatch = hash.match(/^([^[/\]]+)\[([^[/\]]+)\]$/);
  if (bracketMatch) {
    const room = decodeURIComponent(bracketMatch[1]).trim();
    const playerName = decodeURIComponent(bracketMatch[2]).trim();
    if (room && playerName && room.length <= 50 && playerName.length <= 50) {
      return { room, playerName };
    }
  }

  // Support #room/playerName
  const slashIdx = hash.indexOf("/");
  if (slashIdx > 0 && slashIdx < hash.length - 1) {
    const room = decodeURIComponent(hash.slice(0, slashIdx)).trim();
    const playerName = decodeURIComponent(hash.slice(slashIdx + 1)).trim();
    if (
      room &&
      playerName &&
      room.length <= 50 &&
      playerName.length <= 50 &&
      !room.includes("[") &&
      !room.includes("]") &&
      !playerName.includes("[") &&
      !playerName.includes("]") &&
      !playerName.includes("/")
    ) {
      return { room, playerName };
    }
  }

  return null;
}

const App: React.FC = () => {
  const [route, setRoute] = useState(parseHash);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Listen for hash changes
  useEffect(() => {
    const onHashChange = () => {
      setRoute(parseHash());
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // Connect/disconnect socket based on route
  useEffect(() => {
    if (!route) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const s = io(window.location.origin, { autoConnect: true });
    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [route?.room, route?.playerName]);

  if (!route || !socket) {
    return <Home />;
  }

  return (
    <GamePage socket={socket} room={route.room} playerName={route.playerName} />
  );
};

export default App;
