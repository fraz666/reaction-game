import http from "http";
import express from "express";

import { Server, RelayRoom, LobbyRoom } from "@colyseus/core";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { monitor } from "@colyseus/monitor";

import { Battle } from "./rooms/Battle";
import { playground } from "@colyseus/playground";

const port = Number(process.env.PORT || 2567);
const endpoint = "0.0.0.0";

console.log("Starting server...");

// Create HTTP & WebSocket servers
const app = express();
const server = http.createServer(app);
const transport = new WebSocketTransport({ server });

const gameServer = new Server({
  transport,
  // devMode: true
});

app.use(express.json());

gameServer.define('duel', Battle);

/**
 * Use @colyseus/playground
 * (It is not recommended to expose this route in a production environment)
 */
if (process.env.NODE_ENV !== "production") {
    app.use("/", playground);
}

/**
 * Use @colyseus/monitor
 * It is recommended to protect this route with a password
 * Read more: https://docs.colyseus.io/tools/monitor/#restrict-access-to-the-panel-using-a-password
 */
app.use("/monitor", monitor());

gameServer.listen(port, endpoint)
  .then(() => console.log(`Listening on ws://${endpoint}:${port}`))
  .catch((err) => {
    console.log(err);
    process.exit(1)
  });