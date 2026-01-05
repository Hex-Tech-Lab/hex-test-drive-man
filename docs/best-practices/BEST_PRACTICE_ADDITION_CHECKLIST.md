# Best Practice Addition Checklist

**Purpose**: Ensure consistent, high-quality lessons added to repository
**Authority**: All agents (CC, BB, GC, CCW, PPLX)
**Version**: 1.0

---

## When to Add a New Best Practice

### Mandatory Triggers (MUST Add)

#### 1. User Explicit Feedback
```
User says: "This is an anti-pattern"
User says: "This is wrong, here's why..."
User says: "Never do this again"
```
**Action**: Create lesson immediately, reference user feedback in metadata

**Example**: CLAUDE.md Section 13 Lesson #3 - Incremental vs Bulk Pattern
- User: "This is an anti-pattern. We tried full dump before, didn't work out."
- Lesson created: docs/best-practices/documentation/INCREMENTAL_VS_BULK_UPDATES.md

---

#### 2. Repeat Mistake (2+ Times by Any Agent)
```
Same error occurs again OR
Different agent makes same mistake OR
Same agent repeats after 30+ days
```
**Action**: Create lesson after 2nd occurrence to prevent 3rd

**Example**: Git destructive operations (CLAUDE.md Section 13 Lesson #2)
- 1st occurrence: Data loss in working tree
- 2nd occurrence: Nearly repeated on different file
- Lesson created: docs/best-practices/git-workflows/DESTRUCTIVE_OPERATIONS.md

---

#### 3. Critical Incident (Data Loss Risk)
```
Potential data loss OR
Production outage OR
Security vulnerability OR
Unrecoverable state
```
**Action**: Create lesson immediately, mark category as "git-workflows" or "debugging"

**Example**: Git reset --hard without git status (CLAUDE.md Section 13 Lesson #2)
- Impact: 597 lines lost (unrecoverable)
- Lesson created: docs/best-practices/git-workflows/DESTRUCTIVE_OPERATIONS.md

---

#### 4. High Efficiency Gain (>50% Time Savings)
```
Task completed 50%+ under budget OR
Novel solution dramatically faster OR
Automation eliminates manual steps
```
**Action**: Create lesson in "performance" category

**Example**: BB's Mercedes data fix (PERFORMANCE_LOG.md:132-175)
- Timeboxed: 90 min
- Actual: 20 min (-78% variance)
- Lesson created: docs/best-practices/performance/TIMEBOX_DISCIPLINE.md

---

### Optional Triggers (SHOULD Add)

#### 5. Novel Solution to Common Problem
```
Solution not in official docs OR
Creative workaround for limitation OR
Combines multiple techniques
```
**Action**: Evaluate recurrence risk (if >25%, add lesson)

**Example**: Slug parsing dual-query fallback (commit 411e243)
- Novel: Not in Next.js/Supabase docs
- Recurrence risk: High (any hyphenated model names)
- Lesson created: docs/best-practices/debugging/SLUG_PARSING_MISMATCH.md

---

#### 6. Edge Case Discovery
```
Unexpected environment behavior OR
Tool quirk not in docs OR
Platform-specific issue
```
**Action**: Add if affects multi-agent workflow

**Example**: Husky PATH isolation (CLAUDE.md Section 13 Lesson #4)
- Edge case: Non-interactive shell in Git hooks
- Affects: All agents using Husky
- Lesson created: docs/best-practices/git-workflows/HUSKY_ENVIRONMENT.md

---

#### 7. Agent Weakness Identified
```
Agent fails at task type OR
Troubleshooting loop detected OR
Documented in AGENT_PERFORMANCE_MATRIX.md
```
**Action**: Add to agent-specific lessons (e.g., CC_LESSONS.md)

**Example**: CC's PR #11 failure (AGENT_PERFORMANCE_MATRIX.md:105-121)
- Weakness: CI/CD debugging without error logs
- Lesson created: docs/best-practices/debugging/BUILD_FAILURES.md
- Also added to: docs/best-practices/agent-specific/CC_LESSONS.md

---

### Do NOT Add (Noise Reduction)

#### ❌ Generic Programming Knowledge
```
Example: "Use async/await for promises"
Example: "Prefer const over let"
Example: "Use TypeScript strict mode"
```
**Reason**: Already in official docs, not project-specific

**Instead**: Link to official docs in CLAUDE.md Section 12 (Quality Standards)

---

#### ❌ Tool-Specific Official Docs
```
Example: "How to use git rebase"
Example: "MUI component API reference"
Example: "Supabase query syntax"
```
**Reason**: Official docs already exist, risk of duplication/staleness

**Instead**: Link to tool docs, only add project-specific patterns

---

#### ❌ One-Off Edge Cases (No Recurrence Risk)
```
Example: "Fixed typo in Mercedes model name"
Example: "User's specific environment issue"
Example: "Temporary API outage workaround"
```
**Reason**: No pattern to learn, unlikely to repeat

**Instead**: Document in commit message only

---

## How to Add a New Lesson

### Step 1: Copy LESSON_ENTRY_TEMPLATE.md
```bash
cd docs/best-practices/

# Choose category
CATEGORY="git-workflows"  # or debugging, performance, documentation

# Create lesson file
cp LESSON_ENTRY_TEMPLATE.md "$CATEGORY/MY_LESSON_TOPIC.md"
```

**Naming Convention**:
- UPPER_SNAKE_CASE.md
- Descriptive (e.g., SLUG_PARSING_MISMATCH.md, not FIX_404.md)
- Avoid dates (use metadata section for date)

---

### Step 2: Fill Out Template (50-75 Lines)

**Required Sections** (don't skip):
- [x] Problem/Symptom (exact error message or observation)
- [x] Context (when it happens, prerequisites)
- [x] Root Cause (technical explanation with source references)
- [x] Solution (step-by-step with code examples)
- [x] Prevention (DO/DON'T actionable items)
- [x] Related Lessons (cross-references, minimum 1)
- [x] Metadata (agent, date, session log, verification status)

**Quality Check**:
```bash
# Line count should be 50-75 (template + content)
wc -l "$CATEGORY/MY_LESSON_TOPIC.md"

# Should have code examples
grep -c '```' "$CATEGORY/MY_LESSON_TOPIC.md"  # Expect 2+

# Should have DO/DON'T items
grep -c '✅ DO:\|❌ DON'"'"'T:' "$CATEGORY/MY_LESSON_TOPIC.md"  # Expect 2+
```

---

### Step 3: Update INDEX.md

**Add to "Quick Search by Symptom" Table**:
```markdown
| [Exact error message or symptom] | [Root cause] | [Solution summary] | [File link] |
```

**Add to Category Section**:
```markdown
### [Category Name] (X lessons)
- [MY_LESSON_TOPIC.md](category/MY_LESSON_TOPIC.md) - Brief description
```

**Update Entry Count**:
```markdown
**Entries**: [OLD_COUNT + 1] lessons
```

---

### Step 4: Add Cross-References

**Update Related Lessons**:
```bash
# Find related lessons
grep -r "similar pattern" docs/best-practices/

# Edit each related lesson, add to "Related Lessons" section
vim docs/best-practices/category/RELATED_LESSON.md
```

**Add to Agent-Specific File** (if applicable):
```bash
# If lesson highlights agent strength/weakness
vim docs/best-practices/agent-specific/CC_LESSONS.md

# Add entry:
# - [MY_LESSON_TOPIC.md](../category/MY_LESSON_TOPIC.md) - [Why relevant to CC]
```

---

### Step 5: Commit Immediately (Incremental Pattern)

**Commit Message Format**:
```bash
git add docs/best-practices/
git commit -m "docs(best-practices): add [TOPIC] lesson from [AGENT] [SESSION]

Problem: [Brief symptom description]
Solution: [Brief fix description]
Category: [category]
Agent: [AGENT]
Date: [YYYY-MM-DD]

Refs: [commit SHA or session log link]"

git push origin main
```

**Example**:
```bash
git commit -m "docs(best-practices): add slug parsing lesson from CC 2026-01-05

Problem: Changan Uni-T/Uni-V returning 404 (hyphen vs space mismatch)
Solution: Dual-query fallback pattern (try space, then hyphen)
Category: debugging
Agent: CC
Date: 2026-01-05

Refs: commit 411e243, docs/NEXT_SESSION_DEFERRED_TASKS.md:12-27"
```

**Why Immediate Commit?**
- Incremental pattern (per CLAUDE.md Section 13 Lesson #3)
- Prevents batching (anti-pattern)
- Allows immediate agent discovery

---

## Quality Gates (Before Committing)

### Checklist

- [ ] **Template Used**: Copied LESSON_ENTRY_TEMPLATE.md, not starting from scratch
- [ ] **Line Count**: 50-75 lines (not too short, not too verbose)
- [ ] **Problem Clear**: Agent can identify symptom from "Problem/Symptom" section
- [ ] **Root Cause Accurate**: Technical explanation with file:line references
- [ ] **Solution Has Code**: At least 1 code example (before/after or command)
- [ ] **Prevention Actionable**: Has DO/DON'T items (not vague advice)
- [ ] **Cross-Referenced**: At least 1 related lesson linked
- [ ] **INDEX.md Updated**: New row in symptom table + category section
- [ ] **Entry Count Updated**: Incremented by 1 in INDEX.md header
- [ ] **Committed Immediately**: Not waiting to batch with other changes

---

### Self-Review Questions

**Before committing, ask**:

1. **Can another agent find this lesson by searching the symptom?**
   - If no: Improve "Problem/Symptom" section with exact error message

2. **Can another agent apply the solution without asking questions?**
   - If no: Add more code examples or step-by-step details

3. **Will this lesson be obsolete in 6 months?**
   - If yes: Consider if it's worth adding (maybe document in commit message only)

4. **Is this lesson project-specific or generic programming advice?**
   - If generic: Link to official docs instead, don't duplicate

5. **Have I cross-referenced related lessons?**
   - If no: Search `docs/best-practices/` for similar topics

---

## Examples of Good vs Bad Lessons

### ✅ Good Lesson: SLUG_PARSING_MISMATCH.md
**Why Good**:
- ✅ Problem: Exact symptom ("404 on /changan-uni-t-2026")
- ✅ Root Cause: Technical explanation with file:line references
- ✅ Solution: Before/after code examples
- ✅ Prevention: DO/DON'T actionable items
- ✅ Length: 68 lines (optimal)

---

### ❌ Bad Lesson Example: "How to Use Git"
**Why Bad**:
- ❌ Problem: Too generic ("Git is confusing")
- ❌ Root Cause: No specific project issue
- ❌ Solution: Links to official docs (duplication)
- ❌ Prevention: Generic advice ("read the manual")
- ❌ Length: 200+ lines (bloat)

**Instead**: Link to Git docs in CLAUDE.md, only add project-specific patterns

---

### ✅ Good Lesson: ROUTER_VS_HISTORY_API.md
**Why Good**:
- ✅ Problem: Specific ("Language switch causes full reload")
- ✅ Root Cause: router.push() vs router.replace() difference
- ✅ Solution: One-line code change with explanation
- ✅ Prevention: "Use router.replace() for state changes"
- ✅ Length: 55 lines (concise)

---

## Quarterly Review Checklist

**When**: Last week of quarter (March 31, June 30, Sept 30, Dec 31)
**Who**: CC (primary reviewer)

### Steps

1. **[ ] Audit Stale Entries**
   ```bash
   # Find lessons >1 year old
   git log --since="1 year ago" docs/best-practices/ --name-only

   # Review each, mark as DEPRECATED or update
   ```

2. **[ ] Consolidate Duplicates**
   ```bash
   # Search for similar topics
   grep -r "root cause: [pattern]" docs/best-practices/

   # Merge similar lessons, redirect old to new
   ```

3. **[ ] Verify Accuracy**
   ```bash
   # Spot-check 10 random lessons
   # Run commands, verify code examples work
   # Update "Last Verified" date
   ```

4. **[ ] Update Cross-References**
   ```bash
   # Check for broken links
   grep -r '\[.*\](.*\.md)' docs/best-practices/ | \
     while read line; do
       # Verify file exists
     done
   ```

5. **[ ] Generate Metrics**
   ```bash
   # Entry count per category
   find docs/best-practices/ -name "*.md" ! -name "INDEX.md" | wc -l

   # Most-referenced lessons (count backlinks)
   ```

6. **[ ] Archive Old Versions**
   ```bash
   mkdir -p docs/best-practices/archive/$(date +%Y)Q$((($(date +%-m)-1)/3+1))
   cp -r docs/best-practices/*.md docs/best-practices/archive/[YEAR]Q[N]/
   ```

---

**END OF CHECKLIST**

**Next**: Use this checklist when adding lessons during consolidation task
