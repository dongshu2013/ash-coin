#!/bin/bash

echo "🔍 Verifying Git hooks..."

# Check if .git/hooks/pre-commit exists and is a symlink to .husky/pre-commit
if [ -L ".git/hooks/pre-commit" ] && [ -e ".git/hooks/pre-commit" ]; then
  echo "✅ pre-commit hook is properly installed"
else
  echo "❌ pre-commit hook is not properly installed"
  echo "Running husky install to fix..."
  pnpm husky install
  
  # Check again after installation
  if [ -L ".git/hooks/pre-commit" ] && [ -e ".git/hooks/pre-commit" ]; then
    echo "✅ pre-commit hook is now properly installed"
  else
    echo "❌ Failed to install pre-commit hook. Please run 'pnpm prepare' manually."
  fi
fi

# Verify that the pre-commit hook is executable
if [ -x ".husky/pre-commit" ]; then
  echo "✅ pre-commit hook is executable"
else
  echo "❌ pre-commit hook is not executable"
  echo "Making pre-commit hook executable..."
  chmod +x .husky/pre-commit
  
  # Check again after making executable
  if [ -x ".husky/pre-commit" ]; then
    echo "✅ pre-commit hook is now executable"
  else
    echo "❌ Failed to make pre-commit hook executable. Please run 'chmod +x .husky/pre-commit' manually."
  fi
fi

echo "🧪 Testing lint-staged..."
pnpm pre-commit-test

echo "✅ Git hooks verification completed!" 