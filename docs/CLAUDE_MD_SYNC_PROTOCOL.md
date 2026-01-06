# CLAUDE.md Sync Protocol

**Created:** 2026-01-06 2246 EET  
**Agent:** PPLX (Perplexity)  
**Purpose:** Prevent CLAUDE.md from falling out of sync with production work

---

## Incident Summary (Jan 6, 2026)

**Problem:** CLAUDE.md last updated Dec 24, missing 13 days of work  
**Root Cause:** CC updated CLAUDE.md on feature branches, never pushed to main  
**Impact:** Downloaded version from GitHub was outdated  
**Resolution:** PPLX manually updated (commit 19ddf1c)

---

## Mandatory Update Rules

### Rule 1: Update Location
**REQUIREMENT:** All CLAUDE.md updates MUST be committed to `main` branch  
**FORBIDDEN:** Updating CLAUDE.md only on feature branches

**Why:** CLAUDE.md is project brain - must reflect production reality  
**Exception:** None (even emergency fixes must update main)

---

### Rule 2: Update Frequency

**Trigger Events (MUST update CLAUDE.md):**
1. Session end (user signals: sleep, weekend, leaving)
2. Milestone reached (feature complete, PR merged)
3. Issue resolved (bug fixed, blocker removed)
4. Success achieved (build passes, deployment verified)

**FORBIDDEN:** Updating only during troubleshooting loops  
**Pattern:** Update at flagposts, not mid-cycle

---

### Rule 3: Update Content

**Section 8 (Session Timeline) - Required Format:**
```markdown
- **YYYY-MM-DD (Agent Name - Session Type)**
  - Main outcomes (1 line): Feature X + fix Y + decision Z
  - Files/metrics (1 line): N created, M modified + Build status + Timebox: X min
```

**Header (Line 3) - Required Format:**
```markdown
Version: X.Y.Z | Last Updated: YYYY-MM-DD HHMM TZ | Agent: AGENT | Status: ACTIVE
```

**Section 5 (Open Items) - Update When:**
- Task completed: Move to "RECENTLY COMPLETED"
- New blocker: Add to "PRIORITY 1"
- Decision made: Update relevant section

---

### Rule 4: Housekeeping at Session End

**Mandatory Commands (CC/GC/BB/PPLX):**
```bash
# 1. Backup current version
cp CLAUDE.md CLAUDE.md.backup.$(date +%Y%m%d-%H%M)-{AGENT}

# 2. Update CLAUDE.md (header + session timeline + open items)
# (Use sed/nano/editor of choice)

# 3. Commit to main
git add CLAUDE.md
git commit -m "docs({agent}): update CLAUDE.md v{version} - {session summary}"

# 4. Push immediately
git push origin main

# 5. Sync replicas (if agent owns them)
cp CLAUDE.md GEMINI.md  # GC only
cp CLAUDE.md BLACKBOX.md  # BB only
```

**Verification:**
```bash
# Confirm CLAUDE.md is in main
git log --oneline -1 CLAUDE.md

# Check GitHub timestamp matches local
curl -s https://api.github.com/repos/Hex-Tech-Lab/hex-test-drive-man/contents/CLAUDE.md | jq -r '.sha'
```

---

## Agent-Specific Responsibilities

### CC (Claude Code)
**Owns:** CLAUDE.md (master copy)  
**Update Trigger:** Every task completion (hardest bugs, architecture, PRs)  
**Sync:** No replicas (CC is source of truth)

**Violation Example (Jan 6):**
- Updated CLAUDE.md on feature branches 5-6 times
- Never pushed to main (main stuck at Dec 24)
- User discovered drift when downloading from GitHub

**Prevention:** Check `git branch` before updating - if not on main, switch first

---

### GC (Gemini CLI)
**Owns:** GEMINI.md (GC view)  
**Syncs From:** CLAUDE.md (ADD ONLY, never delete)  
**Update Trigger:** After large refactors, doc integration, git operations

**Sync Commands:**
```bash
# After CC updates CLAUDE.md
git pull origin main
cp CLAUDE.md GEMINI.md
git add GEMINI.md
git commit -m "docs(gc): sync GEMINI.md from CLAUDE.md"
git push origin main
```

---

### BB (Blackbox)
**Owns:** BLACKBOX.md (BB view)  
**Syncs From:** CLAUDE.md (ADD ONLY)  
**Update Trigger:** After browser tests, scripts, dashboards

**Special Note:** BB works in ephemeral sandboxes  
**Critical:** Must explicitly push to GitHub (not automatic)

