# Next Tasks - MVP Alignment

## Current Status
- ✅ PR #7 merged (PDF extraction engine)
- ⚠️ Repository needs housekeeping
- ⚠️ AI prompt extraction broken (377 vs ~23)

## MVP Requirements Review

### MVP 1: PDF Extraction ✅ COMPLETE
- [x] Extract tables from BMW brochure
- [x] Support Claude + Gemini models
- [x] Visual validation pipeline
- [x] Quality benchmarking

### MVP 2: Data Quality 🟡 IN PROGRESS
- [ ] Fix duplicate specs in JSON
- [ ] Resolve category mismatches
- [ ] Validate implausible data
- [x] Create quality reports

### MVP 3: Repository Health 🔴 BLOCKED
- [ ] Clean root folder structure
- [ ] Archive legacy files
- [ ] Fix AI prompt extraction
- [ ] Remove temp/debug files

## Priority 1 Tasks (This Week)
1. **Fix AI prompt extraction** (This session)
   - Target: ~20-25 actual prompts, not 377
   - Include prompt TEXT, not just URLs
   
2. **Repository housekeeping** (This session)
   - Move files to proper folders
   - Archive "sorcery" typo folder
   - Clean root directory

3. **Branch convergence** (This session)
   - Delete obsolete branches
   - Ensure main is single source of truth

## Priority 2 Tasks (Next Sprint)
4. **Data quality fixes** (JSON issues)
   - Fix duplicate BMW specs
   - Resolve category mismatches

5. **Security updates**
   - Address 10 Dependabot vulnerabilities
   - Fix Sourcery subprocess warning

6. **Documentation**
   - Update README with current architecture
   - Document extraction pipeline
   - Add troubleshooting guide

## Success Criteria
- ✅ Root folder contains only: README, LICENSE, requirements, setup files
- ✅ All Python code in extraction_engine/
- ✅ All scripts in scripts/
- ✅ All data in data/
- ✅ All docs in docs/
- ✅ Only main branch active
- ✅ AI prompts file has ~20-25 entries with actual content
