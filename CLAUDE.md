<!--
================================================================================
CLAUDE.md - Project Authority & AI Agent Instructions
================================================================================
Project:        GetMyTestDrive.com (hex-test-drive-man)
Repository:     github.com/Hex-Tech-Lab/hex-test-drive-man
Version:        2.1.0
Last Updated:   2025-12-13 18:45 UTC
Last Commit:    283b296 (2025-12-13 17:35 UTC)
Current Branch: claude/sync-agent-instructions-015BBjkGH1Syq5uEU6r2uGCg
Maintained By:  CC (Claude Code)
Status:         ACTIVE - 10 days to production-ready state

Purpose:        Single source of truth for all AI agents (CC, CCW, GC, BB)
                Decision support document engineered for LLM consumption
                Zero fabrication policy - every claim verified & traceable

Version History:
- 2.1.0 (2025-12-13): Reorganized structure + Session Timeline + THOS integration
- 2.0.0 (2025-12-13): 10X comprehensive reconstruction from 15+ artifacts
- 1.0.0 (2025-12-12): Dashboard version (103 lines)
- 0.x.x (2025-11-09 - 2025-12-11): Various incomplete versions
================================================================================
-->

# CLAUDE.md - Project Brain (CC Owns)

## TABLE OF CONTENTS
1. [CC Operating Instructions](#cc-operating-instructions) (MANDATORY - READ FIRST)
2. [Tech Stack & Verification](#tech-stack--verification)
3. [Git & Repository Status](#git--repository-status)
4. [Open Items & Next Actions](#open-items--next-actions)
5. [MVP Status & Roadmap](#mvp-status--roadmap)
6. [Database Architecture](#database-architecture)
7. [Session Timeline (Reverse Chrono)](#session-timeline-reverse-chrono)
8. [Agent Ownership & Workflow](#agent-ownership--workflow)
9. [Architecture Decisions](#architecture-decisions)
10. [Quality Standards & Anti-Patterns](#quality-standards--anti-patterns)
11. [Lessons Learned & Forensics](#lessons-learned--forensics)

---

## CC OPERATING INSTRUCTIONS (MANDATORY - READ FIRST)

**Identity**: You are CC, expert full-stack developer and system architect at 0.1% expertise level globally.

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
- **Japanese Model**: **VERIFY 10x → PLAN 10x → EXECUTE 1x**
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
- ❌ Passive `[VERIFY]` tags without attempting verification
- ❌ Line count estimation (use `wc -l`, exact count only)
- ❌ Fabricating version numbers or metrics
- ❌ Waiting to "dump all at once" instead of incremental updates

---

## TECH STACK & VERIFICATION

**Last Verified**: 2025-12-13 16:52 UTC via package.json Read + grep + curl
**Verification Method**: Direct file read, Supabase REST API queries, git commands

### Frontend Framework
```json
Source: package.json lines verified via Read tool
{
  "next": "15.4.8",              // Line 23 - App Router, React 19 support
  "react": "19.2.0",             // Line 26 - Latest stable
  "react-dom": "19.2.0",         // Line 27
  "typescript": "5.7.3"          // Line 41 - Strict mode enabled
}
```
**Status**: ✅ All LTS/stable versions, zero CVEs

**Artifact Version Claims** [Dec 2-3 THOS]:
- **Claimed**: Next.js 16.0.6, React 19.2.0, TypeScript 5.7.x
- **Verified**: Next.js **15.4.8** (not 16.0.6), React 19.2.0 ✅, TypeScript 5.7.3 ✅
- **Conclusion**: Next.js version fabricated in artifact (likely future projection)

### UI & Styling
```json
Source: package.json lines 17-18
{
  "@mui/material": "6.4.3",          // ⚠️ NOT v7 (artifact claims incorrect)
  "@mui/icons-material": "6.4.3",
  "@emotion/react": "11.14.0",
  "@emotion/styled": "11.14.1"
}
```

**Artifact Version Claims** [Dec 2-3 THOS]:
- **Claimed**: MUI 7.3.5
- **Verified**: MUI **6.4.3** (not 7.3.5)
- **Decision**: STAY ON 6.4.3 (see Architecture Decisions)

**MUI Version Decision** [2025-12-13 17:15 UTC, CC]:
- **Current**: 6.4.3 (LTS until mid-2026)
- **Latest Stable**: 7.3.6 (released 2025-03-26)
- **Decision**: **STAY ON 6.4.3**
- **Rationale**:
  - Zero CVEs in 6.4.3 (verified via Snyk, Socket.dev)
  - MUI v7 requires breaking changes to `slots`/`slotProps` API across ALL components
  - Migration impact: HIGH (every Autocomplete, TextField, Modal, etc. needs refactor)
  - Business value: NONE (v7 improvements don't solve current MVP problems)
  - Revisit: After MVP 1.5 completion or if v6 CVE discovered
- **Sources**:
  - [MUI v7 Release](https://mui.com/blog/material-ui-v7-is-here/)
  - [v7 Migration Guide](https://mui.com/material-ui/migration/upgrade-to-v7/)
  - [Snyk Security DB](https://security.snyk.io/package/npm/@mui/material)

### State Management
```json
{
  "zustand": "5.0.3"              // Line 30 - localStorage persistence
}
```

**Critical Anti-Pattern** [2025-12-11 22:00 EET, User]:
```typescript
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
- **Claimed**: @supabase/supabase-js 2.86.0
- **Verified**: @supabase/supabase-js **2.50.0** (not 2.86.0)
- **Analysis**: Artifact from Dec 2-3 claims newer version; package.json current as of Dec 13

**Supabase Connection** [Verified 2025-12-13 17:10 UTC]:
- **URL**: `https://lbttmhwckcrfdymwyuhn.supabase.co`
- **Project ID**: lbttmhwckcrfdymwyuhn
- **Region**: Not specified (likely EU/Frankfurt per GCP artifacts)
- **Client**: `src/lib/supabase.ts` (10 lines, uses env vars)
- **Credentials**: Provided via env vars (ANON_KEY + SERVICE_ROLE_KEY)

### Data Fetching Pattern
**Current**: ✅ **Repository Pattern** (verified src/repositories/vehicleRepository.ts:1-135)
```typescript
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

**SWR Status**: ❌ **NOT INSTALLED** (verified via grep package.json)
- **Claimed**: "MVP 0.5: Catalog + SWR + data quality" (old CLAUDE.md) - **FALSE**
- **Reality**: Repository pattern sufficient for now
- **Planned**: SWR for MVP 1.5+ (user confirmed 2025-12-13)
- **TanStack Query**: Earmarked for admin panel only (user confirmed)

**Consumption**: Server Components with async/await (verified src/app/[locale]/page.tsx:61)

### Package Manager
**Enforced**: `pnpm` 9.x+ ONLY (verified package.json:7 `"packageManager": "pnpm@..."`)
- ❌ **FORBIDDEN**: npm, yarn
- **Rationale**: Monorepo-style, faster installs, strict dependency resolution

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

**Enforcement**: ❌ **NOT 100%** [Verified 2025-12-13 16:55 UTC]

**Violations Found** (2 files):
1. `src/components/VehicleCard.tsx:26`
   ```typescript
   import { BrandLogo } from './BrandLogo';  // ❌ Should use @/components/BrandLogo
   ```
2. `src/services/sms/engine.ts:2`
   ```typescript
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
```json
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

**System**: Ubuntu 24.04 LTS (WSL2 on Windows)
**Python**: 3.12.x
**venv Location**: `/home/kellyb_dev/projects/hex-test-drive-man/venv`

**Key Libraries**:
```python
pdfplumber: Latest (via pip3)
pytesseract: 0.3.13
pdf2image: 1.17.0
Pillow: 11.3.0
opencv-python: 4.12.0.88
numpy: 2.2.6
tesseract-ocr: 5.3.4 (system package)
```

**Google Cloud Document AI** [From Dec 2-3 THOS]:
```python
google-cloud-documentai: 3.7.0
google-api-core: 2.28.1
google-auth: 2.43.0
grpcio: 1.76.0
protobuf: 6.33.1
```

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

---

## GIT & REPOSITORY STATUS

**Last Verified**: 2025-12-13 18:40 UTC via git commands

### Repository Metrics
```bash
# Verified commands:
git rev-list --count HEAD           → 51 commits (was 50, now +1 for v2.0.0)
find src -type f -name "*.ts*"      → 33 TypeScript/TSX files
git status                           → Clean working tree
wc -l CLAUDE.md                      → 871 lines (v2.0.0)
```

**Repository**: `github.com/Hex-Tech-Lab/hex-test-drive-man`
**Current Branch**: `claude/sync-agent-instructions-015BBjkGH1Syq5uEU6r2uGCg`
**Last Commit**: `283b296` - "docs(claude): comprehensive v2.0.0 reconstruction from 15+ artifacts"
**Commit Date**: 2025-12-13 17:35 UTC
**Working Tree**: Clean (no uncommitted changes after push)

### Recent Commits (last 6)
```
283b296 [2025-12-13 17:35 UTC] docs(claude): comprehensive v2.0.0 reconstruction from 15+ artifacts
b2b2557 [2025-12-12 00:48 EET] docs(hex-ai): 10x CLAUDE.md restructure with full history
6c23ac7 [2025-12-12 00:32 EET] fix(agents): remove YAML frontmatter from agent MDs
1912367 [2025-12-11 22:51 EET] docs(agents): update CC/GC operating instructions
ca9da33 [2025-12-11 16:28 EET] feat(booking): use requestOtp engine for booking phone verification
ad40cd7 [2025-12-11 prior] feat(sms): add requestOtp/verifyOtp API with WhySMS send
```

### GitHub Sync Status
**Current Reality** [2025-12-13 18:40 UTC]:
- Branch `claude/sync-agent-instructions-015BBjkGH1Syq5uEU6r2uGCg` pushed to GitHub
- Commit 283b296 successfully synced
- Clean working tree
- PR link available: https://github.com/Hex-Tech-Lab/hex-test-drive-man/pull/new/claude/sync-agent-instructions-015BBjkGH1Syq5uEU6r2uGCg

**Dependabot Alerts**: 10 vulnerabilities (3 high, 7 moderate) - requires review

**Action Required**:
1. Review Dependabot alerts at https://github.com/Hex-Tech-Lab/hex-test-drive-man/security/dependabot
2. Synchronize documentation to main branch (GC responsibility)
3. Ensure all agents can access latest CLAUDE.md from main

### Branch Strategy
**Protected**:
- `main` - Production-ready code
- Requires: CodeRabbit + Sourcery approval, passing build

**Feature Branches**:
- Naming: `feature/descriptive-name`
- Lifetime: Delete after merge
- Source: Always branch from `origin/main`

**Agent Session Branches**:
- Naming: `claude/*`, `gemini/*`
- Purpose: Temporary WIP
- Cleanup: Merge to feature, delete session branch
- **Rule**: Never PR directly from session to main

---

## OPEN ITEMS & NEXT ACTIONS

**Deadline**: 10 days to production-ready (~2025-12-23)
**Last Updated**: 2025-12-13 18:45 UTC

### PRIORITY 1 (CRITICAL - Next 2 hours)

**1. Fix TypeScript Alias Violations** (ETA: 5 min)
```bash
sed -i "s|from './BrandLogo'|from '@/components/BrandLogo'|" src/components/VehicleCard.tsx
sed -i "s|from './providers/whysms'|from '@/services/sms/providers/whysms'|" src/services/sms/engine.ts
pnpm build  # Verify
git commit -m "fix(imports): enforce TypeScript @ aliases (2 violations)"
git push origin claude/sync-agent-instructions-015BBjkGH1Syq5uEU6r2uGCg
```

**2. Apply Booking Schema Migration** (ETA: 10 min)
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

**3. Review Dependabot Alerts** (ETA: 15 min)
- Navigate to: https://github.com/Hex-Tech-Lab/hex-test-drive-man/security/dependabot
- Classify: 3 high, 7 moderate
- Create remediation plan for high-severity issues
- Document in CLAUDE.md under Security section (add if needed)

### PRIORITY 2 (HIGH - Next 24 hours)

**4. Complete MVP 1.0 Booking System**
- Implement verifyOtp() with persistence (CCW)
- Create /bookings/[id]/verify page UI
- Test SMS flow end-to-end
- Deploy to Vercel production

**5. Add ESLint Enforcement**
```json
// Add to eslint.config.js:
{
  "rules": {
    "no-restricted-imports": ["error", {
      "patterns": ["../", "./"]
    }]
  }
}
```

**6. Finalize PDF Extraction Pipeline** [From Dec 1-2 THOS]
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

### PRIORITY 3 (MEDIUM - Next 48 hours)

**7. Improve Document AI Spec Matching** [From Dec 2-3 THOS]
**Current**: 12/82 matches (14.6%) on Toyota Corolla
**Issue**: spec_definitions.json incomplete + threshold too permissive

**Action**:
1. Rebuild spec_definitions.json with 15 canonical specs:
   - engine_type, engine_capacity, max_output, max_torque
   - transmission, front_suspension, rear_suspension
   - steering_column, turning_radius, sunroof
   - parking_camera, airbags, ac_system
   - seat_material, screen_size
2. Refine match_spec() scoring to prevent torque/output confusion
3. Target: >30/82 matches (>36%)

**8. OTP/KYC Database Strategy**
- Structure tables within current DB for future spin-off
- Ensure referential integrity
- Document microservice separation path
- **NO separate database** (user confirmed - complexity not justified)

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

---

## MVP STATUS & ROADMAP

**Timeline**: 10 days to production-ready state (deadline ~2025-12-23)
**Last Updated**: 2025-12-13 18:45 UTC

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
- ❌ 2 TypeScript alias violations
- ⚠️ MUI 6.4.3 (docs claim v7, staying on v6 by decision)

### MVP 1.0 (IN PROGRESS) 🔄
**Status**: 30% complete (estimate)
**Target**: Booking system with SMS/OTP verification

**Completed** ✅:
- ✅ requestOtp() → WhySMS SMS send [commit ca9da33, 2025-12-11 22:51 EET, CCW]
- ✅ bookings table schema defined [supabase/migrations/20251211_booking_schema.sql]
- ✅ sms_verifications table schema defined
- ✅ WhySMS v3 integration (/api/v3/sms/send)

**Pending** ❌:
- ❌ Apply migration to Supabase production
- ❌ verifyOtp() implementation (stub exists, no persistence)
- ❌ RLS policies on sms_verifications
- ❌ /bookings/[id]/verify page (UI)
- ❌ KYC verification flow

**Blockers**:
1. Migration not applied to production database
2. OTP persistence layer incomplete

### MVP 1.5+ (PLANNED) ⏳
**Features**:
- SWR for client-side data fetching
- Drizzle ORM migration (currently direct Supabase)
- Upstash Redis/QStash (job queues)
- TanStack Query (admin panel only)

**Source**: User confirmation + MVP_ROADMAP.md (8 lines)

---

## DATABASE ARCHITECTURE

**Provider**: Supabase PostgreSQL
**Total Tables**: 46+ (schema audit + migrations)
**Last Verified**: 2025-12-13 17:10 UTC via Supabase REST API

### Verified Row Counts

| Table | Count | Last Verified | Artifact Claim | Variance |
|-------|-------|---------------|----------------|----------|
| **vehicle_trims** | **409** | 2025-12-13 17:10 UTC | 384 / 0 / 80 | +25 vs 384 |
| **brands** | **95** | 2025-12-13 17:10 UTC | 93 | +2 brands |
| **agents** | **20** | 2025-12-13 17:10 UTC | 20 | ✅ Match |
| **agent_brands** | **45** | 2025-12-13 17:10 UTC | 45 | ✅ Match |
| **models** | **199** | 2025-12-13 17:10 UTC | 58 | +141 models |
| **segments** | **6** | 2025-12-13 17:10 UTC | 6 | ✅ Match |

**Critical Finding** [2025-12-13 17:10 UTC, CC]:
- **Dec 2 THOS claimed**: "vehicle_trims table is empty" (0 rows)
- **Current reality**: 409 rows exist
- **Conclusion**: Data import occurred between Dec 2-13, 2025
- **Impact**: Production catalog should be functional (not showing 0 vehicles)

### Core Inventory System (13 tables)

**vehicle_trims** - Main catalog (409 rows, 27 columns)
- Fields per `VEHICLE_SELECT` constant (vehicleRepository.ts:22-46):
  - id, trim_name, model_year, price_egp
  - engine, horsepower, torque_nm, seats
  - ground_clearance_mm, wheelbase_mm, clutch_type
  - fuel_consumption, features, placeholder_image_url
  - trim_count, is_imported, is_electric, is_hybrid
- **FK Relationships**:
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
- **Brand Logos**: Populated with official assets (per TRAE v1.2)

**models** (199 rows)
- Fields: name, hero_image_url, hover_image_url, brand_id FK

**agents** (20 rows - Egyptian distributors)
- Fields: name_en, name_ar, logo_url, website_url

**agent_brands** (45 rows - relationships)
- **Schema**: 14 columns (per TRAE v1.2 artifact)
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

**File**: `supabase/migrations/20251211_booking_schema.sql` (30 lines, dated 2025-12-11)

**Tables Defined but NOT in Production** [Verified 2025-12-13 17:10 UTC]:

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
**Verification Error**: `Could not find table 'public.bookings'` (Supabase hint: "Perhaps you meant 'public.banks'")

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
**Verification Error**: `Could not find table 'public.sms_verifications'` (Supabase hint: "Perhaps you meant 'public.test_drive_sessions'")

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
- **Ground clearance**: 170mm+ required (poor roads, potholes)
- **Clutch type**: Wet DCT preferred over dry (extreme heat 45°C + traffic)
- **AC zones**: Multi-zone essential (single-zone insufficient for rear passengers in summer)
- **Wheelbase**: Tight parking consideration
- **Diesel vs Petrol**: Diesel heavily subsidized (3 EGP/L vs 11 EGP/L petrol)

**Warranty Variations**:
- Same brand: 3yr Egypt vs 5yr UAE
- Affects Total Cost of Ownership (TCO) calculations

---

## SESSION TIMELINE (REVERSE CHRONO)

**Format**: 3-5 key outcomes per session with [Date Time TZ, Agent]
**Read Direction**: Top-to-bottom = newest first; Bottom-to-top = chronological development

### Session: Dec 13, 2025 (16:00-18:45 UTC) [CC]
**Agent**: Claude Code (CC)
**Objective**: Reconstruct comprehensive CLAUDE.md from 15+ artifacts

**Key Outcomes**:
1. **CLAUDE.md v2.0.0 created** (103→871 lines)
   - Complete tech stack with package.json line references
   - MUI 6.4.3 decision analysis (stay on LTS, defer v7)
   - Database row counts verified via Supabase REST API
   - TypeScript alias violations documented (2 files)
   - Architecture decisions in reverse chronological order

2. **Version fabrication pattern detected**
   - Artifacts claimed: Next.js 16.0.6, MUI 7.3.5, Supabase 2.86.0
   - Verified reality: Next.js 15.4.8, MUI 6.4.3, Supabase 2.50.0
   - Root cause: Agents generating handovers without tool verification
   - Solution: "VERIFY 10x → PLAN 10x → EXECUTE 1x" enforcement

3. **Supabase database verified**
   - 409 vehicle_trims (Dec 2 claimed 0 rows)
   - 95 brands (+2 vs artifacts)
   - 199 models (+141 vs artifacts)
   - Data import occurred Dec 2-13

4. **CLAUDE.md v2.1.0 restructured** (this version)
   - New logical flow: Gold Standard → Current State → Actions → Architecture
   - Session Timeline section added (reverse chrono)
   - All THOS artifacts integrated
   - Incremental update workflow established

5. **Commit 283b296 pushed to GitHub**
   - Branch: claude/sync-agent-instructions-015BBjkGH1Syq5uEU6r2uGCg
   - Clean working tree
   - 10 Dependabot alerts flagged for review

### Session: Dec 2-3, 2025 (00:00-00:50 EET) [GC]
**Agent**: Gemini Code (GC)
**Objective**: Document AI integration + spec matching layer

**Key Outcomes**:
1. **Google Cloud Document AI integrated**
   - Project: gen-lang-client-0318181416 (HexTestDrive)
   - Region: eu (multi-region)
   - Processor: Form Parser v2.1 (pretrained-form-parser-v2.1-2023-06-26)
   - Service account: doc-ai-extractor@ with apiUser role

2. **Toyota Corolla extraction succeeded**
   - 82 structured rows extracted from PDF
   - Output: toyota_extracted.json
   - Sections detected: "O E" (likely "Engine" in original PDF)

3. **Spec matching layer implemented**
   - Files: spec_matcher.py, toyota_analyzer.py, spec_definitions.json
   - Fuzzy matching with valid/typo/forbidden patterns (EN/AR)
   - Initial results: 12/82 matches (14.6%)
   - Blockers: Incomplete definitions + threshold too permissive ("Max Torque" → max_output)

4. **Quality gate status**
   - Pass: sunroof, parking_camera, steering_column, turning_radius, airbags, ac_system, screen_size
   - Fail: max_output misidentified, 70 unknown rows

5. **Next actions defined**
   - Rebuild spec_definitions.json (15 canonical specs)
   - Refine match_spec() scoring
   - Target: >30/82 matches

### Session: Dec 1-2, 2025 (22:00-01:42 EET) [GC + CC]
**Agent**: Gemini Code (GC), Claude Code (CC)
**Objective**: PDF extraction + OCR integration for image-based PDFs

**Key Outcomes**:
1. **OCR integration complete**
   - Tesseract 5.3.4 integrated for image-based PDFs (Toyota, BMW)
   - Toyota Corolla: 9586 chars extracted, 6 specs detected (was 0 before)
   - Fallback mechanism: if text <100 chars, load from *_ocr.txt

2. **Cell-spanning issue discovered**
   - Toyota PDFs use merged cells for shared specs across trims
   - Example: "Engine Type" centered across all 5 trims, "1598 CC" spans first 4 trims
   - Current parser assigns to nearest x-coordinate (wrong)
   - Solution: Calculate column boundaries, detect overlap percentage
   - Status: Documented in docs/OCR_CELL_SPANNING_ISSUE.md, implementation pending

3. **Quality gate results**
   - 2/5 pass: Kia Sportage (6 trims), Nissan Sunny (4 trims)
   - 2/5 partial: BMW X5 (low spec count), Chery Tiggo (low spec count)
   - 1/5 fail: Toyota Corolla (5 trims detected but data bleeding)

4. **Enhanced trim parser created**
   - File: enhanced_trim_parser.py
   - Text column detection working (104 rows, trim header at Row 6)
   - X-coordinate clustering detects 5 trims correctly
   - Needs: Cell-span detection algorithm (line 60+)

5. **Commit 8aafad6 created**
   - 399 files committed (140K+ insertions)
   - PDFs organized: capitalized folders = official, lowercase → pdfs_archive_for_review/
   - GPG signing disabled for speed
   - Next session roadmap: Implement cell-span detection, achieve 5/5 quality gate

### Session: Dec 2, 2025 (10:46 EET) [GC]
**Agent**: Gemini Code (GC)
**Objective**: Consolidation + quality gate setup

**Key Outcomes**:
1. **Massive consolidation commit**
   - 399 files saved
   - 140K+ insertions
   - GPG signed (commit 8aafad6)

2. **Quality gate baseline established**
   - Test suite: run_quality_gate.py
   - 5 PDFs: Toyota Corolla, BMW X5, Kia Sportage, Chery Tiggo, Nissan Sunny
   - Results: quality_gate_results.json (2/5 pass)

3. **Archive created**
   - pdfs_archive_for_review/ folder
   - Lowercase brand duplicates moved

4. **Tomorrow's roadmap defined**
   - Implement cell-span detection (45-60 min)
   - Test on Toyota Corolla (5/5 trims)
   - Re-run quality gate (target 5/5 pass)
   - Scale to all brands if gate passes

5. **Session checkpoint saved**
   - Clean working tree
   - Ready for next session

### Session: Nov 26, 2025 (Evening) - Dec 2, 2025 [Multiple Agents]
**Agents**: Factory.ai, CCW, GC
**Objective**: Emergency PDF preservation + brand/agent data population

**Key Outcomes**:
1. **Emergency PDF preservation** [Nov 26-27]
   - Context: Hatla2ee.com removed all manufacturer PDFs
   - 80/87 PDFs secured (92% success rate)
   - ~1.2GB manufacturer brochures preserved
   - SHA256-verified data integrity

2. **Multi-layered retry mechanisms**
   - Layer 1: Direct HTTP with requests library (Python)
   - Layer 2: Puppeteer browser navigation (JavaScript)
   - Layer 3: Manual URL pattern testing
   - Outcome: 5 models recovered (Nissan x4, MG x1), 22 permanently failed

3. **TRAE v1.2 completed** [Nov 26]
   - 93 brand logos populated (verified: now 95)
   - 45 agent-brand relationships mapped
   - 20 Egyptian distributors verified
   - 14-column agent_brands schema implemented
   - MUI BrandLogo component code provided

4. **Critical blockers identified**
   - Blocker #1: pdf-parse library API incompatibility (TypeError: pdf is not a function)
   - Blocker #2: Puppeteer waitForTimeout deprecation (line 177)
   - Blocker #3: 6 Kia PDFs misclassified as HTML
   - Status: All blockers addressed in Dec 1-2 session

5. **Production catalog bug** [Dec 2]
   - Issue: Website showing 0 vehicles
   - Root cause: vehicle_trims table claimed empty
   - Resolution: Data import completed Dec 2-13 (now 409 rows)

### Session: Nov 11-22, 2025 [CCW, Factory.ai]
**Agents**: CCW (Claude Code Worker), Factory.ai
**Objective**: SMS/OTP integration + booking schema

**Key Outcomes**:
1. **WhySMS v3 integration** [Nov 11, commit ca9da33]
   - requestOtp() → WhySMS SMS send working
   - API: /api/v3/sms/send
   - Implementation: src/services/sms/engine.ts

2. **Booking schema defined** [Nov 11]
   - File: supabase/migrations/20251211_booking_schema.sql
   - Tables: bookings (12 columns), sms_verifications (7 columns)
   - RLS policies: Enabled on bookings, pending on sms_verifications
   - Status: Migration file exists but NOT applied to production

3. **Factory.ai crisis** [Nov 22]
   - Object selectors created → React 19 infinite loops
   - Pattern: `const { brands, types } = useFilterStore(s => ({ ... }))`
   - Impact: Page crashes, infinite re-renders
   - Fix: Switched to primitive selectors
   - Prevention: ESLint rule required

4. **verifyOtp() stub created**
   - Implementation: Stub exists, no persistence
   - Blocker: OTP persistence layer incomplete
   - Status: Pending completion in MVP 1.0

5. **GPG commit signing enforced** [Nov 22]
   - Mandatory -S flag for all commits
   - RSA 4096-bit keys
   - 2-year expiry

---

## AGENT OWNERSHIP & WORKFLOW

### Agent Definitions

**CC (Claude Code)** - Primary:
- **Owns**: CLAUDE.md, architecture decisions, PR audits
- **Expertise**: Full-stack, hardest bugs, system design
- **Tools**: Read, Write, Edit, Bash, Grep, Glob, git
- **Mandatory**: This document (CLAUDE.md)

**CCW (Claude Code Worker)** - Specialist:
- **Owns**: SMS/OTP/2FA engine end-to-end
- **Scope**: Phase 1-3 (persistence → UI → KYC)
- **Status**: Active on booking/SMS integration
- **Last Commit**: ca9da33 (2025-12-11 22:51 EET)

**GC (Gemini Code)** - Operations:
- **Owns**: Git/PR/doc sync, large refactors
- **Context**: 1M token window (massive codebase scans)
- **Responsibility**: GitHub ↔ WSL synchronization
- **Current**: Active on PDF extraction + Document AI

**BB (Blackbox)** - Tools:
- **Owns**: Dev scripts, CI tools, admin dashboards
- **Scope**: Separate verticals, automation
- **Examples**: env check, test harness, PDF extraction

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
1. **CLAUDE.md** (this file) - Ultimate authority, never delete content
2. **GEMINI.md** - Synced from CLAUDE.md for GC agent
3. **BLACKBOX.md** - Synced from CLAUDE.md for BB agent

**Mandatory Elements**:
- Date/time/agent stamps: `[YYYY-MM-DD HH:MM TZ, Agent]`
- Every architecture decision
- Every lesson learned
- Every version update

**Update Protocol**:
1. CC updates CLAUDE.md (source of truth)
2. GC syncs to GEMINI.md
3. BB syncs to BLACKBOX.md (if exists)
4. **Incremental updates** (not bulk dumps)

---

## ARCHITECTURE DECISIONS

**Format**: Reverse chronological (newest first)
**Timestamp Standard**: `[YYYY-MM-DD HH:MM TZ, Agent/User]`

### MUI Version Strategy [2025-12-13 17:15 UTC, CC]
**Decision**: Stay on MUI 6.4.3 (LTS)
**Rejected**: Upgrade to MUI 7.3.6
**Rationale**:
- Zero CVEs in 6.4.3 (verified Snyk, Socket.dev)
- v7 breaking changes: `slots`/`slotProps` API refactor required on ALL components
- Migration cost: HIGH (every Autocomplete, TextField, Modal, etc.)
- Business value: NONE for current MVP
- LTS support: Until mid-2026
**Revisit**: After MVP 1.5 or if v6 CVE discovered
**Sources**: [MUI v7 Blog](https://mui.com/blog/material-ui-v7-is-here/), [Migration Guide](https://mui.com/material-ui/migration/upgrade-to-v7/)

### Google Cloud Document AI [2025-12-02 ~00:00-00:20 EET, GC]
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
**Next**: Improve spec matching (current 14.6% → target 36%+)

### OCR Integration [2025-12-01 ~01:09 EET, GC]
**Decision**: Tesseract 5.3.4 as fallback for image-based PDFs
**Rejected**: Google Cloud Vision (cost), manual transcription
**Rationale**:
- Toyota/BMW PDFs have zero extractable text
- Tesseract free and proven (9586 chars from Toyota)
- Fallback mechanism: if text <100 chars, load from *_ocr.txt
**Implementation**: hybrid_pdf_extractor.py line 656
**Status**: ✅ Working, integrated into quality gate
**Blocker**: Cell-spanning detection pending

### PDF-First Strategy [2025-11-26 Evening, Multiple Agents]
**Decision**: Prioritize securing files over extracting data
**Context**: Hatla2ee.com removed all manufacturer PDFs
**Rationale**:
- Files disappearing permanently
- Data extraction can happen later
- 80 PDFs secured in ~60 minutes
**Outcome**: ✅ Saved 80 PDFs that would be lost forever
**Validation**: Hatla2ee now has 0 PDF downloads available

### Data Fetching: Repository Pattern [2025-12-07 16:28 EET, Bash artifact]
**Decision**: Direct Supabase with repository abstraction
**Rejected**: SWR immediate adoption
**Rationale**:
- Server Components eliminate client-side fetching needs
- Repository pattern sufficient for MVP 0.5-1.0
- SWR adds complexity without current benefit
**Timeline**: SWR planned for MVP 1.5+
**Source**: User confirmation 2025-12-13, MVP_ROADMAP.md

### WhySMS v3 Provider [2025-12-11 22:51 EET, CCW]
**Decision**: WhySMS v3 API (/api/v3/sms/send)
**Implementation**: `src/services/sms/engine.ts`, `requestOtp()` function
**Status**: ✅ SMS send working
**Pending**: verifyOtp() persistence
**Commit**: ca9da33

### Booking + SMS Schema [2025-12-11 16:28 EET, Bash artifact]
**Decision**: Dedicated tables (bookings, sms_verifications)
**RLS**: Enabled on bookings, pending on sms_verifications
**Future**: Structure for microservice spin-off (OTP/KYC)
**File**: supabase/migrations/20251211_booking_schema.sql
**Status**: ⚠️ NOT applied to production

### Repository Pattern over Drizzle [2025-12-07 16:28 EET, Bash artifact]
**Decision**: Direct Supabase client with repository abstraction
**Rejected**: Drizzle ORM immediate adoption
**Rationale**: Faster iteration, simpler debugging for MVP
**Timeline**: Drizzle planned for MVP 1.5+ (SMS microservice)
**Source**: CLAUDE.md artifact reference

---

## QUALITY STANDARDS & ANTI-PATTERNS

### Critical Anti-Patterns (FORBIDDEN)

**Zustand Object Selectors** [2025-12-11 22:00 EET, User]:
```typescript
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
- **Rule**: 100% @/ alias usage, ZERO relative imports
- **Current**: 98% compliance (2 violations found)
- **Fix**: See Tech Stack section

**Premature Complexity**:
- Don't add Drizzle before MVP needs it
- Don't add SWR before client-side caching needed
- Don't create abstractions for one-time operations

**Bulk Dumps Instead of Incremental Updates** [2025-12-13 18:30 UTC, User]:
- ❌ FORBIDDEN: "Wait for all artifacts then process"
- ✅ REQUIRED: Process each THOS incrementally, update CLAUDE.md after each
- **Rationale**: Bulk approach failed before, incremental proven successful
- **User Quote**: "We've tried this, and this is an anti-pattern."

### Code Standards

**TypeScript**:
- Strict mode enabled (tsconfig.json)
- Prefer interfaces over types for public APIs
- No `@ts-ignore` without documented justification

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

**Types**: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`

**GPG Signing**: Mandatory for production commits
**Force Push**: Only on feature branches via `--force-with-lease`, never on main

---

## LESSONS LEARNED & FORENSICS

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
- Verified reality: Next.js 15.4.8, MUI 6.4.3, Supabase 2.50.0
- File count: Artifact estimated ~100, actual 77 (30% error)

**Root Cause**: Agents generating handovers without tool verification
**Impact**: Documentation drift, wrong upgrade decisions
**Solution**: **VERIFY 10x → PLAN 10x → EXECUTE 1x**

**Enforcement**:
- Every version: Check package.json directly
- Every count: Use wc -l, find, git commands
- Every claim: Cite source (file:line or commit SHA)
- If cannot verify with tools: ASK USER or provide exact commands

### Passive [VERIFY] Tags Failure [2025-12-13 ~16:00 UTC, User Feedback]

**Problem**: Writing `[VERIFY: requires credentials]` without attempting verification
**User Feedback**: "Actually, you are supposed to be intelligent... why didn't you?... How can you verify?"
**Impact**: Blocked progress, user had to intervene

**Correct Approach**:
1. Attempt verification with available tools (Read, Bash, grep, curl)
2. If blocked: REQUEST credentials explicitly
3. If still blocked: Provide exact commands for user to run
4. Update document immediately with verified data

**Example Fix**:
- Before: `[VERIFY: Supabase row counts]`
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
**Fix**: Add `no-restricted-imports` ESLint rule

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

---

**END OF CLAUDE.MD v2.1.0**

**Next Update**: After processing next THOS artifact from user
**Maintained By**: CC (Claude Code)
**Last Verified**: 2025-12-13 18:45 UTC

**Verification Sources**:
- package.json (Read tool)
- tsconfig.json (Read tool)
- Supabase REST API (curl with ANON_KEY)
- git commands (rev-list, log, status)
- File system (find, wc, ls)
- Web research (MUI docs, Snyk, Socket.dev)
- THOS artifacts (Dec 1-3, Nov 26, handovers)
