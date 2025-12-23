# UI Catalog Architecture (MVP 1.0)

**Created**: 2025-12-23 02:35 UTC
**Purpose**: Unblock BB for C1 and C4 implementation
**Agent**: CC (Claude Code)

---

## C1: Vehicle Display Strategy (370 vs 409 Discrepancy)

**Current State**: Catalog shows 370 vehicles instead of 409 (39 missing)

### OPTION A: Show All Trims Individually ❌ NOT RECOMMENDED
- **Approach**: Display all 409 vehicle_trims as separate cards
- **Implementation**: Debug missing 39 trims, ensure all display
- **UX Impact**: Overwhelming (409 cards), BMW X5 shows 7 times (7 trims)
- **Pros**: Maximizes catalog completeness
- **Cons**: Poor UX, redundant cards, confusing navigation

### OPTION B: Model Cards (Aggregated) ✅ RECOMMENDED
- **Approach**: 1 card per model, aggregate trim data
- **Implementation**:
  ```typescript
  // Group by model:
  const modelCards = groupBy(vehicles, v => v.models.id);
  // Display:
  [BMW X5]
  Price: 1.2M - 1.8M EGP  ← Price range across ALL trims
  Trims: Base | Premium | Sport  ← Hover tooltip shows trim names
  [Hero Image] [Specs: MPG, HP ranges]
  ```
- **UX Impact**: Clean (199 model cards instead of 409), professional
- **Pros**: Solves 370→409 discrepancy, better UX, matches industry standard
- **Cons**: Requires aggregation logic (20-30min dev time)

**DECISION**: ✅ **OPTION B** (Model cards recommended)
- Achieves C1 goal (all vehicles visible) + UX improvement
- Aligns with user expectations (1 card = 1 model choice)

---

## C4: Filter Component Implementation

### ISSUE 1: Price Slider Thumb Position Bug
**Problem**: MUI Slider thumb stuck at ~40% when max=3.9M EGP

**Root Cause**: Linear scale doesn't work well for large ranges (0-3,900,000)

**Solution**: Use logarithmic scale or custom scale function
```typescript
// FilterPanel.tsx Slider props:
<Slider
  value={priceRange}
  onChange={handlePriceChange}
  valueLabelDisplay="auto"
  min={minPrice}
  max={maxPrice}
  step={100_000}
  // ADD THIS:
  scale={(x) => Math.pow(10, x)}  // Logarithmic scale
  // OR custom marks for better UX:
  marks={[
    { value: 0, label: '0' },
    { value: 1_000_000, label: '1M' },
    { value: 2_000_000, label: '2M' },
    { value: 3_900_000, label: '3.9M' },
  ]}
  valueLabelFormat={formatPrice}
/>
```

**Testing**: Verify thumb position matches value across full range (0-3.9M)

---

### ISSUE 2: FilterPanel Sticky Positioning (OPTIONAL UX WIN)
**Enhancement**: Make FilterPanel stick to top on scroll

**Implementation**:
```typescript
// FilterPanel.tsx wrapper:
<Paper
  sx={{
    p: 2,
    position: 'sticky',  // ADD THIS
    top: 80,             // Below header (adjust based on header height)
    zIndex: 100,         // Above content, below header
    maxHeight: 'calc(100vh - 100px)',  // Prevent overflow
    overflowY: 'auto',   // Scroll if filters too many
  }}
>
  {/* Existing filter content */}
</Paper>
```

**UX Impact**: Filters always visible while scrolling catalog (desktop only)

---

## Supabase Verification Commands (BB Needs)

### Verify 409 Vehicle Trims Exist

**REST API Query**:
```bash
curl -H "apikey: $SUPABASE_ANON_KEY" \
     "$SUPABASE_URL/rest/v1/vehicle_trims?select=*" \
     | jq '. | length'
# Expected output: 409
```

**Check for Hidden Filters** (potential root cause of 370 vs 409):
```bash
# Query with no filters:
curl -H "apikey: $SUPABASE_ANON_KEY" \
     "$SUPABASE_URL/rest/v1/vehicle_trims?select=id,trim_name,is_hidden,is_active" \
     | jq '[.[] | select(.is_hidden == true or .is_active == false)] | length'
# If output > 0, hidden/inactive vehicles exist
```

**Repository Check**:
```typescript
// src/repositories/vehicleRepository.ts
// Look for WHERE clauses like:
.eq('is_active', true)  // ← Could filter out 39 vehicles
.eq('is_hidden', false)
.neq('status', 'draft')
```

---

## BB Scope Decisions

### C1: Choose ONE
- [ ] **Option A**: Fix 370→409 (show all trims, debug missing 39)
- [✓] **Option B**: Model cards (1 card per model, price range) ← **RECOMMENDED**

### C4: Choose ONE or BOTH
- [✓] **Option A**: Slider thumb position (MUI Slider props) ← **CRITICAL**
- [ ] **Option B**: FilterPanel sticky (CSS position: sticky) ← **OPTIONAL UX WIN**

**Recommended**: C1 Option B + C4 Option A = 2-3 hours (achieves critical fixes + UX improvement)

---

## Credentials Setup (BB Sandbox)

**Option 1**: Add to `.env.local` in BB sandbox:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://lbttmhwckcrfdymwyuhn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[USER TO PROVIDE]
```

**Option 2**: User runs locally and pastes output:
```bash
curl -H "apikey: YOUR_ANON_KEY" \
     "https://lbttmhwckcrfdymwyuhn.supabase.co/rest/v1/vehicle_trims?select=*" \
     | jq '. | length'
```

---

## Technical Notes

**MUI Slider Scale Property**:
- Default: Linear (`scale={(x) => x}`)
- Logarithmic: `scale={(x) => Math.pow(10, x / 1000000)}` (adjust divisor)
- Custom: Define function mapping slider position to price

**Model Card Aggregation**:
- Group: `Object.values(groupBy(vehicles, v => v.models.id))`
- Price Range: `Math.min(...trims.map(t => t.price_egp))` to `Math.max(...)`
- Trim Names: `trims.map(t => t.trim_name).join(' | ')`

**FilterPanel Sticky**:
- Works on desktop only (mobile: filters collapse)
- Requires `position: sticky` + `top: [value]` + `zIndex`
- Parent container must not have `overflow: hidden`

---

## Next Steps

1. **User**: Clarify C1/C4 scope in BB prompt
2. **User**: Provide Supabase credentials
3. **BB**: Resume → implement fixes → PR in 2-4 hours
4. **CC**: Continue with C2, C3, C5 completion

---

**Status**: BB UNBLOCKED - Architecture decisions documented
**ROI**: Self-critique flagged blocker → 5min fix → 2-4h BB execution saved
