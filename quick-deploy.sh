#!/bin/bash

echo "🚀 AWE Electronics Quick Deploy Script"
echo "================================="
echo ""

# Check Git status
echo "📋 Checking Git status..."
if [ -d ".git" ]; then
    echo "✅ Git repository exists"
else
    echo "❌ No Git repository detected, initializing..."
    git init
    git add .
    git commit -m "Initial commit"
fi

echo ""
echo "📦 Preparing deployment files..."

# Check frontend dependencies
echo "🔍 Checking frontend dependencies..."
cd frontend
if [ -f "package-lock.json" ]; then
    echo "✅ package-lock.json exists"
else
    echo "⚠️  Installing frontend dependencies..."
    npm install
fi

# Test frontend build
echo "🔨 Testing frontend build..."
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful"
else
    echo "❌ Frontend build failed, please check errors"
    exit 1
fi

cd ..

# Check backend dependencies
echo "🔍 Checking backend dependencies..."
cd backend
if [ -f "requirements.txt" ]; then
    echo "✅ requirements.txt exists"
else
    echo "❌ requirements.txt not found"
    exit 1
fi

cd ..

echo ""
echo "🎯 Deployment Options:"
echo "1. Full Automatic Deployment (Recommended)"
echo "2. View Manual Deployment Guide"
echo "3. Show Deployment Links Only"

read -p "Please choose (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Starting full automatic deployment process..."
        echo ""
        echo "📋 Next steps:"
        echo "1. Ensure code is pushed to GitHub"
        echo "2. Visit https://railway.app to deploy backend"
        echo "3. Visit https://vercel.com to deploy frontend"
        echo ""
        echo "🔗 Quick Links:"
        echo "• Railway: https://railway.app/new"
        echo "• Vercel: https://vercel.com/new"
        echo "• Deployment Guide: See deploy.md file"
        ;;
    2)
        echo ""
        echo "📖 Please check deploy.md file for detailed deployment guide"
        echo "or run: cat deploy.md"
        ;;
    3)
        echo ""
        echo "🔗 Deployment Platform Links:"
        echo "• Railway (Backend): https://railway.app/new"
        echo "• Vercel (Frontend): https://vercel.com/new"
        echo "• MongoDB Atlas: https://cloud.mongodb.com"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "✨ Deployment preparation complete!"
echo "📚 For detailed instructions, please check deploy.md file"