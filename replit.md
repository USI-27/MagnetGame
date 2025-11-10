# Magnet Game

A real-time multiplayer magnet physics game built with Node.js, Express, WebSockets, and HTML5 Canvas.

## Overview

Magnet Game is a browser-based multiplayer game where players control magnets in a shared 2D space. Magnets exert magnetic forces on each other based on polarity (North/South) and distance, creating dynamic physics-based gameplay. Players can move their magnets and toggle polarity to create attraction or repulsion effects.

## Current State

**Fully Implemented MVP Features:**
- ✅ WebSocket-based real-time multiplayer (up to 8 players)
- ✅ Server-authoritative physics engine (60 ticks/sec)
- ✅ Magnetic attraction/repulsion using inverse-square law
- ✅ Smooth HTML5 Canvas rendering with particle effects
- ✅ Player controls: Arrow keys for movement, Spacebar for polarity toggle
- ✅ Velocity damping and boundary collision detection
- ✅ Beautiful lobby system with player name input
- ✅ Real-time HUD showing player count, polarity status, and active players
- ✅ Visual force indicators (curved lines for attraction, radiating lines for repulsion)
- ✅ Responsive design with clean, minimal UI

## Project Architecture

### Frontend (`client/`)
- **Lobby.tsx**: Entry screen for joining the game with username input
- **Game.tsx**: Main game component handling WebSocket connection and input
- **GameCanvas.tsx**: HTML5 Canvas renderer with physics visualization
- **HUD.tsx**: Heads-up display showing game info and player list
- **App.tsx**: Root component managing app state (lobby vs game)

### Backend (`server/`)
- **routes.ts**: Express HTTP server and WebSocket server setup
- **gameServer.ts**: Game state management, player connections, message handling
- **physics.ts**: Physics engine with magnetic force calculations
- **storage.ts**: Not used (game state is in-memory only)

### Shared (`shared/`)
- **schema.ts**: TypeScript schemas for game state, players, and WebSocket messages

## How It Works

### Physics Simulation
1. Server runs game loop at 60 ticks per second
2. Calculates magnetic forces between all player magnets using `F = k * (p1 * p2) / r²`
3. Applies forces to player velocities
4. Updates positions based on velocities
5. Applies damping (friction) and enforces max velocity
6. Handles boundary collisions with bounce effect
7. Broadcasts updated state to all connected clients

### WebSocket Communication
- **Client → Server**: join, input (movement direction), toggle_polarity
- **Server → Client**: welcome, game_state, player_joined, player_left

### Rendering
- Canvas renders at 60fps using requestAnimationFrame
- Displays magnets as colored circles with polarity symbols (N/S)
- Shows force visualization lines between interacting magnets
- Renders particle effects for attraction
- Displays velocity arrows for moving magnets

## Game Constants

- World Size: 1200×800 pixels
- Magnet Radius: 25 pixels
- Max Velocity: 8 units/frame
- Damping: 0.95 (5% friction per frame)
- Magnetic Strength: 5000 (force multiplier)
- Force Range: 50-400 pixels

## Running the Project

The application starts automatically with:
```bash
npm run dev
```

This runs:
- Express server on port 5000 (backend + frontend)
- Vite dev server for hot module reload
- WebSocket server on `/ws` path

## User Preferences

None documented yet.

## Recent Changes

**November 10, 2025**
- Initial implementation of complete MVP
- Created all frontend components with Canvas rendering
- Implemented physics engine with magnetic forces
- Set up WebSocket server for real-time multiplayer
- Added HUD and visual effects
