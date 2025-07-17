#!/bin/bash

echo "🚀 Railway Deployment Script for CONTRACTEXTRACT AI Agent"
echo "=================================================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Check if user is logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway..."
    railway login
fi

echo "📦 Deploying to Railway..."
railway up

echo "✅ Deployment complete!"
echo "🌐 Your API should be available at the Railway URL shown above"
echo ""
echo "📋 Next steps:"
echo "1. Set environment variables in Railway dashboard"
echo "2. Test your endpoints"
echo "3. Configure custom domain (optional)"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions" 