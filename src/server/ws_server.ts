import { Server } from "ws";
import { WebSocketConnection } from "./ws_connection";

interface WebSocketMessage {
  type: string;
  session_id: string;
  prompt: string;
  model: string;
  id_token?: string;
}

export function setupWsServer(server: any) {
  const wss = new Server({
    server,
    path: "/client-ws",
    verifyClient: (info, done) => {
      const allowedOrigins = [
        process.env.BACKEND_URL,
        process.env.FRONTEND_URL,
      ];
      if (allowedOrigins.includes(info.origin)) {
        done(true);
      } else {
        console.log(
          `Rejected websocket connection from origin: ${info.origin}`
        );
        done(false, 403, "Forbidden: Invalid Origin");
      }
    },
  });

  console.log("WebSocket server listening on /client-ws");

  wss.on("connection", (ws) => {
    const connection = new WebSocketConnection(ws);
    connection.start();
  });

  wss.on("error", (error) => {
    console.error("WebSocket server error:", error);
  });

  return wss;
}
