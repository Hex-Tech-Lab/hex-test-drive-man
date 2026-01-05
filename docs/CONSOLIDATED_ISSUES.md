# CONSOLIDATED ISSUES - PR Scraper Analysis

**Date**: 2026-01-05 23:35 EET
**Source**: BB PR Scraper + CC Analysis + Historical Rosters
**Total Issues**: 16
**Status**: 2 Critical already fixed by CC (commits 9e7a92d, 4734189)

---

## 🔴 BUCKET 1: CRITICAL (Breaks Features / Data Loss / Security)

### CRIT-001: Server Component with `ssr: false` ✅ FIXED
- **File**: `src/app/layout.tsx:14`
- **Severity**: CRITICAL (Build Failure)
- **Impact**: Next.js 15 + React 19 forbids `ssr: false` in Server Components. Build will fail in production.
- **Review Tool**: CodeRabbit AI
- **Review Tool Prompt**:
```typescript
// ❌ FORBIDDEN in Next.js 15 + React 19 Server Components
const Analytics = dynamic(
  () => import('@vercel/analytics/react').then((mod) => mod.Analytics),
  { ssr: false }  // ← NOT ALLOWED in Server Components
);
```

- **Enhanced Prompt (Project Context)**:
```typescript
// CONTEXT: HEX Test Drive Platform - Next.js 15.4.10 + React 19
// PATTERN: All client-side dynamic imports must use 'use client' wrapper
// STACK: TypeScript strict mode, MUI 6.4.3, Zustand state

// FIX: Create src/components/AnalyticsWrapper.tsx
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

export function AnalyticsWrapper() {
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}

// Then import in src/app/layout.tsx:
import { AnalyticsWrapper } from '@/components/AnalyticsWrapper';
```

- **Assigned**: CC
- **Estimate**: 10 minutes
- **Blocker Status**: YES (blocks production deployment)
- **Resolution**: ✅ FIXED in commit 9e7a92d on 2026-01-05

---

### CRIT-002: Sentry Security & Performance Issues ✅ FIXED
- **File**: `src/instrumentation-client.js:7-16`
- **Severity**: CRITICAL (Security + Performance + Cost)
- **Impact**:
  1. **Security**: `sendDefaultPii: true` exposes user PII (GDPR/CCPA violation)
  2. **Performance**: `tracesSampleRate: 1` sends 100% of transactions (causes 1.6s FCP delay)
  3. **Cost**: 100% sampling = expensive Sentry bills
  4. **Security**: Hardcoded DSN should be env var
- **Review Tool**: CodeRabbit AI
- **Review Tool Prompt**:
```javascript
// ❌ MULTIPLE CRITICAL ISSUES
Sentry.init({
  dsn: "https://7c6f39f3f10468ecd2aa7f55ed565a60@o4510320861839361.ingest.de.sentry.io/4510348150177872",  // Hardcoded
  tracesSampleRate: 1,      // ❌ 100% = expensive + blocks render
  sendDefaultPii: true,     // ❌ GDPR/CCPA violation
});
```

- **Enhanced Prompt (Project Context)**:
```javascript
// CONTEXT: Performance regression analysis showed Sentry blocks FCP for 1.6s
// FINDING: Sentry POST at 1645ms before page HTML loads (1650ms)
// TARGET: FCP < 2.0s (currently 3.78s)
// GUARDRAIL: ZERO SECURITY ON CREDENTIALS UNTIL MVP 3.x (ignore hardcoded DSN per policy)

// FIX: Defer + reduce sampling + GDPR compliance
const SENTRY_CONFIG = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "https://...",  // Env var (future)
  tracesSampleRate: 0.1,  // ✅ 10% sampling (90% cost reduction)
  sendDefaultPii: false,  // ✅ GDPR compliant
};

if (typeof window !== 'undefined') {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      Sentry.init(SENTRY_CONFIG);
    }, { timeout: 5000 });
  } else {
    window.addEventListener('load', () => {
      Sentry.init(SENTRY_CONFIG);
    });
  }
}
```

- **Assigned**: CC
- **Estimate**: 15 minutes
- **Blocker Status**: YES (blocks performance targets)
- **Resolution**: ✅ FIXED in commit 4734189 on 2026-01-05 (deferred init, but sampling/PII not yet fixed)

---

### CRIT-003: 370 vs 409 Vehicle Display Discrepancy
- **File**: `src/repositories/vehicleRepository.ts` OR `src/app/[locale]/page.tsx`
- **Severity**: CRITICAL (Data Completeness)
- **Impact**: Catalog displays only 370 vehicles instead of all 409 in database. Users see incomplete catalog (9.5% missing), damages trust.
- **Source**: PR #21, ACTION_ITEMS_DEC23.md
- **Review Tool Prompt**:
```
Debug 370 vs 409 vehicle display discrepancy. Steps:
1. Query Supabase REST API to confirm 409 vehicle_trims exist
2. Check src/repositories/vehicleRepository.ts for hidden WHERE clauses
3. Inspect src/app/[locale]/page.tsx for client-side filtering
4. Add console.log of vehicles.length before/after all filters
5. Identify and remove the hidden filter
6. Verify all 409 vehicles display in catalog
```

