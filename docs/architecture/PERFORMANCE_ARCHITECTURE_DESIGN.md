# Performance Architecture Design

**Version**: 1.0
**Date**: 2026-01-05
**Author**: CC (Claude Code)
**Status**: Design Phase
**Target**: LCP < 1.5s (currently 3.84s)

---

## Executive Summary

**Problem**: Home page loads 341 KB JavaScript before first render, causing 3.84s LCP (3.5x slower than Amazon.eg's 1.1s FCP).

**Solution**: Frame-based architecture with component lazy loading, priority-based resource loading, and progressive enhancement.

**Expected Impact**:
- LCP: 3.84s → **1.2-1.5s** (61% improvement)
- FCP: Unknown → **0.8-1.0s** (estimated)
- Bundle size: 341 KB → **80-120 KB initial** (65% reduction)

---

## 1. Architectural Principles

### 1.1 Frame-Based Architecture

**Concept**: Page divided into independent "frames" (layout slots) that can reload without affecting siblings.

**Benefits**:
- Language switch only reloads text frames (not vehicle data)
- Ads/widgets isolated (reload independently)
- Catalog data cached across navigation
- Reduces unnecessary re-renders

**Frame Types**:

```typescript
/**
 * Frame: Independent UI region with own loading state
 */
interface Frame {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  loadStrategy: 'eager' | 'lazy' | 'idle' | 'visible';
  cacheStrategy: 'none' | 'session' | 'persistent';
  reloadTriggers: string[];  // e.g., ['language-change', 'manual']
}

// Example Frame Definitions
const APP_FRAMES: Record<string, Frame> = {
  // Critical - Above fold, blocking LCP
  header: {
    id: 'header',
    priority: 'critical',
    loadStrategy: 'eager',
    cacheStrategy: 'session',
    reloadTriggers: ['language-change'],
  },

  catalog: {
    id: 'catalog',
    priority: 'critical',
    loadStrategy: 'eager',
    cacheStrategy: 'persistent',  // Don't reload on language switch!
    reloadTriggers: ['filter-change', 'manual'],
  },

  // High - Below fold, visible on scroll
  filterPanel: {
    id: 'filterPanel',
    priority: 'high',
    loadStrategy: 'visible',  // Load when scrolled into view
    cacheStrategy: 'session',
    reloadTriggers: ['language-change'],
  },

  // Medium - Secondary features
  compareDrawer: {
    id: 'compareDrawer',
    priority: 'medium',
    loadStrategy: 'idle',  // Load when browser idle
    cacheStrategy: 'session',
    reloadTriggers: ['compare-add', 'language-change'],
  },

  // Low - Deferred content
  footer: {
    id: 'footer',
    priority: 'low',
    loadStrategy: 'idle',
    cacheStrategy: 'persistent',
    reloadTriggers: ['language-change'],
  },

  adBanner: {
    id: 'adBanner',
    priority: 'low',
    loadStrategy: 'visible',
    cacheStrategy: 'none',  // Always fresh
    reloadTriggers: ['page-change', 'language-change', 'manual'],
  },
};
```

### 1.2 Priority-Based Resource Loading

**Inspired by Amazon.eg Pattern**:
1. **VeryHigh**: HTML document, critical CSS (inline or preload)
2. **High**: Above-fold images, critical JS (defer)
3. **Medium**: Below-fold content, non-critical CSS
4. **Low**: Fonts, analytics, third-party widgets

**Implementation**:

```html
<!-- index.html or root layout.tsx -->
<head>
  <!-- VeryHigh: Critical CSS inline (first 14KB) -->
  <style data-href="/critical.css">
    /* Inline critical CSS here */
    .layout { display: flex; }
    .header { height: 60px; }
    /* ... */
  </style>

  <!-- VeryHigh: Preload LCP image -->
  <link rel="preload" as="image" href="/hero.webp" fetchpriority="high" />

  <!-- High: Preload critical JS (deferred) -->
  <link rel="modulepreload" href="/_next/static/chunks/main.js" />

  <!-- Medium: Non-critical CSS (defer load) -->
  <link rel="preload" as="style" href="/styles.css" onload="this.rel='stylesheet'" />

  <!-- Low: Fonts (defer, with font-display: swap) -->
  <link rel="preload" as="font" href="/fonts/inter.woff2" crossorigin />
</head>
```

### 1.3 Component Lazy Loading

**Strategy**: Split components by usage pattern, not arbitrary size.

**Lazy Load Candidates**:

| Component | Current Size | Strategy | Trigger |
|-----------|--------------|----------|---------|
| `FilterPanel` | ~40 KB | Visible | Scroll into view |
| `CompareDrawer` | ~25 KB | Interaction | User clicks Compare |
| `VehicleDetailModal` | ~50 KB | Interaction | Click vehicle card |
| `BookingForm` | ~60 KB | Route | Navigate to /bookings |
| `MUI DatePicker` | ~45 KB | Interaction | Click date field |
| `CartDrawer` | ~30 KB | Interaction | Click cart icon |
| `Footer` | ~15 KB | Idle | Browser idle |

**Implementation**:

```typescript
// ❌ BEFORE: All components loaded upfront
import FilterPanel from '@/components/FilterPanel';
import CompareDrawer from '@/components/CompareDrawer';

// ✅ AFTER: Lazy load with loading state
import dynamic from 'next/dynamic';

const FilterPanel = dynamic(() => import('@/components/FilterPanel'), {
  loading: () => <FilterPanelSkeleton />,
  ssr: false,  // Client-only (uses localStorage)
});

const CompareDrawer = dynamic(() => import('@/components/CompareDrawer'), {
  loading: () => <CompareDrawerSkeleton />,
  ssr: true,  // Server-render skeleton
});

// Defer non-critical components
const Footer = dynamic(() => import('@/components/Footer'), {
  ssr: true,
  loading: () => null,
});
```

---

## 2. Loading Sequence Design

### 2.1 Target Loading Timeline

**Goal**: Achieve FCP < 1.0s, LCP < 1.5s

```
Time    Event                           Bytes    Priority
──────────────────────────────────────────────────────────
0ms     HTML request sent               -        -
200ms   HTML received (gzip)            40 KB    VeryHigh
210ms   Critical CSS parsed (inline)    14 KB    VeryHigh
250ms   Preload hints processed         -        -
400ms   Main JS chunk downloaded        80 KB    High (defer)
650ms   Hero image downloaded           120 KB   High (preload)
800ms   React hydration starts          -        -
900ms   FCP (First Contentful Paint)    -        ✅ Target < 1.0s
1200ms  LCP (Hero image visible)        -        ✅ Target < 1.5s
1500ms  Below-fold components load      200 KB   Medium (lazy)
2000ms  Third-party scripts load        100 KB   Low (defer)
2500ms  Page fully interactive          -        -
```

### 2.2 Critical vs Non-Critical Split

**Critical Path (0-1000ms)**:
- HTML document (40 KB gzipped)
- Inline critical CSS (14 KB)
- Main JS chunk (80 KB gzipped, deferred)
- Hero image (120 KB, preloaded)
- **Total critical: ~254 KB** (vs current 341 KB JS alone)

**Deferred Path (1000-2500ms)**:
- MUI components (lazy loaded when needed)
- Filter panel (visible trigger)
- Compare drawer (interaction trigger)
- Footer (idle trigger)
- Analytics (idle trigger)

---

## 3. Implementation Components

### 3.1 Frame Manager

**Purpose**: Orchestrate frame loading based on priority and triggers.

```typescript
/**
 * FrameManager - Coordinates frame loading and caching
 */
class FrameManager {
  private frames: Map<string, Frame> = new Map();
  private loadedFrames: Set<string> = new Set();

  /**
   * Register frame with loading strategy
   */
  registerFrame(frame: Frame): void {
    this.frames.set(frame.id, frame);

    // Schedule load based on strategy
    switch (frame.loadStrategy) {
      case 'eager':
        this.loadFrame(frame.id);
        break;
      case 'lazy':
        this.scheduleIdleLoad(frame.id);
        break;
      case 'visible':
        this.observeVisibility(frame.id);
        break;
      case 'idle':
        this.scheduleIdleLoad(frame.id, 2000);  // Delay 2s
        break;
    }
  }

  /**
   * Load frame if not already loaded
   */
  async loadFrame(frameId: string): Promise<void> {
    if (this.loadedFrames.has(frameId)) {
      return;  // Already loaded
    }

    const frame = this.frames.get(frameId);
    if (!frame) {
      throw new Error(`Frame ${frameId} not registered`);
    }

    // Check cache before loading
    const cached = this.checkCache(frame);
    if (cached) {
      this.loadedFrames.add(frameId);
      return cached;
    }

    // Load frame component
    const component = await import(`@/frames/${frameId}`);
    this.loadedFrames.add(frameId);

    // Cache if strategy allows
    if (frame.cacheStrategy !== 'none') {
      this.cacheFrame(frame, component);
    }
  }

  /**
   * Reload frame on trigger
   */
  reloadFrame(frameId: string, trigger: string): void {
    const frame = this.frames.get(frameId);
    if (!frame) return;

    // Check if trigger should cause reload
    if (frame.reloadTriggers.includes(trigger)) {
      this.loadedFrames.delete(frameId);  // Clear loaded state
      this.loadFrame(frameId);  // Reload
    }
  }

  /**
   * Handle language change event
   */
  onLanguageChange(): void {
    // Reload only frames that need language update
    this.frames.forEach((frame, id) => {
      if (frame.reloadTriggers.includes('language-change')) {
        this.reloadFrame(id, 'language-change');
      }
    });

    // Catalog frame NOT reloaded (cacheStrategy: persistent)
  }

  private scheduleIdleLoad(frameId: string, delay = 0): void {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        setTimeout(() => this.loadFrame(frameId), delay);
      });
    } else {
      setTimeout(() => this.loadFrame(frameId), delay + 1000);
    }
  }

  private observeVisibility(frameId: string): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.loadFrame(frameId);
          observer.disconnect();
        }
      });
    });

    const element = document.getElementById(`frame-${frameId}`);
    if (element) {
      observer.observe(element);
    }
  }

  private checkCache(frame: Frame): any | null {
    if (frame.cacheStrategy === 'none') return null;

    const storage = frame.cacheStrategy === 'session' ? sessionStorage : localStorage;
    const cached = storage.getItem(`frame-${frame.id}`);

    return cached ? JSON.parse(cached) : null;
  }

  private cacheFrame(frame: Frame, data: any): void {
    const storage = frame.cacheStrategy === 'session' ? sessionStorage : localStorage;
    storage.setItem(`frame-${frame.id}`, JSON.stringify(data));
  }
}

// Global instance
export const frameManager = new FrameManager();
```

### 3.2 Resource Priority Loader

**Purpose**: Control resource loading priority (CSS, images, fonts).

```typescript
/**
 * ResourcePriorityLoader - Manages resource loading priorities
 */
class ResourcePriorityLoader {
  /**
   * Preload critical resources
   */
  preloadCritical(): void {
    // Preload hero image (LCP candidate)
    this.preloadImage('/images/hero.webp', 'high');

    // Preload critical fonts
    this.preloadFont('/fonts/inter-var.woff2');

    // Preconnect to external domains
    this.preconnect('https://lbttmhwckcrfdymwyuhn.supabase.co');
  }

  /**
   * Lazy load images with IntersectionObserver
   */
  lazyLoadImages(): void {
    const images = document.querySelectorAll('img[data-src]');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src!;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      });
    });

    images.forEach((img) => observer.observe(img));
  }

  /**
   * Defer non-critical CSS
   */
  deferCSS(href: string): void {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.media = 'print';  // Load as print stylesheet (low priority)
    link.onload = () => {
      link.media = 'all';  // Switch to all media after load
    };
    document.head.appendChild(link);
  }

  private preloadImage(src: string, priority: 'high' | 'low' = 'high'): void {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    link.setAttribute('fetchpriority', priority);
    document.head.appendChild(link);
  }

  private preloadFont(href: string): void {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.href = href;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }

  private preconnect(domain: string): void {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    document.head.appendChild(link);
  }
}

export const resourceLoader = new ResourcePriorityLoader();
```

### 3.3 Next.js Configuration

**File**: `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize bundle splitting
  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material'],
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365,  // 1 year
  },

  // Webpack optimizations
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Split vendor chunks
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          // MUI separate chunk (lazy load)
          mui: {
            test: /[\\/]node_modules[\\/]@mui[\\/]/,
            name: 'mui',
            priority: 10,
          },
          // React/Next.js core (critical)
          framework: {
            test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
            name: 'framework',
            priority: 20,
          },
          // Supabase (defer)
          supabase: {
            test: /[\\/]node_modules[\\/]@supabase[\\/]/,
            name: 'supabase',
            priority: 15,
          },
          // Everything else
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

module.exports = nextConfig;
```

---

## 4. Success Metrics

### 4.1 Target Metrics (3 Months Post-Implementation)

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| **LCP** | 3.84s | < 1.5s | Lighthouse / RUM |
| **FCP** | Unknown | < 1.0s | Lighthouse / RUM |
| **TTI** | Unknown | < 2.5s | Lighthouse |
| **CLS** | Unknown | < 0.1 | Lighthouse / RUM |
| **FID** | Unknown | < 100ms | RUM |
| **Initial JS** | 341 KB | < 120 KB | Bundle analyzer |
| **LCP Element** | Unknown | Hero image | DevTools trace |

### 4.2 Monitoring Strategy

**Tools**:
1. **Lighthouse CI** (automated on every PR)
2. **Real User Monitoring (RUM)** via Sentry Performance
3. **Next.js Analytics** (Web Vitals reporting)
4. **Bundle Analyzer** (track bundle size trends)

**Alerts**:
- LCP > 1.8s for 3 consecutive days → Investigate
- Bundle size increase > 10% → Block PR
- FCP regression > 200ms → High priority

---

## 5. Migration Path

**See**: `OPTIMIZATION_ROADMAP.md` for phased implementation plan.

**Summary**:
- **Phase 1**: Low-hanging fruit (2 weeks) - Lazy loading, image optimization
- **Phase 2**: Bundle splitting (3 weeks) - Webpack config, code splitting
- **Phase 3**: Frame architecture (4 weeks) - FrameManager, cache strategies

**Total Duration**: 9-11 weeks (with 1 week buffer for testing/fixes)

---

## 6. References

- Amazon.eg performance trace: `docs/analysis/amazon-eg-performance.json`
- Current bundle analysis: Build output (341 KB First Load JS)
- Web Vitals documentation: https://web.dev/vitals/
- Next.js optimization guide: https://nextjs.org/docs/app/building-your-application/optimizing

**Last Updated**: 2026-01-05 16:00 EET
**Next Review**: After Phase 1 completion (target: 2026-01-20)
