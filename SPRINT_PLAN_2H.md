# 2-HOUR SPRINT PLAN - MVP 1.0 Critical Bugs

**Version:** 1.0.0  
**Created:** 2026-01-07 1118 AM EET | BB (Blackbox Pro)  
**Sprint Duration:** 2 hours (11:30 AM - 1:30 PM EET)  
**Agent:** BB (Blackbox)  
**Goal:** Fix 5 critical mobile UX bugs (BUG-005 to BUG-010)

---

## SPRINT OVERVIEW

### Objectives
1. Fix reservation counter stuck at 1 (BUG-005)
2. Fix retry button non-functional (BUG-006)
3. Fix filters expanded by default (BUG-007)
4. Fix drawer visibility on reload (BUG-008)
5. Implement prefetch for instant navigation (BUG-009)
6. Remove 24/7 support button (BUG-010)

### Success Criteria
- ✅ All 6 bugs resolved
- ✅ No new bugs introduced
- ✅ All tests passing (`pnpm lint && pnpm build`)
- ✅ Production deployment successful
- ✅ User verification on mobile device

---

## HOUR 1: 11:30 AM - 12:30 PM EET

### Task 1.1: Fix BUG-005 (Counter Stuck at 1)
**Duration:** 20 minutes (11:30 AM - 11:50 AM)  
**Priority:** CRITICAL  
**Estimated Effort:** 2h → Timeboxed to 20 min

**Steps:**
1. Read `src/contexts/ReservationContext.tsx` (or equivalent state management)
2. Identify counter decrement logic
3. Fix: Remove `Math.max(1, count - 1)` constraint, use `Math.max(0, count - 1)`
4. Test: Add 2 reservations → remove both → verify counter shows 0
5. Commit: `fix(reservation): counter decrements to 0 when empty (BUG-005)`

**Files to Modify:**
- `src/contexts/ReservationContext.tsx` (or `src/components/ReservationDrawer.tsx`)

**Verification:**
```bash
pnpm dev
# Test: Add 2 reservations → remove both → counter should show 0
```

---

### Task 1.2: Fix BUG-006 (Retry Button Not Working)
**Duration:** 25 minutes (11:50 AM - 12:15 PM)  
**Priority:** HIGH  
**Estimated Effort:** 2h → Timeboxed to 25 min

**Steps:**
1. Read `src/components/ErrorBoundary.tsx` (or `src/app/error.tsx`)
2. Identify retry button onClick handler
3. Fix: Wire handler to `router.refresh()` or `resetErrorBoundary()`
4. Test: Simulate network error → click retry → verify refetch
5. Commit: `fix(error): retry button now refetches data (BUG-006)`

**Files to Modify:**
- `src/components/ErrorBoundary.tsx` OR `src/app/[locale]/error.tsx`

**Verification:**
```bash
pnpm dev
# Test: Disable network → trigger error → click retry → verify refetch
```

---

### Task 1.3: Fix BUG-007 (Filters Expanded by Default)
**Duration:** 15 minutes (12:15 PM - 12:30 PM)  
**Priority:** HIGH  
**Estimated Effort:** 1h → Timeboxed to 15 min

**Steps:**
1. Read `src/components/FilterPanel.tsx`
2. Identify `useState` for expanded state
3. Fix: `useState(() => !isMobile)` (collapsed on mobile, expanded on desktop)
4. Test: Load page on mobile → verify filters collapsed
5. Commit: `fix(filters): collapsed by default on mobile (BUG-007)`

**Files to Modify:**
- `src/components/FilterPanel.tsx`

**Verification:**
```bash
pnpm dev
# Test: Load page on mobile (Chrome DevTools) → filters should be collapsed
```

---

## HOUR 2: 12:30 PM - 1:30 PM EET

### Task 2.1: Fix BUG-008 (Drawer Visibility on Reload)
**Duration:** 20 minutes (12:30 PM - 12:50 PM)  
**Priority:** MEDIUM  
**Estimated Effort:** 1.5h → Timeboxed to 20 min

**Steps:**
1. Read `src/components/ReservationDrawer.tsx` (or comparison drawer)
2. Identify localStorage persistence logic
3. Fix: Remove `localStorage.getItem('drawerOpen')` on mount
4. Test: Open drawer → reload page → verify drawer closed
5. Commit: `fix(drawer): no longer appears on page reload (BUG-008)`

**Files to Modify:**
- `src/components/ReservationDrawer.tsx` OR `src/components/ComparisonDrawer.tsx`

**Verification:**
```bash
pnpm dev
# Test: Open drawer → reload page → drawer should be closed
```

---

### Task 2.2: Fix BUG-009 (Slow Navigation - Prefetch)
**Duration:** 30 minutes (12:50 PM - 1:20 PM)  
**Priority:** HIGH  
**Estimated Effort:** 3h → Timeboxed to 30 min

**Steps:**
1. Read `src/app/[locale]/page.tsx` (catalog page)
2. Add prefetch logic for adjacent pages + comparison route
3. Use Next.js `prefetch()` or `<Link prefetch>` prop
4. Test: Navigate between pages → verify <200ms perceived delay
5. Commit: `feat(navigation): prefetch adjacent pages for instant feel (BUG-009)`

