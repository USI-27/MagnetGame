import { WebSocket, WebSocketServer } from "ws";
import { Player, WSMessage, GameState, GAME_CONFIG, PLAYER_COLORS } from "@shared/schema";
import { PhysicsEngine } from "./physics";
import { randomUUID } from "crypto";

interface GameRoom {
  code: string;
  players: Map<string, Player>;
  clients: Map<string, WebSocket>;
  physics: PhysicsEngine;
  gameLoop: NodeJS.Timeout | null;
  colorIndex: number;
  createdAt: number;
}

export class GameServer {
  private wss: WebSocketServer;
  private rooms: Map<string, GameRoom>;
  private playerRooms: Map<string, string>; // playerId -> roomCode

  constructor(wss: WebSocketServer) {
    this.wss = wss;
    this.rooms = new Map();
    this.playerRooms = new Map();

    this.setupWebSocket();
  }

  private generateRoomCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  private createRoom(roomCode?: string): string {
    const code = roomCode || this.generateRoomCode();
    
    // Ensure unique code
    while (this.rooms.has(code)) {
      return this.createRoom();
    }

    const room: GameRoom = {
      code,
      players: new Map(),
      clients: new Map(),
      physics: new PhysicsEngine({
        width: GAME_CONFIG.WORLD_WIDTH,
        height: GAME_CONFIG.WORLD_HEIGHT,
      }),
      gameLoop: null,
      colorIndex: 0,
      createdAt: Date.now(),
    };

    this.rooms.set(code, room);
    this.startRoomGameLoop(code);
    console.log(`Created room: ${code}`);
    
    return code;
  }

