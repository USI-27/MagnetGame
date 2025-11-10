import { WebSocket, WebSocketServer } from "ws";
import { Player, WSMessage, GameState, GAME_CONFIG, PLAYER_COLORS } from "@shared/schema";
import { PhysicsEngine } from "./physics";
import { randomUUID } from "crypto";

export class GameServer {
  private wss: WebSocketServer;
  private players: Map<string, Player>;
  private clients: Map<string, WebSocket>;
  private physics: PhysicsEngine;
  private gameLoop: NodeJS.Timeout | null;
  private colorIndex: number;

  constructor(wss: WebSocketServer) {
    this.wss = wss;
    this.players = new Map();
    this.clients = new Map();
    this.physics = new PhysicsEngine({
      width: GAME_CONFIG.WORLD_WIDTH,
      height: GAME_CONFIG.WORLD_HEIGHT,
    });
    this.gameLoop = null;
    this.colorIndex = 0;

    this.startGameLoop();
    this.setupWebSocket();
  }

  private setupWebSocket(): void {
    this.wss.on("connection", (ws: WebSocket) => {
      console.log("New client connected");

      ws.on("message", (data: string) => {
        try {
          const message: WSMessage = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      });

      ws.on("close", () => {
        console.log("Client disconnected");
        this.handleDisconnect(ws);
      });

      ws.on("error", (error) => {
        console.error("WebSocket error:", error);
      });
    });
  }

  private handleMessage(ws: WebSocket, message: WSMessage): void {
    switch (message.type) {
      case "join":
        this.handleJoin(ws, message.username);
        break;

      case "input":
        this.handleInput(ws, message.direction);
        break;

      case "toggle_polarity":
        this.handleTogglePolarity(ws);
        break;
    }
  }

  private handleJoin(ws: WebSocket, username: string): void {
    const playerId = randomUUID();
    const spawnPos = this.physics.getRandomSpawnPosition();
    const color = PLAYER_COLORS[this.colorIndex % PLAYER_COLORS.length];
    this.colorIndex++;

    const player: Player = {
      id: playerId,
      username,
      x: spawnPos.x,
      y: spawnPos.y,
      vx: 0,
      vy: 0,
      polarity: Math.random() < 0.5 ? 1 : -1,
      color,
      isMoving: false,
      targetVx: 0,
      targetVy: 0,
    };

    this.players.set(playerId, player);
    this.clients.set(playerId, ws);

    // Send welcome message to new player
    const welcomeMessage: WSMessage = {
      type: "welcome",
      playerId,
      state: this.getGameState(),
    };
    ws.send(JSON.stringify(welcomeMessage));

    // Broadcast new player to all other clients
    const joinMessage: WSMessage = {
      type: "player_joined",
      player,
    };
    this.broadcast(joinMessage, playerId);

    console.log(`Player ${username} (${playerId}) joined the game`);
  }

  private handleInput(ws: WebSocket, direction: { x: number; y: number }): void {
    const playerId = this.getPlayerIdBySocket(ws);
    if (!playerId) return;

    const player = this.players.get(playerId);
    if (!player) return;

    // Update player movement target
    player.isMoving = direction.x !== 0 || direction.y !== 0;
    player.targetVx = direction.x;
    player.targetVy = direction.y;
  }

  private handleTogglePolarity(ws: WebSocket): void {
    const playerId = this.getPlayerIdBySocket(ws);
    if (!playerId) return;

    const player = this.players.get(playerId);
    if (!player) return;

    player.polarity = player.polarity === 1 ? -1 : 1;
    console.log(`Player ${player.username} toggled polarity to ${player.polarity === 1 ? "N" : "S"}`);
  }

  private handleDisconnect(ws: WebSocket): void {
    const playerId = this.getPlayerIdBySocket(ws);
    if (!playerId) return;

    const player = this.players.get(playerId);
    if (player) {
      console.log(`Player ${player.username} (${playerId}) left the game`);
    }

    this.players.delete(playerId);
    this.clients.delete(playerId);

    // Broadcast player left
    const leftMessage: WSMessage = {
      type: "player_left",
      playerId,
    };
    this.broadcast(leftMessage);
  }

  private startGameLoop(): void {
    const tickRate = 1000 / GAME_CONFIG.TICK_RATE;
    
    this.gameLoop = setInterval(() => {
      // Update physics
      this.physics.update(this.players, tickRate / 1000);

      // Broadcast game state to all clients
      const stateMessage: WSMessage = {
        type: "game_state",
        state: this.getGameState(),
      };
      this.broadcast(stateMessage);
    }, tickRate);

    console.log(`Game loop started at ${GAME_CONFIG.TICK_RATE} ticks/sec`);
  }

  private getGameState(): GameState {
    const playersObject: Record<string, Player> = {};
    this.players.forEach((player, id) => {
      playersObject[id] = player;
    });

    return {
      players: playersObject,
      worldBounds: {
        width: GAME_CONFIG.WORLD_WIDTH,
        height: GAME_CONFIG.WORLD_HEIGHT,
      },
    };
  }

  private broadcast(message: WSMessage, excludePlayerId?: string): void {
    const messageStr = JSON.stringify(message);

    this.clients.forEach((client, playerId) => {
      if (playerId !== excludePlayerId && client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }

  private getPlayerIdBySocket(ws: WebSocket): string | null {
    for (const [playerId, client] of this.clients.entries()) {
      if (client === ws) {
        return playerId;
      }
    }
    return null;
  }

  stop(): void {
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }
    this.wss.close();
    console.log("Game server stopped");
  }
}
