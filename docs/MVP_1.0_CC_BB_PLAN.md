# MVP 1.0 CC+BB Parallel Execution Plan

**Created**: 2025-12-23 02:20 UTC
**Agents**: CC (Claude Code), BB (Blackbox)
**Scope**: 5 Critical issues from CRITICAL_HIGH_BLOCKERS_ROSTER.md
**Timeline**: 8-12 hours total (parallel execution)
**Enforcement**: GitHub = single source of truth, sandbox → commit → push → PR

---

## Assignment Split

**CC: 3 issues (6-8 hours)**
- C2: Search functionality returns wrong results (logic + verification)
- C3: Locale persistence audit (architecture lead)
- C5: Language reload performance (routing + perf)

**BB: 2 issues (2-4 hours)**
- C1: 370 vs 409 vehicle display discrepancy (data/UI)
- C4: Price slider position bug (UI component)

**Workload Balance**: CC:BB = 3:2 issues (6-8h : 2-4h ratio = 2-3:1 effort ratio)

---

## CC Branch: cc/mvp1-criticals

### Setup
```bash
git checkout main
git pull origin main
git checkout -b cc/mvp1-criticals
```

### C2: Search Functionality Fix (2-3 hours)
**File**: `src/components/FilterPanel.tsx`, `src/app/[locale]/page.tsx`

**Issue**: Typing 'p' returns Nissan Sunny instead of Porsche/Peugeot

**Tasks**:
1. Inspect filter logic in FilterPanel.tsx and page.tsx
2. Debug: toLowerCase(), includes(), startsWith() usage
3. Fix case sensitivity and partial match algorithm
4. Test edge cases: single letters (a-z), numbers, Arabic text, special chars
5. Add search term highlighting for matched text
6. Verify 'p' matches Porsche/Peugeot, not Nissan
7. Commit with test results

**Acceptance Criteria**:
- 'p' returns Porsche, Peugeot (not Nissan)
- Arabic search works correctly
- Search highlighting shows matched terms
- Edge cases tested (1 char, numbers, special chars)

---

### C3: Locale Persistence Audit (2-3 hours)
**File**: All router.push() calls, LOCALE_ROUTING_SPEC.md compliance

**Issue**: Comprehensive audit needed to ensure 100% locale preservation compliance

**Tasks**:
1. Grep codebase for all 'router.push' patterns
2. Verify each call includes `/${locale}/...` prefix per LOCALE_ROUTING_SPEC.md Rule 2
3. Flag any violations (missing locale parameter)
4. Check for hardcoded '/en/' or '/ar/' paths (forbidden)
5. Verify no window.location.reload() after router.push()
6. Create audit report: compliant count, violation list with file:line
7. Fix violations or document safe exceptions
8. Update LOCALE_ROUTING_SPEC.md with audit results

**Acceptance Criteria**:
- Audit report documents all router.push() calls (count, violations)
- 100% compliance or documented exceptions
- No locale flipping bugs remain
- LOCALE_ROUTING_SPEC.md updated with audit timestamp

---

### C5: Language Reload Performance (2 hours)
**File**: `src/components/Header.tsx`, language switcher

**Issue**: Full page reload on language switch (2-3s) instead of client-side transition (<500ms)

**Tasks**:
1. Inspect Header.tsx language switcher logic
2. Identify window.location.reload() calls (forbidden per LOCALE_ROUTING_SPEC.md Rule 4)
3. Verify router.push() handles locale change without reload
4. Test: switch EN→AR→EN, measure time with DevTools Network tab
5. Target: <500ms client-side transition (no full reload)
6. Ensure RTL/LTR switch still works correctly
7. Commit with performance comparison (before/after screenshots)

**Acceptance Criteria**:
- Language switch <500ms (no full reload)
- RTL/LTR direction switch works correctly
- No window.location.reload() in code
- Performance metrics documented (Network tab screenshot)

---

## BB Branch: bb/mvp1-ui-fixes

### Setup
```bash
git checkout main
git pull origin main
git checkout -b bb/mvp1-ui-fixes
```

### C1: 370 vs 409 Vehicle Discrepancy (1-2 hours)
**File**: `src/repositories/vehicleRepository.ts`, `src/app/[locale]/page.tsx`

**Issue**: Catalog displays 370 vehicles instead of 409 (39 missing)

**Tasks**:
1. Query Supabase REST API to confirm 409 vehicle_trims exist
2. Check vehicleRepository.ts for hidden filters (WHERE clauses, active/published/hidden fields)
3. Inspect page.tsx for client-side filtering logic
4. Add console.log of vehicles.length before/after all filters
5. Identify and remove the hidden filter
6. Verify all 409 vehicles display in catalog
7. Report findings with fix

**Acceptance Criteria**:
- Catalog displays all 409 vehicles (verified count)
- No hidden filters remain in repository or page
- Console logs show 409 vehicles at all stages
- Root cause documented in commit message

---

### C4: Price Slider Position Bug (1-2 hours)
**File**: `src/components/FilterPanel.tsx`, MUI Slider component

**Issue**: Thumb stuck at ~40% position when max=3.9M EGP

**Tasks**:
1. Test Slider with different max values (1M, 5M, 10M, 20M)
2. Check MUI Slider props: step, scale, marks, valueLabelDisplay
3. Consider logarithmic scale for large ranges (scale="log" or custom scale function)
4. Verify thumb position matches selected value across full range
5. Test on Chrome/Firefox/Safari
6. Commit fix with before/after screenshots

