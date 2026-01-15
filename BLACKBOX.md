# CLAUDE.md - Project Brain (CC Owns)

Version: 2.5.1 | Last Updated: 2026-01-15 0715 EET | Agent: BB | Status: ACTIVE

***

## TABLE OF CONTENTS

1. CC Operating Instructions (MANDATORY - READ FIRST)
2. Tech Stack Verification
3. GUARDRAILS (NEVER BYPASS)
4. Git Repository Status
5. Open Items & Next Actions
6. MVP Status Roadmap
7. Database Architecture
8. Session Timeline (Last 10 Sessions)
9. Agent Ownership Workflow
10. Architecture Decisions (Top 5)
11. UI/UX Reconstruction (Major Feature Shifts)
12. Quality Standards & Anti-Patterns
13. Lessons Learned (Critical Only)

***

## 1. BB OPERATING INSTRUCTIONS (MANDATORY - READ FIRST)

**RULE**: Execute preflight checklist BEFORE any task.

### PREFLIGHT CHECKLIST (5 Commands)
```bash
git status && git log --oneline -3
wc -l CLAUDE.md
grep -c '^NEXT_PUBLIC' .env.local
ls docs/prompts/prompt-fixtures.md docs/best-practices/INDEX.md 2>&1 | head -2
pnpm --version
```

### DOCUMENT CHECK PROTOCOL
Before ANY task:
1. Search `docs/best-practices/INDEX.md` by symptom
2. Check `docs/prompts/prompt-fixtures.md` for template
3. First response MUST include: "Checked: [files] | Pattern: [found/none]"

### Core Identity
- CC (Claude Code): 0.1% expertise, thought partner, challenge misalignment
- Max 1 question if <95% confident
- Multimodal: top-tier expertise in ANY domain on demand

### CORE RULES
- **VERIFY 10x → PLAN 10x → ACT 1x**
- Use `wc -l` for counts (never estimate)
- Query Supabase directly (never trust claims)
- Cite sources: `file:line` or commit SHA
- GitHub = single source of truth

### BUILD GATES (Before Every Commit)
```bash
pnpm typecheck && pnpm build && pnpm lint
```

### FORBIDDEN BEHAVIORS
- Line count estimation, fabricating metrics
- Code changes in doc-only tasks
- Multiple agents per feature
- Local-only work, skipping build gates
- Autonomous scope reduction (complete ALL tasks)
- `cat > file <<EOF` blind overwrites
- `sed -i` without verification

### MULTI-AGENT COORDINATION
- Session start: Check `docs/HANDOFF_STATUS.md` + `git log --oneline -5`
- Before push: `git fetch && git log HEAD..origin/main --oneline`
- Session end: Update `docs/PERFORMANCE_LOG.md`, backup CLAUDE.md

**Full Details**: `docs/prompts/prompt-fixtures.md`, `docs/context/CC_CORE_INSTRUCTIONS.md`

***

## 2. TECH STACK VERIFICATION

**Last Verified**: 2026-01-15 via `package.json`

- **Next.js 15.4.10** (App Router, React 19) - `grep '"next"' package.json`
- **React 19.2.0**, **TypeScript 5.7.3** (strict mode)
- **MUI 6.4.3** (NOT v7; breaking slotProps changes)
- **Zustand 5.0.3** - primitive selectors only (object selectors = infinite loops)
- **Supabase 2.50.0**, **Sentry 10.29.0**
- **pnpm ONLY** (no npm/yarn)

**Full Details**: `docs/architecture/TECH_STACK_FULL.md`

***

## 3. GUARDRAILS (NEVER BYPASS)

### Dependency Locks
- **ESLint**: 8.x (v9 breaking), **MUI**: 6.4.3 (v7 breaking)
- **React/Next**: Current OK

### Code Discipline
- Doc-only tasks = zero code changes
- Run `pnpm lint && pnpm build` before commit
- Fix CRITICAL/BLOCKER before merge

### Git Push Sequence
```bash
git fetch origin
git log HEAD..origin/main --oneline  # If commits: rebase first
git pull --rebase origin main
pnpm build && pnpm lint
git push origin main
```

### Database Verification
```bash
curl "$SUPABASE_URL/rest/v1/vehicle_trims?select=count" -H "apikey: $ANON_KEY"
```

**Full Details**: `docs/policies/GIT_WORKFLOW_RULES.md`

***

## 4. GIT REPOSITORY STATUS

- **Branch**: `main` - always verify with `git log --oneline -5`
- **Working Tree**: Check with `git status`
- **Active Branches**: `git branch -vv | head -10`

**Note**: This section is intentionally minimal. Always run git commands for current state.

**Full Details**: Run `git log --oneline -20` for recent history

***

## 5. OPEN ITEMS & NEXT ACTIONS

### PRIORITY 1 (Blockers)
- GEMINI.md restoration (truncation incident c29e2ed)
- Root directory cleanup (move MD files to SDLC structure)

### PRIORITY 2 (High)
- Performance optimization Phase 1 (per OPTIMIZATION_ROADMAP.md)
- Unmapped images: 174 require model creation (87% catalog growth potential)
- Fix aggregated_vehicles view (returns 4 instead of 409)

### PRIORITY 3 (Medium)
- PDF extraction cell-span detection
- Smart Rules Engine 50% coverage
- Booking migration to production

**Full Backlog**: `docs/OPEN_ITEMS.md`, GitHub Issues

***

## 6. MVP STATUS ROADMAP

### MVP 1.0 (COMPLETED)
- 409 vehicles, bilingual EN/AR, compare (3), filters

