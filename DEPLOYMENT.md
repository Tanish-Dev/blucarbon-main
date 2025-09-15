# 🚀 Free Deployment Guide

This guide will help you deploy your full-stack application for free using modern deployment platforms.

## Architecture Overview
- **Frontend**: React app with Tailwind CSS and Radix UI
- **Backend**: FastAPI with MongoDB
- **Database**: MongoDB Atlas (free tier)

## 📋 Deployment Steps

### 1. Database Setup (MongoDB Atlas)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account and cluster
3. Get your connection string
4. Update your environment variables

### 2. Backend Deployment Options

#### Option A: Railway (Recommended)
1. Go to [Railway](https://railway.app)
2. Connect your GitHub repository
3. Select the backend folder
4. Add environment variables:
   - `MONGO_URL`: Your MongoDB Atlas connection string
   - `DB_NAME`: Your database name
   - `CORS_ORIGINS`: Your frontend URL
5. Deploy automatically

#### Option B: Render
1. Go to [Render](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repo
4. Use these settings:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`
   - **Environment**: Python
5. Add environment variables

#### Option C: Fly.io
1. Install Fly CLI: `brew install flyctl`
2. Login: `fly auth login`
3. Navigate to backend folder: `cd backend`
4. Deploy: `fly launch`

### 3. Frontend Deployment Options

#### Option A: Vercel (Recommended)
1. Go to [Vercel](https://vercel.com)
2. Connect your GitHub repository
3. Select the frontend folder
4. Add environment variable:
   - `REACT_APP_API_URL`: Your backend URL
5. Deploy automatically

#### Option B: Netlify
1. Go to [Netlify](https://netlify.com)
2. Drag and drop your built frontend, or connect GitHub
3. Use these build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `build`
4. Add environment variables

#### Option C: GitHub Pages
1. Build your app: `npm run build`
2. Install gh-pages: `npm install --save-dev gh-pages`
3. Add to package.json scripts: `"deploy": "gh-pages -d build"`
4. Run: `npm run deploy`

## 🔧 Environment Variables

### Backend (.env)
```
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/
DB_NAME=your_database_name
CORS_ORIGINS=https://your-frontend-url.vercel.app
```

### Frontend (.env)
```
REACT_APP_API_URL=https://your-backend-url.railway.app/api
```

## 📝 Quick Deploy Commands

### Build and test locally first:
```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn server:app --reload

# Frontend
cd frontend
npm install
npm run build
npm start
```

## 💡 Cost Breakdown (Free Tiers)
- **MongoDB Atlas**: 512MB free
- **Railway**: $5 credit monthly
- **Vercel**: Unlimited personal projects
- **Netlify**: 100GB bandwidth
- **Render**: 750 hours/month

## 🔍 Troubleshooting
- Ensure CORS is properly configured
- Check environment variables are set
- Verify MongoDB connection string
- Test API endpoints manually

## 📈 Scaling Up
When you outgrow free tiers:
- **Database**: MongoDB Atlas paid plans ($9/month)
- **Backend**: Railway Pro ($5/month), Render ($7/month)
- **Frontend**: Vercel Pro ($20/month), Netlify Pro ($19/month)
