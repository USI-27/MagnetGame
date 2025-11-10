# 📤 Push to GitHub - Quick Guide

## Method 1: Using the Script (Easiest)

1. **Create GitHub Repository**:
   - Go to https://github.com
   - Click "+" → "New repository"
   - Name: `magnet-force-game`
   - Don't initialize with README
   - Click "Create repository"
   - **Copy the repository URL** (looks like: `https://github.com/yourusername/magnet-force-game.git`)

2. **Run the Script**:
   - Double-click `push-to-github.bat`
   - Paste your repository URL when asked
   - Done! ✅

## Method 2: Manual Commands

Open terminal in this folder and run:

```bash
# Initialize Git
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Magnet Force multiplayer game"

# Add your GitHub repository (replace with your URL)
git remote add origin https://github.com/YOUR_USERNAME/magnet-force-game.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Method 3: Using GitHub Desktop

1. Download GitHub Desktop: https://desktop.github.com
2. Open GitHub Desktop
3. File → Add Local Repository → Choose this folder
4. Click "Publish repository"
5. Done! ✅

## After Pushing

Your repository will be at:
```
https://github.com/YOUR_USERNAME/magnet-force-game
```

## Next Steps

### Deploy to Render.com:
1. Go to https://render.com
2. New → Web Service
3. Connect your GitHub repo
4. Build: `npm install && npm run build`
5. Start: `npm start`
6. Deploy!

### Deploy to Railway:
1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select your repo
4. Auto-deploys!

### Deploy to Vercel:
1. Go to https://vercel.com
2. Import Project
3. Select your GitHub repo
4. Deploy!

## Troubleshooting

**"Permission denied"**:
- Make sure you're logged into GitHub
- Use HTTPS URL, not SSH (unless you have SSH keys set up)

**"Repository not found"**:
- Check the URL is correct
- Make sure the repository exists on GitHub
- Check you have access to the repository

**"Failed to push"**:
- Make sure you created the repository on GitHub first
- Try: `git remote -v` to check the URL is correct
- Try: `git pull origin main --allow-unrelated-histories` then push again

## Git Commands Reference

```bash
# Check status
git status

# See commit history
git log --oneline

# Update from GitHub
git pull

# Push changes
git add .
git commit -m "Your message"
git push

# Create new branch
git checkout -b feature-name

# Switch branches
git checkout main
```

## Need Help?

- GitHub Docs: https://docs.github.com
- Git Tutorial: https://git-scm.com/docs/gittutorial
- GitHub Desktop: https://desktop.github.com
