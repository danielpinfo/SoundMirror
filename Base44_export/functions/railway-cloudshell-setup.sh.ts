#!/bin/bash

# Railway CloudShell Setup Script
# Run this in Google Cloud Shell to deploy your backends

set -e

echo "🚀 Railway Deployment via CloudShell"
echo "===================================="

# Install Railway CLI
echo "📦 Installing Railway CLI..."
bash <(curl -fsSL cli.railway.app/install.sh)

# Add to PATH
export PATH="$HOME/.railway/bin:$PATH"

# Login to Railway
echo ""
echo "🔐 Logging in to Railway..."
echo "This will open a browser - authorize the login"
railway login

# Create API token
echo ""
echo "🎟️  Creating API token..."
railway tokens

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Copy the token that was just created"
echo "2. Update 'Railway_Token' secret in Base44 with this token"
echo "3. Run 'deployAllBackends' function from Base44"