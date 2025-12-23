# Locale & Routing Canonical Rules

**Version**: 1.0
**Created**: 2025-12-23 01:00 UTC
**Status**: CANONICAL (All agents must follow)
**Scope**: Next.js 15 App Router with [locale] dynamic segments

---

## Overview

This document defines the **single source of truth** for locale handling across the Hex Test Drive platform. All routing, redirects, and language switching must follow these rules.

**Supported Locales**: `en` (English), `ar` (Arabic)
**Default Locale**: `en`
**RTL Support**: `ar` only

---

## Rule 1: Locale Derivation

### From Route Params (Server Components)

```typescript
// ✅ CORRECT: Server Components + App Router
export default async function Page({ params }: { params: { locale: string } }) {
  const locale = params.locale as 'en' | 'ar';
  // Use locale...
}
```

**Why**: Next.js App Router passes params automatically to page components.

---

### From useParams Hook (Client Components)

```typescript
'use client';

import { useParams } from 'next/navigation';

export default function ClientComponent() {
  const params = useParams();
  const locale = params.locale as 'en' | 'ar';
  // Use locale...
}
```

**Why**: Client components can't access params prop, must use `useParams()` hook.

---

### From window.location (Legacy/Edge Cases Only)

```typescript
// ⚠️ USE ONLY IF: params unavailable, useParams() fails
const locale = window.location.pathname.split('/')[1] as 'en' | 'ar';

// ✅ WITH VALIDATION:
const extractLocaleFromPath = (): 'en' | 'ar' => {
  const segments = window.location.pathname.split('/');
  const locale = segments[1];
  return locale === 'ar' ? 'ar' : 'en'; // Fallback to 'en'
};
```

**Why**: Fallback for components outside Next.js rendering context (modals, external scripts).

---

## Rule 2: Locale Preservation in Navigation

### All router.push() Calls MUST Include Locale

```typescript
import { useRouter, useParams } from 'next/navigation';

function MyComponent() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const handleNavigate = () => {
    // ✅ CORRECT: Always include locale
    router.push(`/${locale}/bookings/123/confirmed`);

    // ❌ WRONG: Missing locale
    router.push('/bookings/123/confirmed');
  };
}
```

**Impact of Wrong Approach**: User navigates from `/ar/bookings/new` → `/bookings/123` (loses Arabic, switches to English).

---

### Dynamic Routes Preserve Locale

```typescript
// ✅ CORRECT: Dynamic booking ID
router.push(`/${locale}/bookings/${bookingId}/verify`);

// ✅ CORRECT: Query params
router.push(`/${locale}/catalog?brand=BMW&year=2025`);

// ❌ WRONG: Hardcoded locale
router.push(`/en/bookings/${bookingId}/verify`); // Ignores user's current locale
```

---

## Rule 3: Locale Switching

### Header Component Pattern

```typescript
'use client';

import { useRouter, usePathname, useParams } from 'next/navigation';

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = params.locale as 'en' | 'ar';

  const switchLocale = (newLocale: 'en' | 'ar') => {
    // Replace locale in current path
    const segments = pathname.split('/');
    segments[1] = newLocale; // Replace locale segment
    const newPath = segments.join('/');

    router.push(newPath);
  };

  return (
    <div>
      <button onClick={() => switchLocale('en')} disabled={currentLocale === 'en'}>
        English
      </button>
      <button onClick={() => switchLocale('ar')} disabled={currentLocale === 'ar'}>
        العربية
      </button>
    </div>
  );
}
```

**Behavior**:
- User on `/ar/catalog` clicks "English" → navigates to `/en/catalog`
- User on `/en/bookings/123` clicks "العربية" → navigates to `/ar/bookings/123`
- Preserves route structure, only changes locale segment

---

## Rule 4: Reload Behavior

### No Double Reload

```typescript
// ❌ WRONG: Causes double reload
const switchLocale = (newLocale: string) => {
  router.push(`/${newLocale}/catalog`);
  window.location.reload(); // ← NEVER DO THIS
};

// ✅ CORRECT: router.push() handles reload
const switchLocale = (newLocale: string) => {
  router.push(`/${newLocale}/catalog`); // Next.js handles transition
};
```

**Why**: `router.push()` triggers client-side navigation with automatic re-render. `window.location.reload()` causes full page reload (slower, loses state).

---

### No Locale Flip on Booking Return

```typescript
// SCENARIO: User books in /en/catalog, redirected to /ar/bookings/.../confirmed
// ROOT CAUSE: verify/page.tsx didn't extract locale from params

// ❌ WRONG (Before Fix):
router.push(`/bookings/${bookingId}/confirmed`); // Missing locale

// ✅ CORRECT (After Commit 905c061):
const locale = params.locale as string;
router.push(`/${locale}/bookings/${bookingId}/confirmed`);
```

**Test Case**:
1. Navigate to `/en/catalog`
2. Click "Book Test Drive" on BMW iX1
3. Fill form, submit
4. OTP verification page: `/en/bookings/abc123/verify`
5. Enter OTP, submit
6. Confirmation page: **MUST BE** `/en/bookings/abc123/confirmed` (not `/ar/...`)

