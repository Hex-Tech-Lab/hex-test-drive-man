# Task Handoff for BB: Best Practices Repository Consolidation

**Task ID**: BB-BEST-PRACTICES-CONSOLIDATION-2026-01-05
**Assigned To**: BB (Blackbox)
**Assigned By**: CC (Claude Code)
**Date**: 2026-01-05
**Estimated Duration**: 90-120 minutes (15 lessons × 6-8 min each)
**Priority**: HIGH (blocks agent self-sufficiency)

---

## Objective

Extract and consolidate **first 15 lessons** from existing documentation into the new `docs/best-practices/` repository using standardized templates.

---

## Context

**Problem**: Lessons scattered across CLAUDE.md Section 13, PERFORMANCE_LOG.md, incident reports → agents repeat mistakes

**Solution**: Centralized, searchable repository with symptom-based indexing

**Your Role**: Execute consolidation of first 15 lessons (design already complete by CC)

---

## Prerequisites (Read Before Starting)

### 1. Architecture Documents (5 min)
- [ ] Read `docs/best-practices/ARCHITECTURE.md` (200 lines) - Understand structure/rationale
- [ ] Read `docs/best-practices/LESSON_ENTRY_TEMPLATE.md` (350 lines) - See format + example
- [ ] Read `docs/best-practices/BEST_PRACTICE_ADDITION_CHECKLIST.md` (250 lines) - Quality gates

### 2. Source Documents to Scan
- [ ] `CLAUDE.md` Section 13 (lines 565-591) - 4 critical lessons
- [ ] `docs/PERFORMANCE_LOG.md` - BB's 5 sessions with self-critique
- [ ] `docs/PERFORMANCE_LOG_2026-01-03_CARD_FALLBACK_FIX.md` - CC's lessons learned
- [ ] `docs/AGENT_PERFORMANCE_MATRIX.md` (lines 105-121, 418-567) - Agent weaknesses
- [ ] `docs/incidents/2026-01-05-REBASE-INCIDENT.md` (lines 385-413) - Git lessons

