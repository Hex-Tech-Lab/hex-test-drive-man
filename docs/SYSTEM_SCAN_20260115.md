## SYSTEM HEALTH DASHBOARD

### 1. Metrics Summary
| Metric | Value | Status |
|--------|-------|--------|
| Files (ts/tsx) | 115 | [OK] |
| Lines of Code | 17675 | [OK] |
| Open PRs | 7 | [WARN] |
| Open Issues | 1 | [OK] |
| Doc Coverage | FAILED | [CRITICAL] |

### 2. Critical Risks (Red/Amber/Green)
- [SECURITY] Severity: LOW | Impact: No object injection sinks found. | Fix: N/A
- [PERFORMANCE] Severity: MEDIUM | Impact: Large components found (VehicleCard: 462 lines, VehicleSearch: 509 lines). | Fix: Refactor into smaller sub-components.
- [RELIABILITY] Severity: HIGH | Impact: No global `ErrorBoundary` in `layout.tsx`. | Fix: Implement global error boundary in root layout.
- [MAINTAINABILITY] Severity: MEDIUM | Impact: `VehicleCard.tsx` and `VehicleSearch.tsx` are becoming God Components. | Fix: Component decomposition.
- [TECH DEBT] Severity: HIGH | Impact: Docstring check failed (pnpm not found/configured correctly). | Fix: Fix pnpm environment.

### 3. MVP Blockers
- [ ] **Locale Support**: CRITICAL. Translations are hardcoded in `src/lib/i18n.ts` and very limited. No JSON files found.
- [ ] **Booking Flow**: `src/components/booking-wizard/` directory reference in `grep` failed, but `src/app/[locale]/bookings/new` exists. Need to verify completeness.
- [ ] **Image Coverage**: 0 hero images found in `public/`.

### 4. Recommendations (Prioritized)
1. [PRIORITY 1] **Fix Locale System**: Move from hardcoded `i18n.ts` to JSON-based translation files (en.json, ar.json) to support scale.
2. [PRIORITY 2] **Global Error Boundary**: Add `ErrorBoundary` to `src/app/[locale]/layout.tsx` to prevent white screens on crash.
3. [PRIORITY 3] **Refactor VehicleCard**: Split `VehicleCard.tsx` into smaller presentational components.
4. [PRIORITY 4] **Fix Environment**: Ensure `pnpm` and docstring checks run correctly in CI/CD.

### 5. Actionable PR Plan
PR #80: gc/locale-system-migration
- Scope: Migrate `src/lib/i18n.ts` to `public/locales/{en,ar}.json` and implement loading logic.
- Est. time: 4h
