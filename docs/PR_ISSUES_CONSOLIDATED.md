# PR Issues Consolidated

**Generated**: 2025-12-23 01:00 UTC
**Last Updated**: 2025-12-23 01:30 UTC
**Sources**: PRs #17-22, SonarCloud, CodeRabbit, Sourcery, Snyk, Recent Commits
**Scope**: Non-credential issues only (per user directive)

---

## Overview

This document consolidates all open issues from:
- PRs #17-22 (Snyk upgrades, OTP booking, SMS fixes, image audit, duplicate prevention)
- Review tools (CodeRabbit, Sourcery, SonarCloud, Snyk)
- Recent commit findings (Dec 20-23, 2025)
- ACTION_ITEMS_DEC23.md
- FOUNDATION_CHECKLIST.md

**Total Issues**: 17
**By Priority**: P0 (3), P1 (5), P2 (4), P3 (2), Reference (3)
**By Category**: Security (1), Quality (5), Performance (2), UX (4), DX (2), Technical Debt (3)

---

## P0 - Critical (Blocking)

### 1. [Security] SonarCloud E Rating on New Code
**Source**: PR #21, SonarCloud
**Category**: Security
**Status**: 🔴 Blocking PR #21
**Owner**: CC

**Problem**: Quality Gate failed with E Security Rating on new audit script
**Details**:
- File: `scripts/complete_vehicle_image_coverage.py`
- Issue: Hardcoded Supabase URL and service key in script
- Risk: Credentials in source code violates security standards

**Action**:
```python
# CURRENT (Line ~10):
SUPABASE_URL = "https://lbttmhwckcrfdymwyuhn.supabase.co"
SUPABASE_KEY = "eyJhbGc..."  # Hardcoded service key

# REQUIRED:
import os
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

# Add validation:
if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing required env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY")
```

**ETA**: Immediate
**Prompt for Agent**:
> "Fix SonarCloud E security rating in scripts/complete_vehicle_image_coverage.py. Replace hardcoded SUPABASE_URL and SUPABASE_KEY with environment variables using os.getenv(). Add validation to raise ValueError if env vars missing. Verify SonarCloud scan passes after fix."

---

### 2. [UX] 370 vs 409 Vehicle Display Discrepancy
**Source**: ACTION_ITEMS_DEC23.md
**Category**: Data Quality
**Status**: 🔴 Not Started
**Owner**: CC

**Problem**: Catalog shows 370 vehicles instead of 409 from database
**Investigation Needed**:
- Check for active/published/hidden filters in repository
- Verify client-side filtering logic
- Query database count vs displayed count

**Action Steps**:
```bash
# 1. Check repository queries
grep -n "where\|filter\|published\|active" src/repositories/vehicleRepository.ts

# 2. Verify database count
curl -H "apikey: $ANON_KEY" "$SUPABASE_URL/rest/v1/vehicle_trims?select=count"

# 3. Check page component filtering
grep -n "filter\|length" src/app/[locale]/page.tsx
```

**Expected Outcome**: All 409 vehicles displayed (39 missing vehicles identified)

**ETA**: This week
**Prompt for Agent**:
> "Debug 370 vs 409 vehicle display discrepancy. Query Supabase to verify 409 records exist. Check vehicleRepository.ts for hidden filters (active, published, hidden). Inspect page.tsx for client-side filtering. Identify and fix the 39 missing vehicles. Report findings with fix."

---

### 3. [UX] Image Quality & Coverage
**Source**: ACTION_ITEMS_DEC23.md, IMAGE_COVERAGE_REPORT_DEC23.md
**Category**: User Experience
**Status**: 🟡 In Progress (Database 100%, Physical 62.3%)
**Owner**: GC

**Problem**: 124/199 models lack physical images (only database URLs exist)
**Quality Standard**: BMW iX1 2024 (centered, 3/4 angle, 4:3 aspect, high quality)

**Affected Brands**:
- BYD: Missing images
- BAIC: Missing images
- BMW: 8 unmatched files
- Hyundai: 7 unmatched files
- Mitsubishi: 5 unmatched files
- VW: Incomplete coverage

**Two-Phase Fix**:

