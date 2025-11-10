import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { GameServer } from "./gameServer";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Create WebSocket server on /ws path (separate from Vite's HMR)
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Initialize game server
  const gameServer = new GameServer(wss);

  console.log("WebSocket server initialized on path /ws");

  // Cleanup on server shutdown
  httpServer.on("close", () => {
    gameServer.stop();
  });

  return httpServer;
}
