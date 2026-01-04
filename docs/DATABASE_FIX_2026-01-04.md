# Database Fix - Production Data Quality

**Date**: 2026-01-04 23:30 UTC
**Agent**: CC (Claude Code)
**Status**: ✅ ALL FIXES COMPLETE

---

## Executive Summary

Fixed 5 critical database issues affecting display quality and consistency:

| Issue | Before | After | Impact |
|-------|--------|-------|--------|
| **Duplicate models** | 6 groups | 0 | Eliminated duplicate cards in catalog |
| **Brand inconsistencies** | 2 brands (Haval/HAVAL) | 1 | Unified brand listings |
| **Fuel terminology** | 2 terms (Petrol/Gasoline) | 1 | Standardized to Gasoline |
| **Body type formatting** | Mixed case (sedan/SUV) | Title case | Consistent display |
| **Vehicle names** | 2 incorrect | Fixed | Correct Suzuki Dzire naming |

---

## Issue 1: Duplicate Model IDs (ROOT CAUSE FOUND)

### Problem
User saw duplicate vehicle cards on production (e.g., BYD F3 2025 appearing twice with different prices).

### Root Cause
Database had **duplicate model IDs** for same vehicle with/without year suffix:
- Model A: "F3" (no year)
- Model B: "F3 2025" (with year)
- Frontend `formatVehicleTitle()` creates same display name: "BYD F3 2025"
- Result: 2 cards with different trim sets and prices

### Duplicates Found & Merged

| Model | Model IDs | Trims | Solution |
|-------|-----------|-------|----------|
| **Chery Tiggo 7 2025** | 2 | 4 | Merged to "Tiggo 7" |
| **Kia Sportage 2025** | 2 | 10 | Merged to "Sportage" (has image) |
| **BYD F3 2025** | 2 | 4 | Merged to "F3" |
| **HAVAL Jolion 2025** | 2 | 6 | Merged to "Jolion" |
| **Chery Arrizo 5 2025** | 2 | 6 | Merged to "Arrizo 5" |
| **Suzuki Fronx 2024** | 2 | 2 | Merged to "Fronx" (has image) |

### Merge Logic
1. Group by `(brand_id, clean_name, year)` where `clean_name` removes year suffix
2. Choose PRIMARY: prefer model with `hero_image_url`, then shortest name
3. Update all `vehicle_trims.model_id` to PRIMARY
4. Delete duplicate models

### Result
- **6 duplicate models merged** → 0 duplicates
- Catalog now shows **173 unique vehicle cards** (was showing 179 due to duplicates)

---

## Issue 2: Brand Inconsistencies

### Problem
"Haval" and "HAVAL" existed as separate brands, splitting vehicle listings.

### Fix
- Merged all "Haval" models → "HAVAL" brand ID
- Updated models and vehicle_trims tables
- Deleted duplicate "Haval" brand

### Result
- **1 brand duplicate merged**
- All Haval vehicles now under "HAVAL" (official styling)

---

## Issue 3: Fuel Terminology Standardization

### Problem
Mixed usage: "Petrol" (60 vehicles, 15.2%) vs "Gasoline" (336 vehicles, 84.8%)

### Fix
- Converted all "Petrol" fuel_type_id → "Gasoline" fuel_type_id
- Deleted "Petrol" from fuel_types table

### Result
- **60 vehicles updated** to use "Gasoline"
- Consistent terminology across all 396 vehicles

---

## Issue 4: Body Type Formatting

### Problem
Mixed capitalization: "sedan", "suv", "hatchback", "coupe" (lowercase)

### Fix
- Updated categories table:
  - `sedan` → `Sedan`
  - `suv` → `SUV`
  - `hatchback` → `Hatchback`
  - `coupe` → `Coupe`

### Result
- **4 body type names standardized** to Title/UPPER case
- Consistent display formatting

---

## Issue 5: Vehicle Name Corrections

### Problem
Incorrect model names:
- "Suzuki Swift Dzire" (should be "Dzire" - Dzire is not a Swift variant)
- "BAIC X3" (should be "X35")

### Fix (Partial - 1 Issue)
- ❌ **Over-replacement bug**: Script replaced ALL "X3" including BMW "iX3" → "iX35"
- ✅ **Rollback**: Fixed BMW iX3 back to correct name
- ✅ **BAIC X35**: Correctly renamed from "X3"
- ✅ **Suzuki Dzire**: Removed "Swift" prefix (2 models: 2024, 2025)

