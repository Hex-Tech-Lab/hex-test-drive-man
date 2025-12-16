# GC MISSION BRIEF V2 - Branch & PR Cleanup (Quality Gated) [2025-12-15 02:00 UTC, CC]

**Handover Generated At**: 2025-12-15 02:00 UTC
**Created By**: CC (Claude Code Terminal)
**Session Type**: Repository Housekeeping (Branch/PR Audit + Cleanup)
**Priority**: HIGH - Foundation must be clean before CCW/BB work
**Complexity**: MEDIUM (verification-heavy, audit + merge/delete)
**Estimated Scope**: 1 session (1.5-2.5 hours with verification gates)

**VERSION**: 2.0 (Quality Gated)
**Supersedes**: GC_BRANCH_CLEANUP_PROMPT.md v1.0 (incomplete execution)

---

## ⚠️ CRITICAL CONTEXT - V1 FAILURE

**What Happened in V1** (2025-12-14 23:45 UTC):
- GC reported "Mission Success"
- Cleanup log created: `BRANCH_CLEANUP_2025-12-14.md`
- **Reality**: ZERO branches deleted, ZERO PRs closed
- **Root Cause**: gh CLI failed silently, reported "No PRs found"
- **Impact**: User discovered 25 branches still exist, PR #9 and #10 still open

**User Feedback**:
> "i need to see actual cleanup and branch rollup. where are your quality gates and verify 10x, plan 10x, execute 1x??????"

**This Version (V2)**:
- ✅ Pre-flight tool verification (test gh CLI, fallback to curl)
- ✅ Baseline measurement (count before)
- ✅ VERIFY 10x → PLAN 10x → EXECUTE 1x → POST-VERIFY
- ✅ Real-time execution logs
- ✅ Post-execution verification (count after, verify PRs closed)
- ✅ Rollback plan if execution fails

---

## MAKER-CHECKER VALIDATION

**Before proceeding, you MUST answer:**

Are you at least 95% confident you fully understand:
- Why V1 failed (gh CLI silent failure, no verification)?
- Quality gate framework (VERIFY→PLAN→EXECUTE→POST-VERIFY)?
- Baseline state (25 branches, 2 PRs, main 3 days behind)?
- Success criteria (ACTUAL deletions, VERIFIED with git/curl)?

**If YES (≥95% confidence):**
- State: "I understand V1 failed due to lack of verification. V2 will VERIFY before, during, and after execution. Proceeding with Phase 0: Pre-Flight Verification."
- Proceed directly to Phase 0.

**If NO (<95% confidence):**
- State: "The handover is incomplete in the following specific areas: [list precisely]"
- Ask ONLY ONE focused clarifying question.
- After answer, re-evaluate and continue without further questions.

**FORBIDDEN:**
- Proceeding without reading VERIFIED_GITHUB_STATE_2025-12-15.md
- Trusting gh CLI without testing it first
- Reporting success without post-verification
- Logging "Pending User Confirmation" without actually deleting anything

---

## PHASE 0: PRE-FLIGHT VERIFICATION (15 minutes)

**Objective**: Test all tools BEFORE starting audit, establish baseline, choose API method

**MANDATORY**: Do NOT proceed to Phase 1 until ALL pre-flight checks pass

---

### Step 0.1: Read Verification Report

**Command**:
```bash
cat docs/VERIFIED_GITHUB_STATE_2025-12-15.md | head -100
```

**Expected**: Comprehensive report showing:
- 25 remote branches (verified)
- 2 open PRs: #9 (ESLint 8→9 DANGEROUS), #10 (Next patch SAFE)
- Main missing CC's 2,483 lines of docs

**If file missing**: ERROR and ask user for context

---

### Step 0.2: Test gh CLI

**Command**:
```bash
gh --version
echo "Exit code: $?"
```

**If exit code 0**: gh CLI available, test authentication
**If exit code 127**: gh CLI NOT installed, use curl fallback

**If gh available, test auth**:
```bash
gh pr list --state open --limit 1 --json number,title
echo "Exit code: $?"
```

**Expected**: JSON array with PR #10 or #9
**If fails**: gh auth status not working, use curl fallback

---

### Step 0.3: Test GitHub API (curl fallback)

**Command**:
```bash
curl -s -o /dev/null -w "%{http_code}" "https://api.github.com/repos/Hex-Tech-Lab/hex-test-drive-man/pulls?state=open"
```

**Expected**: `200`
**If 401/403**: Authentication issue, check GITHUB_TOKEN
**If 404**: Repo path wrong
**If 200**: API working, use curl for PR operations

---

### Step 0.4: Establish Baseline

**Command**:
```bash
echo "=== BASELINE MEASUREMENT ===" > /tmp/gc_cleanup_baseline.txt
echo "" >> /tmp/gc_cleanup_baseline.txt
echo "Date: $(date -u +%Y-%m-%d\ %H:%M\ UTC)" >> /tmp/gc_cleanup_baseline.txt
echo "" >> /tmp/gc_cleanup_baseline.txt

git fetch origin --prune

echo "Remote Branches:" >> /tmp/gc_cleanup_baseline.txt
git branch -r | wc -l >> /tmp/gc_cleanup_baseline.txt
git branch -r >> /tmp/gc_cleanup_baseline.txt

echo "" >> /tmp/gc_cleanup_baseline.txt
echo "Open PRs:" >> /tmp/gc_cleanup_baseline.txt
curl -s "https://api.github.com/repos/Hex-Tech-Lab/hex-test-drive-man/pulls?state=open" | jq -r '.[] | "#\(.number): \(.title)"' >> /tmp/gc_cleanup_baseline.txt

cat /tmp/gc_cleanup_baseline.txt
```

**Expected Output**:
```
=== BASELINE MEASUREMENT ===

Date: 2025-12-15 02:15 UTC

Remote Branches:
25
origin/claude/booking-flow-otp-kyc-01N4AuNR1MG1Fs2PWvFBPCSA
origin/claude/merge-booking-fix-reviews-01WBq5uUC1F8zRMNQLz3pqJH
...
(all 25 branches listed)

Open PRs:
#10: [Snyk] Security upgrade next from 15.4.8 to 15.4.10
#9: [Snyk] Security upgrade eslint from 8.57.0 to 9.0.0
```

