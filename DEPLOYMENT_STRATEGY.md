# 🚀 Updated Deployment Strategy

Due to Vercel's 250MB serverless function limit, we'll deploy frontend and backend separately:

## Frontend: Vercel (Free)
- ✅ Fast global CDN
- ✅ Automatic deployments
- ✅ Custom domains

## Backend: Railway/Render (Free)
- ✅ No size limits
- ✅ Always-on servers
- ✅ Better for FastAPI + MongoDB

---

## 📋 Step-by-Step Deployment

### 1. Deploy Frontend to Vercel

#### Using Vercel Dashboard:
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

#### Using Vercel CLI:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend only
cd frontend
vercel --prod
```

### 2. Deploy Backend to Railway (Recommended)

#### Setup:
1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Create a new service
4. Select your repository
5. Set **Root Directory**: `backend`

#### Environment Variables for Railway:
```
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/
DB_NAME=sih25_db
CORS_ORIGINS=https://your-frontend-vercel-app.vercel.app
PORT=8000
```

#### Railway Configuration:
```json
// railway.json (already created)
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn server:app --host 0.0.0.0 --port $PORT",
    "healthcheckPath": "/api/health"
  }
}
```

### 3. Alternative: Deploy Backend to Render

1. Go to [render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repo
4. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`

### 4. Update Frontend Environment Variables

After backend deployment, update your frontend's environment variables:

#### In Vercel Dashboard:
```
REACT_APP_API_URL=https://your-backend.railway.app/api
```

#### Or create frontend/.env.production:
```
REACT_APP_API_URL=https://your-backend.railway.app/api
```

---

## 🔧 Quick Commands

### Deploy Frontend to Vercel:
```bash
cd frontend
vercel --prod
```

### Test Backend Locally:
```bash
cd backend
source ../.venv/bin/activate
uvicorn server:app --reload
```

### Build Frontend Locally:
```bash
cd frontend
npm run build
```

---

## 💰 Cost Breakdown (Free Tiers)

| Service | Frontend | Backend | Database |
|---------|----------|---------|----------|
| **Vercel** | ✅ Unlimited | ❌ Too large | ❌ N/A |
| **Railway** | ❌ Overkill | ✅ $5 credit/month | ❌ N/A |
| **MongoDB Atlas** | ❌ N/A | ❌ N/A | ✅ 512MB free |

**Total Monthly Cost: $0** (Railway's $5 credit covers small apps)

---

## 🎯 Final URLs Structure

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.railway.app`
- **API Endpoints**: `https://your-backend.railway.app/api/*`

This separation provides better performance, no size limits, and easier scaling!
