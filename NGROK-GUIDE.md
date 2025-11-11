# 🌐 ngrok Setup Guide - Play from Anywhere

## What is ngrok?
ngrok creates a secure tunnel from the internet to your local server. Perfect for testing your game with friends!

## Step-by-Step Setup

### 1. Download ngrok
1. Go to: https://ngrok.com/download
2. Download for Windows
3. Extract `ngrok.exe` to your project folder

### 2. Sign Up (Free)
1. Go to: https://dashboard.ngrok.com/signup
2. Sign up (free account)
3. Copy your authtoken from: https://dashboard.ngrok.com/get-started/your-authtoken

### 3. Authenticate ngrok
Open PowerShell in your project folder and run:
```powershell
.\ngrok config add-authtoken YOUR_TOKEN_HERE
```

### 4. Start Your Game Server
In one terminal:
```powershell
npm run dev
```

Wait until you see: "serving on port 5000"

### 5. Start ngrok
In a NEW terminal (keep the first one running):
```powershell
.\ngrok http 5000
```

### 6. Get Your Public URL
You'll see something like:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:5000
```

**IMPORTANT**: Use the HTTPS URL (not HTTP)!

### 7. Share the URL
Send this to anyone: `https://abc123.ngrok.io`

They can open it on ANY device, ANY internet connection!

## ✅ Checklist

Before sharing the URL, verify:
- [ ] Game server is running (`npm run dev`)
- [ ] ngrok is running (`.\ngrok http 5000`)
- [ ] You see "Forwarding https://..." in ngrok
- [ ] You're sharing the HTTPS URL (not HTTP)
- [ ] You can open the URL yourself in a browser

## 🔧 Troubleshooting

### "This site can't be reached"

**Problem**: ngrok is not running or URL is wrong

**Solution**:
1. Check ngrok terminal - should show "Forwarding"
2. Copy the HTTPS URL exactly
3. Make sure game server is running

### "WebSocket connection failed"

**Problem**: Using HTTP instead of HTTPS

**Solution**:
- ❌ Don't use: `http://abc123.ngrok.io`
- ✅ Use: `https://abc123.ngrok.io`

### "Connection refused"

**Problem**: Game server not running

**Solution**:
1. Check first terminal shows "serving on port 5000"
2. Restart: `npm run dev`
3. Wait for server to start
4. Then start ngrok

### "Tunnel not found"

**Problem**: Free tier limits or ngrok not authenticated

**Solution**:
1. Sign up at ngrok.com
2. Get your authtoken
3. Run: `.\ngrok config add-authtoken YOUR_TOKEN`
4. Try again

### "Too many connections"

**Problem**: Free tier limit (40 connections/minute)

**Solution**:
- Wait a minute and try again
- Or upgrade to paid plan ($8/month)

## 📱 Testing on Mobile

1. Open the HTTPS URL on your phone
2. Should see the game lobby
3. Enter your name and play!

## 🎮 Playing with Friends

1. **You**: Start game server + ngrok
2. **Share**: Send HTTPS URL to friends
3. **They**: Open URL on any device
4. **Play**: Both join the same room!

## ⚠️ Important Notes

### Free Tier Limits:
- ✅ 1 online ngrok process
- ✅ 40 connections/minute
- ✅ Random URL (changes each time)
- ⚠️ URL expires when you close ngrok

### Paid Tier ($8/month):
- ✅ Custom subdomain (e.g., `mygame.ngrok.io`)
- ✅ Multiple tunnels
- ✅ More connections
- ✅ Reserved domain

## 🔒 Security

ngrok is secure:
- ✅ HTTPS encryption
- ✅ Temporary URLs
- ✅ You control when it's active
- ⚠️ Don't share your authtoken

## 📊 Monitoring

ngrok provides a web interface:
1. While ngrok is running, open: http://localhost:4040
2. See all requests in real-time
3. Inspect WebSocket connections
4. Debug issues

## 🚀 Quick Start Script

Create `start-ngrok.bat`:
```batch
@echo off
echo Starting ngrok tunnel...
echo.
echo Make sure your game server is running first!
echo (Run 'npm run dev' in another terminal)
echo.
pause
ngrok http 5000
```

Double-click to start!

## 🌍 Alternative: Deploy to Cloud

For permanent hosting (no need to keep computer on):
- **Render.com** - Free, permanent URL
- **Railway.app** - Free, auto-deploy
- **Fly.io** - Free tier available

See RENDER-DEPLOY.md for cloud deployment.

## 💡 Tips

1. **Keep both terminals open**:
   - Terminal 1: Game server (`npm run dev`)
   - Terminal 2: ngrok (`.\ngrok http 5000`)

2. **URL changes each time**:
   - Free tier gives random URL
   - Need to share new URL each session
   - Or upgrade for custom domain

3. **Test locally first**:
   - Open `http://localhost:5000` first
   - Make sure game works
   - Then start ngrok

4. **Share HTTPS only**:
   - Modern browsers require HTTPS
   - WebSockets need secure connection
   - Always use the https:// URL

## 📞 Need Help?

- ngrok Docs: https://ngrok.com/docs
- ngrok Status: https://status.ngrok.com
- Community: https://github.com/inconshreveable/ngrok/issues

## ✨ Success!

When working, you'll see:
- ✅ Game server: "serving on port 5000"
- ✅ ngrok: "Forwarding https://..."
- ✅ Friends can access from anywhere!
- ✅ Play together in real-time!

Enjoy your game! 🎮