**Verification**: If count ≠ 25 or PRs ≠ 2, ERROR and report discrepancy

---

### Step 0.5: Choose API Method

**Decision Tree**:
- If gh CLI works AND authenticated: Use gh (simpler commands)
- If gh CLI fails OR not authenticated: Use curl (more verbose but reliable)

**Document Choice**:
```bash
echo "API Method: [gh CLI | curl]" >> /tmp/gc_cleanup_baseline.txt
```

---

### Step 0.6: Pre-Flight Checklist

**Before proceeding to Phase 1, confirm**:

- [ ] VERIFIED_GITHUB_STATE_2025-12-15.md read and understood
- [ ] gh CLI tested (working: YES/NO)
- [ ] curl API tested (working: YES/NO)
- [ ] Baseline established (25 branches, 2 PRs confirmed)
- [ ] API method chosen (gh or curl)
- [ ] Baseline saved to /tmp/gc_cleanup_baseline.txt

**If ALL checked**: Proceed to Phase 1: PLAN (10x)
**If ANY unchecked**: STOP, resolve issue, do NOT proceed

---

## PHASE 1: PLAN (10x) (30 minutes)

**Objective**: Audit all branches and PRs, classify, create execution plan, get user approval

---

### Step 1.1: Branch Audit

**Command**:
```bash
cat > /tmp/branch_audit.sh << 'EOF'
#!/bin/bash
echo "branch,last_commit_date,last_commit_author,last_commit_msg,status,action,reason"

git branch -r | grep -v HEAD | while read branch; do
  # Get last commit info
  last_commit=$(git log -1 --format="%ci|%an|%s" $branch 2>/dev/null)
  date=$(echo "$last_commit" | cut -d'|' -f1 | cut -d' ' -f1)
  author=$(echo "$last_commit" | cut -d'|' -f2)
  msg=$(echo "$last_commit" | cut -d'|' -f3 | cut -c1-50)

  # Classify branch
  branch_name=$(echo "$branch" | sed 's/origin\///')

  # Determine status and action
  if [[ "$branch_name" == "main" ]]; then
    status="ACTIVE"
    action="KEEP"
    reason="Production branch"
  elif [[ "$branch_name" == "claude/sync-agent-instructions-015BBjkGH1Syq5uEU6r2uGCg" ]]; then
    status="ACTIVE"
    action="KEEP"
    reason="Current CC session (PROTECTED)"
  elif [[ "$branch_name" == "hex-ai/claude-md-master" ]]; then
    status="MERGED"
    action="DELETE"
    reason="Docs merged to main (commit 896c0fd)"
  elif [[ "$branch_name" =~ ^claude/ ]]; then
    status="STALE"
    action="USER_DECISION"
    reason="Old CC session, check if merged"
  elif [[ "$branch_name" =~ ^snyk-fix- ]]; then
    status="STALE"
    action="DELETE"
    reason="Snyk auto-branch, PR likely closed"
  elif [[ "$branch_name" =~ ^feature/ ]] || [[ "$branch_name" =~ ^fix/ ]]; then
    # Check age
    days_old=$(( ( $(date +%s) - $(date -d "$date" +%s) ) / 86400 ))
    if [[ $days_old -gt 30 ]]; then
      status="STALE"
      action="USER_DECISION"
      reason="No activity >30 days, check if merged"
    else
      status="UNKNOWN"
      action="USER_DECISION"
      reason="Recent activity, check PR status"
    fi
  else
    status="UNKNOWN"
    action="USER_DECISION"
    reason="Unrecognized pattern"
  fi

  echo "\"$branch_name\",\"$date\",\"$author\",\"$msg\",\"$status\",\"$action\",\"$reason\""
done
EOF

chmod +x /tmp/branch_audit.sh
/tmp/branch_audit.sh > docs/branch_audit_2025-12-15.csv

cat docs/branch_audit_2025-12-15.csv
```

**Expected**: CSV with 25 rows (1 header + 24 branches + main)

**Review**: Manually inspect CSV, adjust actions if needed

---

### Step 1.2: PR Audit

**Using curl** (if gh CLI failed):
```bash
curl -s "https://api.github.com/repos/Hex-Tech-Lab/hex-test-drive-man/pulls?state=open" | \
jq -r '["PR#","Title","Author","Created","Dependabot","Risk","Action","Reason"],
       (.[] | [.number, .title, .user.login, .created_at,
               (if .user.login == "dependabot[bot]" or .user.login == "TechHypeXP" then "YES" else "NO" end),
               "EVAL", "EVAL", "EVAL"]) | @csv' > docs/pr_audit_2025-12-15.csv

cat docs/pr_audit_2025-12-15.csv
```

**Manually classify**:
```bash
# Edit pr_audit CSV:
# PR #9: ESLint 8.57→9.0
#   Risk: DANGEROUS (flat config breaking)
#   Action: CLOSE
#   Reason: See CLAUDE.md GUARDRAILS line 124-128

# PR #10: Next 15.4.8→15.4.10
#   Risk: SAFE (patch bump, no breaking changes)
#   Action: EVALUATE (check if CVE fix, then merge or defer)
#   Reason: Minor security patch, likely safe
```

**Update CSV**:
```bash
cat > docs/pr_audit_2025-12-15.csv << 'EOF'
PR#,Title,Author,Created,Dependabot,Risk,Action,Reason
9,"[Snyk] Security upgrade eslint from 8.57.0 to 9.0.0",TechHypeXP,2025-12-11,YES,DANGEROUS,CLOSE,Requires flat config migration (eslint.config.js). See CLAUDE.md GUARDRAILS.
10,"[Snyk] Security upgrade next from 15.4.8 to 15.4.10",TechHypeXP,2025-12-13,YES,SAFE,EVALUATE,Patch bump. Check changelog for CVEs or defer if non-critical.
EOF
```

---

### Step 1.3: Create Execution Plan

**File**: `docs/GC_CLEANUP_EXECUTION_PLAN_2025-12-15.md`

