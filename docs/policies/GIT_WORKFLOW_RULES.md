# Git Workflow Rules & Best Practices

**Document Version**: 1.0
**Last Updated**: 2026-01-05
**Authority**: MANDATORY for all agents (CC, CCW, GC, BB, PPLX)
**Enforcement**: Pre-push hooks + code review
**Status**: ACTIVE

---

## Table of Contents

1. [Branch Strategy](#1-branch-strategy)
2. [Commit Discipline](#2-commit-discipline)
3. [Push Protocol (CRITICAL)](#3-push-protocol-critical)
4. [Rebase Rules](#4-rebase-rules)
5. [Conflict Resolution](#5-conflict-resolution)
6. [Multi-Agent Coordination](#6-multi-agent-coordination)
7. [Emergency Procedures](#7-emergency-procedures)
8. [Verification Checklists](#8-verification-checklists)

---

## 1. Branch Strategy

### 1.1 Branch Naming Conventions

**Format**: `{agent}/{feature}-{session-id}`

**Examples**:
- `cc/fix-404-pages-20260105`
- `bb/cart-drawer-session42`
- `gc/smart-rules-v2-dec03`

**Rules**:
- Lowercase only
- Hyphens (not underscores)
- Agent prefix mandatory
- Session ID or date suffix recommended

### 1.2 Branch Types

| Type | Branch Name | Purpose | Lifetime | Merge Strategy |
|------|-------------|---------|----------|----------------|
| **Main** | `main` | Production-ready code | Permanent | Linear history (rebase) |
| **Feature** | `{agent}/{feature}` | New features | 1-7 days | Rebase before merge |
| **Hotfix** | `{agent}/hotfix-{issue}` | Critical bugs | <24 hours | Rebase + fast-forward |
| **Experimental** | `{agent}/exp-{name}` | Prototypes | 1-30 days | May be deleted |

### 1.3 Main Branch Policy

**CRITICAL RULES**:
1. **Linear History Only** - No merge commits on main
2. **Always Fast-Forward** - Rebase before pushing
3. **Never Force Push** - Use `--force-with-lease` on feature branches ONLY
4. **Single Source of Truth** - Main is canonical, always pull before work

**Violations**: Immediate rollback + incident report

### 1.4 Feature Branch Workflow

**Recommended** for complex features (>60 min work):

```bash
# 1. Create feature branch from main
git checkout main
git pull --rebase origin main
git checkout -b cc/my-feature-20260105

# 2. Work on feature (multiple commits OK)
git add src/components/NewComponent.tsx
git commit -m "feat: add new component"

# 3. Keep branch updated with main
git fetch origin
git rebase origin/main  # Replay commits on top of main

# 4. When ready, push feature branch
git push -u origin cc/my-feature-20260105

# 5. Create PR (or merge directly if authorized)
# 6. After merge, delete branch
git checkout main
git pull --rebase origin main
git branch -d cc/my-feature-20260105
git push origin --delete cc/my-feature-20260105
```

---

## 2. Commit Discipline

### 2.1 Atomic Commits

**Rule**: One logical change = One commit

**Good Example**:
```
feat(ui): add favorites button to vehicle cards
  - Add FavoritesButton component
  - Integrate with useFavoritesStore
  - Update VehicleCard to show button
  - Add heart icon animations
```

**Bad Example** (TOO LARGE):
```
feat: implement entire favorites system
  - Add favorites button
  - Add favorites page
  - Add favorites API
  - Fix unrelated bug in header
  - Update documentation
```

### 2.2 Commit Message Format

**Standard**: [Conventional Commits](https://www.conventionalcommits.org/)

**Format**:
```
<type>(<scope>): <short description>

<optional body>

<optional footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `refactor`: Code refactor (no behavior change)
- `test`: Adding/fixing tests
- `chore`: Tooling, dependencies, config
- `perf`: Performance improvement
- `ci`: CI/CD changes

**Scope Examples**: `ui`, `api`, `db`, `docs`, `build`, `detail`, `catalog`

**Examples**:
```
feat(ui): add cart drawer with floating button

Implements MUI Drawer component for comparison/booking carts.
- Floating FAB button with badge counts
- Slide-out panel from right
- Two tabs: Bookings | Comparisons
- Remove item functionality

Closes #42
```

```
fix(detail): resolve 404 for hyphenated model names (Uni-T, Uni-V)

Dual-query fallback handles space vs hyphen mismatch.
- Try space-separated first ("uni t")
- Fallback to hyphen-separated ("uni-t")
- Extracts VEHICLE_DETAIL_SELECT constant

Refs: docs/incidents/2026-01-05-REBASE-INCIDENT.md
```

### 2.3 When to Commit

**Commit Frequency**: After each logical unit of work

**DO Commit**:
- After fixing a bug (test passes)
- After adding a complete feature component
- After refactoring a module (tests still pass)
- Before switching tasks (save progress)
- Before rebasing (safety checkpoint)

**DON'T Commit**:
- Broken code (won't build)
- Commented-out debug code
- Temporary test files
- Half-finished features (unless WIP commit)

### 2.4 WIP Commits

**When to Use**: Saving progress at end of session, not ready for merge

**Format**:
```
WIP: partial implementation of favorites system

- Completed: FavoritesButton component
- TODO: Favorites page layout
- TODO: API integration
- TODO: localStorage persistence

DO NOT MERGE - Session incomplete
```

**Cleanup Before Merge**:
```bash
# Squash WIP commits into feature commit
git rebase -i origin/main
# Mark WIP commits as 'squash' or 'fixup'
```

---

## 3. Push Protocol (CRITICAL)

### 3.1 Mandatory Pre-Push Sequence

**ALWAYS run this before pushing to main**:

```bash
# Step 1: Fetch remote changes
git fetch origin

# Step 2: Verify clean working tree
git status
# Expected: "nothing to commit, working tree clean"

# Step 3: Check commits ahead of remote
git log origin/main..HEAD --oneline
# This shows YOUR commits that will be pushed

# Step 4: Check commits behind remote (CRITICAL!)
git log HEAD..origin/main --oneline
# This shows REMOTE commits you don't have locally
# If this shows ANY commits: STOP and rebase first

# Step 5: If behind remote, rebase
if [ $(git log HEAD..origin/main --oneline | wc -l) -gt 0 ]; then
  git pull --rebase origin main
  pnpm build && pnpm lint  # Re-verify after rebase
fi

# Step 6: Push (only if above checks pass)
git push origin main
```

### 3.2 Automated Pre-Push (Preferred)

**Use the pre-push hook** (automatically installed):

```bash
# Just push - hook will handle checks
git push origin main

# Hook will:
# 1. Fetch origin/main
# 2. Check if behind remote
# 3. Block push if behind (with error message)
# 4. Allow push if safe
```

### 3.3 Safe Push Helper Script

**For complex scenarios**, use the helper:

```bash
# Interactive safe push with prompts
./scripts/safe-push.sh

# Script will:
# 1. Show current branch
# 2. Fetch and show commits ahead/behind
# 3. Prompt for rebase if needed
# 4. Run build + lint
# 5. Push if all checks pass
```

### 3.4 Push Rejection Handling

**If push rejected**, follow this protocol:

```bash
# Error message:
# ! [rejected]        main -> main (fetch first)

# Step 1: DON'T PANIC - This is Git protecting you
# Step 2: Fetch remote to see what changed
git fetch origin

# Step 3: View remote commits you're missing
git log HEAD..origin/main --oneline

# Step 4: Rebase your commits on top
git pull --rebase origin main
# This replays YOUR commits on top of REMOTE commits

# Step 5: Resolve conflicts if any (see Section 5)
# If conflicts:
#   - Edit files to resolve
#   - git add <resolved-files>
#   - git rebase --continue

# Step 6: Re-verify build after rebase
pnpm build && pnpm lint

# Step 7: Push again
git push origin main
```

### 3.5 What NOT to Do

**NEVER DO THIS**:
```bash
# ❌ CATASTROPHIC - Deletes other agents' work
git push --force origin main

# ❌ DANGEROUS - Can still cause data loss
git push --force-with-lease origin main  # Only for feature branches!

# ❌ BAD - Creates messy merge commits
git pull origin main  # Without --rebase
```

**Why These are Forbidden**:
- `--force`: Overwrites remote, deletes other commits
- `--force-with-lease`: Safer but still risky on main
- `pull` without `--rebase`: Creates merge commits (violates linear history)

---

## 4. Rebase Rules

### 4.1 When to Rebase

**Required**:
- Before pushing to main (if behind remote)
- Updating feature branch with main changes
- Cleaning up commit history before merge

**Optional**:
- Squashing multiple WIP commits
- Rewording commit messages
- Reordering commits for logical flow

**Forbidden**:
- Rebasing shared branches (others have pulled)
- Rebasing after pushing to main (rewrite history)
- Interactive rebase on main (use feature branches)

### 4.2 Rebase Types

| Type | Command | Use Case | Risk |
|------|---------|----------|------|
| **Standard** | `git pull --rebase origin main` | Update with remote | Low |
| **Interactive** | `git rebase -i origin/main` | Clean commit history | Medium |
| **Onto** | `git rebase --onto new-base old-base` | Change base branch | High |

### 4.3 Interactive Rebase Commands

**In rebase editor** (opens with `git rebase -i`):

```
pick abc1234 feat: add component
squash def5678 fix: typo in component
reword ghi9012 docs: update README
edit jkl3456 refactor: cleanup
drop mno7890 WIP: temp debug code
```

**Commands**:
- `pick`: Keep commit as-is
- `reword`: Edit commit message
- `edit`: Stop for amendments
- `squash`: Merge into previous commit (keep message)
- `fixup`: Merge into previous commit (discard message)
- `drop`: Delete commit entirely

### 4.4 Rebase Conflict Resolution

**Step-by-Step**:

```bash
# 1. Start rebase
git pull --rebase origin main

# 2. If conflicts:
# CONFLICT (content): Merge conflict in src/app/page.tsx
# error: could not apply abc1234... feat: add feature

# 3. Open conflicted file, look for markers:
<<<<<<< HEAD (current change - remote)
const version = "2.0";
=======
const version = "1.5";
>>>>>>> abc1234 (incoming change - yours)

# 4. Edit to resolve (choose one or merge both)
const version = "2.0";  # Keep remote version

# 5. Stage resolved file
git add src/app/page.tsx

# 6. Continue rebase
git rebase --continue

# 7. Repeat steps 3-6 if more conflicts
# 8. Once done, verify and push
pnpm build && git push origin main
```

### 4.5 Aborting Rebase

**If rebase goes wrong**, abort and try again:

```bash
# Stop rebase and return to pre-rebase state
git rebase --abort

# Alternative: Skip problematic commit
git rebase --skip  # Use with caution

# Check what happened
git reflog  # Shows all recent HEAD movements
```

---

## 5. Conflict Resolution

### 5.1 Conflict Types

| Type | Cause | Severity | Resolution |
|------|-------|----------|------------|
| **Content** | Same lines modified | Medium | Manual merge |
| **File Move** | Same file renamed differently | Low | Choose one name |
| **Deletion** | One deleted, one modified | High | Manual decision |
| **Merge Base** | Complex history divergence | Critical | Escalate to senior |

### 5.2 Content Conflict Resolution

**Example Scenario**: Both CC and BB modified `page.tsx`

**Conflict Markers**:
```typescript
<<<<<<< HEAD (origin/main - BB's version)
export default function Page() {
  return <CartDrawer />;
}
=======
export default function Page() {
  return <FavoritesButton />;
}
>>>>>>> abc1234 (your commit - CC's version)
```

**Resolution Strategies**:

**Strategy 1: Keep Remote (BB's version)**
```typescript
export default function Page() {
  return <CartDrawer />;
}
```

**Strategy 2: Keep Yours (CC's version)**
```typescript
export default function Page() {
  return <FavoritesButton />;
}
```

**Strategy 3: Merge Both**
```typescript
export default function Page() {
  return (
    <>
      <CartDrawer />
      <FavoritesButton />
    </>
  );
}
```

**After Resolution**:
```bash
git add src/app/page.tsx
git rebase --continue
```

### 5.3 Binary File Conflicts

**Cannot auto-merge** (images, PDFs, etc.):

```bash
# Choose remote version
git checkout --theirs path/to/image.png

# Choose your version
git checkout --ours path/to/image.png

# Stage choice
git add path/to/image.png
git rebase --continue
```

### 5.4 Complex Conflicts

**If conflicts are overwhelming**:

1. **Abort and Coordinate**:
   ```bash
   git rebase --abort
   # Message other agent: "I'm getting conflicts in X file, let's coordinate"
   ```

2. **Use Feature Branch**:
   ```bash
   git checkout -b cc/conflict-resolution-temp
   git rebase origin/main
   # Resolve conflicts carefully
   # When done, force-push feature branch
   git push --force-with-lease origin cc/conflict-resolution-temp
   # Create PR for review
   ```

3. **Escalate**:
   - Tag senior developer in GitHub issue
   - Document conflict in `docs/incidents/`
   - Schedule pair-programming session

---

## 6. Multi-Agent Coordination

### 6.1 Push Coordination Protocol

**Before pushing to main**, check recent activity:

```bash
# Step 1: Check HANDOFF_STATUS.md
cat docs/HANDOFF_STATUS.md | grep "Recent Pushes"

# Step 2: If push < 5 minutes ago, wait OR coordinate
# Example output:
# Recent Pushes:
# - 2026-01-05 12:08: BB pushed 520c392 (cart drawer)

# Step 3: If concurrent work suspected, fetch first
git fetch origin
git log HEAD..origin/main --oneline  # Check for new commits
```

### 6.2 Handoff Mechanism

**Update HANDOFF_STATUS.md** after every push:

```markdown
## Recent Pushes (Last 30 Minutes)
- 2026-01-05 12:09: CC pushed b32cbf6 (session handoff)
- 2026-01-05 12:08: BB pushed 520c392 (cart drawer)
```

**Agent Responsibility**:
- CC: Update after push
- BB: Update after push
- GC: Update after push
- All: Check before push

### 6.3 Simultaneous Push Prevention

**Scenario**: CC and BB both ready to push at same time

**Protocol**:
1. **First to Push Wins**:
   ```bash
   # BB pushes first (12:08:30)
   git push origin main  # SUCCESS
   ```

2. **Second Agent Gets Rejected**:
   ```bash
   # CC tries to push (12:08:45)
   git push origin main  # REJECTED (BB pushed 15 seconds ago)
   ```

3. **Second Agent Rebases**:
   ```bash
   # CC rebases on top of BB's commits
   git pull --rebase origin main
   pnpm build  # Re-verify
   git push origin main  # SUCCESS
   ```

**Result**: Linear history maintained ✓

### 6.4 Communication Channels

**For coordination**:
- `docs/HANDOFF_STATUS.md` - Async push notifications
- GitHub Issues - Feature planning
- Slack/Discord (if configured) - Real-time alerts
- PR Comments - Code review discussions

---

## 7. Emergency Procedures

### 7.1 Accidental Force Push to Main

**Symptoms**: Remote main diverged, other agents' commits missing

**Recovery** (within 5 minutes):

```bash
# Step 1: Find previous state
git reflog show origin/main
# Identify SHA before force push (e.g., c9afcec)

# Step 2: Force push back to previous state
git push --force origin main c9afcec:refs/heads/main

# Step 3: Notify all agents immediately
# Update HANDOFF_STATUS.md:
# ⚠️ EMERGENCY: Main branch restored to c9afcec (BB's cart drawer commit)
# ⚠️ If you pulled after 12:10, reset to c9afcec: git reset --hard c9afcec

# Step 4: Create incident report
# docs/incidents/2026-01-05-FORCE-PUSH-INCIDENT.md
```

### 7.2 Lost Commits Recovery

**Scenario**: Your commits disappeared after rebase/reset

**Recovery**:

```bash
# Step 1: Check reflog (local Git history)
git reflog

# Output shows all recent HEAD positions:
# b32cbf6 HEAD@{0}: push: session handoff
# 411e243 HEAD@{1}: commit: fix 404 pages
# bb83b1c HEAD@{2}: checkout: moving from main to main

# Step 2: Find lost commit SHA
# Identify commit you want to recover (e.g., 411e243)

# Step 3: Create recovery branch
git checkout -b recovery/lost-commits
git reset --hard 411e243

# Step 4: Cherry-pick to main
git checkout main
git cherry-pick 411e243
git push origin main
```

### 7.3 Broken Main Branch

**Symptoms**: Build fails, tests fail, critical bug in production

**Emergency Revert**:

```bash
# Step 1: Identify bad commit
git log --oneline -10
# Find commit that broke main (e.g., abc1234)

# Step 2: Revert commit (creates new commit)
git revert abc1234
# This creates revert commit that undoes abc1234

# Step 3: Push revert
git push origin main

# Step 4: Fix properly on feature branch
git checkout -b cc/fix-bug-properly
# Make proper fix
git commit -m "fix: proper fix for issue caused by abc1234"
git push origin cc/fix-bug-properly
# Create PR for review
```

### 7.4 Stuck in Rebase Loop

**Symptoms**: Multiple conflicts, can't continue or abort

**Escape**:

```bash
# Step 1: Abort current rebase
git rebase --abort

# Step 2: Soft reset to before rebase
git reflog  # Find pre-rebase state
git reset --soft HEAD@{5}  # Adjust number

# Step 3: Create feature branch
git checkout -b cc/complex-rebase-temp

# Step 4: Try again with merge (temporary)
git merge origin/main
# Resolve conflicts
git push origin cc/complex-rebase-temp

# Step 5: Squash merge to main (preserves linear history)
git checkout main
git pull --rebase origin main
git merge --squash cc/complex-rebase-temp
git commit -m "feat: merge complex feature (squashed)"
git push origin main
```

---

## 8. Verification Checklists

### 8.1 Pre-Push Checklist

Before `git push origin main`:

- [ ] Working tree clean (`git status` shows no uncommitted changes)
- [ ] Fetched remote (`git fetch origin`)
- [ ] Not behind remote (`git log HEAD..origin/main` is empty)
- [ ] Build passes (`pnpm build` exits 0)
- [ ] Lint passes (`pnpm lint` exits 0)
- [ ] Tests pass (if test suite exists)
- [ ] Commit messages follow convention
- [ ] HANDOFF_STATUS.md checked for recent pushes
- [ ] Pre-push hook enabled (`.husky/pre-push` exists)

### 8.2 Post-Push Checklist

After `git push origin main`:

- [ ] Push succeeded (no errors)
- [ ] GitHub shows new commits
- [ ] CI/CD pipeline passing (if configured)
- [ ] HANDOFF_STATUS.md updated with push notification
- [ ] Local and remote in sync (`git status` shows "up to date")

### 8.3 Pre-Merge Checklist

Before merging feature branch:

- [ ] Feature branch rebased on latest main
- [ ] All commits squashed/cleaned up
- [ ] Build passes on feature branch
- [ ] Tests pass on feature branch
- [ ] No merge conflicts
- [ ] PR approved (if using PRs)
- [ ] Documentation updated

### 8.4 Emergency Recovery Checklist

If disaster strikes:

- [ ] Stay calm - Git rarely loses data
- [ ] DON'T make it worse (no more force pushes)
- [ ] Check `git reflog` for lost commits
- [ ] Notify other agents immediately
- [ ] Create incident report
- [ ] Recover from reflog if needed
- [ ] Document what went wrong
- [ ] Update this policy to prevent recurrence

---

## Appendix A: Command Quick Reference

```bash
# === DAILY WORKFLOW ===

# Start work (always pull first)
git pull --rebase origin main

# Make changes and commit
git add <files>
git commit -m "feat(scope): description"

# Push (safe method)
./scripts/safe-push.sh

# Push (manual method)
git fetch origin
git log HEAD..origin/main --oneline  # Should be empty
git push origin main


# === REBASE WORKFLOW ===

# Update with remote changes
git pull --rebase origin main

# If conflicts, resolve them:
# 1. Edit conflicted files
# 2. git add <resolved-files>
# 3. git rebase --continue

# Abort if stuck
git rebase --abort


# === BRANCH WORKFLOW ===

# Create feature branch
git checkout -b cc/my-feature

# Keep feature updated with main
git fetch origin
git rebase origin/main

# Push feature branch
git push -u origin cc/my-feature

# Merge feature to main
git checkout main
git pull --rebase origin main
git merge --squash cc/my-feature
git commit -m "feat: description"
git push origin main


# === EMERGENCY RECOVERY ===

# Find lost commits
git reflog

# Recover lost commit
git checkout -b recovery
git reset --hard <sha>
git cherry-pick <sha>

# Revert bad commit
git revert <sha>
git push origin main
```

---

## Appendix B: Pre-Push Hook Code

**File**: `.husky/pre-push`

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"
. ~/.config/husky/init.sh  # Load PATH

BRANCH=$(git branch --show-current)

if [ "$BRANCH" = "main" ]; then
  echo "🛡️  Pre-push check: main branch detected"

  # Fetch latest origin/main
  git fetch origin main --quiet

  # Check if local is behind remote
  LOCAL=$(git rev-parse HEAD)
  REMOTE=$(git rev-parse origin/main)
  BASE=$(git merge-base HEAD origin/main)

  if [ "$LOCAL" != "$REMOTE" ] && [ "$BASE" != "$REMOTE" ]; then
    echo "❌ ERROR: origin/main has new commits."
    echo "❌ Run: git pull --rebase origin main"
    echo ""
    echo "Remote commits you're missing:"
    git log --oneline HEAD..origin/main
    exit 1
  fi

  echo "✅ Safe to push to main"
fi
```

---

**Document Maintained By**: CC (Claude Code)
**Last Incident**: 2026-01-05 (Rebase conflict, resolved)
**Next Review**: After next Git incident (or 30 days)
**Version History**:
- 1.0 (2026-01-05): Initial comprehensive policy created

**END OF GIT WORKFLOW RULES**