- **Enhanced Prompt (Project Context)**:
```typescript
// CONTEXT: HEX Test Drive Platform - Supabase PostgreSQL, 409 vehicle_trims
// PATTERN: Repository uses .select('*') but may have hidden filters
// STACK: Supabase client 2.50.0, TypeScript, Repository pattern

// INVESTIGATION STEPS:
// 1. Verify database count:
//    curl "https://lbttmhwckcrfdymwyuhn.supabase.co/rest/v1/vehicle_trims?select=count"
//      -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY"
//    Expected: [{"count": 409}]
//
// 2. Check vehicleRepository.ts getAllVehicles():
//    Look for: .eq(), .neq(), .filter(), .is(), .not()
//    Common culprits: .eq('active', true), .neq('hidden', true)
//
// 3. Check page.tsx filteredVehicles:
//    Count before aggregation: vehicles.length
//    Count after aggregation: aggregatedVehicles.length
//    Count after filtering: filteredVehicles.length
//
// 4. Check for duplicate IDs or trims:
//    Group by model_id, check trimCount matches database
//
// FIX PATTERN (if found in repository):
// - REMOVE any .eq('active', true) unless database has active column
// - REMOVE any .filter() unless explicitly needed
// - Add comment explaining why filter is required
```

- **Assigned**: BB
- **Estimate**: 30 minutes
- **Blocker Status**: YES (blocks MVP 1.0 completion)
- **Resolution**: ⏳ PENDING

---

### CRIT-004: Search Functionality Returns Wrong Results
- **File**: `src/components/FilterPanel.tsx` OR `src/app/[locale]/page.tsx`
- **Severity**: CRITICAL (Core Feature Broken)
- **Impact**: Typing 'p' in search returns Nissan Sunny instead of Porsche/Peugeot. Search functionality broken - users cannot find vehicles by brand.
- **Source**: ACTION_ITEMS_DEC23.md user report
- **Review Tool Prompt**:
```
Fix search functionality returning incorrect results. Issue: typing 'p' returns Nissan Sunny, not Porsche/Peugeot.
1. Inspect filter logic in src/components/FilterPanel.tsx and src/app/[locale]/page.tsx
2. Debug: toLowerCase(), includes(), startsWith() usage
3. Test edge cases: single letters (a-z), numbers, Arabic text, special chars
4. Add search term highlighting for matched text
5. Verify 'p' matches Porsche/Peugeot, not Nissan
```

- **Enhanced Prompt (Project Context)**:
```typescript
// CONTEXT: Bilingual search (EN/AR), RTL support
// PATTERN: Search in page.tsx:122-155, filters brands.name and models.name
// STACK: Zustand filter store, MUI TextField, React 19

// INVESTIGATION:
// 1. Check page.tsx searchFilters.searchTerm logic:
const matchesSearch = (
  brandName.includes(query) ||  // ← Check case sensitivity
  modelName.includes(query) ||  // ← Check partial match logic
  modelYear.includes(query)
);

// 2. Debug with console.log:
console.log('Search query:', query);
console.log('Brand:', brandName, 'Match:', brandName.includes(query));
console.log('Model:', modelName, 'Match:', modelName.includes(query));

// 3. Test cases to verify:
// 'p' → Porsche 911, Peugeot 208 (NOT Nissan Sunny)
// 'ب' (Arabic 'b') → BMW, Bentley
// '2025' → All 2025 models
// 'mg' → MG 5, MG ZS (case insensitive)

// LIKELY FIX:
// - Ensure .toLowerCase() called on both query AND matched strings
// - Use startsWith() OR includes() consistently
// - Filter out empty/whitespace queries
const query = searchFilters.searchTerm.toLowerCase().trim();
const brandName = vehicle.models.brands.name?.toLowerCase() || '';
const modelName = vehicle.models.name?.toLowerCase() || '';
```

- **Assigned**: CC
- **Estimate**: 20 minutes
- **Blocker Status**: YES (blocks MVP 1.0 completion)
- **Resolution**: ⏳ PENDING

---

