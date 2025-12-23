# GC Status – v2.3.1 (Dec 23, 2025)

### 1. Current Situation

- **Catalog aggregation:**  
  - New aggregation logic groups by **brand_id + model_id + model_year**, eliminating the “single 409‑trim X‑Trail card” regression.
  - CC’s review confirms aggregation passes the verification script and matches the v2.3.1 spec (one card per brand/model/year).

- **Sort + grid controls:**  
  - Controls bar is implemented above the grid, right‑aligned in EN and mirrored in AR, with sort (price, year, brand) and grid density (2/4/6, default 4) wired through Zustand.
  - CC marked behavior as correct; one extra sort option (year_asc) is a non‑blocking deviation.

- **Filter panel (Amazon‑like):**  
  - Refactored to sticky layout, MUI accordions, compact typography and spacing per spec.
  - CC’s review found two **blocking** issues:
    - Internal vertical scrollbar still present due to `overflowY: { md: 'auto' }`.  
    - A commented/unused logarithmic scale with contradictory comments that must be removed.

- **Locale/reload behavior:**  
  - Catalog code still contains **no** `window.location.reload` / `router.refresh` / `window.location.href`, and scroll persistence uses sessionStorage.
  - However, LOCALE_ROUTING_SPEC now explicitly notes that previous “100% compliance” claims were contradicted by user observations and require re‑verification in the browser by BB.

- **Images (H1):**  
  - Database coverage is 100% (no NULLs), and GC has added placeholder hero images plus image handling as part of MVP 1.1; remaining work is quality/visual, not raw coverage.

- **OTP/SMS system:**  
  - Implementation is code‑complete but still blocked on credentials/deployment and is not on the immediate MVP 1.0/1.1 critical path.

### 2. Completed Work (Dec 20–23)

- **Locale audit & specs:**
  - Earlier locale audit verified router calls; v2.3.1 added Rule 4.5 with stricter SPA navigation requirements and explicitly flagged the need for renewed verification.

- **Catalog regression fixes (ui‑regression‑fixes‑v2.3):**
  - Implemented:
    - Aggregation by brand/model/year with a verification script.
    - Controls bar (sort + grid) per spec.
    - Amazon‑like FilterPanel (sticky, accordions, compact).
  - Build passes and types have been cleaned up (Vehicle types, repository selection).

- **Prompt/SDLC system:**
  - v2.3 global fixtures and agent templates created; v2.3.1 adds catalog‑specific specs and ready‑to‑use GC/BB prompts.

### 3. Open Issues / Risks

- **Blockers before merge of ui‑regression‑fixes‑v2.3:**
  - Remove `overflowY: { md: 'auto' }` to eliminate internal scrollbars in FilterPanel.
  - Remove the unused logarithmic `scale` and its misleading comments.
  - Add GC’s PERFORMANCE_LOG entry for the implementation session and update CRITICAL_HIGH_BLOCKERS_ROSTER with new statuses.

- **UX correctness not yet browser‑verified:**
  - Aggregation, sort/grid behavior, filter behavior, and locale/compare flows still need BB’s end‑to‑end Playwright tests on the deployed app.


### 4. Visual Readiness Improvements (Dec 24, 2025)

- **Logo sizing improvements implemented**:
  - `BrandLogo` component updated to use smaller padding (4px) and `objectFit: 'contain'`, ensuring landscape and portrait logos fill the box appropriately without clipping.

- **Hero image positioning and naming fixed**:
  - `VehicleCard` updated to use `objectPosition: 'center 85%'` to reduce chopped wheels/grille.
  - Title formatting polished to avoid redundant brand names (e.g., "MG 5 2025" instead of "MG MG 5").
  - `onError` handler enhanced for robust fallback.
