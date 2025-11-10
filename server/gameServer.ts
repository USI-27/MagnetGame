import { WebSocket, WebSocketServer } from "ws";
import { Player, Magnet, WSMessage, GameState, GAME_CONFIG, PLAYER_COLORS } from "@shared/schema";
import { PhysicsEngine } from "./physics";
import { randomUUID } from "crypto";

interface GameRoom {
  code: string;
  players: Map<string, Player>;
  clients: Map<string, WebSocket>;
  magnets: Magnet[];
  physics: PhysicsEngine;
  gameLoop: NodeJS.Timeout | null;
  colorIndex: number;
  createdAt: number;
  currentTurn: string | null;
  gamePhase: "waiting" | "playing" | "finished";
  winner: string | null;
  playerOrder: string[];
  magnetCount: number;
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
      magnets: [],
      physics: new PhysicsEngine({
        width: GAME_CONFIG.WORLD_WIDTH,
        height: GAME_CONFIG.WORLD_HEIGHT,
      }),
      gameLoop: null,
      colorIndex: 0,
      createdAt: Date.now(),
      currentTurn: null,
      gamePhase: "waiting",
      winner: null,
      playerOrder: [],
      magnetCount: GAME_CONFIG.MAGNETS_PER_PLAYER,
    };

    this.rooms.set(code, room);
    this.startRoomGameLoop(code);
    console.log(`Created room: ${code}`);
    
    return code;
  }

  private getOrCreateRoom(roomCode?: string): string {
    if (roomCode && this.rooms.has(roomCode)) {
      const room = this.rooms.get(roomCode)!;
      if (room.players.size < GAME_CONFIG.MAX_PLAYERS_PER_ROOM && room.gamePhase === "waiting") {
        return roomCode;
      }
      return "";
    }

    // If no room code or room doesn't exist, find or create default room
    if (!roomCode) {
      // Find a room with available space
      for (const [code, room] of Array.from(this.rooms.entries())) {
        if (room.players.size < GAME_CONFIG.MAX_PLAYERS_PER_ROOM && room.gamePhase === "waiting") {
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
        this.handleJoin(ws, message.username, message.roomCode, message.magnetCount);
        break;

      case "player_ready":
        this.handlePlayerReady(ws);
        break;

      case "place_magnet":
        this.handlePlaceMagnet(ws, message.x, message.y);
        break;

      case "set_magnet_count":
        this.handleSetMagnetCount(ws, message.magnetCount);
        break;
    }
  }

  private handleJoin(ws: WebSocket, username: string, requestedRoomCode?: string, magnetCount?: number): void {
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
    const color = PLAYER_COLORS[room.colorIndex % PLAYER_COLORS.length];
    room.colorIndex++;

    const player: Player = {
      id: playerId,
      username,
      color,
      magnetsRemaining: GAME_CONFIG.MAGNETS_PER_PLAYER,
      magnets: [],
      isReady: false,
    };

    room.players.set(playerId, player);
    room.clients.set(playerId, ws);
    this.playerRooms.set(playerId, roomCode);
    room.playerOrder.push(playerId);

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

  private handleSetMagnetCount(ws: WebSocket, magnetCount: number): void {
    const playerId = this.getPlayerIdBySocket(ws);
    if (!playerId) return;

    const roomCode = this.playerRooms.get(playerId);
    if (!roomCode) return;

    const room = this.rooms.get(roomCode);
    if (!room) return;

    // Only allow changing magnet count in waiting phase
    if (room.gamePhase !== "waiting") return;

    // Validate magnet count
    if (magnetCount < GAME_CONFIG.MIN_MAGNETS_PER_PLAYER || magnetCount > GAME_CONFIG.MAX_MAGNETS_PER_PLAYER) {
      return;
    }

    room.magnetCount = magnetCount;
    console.log(`[handleSetMagnetCount] Room ${roomCode} magnet count set to ${magnetCount}`);

    // Broadcast updated state
    this.broadcastGameState(roomCode);
  }

  private handlePlayerReady(ws: WebSocket): void {
    const playerId = this.getPlayerIdBySocket(ws);
    console.log(`[handlePlayerReady] Player ${playerId} clicked ready`);
    if (!playerId) return;

    const roomCode = this.playerRooms.get(playerId);
    if (!roomCode) return;

    const room = this.rooms.get(roomCode);
    if (!room) return;

    const player = room.players.get(playerId);
    if (!player) return;

    player.isReady = true;
    console.log(`[handlePlayerReady] Player ${player.username} is now ready`);
    console.log(`[handlePlayerReady] Room has ${room.players.size} players`);

    // Check if all players are ready and we have exactly 2 players
    if (room.players.size === GAME_CONFIG.MAX_PLAYERS_PER_ROOM) {
      const allReady = Array.from(room.players.values()).every(p => p.isReady);
      console.log(`[handlePlayerReady] All players ready: ${allReady}`);
      
      if (allReady) {
        console.log(`[handlePlayerReady] Starting game in room ${roomCode}`);
        this.startGame(roomCode);
      }
    }

    // Broadcast updated state
    this.broadcastGameState(roomCode);
  }

  private startGame(roomCode: string): void {
    const room = this.rooms.get(roomCode);
    if (!room) return;

    console.log(`[startGame] Starting game in room ${roomCode}`);
    room.gamePhase = "playing";
    
    // Assign magnets to each player (no polarity - all magnets attract)
    room.players.forEach((player) => {
      console.log(`[startGame] Assigning ${room.magnetCount} magnets to player ${player.username}`);
      player.magnetsRemaining = room.magnetCount;
      for (let i = 0; i < room.magnetCount; i++) {
        const magnet: Magnet = {
          id: randomUUID(),
          playerId: player.id,
          x: 0,
          y: 0,
          vx: 0,
          vy: 0,
          isPlaced: false,
          isSettling: false,
        };
        player.magnets.push(magnet);
        room.magnets.push(magnet);
      }
      console.log(`[startGame] Player ${player.username} has ${player.magnets.length} magnets`);
    });

    // Set first player's turn
    room.currentTurn = room.playerOrder[0];
    console.log(`[startGame] First turn: ${room.currentTurn}`);

    const startMessage: WSMessage = { type: "game_started" };
    this.broadcastToRoom(roomCode, startMessage);

    console.log(`[startGame] Game started in room ${roomCode}, broadcasting state`);
    this.broadcastGameState(roomCode);
  }

  private handlePlaceMagnet(ws: WebSocket, x: number, y: number): void {
    const playerId = this.getPlayerIdBySocket(ws);
    if (!playerId) return;

    const roomCode = this.playerRooms.get(playerId);
    if (!roomCode) return;

    const room = this.rooms.get(roomCode);
    if (!room) return;

    // Check if it's this player's turn
    if (room.currentTurn !== playerId) {
      console.log(`Not ${playerId}'s turn`);
      return;
    }

    const player = room.players.get(playerId);
    if (!player) return;

    // STACK APPROACH: Check if player has magnets in their stack
    if (player.magnets.length === 0) {
      console.log(`[handlePlaceMagnet] Player ${player.username} has no magnets in stack!`);
      return;
    }

    // Validate placement
    if (!room.physics.isValidPlacement(x, y, room.magnets)) {
      console.log(`[handlePlaceMagnet] Invalid placement at (${x}, ${y})`);
      return;
    }

    // STACK: Pop one magnet from player's stack
    const magnetToPlace = player.magnets.pop()!;
    console.log(`[handlePlaceMagnet] Player ${player.username} popped magnet from stack. Stack size: ${player.magnets.length + 1} -> ${player.magnets.length}`);

    // Place the magnet on the board
    magnetToPlace.x = x;
    magnetToPlace.y = y;
    magnetToPlace.initialX = x;
    magnetToPlace.initialY = y;
    magnetToPlace.isPlaced = true;
    magnetToPlace.isSettling = true;

    // Update magnetsRemaining (stack size)
    player.magnetsRemaining = player.magnets.length;

    console.log(`[handlePlaceMagnet] Player ${player.username} placed magnet at (${x}, ${y}). Stack remaining: ${player.magnetsRemaining}`);

    // Start settling process
    this.startSettlingProcess(roomCode, magnetToPlace.id, playerId);
  }

  private startSettlingProcess(roomCode: string, placedMagnetId: string, currentPlayerId: string): void {
    const room = this.rooms.get(roomCode);
    if (!room) return;

    const settlingStartTime = Date.now();
    const SETTLING_DURATION = 3000; // 3 seconds to settle
    const CHECK_INTERVAL = 100; // Check every 100ms

    const checkSettling = () => {
      const room = this.rooms.get(roomCode);
      if (!room) return;

      const elapsed = Date.now() - settlingStartTime;
      
      // Check if any magnets have moved significantly
      const movedMagnets: string[] = [];
      room.magnets.forEach(magnet => {
        if (magnet.isPlaced && magnet.id !== placedMagnetId && magnet.initialX !== undefined && magnet.initialY !== undefined) {
          const distanceFromInitial = Math.sqrt(
            Math.pow(magnet.x - magnet.initialX, 2) + 
            Math.pow(magnet.y - magnet.initialY, 2)
          );
          
          if (distanceFromInitial > GAME_CONFIG.MOVEMENT_THRESHOLD) {
            movedMagnets.push(magnet.id);
          }
        }
      });

      // If settling time is up or magnets have stopped moving
      const allMagnetsStill = room.magnets.every(m => 
        !m.isPlaced || (Math.abs(m.vx) < 0.1 && Math.abs(m.vy) < 0.1)
      );

      if (elapsed >= SETTLING_DURATION || (allMagnetsStill && elapsed > 500)) {
        // Settling complete
        this.completeSettling(roomCode, placedMagnetId, currentPlayerId, movedMagnets);
      } else {
        // Continue checking
        setTimeout(checkSettling, CHECK_INTERVAL);
      }
    };

    // Start checking
    setTimeout(checkSettling, CHECK_INTERVAL);
  }

  private completeSettling(roomCode: string, placedMagnetId: string, currentPlayerId: string, movedMagnets: string[]): void {
    const room = this.rooms.get(roomCode);
    if (!room) return;

    const currentPlayer = room.players.get(currentPlayerId);
    if (!currentPlayer) return;

    const placedMagnet = room.magnets.find(m => m.id === placedMagnetId);
    if (placedMagnet) {
      placedMagnet.isSettling = false;
    }

    // Filter out the just-placed magnet from moved magnets
    const movedMagnetsExcludingNew = movedMagnets.filter(id => id !== placedMagnetId);

    console.log(`[completeSettling] Settling complete. ${movedMagnetsExcludingNew.length} magnets moved (excluding just-placed).`);

    if (movedMagnetsExcludingNew.length > 0) {
      // STACK APPROACH: 
      // 1. Remove moved magnets from the board
      // 2. Push the just-placed magnet + all moved magnets back to current player's stack
      
      console.log(`[completeSettling] Player ${currentPlayer.username} stack before: ${currentPlayer.magnets.length}`);
      
      // First, push the just-placed magnet back to stack (it failed to stay)
      if (placedMagnet) {
        placedMagnet.isPlaced = false;
        placedMagnet.x = 0;
        placedMagnet.y = 0;
        placedMagnet.vx = 0;
        placedMagnet.vy = 0;
        placedMagnet.initialX = undefined;
        placedMagnet.initialY = undefined;
        currentPlayer.magnets.push(placedMagnet);
        console.log(`[completeSettling] Pushed just-placed magnet back to ${currentPlayer.username}'s stack`);
      }
      
      // Then, push all moved magnets to current player's stack
      movedMagnetsExcludingNew.forEach(magnetId => {
        const magnet = room.magnets.find(m => m.id === magnetId);
        if (!magnet) return;

        const originalOwnerId = magnet.playerId;
        const originalOwner = room.players.get(originalOwnerId);
        
        console.log(`[completeSettling] Magnet moved. Original owner: ${originalOwner?.username}`);

        // Reset magnet to unplaced state
        magnet.isPlaced = false;
        magnet.isSettling = false;
        magnet.x = 0;
        magnet.y = 0;
        magnet.vx = 0;
        magnet.vy = 0;
        magnet.initialX = undefined;
        magnet.initialY = undefined;
        
        // Change ownership to current player and push to their stack
        magnet.playerId = currentPlayerId;
        currentPlayer.magnets.push(magnet);
        console.log(`[completeSettling] Pushed moved magnet to ${currentPlayer.username}'s stack`);
      });

      console.log(`[completeSettling] Player ${currentPlayer.username} stack after: ${currentPlayer.magnets.length}`);
      
      // Update stack sizes for all players
      room.players.forEach((player) => {
        player.magnetsRemaining = player.magnets.length;
        console.log(`[completeSettling] ${player.username} stack size: ${player.magnetsRemaining}`);
      });

      const movedMessage: WSMessage = {
        type: "magnets_moved",
        movedMagnets: movedMagnetsExcludingNew,
      };
      this.broadcastToRoom(roomCode, movedMessage);
    }

    // Check win condition: current player's stack is empty
    console.log(`[completeSettling] ${currentPlayer.username} stack size: ${currentPlayer.magnets.length}`);
    
    if (currentPlayer.magnets.length === 0) {
      console.log(`[completeSettling] ${currentPlayer.username} wins! Stack is empty.`);
      this.endGame(roomCode, currentPlayerId);
      return;
    }

    // Move to next player's turn
    const currentIndex = room.playerOrder.indexOf(currentPlayerId);
    const nextIndex = (currentIndex + 1) % room.playerOrder.length;
    room.currentTurn = room.playerOrder[nextIndex];

    console.log(`[completeSettling] Turn advances to ${room.players.get(room.currentTurn)?.username}`);
    this.broadcastGameState(roomCode);
  }

  private endGame(roomCode: string, winnerId: string): void {
    const room = this.rooms.get(roomCode);
    if (!room) return;

    room.gamePhase = "finished";
    room.winner = winnerId;

    const winner = room.players.get(winnerId);
    if (winner) {
      const gameOverMessage: WSMessage = {
        type: "game_over",
        winner,
      };
      this.broadcastToRoom(roomCode, gameOverMessage);
      console.log(`Game over in room ${roomCode}. Winner: ${winner.username}`);
    }

    this.broadcastGameState(roomCode);
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

    // Remove player's magnets
    room.magnets = room.magnets.filter(m => m.playerId !== playerId);
    
    room.players.delete(playerId);
    room.clients.delete(playerId);
    this.playerRooms.delete(playerId);
    room.playerOrder = room.playerOrder.filter(id => id !== playerId);

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
      if (room.gamePhase === "playing") {
        // Update physics only during active gameplay
        room.physics.update(room.magnets, tickRate / 1000);
      }

      // Broadcast game state to all clients in room
      this.broadcastGameState(roomCode);
    }, tickRate);

    console.log(`Game loop started for room ${roomCode}`);
  }

  private broadcastGameState(roomCode: string): void {
    const stateMessage: WSMessage = {
      type: "game_state",
      state: this.getRoomGameState(roomCode),
    };
    this.broadcastToRoom(roomCode, stateMessage);
  }

  private getRoomGameState(roomCode: string): GameState {
    const room = this.rooms.get(roomCode);
    if (!room) {
      return {
        players: {},
        magnets: [],
        gamePhase: "waiting",
        magnetCount: GAME_CONFIG.MAGNETS_PER_PLAYER,
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
      magnets: room.magnets,
      currentTurn: room.currentTurn || undefined,
      gamePhase: room.gamePhase,
      winner: room.winner || undefined,
      magnetCount: room.magnetCount,
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
