# ERP-CRM Deployment Guide

## Prerequisites
- GitHub account with your repo: https://github.com/nakulraskar17547/ERP-CRM.git
- Vercel account (for frontend)
- Render account (for backend)
- Supabase project (database)

---

## 1. Deploy Backend to Render

### Step 1: Create New Web Service
1. Go to https://render.com/
2. Click **New** → **Web Service**
3. Connect your GitHub repository: `nakulraskar17547/ERP-CRM`
4. Configure the service:

### Step 2: Basic Settings
```
Name: erp-crm-backend
Region: Singapore (or closest to you)
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install && npm run build
Start Command: npm start
```

### Step 3: Environment Variables
Add these in Render dashboard:

```
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://postgres.yvmfxhbhkzczijmnrumw:MummyPapa123@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.yvmfxhbhkzczijmnrumw:MummyPapa123@aws-0-ap-south-1.pooler.supabase.com:5432/postgres
JWT_SECRET=e9fdf6d0a9c63c1b0dab04c9de4dece74e922141e84b49d2a52156420b1b4a2448fe1eef1f4e1a040a173fec0161cfc2ab4359ec7426db582933695d6d2c393
JWT_EXPIRES_IN=1d
```

### Step 4: Deploy
1. Click **Create Web Service**
2. Wait for deployment (takes 3-5 minutes)
3. Copy your backend URL (e.g., `https://erp-crm-backend.onrender.com`)

### Step 5: Initialize Database
After first deployment, run this command in Render Shell:
```bash
npx prisma db push
```

---

## 2. Deploy Frontend to Vercel

### Step 1: Import Project
1. Go to https://vercel.com/
2. Click **Add New** → **Project**
3. Import your GitHub repo: `nakulraskar17547/ERP-CRM`

### Step 2: Configure Project
```
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### Step 3: Environment Variables
Add in Vercel dashboard → Settings → Environment Variables:

```
VITE_API_URL=https://erp-crm-backend.onrender.com/api
```

**Important:** Replace `https://erp-crm-backend.onrender.com` with your actual Render backend URL from Step 1.

### Step 4: Deploy
1. Click **Deploy**
2. Wait for deployment (takes 2-3 minutes)
3. Your frontend URL: `https://erp-crm-xyz.vercel.app`

---

## 3. Update CORS Settings

After deployment, update backend CORS to allow your Vercel domain:

**File:** `backend/src/app.ts`

Update the CORS configuration:
```typescript
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://your-frontend.vercel.app' // Add your Vercel URL here
    ],
    credentials: true,
  })
);
```

Commit and push changes:
```bash
git add .
git commit -m "Update CORS for production"
git push origin main
```

Render will auto-deploy the changes.

---

## 4. Test Your Deployment

### Test Backend
Visit: `https://your-backend.onrender.com/api/auth/login`

You should see a 404 or method not allowed (POST expected).

### Test Frontend
1. Visit your Vercel URL
2. Register a new user
3. Login and test all features

---

## 5. Quick Deployment Checklist

**Backend (Render):**
- ✓ Repository connected
- ✓ Build command configured
- ✓ Environment variables added
- ✓ Database pushed (`npx prisma db push`)
- ✓ Service is live

**Frontend (Vercel):**
- ✓ Repository connected
- ✓ Root directory set to `frontend`
- ✓ `VITE_API_URL` environment variable added
- ✓ CORS updated in backend
- ✓ Site is live

---

## 6. Common Issues

### Issue: Backend returns 500 errors
**Solution:** Run `npx prisma db push` in Render Shell to create database tables.

### Issue: Frontend can't connect to backend
**Solution:** 
1. Check `VITE_API_URL` is correct in Vercel
2. Check CORS settings in backend include your Vercel domain
3. Redeploy both services

### Issue: Database connection fails
**Solution:** Verify DATABASE_URL and DIRECT_URL are correct in Render environment variables.

### Issue: JWT authentication fails
**Solution:** Make sure JWT_SECRET is set in Render environment variables.

---

## 7. Free Tier Limitations

**Render Free Tier:**
- Backend spins down after 15 minutes of inactivity
- First request after idle takes 30-60 seconds to wake up
- 750 hours/month free

**Vercel Free Tier:**
- Unlimited deployments
- 100GB bandwidth/month
- Fast CDN delivery

**Supabase Free Tier:**
- 500MB database
- Pauses after 7 days inactivity
- 2 free projects

---

## 8. Update for Future Deployments

To deploy updates:

```bash
git add .
git commit -m "Your update message"
git push origin main
```

Both Vercel and Render will auto-deploy from your GitHub repo!

---

## Production URLs (After Deployment)

**Frontend:** https://[your-project].vercel.app
**Backend:** https://[your-service].onrender.com
**Database:** Supabase (already configured)

---

## Support

If you encounter issues:
1. Check Render logs for backend errors
2. Check Vercel logs for frontend errors
3. Check browser console for API connection issues
4. Verify all environment variables are set correctly
