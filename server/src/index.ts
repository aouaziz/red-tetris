import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { GameManager } from "./domain/GameManager";
import { registerSocketHandlers } from "./socket/handler";

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

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
