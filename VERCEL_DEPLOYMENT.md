# 🚀 Complete Vercel Deployment Guide

## Prerequisites
- ✅ GitHub account
- ✅ Vercel account (free)
- ✅ MongoDB Atlas account (free)

## 📋 Step-by-Step Deployment

### 1. Prepare Your MongoDB Database
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Create a database user
4. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
5. Whitelist all IPs (0.0.0.0/0) for Vercel

### 2. Push to GitHub
```bash
# Initialize git if not already done
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 3. Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended)
1. Go to [Vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `/` (leave empty)
   - **Build Command**: `cd frontend && npm run build`
   - **Output Directory**: `frontend/build`
   - **Install Command**: `cd frontend && npm install`

#### Option B: Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### 4. Configure Environment Variables
In your Vercel dashboard, go to **Settings** > **Environment Variables** and add:

```
MONGO_URL = mongodb+srv://username:password@cluster.mongodb.net/
DB_NAME = sih25_db
CORS_ORIGINS = https://your-app-name.vercel.app
REACT_APP_API_URL = https://your-app-name.vercel.app/api
```

### 5. Update CORS Origins
After deployment, update the `CORS_ORIGINS` environment variable with your actual Vercel URL.

## 🔧 Project Structure for Vercel
```
/
├── vercel.json          # Vercel configuration
├── frontend/            # React app
│   ├── package.json
│   ├── src/
│   └── build/          # Generated after build
├── backend/             # FastAPI
│   ├── server.py
│   └── requirements.txt
└── .env.example        # Environment template
```

## 🚀 Automatic Deployments
Once connected to GitHub, Vercel will automatically:
- Deploy on every push to main branch
- Create preview deployments for pull requests
- Handle build process automatically

## 🔍 Troubleshooting

### Common Issues:

1. **Build Failed - CRACO Issues**
   ```bash
   npm install @craco/craco --save-dev
   ```

2. **API Routes Not Working**
   - Check `vercel.json` configuration
   - Ensure `/api/*` routes are properly configured

3. **Database Connection Issues**
   - Verify MongoDB Atlas connection string
   - Check if IP whitelist includes 0.0.0.0/0
   - Confirm environment variables are set

4. **CORS Errors**
   - Update `CORS_ORIGINS` with your Vercel domain
   - Redeploy after updating environment variables

### Debugging Commands:
```bash
# Check build locally
cd frontend && npm run build

# Test backend locally
cd backend && uvicorn server:app --reload

# Check Vercel logs
vercel logs
```

## 📊 Vercel Free Tier Limits
- **Bandwidth**: 100GB/month
- **Invocations**: 1000 serverless function invocations/day
- **Execution Time**: 10 seconds max per function
- **Custom Domains**: Unlimited

## 🎯 Next Steps After Deployment
1. Test all functionality on live site
2. Set up custom domain (optional)
3. Configure monitoring and analytics
4. Set up CI/CD with GitHub Actions (optional)

## 🔗 Useful Links
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas](https://www.mongodb.com/atlas)
- [Your Vercel Dashboard](https://vercel.com/dashboard)
