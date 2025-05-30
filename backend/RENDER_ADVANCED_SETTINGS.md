# Render.com Advanced Settings Configuration Guide

## Health Check Path
- **Recommended Setting**: `/healthz`
- **Description**: Render periodically checks this endpoint to monitor service health
- **Backend Support**: ✅ `/healthz` endpoint already added in `main.py`

## Secret Files
No special secret files are currently needed. All environment variables are set through environment variables.

## Pre-Deploy Command
**Recommended Setting**: Leave empty (not needed)
- Our project doesn't require database migrations or other pre-deployment steps

## Auto-Deploy
**Recommended Setting**: `On Commit`
- ✅ Automatically deploys whenever you push code to GitHub
- This ensures immediate deployment after code updates

## Build Filters

### Included Paths
**Recommended Setting**: Add the following paths