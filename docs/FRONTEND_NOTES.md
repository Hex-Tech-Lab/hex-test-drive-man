# Frontend Development Notes

## Local Workflow Notes

### Build and Lint Separation

**Build:** `pnpm build` (no lint chained).

**Lint:** run manually when needed, e.g. `pnpm lint src/`.

**Avoid** commands like `pnpm install && pnpm lint && pnpm build` in CI/agents.

#### Rationale

- Linting can produce 60k+ warnings and flood logs
- Builds should be fast, predictable, and quiet
- Lint warnings don't need to block builds
- Scoped linting is more efficient for local development

#### Recommended Workflow

```bash
# Install dependencies
pnpm install

# Build the project
pnpm build

# Lint only when needed, preferably scoped
pnpm lint src/components/
```
