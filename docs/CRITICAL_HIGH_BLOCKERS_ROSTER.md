# Critical, High-Impact, and Potential Blockers Roster

**Generated**: 2025-12-23 02:00 UTC
**Agent**: CC (Claude Code)
**Sources**: PR_ISSUES_CONSOLIDATED.md (17 issues), ACTION_ITEMS_DEC23.md (12 items), MVP_ROADMAP.md, LOCALE_ROUTING_SPEC.md, IMAGE_COVERAGE_REPORT_DEC23.md
**Scope**: All critical/high-impact/blocker issues EXCEPT credential-related security items (deferred to post-MVP 3.x)

---

## Overview

**Total Issues in Roster**: 18
- **Critical**: 5 issues (breaks flows, data correctness, user trust)
- **High Impact**: 9 issues (strong UX/quality/performance wins)
- **Potential Blockers**: 4 issues (could block future MVP stages)

**Excluded (Deferred - Credentials)**:
- Issue #1 (PR_ISSUES_CONSOLIDATED.md): SonarCloud E rating - hardcoded credentials in audit script
  - **Rationale**: Per user directive, all credential-related security work deferred to post-MVP 3.x
  - **Status**: Tagged as "Deferred - Credentials (Post-MVP 3.x)"

---

## CRITICAL

Issues that break user flows, data correctness, or trust. **Must be fixed for MVP 1.0 completion.**

### C1. 370 vs 409 Vehicle Display Discrepancy
**ID**: PR_ISSUES #2, ACTION_ITEMS #1
**Source**: ACTION_ITEMS_DEC23.md, PR #21 findings
**Category**: UX / Data Quality
**MVP Phase**: MVP 1.0 (Blocking completion)
**Priority**: P0
**Owner**: BB (Data/UI)

**Description**: Catalog displays only 370 vehicles instead of all 409 in database. 39 vehicles missing from user view despite removal of 50-vehicle limit (commit a37f3d3). Likely hidden filter in repository or page component.

**Impact**: Users see incomplete catalog, missing 9.5% of available vehicles. Damages trust in platform completeness.

**Prompt for BB**:
> Debug 370 vs 409 vehicle display discrepancy. Steps: (1) Query Supabase REST API to confirm 409 vehicle_trims exist. (2) Check src/repositories/vehicleRepository.ts for any WHERE clauses, active/published/hidden filters. (3) Inspect src/app/[locale]/page.tsx for client-side filtering. (4) Add console.log of vehicles.length before/after all filters. (5) Identify and remove the hidden filter. (6) Verify all 409 vehicles display in catalog. Report findings with fix. Branch: bb/mvp1-ui-fixes

**Status**: Code Complete (Verification Pending)

---

### C2. Search Functionality Returns Wrong Results
**ID**: PR_ISSUES #7, ACTION_ITEMS #3
**Source**: ACTION_ITEMS_DEC23.md user report
**Category**: UX / Quality
**MVP Phase**: MVP 1.0 (Blocking completion)
**Priority**: P1
**Owner**: CC (Logic + Verification)

**Description**: Typing 'p' in search returns Nissan Sunny instead of Porsche/Peugeot. Search logic broken - case sensitivity or partial match issue in FilterPanel.tsx or page.tsx.

**Impact**: Users cannot find vehicles by brand/model name. Destroys search functionality credibility.

**Prompt for CC**:
> Fix search functionality returning incorrect results. Issue: typing 'p' returns Nissan Sunny, not Porsche/Peugeot. (1) Inspect filter logic in src/components/FilterPanel.tsx and src/app/[locale]/page.tsx. (2) Debug: toLowerCase(), includes(), startsWith() usage. (3) Test edge cases: single letters (a-z), numbers, Arabic text, special chars. (4) Add search term highlighting for matched text. (5) Verify 'p' matches Porsche/Peugeot, not Nissan. Commit fix with test results. Branch: cc/mvp1-criticals

