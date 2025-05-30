#!/bin/bash

# Exit on any error
set -e

echo "🚀 Starting AWE Electronics Backend API..."

# Check if required environment variables are set
if [ -z "$MONGODB_URL" ]; then
    echo "❌ Error: MONGODB_URL environment variable is not set"
    exit 1
fi

if [ -z "$SECRET_KEY" ]; then
    echo "❌ Error: SECRET_KEY environment variable is not set"
    exit 1
fi

# Set default port if not provided
PORT=${PORT:-8000}

echo "✅ Environment variables validated"
echo "🌐 Starting server on port $PORT"

# Start the application
exec uvicorn main:app --host 0.0.0.0 --port $PORT --workers 1 