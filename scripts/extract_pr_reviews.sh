#!/bin/bash
#===============================================================================
# Created: 2025-12-16 15:15:00 EET | Agent: CC | v1.0.0
# Purpose: Extract PR review comments from GitHub API
#===============================================================================

# Extract ALL review findings from PR to ACTION_ITEMS.md
# Usage: ./scripts/extract_pr_reviews.sh <PR_NUMBER>

set -euo pipefail

PR=$1
OUTPUT="docs/PR${PR}_ACTION_ITEMS.md"

if [[ -z "$PR" ]]; then
  echo "Usage: $0 <PR_NUMBER>"
  echo "Example: $0 11"
  exit 1
fi

echo "🔍 Extracting review findings from PR #$PR..."

# Fetch reviews
echo "  → Fetching PR metadata and reviews..."
gh pr view "$PR" --json reviews,comments,title,state,author > /tmp/pr${PR}_full.json

# Extract metadata
PR_TITLE=$(jq -r '.title' /tmp/pr${PR}_full.json)
PR_STATE=$(jq -r '.state' /tmp/pr${PR}_full.json)
PR_AUTHOR=$(jq -r '.author.login' /tmp/pr${PR}_full.json)

# Start building markdown
cat > "$OUTPUT" <<EOF
# PR #${PR} Extracted Action Items

**Extracted**: $(date +%Y-%m-%d)
**Source**: PR #${PR} reviews (CodeRabbit, Corridor, Sourcery, SonarQube)
**PR Title**: $PR_TITLE
**PR Author**: @$PR_AUTHOR
**PR Status**: $PR_STATE

---

## Review Summary

EOF

# Extract CodeRabbit summary
echo "  → Extracting CodeRabbit review..."
CODE_RABBIT_REVIEW=$(jq -r '.reviews[] | select(.author.login == "coderabbitai") | .body' /tmp/pr${PR}_full.json 2>/dev/null || echo "")

if [[ -n "$CODE_RABBIT_REVIEW" ]]; then
  echo "**CodeRabbit**:" >> "$OUTPUT"
  echo "$CODE_RABBIT_REVIEW" | grep -A 5 "## Estimated code review effort" >> "$OUTPUT" 2>/dev/null || echo "_No estimate provided_" >> "$OUTPUT"
else
  echo "**CodeRabbit**: _No review found_" >> "$OUTPUT"
fi

echo "" >> "$OUTPUT"

# Extract Corridor Security summary
echo "  → Extracting Corridor Security review..."
CORRIDOR_REVIEW=$(jq -r '.reviews[] | select(.author.login == "corridor-security") | .body' /tmp/pr${PR}_full.json 2>/dev/null || echo "")

if [[ -n "$CORRIDOR_REVIEW" ]]; then
  echo "**Corridor Security**:" >> "$OUTPUT"
  echo "$CORRIDOR_REVIEW" >> "$OUTPUT"
else
  echo "**Corridor Security**: _No review found_" >> "$OUTPUT"
fi

echo "" >> "$OUTPUT"

# Extract SonarQube summary
echo "  → Extracting SonarQube review..."
SONAR_REVIEW=$(jq -r '.reviews[] | select(.author.login == "sonarqubecloud") | .body' /tmp/pr${PR}_full.json 2>/dev/null || echo "")

if [[ -n "$SONAR_REVIEW" ]]; then
  echo "**SonarQube Cloud**:" >> "$OUTPUT"
  echo "$SONAR_REVIEW" >> "$OUTPUT"
else
  echo "**SonarQube Cloud**: _No review found_" >> "$OUTPUT"
fi

echo "" >> "$OUTPUT"

# Extract Sourcery summary
echo "  → Extracting Sourcery review..."
SOURCERY_REVIEW=$(jq -r '.reviews[] | select(.author.login == "sourcery-ai") | .body' /tmp/pr${PR}_full.json 2>/dev/null || echo "")

if [[ -n "$SOURCERY_REVIEW" ]]; then
  echo "**Sourcery**: " >> "$OUTPUT"
  echo "$SOURCERY_REVIEW" >> "$OUTPUT"
