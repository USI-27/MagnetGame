import { z } from "zod";

// Game Constants
export const GAME_CONFIG = {
  WORLD_WIDTH: 1200,
  WORLD_HEIGHT: 800,
  MAGNET_RADIUS: 25,
  MAX_VELOCITY: 8,
  DAMPING: 0.95,
  MAGNETIC_STRENGTH: 5000,
  MIN_FORCE_DISTANCE: 50,
  MAX_FORCE_DISTANCE: 400,
  TICK_RATE: 60,
} as const;

// Player Schema
export const playerSchema = z.object({
  id: z.string(),
  username: z.string().min(1).max(20),
  x: z.number(),
  y: z.number(),
  vx: z.number(),
  vy: z.number(),
  polarity: z.union([z.literal(1), z.literal(-1)]),
  color: z.string(),
  isMoving: z.boolean().default(false),
  targetVx: z.number().default(0),
  targetVy: z.number().default(0),
});

export type Player = z.infer<typeof playerSchema>;

// Game State Schema
export const gameStateSchema = z.object({
  players: z.record(z.string(), playerSchema),
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
    type: z.literal("input"),
    direction: z.object({
      x: z.number(),
      y: z.number(),
    }),
  }),
  z.object({
    type: z.literal("toggle_polarity"),
  }),
  z.object({
    type: z.literal("join"),
    username: z.string().min(1).max(20),
  }),
  z.object({
    type: z.literal("welcome"),
    playerId: z.string(),
    state: gameStateSchema,
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