**Acceptance Criteria**:
- Thumb position visually matches selected value (0-3.9M range)
- Works across all browsers (Chrome/Firefox/Safari)
- Before/after screenshots in commit message
- No visual glitches at min/max values

---

## Merge Strategy

### CC Merge (after completion)
```bash
# CC branch complete → push → create PR
git push origin cc/mvp1-criticals
gh pr create --base main --head cc/mvp1-criticals \
  --title "fix(mvp1): search + locale audit + reload perf (C2,C3,C5)" \
  --body "Fixes 3 MVP 1.0 Critical issues. See CRITICAL_HIGH_BLOCKERS_ROSTER.md C2, C3, C5."

# After PR merge → update CLAUDE.md (CC owns agent docs)
```

### BB Merge (after completion)
```bash
# BB branch complete → push → create PR
git push origin bb/mvp1-ui-fixes
gh pr create --base main --head bb/mvp1-ui-fixes \
  --title "fix(mvp1): 370→409 vehicles + slider position (C1,C4)" \
  --body "Fixes 2 MVP 1.0 Critical UI issues. See CRITICAL_HIGH_BLOCKERS_ROSTER.md C1, C4."

# BB does NOT update CLAUDE.md (CC owns agent docs)
```

### Coordination
- **Independent branches**: No merge conflicts expected (different files)
- **Can merge in any order**: CC or BB can merge first
- **Post-merge**: CC updates CLAUDE.md to mark C1-C5 as completed

---

## Enforcement Rules

### GitHub Single Source of Truth
- ✅ **BB Sandbox → GitHub**: BB must commit → push → PR (no local-only work)
- ✅ **CC Updates Docs**: Only CC updates CLAUDE.md post-merge
- ❌ **No Direct Commits to Main**: Both agents must use feature branches + PRs

### Documentation Standards
- ✅ **Commit Messages**: Conventional commits (fix/feat/refactor/docs)
- ✅ **PR Descriptions**: Link to CRITICAL_HIGH_BLOCKERS_ROSTER.md issue IDs (C1-C5)
- ✅ **Before/After Evidence**: Screenshots for visual bugs (C4)
- ✅ **Performance Metrics**: Network tab screenshots for reload fix (C5)

### Quality Gates
- ✅ **TypeScript**: Zero errors (strict mode)
- ✅ **ESLint**: Zero errors (warnings acceptable)
- ✅ **Manual Testing**: All acceptance criteria verified
- ✅ **Locale Testing**: Test EN and AR for all fixes

---

## Self-Critique

### Is CC:BB workload balanced? (3:2 reasonable?)
**Analysis**:
- CC: 6-8 hours (3 issues, complex logic + architecture + performance)
- BB: 2-4 hours (2 issues, UI bugs + data filtering)
- Ratio: 2-3:1 effort ratio seems reasonable

**Concern**: C3 (locale audit) could take longer if many violations found
**Mitigation**: C3 is "audit + fix", not full rewrite. If >10 violations, escalate to user.

**Verdict**: ✅ Balanced (CC has architectural expertise for complex issues, BB handles focused UI wins)

---

### BB sandbox → GitHub enforcement clear?
**Analysis**:
- BB branch explicitly documented: `git checkout -b bb/mvp1-ui-fixes`
- Push command provided: `git push origin bb/mvp1-ui-fixes`
- PR creation command provided: `gh pr create ...`
- Post-merge: BB does NOT update CLAUDE.md (CC owns agent docs)

**Concern**: BB may forget to push to GitHub (local-only work habit)
**Mitigation**: Explicit "GitHub = single source of truth" in Enforcement Rules

**Verdict**: ✅ Clear (step-by-step Git commands provided, enforcement rule explicit)

---

### 8-12 hours total realistic for 2 agents?
**Analysis**:
- CC: 6-8 hours (parallel execution)
- BB: 2-4 hours (parallel execution)
- **Parallel**: Max 8 hours (if BB finishes first, waits for CC)
- **Serial**: 8-12 hours (if CC and BB work sequentially)

**Assumption**: Parallel execution (both agents work simultaneously)

**Concern**: If agents must coordinate (shared files), could take longer
**Mitigation**: Independent files (no overlap expected), can merge in any order

**Verdict**: ✅ Realistic (8-12 hours assumes parallel, independent work)

---

## Success Criteria

**MVP 1.0 Complete When**:
- ✅ All 409 vehicles display in catalog (C1)
- ✅ Search returns correct results (C2)
- ✅ Locale audit shows 100% compliance (C3)
- ✅ Price slider thumb position accurate (C4)
- ✅ Language switch <500ms (no reload) (C5)
- ✅ Both PRs merged to main
- ✅ CLAUDE.md updated with completion status

**Demo-Ready Indicators**:
- User can search "Porsche" and find all Porsche models
- User can switch EN↔AR without page reload
- User can filter by price with accurate visual feedback
- All 409 vehicles visible (no missing vehicles)

---

## Next Steps (After MVP 1.0 Complete)

**Immediate** (MVP 1.1):
- H1: Download 124 missing hero images (GC, when available)
- H5-H9: Implement UX enhancements (sort dropdown, grid toggle, etc.)

**Follow-Up** (MVP 1.5):
- H2: JSDoc enforcement (ESLint + pre-commit hook)
- B1-B4: Potential blockers (booking migration, cross-platform, HTTP handling)

**Reference**: CRITICAL_HIGH_BLOCKERS_ROSTER.md for full roadmap

---

**Last Updated**: 2025-12-23 02:20 UTC
**Maintained By**: CC (Claude Code)
**Status**: ACTIVE - CC and BB ready to execute