### Result
- **2 Suzuki models fixed**: "Swift Dzire" → "Dzire"
- **1 BAIC model fixed**: "X3" → "X35"
- **BMW iX3 preserved**: Correct name maintained

---

## Scripts Created

### 1. `/tmp/comprehensive_database_fix.py`
- Executed: HAVAL merge, fuel standardization, body type fixes, name fixes
- **Status**: Partially successful (over-replacement bug in name fixes)

### 2. `/tmp/merge_duplicate_models.py`
- Merged 6 duplicate model groups
- **Status**: ✅ SUCCESS - all duplicates resolved

### 3. Rollback Script (inline)
- Fixed BMW iX3, BAIC X35 over-replacements
- **Status**: ✅ SUCCESS

---

## Final Database State

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| **Total models** | 408 | 402 | -6 (duplicates merged) |
| **Unique display cards** | 179 (173 unique + 6 dupes) | 173 | -6 duplicates |
| **Brands** | 95 (2 Haval variants) | 94 | -1 (merged) |
| **Fuel types** | 2 (Petrol/Gasoline) | 1 (Gasoline only) | -1 |
| **Body type formats** | Mixed case | Title case | Standardized |

---

## Production Impact

### User-Visible Changes
1. **Duplicate cards eliminated**: BYD F3, Chery Tiggo 7, etc. now show once
2. **Consistent branding**: All Haval vehicles under "HAVAL"
3. **Uniform fuel labels**: All show "Gasoline" (no "Petrol")
4. **Professional formatting**: "Sedan" not "sedan", "SUV" not "suv"
5. **Correct names**: "Suzuki Dzire" (not "Swift Dzire")

### Performance Improvement
- Catalog shows 173 vehicles (was 179 with duplicates)
- Reduced confusion: same vehicle no longer appears multiple times
- Filter counts accurate: HAVAL shows combined total

---

## Verification Commands

```bash
# Check no duplicate display names
python3 << 'EOF'
import json, subprocess
SERVICE_KEY = "..."
cmd = ['curl', '-s', 'https://lbttmhwckcrfdymwyuhn.supabase.co/rest/v1/vehicle_trims?select=model_id,model_year', '-H', f'apikey: {SERVICE_KEY}']
trims = json.loads(subprocess.run(cmd, capture_output=True, text=True).stdout)
unique_combos = set((t['model_id'], t['model_year']) for t in trims)
print(f"Unique vehicle cards: {len(unique_combos)}")  # Should be 173
EOF

# Verify HAVAL merge
curl "https://lbttmhwckcrfdymwyuhn.supabase.co/rest/v1/brands?select=count&name=ilike.%haval%" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY"  # Should return 1

# Verify fuel standardization
curl "https://lbttmhwckcrfdymwyuhn.supabase.co/rest/v1/fuel_types?select=name" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY"  # Should NOT contain "Petrol"
```

---

## Lessons Learned

### String Replacement Pitfalls
- **Problem**: Simple `str.replace("X3", "X35")` caught BMW "iX3"
- **Solution**: Use brand-aware replacement with regex/context checking
- **Prevention**: Always test name fixes on sample data first

### Duplicate Detection Complexity
- **Initial audit**: Only checked `(brand_id, name)` in models table → found 0 duplicates
- **Actual issue**: Duplicate models with same `(brand_id, clean_name, year)` when name suffix varies
- **Learning**: Audit must simulate frontend display logic, not just DB uniqueness

### Year Suffix Normalization
- Models named "Tiggo 7" vs "Tiggo 7 2025" create same display title
- **Recommendation**: Standardize models table to NEVER include year in name
- **Rationale**: `model_year` field in vehicle_trims already stores this

---

## Next Steps (Future Enhancements)

1. **Prevent future duplicates**: Add DB constraint or validation script
2. **Standardize model naming**: Remove all year suffixes from model names
3. **Image coverage**: 166 models still NULL (40.6% coverage gap)
4. **Data validation pipeline**: Pre-commit hook to detect duplicates

---

**Agent**: CC (Claude Code)
**Execution Time**: 25 minutes (investigation + fixes + rollback)
**Database Updates**: ~75 records modified
**Scripts**: 3 (2 committed, 1 inline)
**Outcome**: ✅ SUCCESS - All 5 issues resolved

---

**Created**: 2026-01-04 23:30 UTC
