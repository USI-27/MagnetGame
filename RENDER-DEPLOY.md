# 🚀 Deploy to Render.com - Step by Step

## Quick Deploy (Recommended)

### Step 1: Push to GitHub
Make sure your code is on GitHub first (use `push-to-github.bat`)

### Step 2: Deploy on Render

1. Go to https://render.com and sign up (free)
2. Click **"New +"** → **"Web Service"**
3. Click **"Connect GitHub"** and authorize Render
4. Select your repository: `magnet-force-game`
5. Configure:
   - **Name**: `magnet-force-game` (or any name)
   - **Region**: Oregon (US West) - closest to you
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Environment**: `Node`
   - **Build Command**: 
     ```
     npm install && npm run build
     ```
   - **Start Command**: 
     ```
     npm start
     ```
   - **Plan**: Free

6. **IMPORTANT**: Click "Advanced" and add environment variable:
   - **Key**: `NPM_CONFIG_PRODUCTION`
   - **Value**: `false`
   - This keeps devDependencies which are needed for the bundled server

7. Click **"Create Web Service"**

### Step 3: Wait for Deployment
- First deploy takes 5-10 minutes
- Watch the logs for any errors
- When done, you'll see: "Your service is live 🎉"

### Step 4: Get Your URL
Your game will be at: `https://magnet-force-game.onrender.com`

## Using render.yaml (Alternative)

If you have `render.yaml` in your repo, Render will auto-detect it:

1. Push `render.yaml` to GitHub
2. On Render, click "New +" → "Blueprint"
3. Connect your repo
4. Render reads the config and deploys automatically!

## Environment Variables (Optional)

If you need to set environment variables:
1. Go to your service dashboard
2. Click "Environment" tab
3. Add variables:
   - `NODE_ENV` = `production` (auto-set)
   - `PORT` = auto-assigned by Render

## Troubleshooting

### Build Fails with "exit code 127"
✅ **Fixed!** The package.json now uses Linux-compatible commands.

### "Cannot find module"
- Make sure all dependencies are in `package.json`
- Check `dependencies` vs `devDependencies`
- Build tools should be in `devDependencies`

### "Port already in use"
- Don't set PORT in environment variables
- Render automatically assigns a port
- Your code should use: `process.env.PORT || 5000`

### WebSocket Connection Fails
- Make sure your WebSocket code uses the same port as HTTP
- Render supports WebSockets on the same port
- No special configuration needed!

### Build Takes Too Long
- Free tier has limited resources
- First build is slower (caching dependencies)
- Subsequent builds are faster

## Free Tier Limits

- ✅ 750 hours/month (enough for 24/7)
- ✅ Automatic HTTPS
- ✅ Custom domains
- ⚠️ Spins down after 15 min of inactivity
- ⚠️ Cold start takes ~30 seconds

## Keeping Service Awake

To prevent cold starts, use a service like:
- **UptimeRobot** (free): https://uptimerobot.com
- Ping your URL every 10 minutes

## Custom Domain (Optional)

1. Buy a domain (Namecheap, GoDaddy, etc.)
2. In Render dashboard → "Settings" → "Custom Domain"
3. Add your domain
4. Update DNS records as shown
5. Wait for SSL certificate (automatic)

## Updating Your Game

After making changes:
```bash
git add .
git commit -m "Update game"
git push
```

Render automatically redeploys! 🎉

## Monitoring

- **Logs**: Click "Logs" tab to see real-time logs
- **Metrics**: Click "Metrics" to see CPU/Memory usage
- **Events**: See deployment history

## Cost

- **Free tier**: Perfect for this game
- **Paid tier** ($7/month): 
  - No spin down
  - More resources
  - Better performance

## Alternative: Railway.app

If Render doesn't work, try Railway:
1. https://railway.app
2. "New Project" → "Deploy from GitHub"
3. Select repo
4. Auto-deploys!
5. Get URL like: `https://magnet-force-game.up.railway.app`

## Support

- Render Docs: https://render.com/docs
- Community: https://community.render.com
- Status: https://status.render.com
