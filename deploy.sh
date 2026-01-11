#!/bin/bash

# Simplified build script for Render deployment
set -e

echo "🏗️ Starting deployment build..."

# Check Node version
echo "📋 Node version: $(node -v)"
echo "📋 Yarn version: $(yarn -v)"

# Install dependencies with verbose logging
echo "📦 Installing dependencies..."
yarn install --frozen-lockfile --verbose

# Build shared packages first
echo "🔨 Building shared packages..."
cd packages/shared && yarn build && cd ../..

# Build web app
echo "🌐 Building web application..."
cd apps/web
yarn build

echo "✅ Build completed successfully!"