**Status**: Unstarted

---

### C3. Locale Persistence Enforcement Audit
**ID**: PR_ISSUES #9 (partial fix), LOCALE_ROUTING_SPEC.md
**Source**: Recent commits 300ddcc, 905c061; LOCALE_ROUTING_SPEC.md
**Category**: Performance / UX
**MVP Phase**: MVP 1.0 (Stabilization complete)
**Priority**: P2 (audit only, spec exists)
**Owner**: CC

**Description**: Locale preservation spec defined in LOCALE_ROUTING_SPEC.md. Two violations fixed (VehicleCard.tsx, verify/page.tsx). Need comprehensive audit of ALL router.push() calls to ensure 100% compliance with `/${locale}/...` pattern.

**Impact**: Unaudited routes may still flip locale (EN↔AR) unexpectedly during navigation. Damages user experience.

**Prompt for CC**:
> Audit all router.push() calls for locale preservation compliance. (1) Grep codebase for 'router.push' pattern. (2) Verify each call includes `/${locale}/...` prefix per LOCALE_ROUTING_SPEC.md Rule 2. (3) Flag any violations. (4) Check for hardcoded '/en/' or '/ar/' paths (forbidden). (5) Verify no window.location.reload() after router.push(). (6) Create audit report: compliant count, violation list with file:line. Fix violations or document why they're safe exceptions.

**Status**: Unstarted (spec complete, enforcement audit needed)

---

### C4. Price Slider Position Bug
**ID**: ACTION_ITEMS #8
**Source**: ACTION_ITEMS_DEC23.md visual bug report
**Category**: UX / Visual
**MVP Phase**: MVP 1.0 (Polish)
**Priority**: P2
**Owner**: BB (UI Component)

**Description**: MUI Slider thumb stuck at ~40% position when max=3.9M EGP, despite correct value selection. Large number range (0-3.9M) breaks MUI Slider visual calculation.

**Impact**: Users see incorrect visual feedback on price filter, confusion about selected range.

**Prompt for BB**:
> Fix price slider visual position bug. Issue: thumb stuck at 40% when max=3.9M EGP. (1) Test FilterPanel.tsx Slider with different max values (1M, 5M, 10M, 20M). (2) Check MUI Slider props: step, scale, marks, valueLabelDisplay. (3) Consider logarithmic scale for large ranges (scale="log" or custom scale function). (4) Verify thumb position matches selected value across full range. (5) Test on Chrome/Firefox/Safari. Commit fix with before/after screenshots. Branch: bb/mvp1-ui-fixes

**Status**: Code Complete (Verification Pending)

---

### C5. Language Reload Performance Issue
**ID**: ACTION_ITEMS #9
**Source**: ACTION_ITEMS_DEC23.md, LOCALE_ROUTING_SPEC.md Rule 4
**Category**: Performance / UX
**MVP Phase**: MVP 1.0 (Optimization)
**Priority**: P2
**Owner**: CC

**Description**: Page performs full reload on language switch instead of client-side transition. LOCALE_ROUTING_SPEC.md Rule 4 forbids window.location.reload() after router.push(). Header.tsx language switcher may violate this rule.

**Impact**: Slow language switching (2-3s full reload vs <500ms client-side). Poor UX, wasted bandwidth.

**Prompt for CC**:
> Eliminate full page reload on language switch. (1) Inspect src/components/Header.tsx language switcher. (2) Check for window.location.reload() calls (forbidden per LOCALE_ROUTING_SPEC.md Rule 4). (3) Verify router.push() handles locale change without reload. (4) Test: switch EN→AR→EN, measure time with DevTools Network tab. (5) Target: <500ms client-side transition (no full reload). (6) Ensure RTL/LTR switch still works correctly. Commit fix with performance comparison.

**Status**: Unstarted

---

## HIGH IMPACT

Strong UX/quality/performance wins that materially affect demo but are not outright breakages. **Target for MVP 1.0-1.1.**

