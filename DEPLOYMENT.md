# Deployment Guide - Bannockburn RFC Next.js App

## Option 1: Vercel (Recommended - Easiest & Fastest)

### Prerequisites
- GitHub account
- Vercel account (free - sign up at https://vercel.com)

### Steps:

1. **Push to GitHub**
   ```bash
   cd /Users/jimmy/Workspace/rugby-app-nextjs
   git init
   git add .
   git commit -m "Initial commit - Next.js rugby app"
   # Create a new repo on GitHub, then:
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to https://vercel.com
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings
   - Add environment variables:
     - `NEXT_PUBLIC_API_URL` = `https://rugby-app-qpoi.onrender.com/api`
     - `NEXT_PUBLIC_SOCKET_URL` = `https://rugby-app-qpoi.onrender.com`
   - Click "Deploy"
   - Done! You'll get a URL like: `https://your-app.vercel.app`

3. **Update Backend CORS**
   Add your Vercel URL to the backend's allowed origins in:
   `/Users/jimmy/Workspace/rugby-app/backend/src/server.ts`

### Time: ~5 minutes

---

## Option 2: Render (If you prefer to keep everything on Render)

### Steps:

1. **Push to GitHub** (same as above)

2. **Deploy on Render**
   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Configure:
     - **Name**: `bannockburn-rfc-nextjs`
     - **Environment**: `Node`
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
     - **Environment Variables**:
       - `NEXT_PUBLIC_API_URL` = `https://rugby-app-qpoi.onrender.com/api`
       - `NEXT_PUBLIC_SOCKET_URL` = `https://rugby-app-qpoi.onrender.com`
   - Click "Create Web Service"

3. **Update Backend CORS** (same as Vercel)

### Time: ~10 minutes

---

## Option 3: Quick Test on Local Network (Your Phone, Same WiFi)

For testing on your phone RIGHT NOW without deployment:

1. **Find your local IP**:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```
   Look for something like `192.168.x.x`

2. **Update environment variables**:
   In `.env.local`, temporarily change:
   ```
   NEXT_PUBLIC_API_URL=http://192.168.0.40:3001/api
   NEXT_PUBLIC_SOCKET_URL=http://192.168.0.40:3001
   ```

3. **Start the dev server**:
   ```bash
   npm run dev
   ```

4. **On your phone** (connected to same WiFi):
   Open browser and go to: `http://YOUR_IP:3002`
   Example: `http://192.168.0.40:3002`

### Time: ~2 minutes

---

## Update Backend CORS (For All Options)

Add your deployed frontend URL to the backend's CORS configuration:

**File**: `/Users/jimmy/Workspace/rugby-app/backend/src/server.ts`

Add to the `allowedOrigins` array:
```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3002',
  // Add your deployed URL:
  'https://your-app.vercel.app',  // or your Render URL
  // ... existing origins
];
```

Redeploy backend after updating CORS.

---

## Testing on Mobile

Once deployed:
1. Open the deployed URL on your phone's browser
2. Add to home screen for app-like experience:
   - **iOS**: Safari → Share → Add to Home Screen
   - **Android**: Chrome → Menu → Add to Home Screen

---

## Troubleshooting

**Issue**: API calls failing
- **Fix**: Check environment variables are set correctly
- **Fix**: Verify backend CORS includes your frontend URL

**Issue**: Socket.IO not connecting
- **Fix**: Ensure `NEXT_PUBLIC_SOCKET_URL` doesn't have `/api` at the end

**Issue**: Slow performance
- **Fix**: Use Vercel (it has global CDN)
- **Fix**: Check backend is responding quickly
