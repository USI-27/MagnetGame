# 🎮 Standalone Game - Easy Setup

## Option 1: Simple Launcher (Easiest)

### What You Get:
- One-click launcher
- Auto-installs dependencies on first run
- Opens game in browser automatically

### How to Use:

1. **Double-click**: `MagnetForceGame.bat`
2. **First time**: Installs dependencies (takes 2-3 minutes)
3. **Game opens**: Browser opens at http://localhost:5000
4. **Play!**

### Share with Friends:
- **Same WiFi**: Share `http://YOUR_IP:5000`
- **Internet**: Use ngrok (see NGROK-GUIDE.md)

### Requirements:
- Windows 10/11
- Node.js installed (https://nodejs.org)

---

## Option 2: Portable Package

### What You Get:
- Folder with everything included
- Copy to any PC and run
- No internet needed after creation

### How to Create:

1. **Run**: `create-portable.bat`
2. **Wait**: Creates `MagnetForce-Portable` folder
3. **Copy**: Move folder to USB drive or another PC
4. **Run**: Double-click `START-GAME.bat` in the folder

### Portable Package Contents:
```
MagnetForce-Portable/
├── START-GAME.bat      ← Double-click this!
├── dist/               ← Built game files
├── node_modules/       ← All dependencies
├── package.json        ← Package info
└── README.txt          ← Instructions
```

### Size:
- ~200-300 MB (includes all dependencies)
- Can be compressed to ~50 MB with 7-Zip

### Requirements on Target PC:
- Windows 10/11
- Node.js installed

---

## Option 3: True Standalone .exe (Advanced)

### Using Electron (Recommended for .exe)

This creates a real Windows application with no Node.js required.

#### Step 1: Install Electron Builder
```bash
npm install --save-dev electron electron-builder
```

#### Step 2: Create Electron Wrapper
I can create this for you - it will:
- Bundle Node.js inside
- Create a Windows .exe
- No external dependencies needed
- ~150 MB final size

#### Step 3: Build
```bash
npm run build:electron
```

Would you like me to set this up?

---

## Comparison

| Method | Size | Setup Time | Requirements | Best For |
|--------|------|------------|--------------|----------|
| **Simple Launcher** | Small | Instant | Node.js | Quick testing |
| **Portable Package** | ~300 MB | 5 min | Node.js | Share with friends |
| **Electron .exe** | ~150 MB | 10 min | None | Distribution |

---

## Recommended Approach

### For Personal Use:
✅ Use `MagnetForceGame.bat` - simplest!

### For Sharing with Friends:
✅ Use `create-portable.bat` - they just need Node.js

### For Public Distribution:
✅ Use Electron - creates real .exe with no dependencies

---

## Quick Start

### Right Now (Fastest):
```bash
# Just double-click:
MagnetForceGame.bat
```

### Create Portable Version:
```bash
# Double-click:
create-portable.bat

# Then copy MagnetForce-Portable folder anywhere
```

### Build True .exe:
```bash
# Let me know if you want this - I'll set it up!
```

---

## Troubleshooting

### "Node.js not found"
- Install from: https://nodejs.org
- Choose LTS version
- Restart terminal after install

### "Dependencies failed to install"
- Check internet connection
- Run as Administrator
- Delete node_modules and try again

### "Port 5000 already in use"
- Close other instances
- Or change port in package.json

### Game doesn't open in browser
- Manually open: http://localhost:5000
- Check if server started (look for "serving on port 5000")

---

## Advanced: Electron Setup

If you want a true standalone .exe with no Node.js requirement, I can:

1. Create Electron wrapper
2. Bundle everything (Node.js + game)
3. Build Windows .exe
4. Add installer (optional)
5. Add auto-updater (optional)

Final result:
- `MagnetForceGame-Setup.exe` (installer)
- Or `MagnetForceGame.exe` (portable)
- ~150 MB
- No dependencies needed
- Runs on any Windows PC

Let me know if you want this!

---

## Files Created

- ✅ `MagnetForceGame.bat` - Simple launcher
- ✅ `create-portable.bat` - Create portable package
- ✅ `build-exe.bat` - Build executable (needs setup)

---

## Next Steps

1. **Try the simple launcher**: Double-click `MagnetForceGame.bat`
2. **If you like it**: Create portable version with `create-portable.bat`
3. **Want true .exe?**: Let me know and I'll set up Electron!

Enjoy! 🎮
