#!/bin/bash

# Enhanced Comprehensive PR Scraper - Bash with Full Extraction
# Handles DNS issues with Octokit, uses curl + jq for parsing

set -e

GITHUB_TOKEN="${GITHUB_TOKEN:-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}"
REPO="Hex-Tech-Lab/hex-test-drive-man"
API_BASE="https://api.github.com"

echo "🚀 Starting comprehensive PR scrape (Bash Enhanced)..."
echo ""

# Fetch open PRs
echo "📊 Fetching open PRs..."
OPEN_PRS=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "$API_BASE/repos/$REPO/pulls?state=open&per_page=100")

if [ $? -ne 0 ] || [ -z "$OPEN_PRS" ]; then
  echo "❌ Failed to fetch open PRs"
  exit 1
fi

OPEN_COUNT=$(echo "$OPEN_PRS" | jq length)
echo "  Found: $OPEN_COUNT open PRs"

# Fetch recently closed PRs (24h)
YESTERDAY=$(date -u -d '24 hours ago' +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -v-24H +%Y-%m-%dT%H:%M:%SZ)
echo "📊 Fetching closed PRs since $YESTERDAY..."

CLOSED_PRS=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "$API_BASE/repos/$REPO/pulls?state=closed&sort=updated&direction=desc&per_page=20")

