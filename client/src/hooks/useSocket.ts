import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export interface UseSocketReturn {
  socket: Socket | null;
  connected: boolean;
}

function useSocket(): UseSocketReturn {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const s = io(window.location.origin, { autoConnect: true });
    socketRef.current = s;

    s.on("connect", () => setConnected(true));
    s.on("disconnect", () => setConnected(false));

    return () => {
      s.disconnect();
      socketRef.current = null;
    };
  }, []);

  return { socket: socketRef.current, connected };
}

export default useSocket;