**Sync Commands:**
```bash
# In sandbox (after task complete)
cp CLAUDE.md BLACKBOX.md
git add BLACKBOX.md docs/PERFORMANCE_LOG.md
git commit -m "docs(bb): update BLACKBOX.md + perf log"
git push origin main  # CRITICAL: Don't forget this!
```

---

### PPLX (Perplexity)
**Owns:** Strategic docs (this file, PR reports, orchestration)  
**Syncs:** Does not own CLAUDE.md replica  
**Update Trigger:** Emergency only (when CC/GC/BB violate protocol)

**Emergency Update Pattern (Jan 6 example):**
1. Detect drift (user reports outdated GitHub version)
2. Verify latest version (compare WSL vs GitHub)
3. Manual update (sed commands, no nano)
4. Commit to main immediately
5. Create prevention doc (this file)

---

## Verification Checklist

### Daily Health Check (Any Agent)
```bash
# 1. Check CLAUDE.md last commit
git log --oneline -1 CLAUDE.md

# 2. Verify timestamp in file matches commit date
head -3 CLAUDE.md | tail -1

# 3. Compare local vs GitHub
git fetch origin
git diff origin/main CLAUDE.md

# 4. If diff exists, investigate immediately
```

**Expected:** No diff, timestamp within 24 hours

---

### Weekly Audit (User)
```bash
# 1. Download CLAUDE.md from GitHub
curl -s https://raw.githubusercontent.com/Hex-Tech-Lab/hex-test-drive-man/main/CLAUDE.md > CLAUDE-github.md

# 2. Compare with WSL version
diff ~/projects/hex-test-drive-man/CLAUDE.md CLAUDE-github.md

# 3. If diff exists, determine which is newer
head -3 CLAUDE-github.md | tail -1
head -3 ~/projects/hex-test-drive-man/CLAUDE.md | tail -1

# 4. Report to agent if drift > 24 hours
```

---

## Anti-Patterns (FORBIDDEN)

### ❌ Anti-Pattern 1: Feature Branch Updates Only
**Example:**
```bash
git checkout cc/my-feature
# Update CLAUDE.md here
git commit -m "feat: my feature + update CLAUDE.md"
git push origin cc/my-feature
# PROBLEM: CLAUDE.md never reaches main until PR merged
```

**Correct Pattern:**
```bash
git checkout cc/my-feature
# Work on feature
git commit -m "feat: my feature"
git push origin cc/my-feature

# Switch to main for CLAUDE.md update
git checkout main
# Update CLAUDE.md
git commit -m "docs(cc): update CLAUDE.md - my feature complete"
git push origin main

# Back to feature branch
git checkout cc/my-feature
```

---

### ❌ Anti-Pattern 2: Batching Updates
**Example:**
- Work on 5 tasks over 3 days
- Update CLAUDE.md once at end of 3 days
- PROBLEM: Intermediate work lost if system crashes

**Correct Pattern:**
- Update CLAUDE.md after each task completion
- Incremental updates (1-2 lines per task)
- Immediate push to main

---

### ❌ Anti-Pattern 3: "I'll Push Later"
**Example:**
```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md"
# STOP HERE - don't push yet, continue working
# PROBLEM: Commit stuck in local repo, not on GitHub
```

**Correct Pattern:**
```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md"
git push origin main  # IMMEDIATE
# Continue working
```

---

## Escalation Path

### Level 1: Agent Self-Correction
**Trigger:** Agent notices CLAUDE.md not pushed  
**Action:** Push immediately, no user intervention

### Level 2: Peer Agent Alert
**Trigger:** GC/BB notices CC didn't update CLAUDE.md  
**Action:** Alert in session, remind CC to push

### Level 3: User Intervention
**Trigger:** User discovers drift > 24 hours  
**Action:** User notifies PPLX, PPLX investigates and resolves

### Level 4: Emergency Update
**Trigger:** Critical drift (> 7 days) or production blocked  
**Action:** PPLX bypasses CC, updates CLAUDE.md directly

---

## Success Metrics

**Target:**
- CLAUDE.md timestamp drift: < 24 hours (always)
- GitHub vs WSL diff: 0 lines (weekly audit)
- Agent violations: 0 per month

**Current Status (Jan 6, 2026):**
- Drift detected: 13 days (Dec 24 → Jan 6)
- Violation: CC (feature branch updates only)
- Resolution: PPLX emergency update (commit 19ddf1c)
- Prevention: This protocol doc created

---

**Protocol Status:** ACTIVE  
**Next Review:** After 30 days (Feb 6, 2026)  
**Owner:** CC (enforces protocol), PPLX (audits compliance)
