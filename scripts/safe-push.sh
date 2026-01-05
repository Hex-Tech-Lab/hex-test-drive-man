#!/bin/bash
# Safe Push Script - Interactive Git push with all safety checks
# Usage: ./scripts/safe-push.sh

set -e

echo "🚀 Safe Push to Main Branch"
echo "=============================="
echo ""

# Check current branch
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "main" ]; then
  echo "⚠️  Current branch: $BRANCH"
  echo "   This script is for main branch only"
  echo "   For feature branches, use: git push origin $BRANCH"
  exit 1
fi

# Check working tree
echo "1. Checking working tree..."
if ! git diff-index --quiet HEAD --; then
  echo "❌ Working tree has uncommitted changes"
  echo ""
  git status --short
  echo ""
  echo "Commit or stash changes first:"
  echo "  git add <files>"
  echo "  git commit -m 'message'"
  exit 1
fi
echo "✅ Working tree clean"
echo ""

# Fetch remote
echo "2. Fetching origin/main..."
git fetch origin main --quiet
echo "✅ Fetch complete"
echo ""

# Check commits ahead
echo "3. Checking commits ahead of origin..."
AHEAD=$(git log --oneline origin/main..HEAD)
if [ -z "$AHEAD" ]; then
  echo "⚠️  No commits to push (local == remote)"
  echo "   Nothing to do"
  exit 0
fi

echo "Commits to be pushed:"
git log --oneline --color=always origin/main..HEAD
echo ""

# Check commits behind
echo "4. Checking if behind origin..."
BEHIND=$(git log --oneline HEAD..origin/main)
if [ -n "$BEHIND" ]; then
  echo "⚠️  Remote has commits you don't have:"
  git log --oneline --color=always HEAD..origin/main
  echo ""
  read -p "Rebase your commits on top of remote? (y/n): " -n 1 -r
  echo ""
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "   Running: git pull --rebase origin main"
    git pull --rebase origin main
    echo "✅ Rebase complete"
    echo ""
  else
    echo "❌ Push aborted (behind remote)"
    exit 1
  fi
else
  echo "✅ Not behind remote"
  echo ""
fi

# Verify build
echo "5. Verifying build..."
if ! ~/.local/share/pnpm/pnpm build > /dev/null 2>&1; then
  echo "❌ Build failed!"
  echo "   Fix errors and try again"
  exit 1
fi
echo "✅ Build successful"
echo ""

# Push
echo "6. Pushing to origin/main..."
read -p "Proceed with push? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  git push origin main
  echo ""
  echo "🎉 Push successful!"
  echo ""
  echo "Remember to update docs/HANDOFF_STATUS.md:"
  echo "  - $(date +%Y-%m-%d\ %H:%M): $(git config user.name) pushed $(git rev-parse --short HEAD)"
else
  echo "Push cancelled"
  exit 1
fi
