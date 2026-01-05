# Best Practices Repository - Architecture Design

**Version**: 1.0
**Author**: CC (Claude Code)
**Date**: 2026-01-05
**Status**: ACTIVE - Ready for BB consolidation
**Purpose**: Living repository of project-specific lessons, anti-patterns, and solutions

---

## Table of Contents

1. [Repository Structure](#repository-structure)
2. [Indexing Strategy](#indexing-strategy)
3. [Update Protocol](#update-protocol)
4. [Integration Plan](#integration-plan)
5. [Template Standards](#template-standards)
6. [Quality Gates](#quality-gates)

---

## Repository Structure

### Directory Tree

```
docs/best-practices/
├── INDEX.md                               # Master searchable index (problem → solution)
├── ARCHITECTURE.md                        # This file (design rationale)
├── LESSON_ENTRY_TEMPLATE.md              # Standard format for new lessons
├── BEST_PRACTICE_ADDITION_CHECKLIST.md   # When/how to add lessons
│
├── git-workflows/                         # Git operations & multi-agent coordination
│   ├── REBASE_NORMAL_WORKFLOW.md         # Normal rebase is NOT an error
│   ├── PRE_PUSH_AUTOMATION.md            # Automated safety checks
│   ├── MULTI_AGENT_COORDINATION.md       # Concurrent development patterns
│   ├── DESTRUCTIVE_OPERATIONS.md         # git reset --hard, clean -fd warnings
│   └── EMERGENCY_RECOVERY.md             # Lost commits, reflog usage
│
├── debugging/                             # Troubleshooting patterns
│   ├── ROUTER_VS_HISTORY_API.md          # router.push() vs router.replace()
│   ├── ZUSTAND_PERSISTENCE_ISSUES.md     # localStorage not saving
│   ├── BUILD_FAILURES.md                 # CI/CD debugging workflow
│   ├── SLUG_PARSING_MISMATCH.md          # Hyphen vs space in URLs
│   └── INFINITE_LOOP_PREVENTION.md       # onError handler guards
│
├── performance/                           # Efficiency & process
│   ├── TIMEBOX_DISCIPLINE.md             # Finishing under budget patterns
│   ├── VERIFICATION_BEFORE_PLAN.md       # Read first, verify, then act
│   ├── PREFLIGHT_CHECKLIST.md            # Mandatory pre-task steps
│   └── TROUBLESHOOTING_LOOPS.md          # How to avoid debugging spirals
│
├── documentation/                         # Content & knowledge management
│   ├── INCREMENTAL_VS_BULK_UPDATES.md    # Process each input immediately
│   ├── CONTENT_PRESERVATION.md           # Version bumps ADD, never compress
│   ├── EXACT_COUNTS_NOT_ESTIMATES.md     # wc -l, not guesses
│   └── VERIFICATION_MANDATE.md           # Never fabricate metrics
│
└── agent-specific/                        # Agent strengths & lessons
    ├── CC_LESSONS.md                     # Claude Code patterns
    ├── BB_LESSONS.md                     # Blackbox patterns
    ├── GC_LESSONS.md                     # Gemini CLI patterns
    └── MULTI_AGENT_STRENGTHS.md          # Task assignment decision matrix
```

---

## Indexing Strategy

### Problem-Symptom Based Index

**Rationale**: Agents search by what they observe, not by category names.

**INDEX.md Format**:
```markdown
# Best Practices Index - Quick Reference

**Last Updated**: 2026-01-05
**Entries**: 15 lessons (initial consolidation)
**Search Tip**: Use Ctrl+F to find symptoms, then jump to solution

---

## Quick Search by Symptom

| Symptom/Error | Root Cause | Solution | File |
|---------------|------------|----------|------|
| `git push rejected: fetch first` | Concurrent development | Pre-push hook automation | [git-workflows/PRE_PUSH_AUTOMATION.md](git-workflows/PRE_PUSH_AUTOMATION.md) |
| Language switch reloads page | router.push() forces reload | Use router.replace() | [debugging/ROUTER_VS_HISTORY_API.md](debugging/ROUTER_VS_HISTORY_API.md) |
| Build fails but no error logs shown | Didn't fetch CI logs first | Use gh pr checks, gh run view | [debugging/BUILD_FAILURES.md](debugging/BUILD_FAILURES.md) |
| Zustand store not persisting | React 19 strict mode issue | Verify localStorage keys | [debugging/ZUSTAND_PERSISTENCE_ISSUES.md](debugging/ZUSTAND_PERSISTENCE_ISSUES.md) |
| Git reset lost uncommitted changes | Destructive without git status | ALWAYS git status before reset | [git-workflows/DESTRUCTIVE_OPERATIONS.md](git-workflows/DESTRUCTIVE_OPERATIONS.md) |
| 404 on vehicle page (Uni-T, Uni-V) | Slug hyphen vs space mismatch | Dual-query fallback pattern | [debugging/SLUG_PARSING_MISMATCH.md](debugging/SLUG_PARSING_MISMATCH.md) |
| Gray placeholder images showing | Missing srcSet + onError guard | Retina srcSet + loop prevention | [debugging/INFINITE_LOOP_PREVENTION.md](debugging/INFINITE_LOOP_PREVENTION.md) |
| pnpm not found in Husky hook | Non-interactive shell PATH | Create ~/.config/husky/init.sh | [git-workflows/HUSKY_ENVIRONMENT.md](git-workflows/HUSKY_ENVIRONMENT.md) |
| CLAUDE.md lost 567 lines | Version bump compression | ADD new sections, preserve old | [documentation/CONTENT_PRESERVATION.md](documentation/CONTENT_PRESERVATION.md) |
| User said "wait for all inputs" is anti-pattern | Incremental vs bulk processing | Process each input immediately | [documentation/INCREMENTAL_VS_BULK_UPDATES.md](documentation/INCREMENTAL_VS_BULK_UPDATES.md) |

---

## Search by Category

### Git Workflows (5 lessons)
- [REBASE_NORMAL_WORKFLOW.md](git-workflows/REBASE_NORMAL_WORKFLOW.md) - Concurrent development rebase is correct
- [PRE_PUSH_AUTOMATION.md](git-workflows/PRE_PUSH_AUTOMATION.md) - Hook blocks unsafe pushes
- [MULTI_AGENT_COORDINATION.md](git-workflows/MULTI_AGENT_COORDINATION.md) - HANDOFF_STATUS usage
- [DESTRUCTIVE_OPERATIONS.md](git-workflows/DESTRUCTIVE_OPERATIONS.md) - git reset/clean warnings
- [HUSKY_ENVIRONMENT.md](git-workflows/HUSKY_ENVIRONMENT.md) - PATH issues in hooks

### Debugging (5 lessons)
- [ROUTER_VS_HISTORY_API.md](debugging/ROUTER_VS_HISTORY_API.md) - Language switch fix
- [BUILD_FAILURES.md](debugging/BUILD_FAILURES.md) - CI/CD diagnostic workflow
- [SLUG_PARSING_MISMATCH.md](debugging/SLUG_PARSING_MISMATCH.md) - URL-to-DB query issues
- [INFINITE_LOOP_PREVENTION.md](debugging/INFINITE_LOOP_PREVENTION.md) - onError handler patterns
- [ZUSTAND_PERSISTENCE_ISSUES.md](debugging/ZUSTAND_PERSISTENCE_ISSUES.md) - localStorage debugging

### Performance (3 lessons)
- [TIMEBOX_DISCIPLINE.md](performance/TIMEBOX_DISCIPLINE.md) - BB's 67-87% efficiency patterns
- [VERIFICATION_BEFORE_PLAN.md](performance/VERIFICATION_BEFORE_PLAN.md) - Preflight investigation
- [TROUBLESHOOTING_LOOPS.md](performance/TROUBLESHOOTING_LOOPS.md) - CC's PR #11 failure analysis

### Documentation (2 lessons)
- [CONTENT_PRESERVATION.md](documentation/CONTENT_PRESERVATION.md) - Version bump = ADD not compress
- [INCREMENTAL_VS_BULK_UPDATES.md](documentation/INCREMENTAL_VS_BULK_UPDATES.md) - Process each input
```

**Cross-Reference Strategy**:
- Each lesson file has "Related Lessons" section at bottom
- Links to adjacent topics (e.g., slug parsing → database query patterns)
- Links to agent strengths (e.g., BB's forensic investigation for branch recovery)

---

## Update Protocol

### When to Add a New Lesson

**Mandatory Triggers** (MUST add):
1. ✅ User provides explicit feedback: "This is an anti-pattern"
2. ✅ Same mistake repeated by any agent 2+ times
3. ✅ Critical incident with data loss risk
4. ✅ Efficiency gain >50% (e.g., BB's 87% under budget)

**Optional Triggers** (SHOULD add):
1. Novel solution to common problem (e.g., dual-query fallback)
2. Edge case discovery (e.g., Husky PATH isolation)
3. Agent weakness identified (e.g., CC's PR #11 failure)

**Do NOT Add** (noise):
1. Generic programming knowledge (e.g., "use async/await")
2. Tool-specific docs (refer to official docs instead)
3. One-off edge cases with no recurrence risk

### How to Add a New Lesson

**Step 1: Use LESSON_ENTRY_TEMPLATE.md** (50-75 lines per lesson)

**Step 2: Update INDEX.md**
- Add row to "Quick Search by Symptom" table
- Add entry to category section
- Update "Entries" count in header

**Step 3: Add Cross-References**
- Update related lessons with link to new entry
- Add to agent-specific file if relevant (e.g., CC_LESSONS.md)

**Step 4: Commit Immediately**
```bash
git add docs/best-practices/
git commit -m "docs(best-practices): add [TOPIC] lesson from [AGENT] [DATE]"
git push origin main
```

### Quarterly Review Process

**When**: Last week of each quarter (March 31, June 30, Sept 30, Dec 31)
**Who**: CC (primary), user reviews final output

**Steps**:
1. **Prune stale entries**: Remove lessons for deprecated tech/workflows
2. **Consolidate duplicates**: Merge similar lessons
3. **Update cross-references**: Fix broken links
4. **Verify accuracy**: Check commands/code examples still work
5. **Update metrics**: Add new entries count, most-referenced lessons
6. **Archive old versions**: Save to `docs/best-practices/archive/YYYYQN/`

**Output**: QUARTERLY_REVIEW_YYYY_QN.md with summary of changes

---

## Integration Plan

### Phase 1: Update CLAUDE.md Section 1 (Mandatory Instructions)

**Addition** (lines 80-85, after "Verification Mandate"):
```markdown
### Best Practices First
- Before troubleshooting, search `docs/best-practices/INDEX.md` by symptom
- Before implementing, check category-specific lessons (git-workflows, debugging, etc.)
- If solution found: apply pattern, cite source (e.g., "per best-practices/debugging/SLUG_PARSING_MISMATCH.md")
- If no solution found: proceed with investigation, document new lesson after success
```

### Phase 2: Update AGENTS.md

**Addition** (each agent's section):
```markdown
### Agent-Specific Best Practices
- See: `docs/best-practices/agent-specific/[AGENT]_LESSONS.md`
- Review before starting session (5 min pre-flight)
- Add new lessons when discovering novel solutions
```

### Phase 3: Create Pre-Task Checklist

**File**: `docs/PRE_TASK_CHECKLIST.md` (new)
```markdown
# Pre-Task Checklist (All Agents)

## 1. Read CLAUDE.md Section 1 (Mandatory Instructions) ✅
## 2. Search docs/best-practices/INDEX.md for related lessons ✅
   - Search by symptom (e.g., "git push rejected")
   - Search by category (e.g., "debugging")
## 3. Review agent-specific lessons (docs/best-practices/agent-specific/) ✅
## 4. Check HANDOFF_STATUS.md for recent agent activity ✅
## 5. Run git status && git log --oneline -5 ✅
## 6. Proceed with task ✅
```

### Phase 4: Automation Hooks (Future)

**Concept**: Pre-commit hook that suggests relevant lessons
```bash
#!/bin/bash
# .husky/pre-commit-best-practices (future enhancement)

# Extract file paths from staged changes
CHANGED_FILES=$(git diff --cached --name-only)

# If git-related files changed, suggest git lessons
if echo "$CHANGED_FILES" | grep -q ".git"; then
  echo "💡 Tip: Review docs/best-practices/git-workflows/ before committing"
fi

# If debugging scripts created, suggest debugging lessons
if echo "$CHANGED_FILES" | grep -q "debug\|fix"; then
  echo "💡 Tip: Review docs/best-practices/debugging/ for patterns"
fi
```

---

## Template Standards

### LESSON_ENTRY_TEMPLATE.md Format

**See**: `docs/best-practices/LESSON_ENTRY_TEMPLATE.md` (50-75 lines)

**Required Sections**:
1. **Problem/Symptom** - What agent observed
2. **Context** - When does this happen?
3. **Root Cause** - Technical explanation
4. **Solution** - Step-by-step with code
5. **Prevention** - How to avoid in future
6. **Related Lessons** - Cross-references
7. **Metadata** - Agent/date/session

**Markdown Formatting**:
- Use fenced code blocks with language tags (bash, typescript, etc.)
- Use tables for comparison (before/after, do/don't)
- Use numbered lists for step-by-step procedures
- Use bullet lists for non-sequential items

**Example Structure**:
```markdown
# [TOPIC] - [Brief Description]

**Category**: [git-workflows|debugging|performance|documentation]
**Agent**: [CC|BB|GC|CCW]
**Date**: YYYY-MM-DD
**Session**: [Link to session log]

---

## Problem/Symptom

[What agent observed, exact error message, screenshot reference]

## Context

[When does this happen? Prerequisites? Environment?]

## Root Cause

[Technical explanation with source code references, file:line format]

## Solution

### Step-by-Step

1. [First step with code example]
2. [Second step]
...

### Code Example

```typescript
// Before (wrong)
const bad = example();

// After (correct)
const good = example();
```

## Prevention

- ✅ DO: [Correct practice]
- ❌ DON'T: [Anti-pattern]

## Related Lessons

- [Link to related lesson 1]
- [Link to related lesson 2]

---

**Contributed By**: [Agent] on [Date]
**Last Verified**: [Date agent confirmed solution still works]
```

---

## Quality Gates

### Before Adding to Repository

**Checklist**:
- [ ] Lesson uses LESSON_ENTRY_TEMPLATE.md format (50-75 lines)
- [ ] Problem statement is clear (agent can identify symptom)
- [ ] Root cause is technically accurate (not speculation)
- [ ] Solution includes code example or command
- [ ] Prevention section has actionable DO/DON'T items
- [ ] INDEX.md updated with new entry
- [ ] Cross-references added to related lessons
- [ ] Committed immediately (not batched)

### Annual Audit Criteria

**Metrics**:
- Entry count per category (target: 10-15 per category)
- Most-referenced lessons (top 10)
- Orphaned entries (no cross-references)
- Stale entries (>1 year, tech deprecated)
- Accuracy rate (spot-check 10 random lessons, verify commands work)

**Target Quality**:
- 95% accuracy (commands/code examples work)
- 80% have 2+ cross-references (not orphaned)
- <5% stale entries (removed or updated)

---

## Success Metrics

### Short-Term (30 days)

**Goals**:
- 15 lessons consolidated from existing docs (BB's task)
- INDEX.md searchable by 10+ symptoms
- CLAUDE.md Section 1 updated with best practices mandate
- All agents aware of new repository (mentioned in HANDOFF_STATUS.md)

**Measurement**:
- Lesson count: 0 → 15
- Agent adoption: 0/4 → 4/4 agents aware
- Search hits: Track git log searches for "best-practices/"

### Long-Term (90 days)

**Goals**:
- 30+ lessons (2x initial consolidation)
- Reduced repeat mistakes (same error <2x by any agent)
- Agent self-sufficiency (fewer "how do I..." questions)
- Quarterly review process established

**Measurement**:
- Lesson count: 15 → 30
- Repeat mistakes: Track in PERFORMANCE_LOG.md
- Agent questions: Subjective user feedback

---

## Rationale for Design Decisions

### Why Symptom-Based Index?

**Problem**: Agents search by what they see (error messages, unexpected behavior)
**Solution**: INDEX.md organized by symptom → root cause → solution
**Evidence**: CC's PR #11 failure - searched for "build fails" not "CI/CD patterns"

### Why Separate Category Directories?

**Problem**: Single file becomes unmaintainable at 50+ lessons
**Solution**: 5 categories with 10-15 lessons each (manageable chunks)
**Evidence**: CLAUDE.md bloat (2200 lines) - user requested pruning

### Why Mandatory Pre-Task Search?

**Problem**: Agents repeat same mistakes (git reset data loss, PR #11 loop)
**Solution**: Force check before starting work (5 min investment)
**Evidence**: 2/4 critical CLAUDE.md lessons are repeat mistakes

### Why Incremental Updates Not Quarterly Batch?

**Problem**: "Wait for all inputs then process" = anti-pattern (user feedback)
**Solution**: Commit each lesson immediately
**Evidence**: CLAUDE.md Section 13 Lesson #3

### Why Agent-Specific Lessons?

**Problem**: Each agent has unique strengths/weaknesses (AGENT_PERFORMANCE_MATRIX.md)
**Solution**: Separate files per agent (CC_LESSONS.md, BB_LESSONS.md)
**Evidence**: CC strong at docs, weak at CI/CD; BB strong at forensics

---

**END OF ARCHITECTURE DOCUMENT**

**Next Step**: BB consolidates first 15 lessons using LESSON_ENTRY_TEMPLATE.md
**Estimated Effort**: 90-120 minutes (15 lessons × 6-8 min each)
**Deliverables**: 15 lesson files + INDEX.md + updated CLAUDE.md Section 1