### H1. Hero Image Physical Coverage (62.3% Missing)
**ID**: PR_ISSUES #3, ACTION_ITEMS #2, IMAGE_COVERAGE_REPORT_DEC23.md
**Source**: IMAGE_COVERAGE_REPORT_DEC23.md
**Category**: UX / Visual Quality
**MVP Phase**: MVP 1.0 (Stabilization) → MVP 1.1 (Completion)
**Priority**: P0 (user-facing)
**Owner**: GC

**Description**: Database 100% coverage (199/199 models have hero_image_url), but only 75 physical images exist. 124 models (62.3%) missing actual image files, showing placeholder. Quality standard: BMW iX1 2024 (centered, 3/4 angle, 4:3 aspect, high quality).

**Impact**: Demo shows majority placeholders instead of actual vehicles. Undermines professionalism.

**Prompt for GC**:
> Complete hero image physical coverage. Status: 199/199 database URLs (100%), 75/199 physical files (37.7%). Phase 1: Download 124 missing images using Unsplash API (same method as BMW iX1). Quality: centered, 3/4 angle, 4:3 aspect, 1200x900+ resolution. Phase 2: Manual map 41 unmatched files (see IMAGE_COVERAGE_REPORT_DEC23.md lines 91-141) to correct model IDs via Supabase REST API. Phase 3: Verify all 199 images load correctly with fallback to placeholder.webp. Target: 100% physical coverage by Dec 24.

**Status**: Unstarted (database complete, physical pending)

---

### H2. Docstring Coverage Enforcement (Recurring Pattern)
**ID**: PR_ISSUES #13
**Source**: PRs #18 (50%), #19 (60%), #22 (33%) - CodeRabbit
**Category**: Quality / Documentation
**MVP Phase**: MVP 1.5 (Quality Standards)
**Priority**: P1
**Owner**: ALL

**Description**: Declining docstring coverage trend across 3 recent PRs (50%→60%→33%, target 80%). No enforcement mechanism. CodeRabbit flags every PR but coverage worsens.

**Impact**: Maintenance difficulty increases, onboarding friction for new developers, technical debt accumulates.

**Prompt for ALL**:
> Add JSDoc enforcement to prevent docstring coverage decline. (1) Install: pnpm add -D eslint-plugin-jsdoc. (2) Configure .eslintrc.js with jsdoc/require-jsdoc rule (warn level for FunctionDeclaration, ClassDeclaration, MethodDefinition). (3) Create .husky/pre-commit hook to check coverage: run 'pnpm run check:docstrings', parse percentage, exit 1 if <80%. (4) Add example docstrings matching project style (see existing TypeScript files). (5) Test on 3 files: apply plugin, verify warnings appear, add docstrings, verify warnings clear. (6) Document in CONTRIBUTING.md. Target: block commits with <80% coverage.

**Status**: Unstarted

---

### H3. PR Title Validation (DX)
**ID**: PR_ISSUES #14
**Source**: PR #19 CodeRabbit warning
**Category**: DX (Developer Experience)
**MVP Phase**: MVP 1.5 (DX Improvements)
**Priority**: P2
**Owner**: CC

**Description**: PR #19 titled "fix(sms): sender ID capitalization" contained major infrastructure changes (Supabase migrations, OTP flow, repository refactoring). CodeRabbit flagged title/scope mismatch but no prevention mechanism exists.

**Impact**: Misleads reviewers, breaks CI/CD assumptions (hotfix vs breaking change), inaccurate release notes.

**Prompt for CC**:
> Create GitHub Action to validate PR titles match conventional commits and scope. (1) Create .github/workflows/pr-title-validation.yml. (2) Check title format: (feat|fix|refactor|docs|chore)(scope): description. (3) Warn if scope doesn't match changed files (e.g., 'feat(booking)' must touch src/app/[locale]/bookings/ or related). (4) Fail if title is generic ("Update files", "Fix bug"). (5) Add CONTRIBUTING.md section on PR title best practices with examples. (6) Test on 3 sample PRs. Deploy action, verify it runs on new PRs.

