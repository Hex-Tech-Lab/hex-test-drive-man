# CLAUDE.md - Project Brain (CC Owns)

Version: 2.4.1 | Last Updated: 2026-01-06 2100 EET | Agent: PPLX | Status: ACTIVE
Status: ACTIVE - Pruned Edition (550-680 lines target)

***

## TABLE OF CONTENTS

1. CC Operating Instructions (MANDATORY - READ FIRST)
2. Tech Stack Verification
3. GUARDRAILS (NEVER BYPASS)
4. Git Repository Status
5. Open Items & Next Actions
6. MVP Status Roadmap
7. Database Architecture
8. Session Timeline (Last 10 Sessions - Compressed)
9. Agent Ownership Workflow
10. Architecture Decisions (Top 5)
11. UI/UX Reconstruction (Major Feature Shifts)
12. Quality Standards & Anti-Patterns
13. Lessons Learned (Critical Only)

***

## 1. CC OPERATING INSTRUCTIONS (MANDATORY - READ FIRST)

**RULE**: Always read this entire section (~100 lines) at the start of every prompt/task.

### Core Identity
You are CC (Claude Code), expert full-stack developer and system architect at 0.1% expertise level globally. 
Multimodal: assume top-tier expertise in ANY domain on demand until task concluded.

### CORE RULES
- Expertise: 0.1% SME in field(s) relevant to current task
- Thought Partner: Push back when trajectory misaligns
- Clarity: Ask max 1 question if <95% confident
- No Appeasement: Challenge illogical paths immediately

