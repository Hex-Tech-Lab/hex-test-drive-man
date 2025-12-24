## 2025-12-24 1958 EET - User - Husky Pre-Commit Fix
**Duration**: 30 min (offline troubleshooting)
**Outcome**: Success - pnpm PATH issue resolved
**Files**: `~/.config/husky/init.sh` (created), `.husky/pre-commit` (unchanged)
**Metrics**: Hook now runs successfully, docstring gate enforces ≥80%
**Blockers**: None
**Lessons**: Git hooks need explicit PATH setup; docstring coverage now enforced
## 2025-12-25 0043 EET - GC - Security Fix + Housekeeping (Option A)
**Duration**: 15 minutes (stopped early at Phase 4 - PR review blocker)
**Outcome**: Partial Success
**Files Modified**: 
- extraction_engine/requirements.txt (filelock 3.20.0 → 3.20.1, CVE-2025-68146)
- BLACKBOX.md (updated commit ref 096622f, added Section 14 audit history)

**Metrics**: 
- ✅ 1 HIGH CVE fixed (commit 096622f)
- ✅ BLACKBOX.md synced (commit d103330)
- ❌ PR#21 BLOCKED (unsafe to merge - 268 files, deleted images/configs)

**Blockers**: 
1. PR#21 scope mismatch: Title says "Image Coverage Tool" but includes:
   - Deleted 154 vehicle images (hero/hover dirs)
   - Deleted .env.example, eslint.config.js, RUN_E2E_TEST.sh
   - CLAUDE/GEMINI/BLACKBOX.md massive rewrites (2500+ lines each)
   - API route changes (bookings, health, OTP)
2. GitHub API rate limit (403) prevented diff review via `gh pr diff`
3. Requires CC manual review before merge

**Lessons**: 
- Always verify PR scope matches title (git diff --stat caught massive discrepancy)
- GitHub rate limits require local branch inspection as fallback
- Throttled prompts (800K TPM, 4K output) successfully avoided rate limit errors

**Next Actions**:
1. CC to review PR#21 commit history (c77bf2e to 61fd880, 10 commits)
2. Determine if PR should be: REJECTED (scope creep) or SPLIT (coverage tool + refactors)
3. If rejected: Cherry-pick commit 61fd880 (image coverage tool only)
4. Complete Option A: Merge safe version of PR#21, delete branch

**Time Saved**: 10 min (stopped before bad merge), timebox: 25 min (stopped at 15 min)
