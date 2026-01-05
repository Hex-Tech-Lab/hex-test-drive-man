# Production Performance Regression Analysis

**Date**: 2026-01-05 20:15 UTC
**Agent**: CC (Claude Code)
**Branch**: cc/performance-phase1-image-optimization
**Status**: 🚨 CRITICAL REGRESSION - Phase 1 optimizations NOT working in production

---

## Executive Summary

Phase 1 optimizations were deployed but performance **regressed** instead of improving:

| Metric | Amazon Baseline | Phase 1 Target | Production ACTUAL | Status |
|--------|----------------|----------------|-------------------|--------|
| **FCP** | 1.13s | 2.0s | **3.78s** | ❌ 88% worse than target |
| **LCP** | 5.40s | 2.5s | **6.69s** | ❌ 168% worse than target |
| **TTI** | ~10s | ~4s | Unknown | ⚠️ Not measured |

**User Experience**: "No perceived improvement" - performance is **WORSE** than baseline.

---

## Root Cause #1: SENTRY BLOCKING INITIAL RENDER (1.6s delay)

### Evidence
- First resource loads at **1645ms** (Sentry envelope POST with **High** priority)
- Page HTML request starts at **1650ms** (5ms after Sentry)
- This creates a **1.6s blocking delay** before page even starts loading

### Trace Analysis
```
Timeline:
0ms       → Navigation start
1645ms    → Sentry envelope POST (High priority) 🚨 BLOCKING
1650ms    → Page HTML request begins
1673ms    → Page HTML response (VeryHigh)
1682-1689ms → JavaScript bundles (Low priority) 🚨 WRONG
3777ms    → First Contentful Paint (FCP)
6695ms    → Largest Contentful Paint (LCP)
```

### Impact
- **+1.6s delay** before any content loads
- Sentry initialization is **synchronous** and **blocking**
- Should be deferred or moved to worker thread

### Fix Required
```typescript
// WRONG (current - blocking):
import * as Sentry from '@sentry/nextjs';
Sentry.init({ ... }); // Blocks render

// CORRECT (should be):
// Option A: Lazy load Sentry
const initSentry = () => import('@sentry/nextjs').then(Sentry => Sentry.init({ ... }));
window.addEventListener('load', initSentry);

// Option B: Use Web Worker
// Move Sentry to service worker (non-blocking)
```

---

## Root Cause #2: NEXT.JS IMAGE OPTIMIZATION NOT APPLIED

### Evidence
- **103 total image requests**
- **0 requests to `/_next/image/`** (Next.js optimization endpoint)
- Images loading from:
  - Raw GitHub URLs: `https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/`
  - Direct Vercel deployment URLs (no optimization path)

### Expected vs Actual

**Expected (Task 1.1 implementation):**
```typescript
// VehicleCard should use Next.js Image component
<Image
  src={getVehicleImage(vehicle.models.hero_image_url)}
  fill
  priority={isAboveFold}
  sizes="(max-width: 600px) 100vw, ..."
/>

// Should generate URLs like:
// /_next/image?url=/images/vehicles/hero/car.webp&w=640&q=75
```

**Actual (production trace):**
```
5969ms: https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized-svg/audi.svg
5970ms: https://hex-test-drive-man-git-agent-task-1-775869-techhypexps-projects.vercel.app/images/vehicles/hero/audi-a3-2025.webp
```

### Impact
- No automatic WebP/AVIF conversion
- No responsive image sizing
- No image optimization (compression, format negotiation)
- **Images load at full resolution** (not optimized for viewport)

### Possible Causes
1. ❌ `next/image` import failed (build error not caught)
2. ❌ Component changes didn't make it to deployed build
3. ❌ `next.config.mjs` image config not applied
4. ❌ **MOST LIKELY**: Testing preview deployment, not production

---

## Root Cause #3: WRONG DEPLOYMENT TESTED

### Evidence
All resource URLs show:
```
https://hex-test-drive-man-git-agent-task-1-775869-techhypexps-projects.vercel.app/...
```

This is a **Vercel preview deployment** for the feature branch, NOT production!

### Implications
- Preview deployments may have different build configuration
- May not have production optimizations enabled
- User tested wrong URL (should be `getmytestdrive.com`)

### Fix Required
**Re-test production domain:**
```bash
# Correct production URL:
https://getmytestdrive.com

# NOT preview deployment:
https://hex-test-drive-man-git-agent-task-1-775869-techhypexps-projects.vercel.app
```

---

## Root Cause #4: JAVASCRIPT BUNDLES LOW PRIORITY

