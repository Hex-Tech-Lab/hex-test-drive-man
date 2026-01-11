# ISSUES ROSTER - Living Bug & Improvement Tracker

**Version:** 1.3.0  
**Last Updated:** 2026-01-07 1755 UTC BB (Blackbox AI)  
**Owner:** All Agents (CC audits, others add)  
**Purpose:** Single source of truth for all bugs, improvements, and technical debt

---

## SESSION: 2026-01-07 17:55 UTC - Production Bug Documentation (16 Bugs)

### Booking Flow Bugs (Session 1: 18:44 UTC)
- **BUG-013**: Booking form validation missing - 🔴 CRITICAL (no client-side validation)
- **BUG-014**: Time slot availability not checked - 🔴 CRITICAL (double-booking possible)
- **BUG-015**: QR code not generated - 🔴 CRITICAL (shows loading forever)
- **BUG-016**: National ID upload fails silently - 🔴 HIGH (no success/error feedback)
- **BUG-017**: Confirmation email not sent - 🔴 HIGH (no email service configured)
- **BUG-018**: Booking dashboard empty state - 🟡 MEDIUM (shows "no bookings" when bookings exist)
- **BUG-019**: Booking cancellation not working - 🔴 HIGH (button does nothing)

### Booking Validation Bugs (Session 2: 19:40 UTC)
- **BUG-020**: National ID validation too strict - 🔴 CRITICAL (rejects IDs with spaces/dashes)
- **BUG-021**: Date picker allows past dates - 🔴 CRITICAL (no min date restriction)
- **BUG-022**: Time slot grid not responsive - 🟡 MEDIUM (overflow on mobile)
- **BUG-023**: Vehicle selector shows all vehicles - 🔴 HIGH (includes unavailable vehicles)
- **BUG-024**: Missing "Add to Calendar" button - 🟢 LOW (no calendar integration)