RECENT_CLOSED=$(echo "$CLOSED_PRS" | jq --arg yesterday "$YESTERDAY" '
  [.[] | select(.closed_at != null and .closed_at >= $yesterday)]
')

CLOSED_COUNT=$(echo "$RECENT_CLOSED" | jq length)
echo "  Found: $CLOSED_COUNT PRs closed in last 24h"

# Combine and filter out dependency PRs
ALL_PRS=$(echo "$OPEN_PRS" "$RECENT_CLOSED" | jq -s 'add | [.[] | select(.title | test("^\\[Snyk\\]|^Bump |^chore\\(deps\\)") | not)]')
TOTAL_PRS=$(echo "$ALL_PRS" | jq length)

echo "📊 Total PRs to scan (excluding deps): $TOTAL_PRS"
echo ""

# Initialize findings array
FINDINGS='[]'

CRITICAL_COUNT=0
HIGH_COUNT=0
MEDIUM_COUNT=0
LOW_COUNT=0
INFO_COUNT=0

# Process each PR
for pr_num in $(echo "$ALL_PRS" | jq -r '.[].number'); do
  PR_DATA=$(echo "$ALL_PRS" | jq --argjson num "$pr_num" '.[] | select(.number == $num)')
  PR_TITLE=$(echo "$PR_DATA" | jq -r '.title')

  echo "📝 Scanning PR #${pr_num}: $PR_TITLE"

  # Fetch all comment types
  ISSUE_COMMENTS=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
    "$API_BASE/repos/$REPO/issues/$pr_num/comments")

  REVIEW_COMMENTS=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
    "$API_BASE/repos/$REPO/pulls/$pr_num/comments")

  REVIEWS=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
    "$API_BASE/repos/$REPO/pulls/$pr_num/reviews")

  # Process issue comments (summaries)
  BOT_COMMENTS=$(echo "$ISSUE_COMMENTS" | jq '[.[] | select(.user.type == "Bot")]')
  COMMENT_COUNT=$(echo "$BOT_COMMENTS" | jq length)

  # Process review comments (inline)
  BOT_REVIEW_COMMENTS=$(echo "$REVIEW_COMMENTS" | jq '[.[] | select(.user.type == "Bot")]')
  REVIEW_COMMENT_COUNT=$(echo "$BOT_REVIEW_COMMENTS" | jq length)

  # Process reviews
  BOT_REVIEWS=$(echo "$REVIEWS" | jq '[.[] | select(.user.type == "Bot" and .body != null and .body != "")]')
  REVIEW_COUNT=$(echo "$BOT_REVIEWS" | jq length)

  TOTAL_COMMENTS=$((COMMENT_COUNT + REVIEW_COMMENT_COUNT + REVIEW_COUNT))
  echo "  ✅ Found $TOTAL_COMMENTS bot comments ($COMMENT_COUNT issue + $REVIEW_COMMENT_COUNT review + $REVIEW_COUNT summaries)"

  # Extract findings with severity classification
  # Process issue comments
  echo "$BOT_COMMENTS" | jq -r '.[] | @json' | while IFS= read -r comment; do
    BODY=$(echo "$comment" | jq -r '.body')
    URL=$(echo "$comment" | jq -r '.html_url')
    ID=$(echo "$comment" | jq -r '.id')
    USER=$(echo "$comment" | jq -r '.user.login')

    # Determine severity
    if echo "$BODY" | grep -qi "🔴\|critical\|blocker\|security vulnerability"; then
      SEVERITY="critical"
      ((CRITICAL_COUNT++))
    elif echo "$BODY" | grep -qi "🟠\|high\|important\|data loss"; then
      SEVERITY="high"
      ((HIGH_COUNT++))
    elif echo "$BODY" | grep -qi "medium\|moderate"; then
      SEVERITY="medium"
      ((MEDIUM_COUNT++))
    elif echo "$BODY" | grep -qi "low\|minor"; then
      SEVERITY="low"
      ((LOW_COUNT++))
    else
      SEVERITY="info"
      ((INFO_COUNT++))
    fi

    # Determine tool
    TOOL="Unknown"
    if echo "$USER" | grep -qi "coderabbit"; then TOOL="CodeRabbit"
    elif echo "$USER" | grep -qi "sourcery"; then TOOL="Sourcery"
    elif echo "$USER" | grep -qi "corridor"; then TOOL="Corridor"
    elif echo "$USER" | grep -qi "snyk"; then TOOL="Snyk"
    elif echo "$USER" | grep -qi "sonar"; then TOOL="Sonar"
    fi

    # Extract issue (first meaningful line)
    ISSUE=$(echo "$BODY" | sed 's/^[_*]*⚠️[_*]*.*//' | sed 's/^[_*]*🔴[_*]*.*//' | sed 's/^[_*]*🟠[_*]*.*//' | grep -v '^#' | grep -v '^```' | grep -v '^<' | grep -v '^---' | head -1 | cut -c1-200)

    # Extract recommendation (look for action verbs)
    RECOMMENDATION=$(echo "$BODY" | grep -Eoi "(Add|Create|Update|Change|Modify|Fix|Remove|Implement)[^.]+[.]" | head -1 | cut -c1-300 || echo "$BODY" | head -1 | cut -c1-250)

    # Build finding JSON
    FINDING=$(jq -n \
      --argjson pr "$pr_num" \
      --arg tool "$TOOL" \
      --arg severity "$SEVERITY" \
      --arg issue "$ISSUE" \
      --arg recommendation "$RECOMMENDATION" \
      --arg url "$URL" \
      --argjson id "$ID" \
      '{pr_number: $pr, tool: $tool, type: "summary", severity: $severity, issue: $issue, recommendation: $recommendation, comment_url: $url, comment_id: $id}')

    FINDINGS=$(echo "$FINDINGS" | jq ". += [$FINDING]")
  done

  # Process review comments (inline code)
  echo "$BOT_REVIEW_COMMENTS" | jq -r '.[] | @json' | while IFS= read -r comment; do
    BODY=$(echo "$comment" | jq -r '.body')
    URL=$(echo "$comment" | jq -r '.html_url')
    ID=$(echo "$comment" | jq -r '.id')
    USER=$(echo "$comment" | jq -r '.user.login')
    FILE=$(echo "$comment" | jq -r '.path')
    LINE=$(echo "$comment" | jq -r '.line // .original_line')

    # Determine severity
    if echo "$BODY" | grep -qi "🔴\|critical\|blocker"; then
      SEVERITY="critical"
      ((CRITICAL_COUNT++))
    elif echo "$BODY" | grep -qi "🟠\|high\|important"; then
      SEVERITY="high"
      ((HIGH_COUNT++))
    elif echo "$BODY" | grep -qi "medium\|moderate"; then
      SEVERITY="medium"
      ((MEDIUM_COUNT++))
    elif echo "$BODY" | grep -qi "low\|minor"; then
      SEVERITY="low"
      ((LOW_COUNT++))
    else
      SEVERITY="info"
      ((INFO_COUNT++))
    fi

    # Determine tool
    TOOL="Unknown"
    if echo "$USER" | grep -qi "coderabbit"; then TOOL="CodeRabbit"
    elif echo "$USER" | grep -qi "sourcery"; then TOOL="Sourcery"
    elif echo "$USER" | grep -qi "corridor"; then TOOL="Corridor"
    fi

    # Extract issue
    ISSUE=$(echo "$BODY" | head -1 | cut -c1-200)
    RECOMMENDATION=$(echo "$BODY" | grep -Eoi "(Add|Create|Update|Change|Fix)[^.]+[.]" | head -1 || echo "$BODY" | head -3 | tail -1 | cut -c1-250)

    # Build finding
    FINDING=$(jq -n \
      --argjson pr "$pr_num" \
      --arg tool "$TOOL" \
      --arg severity "$SEVERITY" \
      --arg file "$FILE" \
      --arg line "$LINE" \
      --arg issue "$ISSUE" \
      --arg recommendation "$RECOMMENDATION" \
      --arg url "$URL" \
      --argjson id "$ID" \
      '{pr_number: $pr, tool: $tool, type: "inline_code", severity: $severity, file: $file, lines: $line, issue: $issue, recommendation: $recommendation, comment_url: $url, comment_id: $id}')

    FINDINGS=$(echo "$FINDINGS" | jq ". += [$FINDING]")
  done