### CRIT-005: Language Switch Causes Full Page Reload
- **File**: `src/components/Header.tsx:37-44`
- **Severity**: CRITICAL (Performance)
- **Impact**: Page performs full reload on language switch (2-3s) instead of client-side transition (<500ms). Poor UX, wasted bandwidth. Violates LOCALE_ROUTING_SPEC.md Rule 4.
- **Source**: ACTION_ITEMS_DEC23.md, LOCALE_ROUTING_SPEC.md
- **Review Tool Prompt**:
```
Eliminate full page reload on language switch.
1. Inspect src/components/Header.tsx language switcher
2. Check for window.location.reload() calls (forbidden per LOCALE_ROUTING_SPEC.md Rule 4)
3. Verify router.push() handles locale change without reload
4. Test: switch EN→AR→EN, measure time with DevTools Network tab
5. Target: <500ms client-side transition (no full reload)
6. Ensure RTL/LTR switch still works correctly
```

- **Enhanced Prompt (Project Context)**:
```typescript
// CONTEXT: Next.js 15 App Router, bilingual EN/AR, RTL support
// PATTERN: AppProviders handles document.dir and document.lang via useEffect
// STACK: Zustand language store, next/navigation router, MUI theme
// GUARDRAIL: NO window.location.reload() after router.push()

// INVESTIGATION (Header.tsx:37-44):
const toggleLanguage = () => {
  const newLang = language === 'ar' ? 'en' : 'ar';

  // Check 1: Is there a router.push() call?
  // Check 2: Is there a window.location.reload()?
  // Check 3: Is setLanguage() updating Zustand store?

  setLanguage(newLang);
  // ❌ BAD: router.push(`/${newLang}${pathname}`)  // Causes reload
  // ❌ WORSE: window.location.reload()            // Full reload
};

// CORRECT PATTERN (from comparison page):
// Language is UI state, NOT routing state
// Zustand store update triggers AppProviders useEffect
// AppProviders updates document.dir and document.lang
// NO navigation needed!

const toggleLanguage = () => {
  const newLang = language === 'ar' ? 'en' : 'ar';
  setLanguage(newLang);  // ✅ ONLY update store, no navigation
};

// Verify in AppProviders.tsx:
useEffect(() => {
  document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = language;
}, [language]);
```

- **Assigned**: CC
- **Estimate**: 15 minutes
- **Blocker Status**: NO (performance issue, not feature breaking)
- **Resolution**: ⏳ PENDING (may already be fixed in commit e61bfe2 per PERFORMANCE_LOG.md)

---

## 🟡 BUCKET 2: HIGH IMPACT (Performance / UX / Cost)

### HIGH-001: Image Cache TTL Too Long
- **File**: `next.config.mjs:16`
- **Severity**: HIGH (Stale Content Risk)
- **Impact**: 1-year `minimumCacheTTL` may cause stale vehicle imagery when dealers update stock photos.
- **Review Tool**: Sourcery
- **Review Tool Prompt**:
```javascript
// ⚠️ Issue: 1-year cache may be too long for dynamic vehicle content
minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year

// Recommendation: Reduce to 30-90 days for vehicle images
minimumCacheTTL: 60 * 60 * 24 * 90, // 90 days
```

- **Enhanced Prompt (Project Context)**:
```javascript
// CONTEXT: Vehicle inventory changes seasonally (new models, discontinued trims)
// PATTERN: Hero images from Supabase storage (getmytestdrive.com/images/vehicles/hero/)
// BUSINESS LOGIC: Dealers may update images for new model years (annually)

// TRADEOFF ANALYSIS:
// 1 year TTL:
//   ✅ Excellent CDN hit rate (99%+)
//   ✅ Minimal bandwidth costs
//   ❌ Stale images if dealer updates midyear
//   ❌ Users won't see new 2026 models until cache expires

// 90 days TTL:
//   ✅ Fresh images every quarter
//   ✅ Catches model year updates (typically August-October)
//   ⚠️ Slightly higher CDN costs (negligible)
//   ✅ Better UX for new inventory

// RECOMMENDATION: 90 days (aligns with quarterly updates)
minimumCacheTTL: 60 * 60 * 24 * 90, // 90 days
```

- **Assigned**: CC
- **Estimate**: 5 minutes
- **Blocker Status**: NO
- **Resolution**: ⏳ PENDING

---

### HIGH-002: Hero Image Physical Coverage (62.3% Missing)
- **File**: `public/images/vehicles/hero/*.webp`
- **Severity**: HIGH (Visual Quality)
- **Impact**: Database 100% coverage (199/199 URLs), but only 75 physical files exist. 124 models (62.3%) show placeholders. Undermines demo professionalism.
- **Source**: IMAGE_COVERAGE_REPORT_DEC23.md
- **Review Tool Prompt**:
```
Complete hero image physical coverage. Status: 199/199 database URLs (100%), 75/199 physical files (37.7%).
Phase 1: Download 124 missing images using Unsplash API (same method as BMW iX1)
Phase 2: Manual map 41 unmatched files to correct model IDs via Supabase REST API
Phase 3: Verify all 199 images load correctly with fallback to placeholder.webp
Target: 100% physical coverage by Dec 24
```

