# Review Tool Integration Workflow

**Purpose**: Integrate CodeRabbit, Corridor, Sourcery, SonarQube feedback into development cycle
**Problem Solved**: "We talk about things, create PRs, never do anything with them" - User, 2025-12-16
**Status**: ACTIVE - Use this workflow for ALL PRs going forward

---

## The Problem

Review tools (CodeRabbit, Corridor, Sourcery, SonarQube) provide feedback AFTER PR push, but:
- ❌ We never incorporate feedback iteratively
- ❌ PRs get closed without extracting action items
- ❌ Same issues repeat across PRs
- ❌ Review intelligence is lost

**Result**: Wasted review cycles, repeated mistakes, frustrated team

---

## The Solution: 3-Step Integration Loop

### Step 1: Push & Wait (90 seconds)

```bash
# After making changes
git add .
git commit -m "fix: your changes here"
git push origin $BRANCH_NAME

# Wait for review tools to run
echo "⏳ Waiting for review tools (CodeRabbit, Corridor, Sourcery, SonarQube)..."
sleep 90

echo "✅ Review tools should be done. Proceeding to Step 2..."
```

**Why 90 seconds?**
- CodeRabbit: ~30-45 seconds
- Corridor Security: ~20-30 seconds
- Sourcery: ~15-25 seconds
- SonarQube: ~30-40 seconds
- Buffer: +10 seconds

---

### Step 2: Fetch & Parse Reviews

```bash
#!/bin/bash
# Fetch latest reviews from PR

PR_NUMBER=$1

if [[ -z "$PR_NUMBER" ]]; then
  echo "Usage: $0 <PR_NUMBER>"
  exit 1
fi

# Fetch all reviews
echo "Fetching reviews for PR #$PR_NUMBER..."
gh pr view $PR_NUMBER --json reviews,comments > /tmp/pr${PR_NUMBER}_reviews.json

# Extract critical/high findings
echo "Extracting CRITICAL/HIGH findings..."
jq '.reviews[] |
    select(.author.login | test("coderabbitai|corridor|sourcery|sonarqubecloud")) |
    .body' /tmp/pr${PR_NUMBER}_reviews.json | \
grep -E "(Critical|High|⚠️|🔴|CRITICAL|HIGH)" > /tmp/pr${PR_NUMBER}_critical.txt

# Display findings
echo ""
echo "=== CRITICAL/HIGH FINDINGS BELOW ==="
cat /tmp/pr${PR_NUMBER}_critical.txt

# Also extract CodeRabbit actionable comments count
ACTIONABLE_COUNT=$(jq '.reviews[] |
    select(.author.login == "coderabbitai") |
    .body' /tmp/pr${PR_NUMBER}_reviews.json | \
    grep -o "Actionable comments posted: [0-9]\+" | \
    grep -o "[0-9]\+" | head -1)

echo ""
echo "=== CODERABBIT ACTIONABLE COMMENTS: $ACTIONABLE_COUNT ==="

# Extract estimated review effort
EFFORT=$(jq '.reviews[] |
    select(.author.login == "coderabbitai") |
    .body' /tmp/pr${PR_NUMBER}_reviews.json | \
    grep -o "⏱️ ~[0-9]\+ minutes" | head -1)

echo "=== ESTIMATED REVIEW EFFORT: $EFFORT ==="
```

**Save as**: `scripts/fetch_pr_reviews.sh`

---

### Step 3: Decide & Iterate

```bash
#!/bin/bash
# Interactive decision loop

PR_NUMBER=$1

# Run Step 2
./scripts/fetch_pr_reviews.sh $PR_NUMBER

# Prompt for action
echo ""
echo "========================================="
echo "Do you want to fix critical/high findings in THIS iteration? (y/n)"
read -r response

if [[ "$response" == "y" ]]; then
  echo "📝 Extracting AI-ready prompts to /tmp/pr${PR_NUMBER}_prompts.txt..."

  # Extract actionable prompts from CodeRabbit
  jq '.reviews[] |
      select(.author.login == "coderabbitai") |
      .body' /tmp/pr${PR_NUMBER}_reviews.json | \
      grep -A 20 "🤖 Prompt for AI Agents" > /tmp/pr${PR_NUMBER}_prompts.txt

  echo "✅ Prompts extracted. Apply fixes, then push again."
  echo "   This will loop back to Step 1 (push & wait)."
  echo ""
  echo "Next steps:"
  echo "1. Apply fixes from /tmp/pr${PR_NUMBER}_prompts.txt"
  echo "2. git add . && git commit -m 'fix: address code review findings'"
  echo "3. git push origin \$BRANCH_NAME"
  echo "4. ./scripts/review_integration_loop.sh $PR_NUMBER  # Run this script again"

else
  echo "📋 Extracting all findings to docs/PR${PR_NUMBER}_ACTION_ITEMS.md for later..."

  # Run full extraction script
  ./scripts/extract_pr_reviews.sh $PR_NUMBER

  echo "✅ Extraction complete. Findings saved to:"
  echo "   docs/PR${PR_NUMBER}_ACTION_ITEMS.md"
  echo ""
  echo "Add to project backlog, then close PR."
fi
```

