# Performance Optimization Roadmap

**Version**: 1.0
**Date**: 2026-01-05
**Owner**: CC (Claude Code) - Design | BB/GC - Implementation
**Timeline**: 9-11 weeks (3 phases + 1 week buffer)

---

## Executive Summary

**Goal**: Reduce LCP from 3.84s to < 1.5s through phased optimization.

**Approach**:
- **Phase 1**: Quick wins (image optimization, lazy loading) - **2 weeks**
- **Phase 2**: Bundle splitting (webpack config, code splitting) - **3 weeks**
- **Phase 3**: Frame architecture (advanced caching, progressive loading) - **4 weeks**

**Expected ROI**:
- Phase 1: 40-50% FCP improvement (3.84s → 2.0-2.3s)
- Phase 2: Additional 30-40% (2.0s → 1.2-1.5s)
- Phase 3: Refinement + long-term performance (< 1.5s maintained)

---

## Phase 1: Quick Wins (2 weeks)

**Objective**: Achieve 40-50% FCP improvement with minimal code changes.

**Target Metrics**:
- FCP: 3.84s → **2.0-2.3s**
- Initial Bundle: 341 KB → **250-280 KB**
- LCP: 3.84s → **2.5-3.0s**

### Task 1.1: Image Optimization (3 days)

**Owner**: BB
**Complexity**: Low
**Impact**: High (LCP -300ms estimated)

**Subtasks**:
1. Add `fetchpriority="high"` to hero images (LCP candidates)
2. Add `loading="lazy"` to below-fold images
3. Convert images to WebP/AVIF (Next.js Image component)
4. Add image size hints (width/height attributes)
5. Preload LCP image in layout head

**Implementation**:

```typescript
// src/components/VehicleCard.tsx
import Image from 'next/image';

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const isAboveFold = vehicle.position <= 8;  // First 2 rows (4 cols x 2)

  return (
    <Card>
      <Image
        src={vehicle.hero_image_url || fallbackImage}
        alt={vehicle.name}
        width={400}
        height={300}
        loading={isAboveFold ? 'eager' : 'lazy'}
        fetchpriority={isAboveFold ? 'high' : 'low'}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      {/* ... */}
    </Card>
  );
}
```

```tsx
// src/app/[locale]/layout.tsx
export default function LocaleLayout({ children }: LocaleLayoutProps) {
  return (
    <html>
      <head>
        {/* Preload LCP image (hero on homepage) */}
        <link
          rel="preload"
          as="image"
          href="/images/hero.webp"
          fetchpriority="high"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

**Verification**:
```bash
# Lighthouse audit before/after
npx lighthouse https://hex-testdrive.com --view

# Check LCP element in DevTools Performance tab
# Should be hero image with optimized loading
```

**Success Criteria**:
- ✅ LCP element loads with `fetchpriority="high"`
- ✅ Below-fold images load lazily (not in initial network waterfall)
- ✅ LCP improvement of 300-500ms

---

### Task 1.2: Lazy Load Components (4 days)

**Owner**: BB
**Complexity**: Medium
**Impact**: High (FCP -500ms estimated)

**Components to Lazy Load**:
1. `FilterPanel` (~40 KB) - Load on scroll into view
2. `CompareDrawer` (~25 KB) - Load on first "Add to Compare"
3. `Footer` (~15 KB) - Load when browser idle
4. `MUI DatePicker` (~45 KB) - Load when booking form opened

**Implementation**:

```typescript
// src/app/[locale]/page.tsx (Home page)
import dynamic from 'next/dynamic';

// ❌ BEFORE: Eager load
import FilterPanel from '@/components/FilterPanel';

// ✅ AFTER: Lazy load with skeleton
const FilterPanel = dynamic(() => import('@/components/FilterPanel'), {
  loading: () => <FilterPanelSkeleton />,
  ssr: false,  // Uses localStorage, client-only
});

const Footer = dynamic(() => import('@/components/Footer'), {
  loading: () => null,  // No skeleton needed
  ssr: true,  // Server-render for SEO
});

export default function HomePage() {
  return (
    <>
      <Header />
      <VehicleCatalog />
      <FilterPanel />  {/* Lazy loaded when scrolled into view */}
      <Footer />  {/* Lazy loaded when browser idle */}
    </>
  );
}
```

```typescript
// src/components/FilterPanelSkeleton.tsx (new file)
export default function FilterPanelSkeleton() {
  return (
    <Box sx={{ width: 280, p: 2 }}>
      <Skeleton variant="text" width="60%" height={32} />
      <Skeleton variant="rectangular" width="100%" height={48} sx={{ mt: 2 }} />
      <Skeleton variant="rectangular" width="100%" height={48} sx={{ mt: 1 }} />
      {/* ... */}
    </Box>
  );
}
```

**Verification**:
```bash
# Check bundle analyzer
npx @next/bundle-analyzer