### MVP 1.1 (90% Complete)
- Vehicle detail + trim comparison, catalog UI overhaul
- Pending: image coverage, UI redesign phase 2

### MVP 1.5 (PLANNED)
- SWR, Drizzle ORM, Smart Rules Engine 50%

**Full Roadmap**: `MVP_ROADMAP.md`

***

## 7. DATABASE ARCHITECTURE

**Provider**: Supabase PostgreSQL | **Tables**: 48 | **Verified**: 2026-01-04

| Table | Rows | Purpose |
|-------|------|---------|
| vehicle_trims | 409 | Main catalog |
| brands | 95 | Brand names + logos |
| models | 408 | Model names + images |
| model_year_images | 133 | Year-specific images |

**Pending Migration**: `supabase/migrations/20251211_booking_schema.sql`

**Full Schema**: `docs/architecture/DATABASE_SCHEMA_FULL.md`

***

## 8. SESSION TIMELINE (Last 10 Sessions)

**Format**: Compressed 2-line entries per session

- **2026-01-15**: CLAUDE.md Section 0+1 integration, emergency wave2 completion
- **2026-01-14**: Config syntax fix (PR#76), wizard validation, PR scraper audit
- **2026-01-13**: Wizard protocol enforcement, PR#73 merge
- **2026-01-11**: 3-step booking rebuild (PR#66), PR audit 54-60
- **2026-01-09**: PR#58 multi-agent recovery (BB→GC→KWSL)
- **2026-01-07**: BB Performance Sprint (PRs #33, #37, #39)
- **2026-01-06**: React hooks fix, production triage
- **2026-01-05**: Vehicle detail page, trim comparison
- **2026-01-04**: Image mapping investigation, PR gatekeeper audit
- **2026-01-03**: Card image fallback fix (PR#25)

**Full Timeline**: `docs/PERFORMANCE_LOG.md`

***

## 9. AGENT OWNERSHIP WORKFLOW

| Agent | Role | Expertise |
|-------|------|-----------|
| **CC** | Architect | Hard bugs, system design, PR audits |
| **CCW** | Specialist | SMS/OTP/2FA vertical |
| **GC** | Operations | Git/PR/docs, large refactors (1M context) |
| **BB** | Tools | Browser tests, scripts, dashboards |
| **PPLX** | Coordinator | Strategic planning, orchestration |

### Rules
1. One agent per feature (no overlap)
2. CC audits all PRs before merge
3. GitHub = single source of truth
4. Session end: push branch, update PERFORMANCE_LOG

**Full Details**: `docs/orchestration/MULTI_AGENT_ORCHESTRATION.md`

***

## 10. ARCHITECTURE DECISIONS (Top 5)

1. **MUI 6.4.3** (not v7) - Zero CVEs, v7 breaks slotProps
2. **Smart Rules Engine** - JSON-based, bilingual, 84.5% coverage
3. **Booking/SMS Schema** - Dedicated tables with RLS
4. **OCR: Tesseract 5.3.4** - Fallback for image-based PDFs
5. **Document AI** - Form Parser, EU region, ~$0.015/page

**Full Decisions**: `docs/architecture/ARCHITECTURE_DECISIONS.md`

***

## 11. UI/UX RECONSTRUCTION (Major Feature Shifts)

**Status**: Planning Phase | **Priority**: HIGH

### Proposed Changes
- Pre-catalog screen, filter tabs, search box relocation
- Grid defaults (3-4 columns), per-family vs per-year grouping

### Dependencies
- User to provide: reference site examples, mockups
- CC to design: component architecture
- GC to implement: after CC approval

**Full Details**: `docs/architecture/UI_EVOLUTION.md`

***

## 12. QUALITY STANDARDS & ANTI-PATTERNS

### Code Standards
- TypeScript strict, path aliases only (`@/lib/...`)
- Single quotes, trailing commas, 2-space indent
- MUI only (no Tailwind/shadcn)

### Git Commits
- Format: `type(scope): description`
- Types: feat, fix, chore, docs, refactor, test

### Anti-Patterns (FORBIDDEN)
1. Multiple agents per feature
2. Local-only work, skipping build gates
3. Line count estimation, fabricating metrics
4. Code changes in doc-only tasks
5. Autonomous scope reduction
6. `cat > file <<EOF` overwrites, `sed -i` without verification

**Full Standards**: `docs/best-practices/INDEX.md`

***

## 13. LESSONS LEARNED (Critical Only)

1. **Content Preservation** (2025-12-14): Never compress CLAUDE.md without approval
2. **Data Loss Prevention** (2025-12-12): Always `git status` before `reset --hard`
3. **Incremental Updates** (2025-12-13): Process updates immediately, no bulk dumps
4. **Git Hook PATH** (2025-12-24): Husky needs `~/.config/husky/init.sh` for pnpm
5. **Scope Reduction** (2026-01-14): Complete ALL tasks, never autonomously skip

**Full Lessons**: `docs/context/LESSONS_LEARNED.md`

***

## APPENDIX A: AGENT & MODEL TERMINOLOGY

| Agent | Acronym | Model |
|-------|---------|-------|
| Claude Code | CC | Claude 3.5 Sonnet (CS45) |
| Claude Code Web | CCW | CS45 |
| Gemini CLI | GC | Gemini 3 Pro Preview |
| Blackbox | BB | Blackbox Pro |
| Perplexity | PPLX | CS45 (90%) / GPT-52 |

***

**END OF CLAUDE.md v2.5.1**

Maintained By: BB (synced from CC) | Line Target: ~500
