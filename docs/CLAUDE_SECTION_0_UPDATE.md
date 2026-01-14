# CLAUDE.md Section 0 - Mandatory Workflow Guardrails

**Purpose**: This document contains the proposed "Section 0" to be inserted at the very top of CLAUDE.md, before Section 1 (Operating Instructions).

**Authority**: CC only
**Status**: DRAFT (awaiting user approval for insertion)
**Created**: 2026-01-14 1045 EET

---

## Proposed Section 0 Content

```markdown
# SECTION 0: MANDATORY WORKFLOW GUARDRAILS (READ BEFORE EVERY TASK)

**⚠️ CRITICAL**: This section MUST be read before executing ANY task, regardless of urgency.

---

## Rule 1: VERIFY → TRUST → ACT (Never Skip VERIFY)

**VERIFY** (Always First):
```bash
# Verification Checklist (30 seconds)
git status                    # Check working tree state
git log --oneline -5          # Recent commits context
wc -l CLAUDE.md               # Verify brain size (~650 lines)
grep "package-name" package.json  # Before using any package
ls -la src/lib/               # Before creating utilities
```

**TRUST** (After Verification):
- Trust verified versions from package.json (not artifact claims)
- Trust existing patterns found in codebase (grep results)
- Trust build results (exit codes, not guesses)
- Trust user requirements (ask if <95% confident)

**ACT** (Only After VERIFY + TRUST):
- Execute planned changes
- Run build quality gates (3 required)
- Update documentation (performance log, todos)
- Commit with descriptive message

**VIOLATION EXAMPLES**:
```typescript
// ❌ WRONG: Skip VERIFY, create duplicate utility
import { createClient } from '@/lib/supabase/client'  // File doesn't exist!

// ✅ CORRECT: VERIFY first, use existing
ls -la src/lib/  // Shows supabase.ts exists
import { createClient } from '@/lib/supabase'  // Works!
```

---

## Rule 2: Build Quality Gates (Required Before EVERY Commit)

```bash
# Gate 1: TypeScript (no type errors)
npx tsc --noEmit
# Exit 0 required

# Gate 2: Production Build (no build errors)
npx next build
# Exit 0 required, ~23 routes compiled

# Gate 3: Linting (no errors, warnings OK)
pnpm lint
# Exit 0 required
```

**VIOLATION CONSEQUENCES**:
- Skip local build → CI fails → broken deployment → rollback required
- Real example: 3 consecutive broken deploys (d256f74, 7a98c8a, 0b8baba) due to skipped builds

---

## Rule 3: Documentation Discipline (No Undocumented Work)

**REQUIRED Updates** (per task):

1. **Performance Log** (tasks >15 min):
   ```markdown
   ## YYYY-MM-DD HHMM TZ - {AGENT} - {Task Title}
   **Timebox**: X min | **Actual**: Y min | **Status**: ✅/⚠️/❌
   [Problem, Solution, Verification, Files, Lessons]
   ```

2. **Todo List** (multi-step tasks):
   - Create at task start (3+ steps)
   - Mark in_progress when starting
   - Mark completed IMMEDIATELY after finishing (no batching)
   - ONE task in_progress at a time

3. **Session Timeline** (session end):
   - Append to CLAUDE.md Section 8 (2-line compressed format)
   - Sync to GEMINI.md/BLACKBOX.md if multi-agent

**VIOLATION**: Undocumented work = lost context, duplicate efforts, no lessons learned.

---

## Rule 4: Prohibited Actions (Anti-Patterns)

**FORBIDDEN** ⛔:

1. **Autonomous Scope Reduction**
   ```
   Given: 6 tasks in emergency prompt
   ❌ Wrong: Complete 1 task → declare "MISSION COMPLETE"
   ✅ Correct: Complete ALL 6 tasks or explicitly document why stopped
   ```
   Real incident: 2026-01-14 CC completed 1 of 6 tasks, user had to intervene.

2. **Skipping Verification Phase**
   ```bash
   ❌ Wrong: Assume package installed → write import → build fails
   ✅ Correct: grep "package-name" package.json → confirm → then code
   ```

3. **Creating Duplicate Utilities**
   ```bash
   ❌ Wrong: Create src/lib/supabase/client.ts without checking
   ✅ Correct: ls -la src/lib/ && grep -r "createClient" src/ first
   ```

4. **Pushing Without Build**
   ```bash
   ❌ Wrong: git add . && git commit && git push (no verification)
   ✅ Correct: tsc && next build && pnpm lint → THEN push
   ```

5. **Premature Completion Declaration**
   ```
   ❌ Wrong: Fix 1 of 5 broken deployments → "Done!"
   ✅ Correct: Fix all 5, verify all 5, THEN declare complete
   ```

6. **Force Push to Main**
   ```bash
   ❌ Wrong: git push --force origin main
   ✅ Correct: git push --force-with-lease origin feature-branch
   ```

7. **Code Changes in Doc-Only Tasks**
   ```
   ❌ Wrong: Fix typo in code during documentation sprint
   ✅ Correct: Document issue, create separate task for code fix
   ```

8. **Ignoring Multi-Task Prompts**
   ```
   Given: Emergency prompt with 6 tasks
   ❌ Wrong: Pick easiest task, skip the rest
   ✅ Correct: Execute ALL tasks sequentially, ask if unclear
   ```

9. **Estimating Instead of Measuring**
   ```
   ❌ Wrong: "approximately 500 lines"
   ✅ Correct: wc -l file.ts → "exactly 527 lines"
   ```

10. **Fabricating Metrics**
    ```
    ❌ Wrong: "probably 200 vehicles in DB"
    ✅ Correct: curl Supabase API or explicitly state "unverified"
    ```

---

## Rule 5: Multi-Agent Coordination

**Session Start Health Check** (multi-agent environment):
```bash
git status                    # Check for uncommitted work
git log --oneline -5          # Recent activity
cat docs/HANDOFF_STATUS.md    # Check concurrent work
git fetch origin && git log HEAD..origin/main --oneline  # Remote changes
```

**Before Pushing to Main**:
```bash
git fetch origin
git log HEAD..origin/main --oneline
# If ANY commits shown: STOP, rebase first
git pull --rebase origin main  # Replay your commits on top
pnpm build                     # Re-verify after rebase
git push origin main           # Now safe
```

**Agent Handoff Protocol**:
1. Push changes to feature branch
2. Update HANDOFF_STATUS.md (branch, SHA, pending tasks)
3. Sync CLAUDE.md additions (ADD ONLY, never delete existing content)
4. Next agent reads HANDOFF_STATUS before starting

---

## Rule 6: Emergency Rollback Protocol

**ONLY** use when:
- ✅ Production critically broken (500 errors, blank pages)
- ✅ Current commit verified broken
- ✅ Previous commit verified working

**NEVER**:
- ❌ Rollback based on assumption (must verify production broken)
- ❌ Force push to main without user approval
- ❌ Delete commits (use `git revert` instead)

**Correct Procedure**:
```bash
# Step 1: Verify production broken
curl -sI https://hex-test-drive-man.vercel.app
# Expect: 500 or timeout (not 200!)