  private getOrCreateRoom(roomCode?: string): string {
    if (roomCode && this.rooms.has(roomCode)) {
      const room = this.rooms.get(roomCode)!;
      if (room.players.size < GAME_CONFIG.MAX_PLAYERS_PER_ROOM) {
        return roomCode;
      }
      return "";
    }

    // If no room code or room doesn't exist, find or create default room
    if (!roomCode) {
      // Find a room with available space
      for (const [code, room] of Array.from(this.rooms.entries())) {
        if (room.players.size < GAME_CONFIG.MAX_PLAYERS_PER_ROOM) {
          return code;
        }
      }
    }

    // Create new room
    return this.createRoom(roomCode);
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
        this.handleJoin(ws, message.username, message.roomCode);
        break;

      case "input":
        this.handleInput(ws, message.direction);
        break;

      case "toggle_polarity":
        this.handleTogglePolarity(ws);
        break;
    }
  }

  private handleJoin(ws: WebSocket, username: string, requestedRoomCode?: string): void {
    const roomCode = this.getOrCreateRoom(requestedRoomCode);
    
    if (!roomCode) {
      const fullMessage: WSMessage = { type: "room_full" };
      ws.send(JSON.stringify(fullMessage));
      return;
    }

    const room = this.rooms.get(roomCode);
    if (!room) {
      const notFoundMessage: WSMessage = { type: "room_not_found" };
      ws.send(JSON.stringify(notFoundMessage));
      return;
    }

    const playerId = randomUUID();
    const spawnPos = room.physics.getRandomSpawnPosition();
    const color = PLAYER_COLORS[room.colorIndex % PLAYER_COLORS.length];
    room.colorIndex++;

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

    room.players.set(playerId, player);
    room.clients.set(playerId, ws);
    this.playerRooms.set(playerId, roomCode);

    // Send welcome message to new player
    const welcomeMessage: WSMessage = {
      type: "welcome",
      playerId,
      roomCode,
      state: this.getRoomGameState(roomCode),
    };
    ws.send(JSON.stringify(welcomeMessage));

    // Broadcast new player to all other clients in room
    const joinMessage: WSMessage = {
      type: "player_joined",
      player,
    };
    this.broadcastToRoom(roomCode, joinMessage, playerId);

    console.log(`Player ${username} (${playerId}) joined room ${roomCode}`);
  }

  private handleInput(ws: WebSocket, direction: { x: number; y: number }): void {
    const playerId = this.getPlayerIdBySocket(ws);
    if (!playerId) return;

    const roomCode = this.playerRooms.get(playerId);
    if (!roomCode) return;

    const room = this.rooms.get(roomCode);
    if (!room) return;

    const player = room.players.get(playerId);
    if (!player) return;

    // Update player movement target
    player.isMoving = direction.x !== 0 || direction.y !== 0;
    player.targetVx = direction.x;
    player.targetVy = direction.y;
  }

  private handleTogglePolarity(ws: WebSocket): void {
    const playerId = this.getPlayerIdBySocket(ws);
    if (!playerId) return;

    const roomCode = this.playerRooms.get(playerId);
    if (!roomCode) return;

    const room = this.rooms.get(roomCode);
    if (!room) return;

    const player = room.players.get(playerId);
    if (!player) return;

    player.polarity = player.polarity === 1 ? -1 : 1;
    console.log(`Player ${player.username} toggled polarity to ${player.polarity === 1 ? "N" : "S"}`);
  }

  private handleDisconnect(ws: WebSocket): void {
    const playerId = this.getPlayerIdBySocket(ws);
    if (!playerId) return;

    const roomCode = this.playerRooms.get(playerId);
    if (!roomCode) return;

    const room = this.rooms.get(roomCode);
    if (!room) return;

    const player = room.players.get(playerId);
    if (player) {
      console.log(`Player ${player.username} (${playerId}) left room ${roomCode}`);
    }

    room.players.delete(playerId);
    room.clients.delete(playerId);
    this.playerRooms.delete(playerId);

    // Broadcast player left
    const leftMessage: WSMessage = {
      type: "player_left",
      playerId,
    };
    this.broadcastToRoom(roomCode, leftMessage);

    // Clean up empty rooms after a delay
    if (room.players.size === 0) {
      setTimeout(() => {
        const currentRoom = this.rooms.get(roomCode);
        if (currentRoom && currentRoom.players.size === 0) {
          if (currentRoom.gameLoop) {
            clearInterval(currentRoom.gameLoop);
          }
          this.rooms.delete(roomCode);
          console.log(`Deleted empty room: ${roomCode}`);
        }
      }, 30000); // 30 second grace period
    }
  }

  private startRoomGameLoop(roomCode: string): void {
    const room = this.rooms.get(roomCode);
    if (!room) return;

    const tickRate = 1000 / GAME_CONFIG.TICK_RATE;
    
    room.gameLoop = setInterval(() => {
      // Update physics
      room.physics.update(room.players, tickRate / 1000);

      // Broadcast game state to all clients in room
      const stateMessage: WSMessage = {
        type: "game_state",
        state: this.getRoomGameState(roomCode),
      };
      this.broadcastToRoom(roomCode, stateMessage);
    }, tickRate);

    console.log(`Game loop started for room ${roomCode}`);
  }

  private getRoomGameState(roomCode: string): GameState {
    const room = this.rooms.get(roomCode);
    if (!room) {
      return {
        players: {},
        worldBounds: {
          width: GAME_CONFIG.WORLD_WIDTH,
          height: GAME_CONFIG.WORLD_HEIGHT,
        },
      };
    }

    const playersObject: Record<string, Player> = {};
    room.players.forEach((player, id) => {
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

  private broadcastToRoom(roomCode: string, message: WSMessage, excludePlayerId?: string): void {
    const room = this.rooms.get(roomCode);
    if (!room) return;

    const messageStr = JSON.stringify(message);

    room.clients.forEach((client, playerId) => {
      if (playerId !== excludePlayerId && client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }

  private getPlayerIdBySocket(ws: WebSocket): string | null {
    for (const [roomCode, room] of Array.from(this.rooms.entries())) {
      for (const [playerId, client] of Array.from(room.clients.entries())) {
        if (client === ws) {
          return playerId;
        }
      }
    }
    return null;
  }

  stop(): void {
    this.rooms.forEach((room) => {
      if (room.gameLoop) {
        clearInterval(room.gameLoop);
      }
    });
    this.rooms.clear();
    this.wss.close();
    console.log("Game server stopped");
  }
}
