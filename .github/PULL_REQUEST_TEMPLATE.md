
## Pre-Merge Checklist (Agent Work)

**Dependency Check Protocol**:
- [ ] Ran `grep -r "import.*PACKAGE" src/` before adding new imports
- [ ] Verified package in `package.json` before using
- [ ] Checked `src/lib/` for existing utilities before creating new ones
- [ ] Local `pnpm build` passed before pushing

**Violations = Build Failures** 🔴

