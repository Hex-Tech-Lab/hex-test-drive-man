# 🚨 MERGE BLOCKERS - PR Review Findings

**Generated**: 2026-01-05 19:53 UTC  
**Total Open PRs**: 3  
**Total Findings**: 14 (2 Critical, 6 High, 6 Low)

---

## ⛔ CRITICAL BLOCKERS (MUST FIX BEFORE MERGE)

### PR #28: perf: Phase 1 Quick Wins - 48% FCP improvement

#### 🔴 BLOCKER 1: Server Component with `ssr: false` (CRITICAL)
**File**: `src/app/layout.tsx` (line 14)  
**Severity**: CRITICAL  
**Tool**: CodeRabbit AI  

**Problem**:
```typescript
// ❌ FORBIDDEN in Next.js 15 + React 19 Server Components
const Analytics = dynamic(
  () => import('@vercel/analytics/react').then((mod) => mod.Analytics),
  { ssr: false }  // ← NOT ALLOWED in Server Components
);
```

**Impact**: Build will fail. Next.js 15 + React 19 forbids `ssr: false` in Server Components.

**Fix**: Create separate Client Component wrapper:
```typescript
// src/components/AnalyticsWrapper.tsx
'use client';

import dynamic from 'next/dynamic';

const Analytics = dynamic(
  () => import('@vercel/analytics/react').then((mod) => mod.Analytics),
  { ssr: false }
);

const SpeedInsights = dynamic(
  () => import('@vercel/speed-insights/next').then((mod) => mod.SpeedInsights),
  { ssr: false }
);

export default function AnalyticsWrapper() {
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
```

Then import in layout.tsx:
```typescript
// src/app/layout.tsx (Server Component)
import AnalyticsWrapper from '@/components/AnalyticsWrapper';

// ... rest of layout
```

**Effort**: 10 minutes  
**AI Prompt**: ✅ Available (see above)

---

#### 🟠 BLOCKER 2: Sentry Security & Performance Issues (MAJOR)
**File**: `src/instrumentation-client.js` (line 29)  
**Severity**: MAJOR (Security + Performance)  
**Tool**: CodeRabbit AI  

**Problems**:
1. **Security**: `sendDefaultPii: true` exposes user PII (GDPR/CCPA violation)
2. **Performance**: `tracesSampleRate: 1` sends 100% of transactions (expensive)
3. **Code Quality**: Sentry config duplicated in 2 places
4. **Security**: Hardcoded DSN (should be env var)

**Current Code**:
```javascript
// ❌ MULTIPLE ISSUES
window.requestIdleCallback(() => {
  Sentry.init({
    dsn: "https://7c6f39f3f10468ecd2aa7f55ed565a60@o4510320861839361.ingest.de.sentry.io/4510348150177872",
    tracesSampleRate: 1,      // ❌ 100% = expensive
    sendDefaultPii: true,     // ❌ GDPR/CCPA violation
  });
});

// ... DUPLICATED AGAIN in else block
```

**Fix**:
```javascript
// ✅ FIXED VERSION
const SENTRY_CONFIG = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,  // ✅ Use env var
  tracesSampleRate: 0.1,                     // ✅ 10% sampling
  sendDefaultPii: false,                     // ✅ GDPR compliant
};

if (typeof window !== 'undefined') {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(
      () => {
        Sentry.init(SENTRY_CONFIG);
      },
      { timeout: 5000 }
    );
  } else {
    window.addEventListener('load', () => {
      Sentry.init(SENTRY_CONFIG);
    });
  }
}
```

**Environment Variable** (add to `.env.local`):
```bash
NEXT_PUBLIC_SENTRY_DSN=https://7c6f39f3f10468ecd2aa7f55ed565a60@o4510320861839361.ingest.de.sentry.io/4510348150177872
```

**Effort**: 15 minutes  
**AI Prompt**: ✅ Available (see above)

---

## ⚠️ HIGH PRIORITY (Should Fix Before Merge)

### PR #28: Additional Issues

#### 🟡 Issue 3: Image Cache TTL Too Long
**File**: `next.config.ts`  
**Severity**: HIGH  
**Tool**: Sourcery  

**Problem**: 1-year `minimumCacheTTL` for images may cause stale vehicle imagery.

**Recommendation**: Reduce to 30-90 days for vehicle images that change frequently.

**Effort**: 5 minutes

---

## 📊 Summary by PR

| PR # | Title | Scope | Findings | Critical | High | Medium | Low |
|------|-------|-------|----------|----------|------|--------|-----|
| #28 | perf: Phase 1 Quick Wins - 48% FCP improvement | General | 9 | 2 | 4 | 0 | 3 |
| #27 | fix(ci): disable collect-ai-prompts workflow | General | 3 | 0 | 1 | 0 | 2 |
| #24 | [Snyk] Security upgrade eslint from 8.57.0 to 9.0.0 | Dependency Upgrade | 2 | 0 | 1 | 0 | 1 |

---

## 🔧 Action Plan

### Immediate (Next 30 Minutes)
1. ✅ **PR Scraper Complete** - Reports generated
2. ⏳ **Fix PR #28 Blocker 1** - AnalyticsWrapper Client Component (10 min)
3. ⏳ **Fix PR #28 Blocker 2** - Sentry config (15 min)
4. ⏳ **Verify Build** - `pnpm build` must pass (5 min)

### Before Merge (Next 60 Minutes)
5. ⏳ **Fix Image Cache TTL** - Reduce to 90 days (5 min)
6. ⏳ **Re-run PR Scraper** - Verify 0 critical blockers
7. ⏳ **Merge PR #28** - After all blockers resolved
8. ⏳ **Merge PR #27** - Low risk (CI fix only)
9. ⏳ **Review PR #24** - ESLint upgrade (breaking changes, defer to MVP 1.5)

---

## 🔒 Security Notes

**CRITICAL**: PR #28 currently exposes:
- User PII via Sentry (`sendDefaultPii: true`)
- Hardcoded Sentry DSN in source code

**Action Required**:
1. Fix `sendDefaultPii: false` immediately
2. Move DSN to environment variable
3. Rotate Sentry DSN if already deployed to production

---

## 📈 Tool Performance

| Tool | Findings | Critical | High | Medium | Low |
|------|----------|----------|------|--------|-----|
| CodeRabbit AI | 8 | 2 | 4 | 0 | 2 |
| Sourcery | 3 | 0 | 0 | 0 | 3 |
| Vercel Bot | 3 | 0 | 0 | 0 | 3 |

**Note**: Security findings from Sonar and Corridor were skipped per user directive (handled separately).

---

## 📝 Next Steps

1. **BB**: Fix PR #28 blockers (this session, 30 min)
2. **CC**: Review fixes and approve PR #28
3. **KWSL**: Merge approved PRs to main
4. **Production**: Deploy after all merges complete

---

**Full Reports**:
- JSON: `/tmp/pr_review_complete.json`
- Markdown: `/tmp/pr_action_roster.md`
