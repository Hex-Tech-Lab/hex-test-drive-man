# Performance Dashboard Specification

**Version**: 1.0
**Author**: CC (Claude Code)
**Date**: 2026-01-05
**Status**: ACTIVE - Ready for Implementation
**Purpose**: Automated performance monitoring and trend analysis

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Metrics Framework](#metrics-framework)
3. [Data Collection Strategy](#data-collection-strategy)
4. [Dashboard Design](#dashboard-design)
5. [Implementation Plan](#implementation-plan)

---

## Problem Statement

### Current State (No Visibility)

**❌ What's Missing**:
- **Build performance trends**: Is build getting slower? (no data)
- **Token efficiency**: How many tokens per deliverable line? (not tracked)
- **Agent velocity**: Are agents finishing under/over budget? (manual calculation)
- **Code quality trends**: Docstring coverage today = 83.54%, but what was it last week? (unknown)

### Why This Matters

**Evidence of Drift** (anecdotal, not data-driven):
- Build feels slower (but no proof)
- Token usage creeping up (but no baseline)
- Docstring coverage declining? (no historical data)

**Goal**: Systematic tracking → Identify trends → Prevent degradation

---

## Metrics Framework

### Category 1: Build Performance

**Metrics**:
- **Build Duration** (ms) - Extracted from `pnpm build` output
- **Bundle Size** (KB) - Parsed from `.next/build-manifest.json`
- **ESLint Warnings/Errors** - Count from `pnpm lint` output
- **TypeScript Errors** - Count from build output

**Collection Frequency**: Every commit (post-commit hook)

**Trend Analysis**:
- 7-day moving average (smooths daily variance)
- Alert if build time > 20% slower than 30-day avg
- Alert if bundle size > 10% larger than baseline

**Storage**:
```json
{
  "build_metrics": {
    "2026-01-05": {
      "duration_ms": 45000,
      "bundle_size_kb": 850,
      "eslint_warnings": 6,
      "eslint_errors": 0,
      "typescript_errors": 0
    }
  }
}
```

---

### Category 2: Agent Efficiency

**Metrics**:
- **Tokens Per Deliverable** (tokens / lines of code or docs)
- **Time Variance** (actual duration / allocated duration - 1) × 100%
- **Success Rate** (tasks completed / tasks attempted)
- **Commit Frequency** (commits per day per agent)

**Collection Frequency**: Per session (extracted from PERFORMANCE_LOG.md)

**Trend Analysis**:
- Compare agent efficiency week-over-week
- Identify agent strengths (BB: timebox discipline, CC: architecture)
- Flag declining efficiency (variance increasing)

**Storage**:
```json
{
  "agent_metrics": {
    "2026-01-05": {
      "CC": {
        "tokens_used": 82000,
        "deliverable_lines": 1777,
        "tokens_per_line": 46.1,
        "time_variance_pct": -22,
        "tasks_completed": 1,
        "tasks_attempted": 1
      },
      "BB": {
        "tokens_used": 0,
        "time_variance_pct": 0,
        "tasks_completed": 0
      }
    }
  }
}
```

---

### Category 3: Code Quality

**Metrics**:
- **Docstring Coverage** (%) - Extracted from `scripts/check_docstring_coverage.py`
- **Test Coverage** (%) - Future: when tests exist
- **Code Duplication** (%) - Future: use tool like `jscpd`
- **Complexity Score** - Future: cyclomatic complexity

**Collection Frequency**: Every commit (post-commit hook)

**Trend Analysis**:
- Alert if docstring coverage drops below 80% (enforced by pre-commit)
- Track improvement over time (goal: 90%+ by MVP 1.5)

**Storage**:
```json
{
  "quality_metrics": {
    "2026-01-05": {
      "docstring_coverage_pct": 83.54,
      "estimated_functions": 237,
      "missing_docstrings": 39
    }
  }
}
```

---

### Category 4: Repository Health

**Metrics**:
- **Open PR Count** - Via GitHub API
- **Stale Branch Count** (> 7 days old) - Via `git branch --list`
- **Unresolved Issues** - Via GitHub API
- **Commit Frequency** (commits per day) - Via `git log`

**Collection Frequency**: Daily (cron job or GitHub Action)

**Trend Analysis**:
- Alert if open PRs > 5 (backlog accumulating)
- Alert if stale branches > 10 (cleanup needed)

**Storage**:
```json
{
  "repo_health": {
    "2026-01-05": {
      "open_prs": 1,
      "stale_branches": 3,
      "commits_today": 5,
      "commits_7day_avg": 4.2
    }
  }
}
```

---

## Data Collection Strategy

### Collection Points

**1. Post-Commit Hook** (.husky/post-commit)
```bash
#!/bin/sh
python scripts/performance-tracker.py collect \
  --commit $(git rev-parse HEAD) \
  --metrics build,quality
```

**2. End-of-Session Manual** (optional, for agent metrics)
```bash
python scripts/performance-tracker.py collect \
  --agent CC \
  --tokens 82000 \
  --deliverable-lines 1777 \
  --time-variance -22
```

**3. Daily Cron** (for repo health)
```bash
# Run at 00:00 UTC daily
0 0 * * * cd /path/to/project && python scripts/performance-tracker.py collect --metrics repo-health
```

---

### Data Storage

**Primary Storage**: `docs/PERFORMANCE_HISTORY.json`

**Structure**:
```json
{
  "metadata": {
    "first_tracked": "2026-01-05",
    "last_updated": "2026-01-05T13:30:00Z",
    "total_commits": 150
  },
  "build_metrics": { ... },
  "agent_metrics": { ... },
  "quality_metrics": { ... },
  "repo_health": { ... }
}
```

**Retention Policy**:
- Keep daily data for 90 days
- Aggregate to weekly averages after 90 days
- Aggregate to monthly averages after 1 year

---

## Dashboard Design

### Output Format: Markdown Tables

**Rationale**: Simple, version-controllable, no dependencies

**File**: `docs/PERFORMANCE_DASHBOARD.md` (auto-generated)

---

### Section 1: Build Performance (Last 7 Days)

```markdown
## Build Performance Trends

| Date       | Build Time | Bundle Size | ESLint | TypeScript | Trend |
|------------|------------|-------------|--------|------------|-------|
| 2026-01-05 | 45.0s      | 850 KB      | 6 warn | 0 err      | ⬆️ +2s |
| 2026-01-04 | 43.0s      | 848 KB      | 6 warn | 0 err      | ⬇️ -1s |
| 2026-01-03 | 44.0s      | 845 KB      | 6 warn | 0 err      | ⬆️ +1s |
| 2026-01-02 | 43.0s      | 843 KB      | 6 warn | 0 err      | ⬆️ +0s |
| 2026-01-01 | 43.0s      | 840 KB      | 6 warn | 0 err      | ⬇️ -2s |
| 2025-12-31 | 45.0s      | 838 KB      | 8 warn | 0 err      | ⬆️ +3s |
| 2025-12-30 | 42.0s      | 835 KB      | 8 warn | 0 err      | ➡️ 0s  |

**7-Day Average**: 43.4s (baseline)
**Alert**: None (within 20% tolerance)
```

---

### Section 2: Agent Efficiency (Last 30 Days)

```markdown
## Agent Efficiency Metrics

| Agent | Tasks | Success Rate | Avg Time Variance | Tokens/Line | Trend |
|-------|-------|--------------|-------------------|-------------|-------|
| CC    | 12    | 100%         | -18% (under)      | 46.1        | ✅ Improving |
| BB    | 8     | 100%         | -35% (under)      | N/A         | ✅ Excellent |
| GC    | 5     | 80%          | +10% (over)       | N/A         | ⚠️ Slowing |
| CCW   | 2     | 100%         | -5% (under)       | N/A         | ✅ Stable |

**Best Performer**: BB (35% under budget average)
**Alert**: GC time variance increasing (investigate)
```

---

### Section 3: Code Quality Trends

```markdown
## Code Quality Metrics

| Date       | Docstring Coverage | Change | Functions | Missing |
|------------|--------------------|---------|-----------| --------|
| 2026-01-05 | 83.54%             | -0.67%  | 237       | 39      |
| 2026-01-04 | 84.21%             | +1.12%  | 235       | 37      |
| 2026-01-03 | 83.09%             | -0.45%  | 232       | 39      |
| 2026-01-02 | 83.54%             | +0.21%  | 230       | 38      |

**30-Day Average**: 83.8%
**Alert**: Coverage below 84% threshold (pre-commit still enforcing 80%)
**Recommendation**: Add docstrings to 5 functions to reach 85%
```

---

### Section 4: ASCII Trend Charts (Optional)

```markdown
## Build Time Trend (Last 30 Days)

50s │                                    ╭─╮
48s │                                ╭───╯ ╰─╮
46s │                            ╭───╯       ╰─╮
44s │                        ╭───╯             ╰──╮
42s │                    ╭───╯                    ╰─╮
40s │────────────────────╯                          ╰───
    └──────────────────────────────────────────────────
    Dec 05                                      Jan 05

Baseline: 43s | Current: 45s | Trend: ⬆️ Increasing
```

**Tool for ASCII Charts**: Use `termgraph` or custom Python renderer

---

## Implementation Plan

### Phase 1: Data Collection (Week 1)

**Deliverables**:
- [ ] `scripts/performance-tracker.py` (data collection functions)
- [ ] `docs/PERFORMANCE_HISTORY.json` (storage file)
- [ ] `.husky/post-commit` hook (auto-collect on commit)

**Commands**:
```bash
# Manual collection
python scripts/performance-tracker.py collect --metrics build,quality

# View latest data
python scripts/performance-tracker.py show --last 7
```

---

### Phase 2: Dashboard Generation (Week 2)

**Deliverables**:
- [ ] `scripts/performance-tracker.py generate-dashboard` command
- [ ] `docs/PERFORMANCE_DASHBOARD.md` (auto-generated markdown)
- [ ] Markdown table rendering (build, agent, quality, repo health)

**Commands**:
```bash
# Generate dashboard
python scripts/performance-tracker.py generate-dashboard

# Output: docs/PERFORMANCE_DASHBOARD.md
```

---

### Phase 3: Alerting & Trends (Week 3)

**Deliverables**:
- [ ] Threshold-based alerts (build time > 20%, coverage < 80%)
- [ ] 7-day moving average calculations
- [ ] Trend detection (improving, stable, degrading)
- [ ] ASCII chart rendering (optional)

**Commands**:
```bash
# Check for alerts
python scripts/performance-tracker.py check-alerts

# Output:
⚠️  Alerts Detected:
  - Build time 22% above 30-day average (45s vs 37s)
  - Docstring coverage below 84% target (current: 83.54%)
```

---

## Integration with Existing Systems

### Post-Commit Hook

**File**: `.husky/post-commit` (new)
```bash
#!/bin/sh
# Auto-collect performance metrics after every commit

python scripts/performance-tracker.py collect \
  --commit $(git rev-parse HEAD) \
  --metrics build,quality

# Optional: Generate dashboard if major milestone
if [ -f "docs/MAJOR_MILESTONE" ]; then
  python scripts/performance-tracker.py generate-dashboard
fi
```

---

### PERFORMANCE_LOG.md Integration

**Current**: Manual agent self-reporting in PERFORMANCE_LOG.md
**Future**: Auto-extract metrics from PERFORMANCE_LOG.md

**Example Extraction**:
```python
# Parse PERFORMANCE_LOG.md
def extract_agent_metrics(log_file: str) -> dict:
    """Extract agent metrics from performance log."""
    # Regex to find: "Actual Duration: 30 minutes"
    # Regex to find: "Variance: -15 minutes (-50%)"
    # Return: {"agent": "BB", "time_variance_pct": -50}
```

---

### GitHub Actions Integration (Future)

**File**: `.github/workflows/performance-monitoring.yml`
```yaml
name: Performance Monitoring
on:
  push:
    branches: [main]
jobs:
  track-performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Collect metrics
        run: python scripts/performance-tracker.py collect --metrics build,quality
      - name: Generate dashboard
        run: python scripts/performance-tracker.py generate-dashboard
      - name: Commit updated dashboard
        run: |
          git add docs/PERFORMANCE_DASHBOARD.md docs/PERFORMANCE_HISTORY.json
          git commit -m "chore(metrics): update performance dashboard [skip ci]"
          git push
```

---

## Success Metrics

### Week 1 (Data Collection)
- [ ] PERFORMANCE_HISTORY.json populated with 7+ days of data
- [ ] Post-commit hook running (metrics collected on every commit)
- [ ] Build time, bundle size, docstring coverage tracked

### Week 4 (Dashboard Operational)
- [ ] PERFORMANCE_DASHBOARD.md auto-generated
- [ ] 30-day trend data visible
- [ ] Alerts working (threshold detection)

### Month 3 (Actionable Insights)
- [ ] Identified 2+ performance regressions early (prevented degradation)
- [ ] Agent efficiency improved (time variance trending toward 0%)
- [ ] Docstring coverage increased to 85%+

---

## Future Enhancements

### Advanced Metrics (Post-MVP)
- **Lighthouse Scores**: Performance, accessibility, SEO
- **Sentry Error Rate**: Production error tracking
- **API Response Times**: Database query performance
- **User Analytics**: Page load times, bounce rate

### Advanced Visualizations
- **Grafana Dashboard**: Real-time charts (if data exported to Prometheus)
- **GitHub Insights**: Integration with GitHub's built-in analytics
- **Interactive Charts**: Use Chart.js or D3.js for web dashboard

### Automated Actions
- **Auto-PRs**: If build time > 50s, auto-create PR with optimization suggestions
- **Auto-Issues**: If docstring coverage < 80%, auto-create issue
- **Slack Notifications**: Alert team when critical thresholds breached

---

**END OF SPECIFICATION**

**Next Step**: Implement `scripts/performance-tracker.py` (data collection functions)
**Estimated Effort**: 3-4 hours (BB or GC can implement from this spec)
**Dependencies**: Python 3, JSON, access to build output logs
