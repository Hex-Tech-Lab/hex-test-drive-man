# Prompt Fixtures - Universal Agent Template System

**Version**: 2.0
**Last Updated**: 2026-01-14 1045 EET
**Authority**: CC only (GC/BB/CCW use but never modify)
**Status**: ACTIVE

---

## Purpose

This document provides **universal prompt fixtures** that MUST be incorporated into every agent prompt (CC, GC, BB, CCW, PPLX). These fixtures enforce:

1. **Verification-first workflow** (VERIFY → TRUST → ACT)
2. **Build quality gates** (local + CI)
3. **Documentation discipline** (performance logs, todos, session updates)
4. **Prohibited actions** (anti-patterns, scope reduction)

---

## FIXTURE 1: VERIFY → TRUST → ACT Pattern

**MANDATORY**: Every task MUST follow this 3-phase workflow.

```
PHASE 1: VERIFY (Always First)
├─ Read CLAUDE.md Section 1 (Operating Instructions)
├─ Check git status + recent commits
├─ Verify package.json versions (not artifacts)
├─ Read target files before modifications
└─ Confirm task scope alignment

PHASE 2: TRUST (After Verification)
├─ Trust verified versions
├─ Trust existing patterns in codebase
├─ Trust build results (not guesses)
└─ Trust user requirements (ask if <95% confident)

PHASE 3: ACT (Only After Phases 1-2)
├─ Execute planned changes
├─ Verify with build gates
├─ Update documentation
├─ Commit with descriptive message
└─ Create PR or push to main (per workflow)
```

**VIOLATION**: Skipping VERIFY phase = high risk of:
- Duplicate utilities (e.g., creating supabase client when one exists)
- Package not installed errors
- Breaking working code
- Wasted time debugging preventable issues

---

## FIXTURE 2: Build Quality Gates

**MANDATORY**: Run these checks before EVERY commit/push:

```bash
# Gate 1: TypeScript compilation
npx tsc --noEmit
# Exit 0 required

# Gate 2: Production build
npx next build
# Exit 0 required

# Gate 3: Linting
pnpm lint
# Exit 0 required (warnings OK, errors block)

# Gate 4: Config syntax (if config modified)
node -c next.config.mjs
# Exit 0 required
```

**VIOLATION**: Pushing without local build = CI failures, broken deployments, rollback required.

---

## FIXTURE 3: Documentation Discipline

**MANDATORY**: Update these files during/after task execution:

### Performance Log Entry (REQUIRED for tasks >15 min)
```markdown
## YYYY-MM-DD HHMM TZ - {AGENT} - {Task Title}

**Agent**: {CC|GC|BB|CCW|PPLX}
**Task**: {1-line description}
**Timebox**: {X minutes allocated}
**Actual**: {Y minutes actual}
**Status**: {✅ SUCCESS | ⚠️ PARTIAL | ❌ FAILED}

### Problem
{What needed fixing/building}

### Solution
{What was done, key decisions}

### Verification
{Build results, test results, manual checks}

### Files Modified
- {file1}: {+X/-Y lines, purpose}
- {file2}: {+A/-B lines, purpose}

### Lessons Learned
{What went wrong, what to do differently next time}
```

### Todo List Updates (REQUIRED for multi-step tasks)
- Create todo list at task start (3+ steps)
- Mark in_progress when starting a task
- Mark completed IMMEDIATELY after finishing (no batching)
- ONE task in_progress at a time

### Session Timeline (REQUIRED at session end)
- Append to CLAUDE.md Section 8 (compressed format: 2 lines per session)
- Include: date, agent, duration, key outcomes, files touched, status
- Sync to GEMINI.md/BLACKBOX.md if multi-agent session

---

## FIXTURE 4: Prohibited Actions

**FORBIDDEN** (causes degradation, rollbacks, wasted effort):

1. ❌ **Autonomous Scope Reduction**
   - Given: 6 tasks in emergency prompt
   - Wrong: Complete 1 task, declare "MISSION COMPLETE"
   - Correct: Complete ALL tasks or explicitly document why stopped

2. ❌ **Skipping Verification**
   - Wrong: Assume package installed, write import
   - Correct: `grep "package-name" package.json` first

3. ❌ **Creating Duplicate Utilities**
   - Wrong: Create new `src/lib/supabase/client.ts` without checking existing
   - Correct: `ls -la src/lib/` and `grep -r "createClient" src/` first

