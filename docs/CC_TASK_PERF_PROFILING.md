# CC Task: Performance Profiling & Phase 3 Fixes

**Agent**: CC (Claude Code)  
**Scheduled**: Saturday 2026-01-11 (or next available session)  
**Duration**: 4-6 hours  
**Priority**: HIGH  
**Context**: Phase 2 merged (PR #37), but Lighthouse reveals 4 performance regressions

---

## Task Overview

Phase 2 successfully implemented cache/animation/bundle optimizations, but **Lighthouse audit reveals 4 new performance issues** requiring deep profiling with Chrome DevTools. Your task is to:

1. **Profile** the production site (https://getmytestdrive.com) with Chrome DevTools
2. **Identify root causes** for 4 performance regressions (PERF-011 to PERF-014)
3. **Implement fixes** in priority order (CRITICAL → HIGH)
4. **Verify improvements** with Lighthouse (target: Performance score >90)
5. **Document findings** in `docs/PERFORMANCE_PHASE3_COMPLETE.md`

---

## Issues to Fix (Priority Order)

### 1. PERF-011: Forced Reflow in MUI Chunk (1,141ms) ⚠️ CRITICAL

**Impact**: 1,141ms forced reflow blocks main thread, delays interactivity  
**Effort**: 2-3 hours  
**Tools**: Chrome DevTools Performance tab, React DevTools Profiler

**Investigation Steps**:
1. Open https://getmytestdrive.com in Chrome
2. Open DevTools → Performance tab
3. Record page load (Ctrl+Shift+E)
4. Find "Recalculate Style" events >100ms
5. Identify call stack (likely FilterPanel or CartDrawer)

**Hypotheses**:
- FilterPanel skeleton dimensions ≠ actual dimensions (causes layout shift)
- CartDrawer animation triggers reflow (width calculation)
- VehicleCard grid recalculates on every render (dynamic columns)
- MUI theme switching (EN/AR, RTL/LTR) forces style recalc

**Proposed Fixes**:
- Batch DOM reads/writes with `requestAnimationFrame`
- Use CSS containment (`contain: layout style paint`)
- Memoize grid column calculations
- Preload theme styles (avoid runtime recalc)

**Success Criteria**: Forced reflow <200ms (Lighthouse audit)

---

### 2. PERF-012: JS Execution REGRESSION (2.5s → 5.4s) ⚠️ HIGH

**Impact**: 116% regression in JS execution time (Phase 1: 2.5s → Phase 2: 5.4s)  
**Effort**: 1-2 hours  
**Tools**: Lighthouse Treemap, Chrome DevTools Coverage

**Investigation Steps**:
1. Run Lighthouse audit on production
2. Open Treemap view (shows bundle sizes)
3. Identify largest JS bundles (main, MUI, vendor)
4. Check if `@next/bundle-analyzer` is in production build (should be dev-only)
5. Open DevTools → Coverage tab
6. Measure unused JavaScript (should be <20%)

**Hypotheses**:
- Bundle analyzer overhead in production (should be dev-only)
- `getTransitionDuration()` called on every theme access (hot path)
- `createTheme()` called multiple times (should be memoized)
- Zustand object selectors causing React 19 infinite loops

**Proposed Fixes**:
- Verify `ANALYZE=true` gating in `next.config.mjs`
- Memoize theme creation with `useMemo(() => getTheme(locale), [locale])`
- Move accessibility check to component level (not theme level)
- Audit Zustand selectors (use primitives, not objects)

**Success Criteria**: JS execution <3.0s (no regression vs Phase 1)

---

### 3. PERF-013: DOM Size Explosion (4,953 elements) ⚠️ HIGH

**Impact**: 4,953 DOM elements exceed recommended 1,500 limit (330% over)  
**Effort**: 2-3 hours  
**Tools**: React DevTools Elements, Lighthouse Diagnostics

**Investigation Steps**:
1. Open https://getmytestdrive.com/en
2. Open DevTools → Elements tab
3. Inspect VehicleCard DOM structure
4. Count elements per card (~12 expected)
5. Verify 409 cards × 12 = 4,908 elements

**Root Cause**: All 409 vehicles rendered at once (no virtualization)

**Proposed Fixes**:
- **Option 1**: Virtualization with `react-window` (complex, SEO impact)
- **Option 2**: Pagination (50 vehicles per page, SEO-friendly)
- **Option 3**: Infinite scroll with intersection observer

**Recommendation**: Start with **pagination** (simpler, SEO-friendly). Evaluate virtualization if user feedback demands it.

**Success Criteria**: DOM size <1,500 elements (Lighthouse audit)

---

### 4. PERF-014: Deprecated Synchronous XMLHttpRequest ⚠️ HIGH

**Impact**: Blocks main thread, deprecated API  
**Effort**: 0.5-1 hour  
**Tools**: Chrome DevTools Network tab, Webpack Bundle Analyzer

**Investigation Steps**:
1. Open DevTools → Network tab
2. Filter by XHR
3. Look for synchronous requests (red flag icon)
4. Identify source library (likely Sentry or Vercel Analytics)

**Proposed Fixes**:
- Update dependencies: `pnpm update @sentry/nextjs @vercel/analytics`
- If not fixable, remove offending dependency (if non-critical)

**Success Criteria**: No synchronous XHR warnings (Lighthouse audit)

---

## Workflow

### Step 1: Setup (15 min)
```bash
cd ~/projects/hex-test-drive-man
git checkout main
git pull origin main
git checkout -b cc/performance-phase3-profiling
```

### Step 2: Baseline Audit (15 min)
```bash
# Run Lighthouse on production
lighthouse https://getmytestdrive.com --view

# Save report
lighthouse https://getmytestdrive.com --output=html --output-path=docs/lighthouse-phase2-baseline.html
```

### Step 3: Profile & Fix (3-4 hours)

For each issue (PERF-011 → PERF-014):
1. **Profile** with Chrome DevTools (Performance, Coverage, Network)
2. **Identify root cause** (call stack, bundle size, DOM structure)
3. **Implement fix** (code changes in feature branch)
4. **Test locally** (`pnpm dev`, verify fix works)
5. **Commit** with descriptive message

### Step 4: Verify (30 min)
```bash
# Build production bundle
pnpm build

# Run Lighthouse on local build
lighthouse http://localhost:3000 --view

# Compare metrics vs baseline
# Target: Performance score >90, FCP <1.5s, LCP <2.0s
```

### Step 5: Document (30 min)

Create `docs/PERFORMANCE_PHASE3_COMPLETE.md`:
- Issues fixed (PERF-011 to PERF-014)
- Root causes identified
- Fixes implemented
- Before/after metrics (Lighthouse scores)
- Lessons learned

### Step 6: PR & Merge (15 min)
```bash
git add -A
git commit -m "perf(phase3): fix forced reflow, JS regression, DOM size, sync XHR"
git push -u origin cc/performance-phase3-profiling

# Create PR via GitHub
gh pr create --base main --head cc/performance-phase3-profiling \
  --title "Performance Phase 3 - Profiling & Regression Fixes" \
  --body "See docs/PERFORMANCE_PHASE3_COMPLETE.md"

# Wait for CI, then merge
gh pr merge --squash
```

---

## Tools & Resources

### Chrome DevTools
- **Performance tab**: Record page load, find long tasks, forced reflows
- **Coverage tab**: Measure unused JavaScript (should be <20%)
- **Network tab**: Identify synchronous XHR, large bundles
- **Elements tab**: Inspect DOM structure, count elements

### React DevTools
- **Profiler**: Measure component render time, find re-render loops
- **Components**: Inspect props, state, hooks

### Lighthouse
- **Performance audit**: FCP, LCP, TBT, CLS metrics
- **Treemap view**: Visualize bundle sizes
- **Diagnostics**: Forced reflows, DOM size, deprecated APIs

### Webpack Bundle Analyzer
```bash
pnpm run analyze
# Opens http://localhost:8888
# Check: MUI chunk size, vendor chunk size, app code size
```

---

## Expected Outcomes

### Metrics (Before → After)

| Metric | Phase 2 Baseline | Phase 3 Target | Improvement |
|--------|------------------|----------------|-------------|
| **Performance Score** | 75-80 | >90 | +10-15 points |
| **FCP** | 1.8-1.9s | 1.2-1.5s | -25% to -37% |
| **LCP** | 2.3-2.4s | 1.8-2.0s | -13% to -22% |
| **TBT** | <250ms | <200ms | -20% |
| **CLS** | <0.1 | <0.1 | Maintained |
| **JS Execution** | 5.4s | <3.0s | -44% |
| **DOM Size** | 4,953 | <1,500 | -70% |

### Deliverables

1. ✅ Fixed PERF-011 (forced reflow <200ms)
2. ✅ Fixed PERF-012 (JS execution <3.0s)
3. ✅ Fixed PERF-013 (DOM size <1,500)
4. ✅ Fixed PERF-014 (no sync XHR)
5. ✅ Lighthouse report (Performance score >90)
6. ✅ Documentation (`docs/PERFORMANCE_PHASE3_COMPLETE.md`)
7. ✅ PR merged to main

---

## References

- **Phase 2 Completion**: `docs/PERFORMANCE_PHASE2_COMPLETE.md`
- **Issues Document**: `docs/PERFORMANCE_ISSUES_PHASE3.md`
- **PR #37 Review**: `docs/PR_37_REVIEW_ANALYSIS.md`
- **Lighthouse Docs**: https://developer.chrome.com/docs/lighthouse/performance/
- **React Profiler**: https://react.dev/reference/react/Profiler
- **Chrome DevTools**: https://developer.chrome.com/docs/devtools/

---

**Created**: 2026-01-06 2300 UTC  
**Agent**: BB (Blackbox AI)  
**Status**: Queued for CC (Saturday or next available session)  
**Estimated Duration**: 4-6 hours