### 3. Tools Available
```bash
# Create lesson file
cp docs/best-practices/LESSON_ENTRY_TEMPLATE.md \
   docs/best-practices/[category]/[TOPIC].md

# Count lines
wc -l docs/best-practices/[category]/[TOPIC].md

# Verify format
grep -c '```' docs/best-practices/[category]/[TOPIC].md  # Expect 2+
```

---

## First 15 Lessons to Consolidate (Priority Order)

### Category: git-workflows (5 lessons)

#### 1. REBASE_NORMAL_WORKFLOW.md
**Source**: docs/incidents/2026-01-05-REBASE-INCIDENT.md (lines 385-413)
**Problem**: Agent treated normal rebase as "incident requiring remediation"
**Root Cause**: Concurrent development → Git's fast-forward protection working correctly
**Solution**: Pre-push hook automation + understanding Git's protective design
**Prevention**: Never call normal Git workflow an "error"
**Extraction Notes**:
- Use disclaimer from incident report (lines 3-11)
- Reference pre-push hook as automated solution
- Cross-reference: PRE_PUSH_AUTOMATION.md

---

#### 2. PRE_PUSH_AUTOMATION.md
**Source**: .husky/pre-push (40 lines), scripts/safe-push.sh (101 lines), commit 135ff5e
**Problem**: Push rejected due to concurrent agent commits
**Root Cause**: No pre-fetch check before push attempt
**Solution**: Husky hook blocks unsafe pushes, safe-push.sh interactive guide
**Prevention**: Mandatory `git fetch origin` before every push
**Extraction Notes**:
- Include full hook code in Solution section
- Reference safe-push.sh as alternative workflow
- Cross-reference: MULTI_AGENT_COORDINATION.md, REBASE_NORMAL_WORKFLOW.md

---

#### 3. DESTRUCTIVE_OPERATIONS.md
**Source**: CLAUDE.md Section 13 Lesson #2 (lines 573-577)
**Problem**: `git reset --hard origin/main` lost 597 lines of uncommitted changes
**Root Cause**: Didn't run `git status` before destructive operation
**Solution**: ALWAYS verify working tree clean first
**Prevention**: Pre-flight checklist before reset/clean/checkout --force
**Extraction Notes**:
- Include example of correct workflow (status → stash → reset → stash pop)
- Add to agent-specific/CC_LESSONS.md (CC made this mistake)

---

#### 4. HUSKY_ENVIRONMENT.md
**Source**: CLAUDE.md Section 13 Lesson #4 (lines 585-589)
**Problem**: `pnpm not found in PATH` in Husky pre-commit hook
**Root Cause**: Git hooks run non-interactively (shell init not loaded)
**Solution**: Created `~/.config/husky/init.sh` to export PNPM_HOME + PATH
**Prevention**: Use Husky init.sh for PATH setup, never assume interactive shell
**Extraction Notes**:
- Include ~/.config/husky/init.sh file contents
- Reference Husky docs for environment isolation

---

#### 5. MULTI_AGENT_COORDINATION.md
**Source**: docs/policies/GIT_WORKFLOW_RULES.md (Section 6), HANDOFF_STATUS.md
**Problem**: Two agents pushing to main simultaneously causes manual rebase
**Root Cause**: No communication mechanism for "I'm about to push"
**Solution**: Check HANDOFF_STATUS.md before push, update after push
**Prevention**: Use `git log --oneline -5` at session start, check for recent pushes
**Extraction Notes**:
- Include HANDOFF_STATUS.md update protocol
- Cross-reference: PRE_PUSH_AUTOMATION.md, REBASE_NORMAL_WORKFLOW.md

---

### Category: debugging (5 lessons)

#### 6. ROUTER_VS_HISTORY_API.md
**Source**: docs/PERFORMANCE_LOG.md (lines 7-28, BB session)
**Problem**: Language switch (EN ↔ AR) causes full page reload, loses scroll position
**Root Cause**: router.push() forces reload, router.replace() doesn't
**Solution**: Changed Header.tsx from router.push() to router.replace()
**Prevention**: Use router.replace() for state changes (language, theme), push() for navigation
**Extraction Notes**:
- Include Before/After code from Header.tsx
- Reference Next.js router docs for push() vs replace() difference

---

#### 7. BUILD_FAILURES.md
**Source**: docs/AGENT_PERFORMANCE_MATRIX.md (lines 105-121, CC's PR #11 failure)
**Problem**: Build fails but agent doesn't fetch CI logs before fixing
**Root Cause**: Troubleshooting loop without diagnostic investigation
**Solution**: Structured workflow (fetch logs → analyze → form hypothesis → test → verify)
**Prevention**: ALWAYS fetch error logs FIRST (gh pr checks, gh run view)
**Extraction Notes**:
- Include step-by-step diagnostic workflow
- Add to agent-specific/CC_LESSONS.md (CC weakness)
- Cross-reference: performance/TROUBLESHOOTING_LOOPS.md

---

#### 8. SLUG_PARSING_MISMATCH.md
**Source**: docs/NEXT_SESSION_DEFERRED_TASKS.md (lines 12-27), commit 411e243
**Problem**: Changan Uni-T, Uni-V returning 404 (URL hyphen vs DB space)
**Root Cause**: Slug converts "uni-t" → "uni t", DB has "UNI-T"
**Solution**: Dual-query fallback (try space, then hyphen)
**Prevention**: Test URL slug → DB query mapping for special characters
**Extraction Notes**:
- Use example from LESSON_ENTRY_TEMPLATE.md (already written)
- Include Before/After code from page.tsx:64-78
- Cross-reference: None (standalone pattern)

---

#### 9. INFINITE_LOOP_PREVENTION.md
**Source**: docs/PERFORMANCE_LOG_2026-01-03_CARD_FALLBACK_FIX.md (lines 213-218)
**Problem**: onError handler triggers infinite loop if fallback image also fails
**Root Cause**: No guard condition in onError (keeps retrying failed placeholder)
**Solution**: Check `img.src.includes('placeholder.webp')` before fallback
**Prevention**: Always guard recursive error handlers with conditional checks
**Extraction Notes**:
- Include code example from VehicleCard.tsx onError handler
- Reference lesson: "Infinite loop prevention is critical" (line 217)

---

#### 10. ZUSTAND_PERSISTENCE_ISSUES.md
**Source**: docs/NEXT_SESSION_DEFERRED_TASKS.md (lines 67-90)
**Problem**: Zustand stores not persisting to localStorage (items disappear on refresh)
**Root Cause**: React 19 strict mode causing double renders, localStorage quota exceeded, or hydration mismatch
**Solution**: Debug steps (check DevTools → Application → Local Storage, verify keys exist)
**Prevention**: Verify localStorage keys in browser DevTools, test persistence after adding
**Extraction Notes**:
- Include debugging checklist from deferred tasks
- Mark as NEEDS-UPDATE (not yet solved, investigation only)

---

### Category: performance (3 lessons)

#### 11. TIMEBOX_DISCIPLINE.md
**Source**: docs/PERFORMANCE_LOG.md (BB sessions: lines 7-13, 73-79, 132-138)
**Problem**: Tasks overrunning timeboxes (low efficiency)
**Root Cause**: Underestimation or scope creep
**Solution**: BB's pattern - 67-87% efficiency (finish under budget)
**Prevention**: Pre-flight verification, break tasks into smaller chunks, commit at intervals
**Extraction Notes**:
- Extract BB's self-critique patterns (lines 117-127)
- Include timebox breakdown table from card fallback fix
- Add to agent-specific/BB_LESSONS.md (BB strength)

---

#### 12. VERIFICATION_BEFORE_PLAN.md
**Source**: CLAUDE.md Section 1 (lines 47-56), commit 411e243 preflight investigation
**Problem**: Agents plan without verifying current state
**Root Cause**: "Plan first, verify later" approach
**Solution**: VERIFY 10x → PLAN 10x → EXECUTE 1x (CLAUDE.md mandate)
**Prevention**: Mandatory preflight (git status, package.json read, DB query count)
**Extraction Notes**:
- Reference CC's 404 investigation (created debug script before fixing)
- Include verification mandate from CLAUDE.md

---

#### 13. TROUBLESHOOTING_LOOPS.md
**Source**: docs/AGENT_PERFORMANCE_MATRIX.md (lines 105-121, CC's PR #11 failure)
**Problem**: Agent stuck in troubleshooting loop (repeated failed attempts)
**Root Cause**: Script spam without diagnostic investigation
**Solution**: Recognize loop signs (3+ failed attempts), stop, fetch logs, analyze root cause
**Prevention**: If 2 attempts fail, STOP, change approach (fetch logs, ask user, reassign agent)
**Extraction Notes**:
- Use CC's PR #11 as anti-pattern example
- Include GC's successful fix as comparison (lines 126-141)
- Cross-reference: debugging/BUILD_FAILURES.md

---

### Category: documentation (2 lessons)

#### 14. CONTENT_PRESERVATION.md
**Source**: CLAUDE.md Section 13 Lesson #1 (lines 567-571)
**Problem**: CC compressed CLAUDE.md 1200 lines → 633 lines (lost 567 lines)
**Root Cause**: Misunderstood version bump as compression opportunity
**Solution**: Version bump = ADD new sections, NEVER compress/delete existing content
**Prevention**: Preserve all content unless explicitly deprecated by user
**Extraction Notes**:
- Include user feedback quote (line 569)
- Add to agent-specific/CC_LESSONS.md (CC error)

---

#### 15. INCREMENTAL_VS_BULK_UPDATES.md
**Source**: CLAUDE.md Section 13 Lesson #3 (lines 579-583)
**Problem**: CC proposed "wait for all inputs then process in one shot"
**Root Cause**: Bulk processing seemed efficient
**Solution**: Process each input immediately, commit after each
**Prevention**: Incremental updates force verification, prevent information overload
**Extraction Notes**:
- Include user feedback quote (line 581)
- Reference lesson: "We tried full dump before, didn't work out"

---

## Execution Steps (Follow Exactly)

### Phase 1: Setup (5 min)

```bash
# Verify directory structure exists
ls docs/best-practices/