---

## Rule 4.5: SPA Navigation Requirements (No Full Page Reloads)

**Version**: 1.0 (2025-12-23 03:00 UTC)
**Status**: CANONICAL - Contradicts previous audit claims, requires BB re-verification

### Language Switch Behavior

**REQUIRED**: Language switch (EN ↔ AR) MUST use SPA navigation only.

**Rule**: NO full page reload before, during, or after language switch.

**Implementation**:
```typescript
// ✅ CORRECT: Pure client-side navigation
const switchLocale = (newLocale: 'en' | 'ar') => {
  const segments = pathname.split('/');
  segments[1] = newLocale;
  const newPath = segments.join('/');
  router.push(newPath);  // Next.js handles transition via SPA
};

// ❌ WRONG: Any reload is forbidden
const switchLocale = (newLocale: 'en' | 'ar') => {
  router.push(`/${newLocale}/catalog`);
  window.location.reload();  // ← FORBIDDEN
};

// ❌ WRONG: Hard navigation
window.location.href = `/${newLocale}/catalog`;  // ← FORBIDDEN
```

**Verification**:
- Network tab: Should show only XHR/fetch requests, NO full document reload
- DevTools Performance: No "Navigation" event after language switch
- User experience: Instant switch, no white screen flash

---

### Compare Flow Navigation

**REQUIRED**: Catalog → Compare → Back to Catalog must preserve state without full reload.

**Scenario**:
1. User on `/en/catalog` (filters applied: Brand=BMW, Price=1M-2M)
2. User adds 3 vehicles to compare
3. User clicks "Compare" button → `/en/compare`
4. User clicks "Back to Catalog" → returns to `/en/catalog`

**Expected Behavior**:
- ✅ Returns to `/en/catalog` (same locale)
- ✅ Filters still applied (Brand=BMW, Price=1M-2M)
- ✅ Scroll position preserved (if technically feasible)
- ✅ NO full page reload
- ✅ Comparison list still populated (state persisted)

**Implementation Requirements**:
```typescript
// In ComparisonPage:
const handleBackToCatalog = () => {
  const locale = params.locale as string;
  router.push(`/${locale}/catalog`);  // Uses SPA navigation
  // Zustand filter state automatically restored from localStorage
};

// Filter state persistence (already implemented via Zustand):
// - useFilterStore persists to localStorage
// - On catalog re-mount, state auto-restores
```

**Forbidden Patterns**:
- ❌ `window.location.reload()` anywhere in compare flow
- ❌ `window.location.href = ...` (hard navigation)
- ❌ Clearing filter state on unmount
- ❌ Resetting scroll position to top on back navigation

---

### Audit Status

**Previous Claims** (2025-12-23 LOCALE_AUDIT_REPORT_20251223.md):
- Claimed: "100% locale compliance, 0 violations"
- Claimed: "No window.location.reload() calls found"

**User Observation** (2025-12-23):
- Reality: Language switch causes full page reload
- Reality: Compare → Back causes full page reload
- Reality: Filter state NOT preserved on back navigation

**Status**: ⚠️ CONTRADICTED - Previous audit incomplete or behavior regressed

**Action Required**:
- BB: Re-verify with browser DevTools Network tab
- BB: Check for hidden reload triggers (useEffect dependencies, router.refresh(), etc.)
- GC: Search codebase for reload patterns:
  ```bash
  grep -r "window.location.reload" src/
  grep -r "router.refresh" src/
  grep -r "window.location.href" src/
  ```

---

## Rule 5: Middleware Locale Detection

### Current Implementation (Optional Enhancement)

```typescript
// middleware.ts (if using i18n middleware)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if locale is missing
  const pathnameHasLocale = /^\/(en|ar)(\/|$)/.test(pathname);

  if (!pathnameHasLocale) {
    // Redirect to default locale
    const locale = 'en'; // Or detect from Accept-Language header
    return NextResponse.redirect(
      new URL(`/${locale}${pathname}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

**Behavior**:
- User navigates to `/catalog` (missing locale) → redirects to `/en/catalog`
- User navigates to `/ar/catalog` → passes through (locale present)

**Status**: Not implemented yet (defer to MVP 1.5)

---

## Rule 6: Localization Keys

### Translation Files Location

```
src/locales/
  en.json
  ar.json
```

### Accessing Translations

```typescript
import { useParams } from 'next/navigation';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';

export function MyComponent() {
  const params = useParams();
  const locale = params.locale as 'en' | 'ar';
  const t = locale === 'ar' ? ar : en;

  return <h1>{t.welcome}</h1>;
}
```

**Why**: Simple JSON approach, no i18n library needed for MVP.

---

## Rule 7: RTL (Right-to-Left) Support

### HTML Direction Attribute

```typescript
// app/[locale]/layout.tsx
export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const isRTL = params.locale === 'ar';

  return (
    <html lang={params.locale} dir={isRTL ? 'rtl' : 'ltr'}>
      <body>{children}</body>
    </html>
  );
}
```