# FilterPanel should be in separate chunk, not in main bundle
# Main bundle should shrink by ~80-100 KB
```

**Success Criteria**:
- ✅ Main bundle size reduced by 80-100 KB
- ✅ FilterPanel loads only when visible (check Network tab)
- ✅ No layout shift when components load (skeletons prevent CLS)

---

### Task 1.3: Defer Non-Critical Scripts (2 days)

**Owner**: BB
**Complexity**: Low
**Impact**: Medium (FCP -200ms estimated)

**Scripts to Defer**:
1. Sentry (analytics) - Load after FCP
2. Third-party widgets (if any) - Load when browser idle
3. Non-critical MUI components (Autocomplete, DataGrid, etc.)

**Implementation**:

```typescript
// src/app/[locale]/layout.tsx
import { Suspense } from 'react';

// Defer Sentry initialization
const SentryInit = dynamic(() => import('@/lib/sentry-init'), {
  ssr: false,
  loading: () => null,
});

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html>
      <body>
        {children}

        {/* Load Sentry after page interactive */}
        <Suspense fallback={null}>
          <SentryInit />
        </Suspense>
      </body>
    </html>
  );
}
```

```typescript
// src/lib/sentry-init.tsx (new file)
'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function SentryInit() {
  useEffect(() => {
    // Initialize Sentry when browser idle
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        Sentry.init({ /* ... */ });
      });
    } else {
      setTimeout(() => Sentry.init({ /* ... */ }), 1000);
    }
  }, []);

  return null;
}
```

**Success Criteria**:
- ✅ Sentry script loaded after FCP (not blocking)
- ✅ Main thread idle time increased
- ✅ FCP improvement of 150-250ms

---

### Phase 1 Deliverables

**Files Modified/Created**:
- `src/components/VehicleCard.tsx` (Image optimization)
- `src/components/FilterPanelSkeleton.tsx` (new)
- `src/app/[locale]/layout.tsx` (preload LCP image, defer Sentry)
- `src/app/[locale]/page.tsx` (lazy load FilterPanel, Footer)
- `src/lib/sentry-init.tsx` (new)

**Metrics to Track**:
- Lighthouse score before/after
- Bundle size (main chunk)
- FCP delta
- LCP delta

**Rollout Plan**:
1. Week 1: Tasks 1.1 + 1.2
2. Week 2: Task 1.3 + testing
3. Deploy to staging → production (gradual rollout)

---

## Phase 2: Bundle Splitting (3 weeks)

**Objective**: Reduce initial bundle from 341 KB to < 120 KB through aggressive code splitting.

**Target Metrics**:
- FCP: 2.0s → **1.2-1.5s**
- Initial Bundle: 250 KB → **100-120 KB**
- LCP: 2.5s → **1.8-2.2s**

### Task 2.1: Webpack Splitting Config (3 days)

**Owner**: CC (design) → BB (implement)
**Complexity**: Medium
**Impact**: High (bundle -150 KB estimated)

**Strategy**: Split vendor chunks by usage pattern.

**Implementation**:

```javascript
// next.config.js
module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          // React/Next.js core (critical, ~40 KB)
          framework: {
            test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
            name: 'framework',
            priority: 40,
            enforce: true,
          },

          // MUI (lazy load, ~60-80 KB)
          mui: {
            test: /[\\/]node_modules[\\/]@mui[\\/]/,
            name: 'mui',
            priority: 30,
            enforce: true,
          },

          // Supabase (defer, ~30 KB)
          supabase: {
            test: /[\\/]node_modules[\\/]@supabase[\\/]/,
            name: 'supabase',
            priority: 20,
            enforce: true,
          },

          // Zustand + other state libs
          state: {
            test: /[\\/]node_modules[\\/](zustand|immer)[\\/]/,
            name: 'state',
            priority: 25,
            enforce: true,
          },

          // Everything else
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            priority: 10,
            minChunks: 2,  // Only if used in 2+ places
          },
        },
      };
    }

    return config;
  },
};
```

**Expected Bundle Structure**:
```
BEFORE (Phase 1):
- main bundle: 250 KB (all code)

