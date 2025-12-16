#!/bin/bash
set -euo pipefail

echo "=== BRANCH MERGE VERIFICATION ==="
echo "Generated: $(date '+%Y-%m-%d %H:%M %Z')"
echo ""

REPORT_FILE="docs/BRANCH_MERGE_STATUS.md"

cat > "$REPORT_FILE" << 'HEADER'
# Branch Merge Status Report

**Purpose:** Verify which branches are fully merged to main (safe to delete)

## Results

| Branch | Unique Commits | Status | Action |
|--------|----------------|--------|--------|
HEADER

# Get all branches
git fetch origin --prune 2>/dev/null || true
branches=$(git branch -r | grep -v "HEAD" | grep -v "origin/main" | sed 's|^  origin/||' | sort)

safe_delete=()
must_review=()

for branch in $branches; do
    # Count commits not in main
    unique=$(git log --oneline "main..origin/$branch" 2>/dev/null | wc -l | tr -d '\n')
    unique=${unique:-0}
    
    if [[ $unique -eq 0 ]]; then
        status="✅ FULLY MERGED"
        action="SAFE TO DELETE"
        safe_delete+=("$branch")
    else
        status="⚠️ HAS UNIQUE WORK"
        action="MUST REVIEW"
        must_review+=("$branch")
    fi
    
    echo "| \`$branch\` | $unique | $status | $action |" >> "$REPORT_FILE"
done

# Add summary
cat >> "$REPORT_FILE" << SUMMARY

---

## Summary

**SAFE TO DELETE (${#safe_delete[@]} branches):**
These branches have 0 unique commits - all work is in main.

SUMMARY

for branch in "${safe_delete[@]}"; do
    echo "- \`$branch\`" >> "$REPORT_FILE"
done

cat >> "$REPORT_FILE" << REVIEW

**MUST REVIEW (${#must_review[@]} branches):**
These branches have unique commits NOT in main.

REVIEW

for branch in "${must_review[@]}"; do
    echo "- \`$branch\`" >> "$REPORT_FILE"
done

cat >> "$REPORT_FILE" << 'FOOTER'

---

## Next Steps

1. **DELETE safe branches** (fully merged, no unique work)
2. **REVIEW must_review branches** individually:
   - Check if work is valuable
   - Merge if needed
   - Delete if superseded

FOOTER

echo ""
echo "=== VERIFICATION COMPLETE ==="
echo "Safe to delete: ${#safe_delete[@]} branches"
echo "Must review: ${#must_review[@]} branches"
echo "Report: $REPORT_FILE"
