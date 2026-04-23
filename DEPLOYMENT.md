# Deploying to Vercel (Free)

Follow these steps to deploy your backend to Vercel:

## Step 1: Initialize Git Repository

```bash
cd /Users/saroshmadara/Applications/New-Claude-Projects/shouldyoutravel
git init
git add .
git commit -m "Initial commit"
```

## Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository (any name, e.g., "should-you-travel")
3. Don't initialize with README
4. Copy the commands shown and run them:

```bash
git remote add origin https://github.com/YOUR_USERNAME/should-you-travel.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel

1. Go to https://vercel.com/
2. Click **"New Project"**
3. Click **"Import Git Repository"**
4. Select your GitHub repository
5. Click **"Import"**
6. Configure project:
   - **Framework**: Node.js
   - **Root Directory**: `.` (current)
7. Click **"Deploy"**

**Vercel will generate a URL** like: `https://should-you-travel-xyz.vercel.app`

## Step 4: Update Frontend

After deployment, the frontend will automatically use your backend!

The frontend (`index.html`) will:
- Auto-detect localhost during development
- Auto-detect production URL after deployment
- Fall back to local data if backend unavailable

## Step 5: Test It

1. Open your Vercel URL
2. Select country and city
3. Should show real airport & airline data!

---

## Running Locally (Optional)

If you want to test locally before deploying:

```bash
# Install dependencies
npm install

# Run backend (Node.js must be installed)
npm run dev
```

Backend runs on `http://localhost:3001`
Frontend opens at `http://localhost:8000` (from earlier)

---

## Troubleshooting

**Backend not responding?**
- Check Vercel deployment logs
- Ensure API key is correct in `api/index.js`
- AviationStack API might have rate limits

**Frontend not calling backend?**
- Open browser DevTools (F12)
- Check Network tab for API calls
- Check Console for errors

**Need help?**
- Vercel docs: https://vercel.com/docs
- AviationStack docs: https://aviationstack.com/documentation