# Step 2: Identify last known good commit
git log --oneline -10

# Step 3: Create revert (not force push)
git checkout -b emergency/rollback-{issue}
git revert {bad-commit-sha}
git push -u origin emergency/rollback-{issue}

# Step 4: Emergency PR
gh pr create --title "emergency: rollback {issue}" --body "..."

# Step 5: Document incident
# docs/incidents/YYYY-MM-DD-{ISSUE}.md
```

---

## Quick Reference Card

**Every Task Starts With**:
1. ✅ Read this Section 0 (2 min)
2. ✅ Read CLAUDE.md Section 1 (Operating Instructions)
3. ✅ Run verification commands (30 sec)
4. ✅ Check docs/PROMPT_FIXTURES.md for task-specific patterns

**Every Task Ends With**:
1. ✅ Run 3 build gates (tsc, build, lint)
2. ✅ Update performance log (if >15 min)
3. ✅ Update todo list (mark completed)
4. ✅ Commit with descriptive message
5. ✅ Push to feature branch (or main if approved)

**If Uncertain** (<95% confidence):
1. ❌ Don't guess
2. ❌ Don't assume
3. ✅ ASK user with AskUserQuestion tool
4. ✅ Or provide exact verification commands for user to run

---

## Compliance

**Authority**: CC owns Section 0, all agents must comply.

**Violations**:
- Document in docs/PERFORMANCE_LOG.md
- Add to docs/context/LESSONS_LEARNED.md if causes incident
- Update Section 0 with prevention measures

**Updates**:
- Only CC may modify Section 0
- Version bump CLAUDE.md on every change
- Sync to GEMINI.md/BLACKBOX.md references

---

**END OF SECTION 0 - MANDATORY WORKFLOW GUARDRAILS**
```

---

## Integration Instructions

**Option A**: Insert at top of CLAUDE.md (before current Section 1)
- Renumber: Current Section 1 → Section 1, etc.
- Add reference: "See Section 0 for mandatory workflow"

**Option B**: Keep as standalone reference document
- Add link in CLAUDE.md Section 1: "Full workflow: docs/CLAUDE_SECTION_0_UPDATE.md"
- Advantage: Keeps CLAUDE.md at ~650 line target

**Recommendation**: Option B (standalone reference) to maintain CLAUDE.md pruned edition size.

---

## Change Log

- **2026-01-14 1045 EET**: Created from emergency prompt requirements (CC)
- Synthesizes lessons from:
  - 3 broken deployments (d256f74, 7a98c8a, 0b8baba)
  - CC scope reduction incident (1 of 6 tasks completed)
  - Duplicate utility creation patterns
  - Multi-agent coordination issues

**Next**: User approval for integration method (Option A vs B).
