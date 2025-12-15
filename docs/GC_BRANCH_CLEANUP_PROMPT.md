# GC MISSION BRIEF - Branch & PR Cleanup

**Handover Generated At**: 2025-12-14 23:45 UTC
**Session Type**: Repository Housekeeping (Branch/PR Audit + Cleanup)
**Priority**: MEDIUM - Technical debt, not blocking MVP
**Complexity**: LOW (audit + merge/delete, no code changes)
**Estimated Scope**: 1 session (1-2 hours)

---

## MAKER-CHECKER VALIDATION

**Before proceeding, you MUST answer:**

Are you at least 95% confident you fully understand:
- Context, rationale, decisions, tradeoffs, and criteria?
- Current technical state, constraints, and risks?
- Next actions and their dependencies?

**If YES (≥95% confidence):**
- State: "I have all the context, rationale, decisions, and criteria needed and do NOT need to ask any clarifying questions."
- Proceed directly to execution planning.

**If NO (<95% confidence):**
- This is a FAILURE OF THE HANDOVER.
- State: "The handover is incomplete in the following specific areas: [list precisely]"
- Ask ONLY ONE focused clarifying question to close the gap.
- After answer, re-evaluate and continue without further questions.

**FORBIDDEN:**
- Generic questions like "Should I delete merged branches?" or "Which PRs are safe to close?"
- If such info is missing, classify as handover defect and report explicitly.

---

## 1. EXECUTIVE SUMMARY

**Mission**: Audit 15+ branches and PRs, merge/delete obsolete branches, reject dangerous Dependabot PRs, document cleanup decisions, preserve ongoing work (CC + CCW).