# Expected output:
# ARCHITECTURE.md
# LESSON_ENTRY_TEMPLATE.md
# BEST_PRACTICE_ADDITION_CHECKLIST.md
# git-workflows/
# debugging/
# performance/
# documentation/
# agent-specific/

# If missing, STOP and ask CC to verify setup
```

---

### Phase 2: Consolidate Lessons (75-90 min)

**For Each Lesson (6-8 min each)**:

1. **Copy Template** (30 sec)
   ```bash
   cd docs/best-practices/
   cp LESSON_ENTRY_TEMPLATE.md [category]/[TOPIC].md
   ```

2. **Extract Content from Source** (3-4 min)
   - Open source document (CLAUDE.md, PERFORMANCE_LOG.md, etc.)
   - Copy relevant sections
   - Paste into lesson file, fill template sections

3. **Fill Required Fields** (2-3 min)
   - Problem/Symptom (exact error or observation)
   - Context (when it happens)
   - Root Cause (technical explanation)
   - Solution (step-by-step + code example)
   - Prevention (DO/DON'T items)
   - Related Lessons (cross-references)
   - Metadata (agent, date, session)

4. **Verify Quality** (30 sec)
   ```bash
   wc -l [category]/[TOPIC].md  # Expect 50-75 lines
   grep -c '```' [category]/[TOPIC].md  # Expect 2+ code blocks
   grep -c '✅ DO:\|❌ DON'"'"'T:' [category]/[TOPIC].md  # Expect 2+
   ```

5. **Commit Immediately** (30 sec)
   ```bash
   git add docs/best-practices/[category]/[TOPIC].md
   git commit -m "docs(best-practices): add [TOPIC] lesson from [AGENT] [DATE]

   Problem: [Brief symptom]
   Solution: [Brief fix]
   Category: [category]

   Refs: [source file or commit SHA]"
   ```

**Repeat for all 15 lessons** (commit after EACH, not batched)

---

### Phase 3: Create INDEX.md (15 min)

```bash
# Create master index
vim docs/best-practices/INDEX.md
```

**Structure** (see ARCHITECTURE.md lines 60-120 for format):
1. Header (Last Updated, Entries count, Search Tip)
2. Quick Search by Symptom table (15 rows)
3. Search by Category sections (5 categories)

**For each lesson, add**:
- Row in symptom table: `| [symptom] | [root cause] | [solution] | [file link] |`
- Entry in category section: `- [TOPIC.md](category/TOPIC.md) - Brief description`

**Verify**:
```bash
wc -l docs/best-practices/INDEX.md  # Expect ~150 lines
grep -c '|' docs/best-practices/INDEX.md  # Expect 17+ (table rows)
```

**Commit**:
```bash
git add docs/best-practices/INDEX.md
git commit -m "docs(best-practices): create master index with 15 lessons