**Status**: Unstarted

---

### H4. SQL Parsing Robustness (Audit Script)
**ID**: PR_ISSUES #6
**Source**: PR #21 CodeRabbit review
**Category**: Quality / Code Quality
**MVP Phase**: MVP 1.5 (Code Quality)
**Priority**: P1
**Owner**: CC

**Description**: Audit script (scripts/complete_vehicle_image_coverage.py) uses naive line.count('UPDATE models') for counting SQL statements. Misses multiline statements, counts commented-out SQL, matches quoted strings.

**Impact**: Inaccurate audit reports, false positives/negatives in change detection.

**Prompt for CC**:
> Improve SQL UPDATE statement counting in scripts/complete_vehicle_image_coverage.py. (1) Add regex-based parser to remove SQL comments (-- and /* */). (2) Strip quoted strings ('...' and "...") to avoid false matches. (3) Use regex pattern r'\bUPDATE\s+models\s+SET\b' with word boundaries. (4) Handle multiline statements correctly. (5) Add unit test with examples: commented SQL, multiline, quoted strings. (6) Verify count accuracy on existing migration files. Target: 100% accuracy vs manual count.

**Status**: Unstarted

---

### H5. Sort Dropdown Implementation
**ID**: ACTION_ITEMS #4
**Source**: ACTION_ITEMS_DEC23.md UX enhancement
**Category**: UX
**MVP Phase**: MVP 1.1 (UX Polish)
**Priority**: P1
**Owner**: GC

**Description**: No sort functionality for catalog. Users cannot sort by price (low→high, high→low), year (newest→oldest), brand (A-Z), or category.

**Impact**: Poor UX for browsing 409 vehicles. Users must scroll/search without logical ordering.

**Prompt for GC**:
> Implement sort dropdown for catalog. (1) Add MUI Select component to src/components/FilterPanel.tsx or create new SortDropdown.tsx. (2) Options: Price Low→High, Price High→Low, Year Newest→Oldest, Brand A-Z, Category. (3) Store selection in localStorage (key: 'catalog_sort'). (4) Apply sort to vehicles array before display. (5) Support Arabic RTL (reverse arrow icons). (6) Test all sort options with 409 vehicles. (7) Verify persistence across page reloads. Commit with screenshot of dropdown.

**Status**: Code Complete (Verification Pending)

---

### H6. Grid Size Toggle
**ID**: ACTION_ITEMS #5
**Source**: ACTION_ITEMS_DEC23.md UX enhancement
**Category**: UX
**MVP Phase**: MVP 1.1 (UX Polish)
**Priority**: P1
**Owner**: GC

**Description**: Fixed 3-column grid on desktop. No user control over card density (some prefer compact 5-col, others prefer spacious 3-col).

**Impact**: Suboptimal UX for different screen sizes and user preferences.

**Prompt for GC**:
> Add grid size toggle for catalog. (1) Add MUI IconButton group to catalog header in src/app/[locale]/page.tsx. (2) Icons: ViewModule (3-col), ViewCompact (4-col), ViewQuilt (5-col) from @mui/icons-material. (3) Responsive: Mobile 1-col (always), Tablet 2-3 cols, Desktop 3-5 cols (user choice). (4) Store selection in localStorage (key: 'catalog_grid_size'). (5) Update Grid xs/sm/md/lg props dynamically. (6) Test on 1920px, 1366px, 768px viewports. Commit with demo GIF.

**Status**: Code Complete (Verification Pending)

---

### H7. Brand Logo Placeholder
**ID**: ACTION_ITEMS #6
**Source**: ACTION_ITEMS_DEC23.md polish
**Category**: UX / Visual
**MVP Phase**: MVP 1.1 (Polish)
**Priority**: P2
**Owner**: GC

