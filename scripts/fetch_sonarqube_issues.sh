#!/bin/bash
SONAR_URL="http://localhost:9000"  # Adjust if different
PROJECT_KEY="hex-test-drive-man"
SONAR_TOKEN="${SONAR_TOKEN}"  # Set via: export SONAR_TOKEN=your_token

curl -u "${SONAR_TOKEN}:" \
  "${SONAR_URL}/api/issues/search?componentKeys=${PROJECT_KEY}&severities=BLOCKER,CRITICAL&ps=500" \
  -o data/results/sonarqube_issues.json

echo "✅ SonarQube issues exported to data/results/sonarqube_issues.json"
