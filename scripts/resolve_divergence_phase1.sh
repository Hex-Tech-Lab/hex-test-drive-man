#!/bin/bash
# Git Divergence Resolution [2025-12-15 03:00 UTC, CC]
# Purpose: Rebase CC's branch onto main, then merge critical booking migration

echo "=== GIT DIVERGENCE RESOLUTION ==="
echo "Problem: main and CC's branch diverged (17 vs 4 commits)"
echo "Solution: Rebase CC's 17 commits onto main, then merge booking"
echo ""

# PHASE 1: Backup current state
echo "PHASE 1: BACKUP"
git branch backup/cc-before-rebase-$(date +%Y%m%d-%H%M%S)
echo "✅ Backup created"
echo ""

# PHASE 2: Fetch latest
echo "PHASE 2: FETCH"
git fetch origin
echo "✅ Fetched latest from origin"
echo ""

# PHASE 3: Rebase CC's branch onto main
echo "PHASE 3: REBASE"
echo "Current branch: $(git branch --show-current)"
echo "Rebasing onto origin/main..."
echo ""

git rebase origin/main

if [ $? -ne 0 ]; then
    echo "❌ REBASE CONFLICT"
    echo ""
    echo "Conflicts found. Options:"
    echo "1. Fix conflicts manually: edit files, then 'git add' and 'git rebase --continue'"
    echo "2. Skip this commit: git rebase --skip"
    echo "3. Abort rebase: git rebase --abort"
    echo ""
    echo "After resolving, run: bash scripts/resolve_divergence_phase2.sh"
    exit 1
fi

echo "✅ Rebase successful"
echo ""

# PHASE 4: Verify rebase
echo "PHASE 4: VERIFY"
echo "Commits now on branch:"
git log --oneline -10
echo ""
echo "Check if main is now ancestor:"
git merge-base --is-ancestor origin/main HEAD && echo "✅ Main is ancestor" || echo "❌ Main is NOT ancestor"
echo ""

# PHASE 5: Force push (required after rebase)
echo "PHASE 5: FORCE PUSH"
echo "⚠️  This will rewrite history on claude/sync-agent-instructions branch"
echo "Ready to force push? (This script will NOT auto-push for safety)"
echo ""
echo "Manual command to run:"
echo "  git push --force-with-lease origin claude/sync-agent-instructions-015BBjkGH1Syq5uEU6r2uGCg"
echo ""

echo "=== PHASE 1-4 COMPLETE ==="
echo "Next: Review git log, then manually force push"
