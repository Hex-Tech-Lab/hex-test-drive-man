# Phase 2: Bundle Splitting Preparation

**Timeline**: Week of 2026-01-13 (after Phase 1 merge)
**Duration**: 3 weeks (15 working days)
**Agent**: CC (Claude Code)
**Goal**: Reduce FCP from 2.0s to 1.2-1.5s (40% additional improvement)

---

## Overview

Phase 2 builds on Phase 1's quick wins by implementing aggressive bundle splitting and tree shaking. This phase focuses on reducing the initial JavaScript bundle from ~276 KB to ~100 KB through strategic code splitting and optimization.

---

## Prerequisites (MUST BE COMPLETE)

- [x] Phase 1 merged to main ✅
- [x] Baseline metrics documented ✅
- [ ] Phase 1 production verification complete
- [ ] Lighthouse CI green on main branch
- [ ] Performance metrics confirmed: FCP ~2.0s, LCP ~2.5s

---

## Tasks Breakdown (3 weeks)

### Task 2.1: Webpack splitChunks Configuration (3 days)

**Goal**: Split vendor bundles from application code
**Expected Impact**: -80 KB initial bundle, +100ms FCP improvement

**Sub-tasks**:
1. Configure Next.js webpack splitChunks in next.config.mjs
2. Create separate chunks for:
   - MUI core (~120 KB) → separate chunk, lazy load
   - React/Next.js core (~80 KB) → keep in main bundle
   - Zustand stores (~8 KB) → main bundle
   - Application code (~68 KB) → main bundle
3. Set chunk size limits (maxInitialRequests: 3, maxAsyncRequests: 5)
4. Configure chunk naming strategy
5. Test bundle analyzer output
6. Verify no regressions in functionality

**Success Criteria**:
- Initial bundle < 150 KB
- MUI components load on-demand
- No perceived performance degradation
- Lighthouse CI passes

---

### Task 2.2: MUI Tree Shaking (4 days)

**Goal**: Eliminate unused MUI components from bundle
**Expected Impact**: -40 KB bundle reduction

**Sub-tasks**:
1. Audit MUI imports across all components
2. Convert barrel imports to named imports:
   - Before: `import { Button, TextField } from '@mui/material'`
   - After: `import Button from '@mui/material/Button'`
3. Configure babel-plugin-import for automatic tree shaking
4. Remove unused MUI components from bundle:
   - Stepper (not used) ~8 KB
   - Timeline (not used) ~6 KB
   - Masonry (not used) ~4 KB
   - Rating (not used) ~3 KB
5. Use MUI's new `@mui/material-pigment-css` for static CSS extraction (experimental)
6. Test production build with bundle analyzer
7. Verify all used components still work

**Success Criteria**:
- MUI bundle < 80 KB (down from ~120 KB)
- All UI components render correctly
- No runtime errors
- Lighthouse CI passes

---

### Task 2.3: Route-based Code Splitting (5 days)

**Goal**: Split catalog, detail, booking, comparison pages into separate chunks
**Expected Impact**: -60 KB initial bundle, +200ms FCP improvement

**Sub-tasks**:
1. Analyze current page sizes:
   - Catalog page: ~80 KB (VehicleCard, FilterPanel, VehicleSearch)
   - Detail page: ~60 KB (VehicleHero, TrimComparison, SpecsPanel)
   - Booking pages: ~40 KB (forms, OTP verification)
   - Comparison page: ~35 KB (ComparisonTable)
2. Implement dynamic imports for page-level components:
   - VehicleCard → lazy load below fold
   - TrimComparison → lazy load (not above fold)
   - SpecsPanel → lazy load (modal/accordion)
3. Create page-specific entry points
4. Configure Next.js route-based splitting
5. Test navigation performance (prefetch on hover)
6. Verify scroll restoration works
7. Test back/forward navigation

**Success Criteria**:
- Initial bundle < 100 KB
- Each page loads own chunk on-demand
- Navigation feels instant (prefetch working)
- No layout shift during chunk loading
- Lighthouse CI passes

---