**Phase 1: Download Missing 124 Images**
```bash
# Use existing Unsplash methodology
cd scripts
./download_vehicle_images.sh --missing-only

# Verify downloads
ls -1 public/images/vehicles/hero/*.jpg | wc -l  # Should be 199
```

**Phase 2: Manual Mapping of 41 Unmatched Files**
- Create mapping CSV: `filename → model_id`
- Apply updates via REST API
- Verify all images load correctly

**ETA**: Next week
**Prompt for Agent**:
> "Complete hero image coverage. Phase 1: Run download_vehicle_images.sh to fetch 124 missing images using Unsplash API (same as BMW iX1 method). Phase 2: Manually map 41 unmatched files (BMW: 8, Hyundai: 7, Mitsubishi: 5, etc.) to correct model IDs. Apply updates via Supabase REST API. Verify all 199 models have physical images. Quality standard: centered, 3/4 angle, 4:3 aspect ratio."

---

## P1 - High Priority

### 4. [Quality] CodeRabbit Filesystem Path Assumptions
**Source**: PR #21, CodeRabbit
**Category**: Code Quality
**Status**: 🟡 Open
**Owner**: CC

**Problem**: Hardcoded path assumptions in audit script
**Details**:
- File: `scripts/complete_vehicle_image_coverage.py`
- Paths: `public/images/vehicles/hero/`, `public/images/vehicles/hover/`
- Risk: Breaks on Windows, non-standard project layouts
- CodeRabbit estimate: ~20 minutes review effort

**Action**:
```python
# CURRENT:
HERO_DIR = Path("public/images/vehicles/hero/")
HOVER_DIR = Path("public/images/vehicles/hover/")

# REQUIRED:
from pathlib import Path
PROJECT_ROOT = Path(__file__).parent.parent  # Relative to script location
HERO_DIR = PROJECT_ROOT / "public" / "images" / "vehicles" / "hero"
HOVER_DIR = PROJECT_ROOT / "public" / "images" / "vehicles" / "hover"

# Add validation:
if not HERO_DIR.exists():
    raise FileNotFoundError(f"Hero image directory not found: {HERO_DIR}")
```

**ETA**: This week
**Prompt for Agent**:
> "Fix filesystem path assumptions in scripts/complete_vehicle_image_coverage.py. Use pathlib.Path(__file__).parent.parent for project root. Make all paths relative to script location. Add validation to raise FileNotFoundError if directories don't exist. Ensure cross-platform compatibility (Windows, macOS, Linux)."

---

### 5. [Quality] HTTP Error Handling in Audit Script
**Source**: PR #21, CodeRabbit
**Category**: Reliability
**Status**: 🟡 Open
**Owner**: CC

**Problem**: Audit script lacks robust error handling
**Details**:
- Rate limits not handled
- Non-JSON responses cause crashes
- Network failures not gracefully handled

**Action**:
```python
def query_supabase(endpoint, filters=None, count_only=False):
    try:
        # ... existing code ...
        response = urllib.request.urlopen(request)

        # Check for rate limiting
        if response.status == 429:
            retry_after = response.headers.get('Retry-After', 60)
            print(f"Rate limited. Retry after {retry_after}s")
            time.sleep(int(retry_after))
            return query_supabase(endpoint, filters, count_only)  # Retry

        # Validate JSON response
        content_type = response.headers.get('Content-Type', '')
        if 'application/json' not in content_type:
            raise ValueError(f"Expected JSON, got: {content_type}")

        return json.loads(response.read())

    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.reason}")
        return None
    except json.JSONDecodeError as e:
        print(f"Invalid JSON response: {e}")
        return None
    except Exception as e:
        print(f"Unexpected error: {e}")
        return None
```

**ETA**: This week
**Prompt for Agent**:
> "Add robust error handling to query_supabase() in scripts/complete_vehicle_image_coverage.py. Handle: rate limits (429 with retry), non-JSON responses, network failures. Add proper exception types (HTTPError, JSONDecodeError). Return None on errors instead of crashing. Log all errors to console."

---

