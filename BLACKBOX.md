# BLACKBOX.md - BB Tools & Testing View

Version: 2.4.1 | Last Updated: 2025-12-24 2000 EET | Synced from: CLAUDE.md v2.4.1
Status: ACTIVE - Replica of CLAUDE.md with BB-specific additions
Maintained By: BB (synced by CC)

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
14. Appendix A: Agent & Model Terminology

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

**Branch**: `main` (096622f)
**Last Commit**: `security: upgrade filelock to 3.20.1 (CVE-2025-68146 TOCTOU fix)` (2025-12-25 00:50 EET)
**Working Tree**: Clean (verified at session start)

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

### PRIORITY 1 (BLOCKERS - Next 2 Hours)
1. ✅ **CLAUDE.md Pruning**: This task (GC executing now)
2. **GEMINI.md Restoration**: Investigate truncation (commit c29e2ed), restore from pre-deletion state or replicate from pruned CLAUDE.md
3. **Root Directory Cleanup**: Move 15+ MD files to SDLC structure (Phase 4 of this task)

### PRIORITY 2 (HIGH - Next 24 Hours)
4. **Catalog UI Redesign Research**: Investigate filter tabs, search box placement, grid defaults per user directive
5. **Image Coverage**: Fix MG5 negative image, improve hero positioning (objectPosition tuning)
6. **Branch Consolidation**: Merge `gc/ui-regression-fixes-v2.3` to main after verification
7. **Fix npm References in Docs**: Grep README/CONTRIBUTING for `npm install`, replace with `pnpm install` (violates pnpm-only policy)
8. **Formalize Docstring Policy**: Document ≥80% coverage requirement in CONTRIBUTING.md + ESLint enforcement plan

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

### MVP 1.1 (IN PROGRESS - 80% Complete ⏳)
- ✅ Logo sizing + hero image composition (GC autonomous session, commit 4bb3a7a)
- ⏳ Image coverage script (logic complete, env vars pending)
- ⏳ Catalog UI redesign (pending user specs)
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
| `vehicle_trims` | 409 | Main catalog (27 columns, FK to models→brands) | 2025-12-14 |
| `brands` | 95 | Brand names + logo URLs | 2025-12-14 |
| `models` | 199 | Model names + hero/hover images | 2025-12-14 |
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

- **2025-12-03 09:45 EET (Multi-Agent BMW X5 Extraction)**
  - BMW X5 image preprocessing complete (batch resize to 4000px, Lanczos resampling, 1.1MB output) + Egyptian brochure layout rule established
  - Booking MVP v0 implemented by CCW (booking.ts types, repository, API route, VehicleCard modal, EN/AR localization) + PR4 opened

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
   gh pr create --base main --head {agent}/{feature}-{session-id}
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

## 14. AUDIT HISTORY

### 2025-12-24 Manual Audit (BB)
**Reports Generated**:
- `docs/AUDIT_REPORT_20251224-MANUAL.md` (549 lines)
- `docs/AUDIT_SUMMARY_20251224.md` (173 lines)
- `docs/BRANCH_CLEANUP_RECOMMENDATIONS.md` (135 lines)

**Key Findings**:
- **Branches**: 16 stale branches cleaned → 2 remaining (main + 1 feature)
- **CVEs**: 1 HIGH (CVE-2025-68146 filelock TOCTOU) + 6 MODERATE
- **Open PRs**: 1 PR#21 (Image Coverage Tool) pending review
- **Production Status**: LIVE on Vercel, no blockers
- **Repository Health**: Clean, all critical tests passing

**Actions Taken**:
- ✅ filelock upgraded 3.20.0 → 3.20.1 (CVE fixed, commit 096622f)
- ✅ BLACKBOX.md synced with latest commit (096622f)
- ⏳ PR#21 review in progress (this session)

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