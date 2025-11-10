# Deployment Instructions

## Quick Test with ngrok (5 minutes)

1. Download ngrok: https://ngrok.com/download
2. Extract ngrok.exe to this folder
3. Run: `ngrok http 5000`
4. Share the https URL with anyone!

## Deploy to Render.com (Free Forever)

1. Create account: https://render.com
2. Click "New +" → "Web Service"
3. Connect GitHub repo
4. Settings:
   - Build: `npm install && npm run build`
   - Start: `npm start`
5. Deploy! Get URL like: `https://magnet-game.onrender.com`

## Deploy to Railway.app (Free Tier)

1. Go to: https://railway.app
2. Sign up with GitHub
3. "New Project" → "Deploy from GitHub"
4. Select this repo
5. Auto-deploys! Get URL like: `https://magnet-game.up.railway.app`

## Deploy to Fly.io (Free Tier)

1. Install Fly CLI: https://fly.io/docs/hands-on/install-flyctl/
2. Run: `fly auth signup`
3. Run: `fly launch` (use existing fly.toml)
4. Run: `fly deploy`
5. Get URL like: `https://magnet-game.fly.dev`

## Environment Variables

For production, set:
- `NODE_ENV=production`
- `PORT=5000` (or whatever the platform provides)

## After Deployment

Your game will be accessible at:
- `https://your-app-name.platform.com`
- Works on any device, any internet connection
- No firewall or network setup needed
- SSL/HTTPS automatically enabled