**Save as**: `scripts/review_integration_loop.sh`

---

## Integration with Agent Workflow

### Before Closing ANY PR (MANDATORY)

```bash
# 1. Run extraction script
./scripts/extract_pr_reviews.sh <PR_NUMBER>

# 2. Verify output file created
ls -lh docs/PR${PR_NUMBER}_ACTION_ITEMS.md

# 3. Add to project backlog (GitHub issue or task tracker)
gh issue create \
  --title "Address PR #${PR_NUMBER} code review findings" \
  --body "$(cat docs/PR${PR_NUMBER}_ACTION_ITEMS.md)" \
  --label "code-quality,tech-debt"

# 4. NOW you can close PR
gh pr close <PR_NUMBER> --comment "Code review findings extracted to #<ISSUE_NUMBER>"
```

---

### During Active Development (RECOMMENDED)

**Option A: Manual Loop**
```bash
# After each push
git push origin <BRANCH>
sleep 90
./scripts/fetch_pr_reviews.sh <PR_NUMBER>

# Review findings, apply fixes if critical
# Push again, repeat
```

**Option B: Automated Loop**
```bash
# Run until no critical findings
while true; do
  git push origin <BRANCH>
  sleep 90

  ./scripts/fetch_pr_reviews.sh <PR_NUMBER>

  # Check if critical findings exist
  if ! grep -q "Critical\|High\|🔴\|⚠️" /tmp/pr${PR_NUMBER}_critical.txt; then
    echo "✅ No critical findings! Safe to merge."
    break
  fi

  echo "❌ Critical findings detected. Apply fixes and push again."
  read -p "Press Enter after fixing and committing..."
done
```

---

## Script: extract_pr_reviews.sh

**Purpose**: Automated extraction of ALL review findings to structured markdown

**Location**: `scripts/extract_pr_reviews.sh`

```bash
#!/bin/bash
# Extract ALL review findings from PR to ACTION_ITEMS.md

set -euo pipefail

PR=$1
OUTPUT="docs/PR${PR}_ACTION_ITEMS.md"

if [[ -z "$PR" ]]; then
  echo "Usage: $0 <PR_NUMBER>"
  exit 1
fi

echo "Extracting review findings from PR #$PR..."

# Fetch reviews
gh pr view $PR --json reviews,comments,title,state > /tmp/pr${PR}_full.json

# Extract metadata
PR_TITLE=$(jq -r '.title' /tmp/pr${PR}_full.json)
PR_STATE=$(jq -r '.state' /tmp/pr${PR}_full.json)

# Start building markdown
cat > "$OUTPUT" <<EOF
# PR #${PR} Extracted Action Items

**Extracted**: $(date +%Y-%m-%d)
**Source**: PR #${PR} reviews (CodeRabbit, Corridor, Sourcery, SonarQube)
**PR Title**: $PR_TITLE
**PR Status**: $PR_STATE

---

## Review Summary

EOF

# Extract CodeRabbit summary
jq -r '.reviews[] |
    select(.author.login == "coderabbitai") |
    .body' /tmp/pr${PR}_full.json | \
    grep -A 5 "## Estimated code review effort" >> "$OUTPUT" 2>/dev/null || echo "_No estimate provided_" >> "$OUTPUT"

echo "" >> "$OUTPUT"

# Extract Corridor Security summary
echo "**Corridor Security**:" >> "$OUTPUT"
jq -r '.reviews[] |
    select(.author.login == "corridor-security") |
    .body' /tmp/pr${PR}_full.json >> "$OUTPUT" 2>/dev/null || echo "_No Corridor review_" >> "$OUTPUT"

echo "" >> "$OUTPUT"
echo "---" >> "$OUTPUT"
echo "" >> "$OUTPUT"

# Extract critical issues
echo "## Critical Issues (Must Fix Before Similar PRs)" >> "$OUTPUT"
echo "" >> "$OUTPUT"

# Parse CodeRabbit pre-merge checks
jq -r '.reviews[] |
    select(.author.login == "coderabbitai") |
    .body' /tmp/pr${PR}_full.json | \
    sed -n '/## Pre-merge checks/,/## /p' | \
    head -n -1 >> "$OUTPUT" 2>/dev/null || echo "_No pre-merge checks failed_" >> "$OUTPUT"

echo "" >> "$OUTPUT"
echo "---" >> "$OUTPUT"
echo "" >> "$OUTPUT"

# Extract actionable comments
echo "## AI-Ready Prompts (Copy-Paste to Agent)" >> "$OUTPUT"
echo "" >> "$OUTPUT"

jq -r '.reviews[] |
    select(.author.login == "coderabbitai") |
    .body' /tmp/pr${PR}_full.json | \
    grep -A 30 "🤖 Prompt for AI Agents" >> "$OUTPUT" 2>/dev/null || echo "_No AI prompts found_" >> "$OUTPUT"

echo "" >> "$OUTPUT"
echo "---" >> "$OUTPUT"
echo "" >> "$OUTPUT"

# Add recommended action plan
cat >> "$OUTPUT" <<EOF
## Recommended Action Plan

1. **Fix critical issues** (from pre-merge checks above)
2. **Create follow-up PR** for high-priority items
3. **Batch low-priority prompts** for next refactor sprint

---

## Integration with Workflow

**Before closing this PR**:
- ✅ Extracted findings to this document
- [ ] Created GitHub issue for follow-up work
- [ ] Added issue to project backlog
- [ ] Closed PR with reference to follow-up issue

**Document Version**: 1.0
**Maintained By**: CC (Claude Code)
**Auto-generated by**: scripts/extract_pr_reviews.sh
EOF

echo "✅ Extraction complete!"
echo "   Output: $OUTPUT"
echo "   Lines: $(wc -l < "$OUTPUT")"
echo ""
echo "Next steps:"
echo "1. Review $OUTPUT"
echo "2. Create GitHub issue: gh issue create --body-file $OUTPUT"
echo "3. Close PR: gh pr close $PR"
```

