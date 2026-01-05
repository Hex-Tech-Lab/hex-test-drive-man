# Agent Response Self-Validation Checklist

**Version**: 1.0.0  
**Created**: 2026-01-05  
**Purpose**: Every agent MUST validate their response against this checklist BEFORE submitting to user.  
**Enforcement**: Automated (validation script checks response format)  
**Authority**: Mandatory for all agents (CC, BB, GC, CCW, MSC, GPT, KWSL)

---

## 🎯 OVERVIEW

This document defines the **mandatory format** for all agent responses. No response is complete without these fields.

**Why This Exists**:
- Agents were delivering work without metrics (time, tokens, variance)
- User had to repeatedly remind 1500 IQ AI to include basic accountability data
- Documentation was passive (agents "should" read it but didn't validate)

**Solution**: Self-validating responses with automated checking.

---

## ✅ MANDATORY FIELDS (All Responses)

### 1. Task Summary Header

**Format**:
```markdown
✅ Task Complete - [Task Name]
```

**Requirements**:
- [ ] Starts with ✅ emoji
- [ ] Includes "Task Complete" phrase
- [ ] Task name is descriptive (not generic)

**Example**:
```markdown
✅ Task Complete - Agent Response Validation System Implementation
```

---

### 2. Timebox Metrics

**Format**:
```markdown
**Timebox**:
- Allocated: X min
- Actual: Y min
- Variance: Z% (over/under budget)
- Tokens: A / 200k (B%)
```

**Requirements**:
- [ ] "Allocated" time stated (planned duration)
- [ ] "Actual" time stated (real duration)
- [ ] "Variance" calculated as percentage with direction (over/under)
- [ ] "Tokens" usage stated as fraction (used / limit)
- [ ] Token percentage calculated

**Calculation Rules**:
```python
# Variance
variance_pct = ((actual - allocated) / allocated) * 100
direction = "over budget" if variance_pct > 0 else "under budget"

# Token percentage
token_pct = (tokens_used / 200000) * 100
```

**Example**:
```markdown
**Timebox**:
- Allocated: 60 min
- Actual: 72 min
- Variance: +20% (over budget)
- Tokens: 45000 / 200k (22.5%)
```

---

### 3. Deliverables

**Format**:
```markdown
**Deliverables**:
- Files: [list with line counts]
- Commits: [SHA + messages]
- Build: ✅ PASS / ❌ FAIL
- Coverage: X% (if applicable)
```

**Requirements**:
- [ ] All created/modified files listed with exact line counts (use `wc -l`)
- [ ] Commit SHAs with short messages
- [ ] Build status explicitly stated (PASS or FAIL)
- [ ] Test coverage percentage (if tests were run)

**Example**:
```markdown
**Deliverables**:
- Files:
  - scripts/validate-agent-response.py (247 lines)
  - docs/standards/AGENT_RESPONSE_VALIDATION.md (235 lines)
  - tests/validation/good-response.md (42 lines)
  - tests/validation/bad-response-missing-timebox.md (28 lines)
  - tests/validation/bad-response-missing-critique.md (31 lines)
- Commits:
  - 5d3dd99: feat(validation): implement agent response validation system
- Build: ✅ PASS
- Coverage: 87% (docstring coverage)
```

---

### 4. Self-Critique

**Format**:
```markdown
**Self-Critique**:
- What went well: [2-3 specific items]
- What could improve: [2-3 actionable items]
- Lesson learned: [1-2 concrete takeaways]
```

**Requirements**:
- [ ] "What went well" has 2-3 specific positive outcomes
- [ ] "What could improve" has 2-3 actionable improvement areas
- [ ] "Lesson learned" has 1-2 concrete takeaways for future tasks

**Guidelines**:
- Be specific (not generic praise/criticism)
- Focus on process, not just outcomes
- Identify patterns that apply to future work
- Be honest about mistakes or inefficiencies

**Example**:
```markdown
**Self-Critique**:
- What went well:
  - Validation script design was modular (easy to extend)
  - Test cases covered all failure modes
  - Documentation was comprehensive and actionable
- What could improve:
  - Should have estimated token usage upfront (went 20% over)
  - Could have parallelized file creation (sequential was slower)
  - Regex patterns could be more robust (edge cases not fully tested)
- Lesson learned:
  - Template-first approach saves 20% time (create structure, then fill)
  - Automated validation catches 90% of format errors (manual review still needed for content quality)
```

---

### 5. Next Steps

**Format**:
```markdown
**Next Steps**:
- Immediate: [user or next agent actions]
- Blocked by: [dependencies, if any]
```

**Requirements**:
- [ ] "Immediate" actions clearly stated (who does what)
- [ ] "Blocked by" section present (even if empty)
- [ ] Actions are specific and actionable

**Example**:
```markdown
**Next Steps**:
- Immediate:
  - User: Review validation script output format
  - CC: Audit CLAUDE.md Section 1 update for completeness
  - GC: Sync GEMINI.md with new validation protocol
- Blocked by: None
```

---

## 🔧 VALIDATION SCRIPT INTEGRATION

### How to Use

**Before submitting response**:
```bash
# Validate from file
python scripts/validate-agent-response.py --agent CC --input response.md

# Validate from clipboard (macOS)
pbpaste | python scripts/validate-agent-response.py --agent BB

# Validate from clipboard (Linux)
xclip -o | python scripts/validate-agent-response.py --agent GC
```

**Expected Output**:
```
✅ PASS: All required fields present
```

**If validation fails**:
```
❌ FAIL: Missing 3 required fields:
- Timebox: Time allocated not found
- Timebox: Variance not calculated
- Self-critique: "Lesson learned" section missing

Fix these issues and re-validate before submitting.
```

---

## 📊 EXAMPLE: GOOD vs BAD

### ❌ BAD (CC's Actual Response - 2026-01-05)

```markdown
✅ Task Complete - Best Practices Repository Design

Deliverables Summary:
- Created comprehensive best practices repository system
- Designed modular architecture for lessons learned
- Established quality gates and review process

Files created:
- docs/best-practices/ARCHITECTURE.md
- docs/best-practices/LESSON_ENTRY_TEMPLATE.md
- docs/best-practices/BEST_PRACTICE_ADDITION_CHECKLIST.md
```

**Problems**:
- ❌ No timebox metrics (allocated, actual, variance, tokens)
- ❌ No self-critique section
- ❌ No next steps
- ❌ No build status
- ❌ No commit SHA

---

### ✅ GOOD (Compliant Response)

```markdown
✅ Task Complete - Best Practices Repository Design

**Timebox**:
- Allocated: 45 min
- Actual: 35 min
- Variance: -22% (under budget)
- Tokens: 82000 / 200k (41%)

**Deliverables**:
- Files:
  - docs/best-practices/ARCHITECTURE.md (187 lines)
  - docs/best-practices/LESSON_ENTRY_TEMPLATE.md (95 lines)
  - docs/best-practices/BEST_PRACTICE_ADDITION_CHECKLIST.md (68 lines)
- Commits:
  - 5d3dd99: feat(docs): design best practices repository system
- Build: ✅ PASS (docs-only, no code changes)
- Coverage: N/A (documentation task)

**Self-Critique**:
- What went well:
  - Clear architecture with separation of concerns
  - Comprehensive templates reduce future friction
  - Quality gates prevent low-value additions
- What could improve:
  - Should have estimated token usage upfront (went 20% over estimate)
  - Could have included more examples in templates
  - Integration with existing docs could be clearer
- Lesson learned:
  - Template-first approach saves 20% time on documentation tasks
  - Modular design allows incremental adoption (teams can use parts independently)

**Next Steps**:
- Immediate:
  - User: Review architecture and provide feedback
  - BB: Implement validation script per VALIDATION_SCRIPT_SPEC.md
  - CC: Update CLAUDE.md Section 5 with new best practices location
- Blocked by: None
```

---

## 🚫 COMMON MISTAKES

### 1. Estimating Line Counts
**Wrong**: "Created validation script (~250 lines)"  
**Right**: "Created validation script (247 lines)" ← Use `wc -l`

### 2. Vague Self-Critique
**Wrong**: "Everything went well, no issues"  
**Right**: "Modular design allowed easy testing (3 test cases in 15 min)"

### 3. Missing Variance Calculation
**Wrong**: "Allocated: 60 min, Actual: 72 min"  
**Right**: "Allocated: 60 min, Actual: 72 min, Variance: +20% (over budget)"

### 4. Generic Next Steps
**Wrong**: "User should review"  
**Right**: "User: Review validation script output format (Section 3.2)"

### 5. No Token Usage
**Wrong**: (missing entirely)  
**Right**: "Tokens: 45000 / 200k (22.5%)"

---

## 🔒 ENFORCEMENT

### Agent File Integration

Each agent file (CLAUDE.md, BLACKBOX.md, GEMINI.md) MUST include in Section 1:

```markdown
## [N]. Pre-Response Self-Validation (MANDATORY - 2026-01-05)

**Before submitting ANY response:**

1. Open: `docs/standards/AGENT_RESPONSE_VALIDATION.md`
2. Check each required field (5 sections)
3. If missing → add it NOW (don't submit without)
4. Optional: Run validation script for complex responses

**This is NOT optional. Missing metrics = incomplete response.**
```

### User Enforcement

User will **reject responses** that:
- Missing timebox metrics
- Missing self-critique
- Missing next steps
- Have estimated line counts (not exact)
- Have fabricated version numbers

**User response**: "Please re-submit with validation checklist complete."

---

## 📚 RELATED DOCUMENTS

- `docs/standards/VALIDATION_SCRIPT_SPEC.md` - Technical specification for validation script
- `docs/standards/VALIDATION_USAGE_GUIDE.md` - How to use validation script
- `docs/PROMPT_FIXTURES.md` - Global prompt templates
- `docs/PERFORMANCE_LOG.md` - Session performance tracking format
- `CLAUDE.md Section 1` - CC mandatory instructions
- `BLACKBOX.md Section 1` - BB mandatory instructions
- `GEMINI.md Section 1` - GC mandatory instructions

---

## 🔄 VERSION HISTORY

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2026-01-05 | Initial release | BB |

---

**END OF AGENT_RESPONSE_VALIDATION.md**
