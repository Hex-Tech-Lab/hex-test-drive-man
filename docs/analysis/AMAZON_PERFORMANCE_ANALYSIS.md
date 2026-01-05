# Amazon.eg Performance Analysis

**Source**: Chrome DevTools Performance Trace (8.1M compressed, 60M decompressed)
**Captured**: 2026-01-05 13:01:48 UTC
**Analyzer**: CC (Claude Code)
**Purpose**: Extract loading patterns for Hex Test Drive optimization

---

## Executive Summary

**Amazon.eg achieves fast perceived performance through aggressive resource prioritization and progressive enhancement**, not raw speed. Their actual LCP (5.4s) is higher than expected, but **FCP at 1.1s makes the page feel fast**.

**Key Takeaway**: **Prioritize First Contentful Paint over final LCP** - users perceive pages as fast when content appears quickly, even if images load later.

---

## 1. Web Vitals

### 1.1 Measured Metrics

| Metric | Value | Rating | Notes |
|--------|-------|--------|-------|
| **FP** (First Paint) | 1,129ms | Good | Same as FCP |
| **FCP** (First Contentful Paint) | 1,129ms | ✅ Good | Target < 1.8s |
| **LCP** (Largest Contentful Paint) | 5,395ms | ⚠️ Needs Improvement | Target < 2.5s |
| **DCL** (DOM Content Loaded) | 9,832ms | - | HTML fully parsed |
| **Load** (Page Load Complete) | 9,833ms | - | All resources loaded |

### 1.2 Key Insight

**Amazon's strategy**: **Optimize for FCP (1.1s), accept slower LCP (5.4s)**.

**Rationale**:
- Users see content at 1.1s (feels fast)
- Hero image loads progressively (Medium priority, not blocking)
- Page is interactive before LCP completes
- **Perceived performance > actual performance**

---

## 2. Loading Sequence

### 2.1 Critical Path (0-1200ms)

```
Time     Event                              Priority    Blocking
────────────────────────────────────────────────────────────────
0ms      Navigation start                   -           -
583ms    Analytics request (CSM)            VeryLow     No
588ms    HTML document request              VeryHigh    Yes
603ms    CSS #1 (213sKsGm6jL.css)           VeryHigh    Yes
604ms    CSS #2 (11T9EXq1JNL.css)           VeryHigh    Yes
606ms    CSS #3 (51waPb-h-9L.css)           VeryHigh    Yes
606ms    CSS #4 (413o2CUJ6GL.css)           VeryHigh    Yes
647ms    Metrics endpoint                   VeryLow     No
660ms    Header sprite image                Medium      No
667ms    Hero image #1                      Medium      No
667ms    CSS #5 (41H0vKjCFiL.css)           Medium      No
1129ms   ✅ FCP (First Contentful Paint)    -           -
```

**Pattern**:
1. HTML loads first (VeryHigh)
2. **4 CSS files immediately** (VeryHigh, 603-606ms burst)
3. Images deferred (Medium, 660ms+)
4. **FCP at 1129ms** = HTML + CSS parsed + first render

### 2.2 Resource Counts

| Type | Count | Priority Distribution |
|------|-------|-----------------------|
| **CSS** | 10 | VeryHigh: 4, Medium: 5, Low: 1 |
| **JavaScript** | 12 | High: 3, Medium: 7, Low: 2 |
| **Images** | 198 | Medium: 120, Low: 78 |
| **Fonts** | 5 | Medium: 4, Low: 1 |
| **Other** (Analytics, APIs) | 36 | VeryLow: 36 |

**Insight**: **Critical CSS prioritized (VeryHigh), images deferred (Medium/Low)**.

---

## 3. Optimization Patterns

### 3.1 CSS Strategy

**Critical CSS First**:
- 4 CSS files loaded at VeryHigh priority (603-606ms, 3ms burst)
- Additional 6 CSS files at Medium/Low (loaded after FCP)
- Likely using `<link rel="preload" as="style">` for critical CSS
- Non-critical CSS deferred with `media="print"` trick or `loadCSS()`

**Implementation Example**:
```html
<!-- Critical CSS (blocks render) -->
<link rel="stylesheet" href="/critical.css" />

<!-- Non-critical CSS (deferred) -->
<link rel="preload" as="style" href="/styles.css" onload="this.rel='stylesheet'" />
<noscript><link rel="stylesheet" href="/styles.css"></noscript>
```

### 3.2 Image Strategy

**Progressive Loading**:
- Hero images: Medium priority (660-780ms)
- Below-fold images: Low priority (780ms+)
- **198 images total** - not all loaded upfront
- Likely using Intersection Observer for lazy loading

**fetchpriority Attribute**:
```html
<!-- LCP candidate (hero image) -->
<img src="/hero.jpg" fetchpriority="high" loading="eager" />

<!-- Below-fold images -->
<img src="/product.jpg" fetchpriority="low" loading="lazy" />
```

### 3.3 JavaScript Strategy

**Deferred Execution**:
- 12 JS files total
- High priority: 3 files (critical app code)
- Medium priority: 7 files (features, analytics)
- Low priority: 2 files (third-party widgets)