AFTER (Phase 2):
- framework chunk: 40 KB (React/Next, critical)
- app chunk: 50 KB (our code, critical)
- mui chunk: 70 KB (lazy loaded when needed)
- supabase chunk: 30 KB (deferred)
- vendor chunk: 60 KB (utils, libraries)
────────────────────────────────────────────
Total: 250 KB (same), but critical path: 90 KB (40 + 50)
```

**Verification**:
```bash
# Build and analyze
pnpm build
npx @next/bundle-analyzer

# Check for chunks:
# - framework.js (~40 KB)
# - mui.js (~70 KB)
# - supabase.js (~30 KB)
```

**Success Criteria**:
- ✅ Critical path reduced to 90-100 KB (framework + app)
- ✅ MUI loaded separately (lazy loaded by dynamic imports)
- ✅ Parallel chunk downloads (faster overall load)

---

### Task 2.2: MUI Tree Shaking (4 days)

**Owner**: BB
**Complexity**: Medium
**Impact**: Medium (MUI bundle -20 KB estimated)

**Problem**: Currently importing entire `@mui/material` package.

**Solution**: Import only used components, enable tree shaking.

**Implementation**:

```typescript
// ❌ BEFORE: Imports entire MUI package
import { Button, Card, Typography } from '@mui/material';

// ✅ AFTER: Import individual components
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
```

**Automated Refactor**:
```bash
# Use ESLint rule to enforce individual imports
# .eslintrc.js
module.exports = {
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '@mui/material',
            message: 'Use individual imports: import Button from "@mui/material/Button"',
          },
          {
            name: '@mui/icons-material',
            message: 'Use individual imports: import Close from "@mui/icons-material/Close"',
          },
        ],
      },
    ],
  },
};

# Run ESLint fix
npx eslint --fix src/**/*.{ts,tsx}
```

**Verification**:
```bash
# Check MUI chunk size after tree shaking
# Should shrink from 70 KB to ~50 KB
```

**Success Criteria**:
- ✅ All MUI imports are individual (not package-level)
- ✅ MUI bundle size reduced by 20-30 KB
- ✅ Build time improves (less code to process)

---

### Task 2.3: Route-Based Code Splitting (5 days)

**Owner**: BB
**Complexity**: High
**Impact**: High (enables lazy route loading)

**Strategy**: Split code by route, load only what's needed.

**Implementation**:

```typescript
// src/app/[locale]/page.tsx (Home)
// Only load home-specific code
const VehicleCatalog = dynamic(() => import('@/components/VehicleCatalog'));

// src/app/[locale]/compare/page.tsx (Compare)
// Only load compare-specific code
const CompareTable = dynamic(() => import('@/components/CompareTable'));

// src/app/[locale]/vehicles/[slug]/page.tsx (Detail)
// Only load detail-specific code
const VehicleDetail = dynamic(() => import('@/components/VehicleDetail'));
```

**Shared Components** (loaded on all routes):
- Header
- Footer
- LanguageSwitcher
- AppProviders

**Route-Specific Components** (lazy loaded):
- VehicleCatalog (home only)
- CompareTable (compare page only)
- VehicleDetail (detail page only)
- BookingForm (booking page only)

**Verification**:
```bash
# Check route bundles
pnpm build