- **Enhanced Prompt (Project Context)**:
```bash
# CONTEXT: Image quality standard defined (BMW iX1 2024)
# - Centered, 3/4 angle, 4:3 aspect, 1200x900+ resolution
# STACK: Unsplash API, Supabase storage, Next.js Image optimization
# GUARDRAIL: Use fallback.webp for missing images (no broken images)

# PHASE 1: Download missing images (GC task)
# Script: scripts/download_hero_images.py
# Input: IMAGE_COVERAGE_REPORT_DEC23.md missing list (124 models)
# API: Unsplash /search/photos?query={brand} {model} {year}
# Quality filters: orientation=landscape, min_width=1200

# PHASE 2: Manual mapping (GC task)
# 41 unmatched files need database URL updates
# Pattern: audi-a3-2025.webp → UPDATE models SET hero_image_url WHERE...

# PHASE 3: Verification (CC task)
# Test: Load catalog page, check Network tab for 404s
# Verify: All 199 images return 200 OR fallback to placeholder
# Expected: 0 broken images, <5% placeholder rate

# NOTE: This is a GC task (web scraping + bulk operations)
```

- **Assigned**: GC
- **Estimate**: 120 minutes (2 hours)
- **Blocker Status**: NO (UX enhancement, not feature blocking)
- **Resolution**: ⏳ PENDING

---

### HIGH-003: Docstring Coverage Declining (83.73% → Target 90%)
- **File**: Multiple (all .ts/.tsx files)
- **Severity**: HIGH (Code Quality)
- **Impact**: CodeRabbit flagged declining docstring coverage in PRs #18 (50%), #19 (60%), #22 (33%). Current: 83.73%. Target: 90%+.
- **Source**: PR_ISSUES_CONSOLIDATED.md #13
- **Review Tool**: CodeRabbit AI
- **Review Tool Prompt**:
```
Docstring coverage below 90% threshold.
Add JSDoc comments to exported functions:
/**
 * Brief description of function purpose
 * @param {Type} paramName - Parameter description
 * @returns {Type} Return value description
 */
```

- **Enhanced Prompt (Project Context)**:
```typescript
// CONTEXT: Pre-commit hook enforces 70% minimum (scripts/check_docstring_coverage.py)
// CURRENT: 83.73% (251 functions, 41 missing docstrings)
// TARGET: 90% (23 missing → 10 missing allowed)
// POLICY: All exported functions MUST have docstrings (CONTRIBUTING.md planned)

// ENFORCEMENT PLAN:
// 1. Update pre-commit hook: 70% → 80% → 90% (phased)
// 2. ESLint rule: require-jsdoc for exported functions
// 3. Template in .vscode/snippets.json

// PRIORITY FILES (worst offenders):
// - src/repositories/*.ts (data access layer - critical)
// - src/components/*.tsx (UI components - user-facing)
// - src/lib/*.ts (utilities - reusable logic)

// EXAMPLE FIX:
/**
 * Fetches all vehicles from Supabase with full relational data
 * Includes brands, models, categories, transmissions, fuel types
 * @returns {Promise<{data: Vehicle[] | null, error: Error | null}>}
 */
export async function getAllVehicles() {
  // implementation
}
```

- **Assigned**: CC (policy + enforcement) + BB (implementation)
- **Estimate**: 60 minutes (policy 15 min, implementation 45 min)
- **Blocker Status**: NO (quality standard, not feature blocking)
- **Resolution**: ⏳ PENDING

---

### HIGH-004: Price Slider Visual Position Bug
- **File**: `src/components/FilterPanel.tsx` (MUI Slider)
- **Severity**: HIGH (Visual UX)
- **Impact**: Slider thumb stuck at ~40% position when max=3.9M EGP, despite correct value selection. Confuses users about selected price range.
- **Source**: ACTION_ITEMS_DEC23.md #8
- **Review Tool Prompt**:
```
Fix price slider visual position bug. Issue: thumb stuck at 40% when max=3.9M EGP.
1. Test FilterPanel.tsx Slider with different max values (1M, 5M, 10M, 20M)
2. Check MUI Slider props: step, scale, marks, valueLabelDisplay
3. Consider logarithmic scale for large ranges (scale="log" or custom)
4. Verify thumb position matches selected value across full range
5. Test on Chrome/Firefox/Safari
```

