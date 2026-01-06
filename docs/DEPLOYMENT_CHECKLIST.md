# Deployment Checklist

**Created:** 2026-01-06 2248 EET  
**Agent:** PPLX (Perplexity)  
**Purpose:** Standard verification steps for every deployment (PR merge → production)

---

## Pre-Merge Checks (Before Clicking "Merge PR")

### 1. Code Quality
☐ **Lint passes:** `pnpm lint` returns 0 errors  
☐ **Build succeeds:** `pnpm build` completes without errors  
☐ **Types valid:** No TypeScript errors in output  
☐ **Docstring coverage:** ≥80% (check pre-commit hook output)

**Commands:**
```bash
cd ~/projects/hex-test-drive-man
pnpm lint
pnpm build
```

---

### 2. Code Review
☐ **CodeRabbit issues:** All CRITICAL/BLOCKER issues resolved  
☐ **Sourcery suggestions:** Reviewed and applied/dismissed  
☐ **Sonar violations:** No new HIGH/CRITICAL security issues  
☐ **Snyk vulnerabilities:** No new HIGH/CRITICAL CVEs introduced

**Check:** PR comments from automated reviewers

---

### 3. Testing
☐ **Browser test:** Affected pages load without errors  
☐ **Console clean:** No React errors, warnings acceptable  
☐ **Network tab:** API calls succeed (200/201 status)  
☐ **Mobile responsive:** Test viewport < 768px

**Critical Pages:**
- Catalog: `https://hex-test-drive-man.vercel.app/en`
- Vehicle detail: Pick any slug from catalog
- Compare: Add 2-3 vehicles
- Booking flow: Test OTP entry (skip SMS)

---

### 4. Performance Budget
☐ **Bundle size:** Check Vercel preview deployment  
☐ **Lighthouse score:** Run on preview URL (FCP, LCP, TBT)  
☐ **Image optimization:** Verify next/image used (not raw `<img>`)  
☐ **Lazy loading:** Heavy components deferred

**Commands:**
```bash
# Get preview URL from PR
npx lighthouse [preview-url] --only-categories=performance

# Compare bundle size
# Check Vercel deployment logs for bundle analysis
```

---

### 5. Documentation
☐ **CLAUDE.md updated:** Session added to Section 8  
☐ **PERFORMANCE_LOG updated:** If task ≥15 min  
☐ **Agent MD updated:** BLACKBOX.md (BB) or GEMINI.md (GC)  
☐ **README updated:** If public API or setup changed

**Verification:**
```bash
# Check CLAUDE.md timestamp
head -3 CLAUDE.md | grep "Last Updated"

# Should be within 24 hours of now
```

---

### 6. Git Hygiene
☐ **Branch up-to-date:** `git log HEAD..origin/main` returns nothing  
☐ **No merge conflicts:** PR shows "Ready to merge"  
☐ **Commit messages:** Follow conventional format (`type(scope): description`)  
☐ **GPG signing:** Not required (user preference)

**Commands:**
```bash
git fetch origin
git log HEAD..origin/main --oneline
# If ANY commits shown, rebase first
```

---

## Merge Execution

### Merge Method Selection

**Squash Merge (Preferred):**
- Use for: Feature PRs, bug fixes, most cases
- Result: Single clean commit in main
- Command: `gh pr merge {number} --squash --delete-branch`

**Rebase Merge:**
- Use for: Preserving detailed commit history
- Result: All commits replayed on main
- Command: `gh pr merge {number} --rebase --delete-branch`

**Merge Commit (Rare):**
- Use for: Multi-feature PRs with significant branches
- Result: Merge commit + all branch commits
- Command: `gh pr merge {number} --merge --delete-branch`

**Default for this project:** Squash

---

### Merge Command Template

```bash
# Option 1: GitHub CLI (from WSL)
gh pr merge {PR_NUMBER} --squash --delete-branch

# Option 2: GitHub Web UI
# Click "Squash and merge" button
# Delete branch checkbox: checked

# Option 3: MCP Tool (via PPLX)
# User approves, PPLX calls mcp_tool_github-mcp-direct_merge_pull_request
```

---

## Post-Merge Verification (Within 5 min)