# Each route should have separate chunk:
# - [locale]/page.tsx → catalog chunk (~40 KB)
# - [locale]/compare/page.tsx → compare chunk (~30 KB)
# - [locale]/vehicles/[slug]/page.tsx → detail chunk (~50 KB)
```

**Success Criteria**:
- ✅ Each route has separate bundle (no shared route code)
- ✅ Navigation between routes loads only new chunks
- ✅ Shared layout cached (no re-download)

---

### Phase 2 Deliverables

**Files Modified**:
- `next.config.js` (webpack splitChunks)
- `.eslintrc.js` (MUI import restriction)
- All component files (MUI import refactor)
- All page files (route-based splitting)

**Metrics to Track**:
- Bundle size per route
- Chunk count and sizes
- Parallel download efficiency
- FCP/LCP delta

**Rollout Plan**:
1. Week 1: Task 2.1 (webpack config) + testing
2. Week 2: Task 2.2 (MUI tree shaking) + Task 2.3 start
3. Week 3: Task 2.3 complete + integration testing
4. Deploy to staging → production (A/B test 50/50)

---

## Phase 3: Frame Architecture (4 weeks)

**Objective**: Implement frame-based loading for advanced caching and progressive enhancement.

**Target Metrics**:
- FCP: 1.2s → **< 1.0s** (maintain)
- LCP: 1.8s → **< 1.5s** (maintain)
- Repeat Visit FCP: **< 500ms** (with caching)

### Task 3.1: FrameManager Implementation (5 days)

**Owner**: CC (design) → GC (implement)
**Complexity**: High
**Impact**: Medium (architecture foundation)

**Deliverable**: Core `FrameManager` class (see `PERFORMANCE_ARCHITECTURE_DESIGN.md` Section 3.1).

**Implementation Plan**:
1. Create `src/lib/frame-manager.ts` (FrameManager class)
2. Define frame configurations (`APP_FRAMES`)
3. Implement loading strategies (eager, lazy, visible, idle)
4. Add caching layer (sessionStorage, localStorage)
5. Add reload triggers (language-change, manual, etc.)

**Testing**:
```typescript
// src/lib/__tests__/frame-manager.test.ts
describe('FrameManager', () => {
  it('loads eager frames immediately', async () => {
    const manager = new FrameManager();
    manager.registerFrame({
      id: 'header',
      priority: 'critical',
      loadStrategy: 'eager',
      // ...
    });

    await manager.loadFrame('header');
    expect(manager.isLoaded('header')).toBe(true);
  });

  it('reloads frames on language change', () => {
    // Test that catalog frame NOT reloaded
    // Test that header frame IS reloaded
  });
});
```

**Success Criteria**:
- ✅ FrameManager unit tests pass (>90% coverage)
- ✅ Frames load according to strategy (eager/lazy/visible/idle)
- ✅ Language change only reloads text frames (not catalog)

---

### Task 3.2: Catalog Frame Integration (6 days)

**Owner**: GC
**Complexity**: High
**Impact**: High (prevents catalog reload on language switch)

**Problem**: Currently, language switch re-fetches all vehicle data (wasteful).

**Solution**: Catalog frame with persistent caching, only text translations reload.

**Implementation**:

```typescript
// src/frames/CatalogFrame.tsx (new)
'use client';

import { useEffect } from 'react';
import { frameManager } from '@/lib/frame-manager';
import { useLanguageStore } from '@/stores/language-store';

export default function CatalogFrame() {
  const language = useLanguageStore((state) => state.language);

  useEffect(() => {
    // Register catalog frame
    frameManager.registerFrame({
      id: 'catalog',
      priority: 'critical',
      loadStrategy: 'eager',
      cacheStrategy: 'persistent',  // Don't reload on language change
      reloadTriggers: ['filter-change', 'manual'],
    });
  }, []);

  // Catalog data is language-independent (IDs, prices, specs)
  // Only labels/translations change with language

  return (
    <VehicleCatalog
      data={cachedCatalogData}  // From persistent cache
      labels={languageLabels[language]}  // From session cache
    />
  );
}
```

**Verification**:
```bash
# Manual test:
# 1. Load homepage (catalog loads)
# 2. Switch language (observe network tab)
# 3. Catalog data NOT re-fetched (only translations)
```

**Success Criteria**:
- ✅ Language switch doesn't re-fetch vehicle data
- ✅ Only translations reload (< 5 KB network traffic)
- ✅ Perceived performance: instant language switch

---

### Task 3.3: Service Worker Caching (6 days)

**Owner**: GC
**Complexity**: High
**Impact**: High (repeat visit FCP < 500ms)

**Strategy**: Precache critical assets using Workbox.

**Implementation**:

```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/lbttmhwckcrfdymwyuhn\.supabase\.co\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'supabase-api',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24,  // 24 hours
        },
      },
    },
    {
      urlPattern: /^https:\/\/hex-testdrive\.com\/_next\/image\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-images',
        expiration: {
          maxEntries: 500,
          maxAgeSeconds: 60 * 60 * 24 * 365,  // 1 year
        },
      },
    },
  ],
});

module.exports = withPWA({
  // existing config
});
```

**Success Criteria**:
- ✅ Critical assets cached on first visit
- ✅ Repeat visit FCP < 500ms (from cache)
- ✅ Offline mode works for cached pages

---

### Task 3.4: Performance Monitoring (5 days)

**Owner**: BB
**Complexity**: Medium
**Impact**: High (long-term performance maintenance)

**Deliverable**: Automated performance tracking and alerting.

**Implementation**:

```typescript
// src/lib/performance-monitor.ts (new)
export class PerformanceMonitor {
  trackWebVitals(): void {
    // Report to Sentry Performance
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
      onCLS(this.sendToSentry);
      onFID(this.sendToSentry);
      onFCP(this.sendToSentry);
      onLCP(this.sendToSentry);
      onTTFB(this.sendToSentry);
    });
  }

  private sendToSentry(metric: any): void {
    // Send to Sentry
    Sentry.addBreadcrumb({
      category: 'web-vitals',
      message: `${metric.name}: ${metric.value}`,
      level: 'info',
    });
  }
}
```

```yaml
# .github/workflows/lighthouse-ci.yml (new)
name: Lighthouse CI