### Navigation & UX Bugs (Session 3: 19:50 UTC)
- **BUG-025**: Logo/platform name not clickable - 🔴 HIGH (no home navigation)
- **BUG-026**: No breadcrumbs navigation - 🟡 MEDIUM (users don't know location)
- **BUG-027**: No back button in header - 🟡 MEDIUM (not mobile-friendly)
- **BUG-028**: Language switcher uses text not flags - 🟢 LOW (shows "ENGLISH" instead of 🇬🇧)

### PR #47 Failure
- **PR-47-REVERT**: Drawer always visible after PR #47 - ✅ REVERTED (commit aa6d1a1)
- **PR-47-INV**: Investigation needed - 🔴 PENDING (root cause analysis required)

**Full Details**: `docs/BUGS_PRODUCTION_COMPREHENSIVE_2026-01-07.md`  
**Total Bugs**: 16 (9 CRITICAL, 4 HIGH, 2 MEDIUM, 1 LOW)  
**Total Effort**: 660 minutes (11 hours)

---

## SESSION: 2026-01-07 10:38-11:06 - Mobile Review & MVP Prioritization

### UX Bugs (Mobile)
- **BUG-005**: Reservation counter stuck at 1 - 🔴 NEW (won't decrement to 0 after removing all reservations)
- **BUG-006**: Retry button not working - 🔴 NEW (internet error screen shows retry button but non-functional)
- **BUG-007**: Filters expanded by default - 🔴 NEW (should be collapsed on mobile)
- **BUG-008**: Drawer displays on full page reload - 🔴 NEW (should not appear until user action)
- **BUG-009**: Slow navigation between screens - 🔴 NEW (0.5-1s delay, needs prefetch)
- **BUG-010**: 24/7 support button exists - 🔴 NEW (no actual support, remove or replace)

### New Features (MVP 1.0-3.5)
- **FEAT-001**: Collapse filters by default (mobile) - 🔴 NEW (MVP 1.0)
- **FEAT-002**: Fix reservation counter logic - 🔴 NEW (MVP 1.0)
- **FEAT-003**: Implement prefetch for instant navigation - 🔴 NEW (MVP 1.0)
- **FEAT-004**: Separate comparison flyout (independent from reservations) - 🔴 NEW (MVP 1.5)
- **FEAT-005**: Double-fold animated flyout (2-panel slide + flip UX) - 🔴 NEW (MVP 1.5)
- **FEAT-006**: Mobile comparison limit (2 cars) with red text warning - 🔴 NEW (MVP 1.5)
- **FEAT-007**: Desktop comparison limit (5 cars) - 🔴 NEW (MVP 1.5)
- **FEAT-008**: Drag-drop or mark-and-place for one-hand operation - 🔴 NEW (MVP 1.5)
- **FEAT-009**: Replace pill buttons with animated icons - 🔴 NEW (MVP 2.0)
- **FEAT-010**: Catalog page redesign (icon-first approach) - 🔴 NEW (MVP 2.0)
- **FEAT-011**: Segment-based comparison ("Find my segment") - 🔴 NEW (MVP 2.5)
- **FEAT-012**: Cross-brand similarity engine - 🔴 NEW (MVP 2.5)

**Full Details**: Section 2 (HIGH Priority) + MVP_ROADMAP.md

---

## SESSION: 2026-01-07 00:00-01:53 - Performance Sprint (4 Phases)

### Visual Bugs
- **BUG-003**: Mobile font regression (heavier weight) - ✅ FIXED (PR #40 merged, Cairo font loaded)
- **BUG-004**: Desktop font issues - ✅ FIXED (PR #40 merged, Cairo font loaded)

### UX Issues
- **BUG-001**: RTL cart drawer - ✅ VERIFIED CORRECT (no fix needed)
- **BUG-002**: Skeleton flash - ✅ FIXED (PR #39 merged, commit 0839887)

### Performance Issues (Phase 2 Discoveries)
- **PERF-011**: Forced reflow in MUI chunk (1,141ms) - CRITICAL (assigned to BB, Sprint 1)
- **PERF-012**: JS execution regression (2.5s → 5.4s, +116%) - HIGH (assigned to BB, Sprint 1)
- **PERF-013**: DOM size explosion (4,953 elements, 330% over limit) - HIGH (assigned to BB, Sprint 1)
- **PERF-014**: Deprecated synchronous XMLHttpRequest - HIGH (assigned to BB, Sprint 1)

**Full Details**: `docs/SESSION_2026-01-07_COMPLETE.md`

---

## TABLE OF CONTENTS

1. CRITICAL (Production Broken)
2. HIGH Priority (Next 24 Hours)
3. MEDIUM Priority (Next Week)
4. LOW Priority (Backlog)
5. RECENTLY RESOLVED (Last 7 Days)
6. RECURRING ISSUES (Pattern Recognition)

---

## 1. CRITICAL (Production Broken) 🚨

### ISSUE-001: React Hooks Violation - Catalog Page
**Status:** 🔴 IN PROGRESS (BB assigned)  
**Discovered:** 2026-01-06 01:12 AM UTC (Sentry alert)  
**Severity:** BLOCKER (100% catalog page failure)  
**Root Cause:** CC's Phase 1 deployment (commits 648f31d, 2a19266) introduced conditional hook usage

**Error:**
```
Error: Rendered more hooks than during the previous render.
at CatalogPage (./src/app/[locale]/page.tsx:395:31)
```

**Impact:**
- All catalog page visits failing
- Users see white screen / error boundary
- 0% catalog page availability

**Likely Culprit:**
- `src/app/[locale]/page.tsx` line 395 (hooks called after early returns)
- FilterPanel lazy loading may have conditionally rendered hooks
- Mobile-first layout changes introduced conditional hook calls

**Fix Options:**
1. **Option A:** Revert Phase 1 entirely (safest, 5 min)
2. **Option B:** Fix hooks violation (15-30 min, requires code review)

**Assigned To:** BB  
**Time Budget:** 30 min max (then revert if stuck)  
**Verification:** `pnpm dev` → test /en and /ar → no console errors → deploy

**Related:**
- Sentry Issue: 7b7556a3214a482597d11c2bc02ec094
- Commits: 648f31d, 2a19266
- Working state: ed36d64 (before Phase 1)

---

## 2. HIGH Priority (Next 24 Hours) ⚡

### BUG-005: Reservation Counter Stuck at 1
**Status:** 🔴 NEW  
**Discovered:** 2026-01-07 1038 EET (mobile review session)  
**Severity:** HIGH (broken state management)

**Problem:**
- User removes all reservations from drawer
- Counter decrements from 2 → 1
- Stuck at 1 even when no reservations remain
- Expected: Counter should show 0 when empty

**Impact:**
- User cannot tell if reservations exist
- Confusing UX (shows "1" but drawer is empty)
- State sync issue between drawer and counter

**Root Cause (Hypothesis):**
- Counter state not updated on last item removal
- Possible off-by-one error in decrement logic
- OR: Minimum value check preventing 0

**Fix:**
```typescript
// Likely in src/components/ReservationDrawer.tsx or src/contexts/ReservationContext.tsx
const removeReservation = (id: string) => {
  setReservations(prev => prev.filter(r => r.id !== id));
  // Ensure counter updates to 0 when last item removed
  setCount(Math.max(0, count - 1)); // Remove any min(1) constraint
};
```

**Assigned To:** BB (Sprint 1, Hour 1)  
**Time Budget:** 15 min  
**Priority:** HIGH (user-facing state bug)

---

### BUG-006: Retry Button Not Working
**Status:** 🔴 NEW  
**Discovered:** 2026-01-07 1038 EET (mobile review session, screenshot provided)  
**Severity:** HIGH (error recovery blocked)

**Problem:**
- Internet connection error screen appears ("عذراً، حدث خطأ")
- "إعادة المحاولة" (Retry) button visible
- Clicking retry button does nothing
- User cannot recover from transient network errors

**Screenshot Evidence:**
- Error message: "لم نتمكن من تحميل المركبات. يُرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى."
- Technical error: "TypeError: Failed to fetch :تفاصيل الخطأ"

**Impact:**
- User must reload entire page to retry
- Poor UX for mobile users (common network issues)
- No graceful error recovery

**Root Cause (Hypothesis):**
- Retry button onClick handler not wired
- OR: Handler exists but doesn't refetch data
- OR: Error boundary catches but doesn't reset state

**Fix:**
```typescript
// Likely in src/components/ErrorBoundary.tsx or error.tsx
const handleRetry = () => {
  resetErrorBoundary(); // Reset error state
  router.refresh(); // Refetch data
  // OR: Call original fetch function directly
};

<Button onClick={handleRetry}>إعادة المحاولة</Button>
```

**Assigned To:** BB (Sprint 1, Hour 1)  
**Time Budget:** 20 min  
**Priority:** HIGH (error recovery critical for mobile)

---

### BUG-007: Filters Expanded by Default
**Status:** 🔴 NEW  
**Discovered:** 2026-01-07 1038 EET (mobile review session)  
**Severity:** MEDIUM (mobile UX issue)

**Problem:**
- FilterPanel expanded on page load (mobile)
- Takes up significant screen space
- User must manually collapse to see catalog
- Expected: Collapsed by default on mobile, expanded on desktop

**Impact:**
- Poor mobile first-impression (filters block content)
- Extra tap required on every visit
- Not following mobile-first design principle

**Fix:**
```typescript
// src/components/FilterPanel.tsx
const [expanded, setExpanded] = useState(() => {
  // Collapsed by default on mobile, expanded on desktop
  return !isMobile; // or window.innerWidth > 768
});
```

**Assigned To:** BB (Sprint 1, Hour 1)  
**Time Budget:** 10 min  
**Priority:** MEDIUM (mobile UX polish)

---

### BUG-008: Drawer Displays on Full Page Reload
**Status:** 🔴 NEW  
**Discovered:** 2026-01-07 1038 EET (mobile review session)  
**Severity:** MEDIUM (unexpected behavior)

**Problem:**
- Reservation/comparison drawer appears on page reload
- User did not trigger drawer open action
- Expected: Drawer only opens when user clicks icon/button

**Impact:**
- Jarring UX (drawer "flashes" on load)
- Obscures catalog content immediately
- Inconsistent with user-initiated action pattern

**Root Cause (Hypothesis):**
- Drawer state persisted in localStorage
- Page reload restores "open" state
- No check for user-initiated vs restored state

**Fix:**
```typescript
// src/components/ReservationDrawer.tsx
const [open, setOpen] = useState(false); // Always start closed
// Remove any localStorage.getItem('drawerOpen') on mount
useEffect(() => {
  localStorage.removeItem('drawerOpen'); // Don't persist drawer state
}, []);
```

**Assigned To:** BB (Sprint 1, Hour 1)  
**Time Budget:** 15 min  
**Priority:** MEDIUM (UX polish)

---

### BUG-009: Slow Navigation Between Screens
**Status:** 🔴 NEW  
**Discovered:** 2026-01-07 1038 EET (mobile review session)  
**Severity:** HIGH (performance regression)

**Problem:**
- Navigation between catalog screens takes 0.5-1 second
- Comparison view transition noticeably slow
- Expected: <200ms for instant feel

**User Quote:**
> "Going from one screen to one screen is very slow... takes half a second or second to take place and that's not smart these should be prefetched."

**Impact:**
- App feels sluggish on mobile
- Users perceive low quality
- Competitors (Amazon, Carvana) have instant transitions

**Root Cause:**
- No prefetching of next/prev catalog pages
- No route preloading for comparison view
- Possible: Images not lazy loaded properly

**Fix:**
```typescript
// src/app/[locale]/page.tsx
import { prefetch } from 'next/navigation';

useEffect(() => {
  // Prefetch adjacent pages
  prefetch(`/${locale}?page=${currentPage + 1}`);
  if (currentPage > 1) prefetch(`/${locale}?page=${currentPage - 1}`);
  
  // Prefetch comparison route
  prefetch(`/${locale}/compare`);
}, [currentPage, locale]);
```

**Assigned To:** BB (Sprint 1, Hour 2)  
**Time Budget:** 30 min  
**Priority:** HIGH (mobile performance critical)

---

### BUG-010: 24/7 Support Button Exists But No Support
**Status:** 🔴 NEW  
**Discovered:** 2026-01-07 1038 EET (mobile review session)  
**Severity:** LOW (misleading UI)

**Problem:**
- Button/link promises "24/7 support"
- No actual support infrastructure exists
- Clicking leads nowhere or shows placeholder

**User Quote:**
> "Is no 24 by 7 support so we need to remove that button and put something else instead"

**Impact:**
- User frustration (false promise)
- Trust issue (claims feature that doesn't exist)
- Unprofessional appearance

**Fix Options:**
1. Remove button entirely
2. Replace with "Contact Us" (email form)
3. Replace with FAQ link
4. Replace with WhatsApp business link (if available)

**Assigned To:** BB (Sprint 1, Hour 2)  
**Time Budget:** 10 min  
**Priority:** LOW (remove false promise)

---

### ISSUE-002: CLAUDE.md Header Outdated
**Status:** ✅ RESOLVED  
**Discovered:** 2026-01-06 1800 EET (this session)  
**Resolved:** 2026-01-07 1106 EET (PPLX update)  
**Severity:** MEDIUM (documentation drift)

**Problem:**
- Header says "Last Updated: 2025-12-24 1756 EET" (wrong date)
- Version: 2.4.0 (should be 2.4.1 after today's updates)
- Missing today's sessions (Jan 5-6 Performance Architecture, Jan 6 Production Crisis)
- Not using proper timestamp format (should be YYYY-MM-DD HHmm Agent Model)

**Fix:**
```markdown
Version: 2.4.2 | Last Updated: 2026-01-07 1106 EET PPLX CS45
```

**Resolution:** Updated in this commit

---

### ISSUE-003: Search Box Duplication
**Status:** 🟡 NEW  
**Discovered:** 2026-01-06 (user screenshot feedback on CC's Phase 1)  
**Severity:** MEDIUM (UX issue)

**Problem:**
- Two search boxes visible on catalog page
- One in header, one in hero/toolbar
- Should be single component (in header OR hero, not both)

**Impact:**
- Confusing UX
- Layout clutter on mobile
- Inconsistent behavior between two search boxes

**Fix:**
- Remove duplicate search box
- Keep single instance (user to decide: header vs hero)

**Assigned To:** TBD (after production stabilizes)  
**Time Budget:** 15 min

---

### ISSUE-004: Tab Alignment Inconsistency
**Status:** 🟡 NEW  
**Discovered:** 2026-01-06 (user screenshot feedback)  
**Severity:** LOW (cosmetic)

**Problem:**
- Tab labels inconsistent (some have "by", some don't)
- Example: "By Brand" vs "Type" (should be "By Type" or "Brand")
- No fluid motion (sliding indicator, animated underline)

**Impact:**
- Looks unpolished
- Not premium automotive brand feel

**Fix:**
- Standardize tab labels (remove "by" or add consistently)
- Add fluid motion animations (MUI Tab indicator)

**Assigned To:** TBD (design refinement phase)  
**Time Budget:** 30 min

---

### ISSUE-005: Arabic Font White Streaks
**Status:** ✅ RESOLVED  
**Discovered:** 2026-01-06 (user business discussion)  
**Resolved:** 2026-01-06 2350 UTC (BB Phase 6, PR #40)  
**Severity:** HIGH (premium positioning)

**Problem:**
- Arabic fonts render with white streaks (inter-character spacing issues)
- Likely artificial letter-spacing applied
- Unprofessional appearance for Arabic-first market

**Impact:**
- Lower perceived quality
- Not premium brand positioning
- Competitors have better Arabic typography

**Fix:**
- Implemented Cairo font with Next.js font optimization
- Zero artificial letter-spacing
- Proper fallback chain
- 21 KB savings (Cairo 70KB vs Roboto 91KB)

**Location:** `src/app/[locale]/layout.tsx`, `src/lib/theme.ts`  
**Commits:** 08d2afe (PR #40)

---

## 3. MEDIUM Priority (Next Week) 📋

### ISSUE-006: 166 Models Missing Hero Images
**Status:** 🟡 NEW  
**Discovered:** 2026-01-04 (CC's comprehensive fix)  
**Severity:** MEDIUM (user experience)

**Current State:**
- 408 models total
- 242 with valid hero_image_url (59% coverage)
- 166 with NULL → show vintage car fallback (41%)

**Impact:**
- Generic fallback not brand-specific
- Lower perceived catalog quality
- Users expect real vehicle images

**Fix Options:**
1. Manual sourcing (manufacturer brochures)
2. Web scraping (legal/copyright check)
3. Stock image purchase (budget approval)
4. Accept 41% fallback (defer until user feedback)

**Assigned To:** TBD (after user decision on sourcing approach)  
**Time Budget:** TBD (depends on sourcing method)

---

### ISSUE-007: Mercedes-Benz Not in Filters
**Status:** ✅ RESOLVED (working as intended)  
**Discovered:** 2026-01-06 (user screenshot feedback)  
**Severity:** N/A

**Investigation:**
- Query: `SELECT COUNT(*) FROM models WHERE brand_id IN (SELECT id FROM brands WHERE slug='mercedes-benz')`
- Result: 0 vehicles
- **Working as intended:** Brand correctly hidden when no vehicles available

**Resolution:** No fix needed (24 Mercedes models exist but 0 trims due to partial migration)

---

### ISSUE-008: Wrong Image Orientations
**Status:** 🟡 NEW  
**Discovered:** 2026-01-04 (user report)  
**Severity:** MEDIUM (quality issue)

**Problem:**
- Some hero images show side/rear views (not 3/4 front)
- Examples: Suzuki Grand Vitara, VW Tiguan
- No automated quality checks for orientation/resolution

**Impact:**
- Inconsistent catalog presentation
- Users expect consistent 3/4 front views (automotive standard)

**Fix:**
- Audit all 242 existing hero images
- Replace wrong orientations
- Add quality gate script (check orientation, resolution, brand logo visible)

**Assigned To:** TBD (image sourcing strategy needed first)  
**Time Budget:** TBD (depends on replacement image availability)

---

### FEAT-001: Collapse Filters by Default (Mobile)
**Status:** 🔴 NEW  
**Discovered:** 2026-01-07 1118 AM EET (MVP roadmap planning)  
**Severity:** HIGH (mobile UX)  
**MVP:** 1.0

**Problem:**
- Filters expanded on page load (mobile)
- Takes up significant screen space
- User must manually collapse to see catalog

**Impact:**
- Poor mobile first-impression
- Extra tap required on every visit
- Not following mobile-first design principle

**Fix:**
```typescript
const [expanded, setExpanded] = useState(() => !isMobile);
```

**Assigned To:** BB (Sprint 1)  
**Time Budget:** 1h  
**Priority:** HIGH

---

### FEAT-002: Fix Reservation Counter Logic
**Status:** 🔴 NEW  
**Discovered:** 2026-01-07 1118 AM EET (MVP roadmap planning)  
**Severity:** CRITICAL (state management)  
**MVP:** 1.0

**Problem:**
- Counter stuck at 1 when all reservations removed
- Should decrement to 0

**Impact:**
- User cannot tell if reservations exist
- Confusing UX

**Fix:**
```typescript
setCount(Math.max(0, count - 1)); // Remove min(1) constraint
```

**Assigned To:** BB (Sprint 1)  
**Time Budget:** 2h  
**Priority:** CRITICAL

---

### FEAT-003: Implement Prefetch for Instant Navigation
**Status:** 🔴 NEW  
**Discovered:** 2026-01-07 1118 AM EET (MVP roadmap planning)  
**Severity:** HIGH (performance)  
**MVP:** 1.0

**Problem:**
- Navigation between screens takes 0.5-1s
- Comparison view transition noticeably slow
- Expected: <200ms for instant feel

**Impact:**
- App feels sluggish on mobile
- Users perceive low quality

**Fix:**
```typescript
useEffect(() => {
  prefetch(`/${locale}?page=${currentPage + 1}`);
  prefetch(`/${locale}/compare`);
}, [currentPage, locale]);
```

**Assigned To:** BB (Sprint 1)  
**Time Budget:** 4h  
**Priority:** HIGH

---

### FEAT-004: Separate Comparison Flyout
**Status:** 🔴 NEW  
**Discovered:** 2026-01-07 1118 AM EET (MVP roadmap planning)  
**Severity:** HIGH (UX enhancement)  
**MVP:** 1.5

**Problem:**
- Comparison and reservations share same drawer
- User wants independent flyouts

**Impact:**
- Confusing UX (mixing two different actions)
- Cannot compare while viewing reservations

**Fix:**
- Create separate ComparisonDrawer component
- Independent state management
- Separate icons/buttons

**Assigned To:** CC (Sprint 2)  
**Time Budget:** 8h  
**Priority:** HIGH

---

### FEAT-005: Double-Fold Animated Flyout
**Status:** 🔴 NEW  
**Discovered:** 2026-01-07 1118 AM EET (MVP roadmap planning)  
**Severity:** HIGH (premium UX)  
**MVP:** 1.5

**Problem:**
- User wants premium animated UX
- 2-panel slide + flip animation
- Like luxury car configurators

**Impact:**
- Competitive differentiator
- Premium brand positioning

**Fix:**
- Implement 2-panel animation (slide + flip)
- <300ms total animation time
- Use CSS transforms (not layout changes)

**Assigned To:** CC (Sprint 2)  
**Time Budget:** 12h  
**Priority:** HIGH

---

### FEAT-006: Mobile Comparison Limit (2 Cars)
**Status:** 🔴 NEW  
**Discovered:** 2026-01-07 1118 AM EET (MVP roadmap planning)  
**Severity:** MEDIUM (mobile UX)  
**MVP:** 1.5

**Problem:**
- No limit on mobile comparisons
- Screen too small for 3+ cars

**Impact:**
- Poor mobile UX (cramped layout)

**Fix:**
- Max 2 cars on mobile
- Red warning text when limit reached
- Disable add button after 2

**Assigned To:** BB (Sprint 2)  
**Time Budget:** 3h  
**Priority:** MEDIUM

---

### FEAT-007: Desktop Comparison Limit (5 Cars)
**Status:** 🔴 NEW  
**Discovered:** 2026-01-07 1118 AM EET (MVP roadmap planning)  
**Severity:** MEDIUM (desktop UX)  
**MVP:** 1.5

**Problem:**
- No limit on desktop comparisons
- Layout breaks with 6+ cars

**Impact:**
- Poor desktop UX (horizontal scroll)

**Fix:**
- Max 5 cars on desktop
- Warning text when limit reached

**Assigned To:** BB (Sprint 2)  
**Time Budget:** 2h  
**Priority:** MEDIUM

---

### FEAT-008: Drag-Drop or Mark-and-Place
**Status:** 🔴 NEW  
**Discovered:** 2026-01-07 1118 AM EET (MVP roadmap planning)  
**Severity:** HIGH (mobile UX)  
**MVP:** 1.5

**Problem:**
- User wants one-hand operation
- Drag-drop OR mark-and-place

**Impact:**
- Better mobile UX
- Competitive advantage

**Fix:**
- Implement mark-and-place (tap to mark, tap flyout to place)
- OR: Drag-drop with scroll gesture detection

**Assigned To:** CC (Sprint 2)  
**Time Budget:** 10h  
**Priority:** HIGH

---

### FEAT-009: Replace Pill Buttons with Animated Icons
**Status:** 🔴 NEW  
**Discovered:** 2026-01-07 1118 AM EET (MVP roadmap planning)  
**Severity:** MEDIUM (visual polish)  
**MVP:** 2.0

**Problem:**
- Pill buttons = text only (no logos)
- Not premium automotive feel

**Impact:**
- Lower perceived quality
- Misses visual brand recognition opportunity

**Fix:**
- Replace with animated icons
- Brand logos (30-40% button width, partially cut off)
- Hover/tap effects

**Assigned To:** CC (Sprint 3)  
**Time Budget:** 8h  
**Priority:** MEDIUM

---

### FEAT-010: Catalog Page Redesign (Icon-First)
**Status:** 🔴 NEW  
**Discovered:** 2026-01-07 1118 AM EET (MVP roadmap planning)  
**Severity:** MEDIUM (visual polish)  
**MVP:** 2.0

**Problem:**
- Current catalog = text-heavy
- User wants icon-first approach

**Impact:**
- Not premium automotive showroom feel

**Fix:**
- Icon-first catalog page
- Brand logos prominent
- Consistent animation language (300ms ease-in-out)

**Assigned To:** CC (Sprint 3)  
**Time Budget:** 12h  
**Priority:** MEDIUM

---

### FEAT-011: Segment-Based Comparison
**Status:** 🔴 NEW  
**Discovered:** 2026-01-07 1118 AM EET (MVP roadmap planning)  
**Severity:** MEDIUM (discovery enhancement)  
**MVP:** 2.5

**Problem:**
- User wants "Find my segment" button
- Example: Q3 → show X3, GLC, XC60

**Impact:**
- Better discovery
- Cross-brand comparison

**Fix:**
- Segment detection algorithm (price + body type + features)
- "Find my segment" button on vehicle cards
- Show top 5 competitors

**Assigned To:** CC (Sprint 4)  
**Time Budget:** 16h  
**Priority:** MEDIUM

---

### FEAT-012: Cross-Brand Similarity Engine
**Status:** 🔴 NEW  
**Discovered:** 2026-01-07 1118 AM EET (MVP roadmap planning)  
**Severity:** MEDIUM (discovery enhancement)  
**MVP:** 2.5

**Problem:**
- User wants automatic competitor suggestions
- Example: luxury compact SUV → all competitors

**Impact:**
- Better discovery
- Competitive intelligence

**Fix:**
- Similarity scoring algorithm (0-100%)
- Automatic competitor suggestions
- Bilingual support (EN/AR)

**Assigned To:** CC (Sprint 4)  
**Time Budget:** 20h  
**Priority:** MEDIUM

---

## 4. LOW Priority (Backlog) 📦

### ISSUE-009: Performance Optimization Phase 1 Incomplete
**Status:** 🔴 BLOCKED (Phase 1 broke production)  
**Discovered:** 2026-01-06 (ISSUE-001)  
**Severity:** LOW (optimization deferred)

**Original Plan:**
- Task 1.1: Image optimization (fetchpriority, lazy loading) - 3 days
- Task 1.2: Lazy load FilterPanel, Footer - 4 days
- Task 1.3: Defer Sentry, analytics - 2 days
- Target: FCP 3.84s → 2.0-2.3s (40-50% improvement)

**Current State:**
- Phase 1 implemented (commits 648f31d, 2a19266)
- **Broke production** (React hooks violation)
- Must fix ISSUE-001 first, then re-evaluate Phase 1

**Next Steps:**
1. Fix ISSUE-001
2. Review Phase 1 changes (identify what's salvageable)
3. Re-implement performance gains without breaking hooks

**Assigned To:** BB (after ISSUE-001 resolved)  
**Time Budget:** TBD (re-plan after production stable)

---

### ISSUE-010: Brand Button Redesign
**Status:** 🟡 NEW  
**Discovered:** 2026-01-06 (user business discussion)  
**Severity:** LOW (design enhancement)

**Problem:**
- Brand buttons = text only (no logos)
- Not premium automotive showroom feel
- User wants large logo (30-40% of button) partially cut off

**Impact:**
- Lower perceived quality
- Misses opportunity for visual brand recognition

**Fix:**
- Right-align brand name
- Add large brand logo (30-40% of button width)
- Partially cut off logo (premium feel)
- Test with front-end LLM prompt

**Assigned To:** TBD (front-end LLM trial)  
**Time Budget:** 45 min (design + implementation)

---

## 5. RECENTLY RESOLVED (Last 7 Days) ✅

### ISSUE-011: Gray Placeholder Images (59 deleted)
**Status:** ✅ RESOLVED  
**Discovered:** 2026-01-04 (user screenshot feedback)  
**Resolved:** 2026-01-04 2018 UTC (CC comprehensive fix)  
**Severity:** CRITICAL

**Problem:**
- Gray placeholder boxes instead of vehicle images
- BMW X7, 320i showing gray placeholders
- Wrong images (Suzuki showing Kia image, VW Tiguan showing van)

**Root Cause:**
- Gray placeholder IMAGE FILES committed to Git (not NULL URLs)
- Initial diagnosis missed larger placeholders (only deleted <10KB)

**Fix:**
- Python PIL RGB analysis (detect gray dominance, not filesize)
- Deleted 59 gray placeholder files
- Set 9 wrong mappings to NULL
- Updated database records

**Outcome:**
- 0 gray placeholders remaining
- 59% coverage (242 valid images)
- 41% fallback (vintage car)

**Commits:** 648f31d, 2a19266

---

### ISSUE-012: Duplicate Year Display in Card Titles
**Status:** ✅ RESOLVED  
**Discovered:** 2026-01-06 (user screenshot feedback)  
**Resolved:** 2026-01-04 2018 UTC (CC comprehensive fix)  
**Severity:** MEDIUM

**Problem:**
- Card titles showing "Toyota Corolla 2026 2026" (year duplicated)

**Root Cause:**
- `formatVehicleTitle()` appended year without checking if already in name

**Fix:**
```typescript
const formatVehicleTitle = (name: string, year: number) => {
  const yearStr = year.toString();
  if (name.includes(yearStr)) return name; // Don't append if already present
  return `${name} ${yearStr}`;
};
```

**Location:** `src/components/VehicleCard.tsx:225`  
**Commits:** 648f31d

---

### ISSUE-013: Single-Trim Cards Showing Trim Name
**Status:** ✅ RESOLVED  
**Discovered:** 2026-01-06 (user screenshot feedback)  
**Resolved:** 2026-01-04 2018 UTC (CC comprehensive fix)  
**Severity:** LOW

**Problem:**
- Single-trim cards showed actual trim name (e.g., "GLS")
- Inconsistent with multi-trim cards (which showed "X trims")

**Fix:**
- Changed to show "1 trim" for consistency
- Arabic support: "إصدار" (single) / "إصدارات" (multi)

**Location:** `src/components/VehicleCard.tsx:235-250`  
**Commits:** 648f31d

---

## 6. RECURRING ISSUES (Pattern Recognition) 🔁

### PATTERN-001: Agents Not Using PR Scraper Outputs
**Frequency:** Every 2-3 sessions (last: 2026-01-05, 2026-01-04, 2026-01-02)  
**Severity:** PROCESS

**User's Frustration:**
> "Why are we doing the PR scraper if we're not going to scrape? We have all these review tooling and we're not going to use it - why do we have it? You catch the problems before they happen."

**Core Issue:**
- PR scraper exists and runs (CodeRabbit, Sourcery, Sonar, Snyk, Sentry)
- Outputs (MERGE_BLOCKERS.md, action rosters) not integrated into workflow
- User has to manually remember to check outputs

**Attempted Solutions:**
1. Created PR scraper script → Works, but no reminder to check output
2. Added to documentation → Passive, agents don't enforce checking

**Status:** 🔴 Still recurring

**What Would Fix This:**
- Auto-post MERGE_BLOCKERS.md summary to Slack/Discord at session start
- OR: Agent checklist: "Before accepting task, read latest MERGE_BLOCKERS.md"
- OR: GitHub Action comments on new PR with latest blockers

**Assigned To:** TBD (process automation needed)

---

### PATTERN-002: Agents Not Self-Critiquing Before Responding
**Frequency:** Daily (multiple times per session)  
**Severity:** PROCESS

**User's Frustration:**
> "Every time you respond, you have to self-critique. You're not doing that."

**Core Issue:**
- CLAUDE.md Section 1 mandates self-critique
- Agents forget or skip this step
- User has to repeatedly remind

**Attempted Solutions:**
1. Added to CLAUDE.md "Core Rules" → Still forgotten
2. Added to "Mandatory Instructions" → Still forgotten

**Status:** 🔴 Still recurring

**What Would Fix This:**
- Pre-response validation hook (like pre-commit hook)
- Python script validates output includes "Self-Critique:" section
- Blocks response submission if missing

**Assigned To:** TBD (Self-Validating Agent Response System - ISSUE-015)

---

### PATTERN-003: CLAUDE.md Timestamp Drift
**Frequency:** Every session (header not updated)  
**Severity:** DOCUMENTATION

**Problem:**
- Header shows "Last Updated: 2025-12-24" (wrong)
- Actual updates happen (content changes, new sections)
- No enforcement to update header timestamp

**Attempted Solutions:**
1. Added to "Session End Protocol" → Still forgotten
2. Added to "Housekeeping Reminder" → Still forgotten

**Status:** ✅ RESOLVED (auto-update in this session)

**What Fixed This:**
- PPLX auto-updates timestamp in every doc commit
- Timestamp format: YYYY-MM-DD HHmm Agent Model

**Assigned To:** N/A (process now enforced)

---

## APPENDIX: Issue Template

```markdown
### ISSUE-XXX: [Title]
**Status:** 🔴 NEW / 🟡 IN PROGRESS / ✅ RESOLVED / 🔵 BLOCKED  
**Discovered:** YYYY-MM-DD HHmm EET (source)  
**Severity:** CRITICAL / HIGH / MEDIUM / LOW

**Problem:**
[What's wrong, 1-3 bullets]

**Impact:**
[Why it matters, user/business impact]

**Fix:**
[What needs to be done]

**Assigned To:** Agent / TBD  
**Time Budget:** X min

**Related:**
[Links to commits, Sentry issues, PRs, etc.]
```

---

**END OF ISSUES_ROSTER.md v1.2.0**

**Maintained By:** All Agents (CC audits)  
**Update Frequency:** Real-time (add issues as discovered)  
**Next Review:** After Sprint 1 completes (BUG-005-010 resolved)

### BUG-011: Transparent Skeleton Flash on Reload
**Severity**: MEDIUM
**Status**: FIXED
**Affected**: FilterPanel, VehicleCard, CartDrawer skeletons
**Fix**: 
- CartDrawerSkeleton: Changed open={true} to open={false}
- FilterPanelSkeleton: Added visibility: hidden during SSR/hydration
- Both skeletons now properly hidden until content loads (Amazon-style)
**PR**: #45
**Date**: 2026-01-07
**Agent**: BB

### BUG-012: Tab System Misaligned with Content
**Severity**: LOW
**Status**: FIXED
**Affected**: Brand/Body/Price tabs on catalog pages
**Fix**: Wrapped Tabs in Container maxWidth="xl" to align with page content
**PR**: #45
**Date**: 2026-01-07
**Agent**: BB
