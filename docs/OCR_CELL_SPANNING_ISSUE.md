# OCR Table Extraction - Cell Spanning Challenge

**Date:** December 2, 2025 1:39 AM EET
**Status:** Identified, Solution Designed, Implementation Pending

## Problem Statement

Toyota (and likely other manufacturers) use **merged/spanning cells** in PDF tables to indicate shared specs across multiple trims.

### Examples from Toyota Corolla 2026:

| Spec | Behavior | Trims Affected |
|------|----------|----------------|
| **Engine Type** | Centered across entire table | ALL (ACTIVE, COMFORT, SMART, ELEGANCE, ELEGANCE HEV) |
| **Engine Capacity** | Left-aligned block: 1598 CC | First 4 trims |
| **Engine Capacity** | Right-aligned: 1798 CC | ELEGANCE HEV only |
| **Gross Weight** | Left: 1800 Kg | First 4 |
| **Gross Weight** | Right: 1835 Kg | ELEGANCE HEV |

### Additional Complexity
- **Mixed languages**: Arabic + English in same table
- **Feature matrix**: ✓ (standard), - (not available), "Locally Fitted" (optional)
- **Date stamps**: Bottom-right corner (version tracking)

## Current State

**Working:**
- ✅ OCR extraction (Tesseract) with 9586 chars from image PDFs
- ✅ Column detection via x-coordinate clustering
- ✅ 5 trim names identified correctly
- ✅ Basic spec mapping (with bleeding issues)

**Not Working:**
- ❌ Cell span detection (merged cells treated as single-trim)
- ❌ Spec label reconstruction (captures "Max" instead of "Max Torque")
- ❌ Column boundary precision (±100px too loose)

## Solution Design

### Algorithm:
1. Calculate **trim column x-ranges** from header row positions
2. For each data cell:
   - If x-position is **centered between multiple trims** → Merged cell
   - Calculate **overlap percentage** with each trim column
   - Apply spec to **all trims with >50% overlap**
3. Parse **full row labels** from leftmost cells
4. Handle **Arabic text** with language-aware OCR

### Files Created Tonight:
- `ocr_preprocessor.py` - Detects image PDFs and runs OCR
- `text_column_extractor.py` - Row/column detection
- `enhanced_trim_parser.py` - Trim mapping (current, needs span logic)
- `run_quality_gate.py` - Integrated OCR + extraction pipeline

## Next Steps (Tomorrow)
1. Implement span detection in `enhanced_trim_parser.py`
2. Tighten column boundaries (±50px tolerance)
3. Parse full spec labels (e.g., "Max Output" not "Max")
4. Re-run quality gate on 5 representative PDFs
5. Scale to all 40+ brands

## Reference
- Test PDF: `pdfs/Toyota/toyota_official/Corolla_2026.pdf`
- OCR Output: `pdfs/Toyota/toyota_official/Corolla_2026_ocr.txt`
- Table Image: Attached screenshot showing span structure
