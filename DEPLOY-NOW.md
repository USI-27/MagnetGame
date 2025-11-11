# 🚀 Deploy to Render.com - 5 Minutes

## Quick Deploy (Copy & Paste)

### Step 1: Push Latest Changes to GitHub

Open PowerShell and run:
```powershell
git add .
git commit -m "Ready for deployment"
git push
```

### Step 2: Deploy on Render

1. **Go to**: https://render.com
2. **Sign up** with GitHub (free)
3. **Click**: "New +" → "Web Service"
4. **Select**: Your repository (magnet-force-game)
5. **Configure**:
   ```
   Name: magnet-force-game
   Region: Oregon (or closest to you)
   Branch: main
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

6. **Click "Advanced"** and add environment variable:
   ```
   Key: NPM_CONFIG_PRODUCTION
   Value: false
   ```

7. **Click**: "Create Web Service"

### Step 3: Wait (5-10 minutes)

Watch the deployment logs. When you see:
```
Your service is live 🎉
```

### Step 4: Get Your URL

Your game will be at:
```
https://magnet-force-game.onrender.com
```

Share this link with ANYONE - works worldwide! 🌍

---

## Alternative: Railway.app (Even Easier!)

### Step 1: Push to GitHub (same as above)

### Step 2: Deploy on Railway

1. **Go to**: https://railway.app
2. **Sign up** with GitHub
3. **Click**: "New Project" → "Deploy from GitHub repo"
4. **Select**: Your repository
5. **Done!** Railway auto-detects and deploys

Your URL: `https://magnet-force-game.up.railway.app`

---

## Alternative: Vercel (Fastest!)

### Step 1: Push to GitHub (same as above)

### Step 2: Deploy on Vercel

1. **Go to**: https://vercel.com
2. **Sign up** with GitHub
3. **Click**: "Add New..." → "Project"
4. **Import**: Your repository
5. **Deploy!**

Your URL: `https://magnet-force-game.vercel.app`

---

## Which One to Choose?

| Platform | Speed | Ease | Free Tier |
|----------|-------|------|-----------|
| **Render** | Medium | Easy | ✅ 750 hrs/month |
| **Railway** | Fast | Easiest | ✅ $5 credit/month |
| **Vercel** | Fastest | Easy | ✅ Unlimited |

**Recommendation**: Try Railway first (easiest!)

---

## After Deployment

### Your Game URL:
```
https://your-app-name.platform.com
```

### Share with Friends:
- Send them the URL
- They open it on ANY device
- No setup needed!
- Play together! 🎮

### Update Your Game:
```powershell
git add .
git commit -m "Update game"
git push
```
Platform auto-redeploys!

---

## Need Help?

1. **Render not working?** See RENDER-FIX.md
2. **GitHub issues?** See GITHUB-SETUP.md
3. **Want local testing?** Use ngrok (see NGROK-GUIDE.md)

---

## Quick Commands

### Push to GitHub:
```powershell
git add .
git commit -m "Deploy to cloud"
git push
```

### Check Status:
```powershell
git status
git log --oneline
```

### Update After Changes:
```powershell
git add .
git commit -m "Update"
git push
```

---

## 🎯 Recommended: Railway.app

**Why?**
- ✅ Easiest setup (3 clicks)
- ✅ Auto-detects everything
- ✅ Free $5 credit/month
- ✅ No configuration needed
- ✅ Auto-deploys on push

**How?**
1. https://railway.app
2. Sign up with GitHub
3. "New Project" → "Deploy from GitHub"
4. Select repo
5. Done!

**Your URL**: `https://magnet-force-game.up.railway.app`

---

## Start Now!

1. **Open PowerShell**
2. **Run**:
   ```powershell
   git add .
   git commit -m "Ready for deployment"
   git push
   ```
3. **Go to**: https://railway.app
4. **Deploy!**

Your game will be live in 5 minutes! 🚀