**Description**: When brand logo missing (logo_url is null), component shows nothing or broken image icon. Should show brand name initials in styled circle.

**Impact**: Visual inconsistency, poor UX for brands without logos.

**Prompt for GC**:
> Add brand logo placeholder fallback in src/components/BrandLogo.tsx. (1) Check if logo_url is null or onError triggered. (2) Show brand name initials in MUI Avatar (first 1-2 letters, uppercase). (3) Style: 2-3x current logo size, white rounded rectangle background, brand color border (if available). (4) Font: 18-24px bold, centered. (5) Test on brands without logos (check Supabase for NULL logo_url). (6) Verify fallback triggers automatically. Commit with before/after comparison.

**Status**: Planned

---

### H8. Accordion Filters (Mobile UX)
**ID**: ACTION_ITEMS #7
**Source**: ACTION_ITEMS_DEC23.md UX enhancement
**Category**: UX
**MVP Phase**: MVP 1.1 (UX Polish)
**Priority**: P2
**Owner**: GC

**Description**: FilterPanel shows all sections expanded (Brands, Categories, Price). On mobile, takes excessive vertical space, forces scrolling past filters to see vehicles.

**Impact**: Poor mobile UX, filter panel dominates screen, vehicles hidden.

**Prompt for GC**:
> Refactor FilterPanel to use MUI Accordion for collapsible sections. (1) Wrap Brands, Categories, Price in separate MUI Accordion components in src/components/FilterPanel.tsx. (2) Default state: Brands expanded, Categories/Price collapsed. (3) Save expansion state to localStorage (key: 'filter_accordion_state'). (4) Ensure RTL support (Arabic collapse icons flip correctly). (5) Test on mobile (375px width): verify filters collapse, vehicles visible without scroll. (6) Verify desktop layout unchanged. Commit with mobile screenshot comparison.

**Status**: Code Complete (Verification Pending)

---

### H9. Comparison Page Images
**ID**: ACTION_ITEMS #10
**Source**: ACTION_ITEMS_DEC23.md feature parity
**Category**: UX / Feature
**MVP Phase**: MVP 1.1 (Feature Parity)
**Priority**: P2
**Owner**: GC

**Description**: Comparison page (src/app/[locale]/compare/page.tsx) not loading images despite catalog images working correctly. Missing same image logic from VehicleCard.tsx (getVehicleImage helper, onError fallback).

**Impact**: Comparison feature incomplete, users cannot visually compare vehicles.

**Prompt for GC**:
> Fix comparison page image loading. (1) Inspect src/app/[locale]/compare/page.tsx image rendering. (2) Apply same logic as VehicleCard.tsx: use getVehicleImage() from lib/imageHelper.ts. (3) Add onError handler with fallback to placeholder.webp. (4) Verify CardMedia component has correct src and onError props. (5) Test with 3-vehicle comparison (mix of vehicles with/without images). (6) Verify fallback works for missing images. Commit fix with comparison page screenshot.

**Status**: Unstarted

---

## POTENTIAL BLOCKERS

Items that, if left unfixed, could block future MVP stages, integrations, or regulatory/security expectations.

### B1. Booking Migration Not Applied (MVP 1.0 Blocker)
**ID**: PR_ISSUES #8
**Source**: PR_ISSUES_CONSOLIDATED.md, supabase/migrations/20251211_booking_schema.sql
**Category**: Technical Debt / Infrastructure
**MVP Phase**: MVP 1.0 (Blocking completion)
**Priority**: P2
**Owner**: CCW

**Description**: Migration file supabase/migrations/20251211_booking_schema.sql exists (bookings + sms_verifications tables, RLS policies) but NOT applied to production. Booking system using in-memory storage, data lost on server restart.

**Impact**: Bookings lost on deployment/restart. Cannot demo persistent booking flow. Blocks MVP 1.0 completion.