### 6. [Quality] SQL Parsing Robustness
**Source**: PR #21, CodeRabbit
**Category**: Code Quality
**Status**: 🟡 Open
**Owner**: CC

**Problem**: UPDATE statement counting may be inaccurate
**Details**:
- Current: Simple `line.count('UPDATE models')` count
- Risk: Misses multiline statements, comments, quoted strings
- Example failure: `-- UPDATE models SET ...` (commented out)

**Action**:
```python
def count_update_statements(sql_file_path):
    """Count UPDATE statements with robust parsing."""
    with open(sql_file_path, 'r') as f:
        content = f.read()

    # Remove SQL comments (-- and /* ... */)
    content = re.sub(r'--.*?\n', '\n', content)  # Line comments
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)  # Block comments

    # Remove quoted strings to avoid false matches
    content = re.sub(r"'[^']*'", "''", content)
    content = re.sub(r'"[^"]*"', '""', content)

    # Count UPDATE models statements
    pattern = r'\bUPDATE\s+models\s+SET\b'
    matches = re.findall(pattern, content, re.IGNORECASE)

    return len(matches)
```

**ETA**: This week
**Prompt for Agent**:
> "Improve UPDATE statement counting in scripts/complete_vehicle_image_coverage.py. Use regex to: remove SQL comments (-- and /* */), strip quoted strings, match 'UPDATE models SET' with word boundaries. Handle multiline statements correctly. Add unit test with commented/quoted examples."

---

### 7. [UX] Search Functionality Returns Wrong Results
**Source**: ACTION_ITEMS_DEC23.md
**Category**: User Experience
**Status**: 🔴 Not Started
**Owner**: GC

**Problem**: Typing 'p' returns Nissan Sunny (incorrect)
**Expected**: 'p' should match Porsche, Peugeot, etc.
**Location**: `src/components/FilterPanel.tsx` or `src/app/[locale]/page.tsx`

**Investigation**:
```bash
grep -n "toLowerCase\|search\|query" src/app/[locale]/page.tsx
grep -n "toLowerCase\|search\|query" src/components/FilterPanel.tsx
```

**Action**:
- Debug search filter logic (case sensitivity, partial match)
- Add search highlighting for matched terms
- Test edge cases (single letter, numbers, Arabic)

**ETA**: This week
**Prompt for Agent**:
> "Debug search functionality returning incorrect results (typing 'p' returns Nissan Sunny). Inspect filter logic in page.tsx and FilterPanel.tsx. Fix case sensitivity and partial matching. Add search term highlighting. Test with: single letters, numbers, Arabic text. Ensure 'p' matches Porsche/Peugeot, not Nissan."

---

## P2 - Medium Priority

### 8. [Technical Debt] Booking Migration Not Applied
**Source**: CLAUDE.md (MVP 1.0 blockers)
**Category**: Infrastructure
**Status**: 🔴 Blocking MVP 1.0
**Owner**: CCW

**Problem**: `supabase/migrations/20251211_booking_schema.sql` created but not applied
**Impact**: Booking system using in-memory storage (data lost on restart)

**Tables Missing**:
- `bookings` (12 columns)
- `sms_verifications` (7 columns)
- RLS policies

**Action**:
```bash
# Apply migration
psql $SUPABASE_URL < supabase/migrations/20251211_booking_schema.sql

# Add missing RLS to sms_verifications
psql $SUPABASE_URL <<EOF
ALTER TABLE sms_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own verifications"
  ON sms_verifications FOR SELECT
  USING (phone_number = current_setting('request.jwt.claims')::json->>'phone');
EOF

# Verify tables exist
curl -H "apikey: $ANON_KEY" "$SUPABASE_URL/rest/v1/bookings?select=count"
curl -H "apikey: $ANON_KEY" "$SUPABASE_URL/rest/v1/sms_verifications?select=count"
```

**ETA**: This week
**Prompt for Agent**:
> "Apply booking migration to Supabase production. Execute supabase/migrations/20251211_booking_schema.sql. Add missing RLS policies to sms_verifications table. Verify tables created via REST API. Migrate bookingRepository.ts from in-memory to Supabase. Test booking flow end-to-end."

---

