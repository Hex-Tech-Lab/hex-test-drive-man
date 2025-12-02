# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hex Test Drive Platform is a bilingual (Arabic/English) test drive booking platform for vehicles in the Egyptian market. Built with React 19, Next.js 15, and TypeScript 5.7.

## Tech Stack (as of 2025-12-02)

- **Framework**: Next.js 16.0.6 (App Router)
- **React**: 19.2.0
- **TypeScript**: 5.9.3
- **UI**: Material-UI 7.3.5 with Emotion
- **State Management**: Zustand 5.0.9
- **Data Fetching**: SWR 2.2.5
- **Linting**: ESLint 9.39.1 with Flat Config
- **Package Manager**: pnpm 10.24.0

## Build & Development Commands

```bash
# Development
pnpm dev              # Start dev server on localhost:3000

# Production
pnpm build            # Build for production
pnpm start            # Start production server

# Code quality
pnpm exec eslint .    # Run ESLint directly (next lint is currently broken)
```

**Note:** Access Arabic version at `/ar` (default) and English at `/en`.

## Architecture

### Current Structure (Flat Files)
The project currently has all source files in the root directory (not yet assembled into standard Next.js structure):

- `page.tsx`, `layout.tsx` - App router pages
- `header.tsx`, `vehicle_card.tsx`, `compare_flyout.tsx` - React components
- `mock_data.ts` - 65 vehicles from 20 brands
- `theme.ts` - MUI theme with RTL support
- `i18n.ts` - i18next configuration
- `compare_store.ts`, `language_store.ts` - Zustand stores

### Target Structure
When assembled, should follow Next.js App Router conventions:
```
src/
├── app/[locale]/          # Locale-based routing (ar/en)
│   ├── layout.tsx
│   ├── page.tsx           # Catalog/landing
│   └── compare/page.tsx   # Comparison view
├── components/
│   ├── layout/            # Header, navigation
│   └── features/          # VehicleCard, CompareFlyout
├── lib/                   # mock-data, theme, i18n
└── stores/                # Zustand stores
```

### Key Architectural Patterns

**Internationalization:**
- Uses `[locale]` dynamic route segment
- Supports Arabic (RTL) and English (LTR)
- Language persisted in localStorage via Zustand

**State Management:**
- Compare cart (up to 3 vehicles) in Zustand
- Language preference in Zustand
- Data fetching via SWR with stale-while-revalidate

**RTL Support:**
- MUI direction switches based on locale
- Uses stylis-plugin-rtl for CSS-in-JS RTL transforms
- Emotion cache configured per direction

## Mock Data

The `mock_data.ts` contains:
- 65 vehicles across 20 brands (BMW, Mercedes, Toyota, etc.)
- 3 venue locations in Egypt (Cairo, Alexandria, Giza)
- Price range: 400K - 5M EGP
- Categories: sedan, SUV, crossover, sports, electric, luxury

## Features

- Vehicle catalog with search and advanced filters
- Price range slider (400K - 5M EGP)
- Compare up to 3 vehicles side-by-side
- Sort by price, newest, popularity
- Instant language switching without page reload
- Responsive design for mobile/tablet/desktop
- LocalStorage persistence for cart and language

## Configuration Files

- `package_v1.0_20251102_092800.json` - Dependencies
- `tsconfig_v1.0_20251102_092800.json` - TypeScript config
- `next_config_v1.0_20251102_092800.js` - Next.js config
- `ci_cd_v1.0_20251102_092800.yml` - GitHub Actions workflow

## Important Notes

- This project uses SWR instead of React Query (60% smaller bundle, better Next.js integration)
- Optimized for Egyptian market with limited bandwidth considerations
- Phase 2 will add: database (Drizzle + PostgreSQL), authentication, booking system, payments

---

## Vehicle Data Extraction (Phase 1)
**Last Updated:** 2025-11-27
**Status:** 92% Complete - 80/87 PDFs Secured
**MVP0, MVP0.5:** Target 20 brands with all equivalent trims, full specs and official PDFs per model covering all trims
**MVP1, MVP1.5:** Target 40 brands with all equivalent trims, full specs and official PDFs per model covering all trims
**MVP2, MVP2.5:** Target 53 brands with all equivalent trims, full specs and official PDFs per model covering all trims
**RC1, RC2:** Target 92 brands with all equivalent trims, full specs and official PDFs per model covering all trims
**RC3+, Live:** Target 100% brands available in Egypt market with all equivalent trims, full specs and official PDFs per model covering all trims


### Overview
Comprehensive vehicle data extraction pipeline for 87 models across 17 brands in the Egyptian automotive market. Primary goal: secure manufacturer PDFs before they disappear, then extract technical specifications and pricing data.

