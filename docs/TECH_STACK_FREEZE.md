## Tech Stack Violations 2026-01-13

**TypeScript 5.7.3 → 5.5.4** (eslint compatibility)
- eslint requires <5.6.0
- Downgrade maintains strict mode
- PR#73 trigger: @typescript-eslint warning

**Agent**: PPLX
**Status**: Fixed via pnpm add -D typescript@5.5.4
