#!/bin/bash
# Automated E2E Test Runner
# Agent: CC

cd /home/user/hex-test-drive-man
git checkout ccw/fix-duplicate-otp-prevention
git pull origin ccw/fix-duplicate-otp-prevention

echo "🔧 Installing Playwright browsers..."
npx playwright install chromium

echo "🧪 Running E2E test..."
node scripts/e2e-otp-test.mjs

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ All tests passed - Ready to merge"
  cat E2E_TEST_REPORT.json
else
  echo "❌ Tests failed - Check E2E_TEST_REPORT.json and error-screenshot.png"
  cat E2E_TEST_REPORT.json
fi

exit $EXIT_CODE