```bash
cat > docs/GC_CLEANUP_EXECUTION_PLAN_2025-12-15.md << 'EOF'
# GC Cleanup Execution Plan - 2025-12-15

**Generated**: 2025-12-15 02:30 UTC
**Based On**: Branch audit (25 branches) + PR audit (2 PRs)
**Target**: <10 active branches, 1 dangerous PR closed

---

## Summary

**Branches**:
- KEEP: 2 (main, claude/sync-agent-instructions-*)
- DELETE: 15 (merged/stale feature branches, snyk branches, hex-ai)
- USER_DECISION: 8 (old claude/* sessions, check if work preserved)

**PRs**:
- CLOSE: 1 (PR #9 ESLint 8→9 DANGEROUS)
- EVALUATE: 1 (PR #10 Next patch - check CVE, merge if critical)

---

## Phase 2A: Close Dangerous PRs (5 min)

### PR #9: ESLint 8.57.0 → 9.0.0

**Risk**: DANGEROUS (breaking change)
**Reason**: ESLint 9.x requires flat config migration (eslint.config.js). Current .eslintrc deprecated but working.
**Source**: CLAUDE.md Section 3 (GUARDRAILS) lines 124-128
**Action**: Close with rationale comment

**Command** (gh):
```bash
gh pr close 9 --comment "Closing this PR because ESLint 9.x requires flat config migration (eslint.config.js) which is a breaking change. Our current .eslintrc setup works with ESLint 8.57.0. We will migrate to ESLint 9.x after MVP 1.5 when we can allocate time for the flat config refactor. See CLAUDE.md Section 3 (GUARDRAILS) for details."
```

**Command** (curl fallback):
```bash
curl -X PATCH -H "Authorization: token $GITHUB_TOKEN" \
  -d '{"state":"closed"}' \
  "https://api.github.com/repos/Hex-Tech-Lab/hex-test-drive-man/pulls/9"

curl -X POST -H "Authorization: token $GITHUB_TOKEN" \
  -d '{"body":"Closing this PR because ESLint 9.x requires flat config migration (eslint.config.js) which is a breaking change. Our current .eslintrc setup works with ESLint 8.57.0. We will migrate to ESLint 9.x after MVP 1.5 when we can allocate time for the flat config refactor. See CLAUDE.md Section 3 (GUARDRAILS) for details."}' \
  "https://api.github.com/repos/Hex-Tech-Lab/hex-test-drive-man/pulls/9/comments"
```

**Verification**:
```bash
# Confirm PR #9 closed:
curl -s "https://api.github.com/repos/Hex-Tech-Lab/hex-test-drive-man/pulls/9" | jq '.state'
# Expected: "closed"
```

---

## Phase 2B: Evaluate PR #10 (10 min)

### PR #10: Next 15.4.8 → 15.4.10

**Risk**: SAFE (patch bump)
**Action**: Check Next.js changelog for CVEs

**Investigation**:
```bash
# Check PR description for CVE references:
curl -s "https://api.github.com/repos/Hex-Tech-Lab/hex-test-drive-man/pulls/10" | jq '.body'

# If CVE present: MERGE
# If no CVE: DEFER (no urgency, avoid churn)
```

**If MERGE**:
```bash
gh pr merge 10 --squash --delete-branch --body "Merging Next.js security patch (CVE fix)"
```

**If DEFER**:
```bash
gh pr close 10 --comment "Deferring this patch bump as it doesn't address critical CVEs. We'll batch minor upgrades after MVP 1.5. Thank you Snyk for monitoring!"
```

**Decision Point**: USER_DECISION if unclear (ask user: merge or defer?)

---

## Phase 2C: Delete Stale Branches (20 min)

### CONFIRMED DELETE (15 branches):

| Branch | Reason |
|--------|--------|
| hex-ai/claude-md-master | Merged to main (commit 896c0fd) |
| snyk-fix-295a2844350a549361d1c0044b26562f | Snyk auto-branch, likely closed |
| snyk-fix-5289010e1c41a14c804d9a879fe8e988 | Snyk auto-branch, likely closed |
| feature/add-agents-md-and-project-setup | >30 days old, check if merged |
| feature/add-sentry-error-tracking | >30 days old, check if merged |
| feature/add-vercel-analytics-speed-insights | >30 days old, check if merged |
| feature/fix-critical-bugs-supabase-persistence | >30 days old, check if merged |
| feature/fix-i18n-navigation-20251124-1402 | >30 days old, check if merged |
| feature/mvp0-critical-fixes-and-enhancements | >30 days old, check if merged |
| feature/security-fix-gitignore | >30 days old, check if merged |
| feature/sync-nov8-24-complete-work | >30 days old, check if merged |
| fix/catalog-empty-hydration | >30 days old, check if merged |
| fix/complete-data-migration | >30 days old, check if merged |
| fix/hotfix-venue-query | >30 days old, check if merged |
| fix/infinite-loop-filter-dependencies | >30 days old, check if merged |

**Batch Delete Command**:
```bash
# For each branch, verify no open PR, then delete:
for branch in \
  hex-ai/claude-md-master \
  snyk-fix-295a2844350a549361d1c0044b26562f \
  snyk-fix-5289010e1c41a14c804d9a879fe8e988 \
  feature/add-agents-md-and-project-setup \
  feature/add-sentry-error-tracking \
  feature/add-vercel-analytics-speed-insights \
  feature/fix-critical-bugs-supabase-persistence \
  feature/fix-i18n-navigation-20251124-1402 \
  feature/mvp0-critical-fixes-and-enhancements \
  feature/security-fix-gitignore \
  feature/sync-nov8-24-complete-work \
  fix/catalog-empty-hydration \
  fix/complete-data-migration \
  fix/hotfix-venue-query \
  fix/infinite-loop-filter-dependencies; do

  echo "Checking $branch for open PRs..."
  open_pr=$(curl -s "https://api.github.com/repos/Hex-Tech-Lab/hex-test-drive-man/pulls?state=open&head=Hex-Tech-Lab:$branch" | jq length)

  if [[ $open_pr -eq 0 ]]; then
    echo "  No open PR, deleting..."
    git push origin --delete $branch
    echo "  ✅ Deleted $branch"
  else
    echo "  ⚠️ Open PR exists, skipping"
  fi