**Behavior**:
- `/en/*` pages: `<html dir="ltr">`
- `/ar/*` pages: `<html dir="rtl">`
- CSS automatically flips layout (flexbox, grid, margin/padding)

---

## Rule 8: Error Handling

### Missing Locale in URL

```typescript
// Fallback to default locale
const locale = params.locale || 'en';

// Or throw error (stricter)
if (!params.locale) {
  throw new Error('Locale parameter missing');
}
```

**Decision**: Use fallback approach for better UX (no crashes).

---

### Invalid Locale Value

```typescript
// Validate locale
const locale = ['en', 'ar'].includes(params.locale)
  ? params.locale
  : 'en';
```

**Decision**: Silently fallback to 'en' (no 404 errors for typos).

---

## Violations Fixed (Commits)

### Commit 300ddcc (Dec 22, 2025)
**File**: `src/components/VehicleCard.tsx`
**Issue**: Missing locale in booking redirect
**Fix**:
```typescript
// Before:
router.push('/bookings/new');

// After:
const locale = params.locale;
router.push(`/${locale}/bookings/new`);
```

---

### Commit 905c061 (Dec 22, 2025)
**File**: `src/app/[locale]/bookings/[id]/verify/page.tsx`
**Issue**: Locale not extracted from params
**Fix**:
```typescript
// Before:
router.push(`/bookings/${bookingId}/confirmed`);

// After:
const locale = params.locale as string;
router.push(`/${locale}/bookings/${bookingId}/confirmed`);
```

---

## Audit Checklist (For Developers)

Before committing code, verify:

- [ ] All `router.push()` calls include `/${locale}/...`
- [ ] Locale extracted from `params.locale` or `useParams()`
- [ ] No hardcoded `/en/` or `/ar/` in navigation
- [ ] No `window.location.reload()` after `router.push()`
- [ ] Language switcher preserves route structure
- [ ] RTL tested on `/ar/*` routes
- [ ] Translation keys exist in both `en.json` and `ar.json`

---

## Testing Guide

### Manual Test Scenarios

**Test 1: Locale Persistence**
1. Navigate to `/ar/catalog`
2. Click on any vehicle
3. Verify URL: `/ar/vehicles/123` (not `/en/vehicles/123`)

**Test 2: Language Switching**
1. Navigate to `/en/catalog`
2. Click "العربية" button
3. Verify URL: `/ar/catalog`
4. Verify text direction: RTL
5. Click "English" button
6. Verify URL: `/en/catalog`
7. Verify text direction: LTR

**Test 3: Booking Flow Locale**
1. Navigate to `/en/catalog`
2. Book test drive
3. Verify OTP page: `/en/bookings/.../verify`
4. Submit OTP
5. Verify confirmation: `/en/bookings/.../confirmed` (NO `/ar/` flip)

**Test 4: Direct URL Access**
1. Type `/ar/bookings/123/verify` in browser
2. Verify page loads in Arabic
3. Verify no redirect to `/en/`

---

## Automated Tests (Playwright)

```typescript
// tests/e2e/locale-persistence.spec.ts
import { test, expect } from '@playwright/test';

test('locale persists through booking flow', async ({ page }) => {
  // Start in English
  await page.goto('/en/catalog');
  await expect(page).toHaveURL(/\/en\/catalog/);

  // Book test drive
  await page.click('text=Book Test Drive');
  await expect(page).toHaveURL(/\/en\/bookings\/new/);

  // Fill form and submit
  await page.fill('[name="name"]', 'Test User');
  await page.fill('[name="phone"]', '+201234567890');
  await page.click('button[type="submit"]');

  // Verify OTP page in English
  await expect(page).toHaveURL(/\/en\/bookings\/.*\/verify/);
});

test('language switcher changes locale', async ({ page }) => {
  await page.goto('/en/catalog');

  // Switch to Arabic
  await page.click('button:has-text("العربية")');
  await expect(page).toHaveURL(/\/ar\/catalog/);
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

  // Switch back to English
  await page.click('button:has-text("English")');
  await expect(page).toHaveURL(/\/en\/catalog/);
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
});
```

---

## Future Enhancements (MVP 1.5+)

1. **Middleware Auto-Redirect**: Redirect `/catalog` → `/en/catalog`
2. **Accept-Language Detection**: Auto-select locale from browser settings
3. **Locale Cookies**: Remember user's preference across sessions
4. **SEO Hreflang Tags**: `<link rel="alternate" hreflang="ar" href="/ar/catalog" />`
5. **SSG Pre-rendering**: Generate static pages for both locales
6. **i18n Library**: Migrate to `next-intl` or `react-i18next`

---

## References

- Next.js i18n Routing: https://nextjs.org/docs/app/building-your-application/routing/internationalization
- MDN RTL Guidelines: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties
- Commit 300ddcc: VehicleCard locale fix
- Commit 905c061: verify page locale fix
- ACTION_ITEMS_DEC23.md: Locale persistence requirements

---

**Maintained By**: CC
**Last Updated**: 2025-12-23 01:00 UTC
**Status**: CANONICAL - Do not deviate without approval
