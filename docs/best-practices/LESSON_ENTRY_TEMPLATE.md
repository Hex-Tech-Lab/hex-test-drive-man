# [TOPIC] - [Brief One-Line Description]

**Category**: [git-workflows | debugging | performance | documentation]
**Agent**: [CC | BB | GC | CCW | PPLX]
**Date**: YYYY-MM-DD
**Session**: [Link to session log or commit SHA]
**Status**: [VERIFIED | NEEDS-UPDATE | DEPRECATED]

---

## Problem/Symptom

**What Agent Observed**:
[Exact error message, unexpected behavior, or inefficiency noticed]

**Example Error** (if applicable):
```
[Copy-paste actual error output]
```

**When It Happens**:
- [ ] Specific command: `[command that triggers issue]`
- [ ] Specific workflow: [describe scenario]
- [ ] Specific environment: [local/CI/production/hooks]

---

## Context

**Prerequisites**:
- [What needs to be true for this issue to occur?]
- [What state is the system in?]
- [What was agent trying to accomplish?]

**Frequency**:
- [ ] One-time edge case
- [ ] Occasional (< 25% of attempts)
- [x] Common (> 50% of attempts) ← Mark applicable
- [ ] Always reproducible (100%)

**Impact**:
- [ ] Low (inconvenience, easily worked around)
- [ ] Medium (time loss, requires manual fix)
- [x] High (data loss risk, blocks progress) ← Mark applicable
- [ ] Critical (production outage, security risk)

---

## Root Cause

**Technical Explanation**:
[Why does this happen? Reference source code, configuration, or environment]

**Source Code Reference** (if applicable):
- File: `path/to/file.ext`
- Line: 123-145
- Component: [function/class name]

**Configuration Issue** (if applicable):
- Config file: `path/to/config`
- Setting: `setting_name = value`
- Why it's wrong: [explanation]

**Example**:
```typescript
// File: src/app/[locale]/vehicles/[slug]/page.tsx:78
const modelName = modelParts.join(' ');  // "uni t" (space)

// Database has "UNI-T" (hyphen), query fails
const { data } = await supabase
  .from('vehicle_trims')
  .ilike('models.name', `%${modelName}%`);  // No match!
```

---

## Solution

### Step-by-Step Fix

1. **[First Step Name]**
   ```bash
   # Command or code change
   ```
   **Expected Output**: [what you should see]

2. **[Second Step Name]**
   ```typescript
   // Code example with inline comments
   const fixed = solution();
   ```

3. **[Verification Step]**
   ```bash
   # How to verify fix worked
   ```
   **Success Criteria**: [what indicates success]

### Complete Code Example

**Before** (broken):
```typescript
// src/components/Example.tsx (WRONG)
function broken() {
  const wrong = approach();
  return wrong;
}
```

**After** (fixed):
```typescript
// src/components/Example.tsx (CORRECT)
function fixed() {
  // Explain why this works
  const correct = approach();
  return correct;
}
```

### Alternative Solutions Considered

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| [Alternative 1] | ✅ Simple | ❌ Doesn't handle edge case X | ❌ Rejected |
| [Alternative 2] | ✅ Comprehensive | ❌ Over-engineered | ❌ Rejected |
| **[Chosen solution]** | ✅ Balanced | ✅ Handles all cases | ✅ **CHOSEN** |

---

## Prevention

### Do This ✅

- **Before [action]**: Run `[verification command]`
- **When [scenario]**: Use `[correct pattern]`
- **If [condition]**: Apply `[safeguard]`

**Example**:
```bash
# ALWAYS check git status before destructive operations
git status
git diff --stat

# THEN run reset
git reset --hard origin/main
```

### Don't Do This ❌

- **Never**: `[anti-pattern command]` without `[safeguard]`
- **Avoid**: `[inefficient approach]` (use `[better alternative]` instead)
- **Don't assume**: `[common false assumption]`

