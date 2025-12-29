# Missing Models - PDF Sourcing Plan

**Date**: 2025-12-29
**Status**: Phase 4 Complete - 92 Models Need Images
**Current Coverage**: 107/199 models (53.8%)
**Target**: 199/199 models (100%)

---

## Executive Summary

After YOLO extraction from 84 manufacturer PDFs:
- **✅ Extracted**: 84 new images (100% success rate)
- **📊 Total Coverage**: 107/199 (53.8%)
- **⚪ Missing**: 92 models (46.2%)

**Root Cause**: No manufacturer PDFs available for these 92 models in `pdfs/*/*_official/` directories.

---

## Missing Models by Brand

### High Priority Brands (Established Distributors)

#### Suzuki (8 models)
- [ ] Swift
- [ ] Swift Dzire 2025
- [ ] Fronx
- [ ] Ignis 2025
- [ ] Ciaz 2025
- [ ] Vitara 2025
- [ ] Baleno 2025
- [ ] Dzire 2025

**Sourcing Strategy**: Visit Suzuki Egypt official website, download brochures

#### Peugeot (9 models)
- [ ] 3008
- [ ] 508
- [ ] 2008 2025
- [ ] 2008 2026
- [ ] 208 2025
- [ ] 208 2026
- [ ] 308 2025
- [ ] 308 2026
- [ ] e 2008 2026

**Sourcing Strategy**: Peugeot Egypt website + ContactCars

#### Volkswagen (6 models)
- [ ] Tiguan 2025
- [ ] T Roc 2025
- [ ] Tayron 2025
- [ ] ID 4 2026
- [ ] Golf 2026
- [ ] Passat 2026

**Sourcing Strategy**: Volkswagen Egypt official site

#### Renault (9 models)
- [ ] Austral 2026
- [ ] Kardian 2025
- [ ] Kardian 2026
- [ ] Taliant 2025
- [ ] Taliant 2026
- [ ] Kadjar 2025
- [ ] Megane 2025
- [ ] Koleos 2025
- [ ] Talisman 2025

**Sourcing Strategy**: Renault Egypt + Mansour Automotive

---

### Medium Priority Brands (Emerging Players)

#### HAVAL (8 models)
- [ ] H6 2025
- [ ] Jolion 2026
- [ ] Jolion (duplicate?)
- [ ] H9 2025
- [ ] H6 GT 2025
- [ ] Dargo 2025
- [ ] H6 HEV 2025
- [ ] F7 2025

**Sourcing Strategy**: HAVAL Egypt website (check for duplicate Jolion entries)

#### BYD (4 models)
- [ ] F3
- [ ] Song Plus Imported
- [ ] Tang Imported
- [ ] Sealion 6 2026

**Sourcing Strategy**: BYD Egypt + ContactCars (imported models)

#### GAC (4 models)
- [ ] Empow 2025
- [ ] GS4 2025
- [ ] GS4 Max 2025
- [ ] GS8 2025

**Sourcing Strategy**: GAC Egypt website

#### Cupra (4 models)
- [ ] Terramar 2026
- [ ] Formentor 2025
- [ ] Born 2025
- [ ] Leon 2025

**Sourcing Strategy**: Cupra Egypt (SEAT Egypt)

#### Skoda (6 models)
- [ ] Kodiaq 2025
- [ ] Karoq 2025
- [ ] Octavia 2025
- [ ] Superb 2025
- [ ] Fabia 2025
- [ ] Kamiq 2025

**Sourcing Strategy**: Skoda Egypt

---

### Low Priority Brands (Limited Distribution)

#### BAIC (4 models)
- [ ] X3
- [ ] X55 2025
- [ ] BJ40 2025
- [ ] D50 2025

#### Citroën (1 model)
- [ ] C4

#### Fiat (1 model)
- [ ] Tipo

#### Opel (1 model)
- [ ] Mokka

#### JAC (1 model)
- [ ] J7

#### Jetour (1 model)
- [ ] X70

---

## Sourcing Workflow

### Phase 5.1: Download PDFs (Priority 1 Brands)
**Target**: Suzuki, Peugeot, Volkswagen, Renault (32 models)
**Time Estimate**: 2-3 hours

1. Visit manufacturer websites
2. Download official brochures for each model
3. Save to `pdfs/{Brand}/{brand}_official/` structure
4. Verify PDF contains hero images (preview in PDF viewer)

### Phase 5.2: YOLO Extraction
**Target**: 32 newly downloaded PDFs
**Time Estimate**: 30 minutes

```bash
# Run YOLO extraction on new PDFs
python3 scripts/2025-12-29-0430-CC-yolo-full-extraction.py
```

**Expected Success Rate**: 80-90% (based on Phase 4 results)

### Phase 5.3: Fallback to Stock Images
**Target**: Models without manufacturer PDFs (~10-20 models)
**Time Estimate**: 1 hour

For models where PDFs are unavailable:
1. Search Unsplash: `https://source.unsplash.com/1600x900/?{brand}+{model}+car`
2. Search dealer websites (ContactCars, YallaMotor)
3. Manual download and crop if needed

---

## Alternative: Database Consolidation

### Option: Remove Duplicate Year Entries
Some models have separate 2025/2026 entries that could share images:
- Peugeot 208 2025 / 208 2026
- Peugeot 2008 2025 / 2008 2026
- Renault Kardian 2025 / 2026
- Renault Taliant 2025 / 2026

**Trade-off**: Reduces missing count to ~75 models, but loses year-specific granularity

---

## Next Session Action Plan

### Immediate (Next 2 Hours)
1. **Execute Phase 4 SQL** in Supabase Dashboard
   - Verify no hardcoded placeholders
   - Confirm 107 models now have images
2. **Download Priority 1 PDFs** (Suzuki, Peugeot)
   - Target: 17 models
3. **Run YOLO extraction** on new PDFs
4. **Generate updated Phase 4 SQL** for new images

### Follow-up (Next 4-6 Hours)
1. Complete remaining Priority 1 brands (Volkswagen, Renault)
2. Move to Priority 2 brands (HAVAL, BYD, GAC, Cupra, Skoda)
3. Fallback sourcing for remaining models

### Final Target
- **100% coverage**: 199/199 models with images
- **Timeline**: 2-3 sessions (6-10 hours total)

---

## Files for Next Session

**PDFs to Download**:
- Save to: `pdfs/{Brand}/{brand}_official/{Model}_{Year}.pdf`

**Scripts to Run**:
1. `scripts/2025-12-29-0430-CC-yolo-full-extraction.py` (YOLO extraction)
2. `scripts/2025-12-29-0545-CC-generate-phase4-sql.py` (SQL regeneration)

**SQL to Execute**:
- Current: `scripts/2025-12-29-0545-CC-phase4-image-mapping.sql` (107 models)
- After Phase 5.1: Regenerated SQL (107 + new extractions)

---

**Report Generated**: 2025-12-29 ~06:00 EET
**Agent**: CC (Claude Code)
**Status**: Ready for Phase 5 (PDF sourcing + extraction for 92 missing models)