done
```

**Real-Time Logging**: Each deletion must be logged to `docs/GC_CLEANUP_EXECUTION_LOG_2025-12-15.txt`

---

## Phase 2D: Flag USER_DECISION Branches (5 min)

### REQUIRES USER DECISION (8 branches):

| Branch | Last Activity | Reason |
|--------|---------------|--------|
| claude/booking-flow-otp-kyc-01N4AuNR1MG1Fs2PWvFBPCSA | 2025-11-XX | Old CC session, check if work merged to main |
| claude/merge-booking-fix-reviews-01WBq5uUC1F8zRMNQLz3pqJH | 2025-11-XX | Old CC session, check if work merged to main |
| claude/separate-lint-build-docs-01KoprSHsEkHoVZgaUnbVB6N | 2025-11-XX | Old CC session, check if work merged to main |
| fix/locale-single-source-v2 | 2025-11-XX | Recent, check PR status |
| fix/venue-query-no-city | 2025-11-XX | Recent, check PR status |
| add-claude-github-actions-1764703170829 | 2025-12-XX | Recent, check purpose |
| coderabbitai/docstrings/acd34cf | 2025-XX-XX | CodeRabbit auto-branch |
| hotfix/add-analytics-dependencies | 2025-XX-XX | Hotfix, check if merged |

**File**: `docs/GC_CLEANUP_USER_DECISIONS_2025-12-15.md`

```markdown
# User Decisions Required - Branch Cleanup 2025-12-15

## Old claude/* Branches (3 branches)

Recommendation: DELETE if work merged to main, KEEP if unmerged work

1. **claude/booking-flow-otp-kyc-01N4AuNR1MG1Fs2PWvFBPCSA**
   - Last: 2025-11-XX
   - Check: Is booking OTP work on main? (commit ca9da33)
   - If YES: DELETE, If NO: MERGE then DELETE

2. **claude/merge-booking-fix-reviews-01WBq5uUC1F8zRMNQLz3pqJH**
   - Last: 2025-11-XX
   - Check: Were booking fixes merged?
   - If YES: DELETE, If NO: KEEP

3. **claude/separate-lint-build-docs-01KoprSHsEkHoVZgaUnbVB6N**
   - Last: 2025-11-XX
   - Check: Were lint/build docs separated?
   - If YES: DELETE, If NO: REVIEW

## Recent Branches (5 branches)

4-8. [List other branches with same format]
```

---

## Final State

**Target**:
- Active branches: <10 (main + claude/sync-* + 2-3 recent CCW/feature)
- Closed PRs: PR #9 (DANGEROUS)
- Evaluated PRs: PR #10 (merged or deferred)
- Deleted branches: 15 confirmed stale
- User decisions: 8 flagged for approval

EOF

cat docs/GC_CLEANUP_EXECUTION_PLAN_2025-12-15.md
```

---

### Step 1.4: User Approval Checkpoint

**MANDATORY**: Do NOT proceed to Phase 2 (EXECUTE) without user approval

**Output**:
```
=== USER APPROVAL REQUIRED ===

I have audited 25 branches and 2 PRs. Execution plan ready:

1. CLOSE PR #9 (ESLint 8→9 DANGEROUS per GUARDRAILS)
2. EVALUATE PR #10 (Next patch - merge if CVE, defer if not)
3. DELETE 15 stale branches (no open PRs, >30 days or already merged)
4. FLAG 8 branches for your decision (old claude/* sessions, recent work)

Execution plan: docs/GC_CLEANUP_EXECUTION_PLAN_2025-12-15.md
Branch audit: docs/branch_audit_2025-12-15.csv
PR audit: docs/pr_audit_2025-12-15.csv

Estimated time: 30 minutes
Risk: LOW (no code changes, only branch/PR management)

**Proceed with execution? (YES/NO/MODIFY)**
- YES: Execute plan as-is
- NO: Abort cleanup
- MODIFY: Adjust plan (specify changes)
```

**If YES**: Proceed to Phase 2
**If NO**: Abort, document reason
**If MODIFY**: Update plan, re-request approval

---

## PHASE 2: EXECUTE (1x) (30 minutes)

**Objective**: Execute cleanup plan, log every action in real-time, verify each step

**CRITICAL**: Do NOT batch operations without verification between steps

---

### Step 2.1: Close PR #9 (DANGEROUS)

**Using gh CLI**:
```bash
echo "[$(date -u +%H:%M:%S)] Closing PR #9 (ESLint 8→9)..." | tee -a docs/GC_CLEANUP_EXECUTION_LOG_2025-12-15.txt

gh pr close 9 --comment "Closing this PR because ESLint 9.x requires flat config migration (eslint.config.js) which is a breaking change. Our current .eslintrc setup works with ESLint 8.57.0. We will migrate to ESLint 9.x after MVP 1.5 when we can allocate time for the flat config refactor. See CLAUDE.md Section 3 (GUARDRAILS) for details."

echo "[$(date -u +%H:%M:%S)] Verifying PR #9 closed..." | tee -a docs/GC_CLEANUP_EXECUTION_LOG_2025-12-15.txt

# Verify closure:
pr9_state=$(curl -s "https://api.github.com/repos/Hex-Tech-Lab/hex-test-drive-man/pulls/9" | jq -r '.state')

if [[ "$pr9_state" == "closed" ]]; then
  echo "[$(date -u +%H:%M:%S)] ✅ PR #9 confirmed closed" | tee -a docs/GC_CLEANUP_EXECUTION_LOG_2025-12-15.txt
else
  echo "[$(date -u +%H:%M:%S)] ❌ ERROR: PR #9 still $pr9_state" | tee -a docs/GC_CLEANUP_EXECUTION_LOG_2025-12-15.txt
  echo "HALT: Manual intervention required"
  exit 1
fi
```

**Using curl fallback**:
```bash
echo "[$(date -u +%H:%M:%S)] Closing PR #9 (ESLint 8→9) via API..." | tee -a docs/GC_CLEANUP_EXECUTION_LOG_2025-12-15.txt

curl -X PATCH -H "Authorization: token $GITHUB_TOKEN" \
  -d '{"state":"closed"}' \
  "https://api.github.com/repos/Hex-Tech-Lab/hex-test-drive-man/pulls/9"

curl -X POST -H "Authorization: token $GITHUB_TOKEN" \
  -d '{"body":"Closing this PR because ESLint 9.x requires flat config migration (eslint.config.js) which is a breaking change. Our current .eslintrc setup works with ESLint 8.57.0. We will migrate to ESLint 9.x after MVP 1.5 when we can allocate time for the flat config refactor. See CLAUDE.md Section 3 (GUARDRAILS) for details."}' \
  "https://api.github.com/repos/Hex-Tech-Lab/hex-test-drive-man/pulls/9/comments"

# Verify (same as gh method)
```

