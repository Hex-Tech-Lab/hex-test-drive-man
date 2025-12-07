# Gemini Instructions for hex-test-drive-man

## Tooling Conventions

### Linting Practices

- **Do not combine lint with build** in a single command.
- Use `pnpm build` only for build checks.
- Run `pnpm lint` separately, on-demand, and preferably scoped.

Example:
```bash
# Good - build alone
pnpm build

# Good - lint scoped to specific file
pnpm lint src/components/VehicleCard.tsx

# Bad - chained together
pnpm lint && pnpm build
```
