# UI Catalog Architecture (MVP 1.0)

**Created**: 2025-12-23 02:35 UTC
**Updated**: 2025-12-23 03:00 UTC (v2.3 - Formal Aggregation + Amazon-like Specs)
**Purpose**: Canonical specs for catalog aggregation, layout, filters, and controls
**Agent**: CC (Claude Code)

---

## VEHICLE AGGREGATION RULES (CANONICAL)

**Version**: 2.0 (2025-12-23 03:00 UTC)
**Status**: MANDATORY - All implementations must follow these exact rules

### Aggregation Key

**Formula**: `(brand_id, model_id, model_year)`

**Rule**: One card per unique combination of brand + model + year.

**Examples**:
- Nissan X-Trail 2026 (3 trims) → **1 card** showing "3 trims"
- Nissan X-Trail 2025 (4 trims) → **separate card** showing "4 trims"
- BMW X5 2025 (7 trims) → **1 card** showing "7 trims"

### Implementation Logic

```typescript
// ✅ CORRECT: Aggregate by brand + model + year
const aggregationKey = `${vehicle.models.brands.id}_${vehicle.model_id}_${vehicle.model_year}`;

// ❌ WRONG: Aggregate only by model_id (causes X-Trail bug)
const aggregationKey = vehicle.model_id;
```

### Card Display Rules

**For each aggregated card**:

1. **Title**: `<Brand> <Model>`
   - Example: "Nissan X-Trail"

2. **Subtitle**: `<Year> • <trimCount> trims • <Category>`
   - Example: "2026 • 3 trims • SUV"
   - If only 1 trim: Show trim name instead of "1 trims"
     - Example: "2026 • Premium • SUV"

3. **Price**:
   - If all trims same price: `formatEGP(price)`
   - If different prices: `formatEGP(minPrice) - formatEGP(maxPrice)`
   - Examples:
     - Same: "1,200,000 EGP"
     - Range: "1,200,000 - 1,800,000 EGP"

4. **Trim Names Tooltip** (on hover over subtitle):
   - Display comma-separated list of all trim names
   - Example: "Base, Premium, Sport"

### Explicit Non-Goals

**NEVER aggregate across**:
- ❌ Different model years (2025 ≠ 2026)
- ❌ Different models (X-Trail ≠ Rogue)
- ❌ Different brands (Nissan ≠ Toyota)

### Verification Test Cases

**Required test data**:
1. Nissan X-Trail 2026 → expect 1 card with 3 trims
2. Nissan X-Trail 2025 → expect separate card with 4 trims
3. BMW X5 2025 → expect 1 card with 7 trims
4. Total unique (brand, model, year) combinations = expected card count

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

## AMAZON-LIKE FILTER LAYOUT (CANONICAL)

**Version**: 1.0 (2025-12-23 03:00 UTC)
**Status**: MANDATORY - Implements professional e-commerce filter UX

### No Internal Scrollbars Rule

**REQUIRED**: Filter panel must have NO vertical or horizontal scrollbars inside the panel itself.

**Amazon Behavior**:
1. User scrolls DOWN the page
2. Whole page scrolls until bottom of filter panel reaches top of viewport
3. After that point: Filter panel becomes "sticky" (stops scrolling)
4. Only the catalog grid continues scrolling while filter stays fixed

**Implementation**:
```typescript
// FilterPanel.tsx container:
<Box
  sx={{
    position: { xs: 'relative', md: 'sticky' },  // Sticky on desktop only
    top: { md: 80 },  // Distance from top (below header)
    maxHeight: { md: 'calc(100vh - 96px)' },  // Viewport height minus header + padding
    overflowY: { md: 'auto' },  // Internal scroll if content exceeds maxHeight
    pb: 2,
  }}
>
  {/* Filter content */}
</Box>
```

### Accordion Structure

**REQUIRED**: Each filter group must use MUI Accordion for collapsible sections.

**Default States**:
- **Brand**: Expanded (most important filter)
- **Price**: Expanded
- **Category**: Collapsed
- **Body Style**: Collapsed
- **Transmission**: Collapsed

**Example**:
```typescript
<Accordion defaultExpanded>
  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
    <Typography variant="subtitle2">Brand</Typography>  {/* Smaller font */}
  </AccordionSummary>
  <AccordionDetails>
    {/* Brand checkboxes */}
  </AccordionDetails>
</Accordion>
```

### Typography & Spacing (Amazon-Inspired)

**Font Sizes**:
- Filter group titles: `12px` (Typography variant="subtitle2")
- Filter options (checkboxes, labels): `13px` (Typography variant="body2")
- Section headers: `14px` bold

**Spacing Scale**:
- Between filter groups: `0.5rem` (8px)
- Inside AccordionDetails: `padding: 0.5rem 1rem`
- Checkbox + label: `gap: 0.5rem`
- Filter panel padding: `1rem` (16px)

**Explicit Rule**: Shrink fonts and spacing compared to default MUI sizes.

