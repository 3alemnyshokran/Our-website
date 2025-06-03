#!/bin/bash

# Deployment script for the tutoring website

echo "Preparing for Vercel deployment..."

# Install dependencies if any
if [ -f "package.json" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Check for Vercel CLI
if ! command -v vercel &> /dev/null; then
  echo "Vercel CLI not found. Installing..."
  npm install -g vercel
fi

# Deploy to Vercel
echo "Deploying to Vercel..."
vercel --prod

echo "Deployment complete!"
echo "Your site with the new authentication system should now be live."
echo "Remember to test the authentication flow on all pages."