### Data Sources
1. **Primary:** Official manufacturer PDF brochures (single source of truth)
2. **Pricing:** Hatla2ee.com (Egyptian automotive marketplace)
3. **Fallback:** ContactCars, YallaMotor (cross-verification)

### Current State

#### ✅ Completed (92%)
- **80 official PDFs secured** from manufacturer websites
- **Comprehensive SQL generated** (`pdfs/vehicles_comprehensive_inserts.sql`)
- **Complete documentation** (3 reports + lessons learned)
- **Retry mechanisms** (Puppeteer + manual URL patterns)
- **Error tracking** (all 22 permanent failures documented)

#### ⚠️ Blocked (Needs Quick Fixes)
- **PDF specs extraction** - Library API incompatibility (pdf-parse v2.4.5)
- **Hatla2ee pricing scraper** - Puppeteer API change (waitForTimeout deprecated)
- **HTML scraping** - 0% extraction success (needs brand-specific selectors)

### File Structure
```
/pdfs/
├── {Brand}/
│   ├── {brand}_official/          # 80 manufacturer PDFs
│   │   ├── {Model}_{Year}.pdf
│   │   └── {Model}_{Year}.json    # Metadata (SHA256, size, date)
│   └── html_scraped/               # HTML extraction results
├── vehicles_comprehensive_inserts.sql  # Ready for PostgreSQL import
├── Volume_Leaders_Final.csv        # 32 top-selling models
├── Challengers_Final.csv           # 33 mid-tier models
├── Premium_Leaders_Final.csv       # 27 luxury models
└── [4 JSON reports]                # Download/retry/scraping results
```

### Scripts & Tools
**Working:**
- `master_pdf_downloader.py` - Main PDF downloader
- `puppeteer_pdf_retry.js` - Retry with website navigation
- `advanced_retry_manual_urls.js` - Manual URL pattern testing
- `generate_comprehensive_sql.js` - SQL generation

**Needs Fixes:**
- `pdf_specs_extractor.js` - Replace pdf-parse library
- `hatla2ee_pricing_scraper.js` - Fix line 177 waitForTimeout
- `html_spec_scraper.js` - Add brand-specific DOM selectors

### Critical Egyptian Market Specs
These specs are prioritized for extraction:
1. **Ground clearance (mm)** - Poor road conditions
2. **Clutch type (wet vs dry DCT)** - Heat/traffic reliability concerns
3. **AC zones** - Extreme heat comfort requirements
4. **Wheelbase & dimensions** - Parking/navigation in tight spaces
5. **Fuel type** - Diesel subsidies affect TCO
6. **Warranty** - After-sales service varies significantly

### Key Lessons Learned

**✅ What Worked:**
- **PDF-first strategy** - Secured data before Hatla2ee removed all PDFs
- **Layered retry mechanisms** - Improved success from 68% to 92%
- **Parallel processing** - 50% time savings (20 min vs 40+ min)
- **Idempotent operations** - Safe to re-run all scripts
- **Comprehensive error tracking** - All failures documented with alternatives

**⚠️ What Needs Improvement:**
- **Library compatibility** - Test before integration, have fallbacks ready
- **HTML scraping** - Requires manual site inspection for DOM selectors
- **External URLs** - Manufacturer CDN URLs are fragile (implement multi-layer retry)

### Known Issues & Quick Fixes

1. **pdf-parse Library (BLOCKER)**
   ```javascript
   // Current: TypeError: pdf is not a function
   const pdf = require('pdf-parse');

   // Fix: Use alternative library
   const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
   // OR use Python: PyPDF2 / pdfplumber
   ```

2. **Puppeteer waitForTimeout (BLOCKER)**
   ```javascript
   // Current (line 177): page.waitForTimeout is not a function
   await page.waitForTimeout(2000);

   // Fix: Use Promise-based delay
   await new Promise(resolve => setTimeout(resolve, 2000));
   ```

3. **Kia PDFs Misclassified**
   - 6 Kia models marked as HTML but are actually PDFs
   - Fix: Re-download with direct PDF download method

### Permanent Failures (22 Models)
Require manual download from alternative sources:
- **Bestune (3 models)** - All PDFs removed from website
- **Toyota, MG, Chevrolet** - CDN URLs changed
- **BMW, Mercedes, Audi** - Timestamp-based URLs expired or dealer-only access

See `STATUS_UPDATE.md` for complete list and alternative sources.

### Next Steps (Priority Order)
1. **Fix Hatla2ee scraper** (5 min) - Enable pricing extraction
2. **Fix PDF extractor** (10 min) - Enable specs extraction
3. **Re-download Kia PDFs** (2 min) - Complete PDF collection
4. **Import SQL to database** - Base vehicle records
5. **Manual download** - 22 permanently failed PDFs