**Example**:
```bash
# ❌ DON'T: Assume working tree is clean
git reset --hard origin/main  # DANGER: Loses uncommitted work

# ✅ DO: Verify first
git status  # Check for uncommitted changes
git stash   # Save work
git reset --hard origin/main
git stash pop  # Restore work
```

### Automated Safeguards

**Pre-commit Hook**:
```bash
#!/bin/bash
# .husky/pre-commit-[topic]
[hook code that prevents this issue]
```

**Linting Rule**:
```javascript
// .eslintrc.js
{
  "rules": {
    "[rule-name]": ["error", { "option": "value" }]
  }
}
```

**CI Check**:
```yaml
# .github/workflows/[workflow].yml
- name: Prevent [issue]
  run: [verification command]
```

---

## Verification

### How to Test This Lesson Still Works

1. **Setup**: `[commands to create test scenario]`
2. **Trigger**: `[commands to reproduce original problem]`
3. **Apply Fix**: `[commands from Solution section]`
4. **Verify**: `[commands to confirm fix worked]`

**Last Verified**: YYYY-MM-DD by [AGENT]
**Verification Frequency**: [Monthly | Quarterly | After dependency updates]

---

## Related Lessons

### Direct Dependencies
- [Related Lesson 1](../category/LESSON_FILE.md) - Why? [Brief explanation]
- [Related Lesson 2](../category/LESSON_FILE.md) - Why? [Brief explanation]

### Similar Issues
- [Similar Lesson 1](../category/LESSON_FILE.md) - Same root cause, different symptom
- [Similar Lesson 2](../category/LESSON_FILE.md) - Same symptom, different root cause