### 9. [Performance] Locale Persistence Strategy
**Source**: Recent commits (905c061, 300ddcc)
**Category**: Performance
**Status**: 🟡 Partially Fixed
**Owner**: CC

**Problem**: Locale extraction inconsistent across routes
**Current Fixes**:
- ✅ VehicleCard.tsx: preserves locale in redirect (commit 300ddcc)
- ✅ verify/page.tsx: extracts locale from params (commit 905c061)

**Remaining Work**:
- Define canonical pattern for ALL routes
- Document in CLAUDE.md
- Audit all router.push() calls
- Prevent double-reload on language switch

**Current Pattern**:
```typescript
// Extract locale from params
const locale = params.locale as string;

// Use in redirects
router.push(`/${locale}/bookings/${id}/confirmed`);
```

**Issues to Document**:
- How is locale derived? (URL params vs window.location)
- How is locale preserved? (all router.push)
- How is locale switched? (Header component)
- Reload behavior (no double reload, no locale flip)

**ETA**: This week
**Prompt for Agent**:
> "Define canonical locale/routing rules. Document: locale derivation (params vs window.location), preservation (all router.push), switching (Header component), reload behavior. Audit all router.push() calls for locale parameter. Create locale spec document in docs/. Update CLAUDE.md with reference."

---

### 10. [Technical Debt] TypeScript Strict Mode Warnings
**Source**: Recent build outputs
**Category**: Code Quality
**Status**: 🟡 Acceptable
**Owner**: CC

**Problem**: Build shows 6 linting warnings (comma-dangle)
**Impact**: Low (cosmetic, not runtime)

**Example**:
```typescript
// Warning: Missing trailing comma
const obj = {
  foo: 1,
  bar: 2  // ← Should have comma
}
```

**Action**:
```bash
# Auto-fix with ESLint
pnpm eslint --fix src/app/[locale]/bookings/

# Or configure ESLint to ignore
# .eslintrc.js:
rules: {
  'comma-dangle': 'off'
}
```

**ETA**: Backlog (defer to MVP 1.5)
**Prompt for Agent**:
> "Fix ESLint comma-dangle warnings in booking routes. Run 'pnpm eslint --fix src/app/[locale]/bookings/' to auto-fix. If warnings persist, configure .eslintrc.js to set 'comma-dangle': 'off'. Verify build passes with 0 errors."

---

## P3 - Low Priority (Backlog)

### 11. [Enhancement] Docstring Coverage for Audit Script
**Source**: PR #21, CodeRabbit
**Category**: Documentation
**Status**: ✅ Passed (100% coverage)
**Owner**: N/A

**Problem**: None (already at 100%)
**Details**: CodeRabbit pre-merge check passed, docstring coverage = 100%

**No action needed.**

---

### 12. [Enhancement] Unit Tests for Audit Script
**Source**: PR #21, CodeRabbit
**Category**: Testing
**Status**: 🟡 Optional
**Owner**: BB

**Problem**: No unit tests for `complete_vehicle_image_coverage.py`
**Impact**: Low (script is non-critical, runs manually)

**Suggested Tests**:
```python
def test_query_supabase_handles_rate_limiting():
    # Mock 429 response
    # Assert retry logic works
    pass

def test_count_update_statements_ignores_comments():
    sql = "-- UPDATE models SET\nUPDATE models SET foo = 1;"
    assert count_update_statements(sql) == 1

def test_filesystem_paths_cross_platform():
    # Assert paths work on Windows/Linux/macOS
    pass
```

**ETA**: Backlog (defer to MVP 2.0)
**Prompt for Agent**:
> "Add unit tests for scripts/complete_vehicle_image_coverage.py. Test: rate limit handling, SQL comment parsing, cross-platform paths. Use pytest framework. Create tests/scripts/test_vehicle_image_coverage.py. Aim for >80% coverage."

---

## Summary by Category

### Security (1)
- P0: SonarCloud E rating (hardcoded credentials)

### Quality (5)
- P1: Filesystem path assumptions
- P1: HTTP error handling
- P1: SQL parsing robustness
- P1: Docstring coverage below threshold (RECURRING)
- Reference: E2E testing framework (already applied)

