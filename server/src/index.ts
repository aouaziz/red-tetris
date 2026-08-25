import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import fs from "fs";
import { GameManager } from "./domain/GameManager";
import { registerSocketHandlers } from "./socket/handler";

// Load .env variables safely if present
function loadEnv(): void {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const equalsIdx = trimmed.indexOf("=");
      if (equalsIdx > 0) {
        const key = trimmed.slice(0, equalsIdx).trim();
        const value = trimmed.slice(equalsIdx + 1).trim().replace(/^["']|["']$/g, "");
        if (key && !(key in process.env)) {
          process.env[key] = value;
        }
      }
    }
  }
}
loadEnv();

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const manager = new GameManager();
registerSocketHandlers(io, manager);

const clientPath = path.join(__dirname, "../../dist/client");
app.use(express.static(clientPath));

app.get("*", (_req, res) => {
  res.sendFile(path.join(clientPath, "index.html"));
});

const port = Number(process.env.PORT) || 3000;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
