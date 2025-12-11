#!/bin/bash
set -euo pipefail

SONAR_URL="https://sonarcloud.io"
PROJECT_KEY="Hex-Tech-Lab_hex-test-drive-man"
SONAR_TOKEN="${SONAR_TOKEN:-}"

mkdir -p data/results/sonarqube

if [ -z "$SONAR_TOKEN" ]; then
  echo "❌ SONAR_TOKEN not set; export SONAR_TOKEN=your_sonarcloud_token" >&2
  exit 1
fi

echo "🔍 Fetching SonarCloud BLOCKER/CRITICAL issues for ${PROJECT_KEY}..."

curl -sSf -u "${SONAR_TOKEN}:" \
  "${SONAR_URL}/api/issues/search?componentKeys=${PROJECT_KEY}&severities=BLOCKER,CRITICAL&ps=500" \
  -o data/results/sonarqube/sonarcloud_blocker_critical.json

ISSUE_COUNT=$(jq '.total' data/results/sonarqube/sonarcloud_blocker_critical.json)
echo "✅ Exported ${ISSUE_COUNT} BLOCKER/CRITICAL issues to data/results/sonarqube/sonarcloud_blocker_critical.json"
