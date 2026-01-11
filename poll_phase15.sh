#!/bin/bash
set -e

echo "🔍 Starting Phase 1.5 polling (max 3 hours, check every 3 min)"
echo "Target: bb/mvp1.5-phase1-booking-complete with 'OpenCV' in commit message"
echo ""

MAX_ITERATIONS=60
ITERATION=0

while [ $ITERATION -lt $MAX_ITERATIONS ]; do
  ITERATION=$((ITERATION + 1))
  ELAPSED=$((ITERATION * 3))
  
  echo "[$ITERATION/$MAX_ITERATIONS] Checking at $ELAPSED min..."
  
  # Fetch latest from GitHub
  git fetch origin bb/mvp1.5-phase1-booking-complete 2>&1 | grep -v "^From" || true
  
  # Get latest commit message
  git log -1 --pretty=%B origin/bb/mvp1.5-phase1-booking-complete > /tmp/commit_msg.txt 2>/dev/null || echo "BRANCH_NOT_FOUND" > /tmp/commit_msg.txt
  
  if grep -q "BRANCH_NOT_FOUND" /tmp/commit_msg.txt; then
    echo "❌ Branch bb/mvp1.5-phase1-booking-complete not found on remote"
    echo "Retrying in 3 minutes..."
    sleep 180
    continue
  fi
  
  git rev-parse origin/bb/mvp1.5-phase1-booking-complete > /tmp/latest_sha.txt 2>/dev/null
  
  echo "Latest commit:"
  head -c 7 /tmp/latest_sha.txt
  echo ""
  echo "Message:"
  cat /tmp/commit_msg.txt
  echo ""
  
  # Check for OpenCV keyword (case-insensitive)
  if grep -iq "opencv" /tmp/commit_msg.txt; then
    echo ""
    echo "✅ SUCCESS! Found OpenCV commit on bb/mvp1.5-phase1-booking-complete"
    cat /tmp/latest_sha.txt > /tmp/phase15_complete_sha.txt
    exit 0
  fi
  
  echo "⏳ No OpenCV commit yet. Waiting 3 minutes..."
  echo ""
  
  if [ $ITERATION -lt $MAX_ITERATIONS ]; then
    sleep 180
  fi
done

echo ""
echo "⏰ TIMEOUT: 3 hours elapsed without OpenCV commit"
exit 1