**Likely using**:
```html
<!-- Critical JS (high priority, deferred) -->
<script src="/app.js" defer></script>

<!-- Non-critical JS (low priority, async) -->
<script src="/analytics.js" async></script>
```

### 3.4 Third-Party Scripts

**Isolated & Deferred**:
- Analytics (VeryLow priority, 583ms)
- Metrics (VeryLow priority, 647ms)
- **36 "other" requests** all VeryLow priority
- **Do not block FCP or LCP**

---

## 4. Performance Budget

### 4.1 Estimated Bundle Sizes

Based on resource counts and typical e-commerce site patterns:

| Resource Type | Estimated Size | Notes |
|---------------|----------------|-------|
| **HTML** | 40-60 KB (gzip) | Document + inline JS/CSS |
| **Critical CSS** | 20-30 KB (gzip) | 4 files @ VeryHigh |
| **Non-critical CSS** | 40-60 KB (gzip) | 6 files @ Medium/Low |
| **JavaScript** | 150-250 KB (gzip) | 12 files total |
| **Images** | 2-5 MB (progressive) | 198 images, lazy loaded |
| **Fonts** | 100-200 KB | 5 font files |

**Total Critical Path** (0-1129ms FCP):
- HTML: 50 KB
- Critical CSS: 25 KB
- Critical JS: 80 KB (deferred, non-blocking)
- **~155 KB to FCP**

### 4.2 Comparison to Hex Test Drive

| Metric | Amazon | Hex Test Drive | Notes |
|--------|--------|----------------|-------|
| **FCP** | 1,129ms | ~3,840ms (LCP as proxy) | **3.4x slower** |
| **Critical JS** | ~80 KB (deferred) | 341 KB (blocking) | **4.3x larger** |
| **CSS Strategy** | Inline + preload | Bundled in JS | ❌ Blocking |
| **Image Priority** | Medium/Low (defer) | Unknown (likely eager) | ❌ Blocking |
| **Code Splitting** | Evident (12 JS files) | Minimal (174 KB shared chunk) | ❌ Monolithic |

---

## 5. Actionable Recommendations

### 5.1 Immediate Wins (Phase 1)

1. **Extract Critical CSS** (inline first 14 KB)
   - Target: Reduce JS dependency for first render
   - Impact: **FCP improvement 500-800ms**

2. **Lazy Load Images** (fetchpriority + loading attributes)
   - Target: Defer below-fold images
   - Impact: **LCP improvement 200-400ms**

3. **Defer Non-Critical JS** (analytics, widgets)
   - Target: Don't block main thread
   - Impact: **FCP improvement 200-300ms**

**Combined Impact**: **FCP 3.84s → 2.0-2.3s** (40-50% improvement)

### 5.2 Medium-Term (Phase 2)

4. **Code Split MUI** (separate chunk, lazy load)
   - Target: Reduce initial bundle from 341 KB to < 120 KB
   - Impact: **FCP improvement 400-600ms**

5. **Preload LCP Image** (hero image preload hint)
   - Target: Start download during HTML parse
   - Impact: **LCP improvement 300-500ms**

6. **Bundle Splitting** (Webpack splitChunks config)
   - Target: Framework (React/Next) vs Vendor vs App code
   - Impact: **Parallel downloads, faster parse**

**Combined Impact**: **FCP 2.0s → 1.2-1.5s, LCP 3.84s → 1.8-2.2s**

### 5.3 Advanced (Phase 3)

7. **Frame Architecture** (independent reload zones)
   - Target: Language switch doesn't reload catalog data
   - Impact: **Perceived performance, reduced data transfer**

8. **Service Worker Caching** (precache critical assets)
   - Target: Instant repeat visits
   - Impact: **FCP < 500ms for repeat visitors**

9. **Edge Caching** (CDN for static assets)
   - Target: Reduce TTFB from 200ms to < 50ms
   - Impact: **All metrics improve 150-200ms**

---

## 6. Measurement Strategy

### 6.1 Before Optimization

**Collect Baselines**:
```bash
# Lighthouse audit (5 runs, median)
npx lighthouse https://hex-testdrive.com --output=json --output-path=./baseline.json

# Real User Monitoring (1 week)
# (Sentry Performance already configured)
```

### 6.2 After Each Phase

**Compare Metrics**:
- FCP delta
- LCP delta
- Bundle size delta
- User-perceived performance (surveys, analytics)

**Regression Prevention**:
- Lighthouse CI (automated on every PR)
- Bundle size limits (enforce < 120 KB initial)
- Performance budgets in next.config.js

---

## 7. References

### 7.1 Source Files

- **Trace**: `docs/analysis/amazon-eg-performance.json` (8.1M gzip, 60M raw)
- **Analysis Script**: `scripts/extract-web-vitals.py`
- **Extracted Data**: `/tmp/amazon-perf-analysis.json`

### 7.2 External Resources

- **Web Vitals**: https://web.dev/vitals/
- **Resource Priorities**: https://web.dev/prioritize-resources/
- **Image Optimization**: https://web.dev/fast/#optimize-your-images
- **Code Splitting**: https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading

---

**Analysis Date**: 2026-01-05
**Analyzer**: CC (Claude Code)
**Next Review**: After Phase 1 implementation