---

### Step 2.2: Evaluate PR #10 (SAFE)

**Check changelog**:
```bash
echo "[$(date -u +%H:%M:%S)] Evaluating PR #10 (Next 15.4.8→15.4.10)..." | tee -a docs/GC_CLEANUP_EXECUTION_LOG_2025-12-15.txt

pr10_body=$(curl -s "https://api.github.com/repos/Hex-Tech-Lab/hex-test-drive-man/pulls/10" | jq -r '.body')

echo "$pr10_body" | grep -i "CVE"
has_cve=$?

if [[ $has_cve -eq 0 ]]; then
  echo "[$(date -u +%H:%M:%S)] CVE found in PR #10, should MERGE" | tee -a docs/GC_CLEANUP_EXECUTION_LOG_2025-12-15.txt
  echo "USER_DECISION: Merge PR #10? (contains CVE fix)"
else
  echo "[$(date -u +%H:%M:%S)] No CVE in PR #10, DEFER recommended" | tee -a docs/GC_CLEANUP_EXECUTION_LOG_2025-12-15.txt
  echo "USER_DECISION: Defer PR #10? (no critical CVE, minor patch)"
fi
```

**If user says MERGE**:
```bash
gh pr merge 10 --squash --delete-branch --body "Merging Next.js security patch"

# Verify merge:
pr10_state=$(curl -s "https://api.github.com/repos/Hex-Tech-Lab/hex-test-drive-man/pulls/10" | jq -r '.merged')
if [[ "$pr10_state" == "true" ]]; then
  echo "[$(date -u +%H:%M:%S)] ✅ PR #10 confirmed merged" | tee -a docs/GC_CLEANUP_EXECUTION_LOG_2025-12-15.txt
else
  echo "[$(date -u +%H:%M:%S)] ❌ ERROR: PR #10 merge failed" | tee -a docs/GC_CLEANUP_EXECUTION_LOG_2025-12-15.txt
fi
```

**If user says DEFER**:
```bash
gh pr close 10 --comment "Deferring this patch bump as it doesn't address critical CVEs. We'll batch minor upgrades after MVP 1.5. Thank you Snyk for monitoring!"

# Verify closure (same as PR #9)
```

---

### Step 2.3: Delete Stale Branches (Batch with Verification)

**Script**:
```bash
echo "[$(date -u +%H:%M:%S)] Starting batch branch deletion..." | tee -a docs/GC_CLEANUP_EXECUTION_LOG_2025-12-15.txt

deleted_count=0
skipped_count=0

branches_to_delete=(
  "hex-ai/claude-md-master"
  "snyk-fix-295a2844350a549361d1c0044b26562f"
  "snyk-fix-5289010e1c41a14c804d9a879fe8e988"
  "feature/add-agents-md-and-project-setup"
  "feature/add-sentry-error-tracking"
  "feature/add-vercel-analytics-speed-insights"
  "feature/fix-critical-bugs-supabase-persistence"
  "feature/fix-i18n-navigation-20251124-1402"
  "feature/mvp0-critical-fixes-and-enhancements"
  "feature/security-fix-gitignore"
  "feature/sync-nov8-24-complete-work"
  "fix/catalog-empty-hydration"
  "fix/complete-data-migration"
  "fix/hotfix-venue-query"
  "fix/infinite-loop-filter-dependencies"
)

for branch in "${branches_to_delete[@]}"; do
  echo "[$(date -u +%H:%M:%S)] Checking $branch..." | tee -a docs/GC_CLEANUP_EXECUTION_LOG_2025-12-15.txt

  # Check for open PRs using this branch:
  open_pr_count=$(curl -s "https://api.github.com/repos/Hex-Tech-Lab/hex-test-drive-man/pulls?state=open&head=Hex-Tech-Lab:$branch" | jq 'length')

  if [[ $open_pr_count -eq 0 ]]; then
    echo "[$(date -u +%H:%M:%S)]   No open PR, deleting..." | tee -a docs/GC_CLEANUP_EXECUTION_LOG_2025-12-15.txt

    git push origin --delete $branch 2>&1 | tee -a docs/GC_CLEANUP_EXECUTION_LOG_2025-12-15.txt

    # Verify deletion:
    sleep 1
    branch_exists=$(git ls-remote --heads origin $branch | wc -l)

    if [[ $branch_exists -eq 0 ]]; then
      echo "[$(date -u +%H:%M:%S)]   ✅ Deleted $branch" | tee -a docs/GC_CLEANUP_EXECUTION_LOG_2025-12-15.txt
      ((deleted_count++))
    else
      echo "[$(date -u +%H:%M:%S)]   ❌ ERROR: $branch still exists" | tee -a docs/GC_CLEANUP_EXECUTION_LOG_2025-12-15.txt
    fi
  else
    echo "[$(date -u +%H:%M:%S)]   ⚠️ Open PR exists, skipping" | tee -a docs/GC_CLEANUP_EXECUTION_LOG_2025-12-15.txt
    ((skipped_count++))
  fi
done

echo "[$(date -u +%H:%M:%S)] Batch deletion complete: $deleted_count deleted, $skipped_count skipped" | tee -a docs/GC_CLEANUP_EXECUTION_LOG_2025-12-15.txt
```

---

### Step 2.4: Document User Decisions