**Current State** (Per `docs/WHERE_EVERYONE_IS.md`):
- ✅ Main branch: Stable (commit ca9da33, Dec 11), but 3+ days behind CC's work
- ⚠️ **GC's current branch**: `hex-ai/claude-md-master` (DIVERGED, needs merge/archive)
- ⚠️ **GC MUST switch to main** before starting audit
- ✅ CC active work: `claude/sync-agent-instructions-015BBjkGH1Syq5uEU6r2uGCg` (PROTECTED, do not touch)
- ⚠️ Multiple CLAUDE.md files exist: root (103 lines on main), "Full till 7-12-2025", suspect1/2
- ✅ CCW future work: Will create `ccw/otp-2fa-system` from main (FUTURE, don't interfere)
- ⚠️ 15+ branches: Many stale, unknown status
- ⚠️ Dependabot PRs: Auto-created, some DANGEROUS (ESLint 8→9)

**Success Criteria**:
- Branch count reduced to <5 active branches
- All merged PRs have branches deleted
- Dangerous Dependabot PRs closed with rationale
- Safe Dependabot PRs evaluated (merge or defer)
- Cleanup log: `docs/BRANCH_CLEANUP_2025-12-14.md`
- CCW OTP/2FA work untouched
- No breaking changes merged

**Deliverables**:
1. Branch audit report (CSV: branch, last commit, author, status, action)
2. PR audit report (CSV: PR#, title, status, Dependabot?, action)
3. Cleanup execution (merge, delete, close with rationale)
4. Documentation: `docs/BRANCH_CLEANUP_2025-12-14.md`
5. Final branch count: <5 active

---

## 2. TECHNICAL ENVIRONMENT

**Read First**: `docs/WHERE_EVERYONE_IS.md` (comprehensive synchronization document)

**Then Read**: CLAUDE.md on main (103 lines) OR on CC's branch (2,219 lines, v2.2.4)
- **Note**: CLAUDE.md on main is STALE (Dec 12)
- **Note**: CLAUDE.md v2.2.4 on CC's branch is CURRENT (Dec 14)
- For this session: Use main's version + WHERE_EVERYONE_IS.md for context

**Project Root**: `/home/user/hex-test-drive-man`

**GC's Current Branch**: `hex-ai/claude-md-master` (⚠️ WRONG, needs checkout to main)

**Target Starting Branch**: `main` (where GC should operate from)

**Tools**:
- `gh` (GitHub CLI) - authenticated, working
- `git` - GPG signing enabled (check `git config commit.gpgsign`)
- `curl` - For GitHub API calls

**GitHub Repo**: `https://github.com/Hex-Tech-Lab/hex-test-drive-man`

**Credentials**: Same as always (in .env.local or Git config)

---

## 3. CRITICAL CONSTRAINTS

### MUST NOT TOUCH (Protected Branches):

1. **main** - Production branch (GC operates FROM here, but doesn't delete)
2. **claude/sync-agent-instructions-015BBjkGH1Syq5uEU6r2uGCg** - Current CC session (ACTIVE, PROTECTED)
3. **ccw/otp-2fa-system** - CCW will create this (FUTURE, don't interfere)

### MUST HANDLE (GC's Own Branch):

4. **hex-ai/claude-md-master** - GC's previous work (Dec 12):
   - Status: DIVERGED from main
   - Contains: MVP_EVOLUTION docs, TECH_DECISIONS docs
   - Last commit: 896c0fd (Dec 12)
   - Action: MERGE docs to main (via PR), then DELETE branch
   - Rationale: Consolidate diverged documentation

### MUST INVESTIGATE (Potential Duplicates):

5. **Multiple CLAUDE.md files** (untracked on main):
   - `CLAUDE - Full till 7-12-2025.md` (⚠️ might be 597-line version)
   - `CLAUDE-suspect1.md`
   - `CLAUDE-suspect2.md`
   - Action: Review, consolidate or delete (get user approval)

### MUST NOT MERGE (Dangerous PRs):

**From CLAUDE.md Section 3 (GUARDRAILS)**:

1. **ESLint 8.x → 9.x**:
   - REASON: Requires flat config migration (eslint.config.js)
   - Current: `.eslintrc` (deprecated but working)
   - Impact: Breaking change, requires manual migration
   - ACTION: Close PR with comment explaining flat config requirement

2. **MUI 6.x → 7.x**:
   - REASON: Requires slots/slotProps API refactor (breaking changes)
   - Current: MUI 6.4.3 (LTS until mid-2026)
   - Decision: Stay on 6.4.3 until MVP 1.5+
   - ACTION: Close PR with reference to Architecture Decision (Dec 13)

3. **Next.js major bumps** (e.g., 15.x → 16.x):
   - REASON: Requires App Router review + API route audit
   - ACTION: Defer, do not auto-merge

4. **React major bumps** (e.g., 19.x → 20.x):
   - REASON: Zustand primitive selector requirement
   - ACTION: Defer, requires codebase audit

### MUST VERIFY Before Merging:

1. **Dependency upgrades**:
   - Check: CVE fix? Security patch? Or just version bump?
   - If security: Evaluate severity (HIGH → merge, MODERATE → defer)
   - If version bump: Defer unless blocking MVP

2. **Feature branches**:
   - Check: PR exists? Merged? CI green?
   - If merged: Delete branch
   - If open: Check status, merge if approved
   - If stale (>30 days, no activity): Flag for user decision

---

## 4. BRANCH AUDIT WORKFLOW

### Phase 1: Inventory (15 minutes)

**Step 1: List all branches**:
```bash
cd /home/user/hex-test-drive-man

# Local branches
git branch -a

# Remote branches with last commit date
gh api repos/Hex-Tech-Lab/hex-test-drive-man/branches \
  --jq '.[] | {name: .name, commit: .commit.sha[0:7], date: .commit.commit.author.date}' \
  > /tmp/branches.json

# Convert to CSV for analysis
jq -r '["Branch","Commit","Date"], (.[] | [.name, .commit, .date]) | @csv' \
  /tmp/branches.json > /tmp/branches.csv

cat /tmp/branches.csv
```

**Step 2: Classify branches**:

Create classification CSV with columns:
- Branch name
- Last commit SHA (short)
- Last commit date
- Author
- Status (ACTIVE | MERGED | STALE | UNKNOWN)
- Action (KEEP | DELETE | MERGE | USER_DECISION)
- Reason

**Classification Rules**:

```
ACTIVE:
- main (protected)
- claude/sync-agent-instructions-* (current session)
- Branches with commits in last 7 days

MERGED:
- Check: `gh pr list --state merged --head <branch>`
- If PR merged → DELETE branch

STALE:
- Last commit >30 days ago
- No open PR
- Not main/claude/* branches
- Action: USER_DECISION (flag for user approval before delete)

UNKNOWN:
- Can't determine status
- Action: USER_DECISION
```

**Step 3: Export audit report**:
```bash
# Save to docs/branch_audit_2025-12-14.csv
cat > docs/branch_audit_2025-12-14.csv << 'EOF'
Branch,Commit,Date,Author,Status,Action,Reason
main,722c5e3,2025-12-14,CC,ACTIVE,KEEP,Protected production branch
claude/sync-agent-instructions-015BBjkGH1Syq5uEU6r2uGCg,3cee304,2025-12-14,CC,ACTIVE,KEEP,Current CC session
...
EOF
```

---

### Phase 2: PR Audit (15 minutes)

**Step 1: List all PRs**:
```bash
# Open PRs
gh pr list --state open --json number,title,author,createdAt,updatedAt,headRefName \
  > /tmp/prs_open.json

# Closed PRs (last 30 days)
gh pr list --state closed --limit 50 --json number,title,author,closedAt,mergedAt,headRefName \
  > /tmp/prs_closed.json

# Merged PRs
gh pr list --state merged --limit 50 --json number,title,author,mergedAt,headRefName \
  > /tmp/prs_merged.json
```

**Step 2: Identify Dependabot PRs**:
```bash
# Filter Dependabot PRs
jq '.[] | select(.author.login == "dependabot[bot]")' /tmp/prs_open.json \
  > /tmp/prs_dependabot.json

cat /tmp/prs_dependabot.json
```

**Step 3: Classify PRs**:

Create PR classification CSV:
- PR #
- Title
- Author
- Status (OPEN | MERGED | CLOSED)
- Dependabot? (YES | NO)
- Risk (SAFE | DANGEROUS | UNKNOWN)
- Action (MERGE | CLOSE | USER_DECISION)
- Reason

**Risk Classification Rules**:

```
DANGEROUS:
- ESLint 8.x → 9.x (flat config breaking)
- MUI 6.x → 7.x (slots/slotProps API breaking)
- Next.js major bumps (15.x → 16.x)
- React major bumps (19.x → 20.x)
- Action: CLOSE with rationale comment

SAFE:
- Patch upgrades (15.4.7 → 15.4.8)
- CVE fixes with HIGH severity
- Dependencies: @supabase, @sentry, etc. (patch versions)
- Action: MERGE if CI green

UNKNOWN:
- Mid-sized version bumps (15.4.x → 15.5.x)
- New dependencies
- Action: USER_DECISION
```

**Step 4: Export PR audit report**:
```bash
cat > docs/pr_audit_2025-12-14.csv << 'EOF'
PR#,Title,Author,Status,Dependabot,Risk,Action,Reason
4,Booking MVP v0,CCW,OPEN,NO,SAFE,USER_DECISION,Awaiting CCW OTP work completion
9,Bump eslint 8.57→9.0,dependabot,OPEN,YES,DANGEROUS,CLOSE,Requires flat config migration
...
EOF
```

---

### Phase 3: Execution (30 minutes)

**Step 1: Close dangerous Dependabot PRs**:

```bash
# Example: Close ESLint 8→9 PR
gh pr close <PR_NUMBER> --comment "Closing this PR because ESLint 9.x requires flat config migration (eslint.config.js) which is a breaking change. Our current .eslintrc setup works with ESLint 8.57.0. We will migrate to ESLint 9.x after MVP 1.5 when we can allocate time for the flat config refactor. See CLAUDE.md Section 3 (GUARDRAILS) for details."

# Example: Close MUI 6→7 PR
gh pr close <PR_NUMBER> --comment "Closing this PR because MUI v7 requires slots/slotProps API refactor across ALL components. We decided to stay on MUI 6.4.3 (LTS until mid-2026) per Architecture Decision (Dec 13, 2025). Migration cost is HIGH with zero business value for current MVP. Will revisit after MVP 1.5+. See CLAUDE.md Architecture Decisions section."
```

**Step 2: Delete merged branch remotes**:

```bash
# For each MERGED branch (from audit report)
# Example:
git push origin --delete feature/pdf-extraction-engine

# Verify deletion
gh api repos/Hex-Tech-Lab/hex-test-drive-man/branches | jq '.[] | .name'
```

**Step 3: Merge safe PRs** (if any):

```bash
# Only if:
# - Risk: SAFE
# - CI: Green
# - Approved by CodeRabbit/Sourcery

gh pr merge <PR_NUMBER> --squash --delete-branch
```

**Step 4: Flag USER_DECISION items**:

Create `docs/BRANCH_CLEANUP_USER_DECISIONS.md`:
```markdown
# Branches/PRs Requiring User Decision

## Stale Branches (>30 days, no activity)

- `feature/old-experiment` (last commit: 2025-10-15)
  - Reason: No PR, no recent activity
  - Recommendation: DELETE
  - User: Approve or explain if still needed

## Unknown Risk PRs

- PR #X: "Bump dependency Y"
  - Reason: Mid-sized version bump, unclear impact
  - Recommendation: Defer or merge after testing
  - User: Decide priority
```

---

## 5. CLEANUP DOCUMENTATION

**File**: `docs/BRANCH_CLEANUP_2025-12-14.md`

**Structure**:
```markdown
# Branch & PR Cleanup - 2025-12-14

**Session**: GC Housekeeping
**Date**: 2025-12-14 23:45 UTC → 2025-12-15 01:00 UTC
**Agent**: Gemini Code (GC)

---

## Summary

- **Branches audited**: 15
- **Branches deleted**: X
- **Branches kept**: Y
- **PRs closed**: Z (Dependabot dangerous)
- **PRs merged**: 0 (none safe to auto-merge)
- **User decisions flagged**: N

---

## Branch Actions

| Branch | Status | Action | Reason |
|--------|--------|--------|--------|
| main | ACTIVE | KEEP | Protected production |
| claude/sync-* | ACTIVE | KEEP | Current CC session |
| feature/pdf-engine | MERGED | DELETE | PR#7 merged Dec 11 |
| ... | ... | ... | ... |

---

## PR Actions

| PR# | Title | Dependabot | Risk | Action | Reason |
|-----|-------|------------|------|--------|--------|
| 9 | ESLint 8→9 | YES | DANGEROUS | CLOSE | Flat config breaking |
| 10 | MUI 6→7 | YES | DANGEROUS | CLOSE | Slots API breaking |
| ... | ... | ... | ... | ... | ... |

---

## Closed PR Comments

### PR#9: ESLint 8.57→9.0

Closed with comment:
> Closing this PR because ESLint 9.x requires flat config migration...

### PR#10: MUI 6.4→7.3

Closed with comment:
> Closing this PR because MUI v7 requires slots/slotProps API refactor...

---

## User Decisions Required

See: `docs/BRANCH_CLEANUP_USER_DECISIONS.md`

---

## Final State

- **Active branches**: 3 (main, claude/*, ccw/* future)
- **Stale branches**: 0
- **Open PRs**: X (safe to keep open)
- **Dangerous PRs**: 0 (all closed)
```

---

## 6. SUCCESS METRICS

### Functional:
- [ ] Branch audit CSV created (all 15+ branches listed)
- [ ] PR audit CSV created (all PRs classified)
- [ ] Dangerous Dependabot PRs closed with rationale comments
- [ ] Merged branches deleted from remote
- [ ] Cleanup documentation created (BRANCH_CLEANUP_2025-12-14.md)
- [ ] User decisions flagged (if any)

### Technical:
- [ ] Final branch count: <5 active
- [ ] No breaking changes merged
- [ ] CCW OTP/2FA branches untouched
- [ ] Main branch: Still stable, CI green

### Documentation:
- [ ] Branch audit: `docs/branch_audit_2025-12-14.csv`
- [ ] PR audit: `docs/pr_audit_2025-12-14.csv`
- [ ] Cleanup log: `docs/BRANCH_CLEANUP_2025-12-14.md`
- [ ] User decisions: `docs/BRANCH_CLEANUP_USER_DECISIONS.md` (if needed)

---

## 7. CRITICAL PATH

### Immediate First 4 Actions:

1. **Read synchronization context (3 minutes)**:
   ```bash
   cd /home/user/hex-test-drive-man
   cat docs/WHERE_EVERYONE_IS.md
   ```

2. **Switch to main branch (2 minutes)**:
   ```bash
   # Verify current branch (should be hex-ai/claude-md-master)
   git branch --show-current

   # Save any uncommitted work on current branch
   git status
   # If changes exist: git stash

   # Switch to main
   git checkout main
   git pull origin main

   # Verify at correct commit (ca9da33)
   git log --oneline -1
   ```

3. **Branch inventory (10 minutes)**:
   ```bash
   # List all remote branches
   gh api repos/Hex-Tech-Lab/hex-test-drive-man/branches \
     --jq '.[] | {name: .name, commit: .commit.sha[0:7], date: .commit.commit.author.date}'

   # Identify hex-ai/claude-md-master specifically
   gh api repos/Hex-Tech-Lab/hex-test-drive-man/branches/hex-ai/claude-md-master
   ```

4. **PR inventory (10 minutes)**:
   ```bash
   gh pr list --state all --limit 50 --json number,title,author,state,headRefName
   ```

### Dependencies:
- `gh` CLI authenticated ✓
- No other blockers

### Success Criteria for Session:
- Branch audit complete
- PR audit complete
- Dangerous PRs closed with rationale
- Cleanup documentation created
- <5 active branches remaining

---

## 8. EDGE CASES

### Handle These Explicitly:

1. **Branch has open PR but no activity >30 days**:
   - Action: USER_DECISION (don't auto-close, might be intentional work-in-progress)

2. **Dependabot PR for CVE fix but breaking change**:
   - Example: CVE-2025-1234 requires ESLint 9.x
   - Action: USER_DECISION (security vs breaking change tradeoff)

3. **Branch author is not CC/CCW/GC/BB**:
   - Action: USER_DECISION (might be user's personal work)

4. **PR merged but branch not deleted**:
   - Common on GitHub if "auto-delete" disabled
   - Action: DELETE branch (safe, PR history preserved)

5. **Multiple PRs from same branch**:
   - Rare, but possible
   - Action: Check all PRs merged before deleting branch

6. **Branch ahead of main by 100+ commits**:
   - Indicates long-running work or divergence
   - Action: USER_DECISION (don't auto-delete)

---

## 9. COMMIT STRATEGY

**Single commit after completion**:

```bash
git add docs/branch_audit_2025-12-14.csv \
        docs/pr_audit_2025-12-14.csv \
        docs/BRANCH_CLEANUP_2025-12-14.md \
        docs/BRANCH_CLEANUP_USER_DECISIONS.md  # if exists

git commit -m "chore(repo): branch & PR cleanup (15→<5 branches)

- Audited 15+ branches: classified as ACTIVE/MERGED/STALE
- Audited all PRs: identified Dependabot dangerous upgrades
- Closed X Dependabot PRs:
  - ESLint 8.57→9.0 (flat config breaking)
  - MUI 6.4→7.3 (slots API breaking)
  - [list others]
- Deleted Y merged branches: [list]
- Flagged Z items for user decision: [list]
- Documentation: BRANCH_CLEANUP_2025-12-14.md

Final state: <5 active branches, 0 dangerous PRs open

No code changes, no breaking changes merged, CCW OTP/2FA untouched"

git push -u origin claude/sync-agent-instructions-015BBjkGH1Syq5uEU6r2uGCg
```

---

**END OF GC MISSION BRIEF**

**Next Step**: GC reads this brief, performs Maker-Checker validation, confirms 95%+ confidence, and begins Phase 1 (Inventory).

**Expected Timeline**: 1 session, 1-2 hours

**Point of Contact**: User (via chat)

**Escalation**: If blocked >15min, ask user for help

**Verification Authority**: CLAUDE.md v2.2.4 (2,219 lines, commit 722c5e3)
