import { z } from "zod";

// Game Constants
export const GAME_CONFIG = {
  WORLD_WIDTH: 1200,
  WORLD_HEIGHT: 800,
  MAGNET_RADIUS: 12,
  MAX_VELOCITY: 8,
  DAMPING: 0.95,
  MAGNETIC_STRENGTH: 3000,
  MIN_FORCE_DISTANCE: 26,
  MAX_FORCE_DISTANCE: 280, // Increased from 200 to 280 (40% larger magnetic field)
  TICK_RATE: 60,
  MAX_PLAYERS_PER_ROOM: 2,
  MAGNETS_PER_PLAYER: 8,
  MIN_MAGNETS_PER_PLAYER: 3,
  MAX_MAGNETS_PER_PLAYER: 15,
  MOVEMENT_THRESHOLD: 3, // If a magnet moves more than this distance, it needs to be picked up
} as const;

// Room Schema
export const roomSchema = z.object({
  code: z.string().length(6),
  name: z.string().min(1).max(50),
  playerCount: z.number(),
  maxPlayers: z.number(),
  createdAt: z.number(),
});

export type Room = z.infer<typeof roomSchema>;

// Magnet Schema
export const magnetSchema = z.object({
  id: z.string(),
  playerId: z.string(),
  x: z.number(),
  y: z.number(),
  vx: z.number().default(0),
  vy: z.number().default(0),
  isPlaced: z.boolean().default(false),
  initialX: z.number().optional(),
  initialY: z.number().optional(),
  isSettling: z.boolean().default(false),
});

export type Magnet = z.infer<typeof magnetSchema>;

// Player Schema
export const playerSchema = z.object({
  id: z.string(),
  username: z.string().min(1).max(20),
  color: z.string(),
  magnetsRemaining: z.number().default(GAME_CONFIG.MAGNETS_PER_PLAYER),
  magnets: z.array(magnetSchema).default([]),
  isReady: z.boolean().default(false),
});

export type Player = z.infer<typeof playerSchema>;

// Game State Schema
export const gameStateSchema = z.object({
  players: z.record(z.string(), playerSchema),
  magnets: z.array(magnetSchema).default([]),
  currentTurn: z.string().optional(), // playerId whose turn it is
  gamePhase: z.enum(["waiting", "playing", "finished"]).default("waiting"),
  winner: z.string().optional(),
  magnetCount: z.number().default(GAME_CONFIG.MAGNETS_PER_PLAYER),
  worldBounds: z.object({
    width: z.number(),
    height: z.number(),
  }),
});

export type GameState = z.infer<typeof gameStateSchema>;

// WebSocket Message Schemas
export const wsMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("player_joined"),
    player: playerSchema,
  }),
  z.object({
    type: z.literal("player_left"),
    playerId: z.string(),
  }),
  z.object({
    type: z.literal("game_state"),
    state: gameStateSchema,
  }),
  z.object({
    type: z.literal("place_magnet"),
    x: z.number(),
    y: z.number(),
  }),
  z.object({
    type: z.literal("player_ready"),
  }),
  z.object({
    type: z.literal("join"),
    username: z.string().min(1).max(20),
    roomCode: z.string().optional(),
    magnetCount: z.number().optional(),
  }),
  z.object({
    type: z.literal("set_magnet_count"),
    magnetCount: z.number(),
  }),
  z.object({
    type: z.literal("welcome"),
    playerId: z.string(),
    roomCode: z.string(),
    state: gameStateSchema,
  }),
  z.object({
    type: z.literal("room_full"),
  }),
  z.object({
    type: z.literal("room_not_found"),
  }),
  z.object({
    type: z.literal("magnets_moved"),
    movedMagnets: z.array(z.string()), // Array of magnet IDs that moved
  }),
  z.object({
    type: z.literal("game_started"),
  }),
  z.object({
    type: z.literal("game_over"),
    winner: playerSchema,
  }),
]);

export type WSMessage = z.infer<typeof wsMessageSchema>;

// Player colors for visual distinction
export const PLAYER_COLORS = [
  "#3B82F6", // Blue
  "#EF4444", // Red
  "#10B981", // Green
  "#F59E0B", // Amber
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#14B8A6", // Teal
  "#F97316", // Orange
] as const;
