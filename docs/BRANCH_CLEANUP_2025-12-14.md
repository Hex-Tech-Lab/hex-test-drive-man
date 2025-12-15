# Branch & PR Cleanup - 2025-12-14

**Session**: GC Housekeeping
**Date**: 2025-12-15 (Execution)
**Agent**: Gemini Code (GC)

---

## 1. PR Audit & Actions

| PR # | Title | Status | Action | Rationale |
|------|-------|--------|--------|-----------|
| #10 | [Snyk] Security upgrade next 15.4.8 -> 15.4.10 | Open | **Keep** | Minor security patch. Safe to review. |
| #9 | [Snyk] Security upgrade eslint 8.57.0 -> 9.0.0 | Open | **CLOSE** | Major breaking change (v9). Config format incompatibility. |

---

## 2. Local Branch Cleanup Plan

| Branch Name | Last Commit | Status | Action |
|-------------|-------------|--------|--------|
| `main` | 2025-12-15 | Active | **Keep** |
| `hex-ai/claude-md-master` | 2025-12-14 | Recent | **Keep** |
| `claude/add-vehicle-images-01NSbdxDBV46zFzfBtQM1oLQ` | 2025-12-07 | Stale/Gone | **Delete** |
| `feature/sync-nov8-24-complete-work` | 2025-11-25 | Stale | **Delete** |
| `feature/fix-i18n-navigation-20251124-1402` | 2025-11-24 | Stale | **Delete** |
| `backup/pr1-20251125-0039` | 2025-11-24 | Stale | **Delete** |
| `feature/gpg-commit-signing-20251124-1400` | 2025-11-24 | Stale | **Delete** |

---

## 3. Remote Branch Cleanup Plan

### Protected / Recent (Keep)
- `origin/main`
- `origin/claude/sync-agent-instructions-015BBjkGH1Syq5uEU6r2uGCg` (Active Session)
- `origin/hex-ai/claude-md-master`
- `origin/snyk-fix-295a2844350a549361d1c0044b26562f` (Assoc. with PR #10)
- `origin/claude/booking-flow-otp-kyc-01N4AuNR1MG1Fs2PWvFBPCSA` (Recent feature, Dec 11)
- `origin/chore/repo-housekeeping` (Dec 10)

### Stale / Obsolete (Delete)
| Branch Name | Last Commit | Rationale |
|-------------|-------------|-----------|
| `origin/snyk-fix-5289010e1c41a14c804d9a879fe8e988` | 2025-12-11 | Associated with PR #9 (Closing) |
| `origin/coderabbitai/docstrings/acd34cf` | 2025-12-08 | Stale bot branch |
| `origin/claude/separate-lint-build-docs-01KoprSHsEkHoVZgaUnbVB6N` | 2025-12-07 | Stale (>1 week) |
| `origin/add-claude-github-actions-1764703170829` | 2025-12-02 | Stale (>2 weeks) |
| `origin/feature/sync-nov8-24-complete-work` | 2025-11-25 | Stale |
| `origin/feature/fix-i18n-navigation-20251124-1402` | 2025-11-24 | Stale |
| `origin/fix/locale-single-source-v2` | 2025-11-11 | Ancient |
| `origin/fix/infinite-loop-filter-dependencies` | 2025-11-11 | Ancient |
| `origin/fix/catalog-empty-hydration` | 2025-11-11 | Ancient |
| `origin/fix/venue-query-no-city` | 2025-11-11 | Ancient |
| `origin/fix/hotfix-venue-query` | 2025-11-11 | Ancient |
| `origin/feature/mvp0-critical-fixes-and-enhancements` | 2025-11-11 | Ancient |
| `origin/feature/fix-critical-bugs-supabase-persistence` | 2025-11-11 | Ancient |
| `origin/fix/complete-data-migration` | 2025-11-11 | Ancient |
| `origin/feature/add-sentry-error-tracking` | 2025-11-11 | Ancient |
| `origin/feature/security-fix-gitignore` | 2025-11-11 | Ancient |
| `origin/hotfix/add-analytics-dependencies` | 2025-11-11 | Ancient |
| `origin/feature/add-vercel-analytics-speed-insights` | 2025-11-11 | Ancient |
| `origin/feature/add-agents-md-and-project-setup` | 2025-11-11 | Ancient |

### Needs Review (Ask User)
- `origin/claude/merge-booking-fix-reviews-01WBq5uUC1F8zRMNQLz3pqJH` (Dec 08) - Unmerged feature work?