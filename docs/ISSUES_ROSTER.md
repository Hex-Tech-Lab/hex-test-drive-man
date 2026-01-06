# ISSUES ROSTER - Living Bug & Improvement Tracker

**Version:** 1.0.0  
**Last Updated:** 2026-01-06 1808 EET PPLX CS45  
**Owner:** All Agents (CC audits, others add)  
**Purpose:** Single source of truth for all bugs, improvements, and technical debt

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

### ISSUE-002: CLAUDE.md Header Outdated
**Status:** 🟡 NEW  
**Discovered:** 2026-01-06 1800 EET (this session)  
**Severity:** MEDIUM (documentation drift)

**Problem:**
- Header says "Last Updated: 2025-12-24 1756 EET" (wrong date)
- Version: 2.4.0 (should be 2.4.1 after today's updates)
- Missing today's sessions (Jan 5-6 Performance Architecture, Jan 6 Production Crisis)
- Not using proper timestamp format (should be YYYY-MM-DD HHmm Agent Model)

**Fix:**
```markdown
Version: 2.4.1 | Last Updated: 2026-01-06 1808 EET PPLX CS45
```

**Assigned To:** PPLX (after creating this file)  
**Time Budget:** 5 min

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
**Status:** 🟡 NEW  
**Discovered:** 2026-01-06 (user business discussion)  
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
- Audit font stack (check if letter-spacing applied)
- Integrate high-quality Arabic webfont
- Zero artificial letter-spacing
- Proper fallback chain

**Assigned To:** TBD (front-end LLM trial or CCW)  
**Time Budget:** 60 min (research + implementation)

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

**Status:** 🔴 Still recurring (ISSUE-002 is current instance)

**What Would Fix This:**
- Git pre-commit hook checks CLAUDE.md header
- Compares "Last Updated" to current date
- Blocks commit if outdated (or auto-updates)

**Assigned To:** TBD (automation script needed)

---

## APPENDIX: Issue Template

```markdown
### ISSUE-XXX: [Title]
**Status:** 🔴 NEW / 🟡 IN PROGRESS / ✅ RESOLVED / 🔵 BLOCKED  
**Discovered:** YYYY-MM-DD (source)  
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

**END OF ISSUES_ROSTER.md v1.0.0**

**Maintained By:** All Agents (CC audits)  
**Update Frequency:** Real-time (add issues as discovered)  
**Next Review:** After production stabilizes (ISSUE-001 resolved)
