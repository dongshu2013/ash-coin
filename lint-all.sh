#!/bin/bash

echo "🔍 Running ESLint on all files..."

# Run ESLint on all TypeScript and JavaScript files
pnpm eslint --ext .js,.jsx,.ts,.tsx .

echo "✅ ESLint check completed!" 