### Task 2.4: Performance Verification & Documentation (3 days)

**Goal**: Confirm Phase 2 metrics and document results
**Expected Impact**: Validated 40% FCP improvement

**Sub-tasks**:
1. Run Lighthouse audits (3x desktop, 3x mobile)
2. Compare metrics vs Phase 1 baseline:
   - FCP: 2.0s → 1.2-1.5s target
   - LCP: 2.5s → 1.8-2.0s target
   - TBT: < 300ms maintained
   - CLS: < 0.1 maintained
3. Run bundle analyzer and document chunk sizes
4. Test on 3G/4G networks (Chrome DevTools throttling)
5. Create performance report in PERFORMANCE_LOG.md
6. Update OPTIMIZATION_ROADMAP.md with Phase 3 plan
7. Create PR with comprehensive metrics

**Success Criteria**:
- FCP ≤ 1.5s (desktop)
- LCP ≤ 2.0s (desktop)
- Initial bundle ≤ 100 KB
- All Lighthouse CI checks pass
- Performance report documented

---

## Target Metrics (Phase 2 Complete)

| Metric | Phase 1 | Phase 2 Target | Improvement |
|--------|---------|----------------|-------------|
| **FCP** | 2.0s | 1.2-1.5s | -25% to -40% |
| **LCP** | 2.5s | 1.8-2.0s | -20% to -28% |
| **Bundle** | 276 KB | 100 KB | -64% |
| **TBT** | <300ms | <300ms | Maintained |
| **CLS** | <0.1 | <0.1 | Maintained |

---

## Technical Approach

### 1. Webpack Configuration
```javascript
// next.config.mjs
export default {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          mui: {
            test: /[\\/]node_modules[\\/]@mui[\\/]/,
            name: 'mui',
            priority: 10,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            priority: 5,
          },
        },
      };
    }
    return config;
  },
};
```

### 2. MUI Tree Shaking
```typescript
// Before (barrel import - includes ALL MUI components)
import { Button, TextField, Box } from '@mui/material';

// After (named imports - only includes used components)
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
```

### 3. Route-based Splitting
```typescript
// Lazy load page-level components
const VehicleDetailPage = dynamic(() => import('@/components/VehicleDetailPage'), {
  loading: () => <SkeletonHero />,
  ssr: true, // SSR for SEO
});
```

---

## Risk Mitigation

### Risk 1: Bundle splitting breaks functionality
**Mitigation**:
- Test all user flows after each change
- Run E2E tests (Playwright) if available
- Keep Lighthouse CI checks green

### Risk 2: MUI tree shaking increases build time
**Mitigation**:
- Measure build time before/after
- Use webpack-bundle-analyzer to verify gains
- Consider reverting if build time > 5 min

### Risk 3: Route splitting causes layout shift
**Mitigation**:
- Use loading skeletons (SkeletonCard, SkeletonHero)
- Prefetch chunks on hover/intersection
- Test CLS metric stays < 0.1

---

## Dependencies

- Next.js 15.4.10 (webpack 5 included)
- @mui/material 6.4.3 (tree shaking support)
- webpack-bundle-analyzer (dev dependency)
- @next/bundle-analyzer (Next.js plugin)

---

## Success Definition

Phase 2 is complete when:
1. ✅ FCP ≤ 1.5s (desktop, Lighthouse audit)
2. ✅ Initial bundle ≤ 100 KB (webpack-bundle-analyzer)
3. ✅ All 4 tasks completed and merged
4. ✅ Lighthouse CI passes on main branch
5. ✅ No user-reported regressions (1 week after merge)
6. ✅ Performance log updated with final metrics

---

## Next: Phase 3 Preview

After Phase 2 completion, Phase 3 will focus on:
- Frame-based architecture (streaming SSR)
- Service Worker caching
- Predictive prefetching
- Target: FCP 1.2s → 0.8-1.0s (33% additional improvement)

---

**Last Updated**: 2026-01-05 1800 UTC
**Status**: Ready to start after Phase 1 production verification
**Owner**: CC (Claude Code)
