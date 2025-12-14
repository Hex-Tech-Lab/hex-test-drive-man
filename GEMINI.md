# CLAUDE.md - Project Brain (CC Owns) [2025-12-14 18:00 UTC]

**Version**: 2.2.0
**Last Updated**: 2025-12-14 18:00 UTC
**Production Deadline**: 2025-12-31 EOD UTC (or early Jan 2026)
**Status**: ACTIVE - Documentation mode, code freeze until v2.2.0 complete

## CC Operating Instructions (MANDATORY - READ FIRST)
You are CC (Claude Code / CCW = Claude Code Web) and you are an expert full-stack developer and system architect at the top 0.1% expertise level in the world.

CORE RULES:
- Assume 0.1% expert in ANY domain/subdomain on demand
- Multi-modal expertise combined until task concluded
- Act as thought partner: push back when trajectory misaligns
- Ask max 1 clarifying question if <95% confident
- NO appeasement; challenge illogical paths immediately

COMMUNICATION STYLE:
- TOC structure: sections (##) + bullets (-)
- 7-15 words/bullet (max 25 for complex concepts)
- Direct, non-verbose, expert-level assumptions
- Expand ONLY if: explanation needed, user missing point, handicap anticipated

QUALITY DISCIPLINE:
- Check objective alignment every iteration
- Flag: futility, off-track work, troubleshooting loops, time waste
- Recommend correctives: brief, swift, precise
- First-time resolution: think/plan/check/validate MORE → execute LESS

TECHNICAL STACK (FROZEN):
- pnpm ONLY | MUI 6.4.3 (LTS, NOT v7) | Zustand stores
- Supabase + repository pattern (Drizzle MVP 1.5+)
- GitHub = single source of truth

WORKFLOW:
- Session ends: git checkout -b [agent]/[feature] → commit → push → PR
- One agent per feature | CC audits all
- Tooling: CodeRabbit/Sourcery/Sonar/Snyk/Sentry

AGENT CONSTRAINTS:
- CC/CCW: CLAUDE.md owner, architecture, SMS/OTP/2FA end-to-end, PR audits
- GC: Git/PR/doc sync, large refactors (1M context)
- BB: Scripts/tools, separate verticals

DOC STANDARDS:
- CLAUDE.md = authority (never delete content)
- GEMINI.md/BLACKBOX.md sync from CLAUDE.md
- Date/time/agent stamps: [YYYY-MM-DD HH:MM UTC, Agent]
- Version bump after each cohesive work block

MVP PRIORITIES:
1. Highest business value
2. Least troubleshooting loops
3. Fastest GTM
4. Minimal tech debt
5. Clean as you go

FORBIDDEN:
- Verbose responses | Multiple agents/feature
- Local-only work | Skip quality gates
- Premature complexity (Drizzle later)
- Code changes when task scope is documentation only

---

## TECH STACK [2025-12-14 18:00 UTC, CC]

### Core Application (Verified 2025-12-07)
✓ Next.js 15.4.8 (App Router, React 19 support)
✓ React 19.2.0, React DOM 19.2.0
✓ TypeScript 5.7.3 (strict mode, @/* aliases enforced)
✓ pnpm 9.x+ ONLY (npm/yarn forbidden - lockfile conflicts)

### UI/State (Verified 2025-12-07)
✓ MUI 6.4.3 (NOT v7 - staying LTS until mid-2026)
✓ @mui/icons-material 6.4.3
✓ Emotion 11.14.x (@emotion/react, @emotion/styled, @emotion/cache)
✓ Zustand 5.0.3 (primitive selectors ONLY - object selectors forbidden)

### Backend/Data (Verified 2025-12-11)
✓ Supabase 2.50.0 (PostgreSQL client + repository pattern)
✓ WhySMS v3 SMS provider (/api/v3/sms/send)
⏳ Drizzle ORM (MVP 1.5+, SMS microservice spin-off)
⏳ Upstash Redis/QStash (queue system, planned)

### Monitoring/Analytics (Verified 2025-12-07)
✓ Sentry 10.29.0 (error tracking)
✓ Vercel Analytics 1.4.1
✓ Vercel Speed Insights 1.1.0

### PDF Extraction Pipeline (Verified 2025-12-02)
✓ Python 3.12.x (venv at /home/kellyb_dev/projects/hex-test-drive-man/venv)
✓ Tesseract OCR 5.3.4 (system package)
✓ pdfplumber (latest via pip3)
✓ pytesseract 0.3.13
✓ pdf2image 1.17.0
✓ opencv-python 4.12.0.88
✓ numpy 2.2.6
✓ Pillow 11.3.0

### Google Cloud Document AI (Verified 2025-12-03)
✓ google-cloud-documentai 3.7.0
✓ google-api-core 2.28.1
✓ google-auth 2.43.0
✓ GCP Project: gen-lang-client-0318181416 (HexTestDrive)
✓ Region: eu (Frankfurt)
✓ Processor: projects/478059461322/locations/eu/processors/6a8873bffd24ad4
✓ Type: FORM_PARSER_PROCESSOR
✓ Version: pretrained-form-parser-v2.1-2023-06-26

---

## GUARDRAILS (NEVER BYPASS) [2025-12-14 18:00 UTC, CC]

### Dependency Upgrade Restrictions
**ESLint 8.x → 9.x**:
- REQUIRES flat config migration (eslint.config.js)
- FORBIDDEN to auto-upgrade without manual migration
- Current .eslintrc deprecated options must be removed

**MUI 6.x → 7.x**:
- REQUIRES slots/slotProps API refactor (breaking changes)
- Decision: Stay on 6.4.3 LTS until mid-2026
- Migration cost HIGH, business value NONE for current MVP

**Next.js major bumps**:
- REQUIRES App Router review + API route audit
- FORBIDDEN to upgrade without testing all dynamic routes

**React 19.x**:
- REQUIRES primitive Zustand selectors (no object selectors)
- Infinite loop risk if object selectors used

### Code Modification Discipline
- CC/CCW: CLAUDE.md updates ONLY unless explicitly asked for code changes
- NEVER auto-fix linter/type issues without user approval
- NEVER upgrade dependencies in response to Dependabot without architecture review
- NEVER commit code changes when task scope is documentation
- ALWAYS verify task scope before writing/editing code files

### Build/Deploy Gates
- TypeScript strict mode: 100% compliance mandatory
- pnpm ONLY (npm/yarn forbidden - lockfile conflicts)
- All tests pass before commit (when test suite exists)
- Sentry error budget: <0.1% error rate in production

### Git Discipline
- NO --force push to main/master (or any branch without explicit permission)
- NO --no-verify (respect pre-commit hooks)
- **GPG signing: ENABLED** (verified 2025-12-14, `git config commit.gpgsign = true`)
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

## GIT STATUS [2025-12-14 18:00 UTC, CC]

**Current Branch**: `claude/sync-agent-instructions-015BBjkGH1Syq5uEU6r2uGCg`
**HEAD**: `b2b2557` (docs: 10x CLAUDE.md restructure, 2025-12-12 00:45 EET)
**Working Tree**: Clean
**Remote**: Synced with origin

**Recent Commits** (reverse chrono):
- b2b2557: docs(hex-ai): 10x CLAUDE.md restructure [2025-12-12 00:45 EET]
- 6c23ac7: fix(agents): remove YAML frontmatter from agent MDs
- 1912367: docs(agents): update CC/GC operating instructions
- ca9da33: feat(booking): use requestOtp engine for booking phone verification
- ad40cd7: feat(sms): add requestOtp/verifyOtp API with WhySMS send

**Dependabot Alerts**: 10 vulnerabilities (3 high, 7 moderate)
**Action Required**: Review and remediate per GUARDRAILS (no auto-upgrade)

---

## OPEN ITEMS [2025-12-14 18:00 UTC, CC]

### Priority 1: Documentation (THIS SESSION)
1. ✅ Fix BB's 5 CLAUDE.md issues (version, timestamps, deadline, GPG, verification)
2. ✅ Add GUARDRAILS section
3. 🔄 Integrate THOS Dec 1-2 (PDF/OCR) - IN PROGRESS
4. ⏳ Integrate THOS Dec 2-3 (Document AI)
5. ⏳ Version bump to v2.2.0
6. ⏳ Sync to GEMINI.md and BLACKBOX.md
7. ⏳ Process remaining THOS artifacts (user to provide one-by-one)

### Priority 2: CCW Implementation (AFTER CLAUDE.md complete)
1. SMS/OTP/2FA end-to-end implementation
2. Text templates for all OTP scenarios (booking, login, verification)
3. Full UI/UX implementation
4. Quality gates + tests
5. Structured for microservice spin-off (separate tables/relationships)
6. Deploy for user testing

### Priority 3: Technical Debt
1. Apply booking schema migration to Supabase
2. Add RLS policies to sms_verifications table
3. Resolve Dependabot alerts (10 vulnerabilities)
4. Add ESLint no-restricted-imports rule (enforce @/* aliases)
5. Fix ESLint deprecated options (useEslintrc, extensions)

---

## MVP STATUS [2025-12-14 18:00 UTC, CC]

**MVP 0.5**: ✅ COMPLETE
- Catalog pages (EN/AR)
- Vehicle browse/compare
- Data quality baseline (409 vehicle_trims, 95 brands, 199 models)

**MVP 1.0**: 🔄 30% COMPLETE (Booking + OTP)
- ✅ requestOtp() → WhySMS SMS send [ca9da33]
- ✅ bookings table schema defined [supabase/migrations/20251211_booking_schema.sql]
- ❌ verifyOtp() stub (no persistence layer)
- ❌ sms_verifications table NOT applied to production
- ❌ /bookings/[id]/verify page missing
- ⚠️ Node.js import in client component issue (OTP calls commented out)

**MVP 1.5**: ⏳ PLANNED (PDF Extraction + Document AI)
- 🔄 OCR integration: 2/5 quality gate pass (Toyota Corolla working)
- 🔄 Document AI: 82 rows extracted, 12/82 matched (~15% coverage)
- ❌ Cell-spanning detection pending
- ❌ Spec matching definitions incomplete (need 15 core specs)
- ❌ Full brand coverage (40+ PDFs)

---

## DATABASE ARCHITECTURE [2025-12-14 18:00 UTC, CC]

**Supabase Instance**: https://lbttmhwckcrfdymwyuhn.supabase.co
**Region**: US East
**Total Tables**: 46+

### Verified Row Counts (2025-12-14, via REST API)
- vehicle_trims: 409
- brands: 95
- models: 199
- segments: 6
- agents: 20
- agent_brands: 45

### Schema Status
**Production (Applied)**:
- vehicle_trims, brands, models, segments (catalog tables)
- agents, agent_brands (assignment tables)
- auth.users (Supabase managed)

**Pending Migration (NOT in production)**:
- bookings table (defined in supabase/migrations/20251211_booking_schema.sql)
- sms_verifications table (RLS policies missing)

**Repository Pattern**:
- NO direct Supabase calls from components
- All data access via /src/repositories/*
- Example: vehicleRepository, bookingRepository

---

## SESSION TIMELINE (Reverse Chrono) [2025-12-14 18:00 UTC, CC]

### Session: Dec 14, 2025 (18:00 UTC) [CC]
**Key Outcomes**:
1. Fixed BB's 5 CLAUDE.md issues (version, timestamps, deadline, GPG, verification)
2. Added GUARDRAILS section (dependency restrictions, code discipline, git rules)
3. Integrating THOS Dec 1-2 (PDF/OCR)
4. Integrating THOS Dec 2-3 (Document AI)
5. Version bump to v2.2.0 planned
6. Clarified CC = CCW (same agent, SMS/OTP/2FA ownership confirmed)

### Session: Dec 2-3, 2025 (22:00 - 01:42 EET / 20:00 - 23:42 UTC) [CC]
**Key Outcomes**:
1. **Google Cloud Document AI integration**:
   - GCP Project: gen-lang-client-0318181416 (HexTestDrive)
   - Processor: Form Parser v2.1 in eu region
   - Service account: doc-ai-extractor with documentai.apiUser role
   - Credentials: /home/kellyb_dev/.config/gcp/doc-ai-key.json
2. **Toyota Corolla PDF processed**:
   - 82 structured rows extracted from toyota_extracted.json
   - 12/82 specs matched (~14.6% coverage)
   - Matched specs: sunroof, parking_camera, steering_column, turning_radius, airbags, ac_system, screen_size
3. **Spec matching layer implemented**:
   - Files: spec_matcher.py, toyota_analyzer.py, spec_definitions.json
   - Fuzzy matching with difflib.SequenceMatcher
   - Valid/typo/forbidden pattern lists (EN + AR)
   - CLI test mode: `python3 spec_matcher.py test_row "Engine Type" "نوع المحرك"`
4. **Blockers identified**:
   - spec_definitions.json incomplete (only 15 specs, need ~64 for Corolla)
   - One mis-match: "Max Torque" → max_output (threshold too permissive)
   - Arabic labels empty in Document AI output (name_ar="")
   - No footnote/endnote detection implemented
5. **Python venv created**:
   - Path: /home/kellyb_dev/projects/hex-test-drive-man/venv
   - Reason: Ubuntu 24.04 PEP 668 blocks system pip
   - Libraries: google-cloud-documentai 3.7.0, google-api-core 2.28.1

### Session: Dec 1-2, 2025 (22:00 - 01:42 EET / 20:00 - 23:42 UTC) [CC]
**Key Outcomes**:
1. **OCR integration complete**:
   - Tesseract 5.3.4 installed (system package)
   - Python libs: pytesseract 0.3.13, pdf2image 1.17.0, Pillow 11.3.0
   - Toyota Corolla: 9586 chars extracted, saved to Corolla_2026_ocr.txt
2. **Quality gate baseline established**:
   - 2/5 pass: Kia Sportage (6 trims), Nissan Sunny (4 trims)
   - 1/5 fail: Toyota Corolla (0 text before OCR)
   - 2/5 partial: BMW X5, Chery Tiggo
3. **Critical discovery - Cell-spanning issue**:
   - Toyota PDFs use merged cells for shared specs across trims
   - Example: "Engine Type" centered across all 5 trims
   - Current parser assigns to single trim (wrong)
   - Solution designed: Calculate column boundaries, detect overlap %
4. **Trim detection working**:
   - 5 trims identified: ACTIVE, COMFORT, SMART, ELEGANCE, ELEGANCE HEV
   - x-coordinate clustering functional
   - Column boundaries need tightening (±100px too wide)
5. **Files created**:
   - hybrid_pdf_extractor.py (OCR fallback at line 656)
   - enhanced_trim_parser.py (column detection, cell-span TODO)
   - ocr_preprocessor.py (standalone OCR utility)
   - text_column_extractor.py (row/column bbox detection)
   - quality_gate_results.json (2/5 baseline)
   - docs/OCR_CELL_SPANNING_ISSUE.md (problem documentation)
6. **Folder cleanup**:
   - Moved lowercase brand folders to pdfs_archive_for_review/
   - Retained capitalized folders (official PDFs only)

### Session: Dec 12, 2025 (00:45 EET / 22:45 UTC Dec 11) [Hex-AI]
**Key Outcomes**:
1. CLAUDE.md 10x restructure (103 → 104 lines)
2. Operating instructions formalized
3. Agent ownership clarified (CC/CCW/GC/BB)
4. Git status documented (5 days behind, blocker identified)

### Session: Dec 11, 2025 (22:51 EET / 20:51 UTC) [CCW]
**Key Outcomes**:
1. SMS engine WhySMS integration (commit ca9da33)
2. requestOtp() → WhySMS /api/v3/sms/send working
3. Booking schema migration created (not applied)
4. verifyOtp() stub (no persistence)

### Session: Dec 7, 2025 (16:28 EET / 14:28 UTC) [Bash]
**Key Outcomes**:
1. Repository pattern established (no direct Supabase calls)
2. Tech stack verified (Next.js 15.4.8, MUI 6.4.3, React 19)
3. Booking schema defined (bookings + sms_verifications tables)

---

## AGENT OWNERSHIP [2025-12-14 18:00 UTC, CC]

**CC/CCW** (Claude Code / Claude Code Web - SAME AGENT):
- CLAUDE.md owner, architecture decisions, final audit
- **SMS/OTP/2FA end-to-end implementation** (Phase 1-3: persistence → UI/UX → KYC)
- Text templates for all OTP scenarios
- Quality gates + tests for SMS system
- Structured for microservice spin-off

**GC** (Gemini Code):
- GitHub sync, doc propagation (GEMINI.md updates)
- Large refactors (1M context advantage)
- PR reviews from Gemini perspective

**BB** (Blackbox):
- Dev scripts, CI tools, admin dashboards
- BLACKBOX.md updates
- Separate vertical features (non-core)

---

## ARCHITECTURE DECISIONS (Reverse Chrono) [2025-12-14 18:00 UTC, CC]

### Dec 3, 2025: Google Cloud Document AI [CC]
- **Decision**: Use Document AI Form Parser v2.1 as raw extractor
- **Rationale**: Grid-line detection failed, Tesseract+enhanced_trim_parser too brittle
- **Region**: eu (Frankfurt) for GDPR compliance
- **Intelligence**: Local rules engine (spec_matcher.py), NOT AI-driven
- **Status**: 82 rows extracted from Corolla, 14.6% match coverage

### Dec 2, 2025: OCR Integration [CC]
- **Decision**: Tesseract 5.3.4 for image-based PDFs
- **Rationale**: Toyota/BMW PDFs have zero extractable text
- **Fallback**: hybrid_pdf_extractor.py line 656 checks if text < 100 chars, loads *_ocr.txt
- **Status**: Working, 9586 chars from Corolla

### Dec 2, 2025: Python venv Required [CC]
- **Decision**: Create venv at /home/kellyb_dev/projects/hex-test-drive-man/venv
- **Rationale**: Ubuntu 24.04 PEP 668 blocks system pip (externally-managed)
- **Activation**: `source venv/bin/activate` before any Python work
- **Status**: Active, google-cloud-documentai 3.7.0 installed

### Dec 1, 2025: PDF-First Strategy [CC]
- **Decision**: Extract from OEM PDFs, NOT manual entry or web scraping
- **Rationale**: Single source of truth, bilingual support, trim variations documented
- **Quality Gate**: 2/5 pass baseline (Kia, Nissan), Toyota requires OCR
- **Status**: In progress

### Nov 11, 2025: WhySMS v3 Provider [CCW]
- **Decision**: WhySMS /api/v3/sms/send as primary SMS provider
- **Rationale**: Egyptian market, competitive pricing, reliable delivery
- **API**: https://api.whysms.me/api/v3/sms/send
- **Status**: Working, requestOtp() implemented [ca9da33]

### Nov 7, 2025: Repository Pattern [Bash]
- **Decision**: NO direct Supabase calls from components
- **Rationale**: Testability, data layer abstraction, future Drizzle migration
- **Pattern**: All data access via /src/repositories/*
- **Status**: Enforced

### Nov 7, 2025: MUI 6.4.3 LTS Decision [CC]
- **Decision**: Stay on MUI 6.4.3, do NOT upgrade to v7
- **Rationale**: Zero CVEs in 6.4.3, v7 requires slots/slotProps refactor (breaking), LTS until mid-2026
- **Migration Cost**: HIGH (all components affected)
- **Business Value**: NONE for current MVP
- **Revisit**: After MVP 1.5 or if CVE discovered

---

## PDF EXTRACTION PIPELINE [2025-12-14 18:00 UTC, CC]

### Current Status
**Quality Gate**: 2/5 pass (Kia Sportage, Nissan Sunny)
**In Progress**: Toyota Corolla (OCR working, cell-spanning pending)
**Blocked**: BMW X5, Chery Tiggo (format variations)

### Architecture
**Layer 1 - Raw Extraction**:
- Tesseract OCR 5.3.4 for image PDFs
- Document AI Form Parser v2.1 for structured extraction
- Fallback: pdfplumber for text-based PDFs

**Layer 2 - Parsing**:
- enhanced_trim_parser.py (x-coordinate clustering)
- Cell-span detection algorithm (PENDING - line 60+)
- Column boundary calculation (trim_ranges logic)

**Layer 3 - Matching**:
- spec_matcher.py (fuzzy matching with difflib)
- spec_definitions.json (15 specs defined, need ~64)
- Valid/typo/forbidden pattern lists (EN + AR)

**Layer 4 - Quality Gate**:
- toyota_analyzer.py (match coverage reporting)
- Row classification (spec_row, section_header, footnote, note, noise)
- Validation: same spec count across trims

### Critical Files (WSL Paths)
```
/home/kellyb_dev/projects/hex-test-drive-man/
├── google_documentai_extractor.py  # Document AI integration
├── hybrid_pdf_extractor.py         # OCR fallback at line 656
├── enhanced_trim_parser.py         # Column detection (cell-span TODO)
├── spec_matcher.py                 # Fuzzy matching engine
├── toyota_analyzer.py              # Match coverage reporting
├── spec_definitions.json           # 15 specs (incomplete)
├── ocr_preprocessor.py             # Standalone OCR utility
├── text_column_extractor.py        # Row/column bbox detection
├── quality_gate_results.json       # 2/5 baseline
├── venv/                           # Python 3.12 virtual environment
└── pdfs/
    └── Toyota/toyota_official/Corolla_2026.pdf  # Test file
```

### Commands (Copy-Paste Ready)
```bash
# Activate venv
cd /home/kellyb_dev/projects/hex-test-drive-man
source venv/bin/activate

# Run Document AI extractor
python3 google_documentai_extractor.py

# Run OCR preprocessor
python3 ocr_preprocessor.py pdfs/Toyota/toyota_official/Corolla_2026.pdf

# Test spec matcher
python3 spec_matcher.py test_row "Engine Type" "نوع المحرك"

# Analyze Corolla extraction
python3 toyota_analyzer.py

# View extraction results
jq '.specs | .[0:3]' toyota_extracted.json
```

### Known Issues
1. **Cell-spanning**: Merged cells assigned to single trim (should apply to multiple)
2. **Column boundaries**: ±100px tolerance causes data bleeding between trims
3. **Arabic labels**: Document AI returns name_ar="" (empty), Arabic in trims instead
4. **Spec labels**: Captures "Max" instead of "Max Torque" (leftmost cell truncated)
5. **Match coverage**: 12/82 (14.6%) due to incomplete spec_definitions.json

### Next Actions (PDF Pipeline)
1. Implement cell-span detection in enhanced_trim_parser.py (line 60+)
2. Rebuild spec_definitions.json (clean JSON, 15 core specs validated)
3. Refine match_spec scoring (prevent "Max Torque" → max_output)
4. Add row classification (section_header vs spec_row vs note)
5. Expand to 40+ brand PDFs after quality gate 4/5 pass

---

## QUALITY STANDARDS & ANTI-PATTERNS [2025-12-14 18:00 UTC, CC]

### Quality Gates (Code)
- TypeScript strict mode: 100% compliance
- @/* path aliases: 100% enforcement (NO relative imports)
- Build: `pnpm build` passes with zero errors
- Tests: All pass before commit (when test suite exists)
- ESLint: Zero errors, warnings accepted if documented

### Quality Gates (PDF Extraction)
- Text extraction: >100 chars per spec page
- Trim detection: All trims identified correctly
- Spec matching: >30% coverage on first pass (target: >80% final)
- Row classification: All rows categorized (spec/header/note/noise)
- Cross-trim validation: Same spec count per trim

### Anti-Patterns (FORBIDDEN)
**Bulk Processing**:
- ❌ Waiting for all THOS artifacts then processing in one shot
- ✅ Process each THOS incrementally, commit after each

**Inline Code Blocks**:
- ❌ Showing updates in markdown code blocks
- ✅ Use Write/Edit tools, update actual files

**Appeasement**:
- ❌ Confirming user beliefs without verification
- ✅ Challenge with data, push back on futile paths

**Fabrication**:
- ❌ Claiming version numbers without verification
- ✅ Read package.json, use tool outputs, cite sources

**Scope Creep**:
- ❌ Fixing linter issues when task is documentation
- ❌ Auto-upgrading dependencies without approval
- ✅ Stay laser-focused on stated task scope

---

## LESSONS LEARNED & FORENSICS [2025-12-14 18:00 UTC, CC]

### Incremental > Bulk (Dec 14, 2025)
**Issue**: Proposed waiting for all THOS artifacts before processing
**User Feedback**: "We've tried this, and this is an anti-pattern"
**Root Cause**: Assumption that batch processing is more efficient
**Fix**: Process each THOS one-by-one, update CLAUDE.md after each
**Lesson**: User has empirical evidence of what works - trust it

### Documentation Task Scope Violation (Dec 14, 2025)
**Issue**: Started fixing TypeScript alias violations during documentation session
**User Feedback**: "You were under no instruction to carry out any code change exercise"
**Root Cause**: Over-eagerness to "help" beyond stated task scope
**Fix**: GUARDRAILS section added, code modification discipline enforced
**Lesson**: VERIFY task scope before touching code files, even for "obvious" fixes

### Version Fabrication Pattern (Dec 13, 2025 - hypothetical session)
**Issue**: Artifacts claimed Next.js 16.0.6, MUI 7.3.5, Supabase 2.86.0
**Verified Reality**: Next.js 15.4.8, MUI 6.4.3, Supabase 2.50.0
**Root Cause**: LLM extrapolation from partial data
**Fix**: VERIFY 10x mandate - Read package.json, use tools, cite sources
**Lesson**: Every version number must be tool-verified, never assumed

### Cell-Spanning Detection Failure (Dec 2, 2025)
**Issue**: Toyota PDFs use merged cells for shared specs across trims
**Impact**: "Engine Type" assigned to single trim instead of all 5
**Root Cause**: x-coordinate clustering assumes 1:1 cell-to-trim mapping
**Fix**: Column boundary calculation + overlap detection algorithm designed
**Status**: Implementation pending in enhanced_trim_parser.py line 60+
**Lesson**: PDF table structures vary wildly, assumptions break on real data

### PEP 668 Externally-Managed Environment (Dec 3, 2025)
**Issue**: `pip install google-cloud-documentai` failed on Ubuntu 24.04
**Error**: "externally-managed-environment"
**Root Cause**: PEP 668 protection against system Python corruption
**Fix**: Created venv at /home/kellyb_dev/projects/hex-test-drive-man/venv
**Lesson**: Modern Ubuntu requires venv for all Python library installs

### Document AI Processor Creation (Dec 3, 2025)
**Issue**: `gcloud documentai` CLI component not available
**Workaround**: Used REST API with `gcloud auth print-access-token`
**Command**: `curl POST https://eu-documentai.googleapis.com/v1/projects/.../processors`
**Lesson**: GCP CLI coverage incomplete, REST API is authoritative source

---

## VERSION HISTORY

### v2.2.0 (2025-12-14 18:00 UTC) [CC]
- Fixed BB's 5 issues (version tracking, timestamps UTC, deadline, GPG, verification commands)
- Added GUARDRAILS section (dependency restrictions, code discipline, git rules, DB verification)
- Integrated THOS Dec 1-2 (PDF/OCR: Tesseract, quality gate 2/5, cell-spanning issue)
- Integrated THOS Dec 2-3 (Document AI: GCP setup, 82 rows, 14.6% match coverage)
- Standardized all timestamps to UTC format [YYYY-MM-DD HH:MM UTC, Agent]
- Production deadline clarified: 2025-12-31 EOD UTC or early Jan 2026
- GPG signing status verified: ENABLED
- Version bump policy: Increment after each cohesive work block

### v2.1.0 (2025-12-12 00:45 EET / 2025-12-11 22:45 UTC) [Hex-AI]
- Reorganized section order (Git Status #3, Open Items #4, MVP #5)
- Added Session Timeline section (reverse chrono, 3-5 outcomes per session)
- Clarified agent ownership (CC/CCW/GC/BB)
- Git sync blocker documented

### v2.0.0 (2025-12-12 00:00 EET / 2025-12-11 22:00 UTC) [Hex-AI]
- Initial 10x comprehensive restructure
- Operating instructions formalized
- Tech stack section added
- MVP status tracking

### v1.0.0 (2025-11-07) [Initial]
- Basic project setup notes
- Agent assignments

---

**END OF CLAUDE.md v2.2.0**