**Reference**:
```typescript
// Theme overrides or sx props:
sx={{
  '& .MuiAccordionSummary-content': {
    margin: '8px 0',  // Compact accordion headers
  },
  '& .MuiTypography-subtitle2': {
    fontSize: '12px',
    fontWeight: 600,
  },
  '& .MuiTypography-body2': {
    fontSize: '13px',
  },
  '& .MuiCheckbox-root': {
    padding: '4px',  // Smaller checkbox padding
  },
}}
```

### Visual Design

**Panel Background**: `#ffffff` (white) with subtle border
**Border**: `1px solid #e0e0e0`
**Border Radius**: `4px`
**Shadow**: `none` or very subtle `0 1px 3px rgba(0,0,0,0.05)`

---

## SORT + GRID CONTROLS (CANONICAL)

**Version**: 1.0 (2025-12-23 03:00 UTC)
**Status**: MANDATORY - Standard catalog controls placement

### Controls Bar Placement

**Location**: Above the catalog grid, below the search bar

**Alignment**:
- **LTR (English)**: Right-aligned
- **RTL (Arabic)**: Left-aligned

**Layout**:
```
[Search Bar - Full Width]

[Sort Dropdown]  [Grid Density Control]  ← Controls bar (right-aligned in LTR)

[Catalog Grid Below]
```

### Sort Dropdown

**Component**: MUI Select

**Options** (in order):
1. "Price: Low to High" → `price_asc`
2. "Price: High to Low" → `price_desc`
3. "Model Name (A-Z)" → `brand_asc`
4. "Year (Newest First)" → `year_desc`

**Default**: `price_asc`

**Behavior**:
- Applied to the ALREADY FILTERED set of vehicles
- Re-sorts whenever selection changes
- Persists in URL params (optional, for bookmark-ability)

**Implementation**:
```typescript
<FormControl size="small" sx={{ minWidth: 200 }}>
  <InputLabel>Sort By</InputLabel>
  <Select
    value={sortBy}
    onChange={handleSortChange}
    label="Sort By"
  >
    <MenuItem value="price_asc">Price: Low to High</MenuItem>
    <MenuItem value="price_desc">Price: High to Low</MenuItem>
    <MenuItem value="brand_asc">Model Name (A-Z)</MenuItem>
    <MenuItem value="year_desc">Year (Newest First)</MenuItem>
  </Select>
</FormControl>
```

### Grid Density Control

**Component**: MUI ToggleButtonGroup

**Options**:
- **2 columns**: Wide cards (more details visible)
- **4 columns**: Default (balanced)
- **6 columns**: Compact (more vehicles visible)

**Default**: `4` columns on desktop

**Responsive Behavior**:
- Mobile (xs): Always 1 column (ignore grid control)
- Tablet (sm): 2 columns fixed
- Desktop (md+): User-selectable 2/4/6

**Icons**:
- 2 columns: `ViewStreamIcon` (wide layout)
- 4 columns: `ViewModuleIcon` (grid layout)
- 6 columns: `ViewCompactIcon` (compact grid)

**Implementation**:
```typescript
<ToggleButtonGroup
  value={gridColumns}
  exclusive
  onChange={handleGridChange}
  size="small"
  sx={{ display: { xs: 'none', md: 'flex' } }}  // Hide on mobile
>
  <ToggleButton value={2}>
    <ViewStreamIcon />
  </ToggleButton>
  <ToggleButton value={4}>
    <ViewModuleIcon />
  </ToggleButton>
  <ToggleButton value={6}>
    <ViewCompactIcon />
  </ToggleButton>
</ToggleButtonGroup>
```

### Controls Bar Container

```typescript
<Box
  sx={{
    display: 'flex',
    justifyContent: { xs: 'center', md: 'flex-end' },  // Right in LTR
    alignItems: 'center',
    gap: 2,
    mb: 3,
    mt: 2,
  }}
>
  <FormControl>{/* Sort Dropdown */}</FormControl>
  <ToggleButtonGroup>{/* Grid Control */}</ToggleButtonGroup>
</Box>
```

### State Management

**Store in Zustand** (useFilterStore):
```typescript
interface FilterStore {
  // Existing filters...
  sortBy: 'price_asc' | 'price_desc' | 'brand_asc' | 'year_desc';
  gridColumns: 2 | 4 | 6;
  setSortBy: (value: string) => void;
  setGridColumns: (value: number) => void;
}
```

**Persistence**: Use localStorage via Zustand persist middleware

---

## Next Steps

1. **User**: Clarify C1/C4 scope in BB prompt
2. **User**: Provide Supabase credentials
3. **BB**: Resume → implement fixes → PR in 2-4 hours
4. **CC**: Continue with C2, C3, C5 completion

---

**Status**: BB UNBLOCKED - Architecture decisions documented
**ROI**: Self-critique flagged blocker → 5min fix → 2-4h BB execution saved
