# Magnet Force - Multiplayer Physics Game 🧲

A real-time multiplayer game where players strategically place magnets that attract each other. The goal is to be the first to place all your magnets without causing them to move!

## 🎮 Game Rules

- **2 Players** compete in real-time
- Each player starts with **8 magnets** (customizable 3-15)
- Take turns placing magnets on the board
- **All magnets attract each other** within a 280px radius
- If your placement causes magnets to move:
  - The placed magnet + all moved magnets return to your stack
  - Example: Place 1 magnet, 2 move → you get +3 magnets back
- **Win condition**: First player to empty their stack wins!

## ✨ Features

- 🎨 Beautiful glossy magnet design with pulsing auras
- ⚡ Real-time magnetic field visualization
- 📱 Touch support for mobile devices
- 🌐 Multiplayer via WebSocket
- 🎯 Strategic gameplay with physics simulation
- 🔄 3-second settling animation
- 💫 Particle effects and force lines

## 🚀 Quick Start

### Local Play (Same Network)

```bash
npm install
npm run dev
```

Open `http://localhost:5000` on both devices (same WiFi)

### Play Over Internet

See [deploy-instructions.md](./deploy-instructions.md) for deployment options:
- **ngrok** - Instant testing (5 min setup)
- **Render.com** - Free hosting forever
- **Railway.app** - Auto-deploy from GitHub
- **Fly.io** - Global edge deployment

## 🎯 How to Play

1. **Join Game**: Enter your name and click "Quick Join"
2. **Adjust Settings**: Use slider to choose 3-15 magnets
3. **Ready Up**: Click "Ready to Play" when both players join
4. **Place Magnets**: Click/tap to place your magnet
5. **Watch Physics**: See magnets settle for 3 seconds
6. **Strategic Thinking**: Avoid causing movements or you'll get magnets back!

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Canvas API
- **Backend**: Node.js + Express + WebSocket
- **Physics**: Custom magnetic force simulation
- **Styling**: Tailwind CSS + Radix UI
- **Build**: Vite

## 📱 Mobile Support

- Touch controls for placement
- Drag to preview magnetic field
- Optimized for Android/iOS browsers
- No zoom/scroll interference

## 🎨 Visual Features

- **Magnetic Field Visualization**: 5 gradient rings showing attraction strength
- **Interactive Preview**: See which magnets will be affected before placing
- **Settling Animation**: Watch magnets move in real-time
- **Force Lines**: Animated connections between attracting magnets
- **Particle Effects**: Flowing particles showing magnetic forces

## 🔧 Configuration

Edit `shared/schema.ts` to customize:
- `MAGNET_RADIUS`: Visual size (default: 12px)
- `MAX_FORCE_DISTANCE`: Magnetic field range (default: 280px)
- `MAGNETIC_STRENGTH`: Force strength (default: 3000)
- `MAGNETS_PER_PLAYER`: Starting magnets (default: 8)

## 📦 Project Structure

```
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Game & Lobby pages
│   │   └── lib/         # Utilities
├── server/              # Express + WebSocket backend
│   ├── gameServer.ts    # Game logic & room management
│   ├── physics.ts       # Magnetic force simulation
│   └── routes.ts        # HTTP & WebSocket setup
├── shared/              # Shared types & config
│   └── schema.ts        # Game constants & Zod schemas
```

## 🌐 Network Setup

### Local Network (Same WiFi)
1. Find your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Share: `http://YOUR_IP:5000`

### Internet (Any Device)
Deploy to cloud service (see deploy-instructions.md)

## 🎮 Game Mechanics

### Magnetic Physics
- Attraction force: `F = -k / r²`
- All magnets attract (no polarity)
- Force range: 26px - 280px
- Damping: 0.95 (friction)
- Max velocity: 8 px/frame

### Movement Detection
- Magnets track initial position
- Movement threshold: 3px
- Settling time: up to 3 seconds
- All moved magnets transfer to current player

## 🐛 Troubleshooting

**Can't connect on mobile?**
- Check both devices on same WiFi
- Open firewall port 5000
- Try different IP address

**Game laggy?**
- Reduce magnet count (3-5)
- Close other apps
- Move closer to WiFi router

**Magnets not moving?**
- Increase `MAGNETIC_STRENGTH`
- Decrease `DAMPING`
- Check `MAX_FORCE_DISTANCE`

## 📄 License

MIT

## 🤝 Contributing

Feel free to open issues or submit PRs!

---

Made with ❤️ and physics