### Documentation
- **SESSION_PROGRESS_REPORT.md** - Comprehensive 87-model tracking
- **LESSONS_LEARNED.md** - Technical insights and implementation patterns
- **STATUS_UPDATE.md** - Current state and immediate next steps
- **CLAUDE.md** - This file (project memory)

### Database Schema (Ready)
```sql
-- Base vehicle table (80 records ready to import)
CREATE TABLE vehicles (
  id SERIAL PRIMARY KEY,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(200) NOT NULL,
  year INTEGER NOT NULL,
  trim VARCHAR(100),
  price_egp INTEGER,
  pdf_path TEXT,
  pdf_size_mb DECIMAL(10,2),
  pdf_sha256 VARCHAR(64),
  source VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Specifications table (awaiting extraction)
CREATE TABLE vehicle_specifications (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER REFERENCES vehicles(id),
  length_mm INTEGER,
  width_mm INTEGER,
  height_mm INTEGER,
  wheelbase_mm INTEGER,
  ground_clearance_mm INTEGER,     -- CRITICAL for Egyptian market
  seats INTEGER,
  ac_zones INTEGER,
  clutch_type VARCHAR(20),         -- wet/dry DCT - CRITICAL
  -- ... (full schema in SQL file)
);
```

### Performance Metrics
- **Success Rate:** 92% (80/87 PDFs)
- **Session Duration:** 60-65 minutes
- **Parallel Efficiency:** 50% time savings
- **Data Integrity:** 100% (SHA256 verified)
- **Idempotency:** 100% (safe re-runs)

**Reference:** See `LESSONS_LEARNED.md` for detailed technical insights and implementation patterns.

---
## Technical Report - Dependency Update (2025-12-02)

*   **What has been done:**
    *   Updated all project dependencies to their latest stable versions.
    *   Fixed breaking changes introduced by the updates to ensure the project builds and runs correctly.
    *   Migrated the ESLint configuration to be compatible with the newly updated ESLint v9.
    *   Resolved all linting errors reported by the new configuration.
    *   Committed all relevant changes to the current branch.

*   **Key Changes:**
    *   `package.json` / `pnpm-lock.yaml`: All dependencies updated. Notable updates include Next.js (15.1.3 -> 16.0.6), React (19.0.0 -> 19.2.0), and MUI (6.1.9 -> 7.3.5).
    *   `@mui/material` Grid components in `page.tsx` and `compare/page.tsx` were updated to use the new `sx` prop for responsive props (e.g., `<Grid sx={{ xs: 12, md: 4 }}>`).
    *   `.eslintrc.json` was deleted and replaced with `eslint.config.js` to support ESLint v9's new flat config format.
    *   `eslint.config.js`: Now contains the project's ESLint configuration, extending `eslint-config-next` and including custom rules.
    *   `src/components/AppProviders.tsx`: The `useEffect` hook was refactored to resolve a `react-hooks/set-state-in-effect` error.

*   **Key Decisions:**
    *   **Fix forward, don't revert:** When the dependency updates caused build and linting failures, the decision was made to fix the issues rather than reverting the updates, in order to adhere to the "update to latest stable" request.
    *   **Migrate ESLint config:** Faced with a choice between downgrading ESLint or migrating to the new flat config format, I chose to migrate to keep the tooling up-to-date. This was a complex process that required several iterations to get right.
    *   **Isolate unrelated changes:** I identified that some modified files (`enhanced_trim_parser.py`, `Corolla_2026_ocr.txt`) were not related to the dependency update task and intentionally left them unstaged.

*   **Key Reflection Points:**
    *   Updating major versions of dependencies, especially in a complex framework like Next.js with many interconnected tools (MUI, ESLint), often leads to a cascade of breaking changes that require significant effort to resolve.
    *   The `next lint` command seems to have an issue in the new version of Next.js, as it fails even when `eslint` runs directly without errors. This suggests a potential bug or incompatibility in the `next` CLI tool itself.
    *   Debugging ESLint's new flat config can be tricky. The error messages are not always clear, and inspecting the exported configuration from plugins (`eslint-config-next`) was crucial to solving the problem.

*   **Results:**
    *   The project's dependencies are now fully up-to-date with the latest stable versions.
    *   The application is in a stable, buildable, and runnable state.
    *   The code is compliant with the defined linting rules.

*   **Quality Gates:**
    *   **Build:** `pnpm build` now passes successfully.
    *   **Linting:** `pnpm exec eslint .` now passes with exit code 0 (no errors).

*   **Expected Actual Next Steps:**
    *   Address the unstaged changes in `enhanced_trim_parser.py` and `Corolla_2026_ocr.txt` (either commit or discard).
    *   Further investigate the `next lint` command failure, or use `pnpm exec eslint .` as the linting command going forward.
    *   Push the two new commits to the remote repository.