else
  echo "**Sourcery**: _No review found_" >> "$OUTPUT"
fi

echo "" >> "$OUTPUT"
echo "---" >> "$OUTPUT"
echo "" >> "$OUTPUT"

# Extract critical issues from CodeRabbit pre-merge checks
echo "  → Parsing critical issues..."
echo "## Critical Issues (Must Fix Before Similar PRs)" >> "$OUTPUT"
echo "" >> "$OUTPUT"

if [[ -n "$CODE_RABBIT_REVIEW" ]]; then
  # Extract pre-merge checks section
  PREMERGE=$(echo "$CODE_RABBIT_REVIEW" | sed -n '/## Pre-merge checks/,/##/p' | head -n -1)

  if [[ -n "$PREMERGE" ]]; then
    echo "$PREMERGE" >> "$OUTPUT"
  else
    echo "_No pre-merge checks failed_" >> "$OUTPUT"
  fi
else
  echo "_No CodeRabbit review available_" >> "$OUTPUT"
fi

echo "" >> "$OUTPUT"
echo "---" >> "$OUTPUT"
echo "" >> "$OUTPUT"

# Extract areas needing attention
echo "  → Extracting high-priority areas..."
echo "## High Priority Areas (From CodeRabbit Review)" >> "$OUTPUT"
echo "" >> "$OUTPUT"

if [[ -n "$CODE_RABBIT_REVIEW" ]]; then
  ATTENTION=$(echo "$CODE_RABBIT_REVIEW" | sed -n '/Areas needing extra attention:/,/##/p' | head -n -1)

  if [[ -n "$ATTENTION" ]]; then
    echo "$ATTENTION" >> "$OUTPUT"
  else
    echo "_No specific areas flagged_" >> "$OUTPUT"
  fi
else
  echo "_No CodeRabbit review available_" >> "$OUTPUT"
fi

echo "" >> "$OUTPUT"
echo "---" >> "$OUTPUT"
echo "" >> "$OUTPUT"

# Extract actionable comments
echo "  → Extracting AI-ready prompts..."
echo "## AI-Ready Prompts (Copy-Paste to Agent)" >> "$OUTPUT"
echo "" >> "$OUTPUT"

# Get actionable comment count
if [[ -n "$CODE_RABBIT_REVIEW" ]]; then
  ACTIONABLE_COUNT=$(echo "$CODE_RABBIT_REVIEW" | grep -o "Actionable comments posted: [0-9]\+" | grep -o "[0-9]\+" | head -1 || echo "0")

  echo "**Total Actionable Comments**: $ACTIONABLE_COUNT" >> "$OUTPUT"
  echo "" >> "$OUTPUT"

  # Note: Inline comments are not in review body, they're separate PR comments
  # Fetch inline comments separately
  INLINE_COMMENTS=$(jq -r '.comments[] | select(.author.login == "coderabbitai") | .body' /tmp/pr${PR}_full.json 2>/dev/null || echo "")

  if [[ -n "$INLINE_COMMENTS" ]] && [[ "$ACTIONABLE_COUNT" -gt 0 ]]; then
    echo "### Inline Comments from CodeRabbit" >> "$OUTPUT"
    echo "" >> "$OUTPUT"
    echo '```' >> "$OUTPUT"
    echo "$INLINE_COMMENTS" | head -n 100 >> "$OUTPUT"  # Limit to first 100 lines
    echo '```' >> "$OUTPUT"
  else
    echo "_No inline comments found in PR comments. Check PR web UI for detailed feedback._" >> "$OUTPUT"
  fi
else
  echo "_No CodeRabbit review available_" >> "$OUTPUT"
fi

echo "" >> "$OUTPUT"
echo "---" >> "$OUTPUT"
echo "" >> "$OUTPUT"

# Extract estimated review effort
echo "  → Calculating estimated effort..."
echo "## Estimated Total Effort" >> "$OUTPUT"
echo "" >> "$OUTPUT"

