#!/bin/bash

echo "🔥 Setting up Ash Coin project..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Installing pnpm..."
    npm install -g pnpm
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install pnpm. Please install it manually: npm install -g pnpm"
        exit 1
    fi
    echo "✅ pnpm installed successfully!"
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Setup husky
echo "🔧 Setting up pre-commit hooks..."
pnpm prepare

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "🔑 Creating .env.local file..."
    echo "NEXT_PUBLIC_SOLANA_NETWORK=devnet" > .env.local
    echo "NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com" >> .env.local
fi

echo "✅ Setup complete! You can now start the development server with:"
echo "pnpm dev"

# Ask if user wants to start the dev server
read -p "Do you want to start the development server now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Starting development server..."
    pnpm dev
fi 