### Performance (2)
- P2: Locale persistence strategy
- P2: TypeScript strict mode warnings

### UX (4)
- P0: 370 vs 409 vehicle discrepancy
- P0: Image quality & coverage
- P1: Search functionality wrong results
- (Locale issues resolved)

### DX (2)
- P2: PR title vs scope mismatch
- Reference: Health check endpoint (already applied)

### Technical Debt (3)
- P2: Booking migration not applied
- P3: Unit tests for audit script
- Reference: Server-side idempotency pattern (already applied)

---

## Next Actions

**Immediate (This Week)**:
1. Fix SonarCloud E rating (CC) - blocks PR #21 merge
2. Debug 370 vs 409 vehicle discrepancy (CC)
3. Fix filesystem paths in audit script (CC)
4. Add HTTP error handling (CC)
5. Add JSDoc enforcement + pre-commit hook (ALL) - 30-90m

**High Priority (Next Week)**:
6. Complete image coverage (GC) - download 124 images
7. Fix search functionality (GC)
8. Define locale/routing canonical rules (CC)
9. Create PR title validation GitHub Action (CC) - <30m

**Medium Priority (This Sprint)**:
10. Apply booking migration (CCW)
11. Auto-fix ESLint warnings (CC)

**Backlog**:
12. Unit tests for audit script (BB, MVP 2.0)
13. Expand E2E tests to catalog page (CCW, MVP 1.5)
14. Enhance health check endpoint (CC, MVP 1.5)

---

**Maintained By**: CC
**Review Cadence**: Daily (during active sprint)
**Archive Policy**: Move resolved items to RESOLVED_ISSUES.md weekly
## NEW FINDINGS FROM PR MINING (Dec 23, 2025 01:30 UTC)

### 13. [Quality] Docstring Coverage Below Threshold (RECURRING)
**Source**: PRs #18, #19, #22 - CodeRabbit
**Category**: Code Quality / Documentation
**Status**: 🔴 Pattern Detected (3 PRs)
**Owner**: ALL

**Problem**: Consistent pattern of low docstring coverage across multiple PRs
- PR #18: 50% coverage (target 80%)
- PR #19: 60% coverage (target 80%)
- PR #22: 33% coverage (target 80%)
- **Impact**: Maintenance difficulty, onboarding friction

**Root Cause**: No enforcement mechanism for documentation standards

**Action**:
```bash
# Add ESLint plugin for JSDoc enforcement
pnpm add -D eslint-plugin-jsdoc

# .eslintrc.js
module.exports = {
  plugins: ['jsdoc'],
  rules: {
    'jsdoc/require-jsdoc': ['warn', {
      require: {
        FunctionDeclaration: true,
        ClassDeclaration: true,
        MethodDefinition: true
      }
    }]
  }
}

# Pre-commit hook
#!/bin/sh
coverage=$(pnpm run check:docstrings | grep -o '[0-9]\+\.[0-9]\+%' | head -1 | tr -d '%')
if [ $(echo "$coverage < 80" | bc) -eq 1 ]; then
  echo "Docstring coverage $coverage% < 80% threshold"
  exit 1
fi
```

**ETA**: 30-90m
**MVP Phase**: MVP 1.5 (Quality Standards)
**Prompt for Agent**:
> "Add JSDoc enforcement to ESLint config and create pre-commit hook to reject commits with <80% docstring coverage. Target all exported functions, classes, and methods. Provide example docstrings matching project style. Test on 3 existing files."

---

### 14. [Quality] PR Title vs Scope Mismatch
**Source**: PR #19 - CodeRabbit Warning
**Category**: DX (Developer Experience)
**Status**: 🟡 Pattern to Watch
**Owner**: CC

**Problem**: PR #19 titled "fix(sms): sender ID capitalization" but contained major infrastructure changes (Supabase migrations, repository refactoring, OTP flow)

**Impact**: 
- Code reviewers misled about scope
- CI/CD assumptions broken (title suggests hotfix, actually breaking change)
- Release notes inaccurate

**CodeRabbit Warning**: "The PR title refers to a trivial SMS sender ID fix, but the changeset contains major infrastructure changes"