### 1. Deployment Status
☐ **Vercel triggered:** Check [Vercel dashboard](https://vercel.com/techhypexps-projects/hex-test-drive-man)  
☐ **Build succeeds:** Deployment status = "Ready"  
☐ **Domain updated:** Production URL reflects new commit  
☐ **Preview cleaned:** Old preview deployments archived

**Timeline:**
- Build start: < 30 seconds after push
- Build duration: 2-3 minutes
- Total: ~3-4 minutes push → live

---

### 2. Production Smoke Test

☐ **Catalog loads:** `https://getmytestdrive.com/en`  
☐ **No errors:** F12 Console shows no red errors  
☐ **Feature works:** Test specific functionality from PR  
☐ **RTL intact:** Test Arabic locale `/ar` (if applicable)

**Critical Test Matrix:**
| Feature | EN Test | AR Test | Mobile Test |
|---------|---------|---------|-------------|
| Catalog grid | ☐ | ☐ | ☐ |
| Filter panel | ☐ | ☐ | ☐ |
| Vehicle detail | ☐ | ☐ | ☐ |
| Compare (2-3) | ☐ | ☐ | ☐ |
| Booking flow | ☐ | ☐ | ☐ |

---

### 3. Error Monitoring

☐ **Sentry dashboard:** Check for new errors  
☐ **Error rate:** Should remain < 1% (check last 1 hour)  
☐ **No regressions:** No new error types introduced  
☐ **Alert volume:** No spike in Slack/email alerts

**Sentry URL:** [Check project dashboard](https://sentry.io)  
**Filter:** Last 1 hour, environment: production

---

### 4. Performance Audit (If Performance PR)

☐ **Lighthouse re-run:** Compare before/after scores  
☐ **FCP improvement:** Verify claimed improvement (e.g., 48%)  
☐ **LCP improvement:** Check largest contentful paint  
☐ **Bundle size:** Verify reduction (check Vercel logs)

**Commands:**
```bash
# Baseline (before merge)
npx lighthouse https://getmytestdrive.com/en --only-categories=performance > before.json

# After merge (wait 5 min for deployment)
npx lighthouse https://getmytestdrive.com/en --only-categories=performance > after.json

# Compare
# FCP before: X.XXs, after: Y.YYs
# LCP before: X.XXs, after: Y.YYs
# Improvement: (X-Y)/X * 100%
```

---

### 5. Documentation Update

☐ **CLAUDE.md Section 5:** Move task from "PRIORITY" to "RECENTLY COMPLETED"  
☐ **Deployment logged:** Add to Session Timeline if significant  
☐ **Metrics recorded:** Update impact analysis doc (if exists)  
☐ **GitHub PR closed:** Verify PR status = "Merged"

---

## Rollback Procedure (If Issues Found)

### Severity 1: Critical Production Failure
**Symptoms:** 500 errors, white screen, app unusable  
**Action:** IMMEDIATE ROLLBACK

**Commands:**
```bash
# Option 1: Revert merge commit
git revert -m 1 {merge_commit_sha}
git push origin main

# Option 2: Vercel instant rollback
# Go to Vercel dashboard → Deployments → Click previous deployment → "Promote to Production"
```

**Timeline:** < 2 minutes

---

### Severity 2: Feature Broken (Non-Critical)
**Symptoms:** One feature broken, rest of app works  
**Action:** HOTFIX or ROLLBACK (depends on complexity)

**Decision Matrix:**
- Fix < 15 min: Create hotfix PR
- Fix > 15 min: Rollback, fix offline, re-deploy

---

### Severity 3: Performance Regression
**Symptoms:** Slow load, high LCP, bundle bloat  
**Action:** INVESTIGATE (no immediate rollback)

**Steps:**
1. Run Lighthouse audit (quantify regression)
2. Check Sentry for new slow API calls
3. Review Vercel bundle analysis
4. Create follow-up task for optimization
5. Rollback only if regression > 50%

---

## Agent-Specific Checklists

### CC (Claude Code)
**Extra Checks:**
- ☐ Architecture impact assessed
- ☐ Breaking changes documented
- ☐ Migration script provided (if DB changes)
- ☐ Self-audit complete (if own PR)

### GC (Gemini CLI)
**Extra Checks:**
- ☐ Large refactor tested end-to-end
- ☐ Git operations verified (no orphaned branches)
- ☐ GEMINI.md synced from CLAUDE.md

### BB (Blackbox)
**Extra Checks:**
- ☐ Browser test screenshots attached
- ☐ Playwright tests passing (if added)
- ☐ BLACKBOX.md updated
- ☐ Sandbox checkpoint saved

### PPLX (Perplexity)
**Extra Checks:**
- ☐ Strategic docs created (if coordination task)
- ☐ Multi-agent handoff clear
- ☐ User approval obtained (for writes)

---

## Success Criteria

**Deployment is SUCCESSFUL if:**
1. ✅ All pre-merge checks pass
2. ✅ Build succeeds on Vercel
3. ✅ Production smoke test passes
4. ✅ Sentry shows no new errors (1 hour)
5. ✅ Performance budget maintained (if perf PR)
6. ✅ Documentation updated

**If any fail:** Investigate immediately, rollback if critical

---

## Lessons Learned (Living Section)

### Jan 6, 2026: PR #27 Merge Conflict
**Problem:** Branch based on old main, conflicts in BLACKBOX.md + PERFORMANCE_LOG.md  
**Solution:** `git checkout --theirs` + `git rebase --continue`  
**Prevention:** Always rebase before merge, accept main's version if file already updated

---

**Checklist Status:** ACTIVE  
**Next Update:** After every deployment issue (add to Lessons Learned)  
**Owner:** All agents (use this checklist for every PR merge)