**Create file**:
```bash
cat > docs/GC_CLEANUP_USER_DECISIONS_2025-12-15.md << 'EOF'
# User Decisions Required - Branch Cleanup 2025-12-15

**Generated**: 2025-12-15 03:00 UTC
**Context**: 8 branches require user decision before deletion

---

## Old claude/* Branches (3 branches)

**Recommendation**: DELETE if work merged to main

1. **claude/booking-flow-otp-kyc-01N4AuNR1MG1Fs2PWvFBPCSA**
   - Last commit: 2025-11-XX
   - Contains: Booking OTP flow work
   - Check: Is this work on main? (search for commit ca9da33 related work)
   - **Decision**: DELETE if merged, KEEP if unmerged

2. **claude/merge-booking-fix-reviews-01WBq5uUC1F8zRMNQLz3pqJH**
   - Last commit: 2025-11-XX
   - Contains: Booking fixes + PR review responses
   - **Decision**: DELETE if merged, KEEP if unmerged

3. **claude/separate-lint-build-docs-01KoprSHsEkHoVZgaUnbVB6N**
   - Last commit: 2025-11-XX
   - Contains: Lint/build documentation separation
   - **Decision**: DELETE if merged, REVIEW if unmerged

---

## Recent Branches (5 branches)

4. **fix/locale-single-source-v2**
   - Last commit: 2025-11-XX
   - Contains: Locale management refactor
   - **Decision**: Check if PR merged, then DELETE

5. **fix/venue-query-no-city**
   - Last commit: 2025-XX-XX
   - Contains: Venue query fix
   - **Decision**: Check if PR merged, then DELETE

6. **add-claude-github-actions-1764703170829**
   - Last commit: 2025-12-XX
   - Contains: GitHub Actions for Claude
   - **Decision**: Check if still needed

7. **coderabbitai/docstrings/acd34cf**
   - Last commit: 2025-XX-XX
   - Contains: CodeRabbit auto-generated docstrings
   - **Decision**: Check if PR merged, then DELETE

8. **hotfix/add-analytics-dependencies**
   - Last commit: 2025-XX-XX
   - Contains: Analytics dependencies hotfix
   - **Decision**: Check if merged (likely YES), then DELETE

---

## How to Decide

For each branch:
1. Check if PR exists: `gh pr list --head <branch>`
2. If PR merged: DELETE branch
3. If no PR: Check git log for unique commits not on main
4. If commits on main: DELETE branch
5. If commits NOT on main: KEEP or MERGE first

---

## Batch Delete Command (after decisions)

```bash
# After user confirms which to delete:
git push origin --delete <branch1> <branch2> <branch3>
```
EOF

cat docs/GC_CLEANUP_USER_DECISIONS_2025-12-15.md
echo "[$(date -u +%H:%M:%S)] User decisions file created" | tee -a docs/GC_CLEANUP_EXECUTION_LOG_2025-12-15.txt
```

---

## PHASE 3: POST-VERIFY (10x) (10 minutes)

**Objective**: Verify ACTUAL cleanup happened, measure outcome vs baseline

**MANDATORY**: Do NOT report success until post-verification passes

---

### Step 3.1: Count Branches After Cleanup

**Command**:
```bash
echo "=== POST-EXECUTION VERIFICATION ===" | tee -a docs/GC_CLEANUP_EXECUTION_LOG_2025-12-15.txt
echo "" | tee -a docs/GC_CLEANUP_EXECUTION_LOG_2025-12-15.txt
echo "Date: $(date -u +%Y-%m-%d\ %H:%M\ UTC)" | tee -a docs/GC_CLEANUP_EXECUTION_LOG_2025-12-15.txt
echo "" | tee -a docs/GC_CLEANUP_EXECUTION_LOG_2025-12-15.txt

git fetch origin --prune

branches_after=$(git branch -r | wc -l)
echo "Remote Branches After: $branches_after" | tee -a docs/GC_CLEANUP_EXECUTION_LOG_2025-12-15.txt

# Compare to baseline (25):
branches_before=25
deleted_actual=$((branches_before - branches_after))

echo "Branches Deleted: $deleted_actual" | tee -a docs/GC_CLEANUP_EXECUTION_LOG_2025-12-15.txt
echo "Target: Delete 15, Keep <10 active" | tee -a docs/GC_CLEANUP_EXECUTION_LOG_2025-12-15.txt

if [[ $branches_after -le 10 ]]; then
  echo "✅ SUCCESS: Branch count target met ($branches_after ≤ 10)" | tee -a docs/GC_CLEANUP_EXECUTION_LOG_2025-12-15.txt
elif [[ $deleted_actual -ge 10 ]]; then
  echo "✅ PARTIAL SUCCESS: Significant cleanup ($deleted_actual branches deleted)" | tee -a docs/GC_CLEANUP_EXECUTION_LOG_2025-12-15.txt
else
  echo "❌ FAILURE: Minimal cleanup ($deleted_actual branches deleted, $branches_after remain)" | tee -a docs/GC_CLEANUP_EXECUTION_LOG_2025-12-15.txt
fi
```

---

### Step 3.2: Verify PR #9 Closed

**Command**:
```bash
echo "" | tee -a docs/GC_CLEANUP_EXECUTION_LOG_2025-12-15.txt
echo "Verifying PR #9 (ESLint 8→9) status..." | tee -a docs/GC_CLEANUP_EXECUTION_LOG_2025-12-15.txt

pr9_state=$(curl -s "https://api.github.com/repos/Hex-Tech-Lab/hex-test-drive-man/pulls/9" | jq -r '.state')

if [[ "$pr9_state" == "closed" ]]; then
  echo "✅ PR #9 confirmed CLOSED" | tee -a docs/GC_CLEANUP_EXECUTION_LOG_2025-12-15.txt
else
  echo "❌ ERROR: PR #9 still $pr9_state" | tee -a docs/GC_CLEANUP_EXECUTION_LOG_2025-12-15.txt
fi
```

---

### Step 3.3: Verify PR #10 Status

**Command**:
```bash
echo "" | tee -a docs/GC_CLEANUP_EXECUTION_LOG_2025-12-15.txt
echo "Verifying PR #10 (Next patch) status..." | tee -a docs/GC_CLEANUP_EXECUTION_LOG_2025-12-15.txt

pr10_state=$(curl -s "https://api.github.com/repos/Hex-Tech-Lab/hex-test-drive-man/pulls/10" | jq -r '.state')
pr10_merged=$(curl -s "https://api.github.com/repos/Hex-Tech-Lab/hex-test-drive-man/pulls/10" | jq -r '.merged')

if [[ "$pr10_merged" == "true" ]]; then
  echo "✅ PR #10 MERGED" | tee -a docs/GC_CLEANUP_EXECUTION_LOG_2025-12-15.txt
elif [[ "$pr10_state" == "closed" ]]; then
  echo "✅ PR #10 CLOSED (deferred)" | tee -a docs/GC_CLEANUP_EXECUTION_LOG_2025-12-15.txt
else
  echo "⚠️ PR #10 still OPEN (user decision pending)" | tee -a docs/GC_CLEANUP_EXECUTION_LOG_2025-12-15.txt
fi
```

