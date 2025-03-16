#!/bin/bash

# Install system dependencies required for native modules
echo "Installing system dependencies for native modules..."
apt-get update && apt-get install -y \
    libudev-dev \
    python3 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

echo "System dependencies installed successfully." 