**Files to Modify:**
- `src/app/[locale]/page.tsx`

**Verification:**
```bash
pnpm dev
# Test: Navigate catalog → comparison → back → verify instant feel
```

**Implementation:**
```typescript
import { prefetch } from 'next/navigation';

useEffect(() => {
  // Prefetch adjacent pages
  prefetch(`/${locale}?page=${currentPage + 1}`);
  if (currentPage > 1) prefetch(`/${locale}?page=${currentPage - 1}`);
  
  // Prefetch comparison route
  prefetch(`/${locale}/compare`);
}, [currentPage, locale]);
```

---

### Task 2.3: Fix BUG-010 (Remove 24/7 Support Button)
**Duration:** 10 minutes (1:20 PM - 1:30 PM)  
**Priority:** LOW  
**Estimated Effort:** 0.5h → Timeboxed to 10 min

**Steps:**
1. Search codebase for "24/7" or "support" text
2. Identify button/link component
3. Fix: Remove button OR replace with "Contact Us" link
4. Test: Verify button no longer visible
5. Commit: `fix(ui): remove 24/7 support button (no service exists) (BUG-010)`

**Files to Modify:**
- `src/components/Header.tsx` OR `src/components/Footer.tsx` (likely location)

**Verification:**
```bash
pnpm dev
# Test: Check header/footer → 24/7 support button should be gone
```

---

## FINAL VERIFICATION (1:30 PM - 1:40 PM)

### Pre-Deployment Checklist
- [ ] All 6 bugs fixed (BUG-005 to BUG-010)
- [ ] `pnpm lint` passes (0 errors)
- [ ] `pnpm build` succeeds
- [ ] Manual testing on mobile device (Chrome DevTools)
- [ ] Git commits follow convention (`fix(scope): description`)
- [ ] Branch pushed to GitHub: `bb/mvp1.0-critical-bugs-sprint1`
- [ ] PR created with title: "fix(mvp1.0): resolve 6 critical mobile UX bugs (BUG-005 to BUG-010)"

### Deployment Steps
```bash
# 1. Verify all changes committed
git status

# 2. Run quality gates
pnpm lint
pnpm build

# 3. Push to GitHub
git checkout -b bb/mvp1.0-critical-bugs-sprint1
git push -u origin bb/mvp1.0-critical-bugs-sprint1

# 4. Create PR
gh pr create --base main --head bb/mvp1.0-critical-bugs-sprint1 \
  --title "fix(mvp1.0): resolve 6 critical mobile UX bugs (BUG-005 to BUG-010)" \
  --body "Fixes BUG-005 to BUG-010 from mobile review session. See SPRINT_PLAN_2H.md for details."

# 5. Wait for CI/CD (CodeRabbit, Sourcery, Sonar, Snyk)
# 6. Merge after CC approval
```

---

## RISK MITIGATION

### Potential Blockers
1. **Prefetch API changes in Next.js 15**
   - Mitigation: Use `<Link prefetch>` prop instead of `prefetch()` function
   - Fallback: Implement manual preload via `<link rel="prefetch">`

2. **Counter logic tied to complex state**
   - Mitigation: Isolate counter state, use separate `useReducer`
   - Fallback: Defer to Hour 2 if >20 min

3. **Drawer state persisted in multiple places**
   - Mitigation: Search codebase for all `localStorage` references
   - Fallback: Remove all drawer-related localStorage keys

### Time Buffer
- **Planned:** 2 hours (120 min)
- **Allocated:** 120 min (6 tasks)
- **Buffer:** 0 min (tight schedule)
- **Contingency:** If any task exceeds timebox by >50%, defer to next sprint

---

## SUCCESS METRICS

### Quantitative
- ✅ 6/6 bugs resolved (100% completion)
- ✅ 0 new bugs introduced
- ✅ Navigation delay: 0.5-1s → <200ms (60-80% improvement)
- ✅ Mobile filter UX: 100% collapsed by default
- ✅ Counter accuracy: 100% (shows 0 when empty)

### Qualitative
- ✅ User feedback: "Navigation feels instant"
- ✅ User feedback: "Filters no longer block content"
- ✅ User feedback: "Counter now makes sense"
- ✅ User feedback: "Retry button works"

---

## POST-SPRINT ACTIONS

### Documentation Updates
1. Update `docs/PERFORMANCE_LOG.md` with sprint results
2. Update `BLACKBOX.md` Section 5 (mark BUG-005 to BUG-010 complete)
3. Update `docs/ISSUES_ROSTER.md` (change status to ✅ RESOLVED)
4. Update `MVP_ROADMAP.md` (mark MVP 1.0 tasks complete)

### User Communication
- Post sprint summary to Slack/Discord (if configured)
- Request user verification on production mobile device
- Schedule follow-up: MVP 1.5 sprint planning (double-fold flyout)

---

**END OF SPRINT_PLAN_2H.md v1.0.0**

**Maintained By:** BB (Blackbox)  
**Next Sprint:** MVP 1.5 (Double-Fold Flyout) - Week 3-4, Jan 2026  
**Sprint Retrospective:** After user verification (2026-01-07 2:00 PM EET)
