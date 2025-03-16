#!/bin/bash

echo "🔍 Running ESLint on all files..."
# Run ESLint on all TypeScript and JavaScript files
pnpm eslint --ext .js,.jsx,.ts,.tsx . --fix

echo "💅 Running Prettier on all files..."
# Run Prettier on all files
pnpm prettier --write .

echo "✅ Linting and formatting completed!"