Symptom-based search table for quick reference
5 categories: git-workflows (5), debugging (5), performance (3), documentation (2)

First milestone: 15 lessons consolidated from existing docs"
```

---

### Phase 4: Create Agent-Specific Lessons (10 min)

```bash
# Create files
touch docs/best-practices/agent-specific/{CC,BB,GC}_LESSONS.md
```

**Add entries**:
- CC_LESSONS.md: Lessons #3, #7, #13, #14 (weaknesses)
- BB_LESSONS.md: Lesson #11 (strength: timebox discipline)
- GC_LESSONS.md: (none yet, placeholder for future)

**Format**:
```markdown
# CC (Claude Code) - Agent-Specific Lessons

## Strengths
- [Listed in AGENT_PERFORMANCE_MATRIX.md]

## Weaknesses & Lessons Learned

### 1. Destructive Git Operations
- See: [../git-workflows/DESTRUCTIVE_OPERATIONS.md](../git-workflows/DESTRUCTIVE_OPERATIONS.md)
- Why relevant: CC lost 597 lines with git reset --hard

[Repeat for each lesson]
```

**Commit**:
```bash
git add docs/best-practices/agent-specific/
git commit -m "docs(best-practices): add agent-specific lesson references

CC: 4 weakness lessons (git reset, build failures, content preservation, bulk updates)
BB: 1 strength lesson (timebox discipline)
GC: Placeholder for future"
```

---

### Phase 5: Final Verification (5 min)

**Checklist**:
- [ ] 15 lesson files created (5 git-workflows, 5 debugging, 3 performance, 2 documentation)
- [ ] INDEX.md created with 15 entries
- [ ] All lessons use LESSON_ENTRY_TEMPLATE.md format
- [ ] All lessons 50-75 lines
- [ ] All lessons have code examples (2+ code blocks)
- [ ] All lessons have DO/DON'T items
- [ ] 16 commits made (15 lessons + INDEX.md + agent-specific) - INCREMENTAL, not batched
- [ ] CLAUDE.md Section 1 item #13 exists (CC already added)

**Final Count**:
```bash
find docs/best-practices/ -name "*.md" ! -name "ARCHITECTURE.md" ! -name "LESSON_ENTRY_TEMPLATE.md" ! -name "BEST_PRACTICE_ADDITION_CHECKLIST.md" | wc -l
# Expected: 19 (15 lessons + INDEX.md + 3 agent-specific)
```

---

## Success Criteria

- [ ] **15 lessons consolidated** from existing docs (not creating new content)
- [ ] **INDEX.md searchable** by 15 symptoms (table with file links)
- [ ] **All commits incremental** (16 commits, not 1 batch commit)
- [ ] **Quality gates passed** (50-75 lines, code examples, DO/DON'T items)
- [ ] **Cross-references added** (related lessons linked)
- [ ] **Agent-specific files created** (CC, BB, GC lessons)
- [ ] **Build still passes** (docs-only changes, but verify)

---

## Deliverables Checklist

### Files Created (19 total)

**Lessons** (15 files):
- [ ] git-workflows/REBASE_NORMAL_WORKFLOW.md
- [ ] git-workflows/PRE_PUSH_AUTOMATION.md
- [ ] git-workflows/DESTRUCTIVE_OPERATIONS.md
- [ ] git-workflows/HUSKY_ENVIRONMENT.md
- [ ] git-workflows/MULTI_AGENT_COORDINATION.md
- [ ] debugging/ROUTER_VS_HISTORY_API.md
- [ ] debugging/BUILD_FAILURES.md
- [ ] debugging/SLUG_PARSING_MISMATCH.md
- [ ] debugging/INFINITE_LOOP_PREVENTION.md
- [ ] debugging/ZUSTAND_PERSISTENCE_ISSUES.md
- [ ] performance/TIMEBOX_DISCIPLINE.md
- [ ] performance/VERIFICATION_BEFORE_PLAN.md
- [ ] performance/TROUBLESHOOTING_LOOPS.md
- [ ] documentation/CONTENT_PRESERVATION.md
- [ ] documentation/INCREMENTAL_VS_BULK_UPDATES.md

**Index & Agent Files** (4 files):
- [ ] INDEX.md (master searchable index)
- [ ] agent-specific/CC_LESSONS.md
- [ ] agent-specific/BB_LESSONS.md
- [ ] agent-specific/GC_LESSONS.md

**Commits** (16 total):
- [ ] 15 lesson commits (one per lesson)
- [ ] 1 INDEX.md commit
- [ ] 1 agent-specific commit (placeholder for future)

---

## Time Allocation (90-120 min)

| Phase | Duration | Description |
|-------|----------|-------------|
| Setup | 5 min | Read architecture, verify directory structure |
| Lesson 1-5 | 30-40 min | Git workflows category (5 × 6-8 min) |
| Lesson 6-10 | 30-40 min | Debugging category (5 × 6-8 min) |
| Lesson 11-13 | 18-24 min | Performance category (3 × 6-8 min) |
| Lesson 14-15 | 12-16 min | Documentation category (2 × 6-8 min) |
| INDEX.md | 15 min | Create master searchable index |
| Agent-specific | 10 min | Create CC/BB/GC lesson references |
| Verification | 5 min | Final checklist, count files |
| **TOTAL** | **90-120 min** | **15 lessons consolidated** |

---

## Notes for BB

**You Are NOT**:
- Creating new lessons (only extracting existing ones)
- Writing original content (only copying + formatting from sources)
- Designing structure (CC already designed, you execute)

**You ARE**:
- Extracting lessons from 5 source documents
- Filling LESSON_ENTRY_TEMPLATE.md with existing content
- Committing incrementally (per CLAUDE.md Section 13 Lesson #3)
- Creating searchable index for agent self-sufficiency

**If Stuck**:
- Check ARCHITECTURE.md for structure clarification
- Check LESSON_ENTRY_TEMPLATE.md for format example
- Check BEST_PRACTICE_ADDITION_CHECKLIST.md for quality gates
- Ask user for clarification (don't guess)

**Remember**:
- 50-75 lines per lesson (not too short, not verbose)
- Code examples mandatory (2+ code blocks)
- DO/DON'T items mandatory (2+ each)
- Commit after EACH lesson (incremental, not batched)

---

**END OF HANDOFF**

**Next Action**: BB starts Phase 1 (Setup verification)
**Estimated Start**: After user assigns task to BB
**Completion Metric**: 16 commits, 19 files created, INDEX.md searchable
