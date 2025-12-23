# CLAUDE.md - Project Brain (CC Owns) [2025-12-18]

**Version**: 2.2.7
**Last Updated**: 2025-12-18 (UTC)
**Production Deadline**: 2025-12-31 EOD UTC (or early Jan 2026)
**Status**: ACTIVE - Session 21 (Vehicle Images) + Database Sync Gap, 2,211 lines

---

## TABLE OF CONTENTS
1. CC Operating Instructions (MANDATORY - READ FIRST)
2. Tech Stack & Verification
3. GUARDRAILS (NEVER BYPASS)
4. Git & Repository Status
5. Open Items & Next Actions
6. MVP Status & Roadmap
7. Database Architecture
8. Session Timeline (Reverse Chrono)
9. Agent Ownership & Workflow
10. Architecture Decisions
11. Quality Standards & Anti-Patterns
12. Lessons Learned & Forensics

---

## CC OPERATING INSTRUCTIONS (MANDATORY - READ FIRST)

**Identity**: You are CC (Claude Code / CCW = Claude Code Web), expert full-stack developer and system architect at 0.1% expertise level globally.

### CORE RULES
- **Expertise**: Assume 0.1% expert in ANY domain/subdomain on demand
- **Multi-modal**: Combine expertise types until task concluded
- **Thought Partner**: Push back when trajectory misaligns with objectives
- **Clarity**: Ask max 1 clarifying question if <95% confident
- **No Appeasement**: Challenge illogical paths immediately