done

# Sort findings by severity
FINDINGS=$(echo "$FINDINGS" | jq '[.[] | . + {severity_order: (if .severity == "critical" then 0 elif .severity == "high" then 1 elif .severity == "medium" then 2 elif .severity == "low" then 3 else 4 end)}] | sort_by(.severity_order)')

TOTAL_FINDINGS=$(echo "$FINDINGS" | jq length)

echo ""
echo "📊 Extraction complete!"
echo "  Total Findings: $TOTAL_FINDINGS"
echo "  Critical: $CRITICAL_COUNT"
echo "  High: $HIGH_COUNT"
echo "  Medium: $MEDIUM_COUNT"
echo "  Low: $LOW_COUNT"
echo "  Info: $INFO_COUNT"
echo ""

# Generate JSON report
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

REPORT=$(jq -n \
  --arg ts "$TIMESTAMP" \
  --argjson prs "$TOTAL_PRS" \
  --argjson open "$OPEN_COUNT" \
  --argjson closed "$CLOSED_COUNT" \
  --argjson total "$TOTAL_FINDINGS" \
  --argjson critical "$CRITICAL_COUNT" \
  --argjson high "$HIGH_COUNT" \
  --argjson medium "$MEDIUM_COUNT" \
  --argjson low "$LOW_COUNT" \
  --argjson info "$INFO_COUNT" \
  --argjson findings "$FINDINGS" \
  '{
    metadata: {
      generated_at: $ts,
      prs_scanned: $prs,
      prs_open: $open,
      prs_closed_recent: $closed
    },
    total_findings: $total,
    by_severity: {
      critical: $critical,
      high: $high,
      medium: $medium,
      low: $low,
      info: $info
    },
    findings: $findings
  }')

echo "$REPORT" > /tmp/comprehensive_pr_findings.json
echo "✅ JSON saved: /tmp/comprehensive_pr_findings.json"