- **Enhanced Prompt (Project Context)**:
```typescript
// CONTEXT: Price range 0-3.9M EGP (Egyptian Pounds)
// PATTERN: MUI Slider v6.4.3 (linear scale)
// ISSUE: Large number range breaks visual calculation

// ROOT CAUSE HYPOTHESIS:
// Linear scale + large max value → thumb position integer overflow?
// OR: Step size too small for range (step: 50000, max: 3900000 = 78 steps)

// FIX OPTIONS:

// Option A: Logarithmic scale (best for wide ranges)
<Slider
  scale={(value) => Math.log10(value + 1)}
  min={0}
  max={3900000}
  step={50000}
  valueLabelFormat={(value) => `${(value / 1000).toFixed(0)}K EGP`}
/>

// Option B: Reduce precision (larger steps)
<Slider
  min={0}
  max={3900000}
  step={100000}  // 100K steps instead of 50K
  marks={[
    { value: 0, label: '0' },
    { value: 1000000, label: '1M' },
    { value: 2000000, label: '2M' },
    { value: 3900000, label: '3.9M' },
  ]}
/>

// Option C: Custom scale function (Egyptian market tiers)
const priceScale = (value: number) => {
  if (value < 500000) return value;  // Entry (0-500K): linear
  if (value < 1500000) return 500000 + (value - 500000) * 0.5;  // Budget
  return 1000000 + (value - 1500000) * 0.2;  // Premium/Luxury
};

// TESTING:
// 1. Verify min (0) → thumb at 0%
// 2. Verify mid (1.95M) → thumb at 50%
// 3. Verify max (3.9M) → thumb at 100%
// 4. Test browsers: Chrome, Firefox, Safari (webkit slider differences)
```

- **Assigned**: BB
- **Estimate**: 30 minutes
- **Blocker Status**: NO
- **Resolution**: ⏳ PENDING (reported as "Code Complete (Verification Pending)" in CRITICAL_HIGH_BLOCKERS_ROSTER.md)

---

### HIGH-005: Locale Persistence Enforcement Audit
- **File**: Multiple (`grep -r "router.push"`)
- **Severity**: HIGH (UX Consistency)
- **Impact**: Unaudited `router.push()` calls may flip locale (EN↔AR) unexpectedly during navigation. Need comprehensive audit.
- **Source**: LOCALE_ROUTING_SPEC.md, PR_ISSUES #9
- **Review Tool Prompt**:
```
Audit all router.push() calls for locale preservation compliance.
1. Grep codebase for 'router.push' pattern
2. Verify each call includes `/${locale}/...` prefix per LOCALE_ROUTING_SPEC.md Rule 2
3. Flag any violations
4. Check for hardcoded '/en/' or '/ar/' paths (forbidden)
5. Verify no window.location.reload() after router.push()
6. Create audit report: compliant count, violation list with file:line
```

