#!/bin/bash

# Exit on any error
set -e

echo "🚀 Starting AWE Electronics Backend API on Render..."

# Check if required environment variables are set
if [ -z "$MONGODB_URL" ]; then
    echo "❌ Error: MONGODB_URL environment variable is not set"
    echo "Please set MONGODB_URL in Render dashboard environment variables"
    exit 1
fi

if [ -z "$SECRET_KEY" ]; then
    echo "❌ Error: SECRET_KEY environment variable is not set"
    echo "Render should auto-generate this, check environment variables"
    exit 1
fi

# Set default port for Render (Render uses PORT environment variable)
PORT=${PORT:-10000}

echo "✅ Environment variables validated"
echo "🌐 Starting server on port $PORT"
echo "📊 Database: $DATABASE_NAME"
echo "🔒 Debug mode: $DEBUG"

# Start the application with uvicorn
# Use single worker for free tier, can increase for paid plans
exec uvicorn main:app --host 0.0.0.0 --port $PORT --workers 1 