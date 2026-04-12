# Deployment Guide

## Local Development

### Backend
```bash
cd backend
npm install
npm start
```
- Runs on http://localhost:5000
- Uses MongoDB local database

### Frontend
```bash
cd frontend
npm install
npm run dev
```
- Runs on http://localhost:5173
- Frontend automatically connects to http://localhost:5000

---

## Production Deployment

### Step 1: Deploy Backend (Railway or Render)

**Using Railway:**
1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repo
3. Select the `backend` folder as root directory
4. Add environment variables:
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `FRONTEND_URL`: Your Vercel frontend URL (e.g., `https://myapp.vercel.app`)
5. Deploy

**Using Render:**
1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repo
4. Set build command: `npm install`
5. Set start command: `node server.js`
6. Add environment variables (same as above)
7. Deploy

### Step 2: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repo
3. Select `frontend` folder as root directory
4. Add environment variable:
   - `VITE_API_BASE`: Your backend URL (e.g., `https://myapp-backend.railway.app`)
5. Deploy

---

## Environment Variables Checklist

### Backend (.env or Railway/Render dashboard)
- [ ] `MONGO_URI`: MongoDB connection string
- [ ] `FRONTEND_URL`: Your Vercel frontend URL

### Frontend (Vercel dashboard)
- [ ] `VITE_API_BASE`: Your backend URL (from Railway/Render)

---

## Testing Production

After deployment, test:
```bash
# Login/Register
# Upload image
# Check if text is saved
# Refresh page - text should persist
```

---

## Troubleshooting

**"Cannot POST /auth/register"**
- Backend URL is incorrect in `VITE_API_BASE`
- Backend deployment failed

**"CORS error"**
- Add your Vercel URL to backend's `FRONTEND_URL` env variable
- Restart backend

**"Cannot connect to MongoDB"**
- Check `MONGO_URI` is correct
- Ensure IP whitelist allows connections
