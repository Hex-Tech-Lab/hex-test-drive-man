#!/bin/bash
# Branch Analysis Script [2025-12-15 02:30 UTC, CC]
# Purpose: Analyze all 23 branches individually for decision matrix

echo "=== BRANCH ANALYSIS STARTING ==="
echo "Date: $(date -u '+%Y-%m-%d %H:%M UTC')"
echo ""

# Output files
MATRIX_FILE="docs/BRANCH_DECISION_MATRIX_2025-12-15.md"
DETAILS_FILE="docs/BRANCH_ANALYSIS_DETAILS_2025-12-15.txt"

# Initialize matrix
cat > "$MATRIX_FILE" << 'EOF'
# Branch Decision Matrix [2025-12-15 02:30 UTC, CC]

**Generated**: 2025-12-15 02:30 UTC
**Method**: Automated analysis + manual review
**Total Branches**: 23 (excluding main)

---

## Decision Matrix

| # | Branch | Last Commit | Unique Commits | Key Changes | Value | Risk | Recommendation |
|---|--------|-------------|----------------|-------------|-------|------|----------------|
EOF

# Get all remote branches except main and HEAD
git fetch origin --prune
branches=$(git branch -r | grep -v "HEAD\|main" | sed 's/origin\///' | sort)

counter=1
echo "" > "$DETAILS_FILE"

# Analyze each branch
for branch in $branches; do
    echo "[$counter] Analyzing: $branch"
    echo "======================================" >> "$DETAILS_FILE"
    echo "BRANCH: $branch" >> "$DETAILS_FILE"
    echo "======================================" >> "$DETAILS_FILE"

    # Get last commit info
    last_commit_date=$(git log -1 --format="%ci" origin/$branch 2>/dev/null | cut -d' ' -f1)
    last_commit_msg=$(git log -1 --format="%s" origin/$branch 2>/dev/null | head -c 60)

    echo "Last Commit: $last_commit_date" >> "$DETAILS_FILE"
    echo "Last Message: $last_commit_msg" >> "$DETAILS_FILE"
    echo "" >> "$DETAILS_FILE"

    # Count unique commits not in main
    unique_commits=$(git log --oneline main..origin/$branch 2>/dev/null | wc -l)

    echo "Unique Commits: $unique_commits" >> "$DETAILS_FILE"

    if [ $unique_commits -gt 0 ]; then
        echo "" >> "$DETAILS_FILE"
        echo "COMMIT HISTORY:" >> "$DETAILS_FILE"
        git log --oneline main..origin/$branch 2>/dev/null | head -10 >> "$DETAILS_FILE"
        echo "" >> "$DETAILS_FILE"

        # Get changed files summary
        echo "CHANGED FILES:" >> "$DETAILS_FILE"
        git diff --name-status main...origin/$branch 2>/dev/null | head -20 >> "$DETAILS_FILE"
        echo "" >> "$DETAILS_FILE"

        # Analyze key changes
        changed_files=$(git diff --name-only main...origin/$branch 2>/dev/null)

        # Categorize changes
        has_src_changes=$(echo "$changed_files" | grep -c "^src/" || echo 0)
        has_doc_changes=$(echo "$changed_files" | grep -c "^docs/" || echo 0)
        has_config_changes=$(echo "$changed_files" | grep -c -E "package.json|tsconfig|next.config|\.env" || echo 0)
        has_migration_changes=$(echo "$changed_files" | grep -c "supabase/migrations" || echo 0)

        echo "CHANGE SUMMARY:" >> "$DETAILS_FILE"
        echo "  src/ files: $has_src_changes" >> "$DETAILS_FILE"
        echo "  docs/ files: $has_doc_changes" >> "$DETAILS_FILE"
        echo "  config files: $has_config_changes" >> "$DETAILS_FILE"
        echo "  migrations: $has_migration_changes" >> "$DETAILS_FILE"
        echo "" >> "$DETAILS_FILE"

        # Check for specific high-value patterns
        key_changes=""
        value_score=0
        risk_score=0

        # Check for feature implementations
        if echo "$changed_files" | grep -q "src/components/"; then
            key_changes="${key_changes}UI components, "
            value_score=$((value_score + 2))
        fi

        if echo "$changed_files" | grep -q "src/repositories/"; then
            key_changes="${key_changes}data layer, "
            value_score=$((value_score + 3))
        fi

        if echo "$changed_files" | grep -q "src/services/"; then
            key_changes="${key_changes}services, "
            value_score=$((value_score + 3))
        fi

        if [ $has_migration_changes -gt 0 ]; then
            key_changes="${key_changes}DB migrations, "
            value_score=$((value_score + 4))
            risk_score=$((risk_score + 3))
        fi

        if echo "$changed_files" | grep -q "src/app/"; then
            key_changes="${key_changes}routes/pages, "
            value_score=$((value_score + 2))
        fi

        # Check for bug fixes
        if echo "$last_commit_msg" | grep -qi "fix\|bug"; then
            key_changes="${key_changes}bug fixes, "
            value_score=$((value_score + 2))
        fi

        # Check for infrastructure changes
        if [ $has_config_changes -gt 0 ]; then
            key_changes="${key_changes}config, "
            risk_score=$((risk_score + 2))
        fi

        # Remove trailing comma
        key_changes=$(echo "$key_changes" | sed 's/, $//')

        if [ -z "$key_changes" ]; then
            key_changes="misc changes"
        fi

        # Assign value grade
        if [ $value_score -ge 6 ]; then
            value="HIGH"
            risk="HIGH"
            recommendation="⚠️ INVESTIGATE"
        elif [ $value_score -ge 3 ]; then
            value="MEDIUM"
            risk="MEDIUM"
            recommendation="📋 REVIEW"
        else
            value="LOW"
            risk="LOW"
            recommendation="🗑️ DELETE"
        fi

        # Override for very old branches
        days_old=$(( ( $(date +%s) - $(date -d "$last_commit_date" +%s) ) / 86400 ))
        if [ $days_old -gt 30 ]; then
            recommendation="🗑️ DELETE (stale >30d)"
        fi

        echo "VALUE ASSESSMENT:" >> "$DETAILS_FILE"
        echo "  Value Score: $value_score" >> "$DETAILS_FILE"
        echo "  Risk Score: $risk_score" >> "$DETAILS_FILE"
        echo "  Value: $value" >> "$DETAILS_FILE"
        echo "  Risk if Deleted: $risk" >> "$DETAILS_FILE"
        echo "  Days Old: $days_old" >> "$DETAILS_FILE"
        echo "  Recommendation: $recommendation" >> "$DETAILS_FILE"

    else
        # No unique commits - merged or empty
        key_changes="(merged to main)"
        value="NONE"
        risk="NONE"
        recommendation="✅ DELETE (merged)"

        echo "STATUS: Merged to main (no unique commits)" >> "$DETAILS_FILE"
    fi

    echo "" >> "$DETAILS_FILE"
    echo "" >> "$DETAILS_FILE"

    # Add to matrix
    echo "| $counter | \`$branch\` | $last_commit_date | $unique_commits | $key_changes | $value | $risk | $recommendation |" >> "$MATRIX_FILE"

    counter=$((counter + 1))