**Action**:
- Document PR title conventions in CONTRIBUTING.md
- Add GitHub Action to validate PR title format
- Enforce conventional commits (feat/fix/refactor/docs)

**ETA**: <30m
**MVP Phase**: MVP 1.5 (DX Improvements)
**Prompt for Agent**:
> "Create GitHub Action to validate PR titles match conventional commits format and warn if title scope doesn't match files changed. Add CONTRIBUTING.md section on PR title best practices. Example: 'feat(booking): implement OTP verification flow' must touch booking-related files."

---

### 15. [Pattern] Server-Side Idempotency (REUSABLE)
**Source**: PR #22 - Sourcery Architecture
**Category**: Tech Debt / Best Practice
**Status**: ✅ Already Fixed (PR #22 merged)
**Owner**: Reference for future features

**Problem Solved**: Duplicate OTP SMS sends from rapid button clicks

**Solution Pattern** (60-second deduplication):
```typescript
// src/app/api/bookings/route.ts
const supabase = createClient();
const recentBooking = await supabase
  .from('bookings')
  .select('id')
  .eq('phone_number', phone)
  .gte('created_at', new Date(Date.now() - 60000).toISOString())
  .single();

if (recentBooking.data) {
  return NextResponse.json({
    id: recentBooking.data.id,
    duplicate: true,
    message: 'Duplicate booking prevented'
  }, { status: 200 });
}
```

**Reuse For**:
- Payment processing endpoints (prevent double charges)
- Email sending (prevent spam)
- Any user-triggered mutation with side effects

**ETA**: N/A (reference pattern)
**MVP Phase**: MVP 1.0 (Booking System) - Applied
**Prompt for Agent**:
> "Apply 60-second idempotency pattern from PR #22 to /api/payments endpoint. Use phone_number + order_id as composite key. Return existing transaction if duplicate detected within window. Log duplicate attempts to Sentry."

---

### 16. [Enhancement] Health Check Endpoint (REUSABLE)
**Source**: PR #22 - New Feature
**Category**: DX / Observability
**Status**: ✅ Already Fixed (PR #22 merged)
**Owner**: Reference for deployment verification

**Implementation**:
```typescript
// src/app/api/health/route.ts
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV || 'development',
    version: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',
    commit: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || 'local',
    branch: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF || 'unknown'
  });
}
```

**Use Cases**:
- Vercel deployment verification
- Load balancer health checks
- Monitoring/alerting integration
- Debugging production issues (commit SHA visibility)

**Enhancement Opportunities**:
- Add database connectivity check
- Add external API status (WhySMS, Supabase)
- Add memory/CPU usage
- Add uptime

**ETA**: N/A (reference pattern)
**MVP Phase**: MVP 1.0 (Deployment Tools) - Applied
**Prompt for Agent**:
> "Enhance /api/health endpoint to include database ping, WhySMS API status, and Supabase connectivity. Return 503 if any critical service is down. Add response time metrics. Document expected response format for monitoring tools."

---

### 17. [Enhancement] E2E Testing Framework Added
**Source**: PR #22 - Playwright Integration
**Category**: Quality / Testing
**Status**: ✅ Already Fixed (PR #22 merged)
**Owner**: CCW

**Added**:
- Playwright ^1.57.0 (devDependency)
- E2E test runner: `RUN_E2E_TEST.sh`
- Booking flow test: `scripts/e2e-otp-test.mjs`
- Test report: `E2E_TEST_REPORT.json`

**Coverage**:
- Booking submission
- OTP SMS sending
- Database verification
- Supabase query validation

**Next Steps**:
- Expand to catalog browsing
- Add compare functionality tests
- Add locale switching tests
- Add filter tests
- Integrate with CI/CD

**ETA**: N/A (already integrated)
**MVP Phase**: MVP 1.0 (Testing) - Foundation Complete
**Prompt for Agent**:
> "Create E2E tests for catalog page using Playwright. Test: vehicle filtering by brand/category/price, search functionality, pagination, locale switching (EN/AR). Store test results in E2E_TEST_REPORT.json. Follow existing pattern from scripts/e2e-otp-test.mjs."

---

