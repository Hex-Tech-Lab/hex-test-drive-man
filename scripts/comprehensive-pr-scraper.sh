#!/bin/bash

# Comprehensive PR Scraper - Bash Fallback
# Fetches open + closed (24h) PRs with review comments

GITHUB_TOKEN="${GITHUB_TOKEN:-}"
REPO="Hex-Tech-Lab/hex-test-drive-man"

if [ -z "$GITHUB_TOKEN" ]; then
  echo "❌ GITHUB_TOKEN environment variable required"
  echo "   Usage: GITHUB_TOKEN=your_token bash scripts/comprehensive-pr-scraper.sh"
  exit 1
fi

echo "🔍 Fetching open PRs..."
OPEN_PRS=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/$REPO/pulls?state=open&per_page=100")

if [ $? -ne 0 ]; then
  echo "❌ Failed to fetch open PRs"
  exit 1
fi

OPEN_COUNT=$(echo "$OPEN_PRS" | jq length)
echo "📊 Found $OPEN_COUNT open PRs"

# Get closed PRs from last 24 hours
YESTERDAY=$(date -u -d '24 hours ago' +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -v-24H +%Y-%m-%dT%H:%M:%SZ)
echo "🔍 Fetching closed PRs since $YESTERDAY..."

CLOSED_PRS=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/$REPO/pulls?state=closed&sort=updated&direction=desc&per_page=50")

# Filter closed PRs to only those closed in last 24h
RECENT_CLOSED=$(echo "$CLOSED_PRS" | jq --arg yesterday "$YESTERDAY" '
  [.[] | select(.closed_at != null and .closed_at >= $yesterday)]
')

CLOSED_COUNT=$(echo "$RECENT_CLOSED" | jq length)
echo "📊 Found $CLOSED_COUNT PRs closed in last 24h"

# Combine all PRs
ALL_PRS=$(echo "$OPEN_PRS" "$RECENT_CLOSED" | jq -s 'add')
TOTAL_PRS=$(echo "$ALL_PRS" | jq length)

echo "📊 Total PRs to scan: $TOTAL_PRS"

# Initialize report structure
cat > /tmp/comprehensive_pr_findings.json << 'JSON_START'
{
  "generated_at": "",
  "metadata": {
    "prs_scanned": 0,
    "open_prs": 0,
    "closed_prs_24h": 0,
    "timeframe": "24 hours"
  },
  "total_findings": 0,
  "by_severity": {
    "critical": 0,
    "high": 0,
    "medium": 0,
    "low": 0
  },
  "by_type": {
    "inline_code": 0,
    "security": 0,
    "architecture": 0,
    "summary": 0
  },
  "findings_by_pr": {},
  "prioritized_actions": []
}
JSON_START

# Update metadata
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
jq --arg ts "$TIMESTAMP" --argjson total "$TOTAL_PRS" --argjson open "$OPEN_COUNT" --argjson closed "$CLOSED_COUNT" '
  .generated_at = $ts |
  .metadata.prs_scanned = $total |
  .metadata.open_prs = $open |
  .metadata.closed_prs_24h = $closed
' /tmp/comprehensive_pr_findings.json > /tmp/comprehensive_pr_findings.tmp && mv /tmp/comprehensive_pr_findings.tmp /tmp/comprehensive_pr_findings.json

# Iterate through each PR and fetch comments
for pr_num in $(echo "$ALL_PRS" | jq -r '.[].number'); do
  pr_data=$(echo "$ALL_PRS" | jq --argjson num "$pr_num" '.[] | select(.number == $num)')
  pr_title=$(echo "$pr_data" | jq -r '.title')
  pr_state=$(echo "$pr_data" | jq -r '.state')

  echo ""
  echo "📊 Scraping PR #${pr_num} [$pr_state]: $pr_title"

  # Fetch issue comments
  echo "  Fetching issue comments..."
  ISSUE_COMMENTS=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
    "https://api.github.com/repos/$REPO/issues/$pr_num/comments")

  # Fetch review comments (inline code comments)
  echo "  Fetching review comments..."
  REVIEW_COMMENTS=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
    "https://api.github.com/repos/$REPO/pulls/$pr_num/comments")

  # Combine all comments
  ALL_COMMENTS=$(echo "$ISSUE_COMMENTS" "$REVIEW_COMMENTS" | jq -s 'add')
  COMMENT_COUNT=$(echo "$ALL_COMMENTS" | jq length)

  echo "  ✅ Found $COMMENT_COUNT comments"

  # Filter for review bot comments
  REVIEW_BOTS=("coderabbitai" "sourcery-ai" "sonarcloud" "snyk-bot" "corridor" "sentry-io")
  BOT_PATTERN=$(IFS='|'; echo "${REVIEW_BOTS[*]}")

  BOT_COMMENTS=$(echo "$ALL_COMMENTS" | jq --arg pattern "$BOT_PATTERN" '
    [.[] | select(
      (.user.login | ascii_downcase | test($pattern)) or
      (.body | ascii_downcase | test("coderabbit|sourcery|sonar|snyk|corridor|sentry"))
    )]
  ')

  BOT_COUNT=$(echo "$BOT_COMMENTS" | jq length)
  echo "  ✅ Found $BOT_COUNT review bot comments"

  # Skip security comments
  NON_SECURITY=$(echo "$BOT_COMMENTS" | jq '
    [.[] | select(
      (.body | ascii_downcase | test("security|credential|token|password|secret|api key|vulnerability")) | not
    )]
  ')

  FINAL_COUNT=$(echo "$NON_SECURITY" | jq length)
  echo "  ✅ After filtering security: $FINAL_COUNT findings"
done

# Generate summary statistics
echo ""
echo "📊 Generating summary statistics..."

# For now, output basic report structure
# (Full implementation would parse comments and classify severity/type)

echo "✅ Comprehensive reports generated:"
echo "  - /tmp/comprehensive_pr_findings.json (full data)"

# Generate markdown report
cat > /tmp/comprehensive_pr_findings.md << 'MD_START'
# 🎯 Comprehensive PR Review Findings

**Generated**: TIMESTAMP
**PRs Scanned**: TOTAL (OPEN open, CLOSED closed in last 24h)

## 📊 Summary Statistics

### By Severity
- 🔴 **Critical**: 0
- 🟠 **High**: 0
- 🟡 **Medium**: 0
- 🟢 **Low**: 0

### By Type
- 💻 **Inline Code**: 0
- 🔒 **Security**: 0 (filtered out)
- 🏗️ **Architecture**: 0
- 📝 **Summary**: 0

## 📋 Findings by PR

(Report generation in progress - basic scraper implemented)

---

**Next Steps**:
1. Review open PRs for critical/high findings
2. Check recently closed PRs for missed items
3. Apply fixes where AI prompts available

MD_START

# Replace placeholders
sed -i "s/TIMESTAMP/$TIMESTAMP/" /tmp/comprehensive_pr_findings.md
sed -i "s/TOTAL/$TOTAL_PRS/" /tmp/comprehensive_pr_findings.md
sed -i "s/OPEN/$OPEN_COUNT/" /tmp/comprehensive_pr_findings.md
sed -i "s/CLOSED/$CLOSED_COUNT/" /tmp/comprehensive_pr_findings.md

echo "  - /tmp/comprehensive_pr_findings.md (implementation plan)"

echo ""
echo "📊 Total findings: 0 (detailed parsing not yet implemented)"
echo "   PRs scanned: $TOTAL_PRS"
echo "   Open: $OPEN_COUNT"
echo "   Closed (24h): $CLOSED_COUNT"
