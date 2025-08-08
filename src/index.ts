import { log } from "./server/log";
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createServer } from "http";

import { setupMcpServer } from "./server/mcp";
import { setupWsServer } from "./server/ws_server";
import authGoogleRouter from "./server/auth_google";

import path from "path";

const app = express();

app.use(express.json());
app.use(authGoogleRouter);

app.use("/", express.static(path.join(__dirname, "../client/dist")));

const setupServer = async () => {
  log("Setting up MCP Stateless Streamable HTTP Server...");
  setupMcpServer(app);
};

const PORT = 3000;
const httpServer = createServer(app);

setupServer()
  .then(() => {
    const wss = setupWsServer(httpServer);

    const fareWell = () => {
      console.log("Received SIGINT/SIGTERM. Shutting down gracefully...");
      setTimeout(() => {
        console.error("Server shutdown timed out. Forcing exit.");
        process.exit(1);
      }, 2000);
      wss.close(() => {
        console.log("WebSocket server closed.");
        httpServer.close(() => {
          console.log("HTTP server closed. Exiting process.");
          process.exit(0);
        });
      });
    };

    process.on("SIGINT", fareWell);
    process.on("SIGTERM", fareWell);

    httpServer.listen(PORT, (error?: any) => {
      if (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
      }
      console.log(
        `MCP Stateless Streamable HTTP/WebSocket Server listening on port ${PORT}`
      );
    });
  })
  .catch((error) => {
    console.error("Failed to set up the server:", error);
    process.exit(1);
  });