# Generate Markdown report
{
  echo "# Actionable Implementation Plan from PR Reviews (v3 - Multi-PR)"
  echo ""
  echo "**Generated**: $TIMESTAMP"
  echo "**PRs Scanned**: $TOTAL_PRS ($OPEN_COUNT open, $CLOSED_COUNT recently closed)"
  echo "**Total Findings**: $TOTAL_FINDINGS"
  echo ""
  echo "## Summary by Severity"
  echo "- Critical: $CRITICAL_COUNT"
  echo "- High: $HIGH_COUNT"
  echo "- Medium: $MEDIUM_COUNT"
  echo "- Low: $LOW_COUNT"
  echo "- Info: $INFO_COUNT"
  echo ""

  # Critical findings
  if [ $CRITICAL_COUNT -gt 0 ]; then
    echo "## 1. Critical Implementation Tasks ($CRITICAL_COUNT)"
    echo ""
    echo "**Priority**: Highest. These must be fixed before any other work."
    echo ""
    echo "---"
    echo ""

    echo "$FINDINGS" | jq -r '.[] | select(.severity == "critical") | @json' | {
      counter=1
      while IFS= read -r finding; do
        ISSUE=$(echo "$finding" | jq -r '.issue')
        PR=$(echo "$finding" | jq -r '.pr_number')
        TOOL=$(echo "$finding" | jq -r '.tool')
        TYPE=$(echo "$finding" | jq -r '.type')
        FILE=$(echo "$finding" | jq -r '.file // empty')
        LINE=$(echo "$finding" | jq -r '.lines // empty')
        RECOMMENDATION=$(echo "$finding" | jq -r '.recommendation')
        URL=$(echo "$finding" | jq -r '.comment_url')

        echo "### 1.$counter. [CRITICAL] $ISSUE"
        echo "- **PR**: #$PR"
        echo "- **Tool**: $TOOL"
        echo "- **Focus Area**: $(echo $TYPE | tr '_' ' ' | tr '[:lower:]' '[:upper:]')"
        [ -n "$FILE" ] && echo "- **File**: $FILE$([ -n "$LINE" ] && echo " (Line $LINE)" || echo "")"
        echo "- **Impact**: BLOCKER"
        echo ""
        echo "#### Implementation Plan:"
        echo "$RECOMMENDATION"
        echo ""
        echo "- **URL**: [View Comment]($URL)"
        echo ""
        echo "---"
        echo ""

        ((counter++))
      done
    }
  fi

  # High findings
  if [ $HIGH_COUNT -gt 0 ]; then
    echo "## 2. High-Impact Implementation Tasks ($HIGH_COUNT)"
    echo ""
    echo "**Priority**: High. Fix after all Criticals are resolved."
    echo ""
    echo "---"
    echo ""

    echo "$FINDINGS" | jq -r '.[] | select(.severity == "high") | @json' | {
      counter=1
      while IFS= read -r finding; do
        ISSUE=$(echo "$finding" | jq -r '.issue')
        PR=$(echo "$finding" | jq -r '.pr_number')
        TOOL=$(echo "$finding" | jq -r '.tool')
        FILE=$(echo "$finding" | jq -r '.file // empty')
        LINE=$(echo "$finding" | jq -r '.lines // empty')
        RECOMMENDATION=$(echo "$finding" | jq -r '.recommendation')
        URL=$(echo "$finding" | jq -r '.comment_url')

        echo "### 2.$counter. [HIGH] $ISSUE"
        echo "- **PR**: #$PR"
        echo "- **Tool**: $TOOL"
        [ -n "$FILE" ] && echo "- **File**: $FILE$([ -n "$LINE" ] && echo " (Line $LINE)" || echo "")"
        echo ""
        echo "$RECOMMENDATION"
        echo ""
        echo "- **URL**: [View Comment]($URL)"
        echo ""
        echo "---"
        echo ""

        ((counter++))
      done
    }
  fi
} > /tmp/comprehensive_pr_findings.md

echo "✅ Markdown saved: /tmp/comprehensive_pr_findings.md"
echo ""
