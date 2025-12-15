#!/bin/bash
# Merge Status Verification [2025-12-15 02:50 UTC, CC]
# Purpose: Check if branch CONTENT is in main (not just commits)

echo "=== MERGE STATUS VERIFICATION ==="
echo "Date: $(date -u '+%Y-%m-%d %H:%M UTC')"
echo ""

OUTPUT="docs/BRANCH_MERGE_STATUS_2025-12-15.md"

cat > "$OUTPUT" << 'EOF'
# Branch Merge Status Verification [2025-12-15 02:50 UTC, CC]

**Purpose**: Determine which branches are ACTUALLY safe to delete
**Method**: Check if file changes exist in main (not just commit history)

---

## Merge Status

| Branch | Commits | Files Changed | Content in Main | Migration | SAFE TO DELETE |
|--------|---------|---------------|-----------------|-----------|----------------|
EOF

git fetch origin --prune

branches=$(git branch -r | grep -v "HEAD\|main" | sed 's/origin\///' | sort)

for branch in $branches; do
    echo "Checking: $branch"

    # Count unique commits
    commits=$(git log --oneline main..origin/$branch 2>/dev/null | wc -l)

    # Count changed files
    files=$(git diff --name-only main...origin/$branch 2>/dev/null | wc -l)

    # Check if ALL changes are in main (diff should be empty)
    diff_stat=$(git diff main...origin/$branch 2>/dev/null | wc -l)

    if [ $diff_stat -eq 0 ]; then
        content_status="✅ YES"
        safe="✅ YES"
    else
        content_status="❌ NO ($diff_stat lines differ)"
        safe="❌ NO"
    fi

    # Check for migrations
    has_migration=$(git diff --name-only main...origin/$branch 2>/dev/null | grep -c "migration" || echo 0)
    if [ $has_migration -gt 0 ]; then
        migration="⚠️ YES ($has_migration)"
        safe="❌ NO (has migration)"
    else
        migration="NONE"
    fi

    echo "| \`$branch\` | $commits | $files | $content_status | $migration | $safe |" >> "$OUTPUT"
done

cat >> "$OUTPUT" << 'EOF'

---

## Legend

**Content in Main**:
- ✅ YES: All file changes exist in main (safe to delete)
- ❌ NO: Branch has unique content NOT in main (review needed)

**SAFE TO DELETE**:
- ✅ YES: Branch fully merged, can delete
- ❌ NO: Has unmerged content or migrations

---

## Recommendations

### DELETE IMMEDIATELY (Content in main):
- Branches marked ✅ YES in "SAFE TO DELETE" column

### MUST REVIEW (Unmerged content):
- Branches marked ❌ NO - have unique work

### CRITICAL REVIEW (Has migrations):
- Branches marked ⚠️ YES in "Migration" column - database changes

---

**Generated**: 2025-12-15 02:50 UTC
**By**: CC (Claude Code Terminal)
EOF

echo ""
echo "=== VERIFICATION COMPLETE ==="
echo "Report: $OUTPUT"
cat "$OUTPUT"