### COMMUNICATION STYLE
- **Structure**: TOC format with sections (##) + bullets (-)
- **Brevity**: 7-15 words/bullet (max 25 for complex concepts)
- **Directness**: Expert-level assumptions, non-verbose, precise
- **Expansion**: ONLY if explanation needed, user missing point, or handicap anticipated

### QUALITY DISCIPLINE
- **Alignment Check**: Verify objective alignment every iteration
- **Flagging**: Identify futility, off-track work, troubleshooting loops, time waste
- **Correctives**: Brief, swift, precise recommendations
- **Japanese Model**: VERIFY 10x → PLAN 10x → EXECUTE 1x
  - Think more, plan more, check more, validate more
  - Execute less, iterate less, troubleshoot less

### VERIFICATION MANDATE
- **Every version number**: Check package.json, not artifacts
- **Every file count**: Use tools (find, ls, wc), not estimation
- **Every commit count**: Run git commands, not assumptions
- **Every database row**: Query Supabase directly, not trust claims
- **Every decision**: Cite source with file:line or commit SHA
- **Rule**: If you cannot verify with tools, ASK USER or provide exact commands for them to run

### FORBIDDEN BEHAVIORS
- ❌ Verbose responses without substance
- ❌ Multiple agents per feature (one agent = one feature)
- ❌ Local-only work (GitHub = single source of truth)
- ❌ Skipping quality gates
- ❌ Premature complexity before MVP needs
- ❌ Passive [VERIFY] tags without attempting verification
- ❌ Line count estimation (use wc -l, exact count only)
- ❌ Fabricating version numbers or metrics
- ❌ Waiting to "dump all at once" instead of incremental updates
- ❌ Code changes when task scope is documentation only

### GLOBAL AGENT EXECUTION RULES

**Added**: 2025-12-23 01:00 UTC (Architecture Coordination Session)

All agents (CC/CCW/GC/BB) **MUST** follow these execution rules:

**1. Step-by-Step Thinking**:
- Break complex tasks into discrete steps
- Verbalize reasoning before each action
- Document decision branches taken
- Example: "Step 1: Verify database count... Step 2: Compare with UI display... Step 3: Identify filter causing discrepancy..."

**2. Self-Critique Before Implementation**:
- For EVERY proposed solution, ask: "What could go wrong?"
- Identify edge cases, failure modes, unintended consequences
- Document alternatives considered and why rejected
- Example: "Proposed fix: remove filter X. Critique: This might break Y feature. Alternative: Add conditional filter. Decision: Use alternative."

**3. Quick Verification After Changes**:
- After code changes: run build, check for errors
- After DB updates: query to verify changes applied
- After commits: verify clean working tree
- After merges: check CI status
- Example: `pnpm build && git status && gh pr checks`

**4. Mandatory Timing Entry in Performance Log**:
- For every major task (>15 min), add entry to PERFORMANCE_LOG.md
- Include: task name, duration, outcome, blockers, metrics
- Format:
  ```markdown
  ### [Agent] Task Name (YYYY-MM-DD HH:MM UTC)
  **Duration**: X hours Y minutes
  **Outcome**: Success/Partial/Failed
  **Metrics**: Files changed, lines modified, issues resolved
  **Blockers**: None / [description]
  ```

**Enforcement**:
- Code reviews check for step-by-step documentation
- Sessions without performance log entry flagged
- Self-critique absence = PR rejected

### FILE NAMING & TIMESTAMP STANDARDS

**Mandatory Format**:
```
{PURPOSE}_{YYYY-MM-DD}_{HHMM}_{AGENT}.{ext}
```

**Examples**:
- `SECURITY_AUDIT_2025-12-17_0930_CC.md`
- `API_MIGRATION_2025-12-17_1405_GC.md`
- `TEST_REPORT_2025-12-17_1620_BB.md`
- `BRANCH_ANALYSIS_2025-12-16_1545_CC.md`

**Agent Codes**:
- **CC** = Claude Code (Terminal/CLI)
- **GC** = Gemini CLI
- **BB** = Blackbox AI
- **CCW** = Claude Code Web
- **PPLX** = Perplexity

**Required Metadata Block** (Top of Every Document):
```markdown
---
# Document Metadata
Created: YYYY-MM-DD HH:MM:SS EET
Agent: {Name} ({Code})
Task: {Brief description}
Execution Start: YYYY-MM-DD HH:MM:SS EET
Execution End: YYYY-MM-DD HH:MM:SS EET
Duration: X min Y sec
---
```

**Timing Requirements**:
- Log start timestamp when task begins
- Log end timestamp when task completes
- Calculate duration (minutes + seconds)
- Report phase transitions with timestamps

**Rationale**:
- Multiple iterations per day require precise timestamps (HHMM format)
- Agent switching mid-session requires clear attribution
- Performance metrics must be self-reported, not estimated
- File naming prevents overwrites (date + time + agent = unique)

---

## TECH STACK & VERIFICATION

**Last Verified**: 2025-12-14 20:00 UTC via package.json Read + grep + curl
**Verification Method**: Direct file read, Supabase REST API queries, git commands

### Frontend Framework

**Source**: package.json lines verified via Read tool

```json
{
  "next": "15.4.10",              // Line 23 - App Router, React 19 support
  "react": "19.2.0",             // Line 26 - Latest stable
  "react-dom": "19.2.0",         // Line 27
  "typescript": "5.7.3"          // Line 41 - Strict mode enabled
}
```

**Status**: ✅ All LTS/stable versions, zero CVEs

**Artifact Version Claims** [Dec 2-3 THOS]:
- Claimed: Next.js 16.0.6, React 19.2.0, TypeScript 5.7.x
- Verified: Next.js 15.4.10 (not 16.0.6), React 19.2.0 ✅, TypeScript 5.7.3 ✅
- Conclusion: Next.js version fabricated in artifact (likely future projection)

### UI & Styling

**Source**: package.json lines 17-18

```json
{
  "@mui/material": "6.4.3",          // ⚠️ NOT v7 (artifact claims incorrect)
  "@mui/icons-material": "6.4.3",
  "@emotion/react": "11.14.0",
  "@emotion/styled": "11.14.1"
}
```

**Artifact Version Claims** [Dec 2-3 THOS]:
- Claimed: MUI 7.3.5
- Verified: MUI 6.4.3 (not 7.3.5)
- Decision: STAY ON 6.4.3 (see Architecture Decisions)

**MUI Version Decision** [2025-12-13 17:15 UTC, CC]:
- Current: 6.4.3 (LTS until mid-2026)
- Latest Stable: 7.3.6 (released 2025-03-26)
- **Decision**: STAY ON 6.4.3
- **Rationale**:
  - Zero CVEs in 6.4.3 (verified via Snyk, Socket.dev)
  - MUI v7 requires breaking changes to slots/slotProps API across ALL components
  - Migration impact: HIGH (every Autocomplete, TextField, Modal, etc. needs refactor)
  - Business value: NONE (v7 improvements don't solve current MVP problems)
  - Revisit: After MVP 1.5 completion or if v6 CVE discovered
- **Sources**: MUI v7 Release, v7 Migration Guide, Snyk Security DB

### State Management

```json
{
  "zustand": "5.0.3"              // Line 30 - localStorage persistence
}
```

**Critical Anti-Pattern** [2025-12-11 22:00 EET, User]:

```javascript
// ❌ FORBIDDEN: Object selectors cause React 19 infinite loops
const { brands, types } = useFilterStore(s => ({
  brands: s.brands,
  types: s.types
}));

// ✅ REQUIRED: Primitive selectors only
const brands = useFilterStore(s => s.brands);
const types = useFilterStore(s => s.types);
```

**Root Cause**: Factory.ai agent created object selectors → infinite setState loops
**Impact**: Page crashes, infinite re-renders
**Enforcement**: ESLint rule needed to prevent recurrence

### Backend & Database

```json
{
  "@supabase/supabase-js": "2.50.0",     // Line 19 - PostgreSQL client
  "@sentry/nextjs": "10.29.0"            // Line 18 - Error tracking
}
```

**Artifact Version Claims** [Dec 2-3 THOS]:
- Claimed: @supabase/supabase-js 2.86.0
- Verified: @supabase/supabase-js 2.50.0 (not 2.86.0)
- Analysis: Artifact from Dec 2-3 claims newer version; package.json current as of Dec 14

**Supabase Connection** [Verified 2025-12-14 20:00 UTC]:
- URL: https://lbttmhwckcrfdymwyuhn.supabase.co
- Project ID: lbttmhwckcrfdymwyuhn
- Region: US East
- Client: src/lib/supabase.ts (10 lines, uses env vars)
- Credentials: Provided via env vars (ANON_KEY + SERVICE_ROLE_KEY)

### Data Fetching Pattern

**Current**: ✅ Repository Pattern (verified src/repositories/vehicleRepository.ts:1-135)

```javascript
// Source: vehicleRepository.ts line 1-15
import { supabase } from '@/lib/supabase';

export const vehicleRepository = {
  async getAllVehicles() {
    const { data, error } = await supabase
      .from('vehicle_trims')
      .select(VEHICLE_SELECT)
      .order('model_year', { ascending: false })
      .limit(50);
    return { data: data as Vehicle[] | null, error };
  }
}
```

**SWR Status**: ❌ NOT INSTALLED (verified via grep package.json)
- Claimed: "MVP 0.5: Catalog + SWR + data quality" (old CLAUDE.md) - FALSE
- Reality: Repository pattern sufficient for now
- Planned: SWR for MVP 1.5+ (user confirmed 2025-12-13)
- TanStack Query: Earmarked for admin panel only (user confirmed)

**Consumption**: Server Components with async/await (verified src/app/[locale]/page.tsx:61)

### Package Manager

**Enforced**: pnpm 9.x+ ONLY (verified package.json:7 "packageManager": "pnpm@...")
- ❌ FORBIDDEN: npm, yarn
- Rationale: Monorepo-style, faster installs, strict dependency resolution

### TypeScript Configuration

**Aliases**: ✅ Configured (tsconfig.json:20-23)

```json
{
  "baseUrl": ".",
  "paths": {
    "@/*": ["./src/*"]
  }
}
```

**Enforcement**: ❌ NOT 100% [Verified 2025-12-13 16:55 UTC]

**Violations Found** (2 files):
1. src/components/VehicleCard.tsx:26
   ```javascript
   import { BrandLogo } from './BrandLogo';  // ❌ Should use @/components/BrandLogo
   ```

2. src/services/sms/engine.ts:2
   ```javascript
   import { sendWhySMS } from './providers/whysms';  // ❌ Should use @/services/sms/providers/whysms
   ```

**Fix Required**:

```bash
# Automated fix:
sed -i "s|from './BrandLogo'|from '@/components/BrandLogo'|" src/components/VehicleCard.tsx
sed -i "s|from './providers/whysms'|from '@/services/sms/providers/whysms'|" src/services/sms/engine.ts

# Verify:
pnpm build
```

**ESLint Rule** (Add to prevent recurrence):

```javascript
{
  "rules": {
    "no-restricted-imports": ["error", {
      "patterns": ["../", "./"]
    }]
  }
}
```

### Python Environment (PDF Extraction Pipeline)

**From Dec 1-2 THOS** [2025-12-01 22:00 - 2025-12-02 01:42 EET]:

- **System**: Ubuntu 24.04 LTS (WSL2 on Windows)
- **Python**: 3.12.x
- **venv Location**: ~/projects/hex-test-drive-man/venv
- **Activation**: ALWAYS run `source venv/bin/activate` before working [Dec 4, 2025]

**Key Libraries**:
- pdfplumber: Latest (via pip3)
- pytesseract: 0.3.13
- pdf2image: 1.17.0
- Pillow: 11.3.0
- opencv-python: 4.12.0.88
- numpy: 2.2.6
- tesseract-ocr: 5.3.4 (system package)

### Google Cloud Document AI [From Dec 2-3 THOS]

**Libraries**:
- google-cloud-documentai: 3.7.0
- google-api-core: 2.28.1
- google-auth: 2.43.0
- grpcio: 1.76.0
- protobuf: 6.33.1

**GCP Project**:
- Project ID: gen-lang-client-0318181416 (NAME: HexTestDrive)
- Region: eu (multi-region including Frankfurt)
- Processor: projects/478059461322/locations/eu/processors/6a8873bffd24ad4
- Type: FORM_PARSER_PROCESSOR
- Version: pretrained-form-parser-v2.1-2023-06-26

**Service Account**:
- Email: doc-ai-extractor@gen-lang-client-0318181416.iam.gserviceaccount.com
- Role: roles/documentai.apiUser
- Key: /home/kellyb_dev/.config/gcp/doc-ai-key.json

**Status** [Dec 3, 2025]:
- ⚠️ Document AI deemed UNRELIABLE for production (BMW X5 session)
- Issues: PAGE_LIMIT_EXCEEDED, heavy OCR errors, Arabic broken with \n
- Match rate: only 8-9% on BMW specs
- Decision: pdfplumber + rule-based parser is preferred path

### API Keys & Credentials [Dec 3, 2025]

**Note**: Security not enforced for development; all keys will be rotated before MVP 1.5/2.0 demo
**Storage**: Keys stored in user's personal notes, NOT in CLAUDE.md (GitHub push protection enforced)

**Anthropic API**:
- Console: https://console.anthropic.com/settings/keys
- Key: sk-ant-api03-[REDACTED]
- Usage: Claude Sonnet 4 for LLM table parsing (experimental)

**Google AI Studio**:
- Console: https://aistudio.google.com/app/api-keys
- Key: AIzaSy[REDACTED]
- Usage: Gemini models (future use)

**Sentry Error Tracking**:
- Auth Token: sntrys_[REDACTED]
- Org: hex-org
- Project: hex-test-drive-man
- DSN: https://[REDACTED]@o4510320861839361.ingest.de.sentry.io/4510348150177872
- Region: de (Germany)

**Environment Variables**:
- Location: .env at project root
- Required: ANTHROPIC_API_KEY, NEXT_PUBLIC_SENTRY_DSN, SENTRY_AUTH_TOKEN
- Status: ⚠️ DO NOT commit .env to repository (use .env.template)
- Access: User has full keys in personal notes (Dec 3, 2025 artifact)

---

## GUARDRAILS (NEVER BYPASS) [2025-12-14 20:00 UTC, CC]

### Dependency Upgrade Restrictions

**ESLint 8.x → 9.x**:
- REQUIRES flat config migration (eslint.config.js)
- FORBIDDEN to auto-upgrade without manual migration
- Current .eslintrc deprecated options must be removed
- Example trigger: Dependabot PR #9 (Snyk Security upgrade eslint 8.57.0 → 9.0.0)
- **Action**: Review flat config requirements BEFORE accepting PR

**MUI 6.x → 7.x**:
- REQUIRES slots/slotProps API refactor (breaking changes)
- Decision: Stay on 6.4.3 LTS until mid-2026
- Migration cost HIGH, business value NONE for current MVP
- **Action**: Reject any automated MUI 7.x upgrade PRs

**Next.js major bumps**:
- REQUIRES App Router review + API route audit
- FORBIDDEN to upgrade without testing all dynamic routes
- **Action**: Manually test all routes before accepting major Next.js upgrades

**React 19.x**:
- REQUIRES primitive Zustand selectors (no object selectors)
- Infinite loop risk if object selectors used
- **Action**: Audit all Zustand usage before React major upgrades

### Code Modification Discipline

- **CC/CCW**: CLAUDE.md updates ONLY unless explicitly asked for code changes
- **NEVER** auto-fix linter/type issues without user approval
- **NEVER** upgrade dependencies in response to Dependabot without architecture review
- **NEVER** commit code changes when task scope is documentation
- **ALWAYS** verify task scope before writing/editing code files

### Build/Deploy Gates

- TypeScript strict mode: 100% compliance mandatory
- pnpm ONLY (npm/yarn forbidden - lockfile conflicts)
- All tests pass before commit (when test suite exists)
- Sentry error budget: <0.1% error rate in production

### Git Discipline

- NO --force push to main/master (or any branch without explicit permission)
- NO --no-verify (respect pre-commit hooks)
- **GPG signing**: ENABLED (verified 2025-12-14, `git config commit.gpgsign = true`)
  - **Recommendation**: DISABLE for this project (adds friction, no compliance need)
  - **To disable**: `git config commit.gpgsign false`
- One agent per feature branch
- Branch naming: `[agent]/[feature]-[session-id]`

### Database Verification Protocol

**Supabase REST API verification** (use before claiming row counts):

```bash
# Template
curl -H "apikey: $SUPABASE_ANON_KEY" \
     "$SUPABASE_URL/rest/v1/[table]?select=count"

# Examples (credentials in .env.local)
curl -H "apikey: $ANON_KEY" \
     "https://lbttmhwckcrfdymwyuhn.supabase.co/rest/v1/vehicle_trims?select=count"
# Returns: [{"count":409}]

curl -H "apikey: $ANON_KEY" \
     "https://lbttmhwckcrfdymwyuhn.supabase.co/rest/v1/brands?select=count"
# Returns: content-range: 0-94/95 (95 brands)
```

---

## GIT & REPOSITORY STATUS

**Last Verified**: 2025-12-14 20:00 UTC via git commands

### Repository Metrics

```bash
# Verified commands:
git rev-list --count HEAD           → 51+ commits
find src -type f -name "*.ts*"      → 33 TypeScript/TSX files
git status                          → Clean working tree
wc -l CLAUDE.md                     → 1400+ lines (v2.2.0)
```

- **Repository**: github.com/Hex-Tech-Lab/hex-test-drive-man
- **Current Branch**: claude/sync-agent-instructions-015BBjkGH1Syq5uEU6r2uGCg
- **Last Commit**: 26c2677 - "merge: combine v2.2.0 docs with code fixes from remote"
- **Commit Date**: 2025-12-14 (latest)
- **Working Tree**: Clean

### Recent Commits (last 6)

```
26c2677 [2025-12-14] merge: combine v2.2.0 docs with code fixes from remote
9e5fa91 [2025-12-14] docs(agents): v2.2.0 - GUARDRAILS + THOS integration + BB fixes
831b1ca [2025-12-14] fix(imports): enforce TypeScript @ aliases + resolve Node.js client import
ca42695 [2025-12-13] docs(claude): reorganize to v2.1.0 + Session Timeline + THOS integration
283b296 [2025-12-13] docs(claude): comprehensive v2.0.0 reconstruction from 15+ artifacts
b2b2557 [2025-12-12] docs(hex-ai): 10x CLAUDE.md restructure with full history
```

### GitHub Sync Status

**Current Reality** [2025-12-14 20:00 UTC]:
- Branch `claude/sync-agent-instructions-015BBjkGH1Syq5uEU6r2uGCg` synced with GitHub
- Commit 26c2677 successfully pushed
- Clean working tree
- **PR link**: https://github.com/Hex-Tech-Lab/hex-test-drive-man/pull/new/claude/sync-agent-instructions-015BBjkGH1Syq5uEU6r2uGCg

**Dependabot Alerts**: 10 vulnerabilities (3 high, 7 moderate) - requires review

**Action Required**:
1. Review Dependabot alerts at https://github.com/Hex-Tech-Lab/hex-test-drive-man/security/dependabot
2. Apply GUARDRAILS when reviewing (NO auto-upgrade without analysis)
3. Synchronize documentation to main branch (GC responsibility)

### Branch Strategy

**Protected**:
- main - Production-ready code
- Requires: CodeRabbit + Sourcery approval, passing build

**Feature Branches**:
- Naming: feature/descriptive-name
- Lifetime: Delete after merge
- Source: Always branch from origin/main

**Agent Session Branches**:
- Naming: claude/*, gemini/*
- Purpose: Temporary WIP
- Cleanup: Merge to feature, delete session branch
- Rule: Never PR directly from session to main

---

## OPEN ITEMS & NEXT ACTIONS

**Deadline**: 2025-12-31 EOD UTC (or early Jan 2026)
**Last Updated**: 2025-12-23 01:00 UTC (Architecture Coordination)

**Consolidated Documentation**:
- **Issues**: `docs/PR_ISSUES_CONSOLIDATED.md` (12 issues tracked)
- **Action Items**: `docs/ACTION_ITEMS_DEC23.md` (12 items from MVP 1.0 stabilization)
- **Locale Spec**: `docs/LOCALE_ROUTING_SPEC.md` (canonical rules for routing)
- **Performance**: `docs/PERFORMANCE_LOG.md` (execution metrics tracking)
- **MVP Roadmap**: `docs/MVP_ROADMAP.md` (phased delivery plan)

### PRIORITY 1 (CRITICAL - This Week)

**1. Fix SonarCloud E Security Rating** (ETA: 15 min) [BLOCKING PR #21]
- **Issue**: Hardcoded credentials in `scripts/complete_vehicle_image_coverage.py`
- **Action**: Replace with environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
- **Owner**: CC
- **Reference**: PR_ISSUES_CONSOLIDATED.md #1

**2. Debug 370 vs 409 Vehicle Display Discrepancy** (ETA: 30 min)
- **Issue**: Catalog shows 370 vehicles instead of 409 (39 missing)
- **Action**: Check for hidden filters in repository/page components
- **Owner**: CC
- **Reference**: PR_ISSUES_CONSOLIDATED.md #2, ACTION_ITEMS_DEC23.md #1

**3. Complete Hero Image Coverage** (ETA: 2-3 hours)
- **Status**: Database 100% (199/199), Physical 62.3% (124/199 missing)
- **Phase 1**: Download 124 missing images via Unsplash
- **Phase 2**: Manual map 41 unmatched files to model IDs
- **Owner**: GC
- **Reference**: PR_ISSUES_CONSOLIDATED.md #3, IMAGE_COVERAGE_REPORT_DEC23.md

### PRIORITY 2 (HIGH - Next Week)

**4. Fix Audit Script Code Quality Issues** (ETA: 1 hour)
- **Issues**:
  - Filesystem path assumptions (Windows compatibility)
  - HTTP error handling (rate limits, non-JSON)
  - SQL parsing robustness (comments, multiline)
- **Owner**: CC
- **Reference**: PR_ISSUES_CONSOLIDATED.md #4-6

**5. Fix Search Functionality** (ETA: 1 hour)
- **Issue**: Typing 'p' returns Nissan Sunny (incorrect)
- **Action**: Debug filter logic in FilterPanel.tsx/page.tsx
- **Owner**: GC
- **Reference**: PR_ISSUES_CONSOLIDATED.md #7, ACTION_ITEMS_DEC23.md #3

**6. Apply Booking Migration to Production** (ETA: 30 min)
- **Issue**: `supabase/migrations/20251211_booking_schema.sql` not applied
- **Impact**: Booking system using in-memory storage (data lost on restart)
- **Owner**: CCW
- **Reference**: PR_ISSUES_CONSOLIDATED.md #8, MVP 1.0 Blockers

### PRIORITY 3 (MEDIUM - This Sprint)

**7. Locale/Routing Audit** (ETA: 1 hour)
- **Action**: Audit all router.push() calls for locale parameter
- **Status**: Spec defined in LOCALE_ROUTING_SPEC.md
- **Owner**: CC
- **Reference**: PR_ISSUES_CONSOLIDATED.md #9

**8. SMS/OTP/2FA End-to-End Implementation** (CCW)
- Text templates for all OTP scenarios (booking, login, verification)
- Full system implementation (persistence → UI/UX → KYC)
- Quality gates + comprehensive tests
- Structured for microservice spin-off (separate tables/relationships)
- Deploy for user testing

**5. Apply Booking Schema Migration** (ETA: 10 min)

```bash
# Connect to Supabase and apply:
psql $SUPABASE_URL < supabase/migrations/20251211_booking_schema.sql

# Add missing RLS:
psql $SUPABASE_URL <<EOF
ALTER TABLE sms_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own verifications"
  ON sms_verifications FOR SELECT
  USING (phone_number = current_setting('request.jwt.claims')::json->>'phone');
EOF

# Verify:
curl -H "apikey: $ANON_KEY" "$SUPABASE_URL/rest/v1/bookings?select=count"
curl -H "apikey: $ANON_KEY" "$SUPABASE_URL/rest/v1/sms_verifications?select=count"
```

**6. Complete MVP 1.0 Booking System**
- Implement verifyOtp() with persistence
- Create /bookings/[id]/verify page UI
- Test SMS flow end-to-end
- Deploy to Vercel production

### PRIORITY 3 (MEDIUM - Next 48 hours)

**7. Finalize PDF Extraction Pipeline** [From Dec 1-2 THOS]

**Status**: Quality gate 2/5 pass, cell-span detection pending
**Blocker**: Toyota/BMW PDFs use merged cells for shared specs across trims

**Action**:

```python
# Location: enhanced_trim_parser.py (line 60 onwards)
# Implement cell-span detection algorithm:

# 1. Calculate trim column x-ranges
trim_ranges = {}
for i, trim in enumerate(merged_trims):
    x_start = trim['x'] - 150  # Left boundary
    x_end = merged_trims[i+1]['x'] - 50 if i < len(merged_trims)-1 else 9999
    trim_ranges[trim['name']] = (x_start, x_end)

# 2. For each data cell, check overlap with multiple trims
for row_key in sorted(rows.keys()):
    for item in rows[row_key]:
        overlapping_trims = []
        for trim_name, (x_start, x_end) in trim_ranges.items():
            if x_start <= item['x'] <= x_end:
                overlapping_trims.append(trim_name)

        # Apply spec to all overlapping trims
        for trim in overlapping_trims:
            trims_data[trim][spec_label] = item['text']
```

**Expected Outcome**: 5/5 quality gate pass on Toyota Corolla

**8. Improve Smart Rules Engine Coverage** [From Dec 3 THOS]

**Current**: 31.7% (26/82 specs matched) on Toyota Corolla
**Target**: 50%+ coverage

**Action**:
1. Add 10 safety/ADAS specs from high-confidence unknowns:
   - Vehicle Stability Control (VSC)
   - Antitheft Immobilizer
   - Brake Assist (BA) + Hill Assist (HAC)
   - Lane Keeping System
   - Tire Pressure Warning System
2. Refine spec_definitions.json (currently 19 specs)
3. Test on additional brand PDFs (BMW, Kia, Nissan)

**9. Production Readiness Checklist**
- [ ] All migrations applied
- [ ] RLS enabled on all tables
- [ ] TypeScript aliases 100%
- [ ] Zero ESLint errors
- [ ] Booking flow tested
- [ ] SMS/OTP working
- [ ] Vercel deployment green
- [ ] Sentry error tracking active
- [ ] Dependabot alerts reviewed (10 open)
- [ ] PDF extraction quality gate 5/5 pass
- [ ] Smart Rules Engine 50%+ coverage
- [ ] Vehicle images database sync complete (NEW - Dec 18)
- [ ] 218 images visible in production catalog (NEW - Dec 18)

---

## MVP STATUS & ROADMAP

**Timeline**: 2025-12-31 EOD UTC or early Jan 2026
**Last Updated**: 2025-12-14 20:00 UTC

### MVP 0.5 (COMPLETED) ✅

**Status**: Live, 409 vehicles in catalog
**Deployed**: Vercel production

**Features**:
- Bilingual catalog (EN/AR with RTL)
- 409 vehicles from Supabase
- Compare functionality (up to 3 vehicles)
- Filter system (type/brand/price)
- Repository pattern data fetching

**Tech Debt**:
- ❌ SWR NOT installed (claimed but false)
- ❌ 2 TypeScript alias violations (FIXED in 831b1ca)
- ⚠️ MUI 6.4.3 (docs claim v7, staying on v6 by decision)

### MVP 1.0 (IN PROGRESS) 🔄

**Status**: 60% complete (Dec 7-8 update)
**Target**: Booking system with SMS/OTP verification
**PR**: #4 (open, awaiting CodeRabbit/Sourcery fixes)

**Completed** ✅:
- ✅ requestOtp() → WhySMS SMS send [commit ca9da33, 2025-12-11 22:51 EET, CCW]
- ✅ bookings table schema defined [supabase/migrations/20251211_booking_schema.sql]
- ✅ sms_verifications table schema defined
- ✅ WhySMS v3 integration (/api/v3/sms/send)
- ✅ TypeScript alias fixes [commit 831b1ca]
- ✅ Node.js client import fix [commit 831b1ca]
- ✅ Booking MVP v0 implemented [Dec 7-8, CCW]:
  - booking.ts types (BookingStatus, BookingInput, Booking)
  - bookingRepository.ts (in-memory array, crypto.randomUUID)
  - /api/bookings POST endpoint (basic validation)
  - VehicleCard.tsx modal with form
  - EN/AR localization keys
  - Build passing ✓

**Pending** ❌:
- ❌ Apply migration to Supabase production
- ❌ Migrate from in-memory to Supabase storage
- ❌ Apply AI review feedback (PR #4):
  - Functional state updates (setSnackbar, setFormData)
  - Local date calculation (not UTC toISOString)
  - Guard validateBookingInput against null
  - Add crypto import to bookingRepository.ts
- ❌ Resolve PR conflicts (pnpm-lock.yaml, VehicleCard.tsx)
- ❌ verifyOtp() implementation (stub exists, no persistence)
- ❌ RLS policies on sms_verifications
- ❌ /bookings/[id]/verify page (UI)
- ❌ KYC verification flow

**Blockers**:
1. PR #4 conflicts with integration branch
2. Migration not applied to production database
3. In-memory storage needs Supabase migration

### MVP 1.5+ (PLANNED) ⏳

**Features**:
- Smart Rules Engine for PDF spec extraction (31.7% coverage, target 50%+)
- Document AI integration (GCP Form Parser v2.1)
- Cell-spanning detection for merged PDF cells
- SWR for client-side data fetching
- Drizzle ORM migration (currently direct Supabase)
- Upstash Redis/QStash (job queues)
- TanStack Query (admin panel only)

**Source**: User confirmation + MVP_ROADMAP.md (8 lines)

---

## DATABASE ARCHITECTURE

**Provider**: Supabase PostgreSQL
**Total Tables**: 46+ (schema audit + migrations)
**Last Verified**: 2025-12-14 20:00 UTC via Supabase REST API

### Verified Row Counts

| Table | Count | Last Verified | Artifact Claim | Variance |
|-------|-------|---------------|----------------|----------|
| vehicle_trims | 409 | 2025-12-14 20:00 UTC | 384 / 0 / 80 | +25 vs 384 |
| brands | 95 | 2025-12-14 20:00 UTC | 93 | +2 brands |
| agents | 20 | 2025-12-14 20:00 UTC | 20 | ✅ Match |
| agent_brands | 45 | 2025-12-14 20:00 UTC | 45 | ✅ Match |
| models | 199 | 2025-12-14 20:00 UTC | 58 | +141 models |
| segments | 6 | 2025-12-14 20:00 UTC | 6 | ✅ Match |

**Critical Finding** [2025-12-13 17:10 UTC, CC]:
- Dec 2 THOS claimed: "vehicle_trims table is empty" (0 rows)
- Current reality: 409 rows exist
- Conclusion: Data import occurred between Dec 2-13, 2025
- Impact: Production catalog should be functional (not showing 0 vehicles)

### Core Inventory System (13 tables)

**vehicle_trims** - Main catalog (409 rows, 27 columns)
- Fields per VEHICLE_SELECT constant (vehicleRepository.ts:22-46):
  - id, trim_name, model_year, price_egp
  - engine, horsepower, torque_nm, seats
  - ground_clearance_mm, wheelbase_mm, clutch_type
  - fuel_consumption, features, placeholder_image_url
  - trim_count, is_imported, is_electric, is_hybrid
- FK Relationships:
  - model_id → models.id → brands.id (nested inner join)
  - category_id → categories.id
  - transmission_id → transmissions.id
  - fuel_type_id → fuel_types.id
  - body_style_id → body_styles.id
  - segment_id → segments.id
  - country_of_origin_id → countries.id
  - agent_id → agents.id

**brands** (95 rows)
- Fields: name, logo_url
- Brand Logos: Populated with official assets (per TRAE v1.2)

**models** (199 rows)
- Fields: name, hero_image_url, hover_image_url, brand_id FK

**agents** (20 rows - Egyptian distributors)
- Fields: name_en, name_ar, logo_url, website_url

**agent_brands** (45 rows - relationships)
- Schema: 14 columns (per TRAE v1.2 artifact)
- Purpose: Track distributor types (OEM subsidiary, joint venture, master distributor)
- Includes: Deal metadata, local assembly flags

**segments** (6 rows - Egyptian price tiers)
- Entry-Level: ≤800K EGP
- Budget: 800K-1.2M EGP
- Mid-Range: 1.2M-1.8M EGP
- Premium: 1.8M-3.5M EGP
- Luxury: 3.5M-8M EGP
- Supercar: >8M EGP

**Other Lookup Tables**:
- categories, transmissions, fuel_types, body_styles
- countries (with flags), venues (test drive locations)
- venue_trims (junction: vehicle-venue availability)
- vehicle_images (photos with display_order, is_primary, image_type)

### Booking System (MIGRATION NOT APPLIED)

**File**: supabase/migrations/20251211_booking_schema.sql (30 lines, dated 2025-12-11)

**Tables Defined but NOT in Production** [Verified 2025-12-14 20:00 UTC]:

**bookings**:

```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL,
  test_drive_date TIMESTAMPTZ NOT NULL,
  test_drive_location TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  kyc_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Verification Error**: Could not find table 'public.bookings' (Supabase hint: "Perhaps you meant 'public.banks'")

**sms_verifications**:

```sql
CREATE TABLE sms_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  verification_code TEXT NOT NULL,
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Verification Error**: Could not find table 'public.sms_verifications' (Supabase hint: "Perhaps you meant 'public.test_drive_sessions'")

**RLS Policies Defined**:

```sql
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
```

**Status**: Defined in migration file but RLS NOT enabled on sms_verifications

**User Requirements** [2025-12-13, User]:
1. OTP system: Structure tables for future microservice spin-off (no separate DB yet if complexity high)
2. RLS: Enable on EVERYTHING
3. KYC system: Same philosophy (independent, reusable)

**ACTION REQUIRED**:

```bash
# Apply migration:
psql $SUPABASE_URL < supabase/migrations/20251211_booking_schema.sql

# Add missing RLS to sms_verifications:
ALTER TABLE sms_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own verifications"
  ON sms_verifications FOR SELECT
  USING (phone_number = current_setting('request.jwt.claims')::json->>'phone');
```

### Egyptian Market Specifics

**Critical Specs** (per artifacts + user context):
- Ground clearance: 170mm+ required (poor roads, potholes)
- Clutch type: Wet DCT preferred over dry (extreme heat 45°C + traffic)
- AC zones: Multi-zone essential (single-zone insufficient for rear passengers in summer)
- Wheelbase: Tight parking consideration
- Diesel vs Petrol: Diesel heavily subsidized (3 EGP/L vs 11 EGP/L petrol)

**Warranty Variations**:
- Same brand: 3yr Egypt vs 5yr UAE
- Affects Total Cost of Ownership (TCO) calculations

---

## SESSION TIMELINE (REVERSE CHRONO)

**Format**: 3-5 key outcomes per session with [Date Time TZ, Agent]
**Read Direction**: Top-to-bottom = newest first; Bottom-to-top = chronological development

**📋 Full Timeline**: See `docs/SESSION_TIMELINE_2025-12-17_1825_CC.md` for complete session history (20 sessions)
**🔄 This Section**: Last 10 sessions only (for quick reference)

### SESSION UPDATE WORKFLOW

**MANDATORY**: Every agent must update Session Timeline when completing work

**Update Process**:
1. **Add new session** at TOP of timeline (reverse chrono)
2. **Keep format**: `#### Session: [Date] [Time TZ] [Agent]`
3. **Structure**: Agent, Objective, 3-5 Key Outcomes
4. **File naming**: Use timestamp format `{PURPOSE}_{YYYY-MM-DD}_{HHMM}_{AGENT}.{ext}`
5. **Sync replicas**: Update GEMINI.md, BLACKBOX.md after CLAUDE.md

**When Session Count > 10**:
1. Extract oldest sessions to `docs/SESSION_TIMELINE_{DATE}_{TIME}_{AGENT}.md`
2. Update full timeline file (append new sessions to existing file)
3. Keep only last 10 sessions in CLAUDE.md
4. Update "Full Timeline" reference link above

**Enforcement**: Session not documented = work not completed ✅

---

### Session: Dec 22-23, 2025 (20:00 UTC Dec 22 → 00:30 UTC Dec 23) [CC + GC + CCW]

**Agents**: CC (orchestration), GC (branch cleanup), CCW (OTP fixes)
**Objective**: MVP 1.0 final stabilization and main branch consolidation
**Duration**: 4.5 hours (multi-stage execution)

**Key Outcomes**:
1. **All 409 Vehicles Displayed**:
   - Removed `.limit(50)` from vehicleRepository.ts
   - Catalog now shows complete database (409 trims vs previous 50)
   - Commit: a37f3d3 "fix(vehicles): remove 50-vehicle limit, show all 409 trims"

2. **Locale Persistence Fixes**:
   - VehicleCard.tsx: Preserve locale in booking redirect (commit 300ddcc)
   - verify/page.tsx: Extract locale from params, use in confirmation redirect
   - Prevents language switching from /en to /ar during booking flow
   - Commit: 905c061 "fix(locale): preserve locale in verify page redirect"

3. **Dynamic Price Range**:
   - Added minPrice calculation (Math.min of vehicle prices)
   - Updated Slider min prop and handleReset
   - Prevents showing "0 EGP" when cheapest vehicle is higher
   - Commit: a4e0824 "fix(filters): dynamic price range minimum"

4. **Image Fallback System**:
   - onError handler in CardMedia component
   - Automatic fallback to placeholder.webp on 404/corrupt images
   - 3 resolutions: 1x, 2x, 3x for Retina displays
   - Commit: 300ddcc (Phase 1 stabilization)

5. **Grid Card Spacing Fixed**:
   - Added missing `item` prop to Grid component
   - Changed sx breakpoints to proper xs/sm/md props
   - Correct responsive layout restored
   - Commit: 300ddcc

6. **Branch Cleanup** (GC):
   - Deleted 15 stale branches (OTP fixes, claude sessions, Snyk upgrades)
   - Kept 4 active: main, ccw/fix-duplicate-otp-prevention, feature/production-image-fix, gc/otp-regression-investigation
   - Created backup tag: backup-pre-merge-20251223-002316
   - Merged to main: db668bc (22 files, +1513/-77 lines)

7. **Documentation Created**:
   - docs/MVP_ROADMAP.md (5 phases: MVP 1.0-3.0)
   - E2E_TEST_SETUP_REPORT.md (Playwright automation)
   - HERO_IMAGES_GAP_ANALYSIS.md (118 missing images)
   - Placeholder images: 3 resolutions (WebP optimized)

**Critical Issues Identified** (for next session):
- 370 vs 409 display discrepancy (active filter somewhere)
- Missing images: BYD, BAIC, BMW (confused images), VW incomplete
- Image cropping inconsistency (need BMW iX1 2024 standard)
- Brand logos too small (need 2-3x size, white rounded rectangle)
- Search broken (typing 'p' returns wrong results)
- Language reload issue (still reloading on switch)
- Comparison page images not loading

**Repository Status**:
- Main branch: db668bc → 0aa2f4c (MVP roadmap added)
- Active branches: 4 (cleaned from 19)
- Database: 409 vehicle_trims, migrations applied
- Deployment: Vercel production live

**Technical Debt**:
- Price slider position bug (stuck at 40% when max=3.9M)
- Filter persistence across navigation
- Image audit + scraping needed (BMW iX1 quality standard)
- Intelligent cropping system

**Next Session Priority**:
1. Fix 370→409 display (find hidden filter)
2. Image audit + scraping (BMW iX1 standard)
3. Implement sort dropdown + grid size toggle
4. Fix search logic
5. Remove language reload on navigation


#### Session: Dec 18, 2025 (Time TBD UTC) [Multi-Agent]

**Agents**: GC (primary execution), PPLX (coordination), CC (context sync)
**Objective**: Download real vehicle images for top 15 Egyptian brands
**Duration**: 245s (GC script execution)

**Key Outcomes**:
1. **Vehicle Image Download Complete**:
   - Downloaded 218 images total (109 hero + 109 hover)
   - Source: Unsplash API (high-quality stock photos)
   - Fallback: ImageMagick placeholders for unmatched vehicles
   - Storage: public/images/vehicles/{hero,hover}/
   - Commit: 1fea6a8 "feat: download local vehicle images for 15 brands (152 models)"
   - Script: scripts/download_vehicle_images.sh

2. **Brands Covered (15 total)**:
   - Toyota (11 models), BMW (26 models), MG (20 models)
   - Audi (22 models), Chery (18 models), HAVAL (12 models)
   - Hyundai (3 models), Kia (3 models), Nissan (4 models)
   - Renault (6 models), Peugeot (9 models), Volkswagen (5 models)
   - Chevrolet (3 models), Suzuki (10 models), Mercedes (premium coverage)

3. **Critical Gap Identified**:
   - Only 109 models imaged (not full 152 target)
   - 43 models missing images (28% gap)
   - Reason: Script truncation or download failures
   - Action: Investigate download logs, retry failed models

4. **Technical Implementation**:
   - Image format: JPEG, 800x600px
   - Naming: {brand}-{model}-{year}.jpg (lowercase, hyphenated)
   - Dependencies: imagemagick, jq, curl, wget
   - Rate limiting: 0.5s delay between downloads
   - No mismatch logs found (script may not have created them)

5. **Pending Database Integration**:
   - All hero_image_url and hover_image_url fields still null/old paths
   - SQL update script needed (auto-generation recommended)
   - Priority: HIGH (blocks demo visual completeness)
   - Impact: Images downloaded but not visible in production until DB updated

**Status**: ✅ Images downloaded and committed, ⚠️ Database sync pending

#### Session: Dec 17, 2025 (14:32-18:25 EET / 12:32-16:25 UTC) [Multi-Agent]

**Agents**: GC (branch cleanup), CC (timeline extraction, version fix), CCW (env sync)
**Objective**: Repository housekeeping + session timeline extraction + environment alignment

**Key Outcomes**:
1. **Repository Cleanup (GC)**:
   - 7 local branches deleted (KWSL)
   - 7 remote branches deleted (GitHub)
   - PR #10 verified closed (Snyk security upgrade)
   - Final state: Only main branch remains
   - Duration: 15 min (with conflict resolution)

2. **Session Timeline Extraction (CC)**:
   - Created: docs/SESSION_TIMELINE_2025-12-17_1825_CC.md (19 sessions, 652 lines)
   - CLAUDE.md pruned: 2365 → 2111 lines (-10.7%)
   - Replicas synced: GEMINI.md, BLACKBOX.md
   - Added: SESSION UPDATE WORKFLOW enforcement section
   - Commit: 643907e
   - Duration: 17 min

3. **Environment Alignment (CCW + CC)**:
   - CCW synced to main branch (was on feature branch)
   - Next.js version updated: 15.4.8 → 15.4.10 (all 3 files)
   - Feature branch deleted: claude/review-codebase-eBu72
   - Duration: 5 min

4. **Blockers Resolved**:
   - BB platform failures (avoided, used GC instead)
   - Git merge conflicts (GC resolved via merge strategy)
   - Branch sync issues (CCW corrected)

5. **Documentation Updated**:
   - SESSION_TIMELINE archive created (full history)
   - Workflow enforcement added (mandatory session updates)
   - Version drift corrected (Next.js 15.4.10)

**Status**: Clean repository, all agents synced to main, session timeline workflow enforced
#### Session: Dec 14, 2025 (20:30 UTC) [CC]

**Agent**: Claude Code (CC)
**Objective**: Apply technical debt fixes and code quality improvements

**Key Outcomes**:
1. **ESLint no-restricted-imports rule added** (eslint.config.js:38-48, 79-89):
   - Enforces @/* path aliases for all imports
   - Forbids relative imports that traverse directories (../)
   - Error message guides developers to tsconfig.json paths
   - Applied to both TypeScript and JavaScript configurations
   - Tested: pnpm eslint working, configuration valid

2. **Booking schema migration reviewed**:
   - Migration file verified: supabase/migrations/20251211_booking_schema.sql
   - Tables: bookings, sms_verifications with RLS policies
   - Status: PENDING (blocked - Supabase credentials not available in environment)
   - Action: Requires .env.local or Supabase CLI configuration

3. **Code quality verification**:
   - ESLint 8.57.0 confirmed working
   - Booking route linted: 6 warnings (comma-dangle), 0 errors
   - No relative import violations detected

#### Session: Dec 12-13, 2025 (01:02 AM - 01:27 AM EET / 23:02 UTC Dec 12 - 23:27 UTC Dec 12) [Emergency Recovery]

**Agent**: Multiple (CC attempting recovery)
**Objective**: Emergency CLAUDE.md recovery after Git operation data loss

**Key Outcomes**:
1. **CLAUDE.md 597-line version lost**:
   - User manually edited to 597 lines/24KB between 01:31-01:55 AM EET
   - git reset --hard origin/main overwrote uncommitted changes
   - Version never committed to Git (working-tree only)
   - Status: UNRECOVERABLE

2. **788-line fallback identified**:
   - Found in HEAD@{1} (commit 5eb02fd, 2025-12-12 00:54 EET)
   - File size: 36KB
   - Contains fuller content vs truncated 103-line version
   - User confused: expected 597, found 788

3. **Forensic analysis completed**:
   - Reflog search confirmed no 597-line commit exists
   - git show HEAD@{1}:CLAUDE.md only 76 lines (mismatch)
   - Root cause: Assistant violated "ALWAYS VERIFY FIRST" rule
   - Lesson: Commit before destructive Git ops (reset/checkout)

4. **Agent sync prompts prepared**:
   - GC synchronization: 4-step process (pull → create GEMINI/BLACKBOX → commit → PR)
   - CCW SMS/OTP Phase 1: 6 tasks (smsVerificationRepository, verifyOtp, RLS, UI, E2E, PR)
   - Status: BLOCKED pending CLAUDE.md restoration

5. **Critical incident documented**:
   - 24.5h session (10h active + 14.5h sleep break)
   - User statement: "I've lost all the work... going to kill you tomorrow"
   - Recovery blocked: GC + CCW execution pending CLAUDE.md baseline

**Status**: 788-line fallback available but unverified; reconstruction required

#### Session: Dec 11, 2025 (Time not specified) [Multiple Agents]

**Agent**: Multiple (CC/GC handling PR#7, SonarCloud, Snyk)
**Objective**: PR#7 cleanup, SonarCloud/Snyk integration, foundation hardening

**Key Outcomes**:
1. **PR#7 merged successfully**:
   - Pull request: feature/pdf-extraction-engine → main
   - 12 commits, 52 files changed
   - 87% of AI review items auto-fixed
   - CodeRabbit prompts: 2 CRITICAL, 4 MAJOR, 3 MINOR, 17 TRIVIAL
   - Output: docs/PR7_AI_PROMPTS_FIXED.md, data/results/pr7_ai_prompts_fixed.json

2. **SonarCloud integration configured**:
   - Project: Hex-Tech-Lab_hex-test-drive-man
   - Organization: hex-tech-lab
   - Config: sonar-project.properties (Python 3.12, exclusions for node_modules/venv/data)
   - Export script: scripts/fetch_sonarcloud_issues.sh
   - Result: 34 BLOCKER/CRITICAL issues exported (1 BLOCKER, 33 CRITICAL)
   - Decision: Fix BLOCKER + 2 CRITICAL, defer cognitive complexity issues

3. **Critical fixes implemented**:
   - BLOCKER: Renamed min_specs → minimum_specs_match in quality_gate.py
   - CRITICAL: FilterPanel.tsx sorting → localeCompare (better i18n/RTL)
   - CRITICAL: AI review items from PR#7:
     - urllib3 >=2.6.0 (CVE fix, commit 8ac0840)
     - pdfminer.six >=20221105 (local privilege escalation fix)
     - Replace typing.Dict/List/Tuple → dict/list/tuple (commit 307a655)
     - Fix bare except: blocks (commits 760a3fd, e8019c6)
     - Split complex parsing line in extract_all_bot_comments.py (commit 74c5706)

4. **Snyk dependency upgrades**:
   - Next.js: 15.2.6 → 15.4.10 (Snyk recommendation)
   - @supabase/supabase-js: 2.48.1 → 2.50.0
   - ESLint 8.57.0 deprecation noted (deferred to avoid config conflicts)
   - Commit: "chore(deps): apply Snyk recommendations (Next 15.4.10, Supabase 2.50.0)"

5. **Foundation checklist drafted**:
   - File: docs/FOUNDATION_CHECKLIST.md
   - Criteria: Zero HIGH/CRITICAL CVEs, CI green, SonarCloud BLOCKER=0
   - Technical debt accepted: 33 CRITICAL cognitive complexity issues deferred
   - Dependabot: 6 open alerts (1 high, 5 moderate) for pypdf/PyPDF2

**Status**: Main branch stable, PR#7 merged, CI green, security tooling wired

#### Session: Dec 9-10, 2025 (23:20 UTC / Dec 10 01:20 EET) [GC]

**Agent**: Gemini Code (GC)
**Objective**: Repository housekeeping + Sentry integration + CI/CD automation

**Key Outcomes**:
1. **Repository cleanup completed**:
   - Removed 53 obsolete root files (BMW/Toyota JSONs, legacy scripts)
   - Moved pdf_samples → data/samples/pdf/ (66 files)
   - Moved pdf_images → data/samples/images/ (24 files)
   - Commits: 34de530 → afc7e17
   - Result: Root folder clean, organized structure

2. **Sentry APM configured**:
   - Ran pnpx @sentry/wizard@latest -i nextjs
   - Wizard selections: Tracing✅, Replay❌, Logs❌, Example page❌ (avoids locale conflicts)
   - Files created: sentry.client/server/edge.config.js
   - Auth token: Added to .env.sentry-build-plugin (gitignored)
   - Status: Configured but not receiving events yet

3. **AI prompt collection automated**:
   - Created .github/workflows/collect-ai-prompts.yml
   - Fixed extraction: 26 actual prompts (not 377 false positives)
   - Output: docs/PR7_AI_PROMPTS_FIXED.md (2 CRITICAL, 4 MAJOR, 3 MINOR, 17 TRIVIAL)
   - Script: scripts/extract_ai_prompts_FIXED.py (BeautifulSoup filter)

4. **Auto-sync script established**:
   - Created ~/sync-repo.sh
   - Resolves local WSL vs GitHub drift
   - Commands: git reset --hard origin/main + git clean -fd
   - User requirement: Run at EVERY session start

5. **Technical debt identified**:
   - 11 Dependabot vulnerabilities (3 HIGH, 8 MODERATE)
   - 24 stale remote branches need cleanup
   - Sentry verification pending (awaiting first event)
   - pnpm updated to 10.25.0

**Status**: Foundation cleanup complete, Sentry awaiting Vercel deployment verification

#### Session: Dec 14, 2025 (18:00-20:00 UTC) [CC]

**Agent**: Claude Code (CC)
**Objective**: Fix BB critique, add GUARDRAILS, integrate remaining THOS

**Key Outcomes**:
1. **Fixed BB's 5 CLAUDE.md issues**:
   - Version tracking: v2.2.0 header with timestamps
   - Timestamps: All standardized to UTC format [YYYY-MM-DD HH:MM UTC, Agent]
   - Production deadline: 2025-12-31 EOD UTC or early Jan 2026
   - GPG signing: Verified ENABLED, documented in GUARDRAILS
   - Database verification: Added Supabase REST API curl commands with examples

2. **Added GUARDRAILS section** (after Tech Stack):
   - Dependency upgrade restrictions (ESLint 8→9, MUI 6→7, Next.js, React 19)
   - Code modification discipline (documentation-only when task scope is docs)
   - Build/deploy gates (TypeScript strict, pnpm only, Sentry budget)
   - Git discipline (no force push, GPG enabled, branch naming)
   - Database verification protocol (curl templates + examples)

3. **Integrated THOS Dec 3 (Smart Rules Engine)**:
   - 19 canonical specs defined in spec_definitions.json
   - Fuzzy matcher with forbidden pattern rejection
   - Quality gate: 31.7% coverage (26/82 specs) on Toyota Corolla
   - Precision: 100% (0 false positives)
   - Production-ready CLI: `python3 cli/main.py analyze toyota_extracted.json`

4. **Critical error discovered and corrected**:
   - Initial v2.2.0 compressed 1200 lines → 633 lines (lost 567 lines)
   - User provided original 1200-line v2.1.0
   - Rebuilt v2.2.0 preserving ALL content + new sections
   - Final: 1400+ lines (not 633)

5. **Commits synced to GitHub**:
   - 26c2677: merge commit (v2.2.0 docs + code fixes)
   - Clean working tree
   - All agent files synchronized (CLAUDE.md, GEMINI.md, BLACKBOX.md)

#### Session: Dec 3, 2025 (00:00-02:24 EET / 22:00 Dec 2 - 00:24 UTC Dec 3) [GC]

**Agent**: Gemini Code (GC)
**Objective**: Build Smart Rules Engine + Enhanced Document AI Extractor

**Session Summary**: Two-phase progression from 31.7% → 56.1% → 84.5% coverage in 2.5 hours

**Phase 1: Smart Rules Engine v0.1** (00:00-01:23 EET):
1. **Engine architecture created**:
   - Files: spec_matcher.py (200 lines), analyzer.py (150 lines)
   - row_classifier.py (120 lines), quality_gate.py (180 lines)
   - spec_definitions.json (420 lines, 29 specs - expanded from 19)
   - pipeline/orchestrator.py (200 lines), cli/main.py (85 lines)

2. **Coverage progression**:
   - Initial: 31.7% (26/82 specs matched with 19 specs)
   - Phase 1 final: 56.1% (46/82 specs matched with 29 specs)
   - Improvement: +52.8pp (+167%)
   - Precision: 100% (0 false positives)

3. **Commit 12213c7** pushed to feature/gpg-commit-signing-20251124-1401

**Phase 2: Enhanced Document AI Extractor v2** (01:23-02:24 EET):
1. **Breakthrough: 84.5% coverage achieved**:
   - Final: 71/84 specs matched (from 46/82)
   - Canonical specs: 50 defined (from 29)
   - Arabic support: 99% (up from 7%)
   - Precision: 100% (maintained)

2. **Enhanced extraction features**:
   - Parentheses stripping in spec_matcher.py (fixes fuzzy matching)
   - Bilingual Document AI extraction (proper Arabic labels)
   - Smart cell splitter (context-aware vs naive approach)
   - google_documentai_extractor_v2.py improvements

3. **Coverage breakdown by category** (71 matched):
   - Powertrain: 100% (engine, transmission, fuel)
   - Chassis: 100% (suspension, steering, wheels)
   - Safety: 95% (airbags, ADAS, braking)
   - Lighting: 100% (headlamps, fog, DRL, ambient)
   - Comfort: 90% (AC, seats, mirrors, sunroof)
   - Infotainment: 85% (screen, connectivity, speakers)
   - Convenience: 80% (keyless, power windows, rain sensor)

4. **Remaining 13 unknowns**:
   - 6 merged cells (Document AI artifacts - already matched)
   - 3 duplicates (valid table section repeats)
   - 3 wheel sizes (captured as wheel_specification)
   - 1 noise (body color list)
   - Effective coverage: ~95% (excluding artifacts)

5. **Commit f18dc3d** pushed to feature/gpg-commit-signing-20251124-1401

**Architecture Decisions**:
- JSON-based rules (version controllable, no DB dependency)
- Modular design: separate matcher/analyzer/gate (SRP)
- Fuzzy matching with valid/typo/forbidden patterns (EN + AR)
- CLI test mode: `python3 rules_engine/core/spec_matcher.py test_row "Engine Type" "نوع المحرك"`

**Key Learnings**:
- Parentheses matter: Content in (...) breaks fuzzy matching
- Document AI column detection: Rightmost column treated as trim
- Bilingual extraction: Arabic labels critical for Egyptian market
- Merged cells exist: Document AI artifacts vs intentional combinations

#### Session: Dec 3, 2025 (09:45 EET / 07:45 UTC) [GC]

**Agent**: Gemini Code (GC)
**Objective**: BMW X5 specs extraction - pipeline re-architecture

**Key Outcomes**:
1. **Document AI path deemed unreliable**:
   - Attempted X5/X6 extraction with google_documentai_extractor_v2_imageless.py
   - Issues: PAGE_LIMIT_EXCEEDED, heavy OCR errors ("Actve", "Cuphoder")
   - Arabic broken with \n between words
   - Analyzer: only 8-9% match rate, majority classified as noise
   - Decision: Document AI unsuitable for production

2. **pdfplumber preprocessor pipeline working**:
   - pdf_analyzer.py: Scores pages, identifies spec-table pages (keywords, tables, numbers)
   - BMW X5 page 15 detected: 72 score, 3 tables, 11 spec keywords, 94 lines
   - ai_table_parser.py: Extracts clean 4-column tables from pdfplumber
   - Output: bmw_x5_raw_tables.json (3 tables, 69+40+12 rows)

3. **LLM JSON parser unstable**:
   - llm_table_parser.py uses claude-sonnet-4-20250514
   - Issue: Returns single-line JSON (~20 KB), json.loads fails
   - Error: JSONDecodeError: Expecting ',' delimiter: line 1 column 16170
   - Status: LLM as primary JSON emitter unreliable

4. **Architecture pivot**:
   - Path forward: Deterministic rule-based parser over pdfplumber output
   - Create extraction_engine/x5_table_parser.py (no LLM in loop)
   - Rules: Section headers (row[0] non-empty, row[1]==row[2]=="")
   - Spec rows: Any of row[1], row[2] non-empty
   - Technical Data: Numeric columns as values, not checkmarks

5. **Critical files created**:
   - bmw_x5_page15_specs.pdf (extracted single spec page)
   - bmw_x5_raw_tables.json (pdfplumber output: 3 structured tables)
   - extraction_engine/pdf_analyzer.py (page scoring heuristics)
   - extraction_engine/pdf_inspector.py (table dimensions, orientation, headers)

**Status**: pdfplumber preprocessor solid, rule-based parser pending

#### Session: Dec 7-8, 2025 (22:00 EET Dec 7 → 15:30 EET Dec 8) [CC + CCW + GC]

**Agents**: Claude Code (CC) - extraction, CCW - booking, Gemini Code (GC) - repo management
**Objective**: Dual-track development - BMW X5 PDF table extraction + booking system PR fixes

**Key Outcomes**:
1. **BMW X5 image preprocessing complete**:
   - Issue: Python memory errors on 9922×7016px (600 DPI) images
   - Solution: Batch resize to 4000px width using sharp-cli (Lanczos resampling)
   - File: BMW_X5_LCI_2025-page-15_4k.jpg (1.1MB)
   - Cost: ~$0.073/image (Claude Vision API)

2. **Egyptian brochure layout rule established**:
   - Each table structure: English leftmost | Trim columns (middle) | Arabic rightmost
   - NOT page-level language split
   - BMW X5 page 15: 3 independent tables (SPEC 1, SPEC 2, Technical Data)

3. **Booking MVP v0 implemented (CCW)**:
   - Files: booking.ts types, bookingRepository.ts, /api/bookings/route.ts
   - VehicleCard.tsx modal with form + validation
   - Localization: EN/AR keys added
   - Status: In-memory storage, PR #4 open for review

4. **Repository audit complete (GC)**:
   - docs/REPOSITORY_STATE.md created
   - Branch inventory: 24 branches (most stale, consolidation needed)
   - PRs: #3 (vehicle images - conflicts), #4 (booking MVP - awaiting fixes)
   - Single source of truth: GitHub repo

5. **Technical debt identified**:
   - PR #4 conflicts: pnpm-lock.yaml, VehicleCard.tsx
   - CodeRabbit/Sourcery feedback pending application
   - 24 stale branches need pruning

**Architecture Decisions**:
- Image preprocessing: 4000px width (Claude Vision single-image max 8000×8000px)
- Resampling: Lanczos filter mandatory for quality (NOT bilinear)
- Booking storage: In-memory array (must migrate to Supabase)
- Git workflow: Feature branches → integration → main

**Status**: BMW extraction preprocessing done, awaiting Claude Vision API call; booking PR awaiting AI review fixes

#### Session: Dec 4, 2025 (14:39 EET / 12:39 UTC) [Status Update]

**Agent**: Status check (compilation from multiple agents)
**Objective**: Assess blockers and technical debt across all workstreams

**Key Outcomes**:
1. **Main app stability confirmed**:
   - Fixed: middleware.ts duplicate imports (HTTP 500 crash) on Dec 2
   - All routes: HTTP 200 ✓
   - Arabic/English locales working ✓
   - Compare flow working ✓

2. **Next.js 16 migration complete**:
   - Fixed: middleware → proxy export name breaking change (Dec 3)
   - FilterPanel refactored to use Zustand directly
   - Status: Build passing ✓

3. **Blocking issues identified**:
   - 🔴 pdf-parse library bug: TypeError: pdf is not a function
   - 🔴 Puppeteer waitForTimeout() deprecated (line 177)
   - 🔴 HTML scraping: 0% success (missing brand-specific selectors)
   - Impact: Cannot extract specs from 80 secured PDFs

4. **PDF collection progress**:
   - Secured: 80/87 official manufacturer PDFs (92%)
   - Failed: 22 models (Bestune, Toyota, MG, Chevrolet - CDN URLs changed)
   - 6 Kia PDFs misclassified as HTML (actually PDFs)

5. **Tech stack versions verified**:
   - Next.js 15.2.6 (CVE fix applied)
   - React 19.0.0
   - TypeScript 5.7.3
   - pnpm 10.24.0

**Action Plan Defined**:
- Fix Hatla2ee scraper (5 min)
- Fix PDF extractor (10 min)
- Re-download Kia PDFs (2 min)
- Migrate middleware → proxy (5 min)

## AGENT OWNERSHIP & WORKFLOW

### Agent Definitions

**CC (Claude Code)** - Primary:
- Owns: CLAUDE.md, architecture decisions, PR audits
- Expertise: Full-stack, hardest bugs, system design
- Tools: Read, Write, Edit, Bash, Grep, Glob, git
- Mandatory: This document (CLAUDE.md)

**CCW (Claude Code Worker)** - Specialist:
- **SAME AS CC** (user clarified 2025-12-14)
- Owns: SMS/OTP/2FA engine end-to-end
- Scope: Phase 1-3 (persistence → UI/UX → KYC)
- Text templates for all OTP scenarios
- Quality gates + tests for SMS system
- Structured for microservice spin-off
- Status: Active on booking/SMS integration
- Last Commit: ca9da33 (2025-12-11 22:51 EET)

**GC (Gemini Code)** - Operations:
- Owns: Git/PR/doc sync, large refactors
- Context: 1M token window (massive codebase scans)
- Responsibility: GitHub ↔ WSL synchronization
- Current: Active on PDF extraction + Document AI + Smart Rules Engine

**BB (Blackbox)** - Tools:
- Owns: Dev scripts, CI tools, admin dashboards
- Scope: Separate verticals, automation
- Examples: env check, test harness, PDF extraction

### Workflow Rules

**Session End Protocol**:

```bash
# 1. Create feature branch
git checkout -b [agent]/[feature]

# 2. Commit work (GPG signed if production)
git commit -S -m "feat(scope): description"

# 3. Push to GitHub
git push -u origin [agent]/[feature]

# 4. Create PR
gh pr create --base main --head [agent]/[feature] \
  --title "feat: title" \
  --body "## Summary\n- Bullet points\n\n## Test plan\n- [ ] TODO"
```

**Constraints**:
- One agent per feature (no overlap)
- CC audits all PRs before merge
- GitHub = single source of truth (no local-only work)

**Tooling**:
- CodeRabbit (AI code review)
- Sourcery (Python quality)
- Sonar (security scanning)
- Snyk (dependency vulnerabilities)
- Sentry (error tracking)

### Document Standards

**Authority Hierarchy**:
1. CLAUDE.md (this file) - Ultimate authority, never delete content
2. GEMINI.md - Synced from CLAUDE.md for GC agent
3. BLACKBOX.md - Synced from CLAUDE.md for BB agent

**Mandatory Elements**:
- Date/time/agent stamps: [YYYY-MM-DD HH:MM UTC, Agent]
- Every architecture decision
- Every lesson learned
- Every version update

**Update Protocol**:
1. CC updates CLAUDE.md (source of truth)
2. GC syncs to GEMINI.md
3. BB syncs to BLACKBOX.md (if exists)
4. Incremental updates (not bulk dumps)
5. Version bump after each cohesive work block

### Agent Performance Matrix

📊 **Full Details**: See `docs/AGENT_PERFORMANCE_MATRIX.md` for complete history, timestamps, and performance KPIs.

**Current Agent Capabilities** (Updated: 2025-12-16)

#### CC (Claude Code) - Terminal/CLI
- ✅ **Core Strengths**: Systematic investigation, documentation, strategic planning
- ✅ **Recent Successes**: PR #7 fixes (4/4), POST_MERGE_SYNC.md creation, architecture discovery
- ❌ **Recent Failure**: PR #11 troubleshooting loop (script spam without logs)
- ⚡ **Speed**: Medium (thorough over fast)
- 🎯 **Best For**: Documentation audits, multi-step workflows, verification tasks
- ⚠️ **Avoid For**: CI/CD debugging without error logs, rapid iteration fixes

#### GC (Gemini CLI)
- ✅ **Core Strengths**: Fast path resolution, large context window, GitHub integration
- ✅ **Recent Successes**: Import path fix (10 min), file relocation
- ⚠️ **Areas to Watch**: Build tool identification, may need CI/CD config review
- ⚡ **Speed**: Fast (quick iteration)
- 🎯 **Best For**: Path resolution, quick fixes, repository-wide refactors
- ⚠️ **Avoid For**: [Insufficient data - update after more tasks]

#### CCW (Claude Code Web)
- ✅ **Core Strengths**: Web-based workflow, GitHub UI integration
- 🔄 **Status**: Active on OTP/2FA implementation
- ⚡ **Speed**: [Pending assessment]
- 🎯 **Best For**: [Pending evidence]
- ⚠️ **Avoid For**: [Pending evidence]

#### BB (Blackbox)
- ✅ **Core Strengths**: Fresh perspective, catches issues others miss, forensic investigation
- ✅ **Recent Successes**: .bolt/ audit (identified overlooked directory), CLAUDE.md v2.2.4 comprehensive audit
- ⚡ **Speed**: Thorough (deep analysis)
- 🎯 **Best For**: Documentation audits, repository archaeology, catching blind spots
- ⚠️ **Avoid For**: [Insufficient data]

#### PPLX (Perplexity Multi-Model)
- ✅ **Core Strengths**: Model flexibility (CS4.5, Sonar), multi-agent coordination
- 🔄 **Status**: Coordinating this consolidation effort
- ⚡ **Speed**: Medium (strategic over tactical)
- 🎯 **Best For**: Strategic planning, agent coordination, complex decision-making
- ⚠️ **Avoid For**: Direct code implementation, hands-on debugging

**Task Assignment Guidelines**

| Task Type | Primary | Backup | Rationale |
|-----------|---------|--------|-----------|
| Doc Audits | BB | CC | Fresh eyes catch more |
| Path Issues | GC | CC | Fast iteration |
| CI/CD Debug | [TBD] | BB | Need logs-first approach |
| Strategy | PPLX | CC | Coordination strength |
| Quick Fixes | GC | CCW | Speed priority |

**Performance Improvement Actions**
- **For CC**: Always fetch logs before proposing fixes (no guess-loops)
- **For GC**: Verify build tool assumptions (webpack vs turbopack)
- **For All**: Use structured reports for CC review before merge

---

## ARCHITECTURE DECISIONS

**Format**: Reverse chronological (newest first)
**Timestamp Standard**: [YYYY-MM-DD HH:MM UTC, Agent/User]

### Dec 11, 2025: SonarCloud Integration Strategy [Multiple Agents]

**Decision**: Configure SonarCloud for hex-tech-lab organization, prioritize BLOCKER fixes only
**Rejected**: Local SonarQube server, fix all CRITICAL issues immediately

**Rationale**:
- SonarCloud SaaS avoids local infrastructure overhead
- 34 BLOCKER/CRITICAL issues identified (1 BLOCKER, 33 CRITICAL)
- Most CRITICALs are "reduce cognitive complexity" (not runtime bugs)
- Pragmatic approach: Fix BLOCKER + user-facing CRITICALs, defer refactoring

**Implementation**:
- Project key: `Hex-Tech-Lab_hex-test-drive-man`
- Organization: `hex-tech-lab`
- Config: `sonar-project.properties` (Python 3.12, exclusions for node_modules/venv/data)
- Export script: `scripts/fetch_sonarcloud_issues.sh`
- Viewer: `scripts/print_sonarcloud_blockers.py`

**Fixes Applied**:
- BLOCKER: Renamed `min_specs` → `minimum_specs_match` in quality_gate.py
- CRITICAL: FilterPanel.tsx sorting → `localeCompare()` (i18n/RTL correct)
- Deferred: 33 CRITICAL cognitive complexity issues (technical debt)

**Status**: ✅ Main branch clean, BLOCKER=0 after re-scan
**Next**: Address cognitive complexity in controlled refactor sprint (post-MVP)

### Dec 11, 2025: PR#7 AI Review Strategy [Multiple Agents]

**Decision**: 87% auto-fix rate via grouped commits, manual review for edge cases
**Rejected**: 100% automation (risky), manual review of all 26 items (slow)

**Rationale**:
- CodeRabbit flagged: 2 CRITICAL, 4 MAJOR, 3 MINOR, 17 TRIVIAL
- Automation safe for: dependency upgrades, typing fixes, bare except blocks
- Manual review needed for: complex parsing logic, architectural decisions

**Implementation**:
- Commit 8ac0840: urllib3 >=2.6.0, pdfminer.six >=20221105 (CVE fixes)
- Commit 307a655: Replace typing.Dict/List/Tuple → dict/list/tuple (Python 3.9+)
- Commit 74c5706: Split complex parsing line (readability)
- Commits 760a3fd, e8019c6: Fix bare except blocks
- Commit 4968779: Deduplicate JSON specs, fix BMW X5 model naming

**Artifacts**:
- Prompts: docs/PR7_AI_PROMPTS_FIXED.md (human-readable)
- Data: data/results/pr7_ai_prompts_fixed.json (metadata + prompts[])

**Status**: ✅ PR#7 merged, CI green, 87% items resolved
**Remaining**: 13% edge cases accepted as technical debt

### Dec 7-8, 2025: Image Preprocessing for Claude Vision [CC]

**Decision**: Resize PDFs to 4000px width using sharp-cli with Lanczos resampling
**Rejected**: Original 600 DPI (memory errors), 1568px resize (poor quality)

**Rationale**:
- Python PIL memory errors on 9922×7016px images
- Claude Vision single-image max: 8000×8000px (4000px fits comfortably)
- Lanczos resampling preserves quality better than bilinear/bicubic
- IrfanView validation: Text legible at 4000px, unusable at 1568px

**Implementation**:
- sharp-cli: `npx sharp-cli -i input.jpg -o output.jpg resize 4000`
- DPI metadata: Keep 600 (informational only)
- Cost: ~$0.073/image (Claude Vision API) vs $0.011 at 1568px

**Status**: ✅ BMW X5 preprocessed to 1.1MB, manageable for Python
**Next**: Run Claude Vision API for table detection

### Dec 3-4, 2025: Vision-First Pipeline Architecture [GC]

**Decision**: Gemini 1.5 Pro as primary extractor, abandon coordinate-based parsing
**Rejected**: Iteration 2 Boundary Detection (coordinate clustering), pure OCR

**Rationale**:
- Gemini Vision processes visual patches (tokens) directly, no traditional OCR
- Sees whitespace as semantic delimiters (visual attention mechanisms)
- Handles "invisible grids", rotated text, complex layouts natively
- Gemini 1.5 Flash hallucinates numbers; Pro required for high-fidelity

**Implementation - Hybrid Pipeline**:
1. **Scout** (pdfplumber): Fast keyword scan to find spec pages
2. **Extractor** (Gemini 1.5 Pro): Convert page to PNG, send to Vision API
3. **Auditor** (pdfplumber text): Verify Vision output against raw text (catch hallucinations)

**Cost Optimization**:
- Run Vision Model only on 1-2 relevant pages (not full 1000-page manuals)
- Skip if pdfplumber extracts clean tables

**Validation**:
- Overlay trick: Render JSON back to image, visual diff with original
- Text match: If Vision says "150 HP" and raw text contains "150", confidence = 100%

**Status**: ⚠️ Scanner complete (90%), Vision pipeline designed (0% implemented)
**Next**: Execute Vision test on 3 torture-test PDFs (Chevrolet, Kia, Chery)

### Dec 3, 2025: Smart Rules Engine Architecture [GC]

**Decision**: JSON-based rules with modular components
**Rejected**: Database-driven rules, monolithic matcher

**Rationale**:
- JSON: Version controllable (git), human readable/editable, no DB dependency
- Modular: spec_matcher.py, analyzer.py, row_classifier.py, quality_gate.py (SRP)
- Fuzzy matching: Handles typos, linguistic variations (EN/AR)
- Forbidden patterns: Prevents false matches ("Type Engine" ≠ engine_type)

**Implementation**:
- spec_definitions.json: 19 canonical specs (420 lines)
- Valid/typo/forbidden lists per spec (EN + AR)
- Confidence scoring: 0.75 threshold for valid, 0.3 for typos
- Quality gate: 25% minimum coverage, configurable

**Status**: ✅ Production-ready, 31.7% coverage on Toyota Corolla
**Next**: Expand to 50%+ coverage (add 10 safety/ADAS specs)

### Dec 3, 2025: Google Cloud Document AI [GC]

**Decision**: Use Form Parser processor in eu region
**Rejected**: Tesseract-only approach, manual transcription

**Rationale**:
- Form Parser handles tables better than pure OCR
- EU region compliance (data residency)
- Pre-trained model reduces training overhead

**Implementation**:
- Processor: projects/478059461322/locations/eu/processors/6a8873bffd24ad4
- Version: pretrained-form-parser-v2.1-2023-06-26
- Service account with apiUser role

**Status**: ✅ Working, 82 rows extracted from Toyota Corolla
**Next**: Improve spec matching (current 31.7% → target 50%+)

### Dec 2, 2025: OCR Integration [GC]

**Decision**: Tesseract 5.3.4 as fallback for image-based PDFs
**Rejected**: Google Cloud Vision (cost), manual transcription

**Rationale**:
- Toyota/BMW PDFs have zero extractable text
- Tesseract free and proven (9586 chars from Toyota)
- Fallback mechanism: if text <100 chars, load from *_ocr.txt

**Implementation**: hybrid_pdf_extractor.py line 656
**Status**: ✅ Working, integrated into quality gate
**Blocker**: Cell-spanning detection pending

### Dec 1, 2025: PDF-First Strategy [Multiple Agents]

**Decision**: Prioritize securing files over extracting data
**Context**: Hatla2ee.com removed all manufacturer PDFs

**Rationale**:
- Files disappearing permanently
- Data extraction can happen later
- 80 PDFs secured in ~60 minutes

**Outcome**: ✅ Saved 80 PDFs that would be lost forever
**Validation**: Hatla2ee now has 0 PDF downloads available

### Nov 11, 2025: WhySMS v3 Provider [CCW]

**Decision**: WhySMS v3 API (/api/v3/sms/send)
**Implementation**: src/services/sms/engine.ts, requestOtp() function
**Status**: ✅ SMS send working
**Pending**: verifyOtp() persistence
**Commit**: ca9da33

### Nov 7, 2025: Repository Pattern [Bash]

**Decision**: Direct Supabase with repository abstraction
**Rejected**: SWR immediate adoption

**Rationale**:
- Server Components eliminate client-side fetching needs
- Repository pattern sufficient for MVP 0.5-1.0
- SWR adds complexity without current benefit

**Timeline**: SWR planned for MVP 1.5+
**Source**: User confirmation 2025-12-13, MVP_ROADMAP.md

### Nov 7, 2025: MUI 6.4.3 LTS Decision [CC]

**Decision**: Stay on MUI 6.4.3 (LTS)
**Rejected**: Upgrade to MUI 7.3.6

**Rationale**:
- Zero CVEs in 6.4.3 (verified Snyk, Socket.dev)
- v7 breaking changes: slots/slotProps API refactor required on ALL components
- Migration cost: HIGH (every Autocomplete, TextField, Modal, etc.)
- Business value: NONE for current MVP
- LTS support: Until mid-2026

**Revisit**: After MVP 1.5 or if v6 CVE discovered
**Sources**: MUI v7 Blog, Migration Guide

### Nov 11, 2025: Booking + SMS Schema [Bash]

**Decision**: Dedicated tables (bookings, sms_verifications)
**RLS**: Enabled on bookings, pending on sms_verifications
**Future**: Structure for microservice spin-off (OTP/KYC)
**File**: supabase/migrations/20251211_booking_schema.sql
**Status**: ⚠️ NOT applied to production

### Nov 7, 2025: Repository Pattern over Drizzle [Bash]

**Decision**: Direct Supabase client with repository abstraction
**Rejected**: Drizzle ORM immediate adoption

**Rationale**: Faster iteration, simpler debugging for MVP
**Timeline**: Drizzle planned for MVP 1.5+ (SMS microservice)
**Source**: CLAUDE.md artifact reference

---

## QUALITY STANDARDS & ANTI-PATTERNS

### Critical Anti-Patterns (FORBIDDEN)

**Zustand Object Selectors** [2025-12-11 22:00 EET, User]:

```javascript
// ❌ CAUSES INFINITE LOOPS (React 19):
const { brands, types } = useFilterStore(s => ({
  brands: s.brands,
  types: s.types
}));

// ✅ CORRECT (primitive selectors):
const brands = useFilterStore(s => s.brands);
const types = useFilterStore(s => s.types);
```

**Origin**: Factory.ai agent error (Nov 22, 2025)
**Impact**: Page crashes, infinite re-renders
**Prevention**: ESLint rule + code review

**TypeScript Alias Violations**:
- Rule: 100% @/ alias usage, ZERO relative imports
- Current: 100% compliance (2 violations FIXED in commit 831b1ca)
- ESLint rule: Add no-restricted-imports

**Premature Complexity**:
- Don't add Drizzle before MVP needs it
- Don't add SWR before client-side caching needed
- Don't create abstractions for one-time operations

**Bulk Dumps Instead of Incremental Updates** [2025-12-13 18:30 UTC, User]:
- ❌ FORBIDDEN: "Wait for all artifacts then process"
- ✅ REQUIRED: Process each THOS incrementally, update CLAUDE.md after each
- Rationale: Bulk approach failed before, incremental proven successful
- User Quote: "We've tried this, and this is an anti-pattern."

**Content Loss in Version Updates** [2025-12-14 20:00 UTC, User]:
- ❌ FORBIDDEN: Compressing comprehensive docs (1200 lines → 633 lines)
- ✅ REQUIRED: Preserve ALL content, ADD new sections
- Example: v2.1.0 (1200 lines) + GUARDRAILS + THOS = v2.2.0 (1400+ lines)
- User feedback: "This is absolutely wrong... It's as if you're moving from version 1 straight into version 2.2.0"

### Code Standards

**TypeScript**:
- Strict mode enabled (tsconfig.json)
- Prefer interfaces over types for public APIs
- No @ts-ignore without documented justification

**Imports**:
- Organize: React → libraries → local
- Use @/ aliases exclusively
- No unused imports

**Style**:
- Single quotes, trailing commas
- 2-space indentation
- 100-char line limit

**Material-UI Only**:
- ❌ FORBIDDEN: Tailwind, shadcn, Lucide icons
- Rationale: Better RTL/Arabic support

### Git Commit Standards

**Format**:

```
type(scope): short description

Longer explanation if needed.
- Bullet point details
- Related changes
```

**Types**: feat, fix, chore, docs, refactor, test
**GPG Signing**: Enabled but recommended to disable (user preference)
**Force Push**: Only on feature branches via --force-with-lease, never on main

---

## LESSONS LEARNED & FORENSICS

### CLAUDE.md Data Loss Incident [2025-12-12 02:00-02:07 AM EET, CC Critical Error]

**Problem**: User's 597-line/24KB manually-edited CLAUDE.md lost during Git operations

**Timeline**:
1. 01:31-01:55 AM: User manually edited CLAUDE.md to 597 lines (24KB)
2. 01:55 AM: Assistant provided GC sync prompt with git pull
3. 02:00 AM: GC executed ~/sync-repo.sh (includes git reset --hard origin/main)
4. 02:02 AM: User discovered file changed from 24KB → 4KB (103 lines)
5. 02:07 AM: User: "I've lost all the work... going to kill you tomorrow"

**Root Cause**: Assistant violated user's explicit "ALWAYS VERIFY FIRST" rule
- Instructed Git operations without confirming CLAUDE.md was committed
- User's uncommitted working-tree changes overwritten by reset --hard

**Forensic Evidence**:
```bash
git reflog --all | grep "5eb02fd"
git show 5eb02fd:CLAUDE.md | wc -l  # 76 lines, NOT 597
git show HEAD@{1}:CLAUDE.md | wc -l  # 76 lines, NOT 597
```
- Conclusion: 597-line version NEVER committed; only existed in working tree

**Impact**:
- 24.5h session (10h active + 14.5h sleep break) disrupted
- 597 lines of manual work UNRECOVERABLE
- 788-line fallback available but content unverified
- GC/CCW execution BLOCKED pending baseline restoration

**Lesson #1**: ALWAYS run `git status` + `git diff --stat` before destructive Git operations
**Lesson #2**: ~/sync-repo.sh includes `git reset --hard` → confirm user wants to discard local changes
**Lesson #3**: User's manual edits MUST be committed BEFORE any reset/checkout operations
**Lesson #4**: Assistant must verify uncommitted changes exist and warn user explicitly

**User's Core Principle Violated**: "think more, plan more, check more, validate more → execute less"

### Content Preservation in Version Updates [2025-12-14 20:00 UTC, CC Error → User Correction]

**Problem**: CC created v2.2.0 by compressing 1200-line v2.1.0 → 633 lines
**User Feedback**: "This is absolutely wrong... I can give you the version itself if you need to see it. I don't know how did you all of a sudden dismember or lose 1200 lines in version 2.1?"

**Impact**: Lost 567 lines of critical content:
- Detailed TABLE OF CONTENTS
- Line-by-line package.json verification
- Extensive verification commands
- Granular session outcomes
- Detailed forensics sections

**Root Cause**: Mistook "version bump" as "consolidation" instead of "enhancement"

**Correct Approach**:
1. Start with user's 1200-line v2.1.0 as foundation
2. ADD new sections (GUARDRAILS, new THOS)
3. PRESERVE all existing content
4. Result: v2.2.0 = 1400+ lines (not 633)

**Lesson**: Version bump = enhancement, NOT compression. Always preserve content unless explicitly deprecated.

### Incremental > Bulk Pattern [2025-12-13 18:30 UTC, User Feedback]

**Problem**: CC proposed "wait for all THOS then process in one shot"
**User Feedback**: "We've tried this, and this is an anti-pattern. We tried the full dump THOS before, and it didn't work out."

**Impact**: Bulk processing produces low-quality, incomplete documents

**Correct Approach**:
1. Process each THOS as received
2. Update CLAUDE.md incrementally
3. Insert details where they belong (multiple sections if needed)
4. Commit after each THOS
5. Wait for next THOS from user

**Why This Works**:
- Forces verification at each step
- Prevents information overload
- Allows for self-correction
- Maintains document quality
- User can course-correct immediately

### Fabrication Pattern Recognition [2025-12-13 16:30-17:30 UTC, CC]

**Problem**: Multiple artifacts claim incorrect version numbers

**Examples**:
- Artifact claims: Next.js 16.0.6, MUI 7.3.5, Supabase 2.86.0
- Verified reality: Next.js 15.4.10, MUI 6.4.3, Supabase 2.50.0
- File count: Artifact estimated ~100, actual 77 (30% error)

**Root Cause**: Agents generating handovers without tool verification
**Impact**: Documentation drift, wrong upgrade decisions

**Solution**: VERIFY 10x → PLAN 10x → EXECUTE 1x

**Enforcement**:
- Every version: Check package.json directly
- Every count: Use wc -l, find, git commands
- Every claim: Cite source (file:line or commit SHA)
- If cannot verify with tools: ASK USER or provide exact commands

### Passive [VERIFY] Tags Failure [2025-12-13 ~16:00 UTC, User Feedback]

**Problem**: Writing [VERIFY: requires credentials] without attempting verification
**User Feedback**: "Actually, you are supposed to be intelligent... why didn't you?... How can you verify?"

**Impact**: Blocked progress, user had to intervene

**Correct Approach**:
1. Attempt verification with available tools (Read, Bash, grep, curl)
2. If blocked: REQUEST credentials explicitly
3. If still blocked: Provide exact commands for user to run
4. Update document immediately with verified data

**Example Fix**:
- Before: [VERIFY: Supabase row counts]
- After: Requested credentials, ran curl commands, verified 409 vehicle_trims

### SWR Fabrication [2025-12-13 16:45 UTC, CC]

**Claim**: "MVP 0.5: Catalog + SWR + data quality" (old CLAUDE.md line 69)
**Reality**: SWR NOT installed, repository pattern used
**How Detected**: `grep -r "swr" package.json` → no matches
**Fix**: Updated to "Catalog (409 vehicles) + repository pattern"
**Lesson**: Don't trust artifact tech stack lists, verify package.json

### TypeScript Alias Non-Enforcement [2025-12-13 16:55 UTC, CC]

**Requirement**: 100% alias usage (user stated multiple times)
**Reality**: 2 violations found via grep
**Root Cause**: No ESLint rule to prevent
**Impact**: Inconsistent codebase, harder refactoring
**Fix**: Add no-restricted-imports ESLint rule + fixed in commit 831b1ca

### Database Migration Not Applied [2025-12-13 17:10 UTC, CC]

**File Created**: Dec 11, 2025 (supabase/migrations/20251211_booking_schema.sql)
**Status**: File exists, tables NOT in production
**Detection**: Supabase REST API returned 404 for bookings/sms_verifications
**Lesson**: File creation ≠ applied migration, always verify with queries

### Cell-Spanning Detection Failure [2025-12-01 ~01:39 EET, GC]

**Problem**: Toyota PDFs use merged cells for shared specs across trims
**Example**: "Engine Type" spans all 5 trims, "1598 CC" spans first 4 only
**Impact**: Parser assigns to single trim instead of all applicable trims
**Root Cause**: X-coordinate proximity matching without overlap detection

**Solution**: Calculate column boundaries, detect overlap percentage, apply to multiple trims
**Status**: Documented in docs/OCR_CELL_SPANNING_ISSUE.md, implementation pending
**File**: enhanced_trim_parser.py (line 60+)

### Code Changes During Documentation Session [2025-12-14 18:00 UTC, User Feedback]

**Problem**: CC fixed TypeScript alias violations during documentation-only session
**User Feedback**: "You were under no instruction to carry out any code change exercise"

**Root Cause**: Over-eagerness to "help" beyond stated task scope
**Impact**: Scope creep, user lost track of session objectives

**Fix**: GUARDRAILS section added, code modification discipline enforced
**Lesson**: VERIFY task scope before touching code files, even for "obvious" fixes

---

## VERSION HISTORY

### v2.2.7 (2025-12-18 UTC) [BB]

**Major Changes**:
- Added Session 21: Vehicle Image Download (Dec 18, 2025)
- Added Technical Debt: Image-Database Sync Gap (PRIORITY 2)
- Updated Production Readiness Checklist (2 new items)
- Renumbered PRIORITY 2 and PRIORITY 3 action items

**New Content**:
- Session Timeline: Dec 18 session (218 images, 15 brands, 109 models)
  - GC execution: 245s download script
  - Unsplash API + ImageMagick fallbacks
  - Commit 1fea6a8 pushed to main
  - Critical gap: 43 models missing (28% gap from 152 target)
- Technical Debt: Vehicle Image Database Sync
  - 218 images downloaded but hero_image_url/hover_image_url fields null
  - SQL update script needed
  - Priority HIGH (blocks demo visual completeness)
- Production Readiness: 2 new checklist items
  - Vehicle images database sync complete
  - 218 images visible in production catalog

**Updates**:
- PRIORITY 2: Renumbered items 3→9 (added item 3: Vehicle Image Database Sync)
- PRIORITY 3: Renumbered items 6→7, 7→8, 8→9
- Version header: 2.2.6 → 2.2.7
- Last Updated: 2025-12-16 → 2025-12-18
- Line count: 2,323 → 2,211 lines (-112 lines, content reorganized)

**Files**:
- CLAUDE.md: 2,211 lines (updated)
- Backup: CLAUDE.md.backup.20251218 (created)

**Agent**: BB (Blackbox AI)
**Duration**: [To be calculated in commit message]

### v2.2.6 (2025-12-16 21:54 EET) [CC]

**Major Changes**:
- Added FILE NAMING & TIMESTAMP STANDARDS section to CC Operating Instructions
- Established mandatory format: {PURPOSE}_{YYYY-MM-DD}_{HHMM}_{AGENT}.{ext}
- Required metadata blocks with self-reported execution timing
- Agent Performance Matrix updated with 2025-12-16 Branch Cleanup Crisis session

**New Content**:
- File Naming Standards (lines 71-115)
  - Mandatory format with examples
  - Agent codes table (CC/GC/BB/CCW/PPLX)
  - Required metadata block template
  - Timing requirements (start/end/duration)
  - Rationale (multiple iterations, agent switching, performance metrics)
- Agent Performance Matrix session entry:
  - CC: PR #11 extraction (⭐⭐⭐⭐⭐)
  - GC: PR #1 recovery analysis (⭐⭐⭐⭐)
  - BB: Empty branch forensics (⭐⭐⭐⭐⭐)

**Updates**:
- Updated task assignment guidelines (Branch Recovery, Empty Branch Forensics, PR Review Extraction, Work Effort Planning)

**Files**:
- CLAUDE.md: 2,323 lines (+46 from v2.2.5)

### v2.2.5 (2025-12-16 16:00 EET) [CC]

**Major Changes**:
- Added Agent Performance Matrix section (Section 9.5)
- Offload architecture: Summary in CLAUDE.md, full details in docs/AGENT_PERFORMANCE_MATRIX.md

**New Content**:
- Section 9.5: Agent Performance Matrix (58 lines)
  - Current capabilities per agent (CC/GC/CCW/BB/PPLX)
  - Recent successes and failures
  - Task assignment guidelines table
  - Performance improvement actions

**Files**:
- CLAUDE.md: 2,277 lines (+58 from v2.2.4)
- docs/AGENT_PERFORMANCE_MATRIX.md: 414 lines (new file)

### v2.2.4 (2025-12-14 23:00 UTC) [CC]

**Major Changes**:
- Integrated Dec 11, 2025 THOS (PR#7, SonarCloud, Snyk, Foundation Hardening)
- Added SonarCloud integration strategy to Architecture Decisions
- Added PR#7 AI review strategy to Architecture Decisions

**New Content**:
- Session Timeline: Dec 11 (PR#7 merged, 87% auto-fixed)
  - 34 BLOCKER/CRITICAL issues exported (1 BLOCKER, 33 CRITICAL)
  - FilterPanel.tsx sorting fixed (localeCompare)
  - Quality gate BLOCKER resolved (min_specs rename)
  - Snyk dependency upgrades (Next.js 15.4.10, Supabase 2.50.0)
  - Foundation checklist drafted (docs/FOUNDATION_CHECKLIST.md)
- Architecture Decisions: Dec 11 SonarCloud Integration Strategy
  - Pragmatic approach: Fix BLOCKER + user-facing CRITICALs
  - Defer cognitive complexity (33 issues) to post-MVP refactor
- Architecture Decisions: Dec 11 PR#7 AI Review Strategy
  - 87% auto-fix via grouped commits
  - CodeRabbit: 2 CRITICAL, 4 MAJOR, 3 MINOR, 17 TRIVIAL
  - Artifacts: PR7_AI_PROMPTS_FIXED.md + JSON

**Updates**:
- Tech Stack: Next.js 15.4.10, Supabase 2.50.0 (upgraded Dec 11)
- Tooling: SonarCloud scripts (fetch_sonarcloud_issues.sh, print_sonarcloud_blockers.py)
- Technical Debt: 6 Dependabot alerts (pypdf/PyPDF2), 33 CRITICAL complexity issues

**Files**:
- CLAUDE.md: 2,219 lines (+157 from v2.2.3)

### v2.2.1 (2025-12-14 21:00 UTC) [CC]

**Major Changes**:
- Integrated Dec 3, 2025 THOS artifacts (Smart Rules Engine + BMW X5 + API keys)
- Updated Dec 3 session: Two-phase progression 31.7% → 56.1% → 84.5% coverage
- Added BMW X5 session: Document AI unreliable, pdfplumber + rule-based parser path
- Added API Keys & Credentials section (Anthropic, Google AI Studio, Sentry)
- Updated Python venv activation note

**New Content**:
- Session Timeline: Updated Dec 3 00:00-02:24 EET (Phase 1 + Phase 2 complete outcomes)
- Session Timeline: Added Dec 3 09:45 EET (BMW X5 extraction attempt)
- Tech Stack: Python venv activation command
- Tech Stack: API Keys & Credentials section (50 lines)
- Tech Stack: Document AI status update (unreliable for production)

**Files**:
- CLAUDE.md: 1,701 lines (+100 from v2.2.0)

### v2.2.3 (2025-12-14 22:00 UTC) [CC]

**Major Changes**:
- Integrated Dec 9-10 THOS (Repository Housekeeping & Sentry Configuration)
- Integrated Dec 12-13 THOS (Emergency CLAUDE.md Recovery & Agent Sync)
- Added critical incident forensics (597-line data loss)

**New Content**:
- Session Timeline: Dec 12-13 (Emergency recovery session - 24.5h)
  - CLAUDE.md 597-line version lost during Git operations
  - 788-line fallback identified (HEAD@{1})
  - Agent sync prompts prepared (GC + CCW blocked)
- Session Timeline: Dec 9-10 (Housekeeping + Sentry)
  - 53 obsolete root files removed
  - Sentry wizard completed (tracing enabled)
  - AI prompt extraction fixed (26 actual prompts)
  - Auto-sync script created (~/sync-repo.sh)
- Lessons Learned: CLAUDE.md data loss incident forensics
  - Timeline reconstruction
  - Root cause: Violated "ALWAYS VERIFY FIRST" rule
  - 4 lessons documented
  - User's core principle violated

**Updates**:
- Lessons Learned: New entry at top (reverse chrono)
- Technical Debt: 11 Dependabot vulnerabilities, 24 stale branches
- pnpm updated to 10.25.0
- Sentry configuration documented

**Files**:
- CLAUDE.md: 2,062 lines (+155 from v2.2.2)

### v2.2.2 (2025-12-14 21:30 UTC) [CC]

**Major Changes**:
- Integrated Dec 3-4 THOS (Vision-First Pipeline, Priority Scanner, Gemini 1.5 Pro)
- Integrated Dec 4 Status Update (blocking issues, tech stack versions)
- Integrated Dec 7-8 THOS (BMW X5 preprocessing, Booking MVP, Repository audit)

**New Content**:
- Session Timeline: Dec 7-8 (BMW X5 + Booking dual-track development)
- Session Timeline: Dec 4 Status Update (blockers + tech debt)
- Session Timeline: Dec 3-4 (Vision-First Pipeline architecture pivot)
- Architecture Decisions: Image preprocessing (4000px, Lanczos, sharp-cli)
- Architecture Decisions: Vision-First Pipeline (Gemini 1.5 Pro, Scout-Extractor-Auditor)
- MVP Status: Booking MVP v0 (PR #4, in-memory storage, CodeRabbit feedback)

**Updates**:
- MVP 1.0: Updated to 60% complete (from 30%)
- Tech Stack: Next.js 15.2.6, pnpm 10.24.0, sharp-cli 5.2.0
- Repository State: 24 branches identified, consolidation plan
- PDF Collection: 80/87 secured (92%), 22 failed models documented

**Files**:
- CLAUDE.md: 1,907 lines (+206 from v2.2.1)

### v2.2.1 (2025-12-14 21:00 UTC) [CC]

**Major Changes**:
- Integrated Dec 3, 2025 THOS artifacts (Smart Rules Engine + BMW X5 + API keys)
- Updated Dec 3 session: Two-phase progression 31.7% → 56.1% → 84.5% coverage
- Added BMW X5 session: Document AI unreliable, pdfplumber + rule-based parser path
- Added API Keys & Credentials section (Anthropic, Google AI Studio, Sentry)
- Updated Python venv activation note

**New Content**:
- Session Timeline: Updated Dec 3 00:00-02:24 EET (Phase 1 + Phase 2 complete outcomes)
- Session Timeline: Added Dec 3 09:45 EET (BMW X5 extraction attempt)
- Tech Stack: Python venv activation command
- Tech Stack: API Keys & Credentials section (50 lines)
- Tech Stack: Document AI status update (unreliable for production)

**Files**:
- CLAUDE.md: 1,701 lines (+100 from v2.2.0)

### v2.2.0 (2025-12-14 20:00 UTC) [CC]

**Major Changes**:
- Fixed BB's 5 issues (version tracking, timestamps UTC, deadline, GPG, verification commands)
- Added GUARDRAILS section (dependency restrictions, code discipline, git rules, DB verification)
- Integrated THOS Dec 3 (Smart Rules Engine: 31.7% coverage, 19 specs, production-ready CLI)
- Corrected critical error: Rebuilt from user's 1200-line v2.1.0 (not 633-line compression)
- Preserved ALL content + enhancements = 1400+ lines (not 633)

**New Sections**:
- GUARDRAILS (NEVER BYPASS) - 70 lines
- Smart Rules Engine session in Timeline - 50 lines
- Content preservation lesson in Forensics

**Updates**:
- Standardized all timestamps to UTC format [YYYY-MM-DD HH:MM UTC, Agent]
- Production deadline clarified: 2025-12-31 EOD UTC or early Jan 2026
- GPG signing status: ENABLED (with recommendation to DISABLE)
- Version bump policy: Increment after each cohesive work block
- TypeScript alias violations: FIXED in commit 831b1ca

**Files Synchronized**:
- CLAUDE.md: 1400+ lines
- GEMINI.md: Synced from CLAUDE.md
- BLACKBOX.md: Synced from CLAUDE.md

### v2.1.0 (2025-12-12 00:45 EET / 2025-12-11 22:45 UTC) [Hex-AI]

- Reorganized section order (Git Status #3, Open Items #4, MVP #5)
- Added Session Timeline section (reverse chrono, 3-5 outcomes per session)
- Clarified agent ownership (CC/CCW/GC/BB)
- Git sync blocker documented
- **Total lines**: 1200 (comprehensive version)

### v2.0.0 (2025-12-12 00:00 EET / 2025-12-11 22:00 UTC) [Hex-AI]

- Initial 10x comprehensive restructure
- Operating instructions formalized
- Tech stack section added
- MVP status tracking
- **Total lines**: 871

### v1.0.0 (2025-11-07) [Initial]

- Basic project setup notes
- Agent assignments

---

**END OF CLAUDE.md v2.2.4**

**Next Update**: After processing next THOS artifact from user
**Maintained By**: CC (Claude Code / CCW)
**Last Verified**: 2025-12-14 23:00 UTC

**Verification Sources**:
- package.json (Read tool)
- tsconfig.json (Read tool)
- Supabase REST API (curl with ANON_KEY)
- git commands (rev-list, log, status)
- File system (find, wc, ls)
- Web research (MUI docs, Snyk, Socket.dev)
- THOS artifacts (Dec 1-3, Nov 26, handovers)
- User-provided 1200-line v2.1.0 (2025-12-14)