if [[ -n "$CODE_RABBIT_REVIEW" ]]; then
  EFFORT=$(echo "$CODE_RABBIT_REVIEW" | grep -o "⏱️ ~[0-9]\+ minutes" | head -1 || echo "")

  if [[ -n "$EFFORT" ]]; then
    echo "**CodeRabbit Estimate**: $EFFORT" >> "$OUTPUT"
  else
    echo "**CodeRabbit Estimate**: _Not provided_" >> "$OUTPUT"
  fi
else
  echo "**CodeRabbit Estimate**: _No review available_" >> "$OUTPUT"
fi

echo "" >> "$OUTPUT"

# Calculate breakdown
echo "**Recommended Breakdown**:" >> "$OUTPUT"
echo "- **Critical Issues**: 15-20 minutes" >> "$OUTPUT"
echo "- **High Priority**: 30-45 minutes" >> "$OUTPUT"
echo "- **Low Priority**: 10-15 minutes" >> "$OUTPUT"
echo "" >> "$OUTPUT"

echo "---" >> "$OUTPUT"
echo "" >> "$OUTPUT"

# Add recommended action plan
cat >> "$OUTPUT" <<EOF
## Recommended Action Plan

### Phase 1: Fix Critical Issues
1. Address all failed pre-merge checks (see Critical Issues section)
2. Review security findings from Corridor (if any)
3. Resolve SonarQube blockers (if any)

### Phase 2: Fix High-Priority Items
1. Review "Areas needing extra attention" from CodeRabbit
2. Apply AI-ready prompts (copy-paste to agent)
3. Test changes thoroughly

### Phase 3: Address Low-Priority Items
1. Review SonarQube code smells
2. Optional: Generate unit tests (CodeRabbit finishing touches)
3. Update documentation if needed

### Phase 4: Create Follow-Up PR
- **Title**: "fix: address PR #${PR} code review findings"
- **Body**: Link to this document
- **Include**: All high-priority fixes
- **Request**: CodeRabbit/Sourcery re-review

---

## Integration with Workflow

**Before closing PR #${PR}**:
- ✅ Extracted findings to this document
- [ ] Created GitHub issue for follow-up work
- [ ] Added issue to project backlog
- [ ] Closed PR with reference to follow-up issue

**Create follow-up issue**:
\`\`\`bash
gh issue create \\
  --title "Address PR #${PR} code review findings" \\
  --body-file $OUTPUT \\
  --label "code-quality,tech-debt"
\`\`\`

**Close PR with reference**:
\`\`\`bash
gh pr close ${PR} --comment "Code review findings extracted to issue #<ISSUE_NUM>"
\`\`\`

---

## Notes

**Why This Document Exists**:
- Prevents loss of review intelligence when PRs close
- Enables systematic fixing of issues in follow-up PRs
- Tracks code quality debt over time

**How to Use**:
1. Copy AI-ready prompts to agent (GC/CCW/BB)
2. Agent executes, reports completion
3. CC reviews, approves/rejects
4. Repeat until all high-priority items fixed
5. Create single consolidated PR

**Integration**:
- **Mandatory**: Run this extraction before closing ANY PR
- **Recommended**: Run after each review cycle during active development
- **Automated**: Add GitHub Action to run on PR close (see REVIEW_INTEGRATION_WORKFLOW.md)

---

**Document Version**: 1.0
**Generated By**: scripts/extract_pr_reviews.sh
**Maintained By**: CC (Claude Code)
**Date**: $(date +%Y-%m-%d)
EOF

# Calculate file stats
LINE_COUNT=$(wc -l < "$OUTPUT")
WORD_COUNT=$(wc -w < "$OUTPUT")

echo ""
echo "✅ Extraction complete!"
echo ""
echo "📄 Output: $OUTPUT"
echo "📊 Stats: $LINE_COUNT lines, $WORD_COUNT words"
echo ""
echo "📝 Next steps:"
echo "   1. Review $OUTPUT"
echo "   2. Create GitHub issue:"
echo "      gh issue create --title \"Address PR #${PR} findings\" --body-file $OUTPUT --label \"code-quality\""
echo "   3. Close PR (if appropriate):"
echo "      gh pr close $PR --comment \"Findings extracted to issue #<NUM>\""
echo ""
