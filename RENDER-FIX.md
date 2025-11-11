# 🔧 Fix Render "Cannot find package 'vite'" Error

## The Problem
Render is removing devDependencies after build, but the bundled server code still needs them at runtime.

## Quick Fix (2 minutes)

### Option 1: Add Environment Variable (Recommended)

1. Go to your Render dashboard
2. Click on your service
3. Go to **"Environment"** tab
4. Click **"Add Environment Variable"**
5. Add:
   - **Key**: `NPM_CONFIG_PRODUCTION`
   - **Value**: `false`
6. Click **"Save Changes"**
7. Render will automatically redeploy

### Option 2: Update render.yaml

If you have `render.yaml` in your repo:

1. Make sure it has this environment variable:
```yaml
envVars:
  - key: NPM_CONFIG_PRODUCTION
    value: false
```

2. Push to GitHub:
```bash
git add render.yaml
git commit -m "Fix: Keep devDependencies for runtime"
git push
```

3. Render will auto-redeploy

## Why This Works

- `NPM_CONFIG_PRODUCTION=false` tells npm to keep devDependencies
- The bundled server (dist/index.js) imports packages marked as external
- These packages need to be available at runtime
- Vite, esbuild, and other build tools are needed because of `--packages=external`

## Alternative: Move to Dependencies

If you don't want to keep all devDependencies, move only the needed ones:

Edit `package.json` and move these from `devDependencies` to `dependencies`:
- `vite`
- `esbuild`
- `@vitejs/plugin-react`

Then push to GitHub.

## Verify It Works

After redeployment, check the logs. You should see:
```
Your service is live 🎉
```

Visit your URL: `https://your-app.onrender.com`

## Still Having Issues?

### Check Build Logs
- Make sure build completes successfully
- Look for "Build succeeded" message

### Check Runtime Logs
- Should see: "serving on port XXXX"
- Should NOT see: "Cannot find package"

### Try Manual Redeploy
1. Go to Render dashboard
2. Click "Manual Deploy" → "Deploy latest commit"
3. Watch the logs

## Need More Help?

- Check RENDER-DEPLOY.md for full guide
- Render Docs: https://render.com/docs
- Community: https://community.render.com