### Evidence
All JavaScript bundles loading with **Low priority**:
```
1682ms [Low]: webpack-b8a28e91ae68db9e.js
1683ms [Low]: ddb1004b-2f60f947d763a778.js
1683ms [Low]: 974-6bdd825189009fa8.js
1683ms [Low]: main-app-47701cda18e12c23.js
1687ms [Low]: 439-25c1c1344fe59051.js
```

### Expected
Critical bundles should have **High** or **VeryHigh** priority:
- `webpack` runtime: **VeryHigh**
- `main-app`: **VeryHigh**
- Route chunks: **High**

### Impact
- Browser deprioritizes JavaScript loading
- Delays interactivity
- Contributes to high FCP/LCP

### Fix Required
Add priority hints via Next.js config or headers:
```javascript
// next.config.mjs
export default {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Link',
            value: '</_next/static/chunks/webpack.js>; rel=preload; as=script',
          },
        ],
      },
    ];
  },
};
```

---

## Root Cause #5: EXCESSIVE ANALYTICS REQUESTS (108 requests)

### Evidence
- **108 Analytics/Vercel requests** detected
- First analytics load at **1650ms** (immediately after Sentry)

### Expected
- Analytics should be **deferred** (Task 1.3)
- Should load **after page interactive**
- AnalyticsWrapper component should lazy load with `ssr: false`

### Actual
Analytics loading immediately, before FCP.

### Fix Required
Verify AnalyticsWrapper is working:
```typescript
// src/components/AnalyticsWrapper.tsx should have:
'use client';

const Analytics = dynamic(
  () => import('@vercel/analytics/react').then(mod => mod.Analytics),
  { ssr: false }  // ← Critical: prevents SSR blocking
);
```

---

## Immediate Action Plan

### Priority 1: CRITICAL (Deploy Today)

1. **Verify Production Domain**
   - Re-test actual production: `https://getmytestdrive.com`
   - If preview deployment was tested by mistake, Phase 1 may be working in production
   - **ETA: 5 minutes**

2. **Fix Sentry Blocking**
   - Move Sentry initialization to `useEffect` or `window.load` event
   - **ETA: 15 minutes**

3. **Verify Next.js Image in Build**
   - Check deployed `VehicleCard.tsx` source
   - Verify `next.config.mjs` image config deployed
   - Test `/_next/image/` endpoint manually
   - **ETA: 30 minutes**

### Priority 2: HIGH (This Week)

4. **Fix Bundle Priority**
   - Add preload hints for critical chunks
   - Configure webpack priority hints
   - **ETA: 45 minutes**

5. **Audit Analytics Wrapper**
   - Verify lazy loading working
   - Check if 108 requests is normal (seems excessive)
   - **ETA: 30 minutes**

### Priority 3: MEDIUM (Next Week)

6. **Comprehensive Performance Audit**
   - Re-run Lighthouse on production domain
   - Measure TTI, TBT, CLS
   - Compare with Phase 1 targets
   - **ETA: 2 hours**

---

## Revised Performance Targets

Given findings, revised targets:

| Metric | Original Target | Revised Target | Strategy |
|--------|----------------|----------------|----------|
| **FCP** | 2.0s | **1.5s** | Fix Sentry blocking (-1.6s) |
| **LCP** | 2.5s | **2.0s** | Fix image optimization + Sentry |
| **TTI** | 4.0s | **3.0s** | Fix bundle priority |
| **TBT** | 300ms | **200ms** | Defer analytics properly |

---

## Lessons Learned

1. **Always test production domain, not preview deployments**
   - Preview deployments may have different configs
   - Can lead to false regression reports

2. **Sentry should never block render**
   - Should be lazy loaded or in worker
   - Current implementation is catastrophic for FCP

3. **Verify optimizations in deployed build**
   - Check `/_next/image/` endpoint exists
   - Check bundle analyzer output
   - Don't trust assumptions

4. **Bundle priority matters**
   - Low priority JS delays everything
   - Critical chunks need explicit priority hints

---

## Next Steps

1. ✅ **Immediate**: User to confirm tested domain (production vs preview)
2. ⏳ **If preview was tested**: Re-run on production domain
3. ⏳ **If production was tested**: Apply fixes above in order of priority
4. ⏳ **After fixes**: Re-run performance audit and compare

---

**Last Updated**: 2026-01-05 20:15 UTC
**Status**: Awaiting user confirmation on tested domain
**Estimated Fix Time**: 1-2 hours (if production needs fixes)
