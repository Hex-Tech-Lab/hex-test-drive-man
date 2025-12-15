# Branch & PR Cleanup - 2025-12-14

**Session**: GC Housekeeping
**Date**: 2025-12-15 (Execution)
**Agent**: Gemini Code (GC)

---

## 1. PR Audit & Actions

| PR # | Title | Status | Action | Rationale |
|------|-------|--------|--------|-----------|
| #10 | [Snyk] Security upgrade next 15.4.8 -> 15.4.10 | Open | **Keep** | Minor security patch. Safe to review. |
| #9 | [Snyk] Security upgrade eslint 8.57.0 -> 9.0.0 | **CLOSED** | **Close** | Major breaking change (v9). Config format incompatibility. |

---

## 2. Local Branch Cleanup Plan

| Branch Name | Last Commit | Status | Action |
|-------------|-------------|--------|--------|
| `main` | 2025-12-15 | Active | **Keep** |
| `hex-ai/claude-md-master` | 2025-12-14 | Recent | **Keep** |
| `claude/add-vehicle-images-01NSbdxDBV46zFzfBtQM1oLQ` | 2025-12-07 | Unmerged | **KEEP** (Has unique feature: vehicle hero/hover images) |
| `feature/sync-nov8-24-complete-work` | 2025-11-25 | Unmerged | **KEEP** (Has unique fixes) |
| `feature/fix-i18n-navigation-20251124-1402` | 2025-11-24 | Unmerged | **KEEP** (Has unique history) |
| `backup/pr1-20251125-0039` | 2025-11-24 | Unmerged | **KEEP** (Has unique history) |
| `feature/gpg-commit-signing-20251124-1400` | 2025-11-24 | Unmerged | **KEEP** (Has unique history) |

---

## 3. Remote Branch Cleanup Plan

### Deleted (Executed)
- `origin/snyk-fix-5289010e1c41a14c804d9a879fe8e988` (Assoc. with closed PR #9)
- `origin/coderabbitai/docstrings/acd34cf` (Stale bot branch)

### Protected / Recent (Keep)
- `origin/main`
- `origin/claude/sync-agent-instructions-015BBjkGH1Syq5uEU6r2uGCg` (Active Session)
- `origin/hex-ai/claude-md-master`
- `origin/snyk-fix-295a2844350a549361d1c0044b26562f` (Assoc. with PR #10)
- `origin/claude/booking-flow-otp-kyc-01N4AuNR1MG1Fs2PWvFBPCSA` (Recent feature, Dec 11)
- `origin/chore/repo-housekeeping` (Dec 10)
- `origin/claude/merge-booking-fix-reviews-01WBq5uUC1F8zRMNQLz3pqJH` (Review needed)

### Stale (Review Required - DO NOT DELETE)
*These branches contain "Initialize" commits or potential parallel history from Project Start (Nov 2025).*
- `origin/claude/separate-lint-build-docs-01KoprSHsEkHoVZgaUnbVB6N`
- `origin/add-claude-github-actions-1764703170829`
- `origin/feature/sync-nov8-24-complete-work`
- `origin/feature/fix-i18n-navigation-20251124-1402`
- `origin/fix/locale-single-source-v2`
- `origin/fix/infinite-loop-filter-dependencies`
- `origin/fix/catalog-empty-hydration`
- `origin/fix/venue-query-no-city`
- `origin/fix/hotfix-venue-query`
- `origin/feature/mvp0-critical-fixes-and-enhancements`
- `origin/feature/fix-critical-bugs-supabase-persistence`
- `origin/fix/complete-data-migration`
- `origin/feature/add-sentry-error-tracking`
- `origin/feature/security-fix-gitignore`
- `origin/hotfix/add-analytics-dependencies`
- `origin/feature/add-vercel-analytics-speed-insights`
- `origin/feature/add-agents-md-and-project-setup`