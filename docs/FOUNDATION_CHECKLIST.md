# Foundation Health Criteria

## ✅ PASSING (Ready to Build)
- [ ] Zero HIGH/CRITICAL security vulns
- [ ] CI/CD green (all checks pass)
- [ ] No WSL memory warnings (<70%)
- [ ] GitHub = single source of truth (no diverged branches)
- [ ] AI scraper extractable as microservice

## 🟡 ACCEPTABLE (Can proceed with caution)
- [ ] <5 MODERATE security vulns (documented)
- [ ] PR comments resolved OR documented as "won't fix"
- [ ] RTL bugs catalogued in Issues

## ❌ BLOCKING (Must fix before feature work)
- [ ] Any HIGH security vuln
- [ ] Main branch CI/CD failing
- [ ] WSL memory >90%
