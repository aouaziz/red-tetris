import { useEffect } from "react";
import { Socket } from "socket.io-client";

const KEY_MAP: Record<string, string> = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "rotate",
  ArrowDown: "soft",
  " ": "hard",
};

function useKeyboard(socket: Socket | null, active: boolean): void {
  useEffect(() => {
    if (!socket || !active) return;

    const handler = (e: KeyboardEvent) => {
      const action = KEY_MAP[e.key];
      if (action) {
        e.preventDefault();
        socket.emit("action", action);
      }
    };

    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [socket, active]);
}

export default useKeyboard;