on:
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install && npm run build
      - uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            https://hex-testdrive.com
            https://hex-testdrive.com/en/compare
          uploadArtifacts: true
          budgetPath: ./lighthouse-budget.json
```

**Success Criteria**:
- ✅ Lighthouse CI runs on every PR
- ✅ Web Vitals tracked in Sentry
- ✅ Performance budget enforced (LCP < 1.5s, FCP < 1.0s)

---

### Phase 3 Deliverables

**Files Created**:
- `src/lib/frame-manager.ts`
- `src/frames/CatalogFrame.tsx`
- `src/lib/performance-monitor.ts`
- `.github/workflows/lighthouse-ci.yml`
- `lighthouse-budget.json`

**Metrics to Track**:
- Repeat visit FCP
- Cache hit rate
- Language switch performance
- Lighthouse CI scores

**Rollout Plan**:
1. Week 1: Task 3.1 (FrameManager) + unit tests
2. Week 2: Task 3.2 (Catalog frame integration) + testing
3. Week 3: Task 3.3 (Service Worker) + offline testing
4. Week 4: Task 3.4 (monitoring) + final integration tests
5. Deploy to staging → production (gradual rollout 10% → 50% → 100%)

---

## Success Metrics & Monitoring

### Target Metrics (Post-Phase 3)

| Metric | Baseline | Phase 1 | Phase 2 | Phase 3 | Target |
|--------|----------|---------|---------|---------|--------|
| **FCP** | 3.84s | 2.0-2.3s | 1.2-1.5s | < 1.0s | ✅ < 1.0s |
| **LCP** | 3.84s | 2.5-3.0s | 1.8-2.2s | < 1.5s | ✅ < 1.5s |
| **TTI** | Unknown | 3.5s | 2.0s | 1.5s | < 2.5s |
| **CLS** | Unknown | < 0.1 | < 0.1 | < 0.05 | < 0.1 |
| **Bundle** | 341 KB | 250 KB | 100 KB | 90 KB | < 120 KB |

### Continuous Monitoring

**Tools**:
1. **Lighthouse CI** (automated on PR)
2. **Sentry Performance** (RUM)
3. **Next.js Analytics** (Web Vitals)
4. **Bundle Analyzer** (weekly reports)

**Alerts**:
- LCP > 1.8s for 3 days → High priority
- FCP regression > 200ms → Block PR
- Bundle size > 120 KB → Block PR

---

## Risk Mitigation

### Identified Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Regression in Phase 2 | Medium | High | A/B test 50/50, rollback plan |
| Service Worker bugs | Medium | High | Feature flag, gradual rollout |
| User experience degradation | Low | High | User surveys, analytics tracking |
| Development delays | Medium | Medium | 1 week buffer, parallel work |

### Rollback Plan

If any phase causes issues:
1. **Immediate**: Revert to previous Git tag
2. **Short-term**: Fix issue, redeploy
3. **Long-term**: Add regression tests, monitor

---

## Timeline

```
Week 1-2:  Phase 1 (Quick Wins)
Week 3-5:  Phase 2 (Bundle Splitting)
Week 6-9:  Phase 3 (Frame Architecture)
Week 10:   Buffer (testing, fixes)
Week 11:   Final deployment + monitoring
```

**Critical Path**: Phase 2 → Phase 3 (dependent)
**Parallel Work**: Phase 1 can start immediately while Phase 2/3 are designed

---

## Conclusion

This roadmap provides a **systematic, phased approach** to achieving Amazon-level performance (< 1.5s LCP). Each phase builds on the previous, with clear success criteria and rollback plans.

**Next Steps**:
1. BB starts Phase 1 Task 1.1 (Image Optimization)
2. CC reviews Phase 2/3 designs
3. Setup Lighthouse CI baseline

**Questions/Clarifications**: Contact CC

---

**Document Version**: 1.0
**Last Updated**: 2026-01-05
**Next Review**: After Phase 1 completion