- **Enhanced Prompt (Project Context)**:
```bash
# CONTEXT: LOCALE_ROUTING_SPEC.md defines 5 rules for locale persistence
# PATTERN: `router.push(\`/\${locale}/...\`)` is correct
# VIOLATIONS: router.push('/hardcoded/path'), router.push(pathname)

# AUDIT COMMAND:
grep -rn "router.push" src/ --include="*.tsx" --include="*.ts" | \
  grep -v "/${locale}/" | \
  grep -v "// locale preserved" > /tmp/locale_violations.txt

# EXPECTED VIOLATIONS TO FIX:
# - src/components/VehicleCard.tsx:XX (if not using locale)
# - src/app/[locale]/bookings/[id]/verify/page.tsx:XX

# COMPLIANT EXAMPLES:
router.push(\`/\${locale}/compare\`)  // ✅ Good
router.push(\`/\${language}/vehicles/\${slug}\`)  // ✅ Good (language = locale)

# VIOLATION EXAMPLES:
router.push('/compare')  // ❌ Bad - loses locale
router.push(\`/en/compare\`)  // ❌ Bad - hardcoded locale
router.push(pathname)  // ❌ Bad - pathname may not have locale

# FIX PATTERN:
const router = useRouter();
const params = useParams();
const locale = params.locale as string;

// OLD: router.push('/compare')
// NEW: router.push(\`/\${locale}/compare\`)
```

- **Assigned**: CC
- **Estimate**: 30 minutes
- **Blocker Status**: NO (audit task, not immediate fix)
- **Resolution**: ⏳ PENDING

---

## 🟠 BUCKET 3: BLOCKERS (Merge Conflicts / Architecture / Dependencies)

### BLOCK-001: ESLint 9.0 Breaking Changes (PR #16, #24)
- **File**: `eslint.config.js` (requires migration to flat config)
- **Severity**: BLOCKER (Dependency Upgrade)
- **Impact**: ESLint 9.0 requires flat config migration. Current `.eslintrc.json` format deprecated. Blocks all future ESLint upgrades.
- **Source**: Snyk PR #16, PR #24
- **Review Tool**: Snyk + GUARDRAILS
- **Review Tool Prompt**:
```
ESLint 9.0 requires flat config format.
Current: .eslintrc.json (deprecated)
Required: eslint.config.js (flat config)

Breaking changes:
- env, extends, parser moved to languageOptions
- No more extends: ['next/core-web-vitals']
- Manual plugin imports required

Recommendation: Defer to MVP 1.5
```

- **Enhanced Prompt (Project Context)**:
```javascript
// CONTEXT: Currently on ESLint 8.57.0, Snyk recommends 9.39.1
// GUARDRAIL: "Stay on 8.x until MVP 1.5" (CLAUDE.md Section 3)
// IMPACT: Breaking changes require 2-4 hours migration + testing

// MIGRATION COMPLEXITY:
// 1. Flat config format (eslint.config.js):
//    - Remove .eslintrc.json
//    - Convert extends → languageOptions.parserOptions
//    - Import plugins manually (no more string references)
//
// 2. Next.js integration:
//    - next/core-web-vitals → manual config replication
//    - Check @next/eslint-plugin-next compatibility
//
// 3. TypeScript integration:
//    - @typescript-eslint/parser setup in languageOptions
//    - Type checking rule adjustments
//
// 4. Custom rules:
//    - no-restricted-imports (path aliases) → verify in flat config

// RECOMMENDATION (per GUARDRAILS):
// - Keep ESLint 8.57.0 for MVP 1.0
// - Schedule migration for MVP 1.5 (after performance work)
// - Close Snyk PRs #16, #24 with "Deferred to MVP 1.5" label

// ACCEPTANCE CRITERIA FOR FUTURE:
// ✅ All current rules working in flat config
// ✅ Next.js integration verified
// ✅ TypeScript type checking enabled
// ✅ CI passing with 0 errors
// ✅ Build time unchanged (<5 min)
```

- **Assigned**: CC (decision maker per GUARDRAILS)
- **Estimate**: 180 minutes (3 hours for migration when scheduled)
- **Blocker Status**: YES (blocks ESLint upgrades, NOT blocking MVP 1.0)
- **Resolution**: ⏳ DEFERRED to MVP 1.5 per GUARDRAILS

---

### BLOCK-002: TypeScript 5.9 Strict Checks (PR #13)
- **File**: `tsconfig.json`
- **Severity**: BLOCKER (Dependency Upgrade)
- **Impact**: TypeScript 5.9.3 may have new strict checks causing build failures. Need testing before upgrade.
- **Source**: Snyk PR #13
- **Review Tool**: Snyk + GUARDRAILS
- **Review Tool Prompt**:
```
TypeScript 5.7.3 → 5.9.3 upgrade.
Review breaking changes in 5.8 and 5.9.
Test: pnpm build --clean
Verify: 0 type errors before merge
```

- **Enhanced Prompt (Project Context)**:
```json
// CONTEXT: Currently on TypeScript 5.7.3 (strict mode enabled)
// PATTERN: 251 functions, strict null checks, no any (except type assertions)
// GUARDRAIL: Verify compatibility before upgrade (GUARDRAILS Section 3.1)

// BREAKING CHANGES 5.7 → 5.9:
// 1. Stricter `exactOptionalPropertyTypes`
// 2. Better type inference (may catch new errors)
// 3. Template literal type changes

// TESTING PROTOCOL:
// 1. Update package.json: "typescript": "5.9.3"
// 2. Run: pnpm install
// 3. Run: pnpm build --clean
// 4. Check: 0 type errors (current: 0, must maintain)
// 5. Run: pnpm test (if tests exist)
// 6. Verify: No new ESLint @typescript-eslint errors

// RISK ASSESSMENT:
// - Low risk: Minor version bump (5.7 → 5.9)
// - Medium risk: Strict mode may catch new issues
// - High reward: Better type safety, bug prevention

// APPROVAL CRITERIA:
// ✅ Build passes with 0 errors
// ✅ All existing functionality works
// ✅ No new type assertions (as any) added
// ✅ CI green (if configured)

// If build fails → document errors → defer to MVP 1.5
```

- **Assigned**: CC
- **Estimate**: 45 minutes (30 min testing, 15 min fixes if needed)
- **Blocker Status**: NO (safe to test, may block merge if failures)
- **Resolution**: ⏳ PENDING (needs testing)

---

### BLOCK-003: Supabase Client 2.50.0 → 2.86.0 (PR #14)
- **File**: `package.json`, `src/repositories/*.ts`
- **Severity**: BLOCKER (Dependency Upgrade)
- **Impact**: Supabase upgrade may have breaking changes in query API. Need testing with repository pattern.
- **Source**: Snyk PR #14
- **Review Tool**: Snyk + GUARDRAILS
- **Review Tool Prompt**:
```
@supabase/supabase-js 2.50.0 → 2.86.0 upgrade.
Review breaking changes in 2.51-2.86 releases.
Test: All repository methods (getAllVehicles, etc.)
Verify: Query syntax unchanged, results identical
```

- **Enhanced Prompt (Project Context)**:
```typescript
// CONTEXT: Supabase client 2.50.0, PostgreSQL, Repository pattern
// PATTERN: vehicleRepository.getAllVehicles() uses complex joins
// CRITICAL: Query `!inner` syntax, `as unknown as Type` casts

// BREAKING CHANGE RISK AREAS:
// 1. Query builder API changes
// 2. TypeScript type generation changes
// 3. Auth API changes (not used yet)
// 4. Realtime API changes (not used yet)

// TESTING PROTOCOL:
// 1. Update: "@supabase/supabase-js": "2.86.0"
// 2. Run: pnpm install
// 3. Test repository methods:
const { data, error } = await vehicleRepository.getAllVehicles();
console.log('Vehicle count:', data?.length);  // Should be 409
console.log('Error:', error);  // Should be null

// 4. Verify complex joins still work:
.select(`
  *,
  models!inner(*,
    brands!inner(*)
  ),
  categories(*),
  ...
`)

// 5. Check type assertions still needed:
as unknown as Vehicle[]  // May be fixed in newer version

// REGRESSION TESTING:
// ✅ getAllVehicles() returns 409 vehicles
// ✅ All relational data populated (brands, models, etc.)
// ✅ No type errors in repository files
// ✅ Build passes
// ✅ Catalog page loads correctly

// If tests fail → document specific API changes → defer or fix
```

- **Assigned**: CC
- **Estimate**: 60 minutes (30 min testing, 30 min fixes if needed)
- **Blocker Status**: NO (safe to test, may block merge if failures)
- **Resolution**: ⏳ PENDING (needs testing)

---

### BLOCK-004: React Types 19.0.8 → 19.2.7 (PR #17)
- **File**: `package.json`, `*.tsx` files
- **Severity**: BLOCKER (Dependency Upgrade)
- **Impact**: React 19 type definitions update. Low risk but need verification with MUI 6.4.3 compatibility.
- **Source**: Snyk PR #17
- **Review Tool**: Snyk
- **Review Tool Prompt**:
```
@types/react 19.0.8 → 19.2.7 upgrade.
Verify: MUI 6.4.3 compatibility with React 19.2 types
Test: Build passes, no new type errors
```

- **Enhanced Prompt (Project Context)**:
```typescript
// CONTEXT: React 19.2.0, MUI 6.4.3, strict TypeScript
// PATTERN: Heavy MUI usage (AppBar, Button, TextField, etc.)
// RISK: MUI 6.4.3 tested with React 19.0.x types, not 19.2.x

// COMPATIBILITY CHECK:
// 1. MUI 6.4.3 peer dependencies:
//    "react": "^18.0.0 || ^19.0.0"  // Should accept 19.2 types
//
// 2. Known React 19 type changes:
//    - FC<Props> deprecated → function Component(props: Props)
//    - forwardRef types improved
//    - No breaking changes expected in minor bump (19.0 → 19.2)

// TESTING PROTOCOL:
// 1. Update: "@types/react": "19.2.7"
// 2. Run: pnpm install
// 3. Run: pnpm build
// 4. Check for type errors in:
//    - src/components/*.tsx (MUI components)
//    - src/app/**/page.tsx (React Server Components)
// 5. Verify: 0 new type errors (current: 0)

// LOW RISK ASSESSMENT:
// ✅ Minor version bump (19.0 → 19.2)
// ✅ MUI designed for React 19
// ✅ No API changes, only type improvements
// ✅ Quick rollback if issues

// APPROVAL CRITERIA:
// ✅ Build passes
// ✅ 0 type errors
// ✅ MUI components render correctly
```

- **Assigned**: CC
- **Estimate**: 15 minutes (low risk, quick test)
- **Blocker Status**: NO (safe upgrade)
- **Resolution**: ⏳ PENDING (can approve immediately after test)

---

## 📊 Summary Statistics

| Bucket | Count | Total Estimate | Blockers |
|--------|-------|----------------|----------|
| Critical | 5 | 90 min (2 fixed) | 3 remaining |
| High Impact | 5 | 245 min | 0 |
| Blockers | 4 | 300 min | 1 (ESLint) |
| **TOTAL** | **14** | **635 min (10.6 hrs)** | **4** |

**Fixed by CC (2026-01-05)**:
- ✅ CRIT-001: Server Component `ssr: false` (commit 9e7a92d)
- ✅ CRIT-002: Sentry blocking render (commit 4734189) - *partial: deferred init fixed, sampling/PII pending*

**Remaining Critical (URGENT)**:
- ⏳ CRIT-003: 370 vs 409 vehicle discrepancy (BB - 30 min)
- ⏳ CRIT-004: Search returns wrong results (CC - 20 min)
- ⏳ CRIT-005: Language reload performance (CC - 15 min) - *may already be fixed per PERFORMANCE_LOG.md*

---

## 🎯 Execution Order (Priority)

### Phase 1: Critical Fixes (URGENT - Next 2 Hours)

1. **[CRIT-003]** - 370 vs 409 vehicle discrepancy → **BB** → 30 min → **BLOCKER**
2. **[CRIT-004]** - Search wrong results → **CC** → 20 min → **BLOCKER**
3. **[CRIT-005]** - Language reload → **CC** → 15 min → *Verify if already fixed*
4. **[CRIT-002]** - Sentry sampling/PII → **CC** → 10 min → *Complete the fix*

**Phase 1 Total**: 75 minutes (1.25 hours)

### Phase 2: High Impact UX (Next 4 Hours)

5. **[HIGH-001]** - Image cache TTL → **CC** → 5 min
6. **[HIGH-004]** - Price slider bug → **BB** → 30 min
7. **[HIGH-003]** - Docstring coverage → **CC** + **BB** → 60 min
8. **[HIGH-005]** - Locale audit → **CC** → 30 min
9. **[HIGH-002]** - Hero image coverage → **GC** → 120 min

**Phase 2 Total**: 245 minutes (4.1 hours)

### Phase 3: Dependency Upgrades (Test & Decide)

10. **[BLOCK-004]** - React types upgrade → **CC** → 15 min → **LOW RISK, APPROVE**
11. **[BLOCK-002]** - TypeScript upgrade → **CC** → 45 min → **TEST REQUIRED**
12. **[BLOCK-003]** - Supabase upgrade → **CC** → 60 min → **TEST REQUIRED**
13. **[BLOCK-001]** - ESLint 9.0 → **CC** → 180 min → **DEFER to MVP 1.5**

**Phase 3 Total**: 300 minutes (5 hours, but ESLint deferred = 120 min actual)

---

## 🚨 Policy Reminders

### ZERO SECURITY ON CREDENTIALS UNTIL MVP 3.x
- ❌ **IGNORE**: "Hardcoded DSN/tokens" warnings (per user directive)
- ✅ **INCLUDE**: PII exposure, user privacy, cost issues
- **Rationale**: All keys rotate before live demo (single task post-MVP 3.x)
- **Example**: CRIT-002 Sentry DSN - hardcoded OK, but `sendDefaultPii: true` is NOT OK

### Performance Focus
- **FCP target**: < 2.0s (currently 3.78s → 2.2s after Sentry fix)
- **LCP target**: < 2.5s (currently 6.69s)
- **Bundle size**: Monitor +/- 50KB changes (currently ~276 KB)

### Documentation Requirements
- Update `CLAUDE.md` after Critical/High Impact fixes
- Update `PERFORMANCE_LOG.md` for CRIT-002, CRIT-005, HIGH-001
- Commit message pattern: `fix(scope): description per CRIT-XXX`

### GUARDRAILS Enforcement
- **ESLint**: Stay on 8.x until MVP 1.5 (BLOCK-001 deferred)
- **MUI**: Stay on 6.4.3 until MVP 1.5 (no upgrades)
- **Dependency upgrades**: Test on feature branch first, verify build passes

---

## 📝 Next Actions for Agents

### CC (Immediate - 75 min)
1. Fix CRIT-004 (Search wrong results) - 20 min
2. Verify CRIT-005 (Language reload) - 15 min or mark as fixed
3. Complete CRIT-002 (Sentry sampling/PII) - 10 min
4. Fix HIGH-001 (Image cache TTL) - 5 min
5. Test BLOCK-004 (React types) - 15 min → Approve
6. Audit HIGH-005 (Locale persistence) - 30 min

### BB (Immediate - 60 min)
1. Fix CRIT-003 (370 vs 409 vehicles) - 30 min **CRITICAL BLOCKER**
2. Fix HIGH-004 (Price slider bug) - 30 min

### GC (Deferred - 120 min)
1. HIGH-002 (Hero image coverage) - 120 min (2 hours)
   - Download 124 missing images
   - Map 41 unmatched files
   - Verify 100% coverage

### Coordinator (KWSL/PPLX)
1. Review BB's branch push blocker (Husky hook error)
2. Coordinate Phase 1 fixes between CC and BB
3. Schedule dependency upgrade testing (Phase 3)

---

**Last Updated**: 2026-01-05 23:35 EET
**Status**: 14 issues consolidated, 2 fixed, 12 pending
**Next Review**: After Phase 1 completion (75 min from now)
