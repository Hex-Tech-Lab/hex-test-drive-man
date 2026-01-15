# 3-Way Agent File Sync Plan

**Date**: 2026-01-15
**Master File**: CLAUDE.md (v2.5.1)
**Targets**: BLACKBOX.md, GEMINI.md

## Classification Strategy

### Category A: Agent-Specific Workflow (Preserve)
- **GEMINI.md**: Section 9.5 "GC-SPECIFIC WORKFLOWS"
- **BLACKBOX.md**: None identified (Standard sections match CLAUDE.md)

### Category B: Universal Insight (Merge to CLAUDE.md)
- **None**: Recent updates in BB/GC are logs/status, not architectural changes or new rules missing from CLAUDE.md.
- *Note*: Open Items in BB/GC are subsets or outdated versions of CLAUDE.md's current status.

### Category C: Detailed Info (Extract to docs/)
- **Source**: BLACKBOX.md "RECENTLY COMPLETED" section (Jan 3-9)
  - **Target**: `docs/COMPLETED_WORK_ARCHIVE.md`
- **Source**: BLACKBOX.md Bottom Logs ("BB Security Audit", "API Timeout")
  - **Target**: `docs/PERFORMANCE_LOG.md` (Append)
- **Source**: GEMINI.md Bottom Logs ("PR59 Critical Fix", "CC PR60 Merge")
  - **Target**: `docs/PERFORMANCE_LOG.md` (Append)

### Category D: Outdated/Redundant (Discard)
- **Source**: Broken script outputs (`[Sync from CLAUDE.md...]`, `$(cat...)`)
- **Source**: Outdated "Open Items" in GEMINI.md (Dec 24)
- **Source**: Redundant "Recent Sessions" in BB/GC that are already compressed in CLAUDE.md Section 8.

## Execution Steps

1. **Extract** `BLACKBOX.md` "RECENTLY COMPLETED" -> `docs/COMPLETED_WORK_ARCHIVE.md`.
2. **Extract** valid logs from BB/GC -> `docs/PERFORMANCE_LOG.md`.
3. **Overwrite** `BLACKBOX.md` with `CLAUDE.md` content (Replace "CC" with "BB").
4. **Overwrite** `GEMINI.md` with `CLAUDE.md` content (Replace "CC" with "GC").
5. **Restore** Section 9.5 to `GEMINI.md`.
6. **Verify** section alignment (13 sections + Appendix).
