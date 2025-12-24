# Architecture Decisions (Complete)

Version: 2.4.0 | Last Updated: 2025-12-24 | Maintained By: CC

Format: Decision, Rationale, Status, Revisit Criteria

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