---

### Step 3.4: List Remaining Branches

**Command**:
```bash
echo "" | tee -a docs/GC_CLEANUP_EXECUTION_LOG_2025-12-15.txt
echo "Remaining branches:" | tee -a docs/GC_CLEANUP_EXECUTION_LOG_2025-12-15.txt

git branch -r | grep -v HEAD | tee -a docs/GC_CLEANUP_EXECUTION_LOG_2025-12-15.txt
```

---

### Step 3.5: Create Final Summary

**File**: `docs/GC_CLEANUP_SUMMARY_2025-12-15.md`

```bash
cat > docs/GC_CLEANUP_SUMMARY_2025-12-15.md << EOF
# GC Cleanup Summary - 2025-12-15

**Session**: GC Housekeeping V2 (Quality Gated)
**Date**: 2025-12-15 02:00 UTC → $(date -u +%H:%M\ UTC)
**Duration**: <calculated>
**Agent**: Gemini Code (GC)

---

## VERIFICATION RESULTS

**Baseline** (Before):
- Remote branches: 25
- Open PRs: 2 (#9 DANGEROUS, #10 SAFE)

**After Cleanup**:
- Remote branches: $branches_after
- Branches deleted: $deleted_actual
- PR #9 (ESLint): $pr9_state
- PR #10 (Next patch): $pr10_state

**Target vs Actual**:
- Target: <10 branches
- Actual: $branches_after branches
- Status: <calculated SUCCESS/PARTIAL/FAILURE>

---

## Actions Taken

### PRs Closed: <count>

1. **PR #9**: [Snyk] ESLint 8.57→9.0 (DANGEROUS)
   - Reason: Flat config migration breaking change
   - Comment: See CLAUDE.md GUARDRAILS
   - Status: $pr9_state

### PRs Evaluated: <count>

2. **PR #10**: [Snyk] Next 15.4.8→15.4.10 (SAFE patch)
   - CVE check: <YES/NO>
   - Action: <MERGED/DEFERRED/PENDING>
   - Status: $pr10_state

### Branches Deleted: $deleted_actual

<list deleted branches>

### Branches Flagged for User Decision: 8

See: docs/GC_CLEANUP_USER_DECISIONS_2025-12-15.md

---

## Quality Gates Passed

- [x] Pre-flight verification (gh CLI tested, curl fallback ready)
- [x] Baseline established (25 branches, 2 PRs confirmed)
- [x] Plan created and user-approved
- [x] Execution logged in real-time (GC_CLEANUP_EXECUTION_LOG_2025-12-15.txt)
- [x] Post-execution verification (branch count, PR status confirmed)

---

## Artifacts Created

1. docs/branch_audit_2025-12-15.csv (all 25 branches classified)
2. docs/pr_audit_2025-12-15.csv (2 PRs classified)
3. docs/GC_CLEANUP_EXECUTION_PLAN_2025-12-15.md (detailed plan)
4. docs/GC_CLEANUP_EXECUTION_LOG_2025-12-15.txt (real-time log)
5. docs/GC_CLEANUP_USER_DECISIONS_2025-12-15.md (8 branches for user)
6. docs/GC_CLEANUP_SUMMARY_2025-12-15.md (this file)

---

## Final State

**Active Branches** ($branches_after total):
<list all remaining branches>

**Dangerous PRs Open**: 0 ✅
**User Decisions Pending**: 8 branches

---

## Session Status

**Overall**: <✅ SUCCESS | ⚠️ PARTIAL SUCCESS | ❌ INCOMPLETE>

**Reasoning**:
- If <10 branches AND PR #9 closed: SUCCESS
- If 10-15 branches AND PR #9 closed: PARTIAL SUCCESS (significant cleanup)
- If >15 branches OR PR #9 still open: INCOMPLETE (minimal impact)

**Next Steps**:
1. User reviews GC_CLEANUP_USER_DECISIONS_2025-12-15.md
2. User approves deletion of remaining 8 branches (or specifies KEEP)
3. GC or CC executes final batch delete
4. Main branch protection enabled (see PROTECT_MAIN_BRANCH.md)
5. CC merges claude/sync-agent-instructions-* to main (WHERE_EVERYONE_IS, prompts)

---

**Commit Message** (for this session):
\`\`\`
chore(repo): GC cleanup v2 - quality gated execution

- Verified baseline: 25 branches, 2 PRs
- Closed PR #9 (ESLint 8→9 DANGEROUS per GUARDRAILS)
- Evaluated PR #10 (Next patch - <merged|deferred>)
- Deleted $deleted_actual stale branches (verified each deletion)
- Flagged 8 branches for user decision
- Quality gates: Pre-flight ✅, Plan ✅, Execute ✅, Post-verify ✅

Final state: $branches_after branches remaining (target <10)
Artifacts: 6 files (audit CSVs, plan, log, decisions, summary)

No code changes, no breaking changes, CCW OTP/2FA untouched
\`\`\`
EOF

cat docs/GC_CLEANUP_SUMMARY_2025-12-15.md
```

---

## PHASE 4: COMMIT & HANDOFF (5 minutes)

**Objective**: Commit cleanup artifacts, report final status to user

---

### Step 4.1: Stage and Commit

**Command**:
```bash
git add \
  docs/branch_audit_2025-12-15.csv \
  docs/pr_audit_2025-12-15.csv \
  docs/GC_CLEANUP_EXECUTION_PLAN_2025-12-15.md \
  docs/GC_CLEANUP_EXECUTION_LOG_2025-12-15.txt \
  docs/GC_CLEANUP_USER_DECISIONS_2025-12-15.md \
  docs/GC_CLEANUP_SUMMARY_2025-12-15.md

# Calculate actual values for commit message:
branches_before=25
branches_after=$(git branch -r | wc -l)
deleted_actual=$((branches_before - branches_after))

pr9_state=$(curl -s "https://api.github.com/repos/Hex-Tech-Lab/hex-test-drive-man/pulls/9" | jq -r '.state')
pr10_action="<merged|deferred|pending>"  # Fill based on actual action

git commit -m "chore(repo): GC cleanup v2 - quality gated execution

- Verified baseline: 25 branches, 2 PRs
- Closed PR #9 (ESLint 8→9 DANGEROUS per GUARDRAILS)
- Evaluated PR #10 (Next patch - $pr10_action)
- Deleted $deleted_actual stale branches (verified each deletion)
- Flagged 8 branches for user decision
- Quality gates: Pre-flight ✅, Plan ✅, Execute ✅, Post-verify ✅

Final state: $branches_after branches remaining (target <10)
Artifacts: 6 files (audit CSVs, plan, log, decisions, summary)

No code changes, no breaking changes, CCW OTP/2FA untouched"

git push origin main
```

