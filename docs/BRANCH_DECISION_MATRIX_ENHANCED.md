# Branch Decision Matrix - Enhanced Analysis

**Generated:** 2025-12-15 22:20 EET  
**Purpose:** Comprehensive branch review before any deletions

## Decision Matrix

| # | Branch | Last Commit | Days Old | Unique Commits | Files Changed | Migrations | Critical Files | Merge Conflict | Recommendation | Justification |
|---|--------|-------------|----------|----------------|---------------|------------|----------------|----------------|----------------|---------------|
| 1 | `add-claude-github-actions-1764703170829` | 2025-12-02 | 13 | 2 | 2 | 00 | workflows(2) | ✅ NO | 🔍 INVESTIGATE | Changes present - quick review recommended |
| 2 | `claude/booking-flow-otp-kyc-01N4AuNR1MG1Fs2PWvFBPCSA` | 2025-12-11 | 4 | 1 | 2 | 00 | none | ✅ NO | 🔍 INVESTIGATE | Changes present - quick review recommended |
| 3 | `claude/merge-booking-fix-reviews-01WBq5uUC1F8zRMNQLz3pqJH` | 2025-12-08 | 7 | 1 | 4 | 1 | migrations(1), src(2) | ✅ NO | ⚠️ INVESTIGATE | Contains DB migrations - high risk if lost |
| 4 | `claude/separate-lint-build-docs-01KoprSHsEkHoVZgaUnbVB6N` | 2025-12-07 | 8 | 1 | 3 | 00 | none | ✅ NO | 🔍 INVESTIGATE | Changes present - quick review recommended |
| 5 | `claude/sync-agent-instructions-015BBjkGH1Syq5uEU6r2uGCg` | 2025-12-15 | 0 | 17 | 17 | 00 | src(3), config(1) | ✅ NO | 📋 REVIEW | Significant changes - manual review needed |
| 6 | `feature/add-agents-md-and-project-setup` | 2025-11-11 | 34 | 1 | 00 | 00 | none | ✅ NO | 🔍 INVESTIGATE | Changes present - quick review recommended |
| 7 | `feature/add-sentry-error-tracking` | 2025-11-11 | 34 | 1 | 00 | 00 | none | ✅ NO | 🔍 INVESTIGATE | Changes present - quick review recommended |
| 8 | `feature/add-vercel-analytics-speed-insights` | 2025-11-11 | 34 | 1 | 00 | 00 | none | ✅ NO | 🔍 INVESTIGATE | Changes present - quick review recommended |
| 9 | `feature/fix-critical-bugs-supabase-persistence` | 2025-11-11 | 34 | 1 | 00 | 00 | none | ✅ NO | 🔍 INVESTIGATE | Changes present - quick review recommended |
| 10 | `feature/fix-i18n-navigation-20251124-1402` | 2025-11-24 | 21 | 38 | 00 | 00 | none | ✅ NO | 🔍 INVESTIGATE | Changes present - quick review recommended |
| 11 | `feature/mvp0-critical-fixes-and-enhancements` | 2025-11-11 | 34 | 1 | 00 | 00 | none | ✅ NO | 🔍 INVESTIGATE | Changes present - quick review recommended |
| 12 | `feature/security-fix-gitignore` | 2025-11-11 | 34 | 1 | 00 | 00 | none | ✅ NO | 🔍 INVESTIGATE | Changes present - quick review recommended |
| 13 | `feature/sync-nov8-24-complete-work` | 2025-11-25 | 20 | 33 | 23 | 00 | src(12), config(2), workflows(1) | ✅ NO | 📋 REVIEW | Significant changes - manual review needed |
| 14 | `fix/catalog-empty-hydration` | 2025-11-11 | 34 | 1 | 00 | 00 | none | ✅ NO | 🔍 INVESTIGATE | Changes present - quick review recommended |
| 15 | `fix/complete-data-migration` | 2025-11-11 | 34 | 1 | 00 | 00 | none | ✅ NO | 🔍 INVESTIGATE | Changes present - quick review recommended |
| 16 | `fix/hotfix-venue-query` | 2025-11-11 | 34 | 1 | 00 | 00 | none | ✅ NO | 🔍 INVESTIGATE | Changes present - quick review recommended |
| 17 | `fix/infinite-loop-filter-dependencies` | 2025-11-11 | 34 | 1 | 00 | 00 | none | ✅ NO | 🔍 INVESTIGATE | Changes present - quick review recommended |
| 18 | `fix/locale-single-source-v2` | 2025-11-11 | 34 | 1 | 00 | 00 | none | ✅ NO | 🔍 INVESTIGATE | Changes present - quick review recommended |
| 19 | `fix/venue-query-no-city` | 2025-11-11 | 34 | 1 | 00 | 00 | none | ✅ NO | 🔍 INVESTIGATE | Changes present - quick review recommended |
| 20 | `hex-ai/claude-md-master` | 2025-12-12 | 3 | 1 | 1 | 00 | none | ✅ NO | 🔍 INVESTIGATE | Changes present - quick review recommended |
| 21 | `hotfix/add-analytics-dependencies` | 2025-11-11 | 34 | 1 | 00 | 00 | none | ✅ NO | 🔍 INVESTIGATE | Changes present - quick review recommended |
| 22 | `multi-launch-7dQKENLA-1765806088482-blackbox` | 2025-12-15 | 0 | 1 | 1 | 00 | none | ✅ NO | 🔍 INVESTIGATE | Changes present - quick review recommended |
| 23 | `snyk-fix-295a2844350a549361d1c0044b26562f` | 2025-12-13 | 2 | 1 | 2 | 00 | config(1) | ✅ NO | 📋 REVIEW | Significant changes - manual review needed |

---

## Legend

**Recommendations:**
- ⚠️ INVESTIGATE: High-value or high-risk changes (migrations, core features)
- 📋 REVIEW: Moderate changes requiring manual review before decision
- 🔍 INVESTIGATE: Low-impact changes needing quick verification
- 🗑️ REVIEW: Stale branches (>60 days) - verify work not superseded
- ✅ DELETE: Safe to delete (merged or no unique commits)

**Critical Files:**
- migrations(N): Database migration files
- src(N): Source code files
- config(N): Configuration files
- workflows(N): CI/CD workflow files

---

## User Instructions

1. **Review each row** with all context columns
2. **Mark your decision** for each branch: KEEP | MERGE | INVESTIGATE | DELETE
3. **Share decisions** - I will execute only approved deletions

**No automatic deletions will occur without your explicit approval.**