### Agent-Specific
- [Agent Strength/Weakness](../agent-specific/AGENT_LESSONS.md#section) - Relevant pattern

---

## Metadata

**Contributed By**: [AGENT] on [DATE]
**Session Log**: [Link to docs/PERFORMANCE_LOG.md#session or commit SHA]
**User Feedback**: [Quote if user explicitly corrected behavior]
**Repeat Count**: [How many times this mistake occurred before lesson created]

**Impact After Lesson**:
- [ ] Not yet measured
- [ ] Reduced occurrences (from X/week to Y/week)
- [ ] Eliminated (0 occurrences in 30 days)

---

## Example Real Lesson Below

---

# Slug Parsing Hyphen vs Space Mismatch

**Category**: debugging
**Agent**: CC
**Date**: 2026-01-05
**Session**: commit 411e243
**Status**: VERIFIED

---

## Problem/Symptom

**What Agent Observed**:
Vehicle detail pages for Changan Uni-T and Uni-V returning 404 errors, while other vehicles work fine.

**Example Error**:
```
URL: /en/vehicles/changan-uni-t-2026
Expected: Vehicle detail page with trims
Actual: 404 Not Found
```

**When It Happens**:
- [x] Specific command: Navigating to hyphenated model URLs
- [x] Specific workflow: User clicks vehicle card → slug generated with hyphens
- [x] Specific environment: Production & local dev

---

## Context

**Prerequisites**:
- Model name in database contains hyphens (e.g., "UNI-T 2026")
- URL slug generator converts spaces to hyphens
- Database query uses ILIKE pattern matching

**Frequency**:
- [x] Common (> 50% of attempts) - All hyphenated models affected

**Impact**:
- [x] High (blocks user access to affected vehicle pages)

---

## Root Cause

**Technical Explanation**:
Slug parsing converts URL `changan-uni-t-2026` to query pattern `"uni t"` (space), but database has `"UNI-T 2026"` (hyphen). PostgreSQL ILIKE doesn't match hyphen when querying for space.

**Source Code Reference**:
- File: `src/app/[locale]/vehicles/[slug]/page.tsx`
- Line: 64-78
- Component: VehicleDetailPage (server component)

**Example**:
```typescript
// URL: /en/vehicles/changan-uni-t-2026
const slug = params.slug; // "changan-uni-t-2026"
const parts = slug.split('-'); // ["changan", "uni", "t", "2026"]
const modelName = parts.slice(1, -1).join(' '); // "uni t" (space!)

// Database query
const { data } = await supabase
  .from('vehicle_trims')
  .ilike('models.name', `%${modelName}%`); // Searches for "%uni t%"

// Database has "UNI-T 2026" → NO MATCH → 404
```

---

## Solution

### Step-by-Step Fix

1. **Try space-separated pattern first**
   ```typescript
   const modelNameSpace = modelParts.join(' '); // "uni t"
   let { data: trims } = await supabase
     .from('vehicle_trims')
     .select(VEHICLE_DETAIL_SELECT)
     .ilike('models.name', `%${modelNameSpace}%`);
   ```

2. **Fallback to hyphen-separated pattern**
   ```typescript
   if ((!trims || trims.length === 0) && modelNameSpace !== modelNameHyphen) {
     const modelNameHyphen = modelParts.join('-'); // "uni-t"
     ({ data: trims } = await supabase
       .from('vehicle_trims')
       .select(VEHICLE_DETAIL_SELECT)
       .ilike('models.name', `%${modelNameHyphen}%`));
   }
   ```

3. **Verification**
   ```bash
   # Test URL
   curl http://localhost:3000/en/vehicles/changan-uni-t-2026
   # Expected: 200 OK with vehicle detail page
   ```

### Complete Code Example

**Before** (broken):
```typescript
// src/app/[locale]/vehicles/[slug]/page.tsx:78 (WRONG)
const modelName = modelParts.join(' ');

const { data: trims, error } = await supabase
  .from('vehicle_trims')
  .select(/* inline query */)
  .ilike('models.name', `%${modelName}%`);
```

**After** (fixed):
```typescript
// src/app/[locale]/vehicles/[slug]/page.tsx:78 (CORRECT)
const modelNameSpace = modelParts.join(' ');
const modelNameHyphen = modelParts.join('-');

// Try space-separated first (handles "Corolla Cross", "X Trail", etc.)
let { data: trims } = await supabase
  .from('vehicle_trims')
  .select(VEHICLE_DETAIL_SELECT)
  .ilike('models.name', `%${modelNameSpace}%`);

// Fallback to hyphen-separated (handles "UNI-T", "UNI-V", etc.)
if ((!trims || trims.length === 0) && modelNameSpace !== modelNameHyphen) {
  ({ data: trims } = await supabase
    .from('vehicle_trims')
    .select(VEHICLE_DETAIL_SELECT)
    .ilike('models.name', `%${modelNameHyphen}%`));
}
```

---

## Prevention

### Do This ✅

- **Before assuming query pattern**: Test with both space and hyphen variants
- **When adding new models**: Verify slug → database name mapping
- **If URL parsing**: Implement fallback patterns for special characters

### Don't Do This ❌

- **Never**: Assume URL slug format matches database exactly
- **Avoid**: Single-pattern queries for text with special chars
- **Don't assume**: All model names follow same naming convention

### Automated Safeguards

**Pre-deployment Check**:
```bash
# scripts/verify-vehicle-slugs.sh
# Query all models, generate slugs, verify each loads
```

---

## Related Lessons

### Direct Dependencies
- None (standalone pattern)

### Similar Issues
- [ZUSTAND_PERSISTENCE_ISSUES.md](ZUSTAND_PERSISTENCE_ISSUES.md) - Another data mismatch scenario

---

## Metadata

**Contributed By**: CC on 2026-01-05
**Session Log**: commit 411e243, docs/NEXT_SESSION_DEFERRED_TASKS.md:12-27
**User Feedback**: None (proactive fix during investigation)
**Repeat Count**: 1 (caught after 2 models affected)

**Impact After Lesson**:
- [x] Eliminated (0 occurrences in 30 days) - All hyphenated models now accessible