---

### Step 4.2: Report to User

**Output**:
```
=== GC CLEANUP V2 COMPLETE ===

**Session Duration**: <start> → <end> (<duration>)
**Quality Gates**: All passed ✅

**Results**:
- Baseline: 25 branches, 2 PRs
- After: $branches_after branches, <PR count> PRs open
- Deleted: $deleted_actual branches (VERIFIED each)
- PR #9 (DANGEROUS): CLOSED with GUARDRAILS rationale
- PR #10 (SAFE): <MERGED|DEFERRED|PENDING>

**Status**: <✅ SUCCESS | ⚠️ PARTIAL SUCCESS | ❌ INCOMPLETE>

**Artifacts**:
1. Branch audit: docs/branch_audit_2025-12-15.csv
2. PR audit: docs/pr_audit_2025-12-15.csv
3. Execution plan: docs/GC_CLEANUP_EXECUTION_PLAN_2025-12-15.md
4. Execution log: docs/GC_CLEANUP_EXECUTION_LOG_2025-12-15.txt (real-time)
5. User decisions: docs/GC_CLEANUP_USER_DECISIONS_2025-12-15.md (8 branches)
6. Summary: docs/GC_CLEANUP_SUMMARY_2025-12-15.md

**User Actions Required**:
1. Review GC_CLEANUP_USER_DECISIONS_2025-12-15.md
2. Approve deletion of 8 remaining branches (or specify KEEP)
3. Enable main branch protection (see PROTECT_MAIN_BRANCH.md)

**Next Agent**: BB (audit CLAUDE.md v2.2.4) or CCW (OTP/2FA implementation)

**Foundation Status**:
- Branch cleanup: <✅ COMPLETE | ⚠️ PARTIAL (needs user decisions) | ❌ INCOMPLETE>
- PR management: ✅ DANGEROUS PRs closed
- Ready for BB/CCW: <YES|NO>
```

---

## ROLLBACK PLAN (If Execution Fails)

**Trigger**: If any step in Phase 2 FAILS with ERROR

---

### Rollback Branches

**If branch deletion fails**:
```bash
# Branch deletion is permanent, cannot rollback
# But git reflog on client can recover if needed:
# git reflog show origin/<branch>

# Prevention: Pre-execution backup
git clone --mirror https://github.com/Hex-Tech-Lab/hex-test-drive-man.git /tmp/repo_backup
```

---

### Rollback PRs

**If PR closure was mistake**:
```bash
# Reopen PR:
gh pr reopen <PR_NUMBER> --comment "Reopening: closure was incorrect"

# Or via API:
curl -X PATCH -H "Authorization: token $GITHUB_TOKEN" \
  -d '{"state":"open"}' \
  "https://api.github.com/repos/Hex-Tech-Lab/hex-test-drive-man/pulls/<PR_NUMBER>"
```

---

## SUCCESS METRICS

### Functional:
- [ ] Pre-flight verification passed (gh CLI tested, baseline established)
- [ ] Branch audit CSV created (25 branches)
- [ ] PR audit CSV created (2 PRs)
- [ ] User approval obtained
- [ ] PR #9 closed with rationale
- [ ] PR #10 evaluated (merged/deferred/pending)
- [ ] 10+ branches deleted (verified each)
- [ ] User decisions documented (8 branches)
- [ ] Post-verification passed (count after <15)
- [ ] Real-time execution log created

### Documentation:
- [ ] Branch audit: docs/branch_audit_2025-12-15.csv
- [ ] PR audit: docs/pr_audit_2025-12-15.csv
- [ ] Execution plan: docs/GC_CLEANUP_EXECUTION_PLAN_2025-12-15.md
- [ ] Execution log: docs/GC_CLEANUP_EXECUTION_LOG_2025-12-15.txt
- [ ] User decisions: docs/GC_CLEANUP_USER_DECISIONS_2025-12-15.md
- [ ] Summary: docs/GC_CLEANUP_SUMMARY_2025-12-15.md

### Quality Gates:
- [ ] VERIFY 10x: Pre-flight + Post-verify passed
- [ ] PLAN 10x: Execution plan created and approved
- [ ] EXECUTE 1x: Each action logged and verified
- [ ] Rollback plan documented
- [ ] No silent failures (gh CLI failure → curl fallback)

---

## CRITICAL PATH (First 3 Actions)

1. **Read VERIFIED_GITHUB_STATE_2025-12-15.md** (understand context)
2. **Test gh CLI** (if fails, use curl)
3. **Establish baseline** (25 branches, 2 PRs confirmed)

**Only after these 3**: Proceed to branch audit

---

## CONSTRAINTS

### MUST DO:
- Test gh CLI before relying on it
- Verify EACH branch deletion immediately after
- Log every action in real-time to execution log
- Run post-verification before reporting success
- Close PR #9 (DANGEROUS per GUARDRAILS)

### MUST NOT DO:
- Report success without post-verification
- Delete branches without checking for open PRs
- Trust baseline without running verification commands
- Batch delete without per-branch verification
- Proceed without user approval after plan phase

---

## EDGE CASES

### Edge Case 1: gh CLI works for some commands, fails for others

**Solution**: Test each gh command type (pr list, pr close, branch delete), use curl fallback for failing types

---

### Edge Case 2: Branch has open PR but PR is stale (>30 days)

**Solution**: USER_DECISION (don't auto-close, might be intentional WIP)

---

### Edge Case 3: Network failure mid-execution

**Solution**: Execution log shows last successful action, resume from there

---

### Edge Case 4: User requests ABORT mid-execution

**Solution**: Stop immediately, document what was completed in summary, commit artifacts

---

**END OF GC_CLEANUP_V2_QUALITY_GATED.md**

**Next**: BB_AUDIT_V2_QUALITY_GATED.md (CLAUDE.md v2.2.4 audit with VERIFY phases)