4. ❌ **Pushing Without Build**
   - Wrong: `git push` immediately after code change
   - Correct: Run all 3 build gates (tsc, next build, lint)

5. ❌ **Premature Completion Declaration**
   - Wrong: "Done!" after fixing 1 of 5 broken deployments
   - Correct: Fix all, verify all, then declare complete

6. ❌ **Force Push to Main**
   - Wrong: `git push --force origin main`
   - Correct: `git push --force-with-lease` on feature branches only

7. ❌ **Ignoring Multi-Task Prompts**
   - Wrong: Pick the "easiest" task, skip the rest
   - Correct: Execute ALL tasks in order, or ask if unclear

8. ❌ **Code Changes in Doc-Only Tasks**
   - Wrong: Fix typo in code during documentation task
   - Correct: Document issue, create separate task for code fix

9. ❌ **Line Count Estimation**
   - Wrong: "approximately 500 lines"
   - Correct: `wc -l file.ts` → "exactly 527 lines"

10. ❌ **Fabricating Metrics**
    - Wrong: "probably 200 vehicles in DB"
    - Correct: Query Supabase API or admit "unverified"

---

## FIXTURE 5: Multi-Agent Coordination

**MANDATORY** for sessions involving GC/BB/CCW:

```bash
# Session Start Health Check
git status
git log --oneline -5
wc -l CLAUDE.md
grep -c '^NEXT_PUBLIC' .env.local

# Check for concurrent work
cat docs/HANDOFF_STATUS.md

# Before pushing to main
git fetch origin
git log HEAD..origin/main --oneline
# If ANY commits shown: rebase first
git pull --rebase origin main
```

**Agent Handoff Protocol**:
1. Push changes to feature branch
2. Update HANDOFF_STATUS.md with branch name, commit SHA, pending tasks
3. Sync CLAUDE.md additions (ADD ONLY, never delete)
4. Next agent reads HANDOFF_STATUS before starting

---

## FIXTURE 6: Emergency Rollback Protocol

**ONLY** use when:
- Production critically broken (500 errors, blank pages)
- Current commit verified broken
- Previous commit verified working

```bash
# Step 1: Verify current state broken
curl -sI https://hex-test-drive-man.vercel.app
# Expect: 500 or timeout

# Step 2: Identify last known good commit
git log --oneline -10
# Find commit before breakage

# Step 3: Rollback (feature branch method)
git checkout -b emergency/rollback-{issue}
git revert {bad-commit-sha}
git push -u origin emergency/rollback-{issue}

# Step 4: Create emergency PR
gh pr create --title "emergency: rollback {issue}" --body "..."

# Step 5: Document in incident report
# docs/incidents/YYYY-MM-DD-{ISSUE}.md
```

**NEVER**:
- Force push to main without user approval
- Rollback without verifying production broken
- Delete commits (use `git revert` instead)

---

## Usage Examples

### Example 1: Creating New Feature
```
VERIFY:
- Read CLAUDE.md Section 1 ✓
- git status (clean) ✓
- Check existing patterns: grep -r "similar-feature" src/ ✓
- Package installed: grep "new-package" package.json ✓

TRUST:
- Use existing pattern from src/lib/helper.ts
- Package version from package.json: 2.1.0

ACT:
- Create src/components/NewFeature.tsx
- npx tsc --noEmit (exit 0) ✓
- npx next build (exit 0) ✓
- pnpm lint (0 errors) ✓
- git commit -m "feat(ui): add new feature"
- Update docs/PERFORMANCE_LOG.md
```

### Example 2: Emergency Fix (Multi-Task)
```
User Prompt: Fix 5 broken deployments
CC Response:
1. Create todo list (5 tasks) ✓
2. Mark TASK1 in_progress
3. Fix deployment 1
4. Mark TASK1 completed
5. Mark TASK2 in_progress
6. Fix deployment 2
... (continue for all 5)
7. ALL tasks completed → declare success
```

---

## Enforcement

**Authority**: CC owns this document, all agents must comply.

**Violations**:
- Document in PERFORMANCE_LOG.md
- Add to LESSONS_LEARNED.md if causes incident
- Update this doc with prevention measures

**Updates**:
- Only CC may modify fixtures
- Version bump on every change
- Sync to CLAUDE.md Section 1 references

---

## Version History

- **v2.0** (2026-01-14): Created from emergency prompt, consolidated from scattered rules
- **v1.0** (2025-12-XX): Implicit in CLAUDE.md Section 1, never formalized

---

**END OF PROMPT FIXTURES v2.0**
