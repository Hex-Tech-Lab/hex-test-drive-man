# Known Image Issues - Defer to Batch Optimization

**Date**: 2025-12-29
**Status**: Documented - Fixes Deferred
**Priority**: LOW (after 100% coverage achieved)

---

## Cropping Issues

### 1. Mitsubishi Eclipse Cross 2025 (Hover)
- **File**: `public/images/vehicles/hover/mitsubishi-eclipse-cross-2025.jpg`
- **Issue**: Right side chopped after driver door
- **Impact**: Partial vehicle view, missing rear quarter panel
- **Fix Required**: Re-extract with adjusted YOLO margin or use different PDF page
- **Priority**: P3 (non-critical, vehicle still identifiable)

### 2. Chery Tiggo 7 Pro Max 2025 (Hover)
- **File**: `public/images/vehicles/hover/chery-tiggo-7-pro-max-2025.jpg`
- **Issue**: Right rear wheel partially cropped
- **Impact**: Minor visual defect, vehicle mostly complete
- **Fix Required**: Re-extract with adjusted YOLO margin
- **Priority**: P4 (cosmetic, vehicle fully identifiable)

---

## Batch Optimization Tasks (Deferred)

### Phase 6: Image Quality Enhancement (Future)
1. **Text Overlay Removal**: Remove marketing text from 10-15% of images (e.g., Chevrolet Captiva "The New 2025 Captiva")
2. **Cropping Fixes**: Re-extract 2 images above with improved margins
3. **Sharpening**: Apply unsharp mask to blurry extractions (~5-10 images)
4. **DPI Standardization**: Normalize all images to consistent DPI (currently 72-200 DPI range)
5. **File Size Optimization**: Compress oversized images (>300KB) without quality loss

### Estimated Effort
- Total images needing enhancement: ~20-30 (12-15%)
- Time per image: 5-10 minutes
- Total time: 2-5 hours

---

## Decision Rationale

**Why Defer?**
1. **Coverage Priority**: 87.4% coverage (174/199) → Target 100% first
2. **Diminishing Returns**: Fixing 2 minor crops has low impact vs 25 missing models
3. **Batch Efficiency**: Optimize all images in single session after full coverage
4. **User Experience**: Missing images worse than imperfect crops (UI shows placeholder)

**When to Revisit?**
- After Phase 5 completes (all 199 models have images)
- Before production launch
- During MVP 1.5 polish phase

---

**Report Generated**: 2025-12-29
**Agent**: CC (Claude Code)
**Status**: Documented for future optimization