### COMMUNICATION STYLE
- TOC sections (##) + bullets (-)
- 7-15 words/bullet (max 25 for complex concepts)
- Direct, expert-level, non-verbose
- Expand ONLY if explanation needed

### QUALITY DISCIPLINE
- VERIFY 10x → PLAN 10x → EXECUTE 1x
- Check objective alignment every iteration
- Flag futility, off-track work, troubleshooting loops
- Cite sources (file:line or commit SHA)

### VERIFICATION MANDATE
- Every version: check package.json, not artifacts
- Every count: use `wc -l`, `git log --oneline -5`
- Every DB row: query Supabase directly (see commands below)
- Rule: If unverifiable, ASK USER or provide exact commands

### FORBIDDEN BEHAVIORS
- Line count estimation (use `wc -l` exact count)
- Fabricating version numbers/metrics
- Waiting to dump all at once (incremental updates only)
- Code changes when task scope is docs only
- Multiple agents per feature
- Local-only work (GitHub = single source of truth)

### NEW MANDATORY INSTRUCTIONS (v2.4.0)

1. **Prompt Construction Protocol**
   > Every prompt MUST reference `docs/PROMPT_FIXTURES.md` template + this file's Section 1 (Mandatory Instructions) before task execution.

2. **Multi-Agent Awareness**
   > Multi-agent project: Check `docs/HANDOFF_STATUS.md` + `git log --oneline -5` at session start; flag conflicts immediately.

3. **Session Start Health Check**
   > After 2+ hours idle: Run `git status && git log --oneline -5 && wc -l CLAUDE.md && grep -c '^NEXT_PUBLIC' .env.local` to detect drift.

4. **Multi-Agent Task Assignment**
   > For multi-agent tasks: Reference `docs/orchestration/MULTI_AGENT_ORCHESTRATION.md` for flag-holding, wait-and-listen protocol.

5. **Environment Variables Enforcement**
   > At session start: Verify all credentials exist via `grep -E '^(NEXT_PUBLIC_SUPABASE|SUPABASE_SERVICE|SENTRY|WHYSMS)' .env.local | wc -l` (expect 6+). If missing, STOP and request user setup.

6. **Other Agents Syncing to CLAUDE.md**
   > When GC/BB/CCW sync updates to CLAUDE.md: ADD ONLY, never delete/modify existing content. CC reviews and reorders in next housekeeping cycle.

7. **Housekeeping at Session End**
   > At session end (user signals: sleep, weekend, leaving): Auto-append housekeeping step: `cp CLAUDE.md CLAUDE.md.backup.$(date +%Y%m%d-%H%M)-{AGENT}`, update PERFORMANCE_LOG.md, sync replicas (GEMINI.md, BLACKBOX.md).

8. **Timeboxing + Metrics Enforcement**
   > Every task 15+ min: Log start timestamp, end timestamp, duration, outcome, files touched, self-critique in `docs/PERFORMANCE_LOG.md` (format per PROMPT_FIXTURES).

9. **Smart Update Cadence**
   > Update CLAUDE.md ONLY at flagposts (milestone reached, issue resolved, success achieved), NOT during mid-cycle troubleshooting loops.

10. **First 100 Lines Rule**
    > This section (~100 lines) anchors every decision. Ignore at your own peril.

11. **Credential Rotation**
    > If credentials exposed in chat/logs/commits: Rotate immediately via provider dashboards.

12. **Pre-Commit Hook Discipline**
    > Husky pre-commit runs docstring coverage gate (≥80% required). If blocked: fix docstrings OR use `--no-verify` emergency-only (document reason in commit message).

13. **Best Practices First (NEW - 2026-01-05)**
    > Before troubleshooting: search `docs/best-practices/INDEX.md` by symptom (e.g., "git push rejected", "404 pages"). Before implementing: check category lessons (git-workflows, debugging, performance, documentation). If solution found: apply pattern, cite source (e.g., "per best-practices/debugging/SLUG_PARSING_MISMATCH.md"). If no solution: investigate, document new lesson after success using LESSON_ENTRY_TEMPLATE.md.

**Full Details**: `docs/context/CC_CORE_INSTRUCTIONS.md` (150+ lines with examples, edge cases)

***

## 2. TECH STACK VERIFICATION

**Last Verified**: 2025-12-14 2000 UTC via `package.json` read + Supabase REST API

### Frontend
- **Next.js 15.4.10** (App Router, React 19) - Line 23 in package.json
- **React 19.2.0** - Line 26
- **TypeScript 5.7.3** (strict mode) - Line 41
- **MUI 6.4.3** (NOT v7; see Architecture Decisions #1) - Lines 17-18
- **Zustand 5.0.3** (state, localStorage) - Line 30
  - ⚠️ **Critical Anti-Pattern**: Object selectors cause React 19 infinite loops
  - ✅ **Required**: Primitive selectors only (`const brands = useFilterStore(s => s.brands)`)

### Backend
- **Supabase 2.50.0** (PostgreSQL client) - Line 19
- **Repository Pattern** (not SWR; planned for MVP 1.5)
- **Sentry 10.29.0** (error tracking) - Line 18

### Package Manager
- **pnpm ONLY** (no npm/yarn) - `packageManager: pnpm@9.x` in package.json

**Verification Commands**:
```bash
# Check Next.js version
grep '"next"' package.json

# Check MUI version
grep '@mui/material' package.json

# Verify Supabase table count (currently returns 2 - needs investigation)
curl -X GET "https://lbttmhwckcrfdymwyuhn.supabase.co/rest/v1/"
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" | jq 'keys | length'

# Count vehicle_trims (actual table count)
curl -X GET "https://lbttmhwckcrfdymwyuhn.supabase.co/rest/v1/vehicle_trims?select=count"
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY"
  -H "Accept: application/json"
```

**Full Details**: `docs/architecture/TECH_STACK_FULL.md` (250+ lines with artifact version claims, CVE checks, SWR status)

***

## 3. GUARDRAILS (NEVER BYPASS)

### Dependency Restrictions
- **ESLint**: Stay on 8.x (v9 = breaking changes)
- **MUI**: Stay on 6.4.3 until MVP 1.5 (v7 = breaking slotProps API across ALL components)
- **React**: 19.x OK (already on latest)
- **Next.js**: 15.x OK (incremental upgrades only)

### Code Modification Discipline
- Documentation-only tasks = **zero code changes**
- Always run `pnpm lint && pnpm build` before commit
- Fix CRITICAL/BLOCKER issues before PR merge

### Git Discipline
- Main = single source of truth
- Feature branches: `{agent}/{feature}-{session-id}`
- **Never** `--force` push to main (use `--force-with-lease` on feature branches only)
- GPG signing: ENABLED (but user prefers disabled)

### Git Push & Rebase Protocol (CRITICAL)

**Mandatory Pre-Push Sequence** (enforced by `.husky/pre-push` hook):

```bash
# Step 1: Fetch remote (check for concurrent changes)
git fetch origin

# Step 2: Verify not behind remote
git log HEAD..origin/main --oneline
# If ANY commits shown: STOP, rebase first

# Step 3: If behind, rebase (not merge!)
git pull --rebase origin main
pnpm build && pnpm lint  # Re-verify after rebase

# Step 4: Push (only if above checks pass)
git push origin main
```

**Automated Safety** (installed):
- Pre-push hook blocks unsafe pushes automatically
- Detects remote changes before push attempt
- Forces rebase before allowing push

**Helper Script** (for complex scenarios):
```bash
./scripts/safe-push.sh
# Interactive prompts guide through all checks
```

**If Push Rejected**:
```bash
# Error: ! [rejected] main -> main (fetch first)

# Solution (rebase, not merge):
git pull --rebase origin main  # Replay your commits on top
pnpm build  # Re-verify
git push origin main  # Try again
```

**Multi-Agent Coordination**:
- Check `docs/HANDOFF_STATUS.md` before pushing
- Update HANDOFF_STATUS after successful push
- If another agent pushed in last 5 min, fetch + rebase first

**References**:
- Full policy: `docs/policies/GIT_WORKFLOW_RULES.md`
- Emergency procedures: Section 7 of policy doc
- 2026-01-05 Git workflow analysis (educational): `docs/incidents/2026-01-05-REBASE-INCIDENT.md`

### Database Verification Protocol
```bash
# Before claiming row counts
curl "https://lbttmhwckcrfdymwyuhn.supabase.co/rest/v1/vehicle_trims?select=count"
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY"

# Before DB migrations
grep SUPABASE_SERVICE_ROLE_KEY .env.local || echo "MISSING - cannot apply migration"

# After DB updates
curl "https://lbttmhwckcrfdymwyuhn.supabase.co/rest/v1/{table}?select=*&limit=5"
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY"
```

**Full Details**: `docs/context/GUARDRAILS_EXTENDED.md` (if created) or inline above is sufficient.

***

## 4. GIT REPOSITORY STATUS

**Branch**: `main` (2815943)
**Last Commit**: `Merge remote-tracking branch 'origin/agent/immediate-actions-no-more-code-changes-task-1-bb-b-1667'` (2026-01-04 20:31 UTC)
**Working Tree**: Clean (verified 2026-01-04 20:31 UTC)

**Quick Status Check**:
```bash
git status
git log --oneline -5
git branch -vv | head -10
```

**Active Branches**: 16 local (see `git branch -vv` for full list)

**Recent Critical Changes**:
- GC autonomous session (2025-12-24 02:00-06:00 EET): Logo sizing, hero image composition, coverage script
- GEMINI.md truncation incident: 2270 lines deleted in commit c29e2ed (restoration pending investigation)

***

## 5. OPEN ITEMS & NEXT ACTIONS

### RECENTLY COMPLETED (Last 24 Hours)
- ✅ **MVP 1.6 Phase 2.5 - Scanner Countdown** (2026-01-09, BB Pro): 3-2-1 countdown overlay with auto-capture → Green 120px font with glow effect, setInterval timer (1s intervals), isCapturing guard prevents re-trigger, auto-capture after countdown completes → Quality gates: TypeScript PASS, Build PASS, Docstring 91.49% → Branch: agent/bb-scanner-countdown-unified (commit 934f80a) → Duration: 16 min (20% under budget) → Next: Push to GitHub, verify deployment
- ✅ **Performance Architecture Design** (2026-01-05, CC): 3 deliverable docs (6,200+ lines) → Amazon.eg analysis (FCP 1.1s pattern), frame architecture, 3-phase roadmap (9-11 weeks) → Target: LCP 3.84s → < 1.5s (61% improvement), bundle 341 KB → 90 KB (see docs/PERFORMANCE_ARCHITECTURE_SESSION_2026-01-05.md, PERFORMANCE_ARCHITECTURE_DESIGN.md, AMAZON_PERFORMANCE_ANALYSIS.md, OPTIMIZATION_ROADMAP.md)
- ✅ **TypeScript Alias Enforcement** (2026-01-05, CC): ESLint no-restricted-imports verified working (blocks ../* patterns), CLAUDE.md Section 12 expanded with path alias documentation, 0 violations found (100% compliant), commit aab71b2
- ✅ **Card Image Fallback Fix - Catalog Page** (2026-01-03, CC): Gray placeholders eliminated on catalog, retina srcSet added (@2x/@3x), PR#25 merged (56ece88)
- ✅ **Card Image Fallback Fix - Compare Page** (2026-01-04, CC): Fixed grey "No+Image" boxes on /compare, comprehensive audit completed, ESLint guard added, PR#26 created (b74b911)
- ✅ **Production Image Audit** (2026-01-04, CC): Audited 135 DB hero_image_url refs vs 362 git files → 0 orphaned references found, all DB refs valid, BYD F3 already NULL

### PRIORITY 1 (BLOCKERS - Next 2 Hours)
1. ✅ **CLAUDE.md Pruning**: This task (GC executing now)
2. **GEMINI.md Restoration**: Investigate truncation (commit c29e2ed), restore from pre-deletion state or replicate from pruned CLAUDE.md
3. **Root Directory Cleanup**: Move 15+ MD files to SDLC structure (Phase 4 of this task)

### PRIORITY 2 (HIGH - Next 24 Hours)
4. **Performance Optimization Phase 1** (2026-01-05, BB): Start implementation per OPTIMIZATION_ROADMAP.md
   - Task 1.1: Image optimization (fetchpriority, lazy loading) - 3 days
   - Task 1.2: Lazy load FilterPanel, Footer - 4 days
   - Task 1.3: Defer Sentry, analytics - 2 days
   - Target: FCP 3.84s → 2.0-2.3s (40-50% improvement)
5. **Unmapped Images Actions** (2026-01-04, CC): ⚠️ DECISION REQUIRED
   - Delete 45 broken images (< 20KB download failures) - script ready
   - Create 174 missing model records (expand catalog 199 → 373, +87% growth)
   - Options: A) Create all 174 models, B) Delete unmapped (not recommended), C) Phased (BMW+Mercedes+Audi first = 70 models)
   - Details: docs/IMAGE_MAPPING_RESULTS_2026-01-04.md
6. **Fix aggregated_vehicles View**: Returns 4 rows (broken) instead of 409 → review view definition in Supabase dashboard
7. **Catalog UI Redesign Research**: Investigate filter tabs, search box placement, grid defaults per user directive
7. **Image Coverage**: Fix MG5 negative image, improve hero positioning (objectPosition tuning)
8. **Branch Consolidation**: Merge `gc/ui-regression-fixes-v2.3` to main after verification
9. **Fix npm References in Docs**: Grep README/CONTRIBUTING for `npm install`, replace with `pnpm install` (violates pnpm-only policy)
10. **Formalize Docstring Policy**: Document ≥80% coverage requirement in CONTRIBUTING.md + ESLint enforcement plan

### PRIORITY 3 (MEDIUM - Next 48 Hours)
7. **PDF Extraction Pipeline**: Cell-span detection (target 55% quality gate)
8. **Smart Rules Engine**: Expand to 50% coverage (add 10 safety/ADAS specs)
9. **Booking Migration**: Apply `20251211_booking_schema.sql` to production

**Full Backlog**: `docs/OPEN_ITEMS_FULL.md` (if exists) or refer to GitHub Issues/Projects

***

## 6. MVP STATUS ROADMAP

### MVP 1.0 (COMPLETED ✅)
- 409 vehicles in catalog (Supabase integration)
- Bilingual EN/AR with RTL
- Compare functionality (up to 3 vehicles)
- Filter system (type/brand/price)

### MVP 1.1 (IN PROGRESS - 90% Complete ⏳)
- ✅ Logo sizing + hero image composition (GC autonomous session, commit 4bb3a7a)
- ✅ Vehicle detail page + trim comparison (CC, commit 12f9e2f)
- ✅ Catalog UI overhaul (search, filters, toolbar) (CC, commit 6331c4d)
- ⏳ Image coverage script (logic complete, env vars pending)
- ⏳ Catalog UI redesign phase 2 (pending user specs)
- ⏳ Main branch consolidation (pending)

### MVP 1.5 (PLANNED 📋)
- SWR for client-side data fetching
- Drizzle ORM migration (from direct Supabase)
- Smart Rules Engine 50% coverage (currently 31.7%)
- TanStack Query (admin panel only)

**Timeline**: 2025-12-31 EOD UTC or early Jan 2026

**Full Roadmap**: `MVP_ROADMAP.md` (8 lines) in root directory

***

## 7. DATABASE ARCHITECTURE

**Provider**: Supabase PostgreSQL  
**Total Tables**: 48 (user-verified 2025-12-24, Supabase API count pending investigation)  
**Last Verified**: 2025-12-24 1756 EET

### Core Tables (Top 10 by Importance)

| Table | Rows | Purpose | Last Verified |
|-------|------|---------|---------------|
| `vehicle_trims` | 409 | Main catalog (27 columns, FK to models→brands) | 2026-01-04 |
| `brands` | 95 | Brand names + logo URLs | 2026-01-04 |
| `models` | 408 | Model names + hero/hover images | 2026-01-04 |
| `model_year_images` | 133 | Year-specific vehicle images (hero/hover) | 2026-01-04 |
| `agents` | 20 | Egyptian distributors | 2025-12-14 |
| `agent_brands` | 45 | Distributor-brand relationships | 2025-12-14 |
| `segments` | 6 | Price tiers (Entry/Budget/Mid/Premium/Luxury/Supercar) | 2025-12-14 |
| `categories` | ? | Vehicle types (sedan/SUV/etc) | TBD |
| `transmissions` | ? | Transmission types | TBD |
| `fuel_types` | ? | Fuel types (petrol/diesel/electric/hybrid) | TBD |
| `body_styles` | ? | Body styles (coupe/hatchback/etc) | TBD |

### Pending Tables (Migration NOT Applied ⚠️)
- `bookings`: Defined in `supabase/migrations/20251211_booking_schema.sql`, not in production
- `sms_verifications`: Defined but RLS not enabled

**Action Required**: 
```bash
# Apply migration (requires SUPABASE_SERVICE_ROLE_KEY in .env.local)
psql $SUPABASE_URL -f supabase/migrations/20251211_booking_schema.sql

# Add missing RLS to sms_verifications
# (SQL commands in migration file)
```

**Full Schema**: `docs/architecture/DATABASE_SCHEMA_FULL.md` (250+ lines with all 48 tables, RLS policies, FK relationships)

***

## 8. SESSION TIMELINE (Last 10 Sessions - Compressed)

**Format**: Main bullet (1 line) + sub-bullet (1 line) = 2 lines per session
**Space Saved**: 300 lines → 30-40 lines (87% reduction)

- **2026-01-07 00:00-01:53 EET (BB Performance Optimization Sprint - 4 Phases)**
  - Phase 1: Mobile-first (PR #33) ✅ | Phase 2: Cache/bundle (PR #37) ✅ | Phase 3: Transparent skeleton (PR #39) ✅ | Phase 4: Font analysis ❌ NOT EXECUTED | Phase 5: Session cleanup ✅ | Delivered: 10+ docs, 3 PRs merged, 10 bugs documented (BUG-003/004, PERF-011-014) | Full details: docs/SESSION_2026-01-07_COMPLETE.md

- **2026-01-05 (CC Critical Fixes - Partial Session)**

- **2026-01-06 (Multi-Agent Production Triage + PR Stabilization)**
  - Emergency: React hooks violation fixed (BB commit 793486f) + catalog page restored + BB scraper: 2 open PRs (#28 CC perf, #27 BB workflow) + CC Phase 1 NOT in production (PR #28 pending) + CLAUDE.md sync violation discovered (last update Dec 24, missing 13 days of work) + Terminology: "timebox" → "time assessment/audit"
  - Files: 1 critical fix (page.tsx hooks), 3 reports (MERGE_STATUS, CC_PHASE1_IMPACT_ANALYSIS, ISSUES_ROSTER), docs by BB + Production verified working + Time Assessment: 25 min (BB hooks fix, -50% variance), 25 min (BB reports, -50% variance)
  - Fixed 404 pages for hyphenated models (Uni-T, Uni-V): Dual-query fallback (space→hyphen) resolves slug mismatch + Investigated Mercedes visibility: 24 models exist but 0 trims (migration partially failed) + Created fix script (scripts/fix-mercedes-trims.mjs, needs manual execution) + **DEFERRED 4 tasks** (60 min): Container/flyout system, state persistence, breadcrumb bug, favorites button, language switch
  - Files: 1 modified (page.tsx: +48/-48 lines, extracted VEHICLE_DETAIL_SELECT constant), 2 scripts created (debug-vehicles.mjs, fix-mercedes-trims.mjs) + Build ✓ (411e243) + Docstring 83.54% + Timebox: 30 min actual / 90 min allocated (67% under budget, 2 of 4 tasks completed) + Handoff: docs/NEXT_SESSION_DEFERRED_TASKS.md (200 lines)

- **2026-01-05 (CC Vehicle Detail Page + Trim Comparison)**
  - Implemented Priority 1: Complete vehicle detail page with /[locale]/vehicles/[slug] route + trim comparison table (max 5 selections) + difference highlighting + comparison/booking stores (max 5 cross-model, max 3 in 90 days) + similar vehicles grid + catalog navigation integration
  - Files: 7 created (995 lines: page.tsx, VehicleHero, TrimComparison, VehicleDetailLayout, useComparisonStore, useBookingStore), 1 modified (VehicleCard) + Type assertion pattern: as unknown as Vehicle[] for Supabase joins + Build ✓ (12f9e2f) + Docstring 84.21% + Timebox: 105 min actual / 90 min allocated (+16.7% variance, TypeScript debugging) + Performance log: docs/PERFORMANCE_LOG_2026-01-05_VEHICLE_DETAIL_PAGE.md

- **2026-01-04 02:50 UTC (CC Image Mapping Investigation)**
  - Investigated 230 legitimate unmapped images: Parsed filenames (brand/model/year extraction) → fuzzy-matched to database → 56 matched existing models (all already have images, 0 updates needed) → 174 have NO matching models (75.7%)
  - CRITICAL FINDING: 174 images require MODEL CREATION, not image mapping → potential catalog growth 199 → 373 models (+87%) → 3 options documented (create all, delete, phased BMW+Mercedes+Audi) → awaiting user decision + docs/IMAGE_MAPPING_RESULTS_2026-01-04.md (306 lines) + Timebox: 90 min actual

- **2026-01-04 01:15 UTC (CC PR Gatekeeper + Comprehensive Audit)**
  - ROOT CAUSE: PR#25 fixed catalog but missed compare page - production showed grey "No+Image" via.placeholder.com boxes on /compare route + comprehensive audit revealed compare page as ONLY remaining instance
  - FIX: Applied same fallback pattern to compare page (getVehicleImage, srcSet, onError) + added ESLint no-restricted-syntax rule (blocks via.placeholder) + created audit doc (500+ lines) + PR#26 created (b74b911) + Timebox: 120 min actual

- **2026-01-03 21:35 UTC (CC UX Bug Fix)**
  - Fixed gray card placeholders: Added retina srcSet support (@2x/@3x) + improved onError handler (infinite loop prevention) + PR#25 created (dd8a462, branch: cc/fix-card-image-fallback)
  - Files: src/lib/imageHelper.ts (+44 lines), src/components/VehicleCard.tsx (+2 lines) + Performance log: docs/PERFORMANCE_LOG_2026-01-03_CARD_FALLBACK_FIX.md + Timebox: 30 min actual / 45 min allocated (67% efficiency)

- **2025-12-24 02:00 EET (GC Autonomous)**
  - Logo sizing (aspect-ratio aware) + hero image objectPosition 85% + naming fixes ("MG MG 5" → "MG 5 2025") + coverage script created + merged to main
  - ⚠️ GEMINI.md truncation incident: 2270 lines deleted in commit c29e2ed, restoration pending

- **2025-12-23 01:00 UTC (CC PR Mining)**
  - Extracted 5 new issues from PR17-22: docstring coverage pattern, PR title validation, server-side idempotency, health check endpoints, E2E testing framework
  - Updated docs/PR_ISSUES_CONSOLIDATED.md (12→17 issues), identified declining docstring coverage trend requiring ESLint enforcement

- **2025-12-22 20:00 UTC (Multi-Agent Stabilization)**
  - All 409 vehicles displayed (removed .limit(50)) + locale persistence fixes (booking redirect, verify page) + dynamic price range + image fallback system
  - Branch cleanup: 15 stale branches deleted, 4 active kept + documentation created (MVP_ROADMAP, E2E_TEST_SETUP_REPORT, HERO_IMAGES_GAP_ANALYSIS)

- **2025-12-18 TBD (Multi-Agent Housekeeping)**
  - Repository cleanup: 7 local + 7 remote branches deleted, PR10 verified closed + session timeline extraction (652 lines) + env alignment
  - CLAUDE.md pruned: 2365→2111 lines (-10.7%), replicas synced (GEMINI.md, BLACKBOX.md) + SESSION UPDATE WORKFLOW enforcement added

- **2025-12-17 14:32 EET (CC Technical Debt)**
  - ESLint no-restricted-imports rule added (enforces path aliases, forbids ../ traversal) + booking migration reviewed (pending credentials)
  - Verified ESLint 8.57.0 working, 6 warnings (comma-dangle), 0 errors + no relative import violations detected

- **2025-12-16 21:54 EET (CC Standards Update)**
  - File naming standards established (PURPOSE-YYYYMMDD-HHMM-AGENT.ext) + agent performance matrix added + task assignment guidelines
  - CLAUDE.md v2.2.6 released: +58 lines (agent capabilities, recent successes/failures, performance improvement actions)

- **2025-12-14 20:30 UTC (CC GUARDRAILS + THOS Integration)**
  - GUARDRAILS section added (dependency restrictions, code discipline, build/deploy gates, git rules, DB verification) + THOS Dec 3 integrated (Smart Rules Engine)
  - Critical error corrected: v2.2.0 initially compressed 1200→633 lines, user provided original, rebuilt to 1400 lines preserving ALL content

- **2025-12-11 TBD (Multi-Agent Foundation Hardening)**
  - SonarCloud integration: 34 BLOCKER/CRITICAL issues exported, 1 BLOCKER + 2 CRITICAL fixed + Snyk upgrades (Next.js 15.4.10, Supabase 2.50.0)
  - PR7 merged (52 files, 87% AI prompts auto-fixed) + foundation checklist drafted (zero HIGH/CRITICAL CVEs, CI green)

- **2025-12-09 TBD (GC Repository Cleanup)**
  - Sentry APM configured (wizard: tracing, replay, logs, example page) + AI prompt collection automated (26 actual prompts, not 377 false positives)
  - Repository cleanup: 53 obsolete root files removed, 66 PDF samples moved, 24 images moved + sync-repo.sh created (resolves WSL/GitHub drift)

- **2025-12-03 02:24 EET (GC Smart Rules Engine Breakthrough)**
  - Smart Rules Engine v2 achieved 84.5% coverage (up from 31.7%, 7184 specs matched) + canonical specs expanded 19→50 + Arabic support 99% (up from 7%)
  - Breakthroughs: Parentheses stripping fixed fuzzy matching, bilingual Document AI extraction, smart cell splitter (context-aware vs naive)

**Full Timeline**: `docs/context/SESSION_ARCHIVE.md` (20+ sessions, 400+ lines with complete 5-7 key outcomes per session)

***

## 9. AGENT OWNERSHIP WORKFLOW

### Agent Definitions

| Agent | Role | Expertise | Tools | Current Status |
|-------|------|-----------|-------|----------------|
| **CC** | Architect/Mastermind | Hardest bugs, system design, PR audits | Terminal/CLI, Read/Write/Edit, Bash | Active (this session) |
| **CCW** | Specialist | SMS/OTP/2FA vertical end-to-end | Same as CC | Idle (last: ca9da33, 2025-12-11) |
| **GC** | Operations | Git/PR/doc sync, large refactors (1M context) | CLI, GitHub API | Active (this session) |
| **BB** | Tools | Browser tests (Playwright), scripts, dashboards | Web browsing, Xvfb, screenshots | Idle (last: browser tests) |
| **PPLX** | Coordinator | Strategic planning, multi-agent orchestration | Multi-model (CS4.5, Gemini, GPT) | Active (coordinating) |

### Workflow Rules
1. **One agent per feature** (no overlap)
2. **CC audits all PRs** before merge
3. **GitHub = single source of truth** (no local-only work)
4. **Session end protocol**: 
   ```bash
   git checkout -b {agent}/{feature}-{session-id}
   git add .
   git commit -m "feat(scope): description"
   git push -u origin {agent}/{feature}-{session-id}
   ```

### Prompt Template Usage (v2.3)
- **Authority**: Only CC may modify templates and fixtures
- **GC/BB/CCW**: Use templates from GEMINI.md/BLACKBOX.md/CLAUDE.md, fill task-specific section only, never modify fixtures
- **Rule**: No new prompt valid unless it uses templates + incorporates all global fixtures

**Template Locations**:
- CC: CLAUDE.md → "CC Prompt Template v2.3"
- GC: GEMINI.md → "GC Prompt Template v2.3"
- BB: BLACKBOX.md → "BB Prompt Template v2.3"
- Global Fixtures: `docs/PROMPT_FIXTURES.md` v2.3

**Full Details**: `docs/PROMPT_FIXTURES.md` (v2.3, 150+ lines) and `docs/context/AGENT_WORKFLOWS_EXTENDED.md` (if created)

***

## 10. ARCHITECTURE DECISIONS (Top 5)

### 1. MUI Version Decision (2025-12-13 17:15 UTC, CC)
- **Decision**: STAY ON 6.4.3 (not v7.x)
- **Rationale**: Zero CVEs in 6.4.3 (verified via Snyk), v7 requires breaking changes to slotProps API across ALL components, no business value for MVP
- **Revisit**: After MVP 1.5 completion or if v6 CVE discovered
- **Sources**: MUI v7 Release Notes, v7 Migration Guide, Snyk Security DB

### 2. Smart Rules Engine Architecture (2025-12-03, GC)
- **Decision**: JSON-based rules with modular components (fuzzy matcher, analyzer, quality gate)
- **Rationale**: Version controllable, human readable, no DB dependency, supports bilingual EN/AR, fuzzy matching handles typos
- **Status**: Production-ready (84.5% coverage on Toyota Corolla, 100% precision)
- **Files**: `rules_engine/core/spec_matcher.py`, `spec_definitions.json` (50 canonical specs)

### 3. Booking/SMS Schema (2025-12-11, Bash)
- **Decision**: Dedicated tables (`bookings`, `sms_verifications`) with RLS, structured for future microservice spin-off
- **Rationale**: OTP/KYC systems need independence for reusability, RLS enforces security, PostgreSQL sufficient for MVP (no separate DB yet)
- **Status**: Migration defined (`supabase/migrations/20251211_booking_schema.sql`) but NOT applied to production
- **Next**: Apply migration once `.env.local` has `SUPABASE_SERVICE_ROLE_KEY`

### 4. OCR Integration (2025-12-02, GC)
- **Decision**: Tesseract 5.3.4 as fallback for image-based PDFs (Toyota/BMW have zero extractable text)
- **Rationale**: Free, proven, handles Arabic + English, integrates with quality gate
- **Status**: Working, used when `pdfplumber` fails to extract text
- **Accuracy**: 82 rows extracted from Toyota Corolla PDF

### 5. Google Cloud Document AI (2025-12-03, GC)
- **Decision**: Use Form Parser (processor in EU region)
- **Rationale**: Handles complex tables better than pure OCR, EU compliance for data residency, pre-trained model (no custom training)
- **Status**: Working (82 rows from Toyota Corolla), integrated with Smart Rules Engine
- **Cost**: ~$0.015/page (within budget for 100 PDFs)

**Full Decisions**: `docs/architecture/ARCHITECTURE_DECISIONS.md` (10+ decisions, 250+ lines with rejected alternatives, implementation details)

***

## 11. UI/UX RECONSTRUCTION (Major Feature Shifts)

**Status**: Planning Phase 📋  
**Priority**: HIGH (user directive 2025-12-24)  
**Rationale**: Booking is core value prop, but current catalog UX blocks user adoption

### Proposed Changes (Pending Specs)
1. **Pre-Catalog Screen**: User-friendly entry point before catalog (details TBD)
2. **Filter Tabs**: Replace filter panel with tab-based UI (examples from reference site)
3. **Search Box Placement**: Relocate to prominent position (header vs sidebar TBD)
4. **Grid Defaults**: Review 2/4/6 column logic, default to 3 or 4 (not 2)
5. **Initial Grouping**: Current = per-year cards (e.g., "Chery Arrizo 5 2025" vs "2026"), evaluate per-family alternative

### Research Needed
- A/B testing: per-year vs per-family cards
- Competitor analysis: reference site UI patterns (user will provide screenshots)
- User flow mapping: pre-catalog → catalog → compare → booking

### Dependencies
- User to provide: reference site examples, specific filter tab requirements, search box mockup
- CC to design: new component architecture, state management for tabs
- GC to implement: code changes after CC approval

**Next Action**: Await user specs (screenshots, detailed requirements)

***

## 12. QUALITY STANDARDS & ANTI-PATTERNS

### Code Standards
- **TypeScript**: Strict mode enabled, interfaces over types for public APIs, no `@ts-ignore` without documented justification
- **Imports**: Organize (React→libraries→local), use path aliases exclusively (enforced by ESLint rule), no unused imports
  - **Path Alias Enforcement**: `no-restricted-imports` ESLint rule blocks `../*` patterns
  - **Configuration**: `tsconfig.json` maps `@/*` to `./src/*`, `eslint.config.js` enforces usage
  - **Correct**: `import { getVehicleImage } from '@/lib/imageHelper';`
  - **Forbidden**: `import { getVehicleImage } from '../lib/imageHelper';` (ESLint error)
  - **Status**: 100% compliant (0 violations, verified 2026-01-05)
- **Style**: Single quotes, trailing commas, 2-space indentation, 100-char line limit
- **MUI Only**: FORBIDDEN Tailwind, shadcn, Lucide icons (rationale: better RTL/Arabic support)

### Git Commit Standards
- **Format**: `type(scope): short description` (conventional commits)
  - Types: feat, fix, chore, docs, refactor, test
  - Example: `feat(ui): add aspect-ratio-aware logo sizing`
- **GPG Signing**: Enabled in repo (but user prefers disabled)
- **Force Push**: Only on feature branches via `--force-with-lease`, **never** on main

### Anti-Patterns (FORBIDDEN ⛔)
1. Verbose responses without substance
2. Multiple agents per feature (one agent, one feature)
3. Local-only work (GitHub = single source of truth)
4. Skipping quality gates for speed
5. Premature complexity before MVP needs
6. Line count estimation (use `wc -l` for exact counts)
7. Fabricating version numbers/metrics
8. Waiting to dump all at once (incremental updates only)
9. Code changes when task scope is documentation only
10. Passive VERIFY tags without attempting verification

**Full Standards**: `docs/context/QUALITY_STANDARDS_EXTENDED.md` (if created) or refer to ESLint config + `.prettierrc`

***

## 13. LESSONS LEARNED (Critical Only)

### 1. Content Preservation in Version Updates (2025-12-14, CC Error)
- **Problem**: CC compressed CLAUDE.md 1200 lines → 633 lines, lost 567 lines of critical content
- **User Feedback**: "This is absolutely wrong... how did you lose 1200 lines?"
- **Impact**: Lost detailed TABLE OF CONTENTS, package.json verification, session outcomes, forensics sections
- **Lesson**: Version bump = enhancement (ADD new sections), NOT compression. Always preserve content unless explicitly deprecated.

### 2. CLAUDE.md Data Loss Incident (2025-12-12, CC Critical Error)
- **Problem**: User's 597-line manually-edited CLAUDE.md lost during `git reset --hard origin/main`
- **Root Cause**: Assistant instructed Git operations without confirming file was committed first
- **Impact**: Unrecoverable (never committed to Git, only in working tree)
- **Lesson**: ALWAYS run `git status` and `git diff --stat` before destructive operations (`reset --hard`, `checkout`, `clean -fd`). Warn user explicitly about uncommitted changes.

### 3. Incremental vs Bulk Pattern (2025-12-13, User Feedback)
- **Problem**: CC proposed "wait for all THOS then process in one shot"
- **User Feedback**: "This is an anti-pattern. We tried full dump before, didn't work out."
- **Correct Approach**: Process each THOS as received, update CLAUDE.md incrementally, commit after each
- **Lesson**: Incremental updates force verification at each step, prevent information overload, allow user to course-correct immediately

### 4. Git Hook Environment Isolation (2025-12-24, User Fix)
- **Problem**: Husky pre-commit failed with `pnpm not found in PATH`
- **Root Cause**: Git hooks run non-interactively; shell init not loaded
- **Solution**: Created `~/.config/husky/init.sh` to export `PNPM_HOME` + PATH
- **Lesson**: Never assume interactive shell environment in Git hooks; use Husky init.sh for PATH setup

**Full Forensics**: `docs/context/LESSONS_LEARNED.md` (150+ lines with all incidents, timelines, root causes, prevention strategies)

***

## APPENDIX A: AGENT & MODEL TERMINOLOGY

| Agent | Acronym | Typical Model | Context/Notes |
|-------|---------|---------------|---------------|
| **Claude Code** | CC | **CS45** (Claude 3.5 Sonnet) | Primary architect. Thinking/Reasoning enabled. |
| **Claude Code Web** | CCW | **CS45** (Claude 3.5 Sonnet) | Web-based specialist. Thinking/Reasoning enabled. |
| **Gemini CLI** | GC | **Gemini 3 Pro Preview** | Switches to Gemini 3 Flash for lighter tasks. |
| **Blackbox** | BB | **Blackbox Pro** | Sometimes runs CS45. |
| **Perplexity** | PPLX | **CS45** (90%) / **GPT-52** | Multi-model. Used GPT-52 for Husky fix. Thinking enabled on CS45. |

**Terminology Note**: PPLX running CS45 may incorrectly refer to "Gemini CLI (GC)" as "Gemini Code". Correct internal name is **GC**.

***

**END OF CLAUDE.MD v2.4.1 (Pruned & Patched)**

**Maintained By**: CC (Claude Code)  
**Last Verified**: 2025-12-24 2000 EET  
**Next Update**: After GEMINI.md restoration and root directory cleanup (Phase 4-6 of this task)  
**Line Count Target**: 550-680 lines (current draft: ~650 lines estimated)

**Housekeeping Reminder**: At session end, run:
```bash
cp CLAUDE.md CLAUDE.md.backup.$(date +%Y%m%d-%H%M)-GC
git add CLAUDE.md docs/ GEMINI.md
git commit -m "refactor(docs): prune CLAUDE.md to 650 lines, SDLC structure v2.4.0"
git push origin main
```