#!/bin/bash

echo "🔧 Initializing Husky pre-commit hooks..."

# Install husky
pnpm prepare

# Ensure the pre-commit hook is executable
chmod +x .husky/pre-commit

echo "✅ Husky pre-commit hooks initialized successfully!" 