**Prompt for CCW**:
> Apply booking migration to Supabase production. (1) Connect to Supabase: psql $SUPABASE_URL. (2) Execute migration: \i supabase/migrations/20251211_booking_schema.sql. (3) Verify tables created: \dt bookings, \dt sms_verifications. (4) Add missing RLS to sms_verifications: ALTER TABLE sms_verifications ENABLE ROW LEVEL SECURITY; CREATE POLICY ... (see PR_ISSUES_CONSOLIDATED.md #8 lines 310-320). (5) Verify via REST API: curl -H "apikey: $ANON_KEY" "$SUPABASE_URL/rest/v1/bookings?select=count". (6) Migrate bookingRepository.ts from in-memory to Supabase queries. (7) Test booking flow end-to-end. Document completion in PR.

**Status**: Unstarted

---

### B2. Filesystem Path Assumptions (Cross-Platform)
**ID**: PR_ISSUES #4
**Source**: PR #21 CodeRabbit review
**Category**: Code Quality / Portability
**MVP Phase**: MVP 1.5 (Code Quality)
**Priority**: P1
**Owner**: CC

**Description**: Audit script (scripts/complete_vehicle_image_coverage.py) uses hardcoded paths like "public/images/vehicles/hero/" (string literals, not pathlib). Breaks on Windows (\\ vs /), non-standard project layouts.

**Impact**: Script fails on Windows developer machines, blocks contributions, deployment issues on Windows servers.

**Prompt for CC**:
> Fix filesystem path assumptions in scripts/complete_vehicle_image_coverage.py for cross-platform compatibility. (1) Replace string paths with pathlib.Path. (2) Use PROJECT_ROOT = Path(__file__).parent.parent for relative pathing. (3) Construct paths: HERO_DIR = PROJECT_ROOT / "public" / "images" / "vehicles" / "hero". (4) Add validation: if not HERO_DIR.exists(): raise FileNotFoundError(f"...{HERO_DIR}"). (5) Test on Linux and Windows (WSL). (6) Verify script runs without path errors. Commit fix with test results from both platforms.

**Status**: Unstarted

---

### B3. HTTP Error Handling (Production Reliability)
**ID**: PR_ISSUES #5
**Source**: PR #21 CodeRabbit review
**Category**: Reliability / Quality
**MVP Phase**: MVP 1.5 (Production Readiness)
**Priority**: P1
**Owner**: CC

**Description**: Audit script lacks robust error handling for HTTP requests to Supabase REST API. No rate limit handling (429), non-JSON response crashes, network failures unhandled.

**Impact**: Script crashes on transient errors, cannot recover, blocks automated workflows, unreliable in production.

**Prompt for CC**:
> Add robust HTTP error handling to query_supabase() in scripts/complete_vehicle_image_coverage.py. (1) Wrap urllib.request.urlopen in try/except. (2) Handle rate limits: if response.status == 429, read Retry-After header, sleep, retry recursively. (3) Validate Content-Type is application/json before parsing. (4) Catch HTTPError, JSONDecodeError, URLError separately with specific error messages. (5) Return None on errors instead of crashing. (6) Log all errors to console with context. (7) Test: mock 429 response, non-JSON response, network timeout. Commit with error handling test results.

**Status**: Unstarted

---

### B4. Locale Routing Canonical Rules Documentation Gap
**ID**: PR_ISSUES #9 (partially addressed), LOCALE_ROUTING_SPEC.md
**Source**: LOCALE_ROUTING_SPEC.md (spec exists), CLAUDE.md
**Category**: Documentation / DX
**MVP Phase**: MVP 1.0 (Stabilization) → MVP 1.5 (Enforcement)
**Priority**: P2
**Owner**: CC

**Description**: LOCALE_ROUTING_SPEC.md defines canonical rules (380 lines, comprehensive). Two violations fixed (commits 300ddcc, 905c061). However, spec is NOT referenced in CONTRIBUTING.md, no automated validation, developers may violate unknowingly.

**Impact**: Future PRs may introduce locale bugs. Spec unused despite investment. Blocks scaling team.

**Prompt for CC**:
> Promote LOCALE_ROUTING_SPEC.md to enforced standard. (1) Add CONTRIBUTING.md section referencing LOCALE_ROUTING_SPEC.md with key rules summary. (2) Create ESLint rule to detect router.push() calls without locale parameter (warn on missing /${locale}/). (3) Add to .github/workflows/pr-checks.yml: grep for router.push, flag violations. (4) Update PR template to include locale routing checklist. (5) Document in CLAUDE.md "Open Items" that spec is now enforced. (6) Test: create sample PR with locale violation, verify CI flags it. Commit enforcement tooling.

**Status**: Unstarted (spec complete, enforcement pending)

---

## DEFERRED ITEMS (Excluded from Roster)

### Credentials-Related Security Work
**Per user directive: ALL credential-related work deferred to post-MVP 3.x**

**D1. SonarCloud E Security Rating**
**ID**: PR_ISSUES_CONSOLIDATED.md #1
**Source**: PR #21 SonarCloud scan
**Category**: Security
**Status**: Deferred - Credentials (Post-MVP 3.x)

**Problem**: Hardcoded SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in scripts/complete_vehicle_image_coverage.py lines ~10.

**Deferral Rationale**: Fix requires moving credentials to environment variables. Per user directive, all credential handling (rotation, env var migration, secrets removal) deferred until after MVP 3.0 security hardening phase.

**Future Action** (MVP 3.0+): Replace with os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_ROLE_KEY') with validation.

---

## SELF-CRITIQUE

### Where might classification be wrong or too aggressive?

1. **C3 (Locale Persistence Audit) - Borderline Critical/High Impact**
   - **Classification**: Critical (as "enforcement audit")
   - **Concern**: Spec exists, 2 violations already fixed. Remaining violations unknown. May be 0 violations (audit finds nothing).
   - **Counter-argument**: Unaudited code = potential bugs. Locale flipping damages UX significantly. Audit is preventive, not reactive.
   - **Decision**: Keep as Critical but note audit may find 0 issues (best case).

2. **C4 (Price Slider Bug) - Borderline Critical/High Impact**
   - **Classification**: Critical (visual bug affecting usability)
   - **Concern**: Visual-only bug, filter still works functionally (value is correct, only thumb position wrong).
   - **Counter-argument**: Users rely on visual feedback. Confusing visuals undermine trust in filter accuracy.
   - **Decision**: Keep as Critical but acknowledge it's UX-critical, not data-critical.

3. **H1 (Image Coverage) - Borderline Critical/High Impact**
   - **Classification**: High Impact (62.3% missing)
   - **Concern**: Demo with 62.3% placeholders looks unprofessional, could be Critical for demo success.
   - **Counter-argument**: Fallback system works (placeholder.webp), catalog functional. Images enhance UX but don't break flows.
   - **Decision**: Keep as High Impact. If user feedback elevates priority, can move to Critical.

### Which 2-3 issues are borderline between Critical and High Impact?

1. **C3 vs H1**: Locale audit (spec exists, violations unknown) vs Image coverage (visible UX impact, 62.3% missing)
2. **C4 vs H4**: Price slider visual bug (confusing but functional) vs SQL parsing quality (accuracy in audit reports)
3. **C5 vs H9**: Language reload performance (slow but works) vs Comparison images (feature incomplete)

**Recommendation**: User should review C3, C4, C5 classifications and confirm if any should be downgraded to High Impact.

### Are there any items that look big but are actually already addressed in code?

1. **Issue #15, #16, #17 (PR_ISSUES)**: Server-side idempotency, Health check endpoint, E2E testing framework
   - **Status**: Already implemented in PR #22 (merged)
   - **Action**: Correctly tagged as "Reference" patterns, excluded from roster buckets (not actionable).

2. **Locale Persistence (Partial)**:
   - **Status**: 2 violations fixed (commits 300ddcc, 905c061), spec documented (LOCALE_ROUTING_SPEC.md)
   - **Remaining**: Audit needed to confirm 100% compliance.
   - **Action**: Included as C3 (audit task), not full re-implementation.

3. **Booking Schema (File Exists)**:
   - **Status**: Migration file created (supabase/migrations/20251211_booking_schema.sql), NOT applied to production.
   - **Action**: Included as B1 (apply migration), not schema design.

### Are we accidentally pulling in any credential work despite deferral rule?

**No credential work included in roster buckets.**

**Verification**:
- **D1 (SonarCloud E rating)**: Explicitly excluded, tagged as "Deferred - Credentials (Post-MVP 3.x)"
- **No env var work**: No tasks involve .env file creation, credential rotation, or secrets removal
- **All 18 roster issues**: None require touching credentials, API keys, or secret management

**Compliance**: ✅ 100% adherence to user directive (credentials deferred to post-MVP 3.x)

---

## MAPPING TO MVP PHASES

### MVP 1.0 (Critical - Must Complete)
**Deadline**: December 23-24, 2025
- C1: 370 vs 409 vehicle discrepancy
- C2: Search functionality fix
- C4: Price slider position bug
- C5: Language reload fix
- B1: Booking migration application

**Blockers Cleared**: 5 critical issues resolved = MVP 1.0 complete

---

### MVP 1.1 (High Impact - UX Polish)
**Deadline**: December 25-26, 2025
- H1: Hero image coverage (124 downloads)
- H5: Sort dropdown
- H6: Grid size toggle
- H7: Brand logo placeholder
- H8: Accordion filters
- H9: Comparison page images

**Expected Outcome**: 6 UX enhancements = demo-ready polish

---

### MVP 1.5 (Quality & DX)
**Target**: December 27-30, 2025
- C3: Locale persistence audit (enforcement)
- H2: Docstring coverage enforcement
- H3: PR title validation
- H4: SQL parsing robustness
- B2: Filesystem path assumptions
- B3: HTTP error handling
- B4: Locale routing enforcement

**Expected Outcome**: 7 quality/DX improvements = production-ready codebase

---

### MVP 2.0 - 3.0 (Future)
**No issues in current roster require MVP 2.0+**
- All 18 issues targeted for MVP 1.0-1.5 completion
- Credential work (D1) deferred to post-MVP 3.0

---

## SUMMARY STATISTICS

**Total Issues Analyzed**: 29 (17 from PR_ISSUES, 12 from ACTION_ITEMS)
**Duplicates Merged**: 3 (370 discrepancy, search fix, image coverage)
**Unique Issues**: 26
**Excluded (Credentials)**: 1 (SonarCloud E rating)
**Excluded (Completed)**: 3 (idempotency, health check, E2E testing)
**Excluded (Low Priority)**: 4 (TypeScript warnings, unit tests, one-card refactor, watermark polish)

**Roster Total**: 18 issues
- Critical: 5 (27.8%)
- High Impact: 9 (50.0%)
- Potential Blockers: 4 (22.2%)

**Effort Estimation**:
- Critical: 8-12 hours (average 2h per issue)
- High Impact: 15-20 hours (average 2h per issue)
- Potential Blockers: 6-8 hours (average 1.5h per issue)
- **Total**: 29-40 hours across all roster issues

**MVP 1.0 Critical Path**: 5 issues, 8-12 hours (must complete for MVP 1.0)
**MVP 1.1 High Impact**: 6 issues, 12-15 hours (UX polish for demo)
**MVP 1.5 Quality**: 7 issues, 9-13 hours (production readiness)

---

**Last Updated**: 2025-12-23 02:00 UTC
**Maintained By**: CC (Claude Code)
**Next Review**: After user feedback on borderline classifications (C3, C4, C5)
