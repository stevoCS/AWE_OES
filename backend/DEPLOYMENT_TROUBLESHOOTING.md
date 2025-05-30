# 🔧 Backend Deployment Troubleshooting

## Railway Deployment Issues

### Issue: "No start command could be found"

#### Solutions Tried:
1. ✅ Added `Procfile` with start command
2. ✅ Created `nixpacks.toml` with explicit configuration  
3. ✅ Updated `railway.toml` with proper settings
4. ✅ Added `start.sh` script with error checking

#### Alternative Solutions:

**Option 1: Use Procfile only (simplest)**
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

**Option 2: Deploy manually via Railway CLI**
```bash
npm install -g @railway/cli
railway login
railway link
railway up
```

**Option 3: Use different deployment service**
- Render.com (similar to Railway)
- Heroku (requires credit card)
- DigitalOcean App Platform

### Required Environment Variables on Railway:
```
MONGODB_URL=mongodb+srv://AWE:awe123456@awe.ti9olqk.mongodb.net/?retryWrites=true&w=majority&appName=AWE
DATABASE_NAME=awe_electronics_store
SECRET_KEY=xlsyzrsm_503d8712a477431cbd4bb75f857b670a_awe_electronics_secret_key_2025
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DEBUG=False
HOST=0.0.0.0
```

### Deployment Steps:

1. **Push updated code to GitHub**
2. **On Railway Dashboard:**
   - Go to your project
   - Click "Settings" 
   - Go to "Environment" tab
   - Add all environment variables
   - Go to "Deploy" tab
   - Click "Deploy"

3. **If still failing, try:**
   - Delete the service and recreate
   - Use Railway CLI instead
   - Try deploying only the backend folder

### Test Commands:
```bash
# Test locally first
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000

# Check health endpoint
curl http://localhost:8000/health
```

### Common Errors:

**Error**: Module not found
**Solution**: Make sure all dependencies are in requirements.txt

**Error**: Database connection failed  
**Solution**: Check MONGODB_URL environment variable

**Error**: Port already in use
**Solution**: Railway will handle port assignment automatically 