done

# Add summary to matrix
cat >> "$MATRIX_FILE" << 'EOF'

---

## Legend

**Value**:
- HIGH: Significant unmerged work (features, migrations, services)
- MEDIUM: Moderate changes (UI components, fixes)
- LOW: Minor changes (docs, config tweaks)
- NONE: Already merged to main

**Risk if Deleted**:
- HIGH: DB migrations, critical features, data loss
- MEDIUM: Feature work, may need re-implementation
- LOW: Easily recreatable work
- NONE: Safe to delete

**Recommendations**:
- ⚠️ INVESTIGATE: High-value unmerged work, needs detailed review
- 📋 REVIEW: Medium-value, quick review before decision
- 🗑️ DELETE: Low-value or merged, safe to remove
- ✅ DELETE (merged): Confirmed merged to main

---

## Next Steps

1. **Manual Review Required**: Branches marked ⚠️ INVESTIGATE
2. **Quick Review**: Branches marked 📋 REVIEW
3. **Safe Deletion**: Branches marked 🗑️ DELETE or ✅ DELETE

**Detailed Analysis**: See `BRANCH_ANALYSIS_DETAILS_2025-12-15.txt`

---

**Generated By**: CC (Claude Code Terminal)
**Script**: scripts/analyze_all_branches.sh
EOF

echo ""
echo "=== ANALYSIS COMPLETE ==="
echo "Matrix: $MATRIX_FILE"
echo "Details: $DETAILS_FILE"
echo ""
echo "Summary:"
grep "INVESTIGATE\|REVIEW\|DELETE" "$MATRIX_FILE" | wc -l
echo "  branches analyzed"
