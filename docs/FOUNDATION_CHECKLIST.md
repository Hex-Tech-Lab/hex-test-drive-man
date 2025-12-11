# Foundation Health Criteria (Industry Standards)

## 🔴 CRITICAL (Zero Tolerance - BLOCKS ALL WORK)
- [ ] Zero HIGH/CRITICAL CVEs in production dependencies
- [ ] Zero failing CI/CD checks on main branch
- [ ] All security scans passing (CodeQL, Dependabot)
- [ ] No data corruption risks (schema migrations tested)
- [ ] Secret scanning enabled + no leaked credentials

## 🟠 HIGH PRIORITY (Fix within sprint)
- [ ] <3 MODERATE CVEs (with mitigation plan)
- [ ] Test coverage >70% for critical paths
- [ ] All PR review comments resolved OR explicitly deferred
- [ ] WSL/dev environment <80% memory usage
- [ ] Docker images <500MB (if using containers)

## 🟡 MEDIUM (Address before major release)
- [ ] Linting violations <10 across codebase
- [ ] Documentation covers all public APIs
- [ ] RTL/i18n bugs tracked in Issues with priority
- [ ] Branch divergence <5 commits ahead of main
- [ ] Automated rollback capability tested

## 🟢 OPTIMIZATION (Nice-to-have)
- [ ] Performance benchmarks established
- [ ] Microservices extraction documented
- [ ] Monitoring/observability (Sentry integrated)
- [ ] Dependency update automation (Renovate/Dependabot auto-merge)

## 🔧 TECHNICAL DEBT THRESHOLD
**Debt-to-Feature Ratio:** Max 30% sprint capacity on fixes
**Breaking Point:** If >3 CRITICAL items, pause features entirely

## Security: pdfminer.six (2025-12-11)
- Dependabot HIGH: pdfminer.six CMap pickle privesc
- Action: removed from extraction_engine/requirements.txt (runtime set)
- Kept only in extraction_engine/requirements_benchmark_pdfminer.txt for local benchmarks
- geometry_benchmark.py documented as optional, not part of production pipeline
