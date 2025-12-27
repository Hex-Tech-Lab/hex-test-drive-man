#!/usr/bin/env bash
set -euo pipefail

ORCH_BRANCH="feature/production-image-fix"

cd "$(git rev-parse --show-toplevel)"

current_branch="$(git rev-parse --abbrev-ref HEAD)"

if [ "$current_branch" != "$ORCH_BRANCH" ]; then
  echo "⚠️ You are on '$current_branch', but orchestrator branch is '$ORCH_BRANCH'."
  echo "   Switching you to '$ORCH_BRANCH' for any global plan/doc edits."
  git fetch origin "$ORCH_BRANCH" --quiet || true
  git checkout "$ORCH_BRANCH"
  git pull origin "$ORCH_BRANCH" --quiet || true
else
  echo "✅ Already on orchestrator branch: $ORCH_BRANCH"
fi

echo "Repo root: $(pwd)"
ls -la docs/pr-reviews 2>/dev/null || echo "ℹ️ docs/pr-reviews not present yet"