**Make executable**:
```bash
chmod +x scripts/extract_pr_reviews.sh
chmod +x scripts/fetch_pr_reviews.sh
chmod +x scripts/review_integration_loop.sh
```

---

## Success Metrics

**Track these KPIs**:
1. **% of PRs with extracted findings**: Target 100%
2. **% of critical findings fixed in same iteration**: Target 80%+
3. **Avg time from review to fix**: Target <24 hours
4. **Repeat issue rate**: Target <10% (same issue across 2+ PRs)

**Review quarterly**: Are we closing PRs without wasting review cycles?

---

## Common Scenarios

### Scenario 1: Critical Security Issue Found
**CodeRabbit flags**: 🔴 CRITICAL - Missing authorization check

**Action**:
```bash
# Extract prompt
./scripts/fetch_pr_reviews.sh 11
cat /tmp/pr11_prompts.txt

# Apply fix immediately
<apply fix>

# Push and re-run reviews
git push origin <BRANCH>
sleep 90
./scripts/fetch_pr_reviews.sh 11  # Verify fixed
```

---

### Scenario 2: Many Low-Priority Items
**CodeRabbit flags**: 15 trivial code style issues

**Action**:
```bash
# Extract all findings
./scripts/extract_pr_reviews.sh 11

# Create backlog issue
gh issue create \
  --title "Code style cleanup from PR #11" \
  --body-file docs/PR11_ACTION_ITEMS.md \
  --label "low-priority,tech-debt"

# Close PR, reference issue
gh pr close 11 --comment "Findings extracted to #<ISSUE_NUM>"
```

---

### Scenario 3: PR Too Large for Sourcery
**Sourcery says**: "PR larger than 150,000 diff characters"

**Action**:
```bash
# Split PR into smaller chunks
git checkout -b feature/part-1
# cherry-pick first half of commits
git push origin feature/part-1

git checkout -b feature/part-2
# cherry-pick second half
git push origin feature/part-2

# Now Sourcery can review both
```

---

## FAQ

**Q: What if I forget to run extraction before closing PR?**
A: PR is closed but reviews are still accessible:
```bash
./scripts/extract_pr_reviews.sh <PR_NUMBER>
# Works even on closed PRs
```

**Q: Can I automate extraction on PR close?**
A: Yes, add GitHub Action:
```yaml
name: Extract Review Findings
on:
  pull_request:
    types: [closed]
jobs:
  extract:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Extract findings
        run: ./scripts/extract_pr_reviews.sh ${{ github.event.pull_request.number }}
      - name: Create issue
        run: |
          gh issue create \
            --title "PR #${{ github.event.pull_request.number }} findings" \
            --body-file docs/PR${{ github.event.pull_request.number }}_ACTION_ITEMS.md
```

**Q: What if critical finding is false positive?**
A: Document why in PR comment:
```bash
gh pr comment <PR_NUM> --body "@coderabbitai This is false positive because..."
```

---

## Next Steps

1. ✅ Create scripts:
   - `scripts/extract_pr_reviews.sh`
   - `scripts/fetch_pr_reviews.sh`
   - `scripts/review_integration_loop.sh`

2. ✅ Test on PR #11:
   - `./scripts/extract_pr_reviews.sh 11`
   - Verify `docs/PR11_ACTION_ITEMS.md` created
   - Review findings for accuracy

3. ✅ Document in CLAUDE.md:
   - Add "Review Integration Workflow" section
   - Link to this file
   - Make mandatory for all PRs

4. ✅ Train team:
   - Show workflow in team meeting
   - Add to onboarding docs
   - Enforce via PR checklist template

---

**Document Version**: 1.0
**Last Updated**: 2025-12-16
**Maintained By**: CC (Claude Code)
**Status**: ACTIVE - Use for all PRs
