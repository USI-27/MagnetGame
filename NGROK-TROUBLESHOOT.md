# 🔧 ngrok Not Working? - Quick Fixes

## Problem: "This site can't be reached"

### Check 1: Is ngrok running?
```powershell
# You should see this in ngrok terminal:
Forwarding  https://abc123.ngrok.io -> http://localhost:5000
```

**If not**: Start ngrok with `.\ngrok http 5000`

### Check 2: Is game server running?
```powershell
# You should see this in server terminal:
serving on port 5000
```

**If not**: Start server with `npm run dev`

### Check 3: Are you using HTTPS?
- ❌ Wrong: `http://abc123.ngrok.io`
- ✅ Correct: `https://abc123.ngrok.io`

**Fix**: Add the 's' in https

## Problem: "WebSocket connection failed"

### Cause: HTTP instead of HTTPS

**Solution**: Always use the HTTPS URL from ngrok

### Check Browser Console:
1. Open the game URL
2. Press F12 (Developer Tools)
3. Go to Console tab
4. Look for WebSocket errors

**If you see**: "Mixed Content" or "Insecure WebSocket"
- You're using HTTP instead of HTTPS
- Use the https:// URL

## Problem: Works locally but not on other device

### Check 1: Firewall
Windows Firewall might be blocking ngrok.

**Solution**:
1. Open Windows Defender Firewall
2. Click "Allow an app"
3. Find "ngrok" or add it
4. Allow for both Private and Public networks

### Check 2: ngrok Authentication
Free tier requires authentication.

**Solution**:
1. Sign up at https://ngrok.com
2. Get authtoken from dashboard
3. Run: `.\ngrok config add-authtoken YOUR_TOKEN`

### Check 3: URL Expired
ngrok URLs expire when you close ngrok.

**Solution**:
- Get the NEW URL from ngrok terminal
- Share the new URL
- URL changes every time you restart ngrok

## Problem: "Tunnel not found"

### Cause: Not authenticated or wrong region

**Solution**:
```powershell
# Authenticate
.\ngrok config add-authtoken YOUR_TOKEN_HERE

# Then start
.\ngrok http 5000
```

## Problem: Connection works but game doesn't load

### Check 1: Build the client
```powershell
# Make sure client is built
npm run build
```

### Check 2: Check server logs
Look in the terminal running `npm run dev`:
- Should see WebSocket connections
- Should see player join messages

### Check 3: Clear browser cache
On the other device:
1. Press Ctrl+Shift+Delete
2. Clear cache
3. Reload the page

## Problem: "Too many connections"

### Cause: Free tier limit (40 connections/minute)

**Solution**:
- Wait 1 minute
- Try again
- Or upgrade to paid plan

## Problem: Game loads but can't join room

### Check 1: WebSocket connection
Open browser console (F12) and check:
```
[Game] Attempting WebSocket connection to: wss://abc123.ngrok.io/ws
```

Should be `wss://` (not `ws://`)

### Check 2: Server logs
In server terminal, you should see:
```
New client connected
Player [name] joined room [code]
```

**If not**: WebSocket isn't connecting

## Quick Diagnostic

Run this checklist:

```
✓ Game server running? (npm run dev)
✓ Shows "serving on port 5000"?
✓ ngrok running? (.\ngrok http 5000)
✓ Shows "Forwarding https://..."?
✓ Using HTTPS URL? (not HTTP)
✓ ngrok authenticated? (authtoken added)
✓ Firewall allows ngrok?
✓ URL is current? (not from previous session)
```

## Still Not Working?

### Test Locally First
1. Stop ngrok
2. Open `http://localhost:5000`
3. Does game work?

**If NO**: Fix local setup first
**If YES**: Problem is with ngrok

### Check ngrok Status
1. Open: http://localhost:4040
2. See all requests
3. Check for errors

### Try Different Port
```powershell
# Stop everything
# Start server on different port
set PORT=3000&& npm run dev

# In new terminal
.\ngrok http 3000
```

### Restart Everything
1. Close ngrok (Ctrl+C)
2. Stop server (Ctrl+C)
3. Start server: `npm run dev`
4. Wait for "serving on port 5000"
5. Start ngrok: `.\ngrok http 5000`
6. Use NEW https URL

## Alternative Solutions

### Option 1: Use Render.com
Deploy to cloud (permanent URL):
- See RENDER-DEPLOY.md
- No need to keep computer on
- Free tier available

### Option 2: Use Railway.app
Auto-deploy from GitHub:
- Push to GitHub
- Connect to Railway
- Get permanent URL

### Option 3: Use Local Network
If on same WiFi:
- Find your IP: `ipconfig`
- Share: `http://YOUR_IP:5000`
- Only works on same network

## Get Help

1. **Check ngrok logs**: Look in ngrok terminal
2. **Check server logs**: Look in npm run dev terminal
3. **Check browser console**: Press F12
4. **ngrok Status**: https://status.ngrok.com
5. **Community**: https://github.com/inconshreveable/ngrok/issues

## Success Indicators

When everything works:
- ✅ ngrok shows "Forwarding https://..."
- ✅ Server shows "serving on port 5000"
- ✅ Browser loads game lobby
- ✅ Can enter name and join
- ✅ WebSocket connects (check console)
- ✅ Can play with others!

Good luck! 🎮
