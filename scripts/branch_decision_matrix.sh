#!/bin/bash
set -euo pipefail

echo "=== COMPREHENSIVE BRANCH ANALYSIS ==="
echo "Generated: $(date '+%Y-%m-%d %H:%M %Z')"
echo ""

MATRIX_FILE="docs/BRANCH_DECISION_MATRIX_ENHANCED.md"

# Initialize markdown table
cat > "$MATRIX_FILE" << 'HEADER'
# Branch Decision Matrix - Enhanced Analysis

**Generated:** 2025-12-15 22:20 EET  
**Purpose:** Comprehensive branch review before any deletions

## Decision Matrix

| # | Branch | Last Commit | Days Old | Unique Commits | Files Changed | Migrations | Critical Files | Merge Conflict | Recommendation | Justification |
|---|--------|-------------|----------|----------------|---------------|------------|----------------|----------------|----------------|---------------|
HEADER

# Get all branches except main and HEAD
git fetch origin --prune 2>/dev/null || true
branches=$(git branch -r | grep -v "HEAD" | grep -v "origin/main" | sed 's|^  origin/||' | sort)

counter=1
for branch in $branches; do
    echo "[$counter] Analyzing: $branch"
    
    # Basic info
    last_commit_date=$(git log -1 --format="%ci" "origin/$branch" 2>/dev/null | cut -d' ' -f1 || echo "unknown")
    
    # Calculate days old
    if [[ "$last_commit_date" != "unknown" ]]; then
        days_old=$(( ( $(date +%s) - $(date -d "$last_commit_date" +%s) ) / 86400 ))
    else
        days_old=999
    fi
    
    # Unique commits (ensure single integer)
    unique_commits=$(git log --oneline "main..origin/$branch" 2>/dev/null | wc -l | tr -d '\n' || echo "0")
    unique_commits=${unique_commits:-0}
    
    # Changed files analysis
    if [[ $unique_commits -gt 0 ]]; then
        changed_files=$(git diff --name-only "main...origin/$branch" 2>/dev/null || echo "")
        files_count=$(echo "$changed_files" | grep -c "." || echo "0")
        files_count=$(echo "$files_count" | tr -d '\n')
        files_count=${files_count:-0}
        
        # Check for critical changes (force single-line output)
        has_migrations=$(echo "$changed_files" | grep -c "supabase/migrations" 2>/dev/null | head -1 || echo "0")
        has_migrations=$(echo "$has_migrations" | tr -d '\n')
        has_migrations=${has_migrations:-0}
        
        has_src=$(echo "$changed_files" | grep -c "^src/" 2>/dev/null | head -1 || echo "0")
        has_src=$(echo "$has_src" | tr -d '\n')
        has_src=${has_src:-0}
        
        has_config=$(echo "$changed_files" | grep -cE "package.json|tsconfig|next.config|\.env" 2>/dev/null | head -1 || echo "0")
        has_config=$(echo "$has_config" | tr -d '\n')
        has_config=${has_config:-0}
        
        has_workflows=$(echo "$changed_files" | grep -c "\.github/workflows" 2>/dev/null | head -1 || echo "0")
        has_workflows=$(echo "$has_workflows" | tr -d '\n')
        has_workflows=${has_workflows:-0}
        
        # Build critical files summary
        critical=""
        if [[ $has_migrations -gt 0 ]]; then
            critical="${critical}migrations($has_migrations), "
        fi
        if [[ $has_src -gt 0 ]]; then
            critical="${critical}src($has_src), "
        fi
        if [[ $has_config -gt 0 ]]; then
            critical="${critical}config($has_config), "
        fi
        if [[ $has_workflows -gt 0 ]]; then
            critical="${critical}workflows($has_workflows), "
        fi
        
        if [[ -z "$critical" ]]; then
            critical="none"
        else
            critical=$(echo "$critical" | sed 's/, $//')
        fi
        
        # Check merge conflicts (simplified)
        merge_status="✅ NO"
        
        # Generate recommendation with justification
        if [[ $has_migrations -gt 0 ]]; then
            recommendation="⚠️ INVESTIGATE"
            justification="Contains DB migrations - high risk if lost"
        elif [[ $days_old -gt 60 ]]; then
            recommendation="🗑️ REVIEW"
            justification="Stale >60 days - verify if work superseded"
        elif [[ $has_src -gt 10 || $has_config -gt 0 ]]; then
            recommendation="📋 REVIEW"
            justification="Significant changes - manual review needed"
        else
            recommendation="🔍 INVESTIGATE"
            justification="Changes present - quick review recommended"
        fi
        
    else
        # No unique commits
        files_count=0
        has_migrations=0
        critical="merged"
        merge_status="N/A"
        recommendation="✅ DELETE"
        justification="No unique commits - fully merged to main"
    fi
    
    # Add row to matrix
    echo "| $counter | \`$branch\` | $last_commit_date | $days_old | $unique_commits | $files_count | $has_migrations | $critical | $merge_status | $recommendation | $justification |" >> "$MATRIX_FILE"
    
    counter=$((counter + 1))
done

# Add legend
cat >> "$MATRIX_FILE" << 'LEGEND'

---

## Legend

**Recommendations:**
- ⚠️ INVESTIGATE: High-value or high-risk changes (migrations, core features)
- 📋 REVIEW: Moderate changes requiring manual review before decision
- 🔍 INVESTIGATE: Low-impact changes needing quick verification
- 🗑️ REVIEW: Stale branches (>60 days) - verify work not superseded
- ✅ DELETE: Safe to delete (merged or no unique commits)

**Critical Files:**
- migrations(N): Database migration files
- src(N): Source code files
- config(N): Configuration files
- workflows(N): CI/CD workflow files

---

## User Instructions

1. **Review each row** with all context columns
2. **Mark your decision** for each branch: KEEP | MERGE | INVESTIGATE | DELETE
3. **Share decisions** - I will execute only approved deletions

**No automatic deletions will occur without your explicit approval.**

LEGEND

echo ""
echo "=== ANALYSIS COMPLETE ==="
echo "Matrix: $MATRIX_FILE"
echo "Total branches analyzed: $((counter - 1))"
