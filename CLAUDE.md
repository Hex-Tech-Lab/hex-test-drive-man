# Claude Instructions for hex-test-drive-man

## Tooling / Workflows

### Lint vs Build (Performance Rule)
**Date: 2025-12-08 00:50 EET**

**Never chain `pnpm lint` together with `pnpm build`.**

Linting can produce 60k+ warnings and flood logs.

Builds must be fast, predictable, and quiet.

**Rule:** run `pnpm build` alone for quality gates.

Only run `pnpm lint` when explicitly requested, ideally scoped:

e.g. `pnpm lint src/components/VehicleCard.tsx`.
