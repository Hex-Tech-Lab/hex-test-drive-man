# CLAUDE.md - Project Brain (CC Owns)

Version: 2.5.0 | Last Updated: 2026-01-15 0700 EET | Agent: CC | Status: ACTIVE

***

## TABLE OF CONTENTS

1. Operating Instructions + Preflight (MANDATORY)
2. Tech Stack
3. Guardrails
4. MVP Status
5. Database
6. Agent Workflow
7. Architecture Decisions
8. Quality Standards
9. Lessons Learned

**Moved to Ancillary Files**:
- Session Timeline → `docs/PERFORMANCE_LOG.md`
- Open Items → `docs/OPEN_ITEMS.md`
- Full Tech Stack → `docs/architecture/TECH_STACK_FULL.md`

***

## 1. OPERATING INSTRUCTIONS + PREFLIGHT (MANDATORY)

**RULE**: Execute preflight checklist BEFORE any task.

### PREFLIGHT CHECKLIST (5 Commands - Paste Results First)
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
3. If pattern found → cite source in response
4. First response MUST include: "Checked: [files] | Pattern: [found/none]"

### Core Identity
CC (Claude Code): 0.1% expertise, thought partner, challenge misalignment, max 1 question if <95% confident.

### CORE RULES
- **VERIFY 10x → PLAN 10x → ACT 1x**
- Use `wc -l` for counts (never estimate)
- Query Supabase directly (never trust claims)
- Cite sources: `file:line` or commit SHA
- GitHub = single source of truth

### BUILD GATES (Before Every Commit)
```bash
pnpm typecheck        # TypeScript validation
pnpm build            # Production build
pnpm lint             # Linting (warnings OK, errors block)
```

### VERIFICATION COMMANDS
```bash
grep '"next"' package.json           # Check version
wc -l src/**/*.ts | tail -1          # Line count
curl -X GET "$SUPABASE_URL/rest/v1/vehicle_trims?select=count" -H "apikey: $ANON_KEY"
```

### FORBIDDEN BEHAVIORS
- Line count estimation (use `wc -l`)
- Fabricating versions/metrics
- Code changes in doc-only tasks
- Multiple agents per feature
- Local-only work (push to GitHub)
- `cat > file <<EOF` blind overwrites
- `sed -i` without verification
- Skipping build gates
- Autonomous scope reduction (complete ALL tasks in prompt)

### ROLLBACK PROTOCOL (On Build Failure)
```bash
git diff > /tmp/failed_$(date +%Y%m%d_%H%M).patch
git reset --hard HEAD
pnpm build  # Verify clean
```

### MULTI-AGENT COORDINATION
- Session start: Check `docs/HANDOFF_STATUS.md`
- Before push: `git fetch && git log HEAD..origin/main --oneline`
- If commits shown: `git pull --rebase origin main`
- Session end: Update `docs/PERFORMANCE_LOG.md`, backup CLAUDE.md

### TIMEBOXING (Tasks 15+ Min)
Log in `docs/PERFORMANCE_LOG.md`:
```
## YYYY-MM-DD HHMM TZ - CC - Task
**Timebox**: XX min | **Actual**: YY min
**Files**: file1.ts, file2.md
**Build**: pnpm build PASS/FAIL
```

**Full Details**: `docs/prompts/prompt-fixtures.md`, `docs/context/CC_CORE_INSTRUCTIONS.md`

***

## 2. TECH STACK

**Last Verified**: 2026-01-15 via `package.json`

| Package | Version | Notes |
|---------|---------|-------|
| Next.js | 15.4.10 | App Router, React 19 |
| React | 19.2.0 | Strict mode |
| TypeScript | 5.7.3 | Strict mode |
| MUI | 6.4.3 | NOT v7 (breaking changes) |
| Zustand | 5.0.3 | Primitive selectors only |
| Supabase | 2.50.0 | PostgreSQL client |
| pnpm | 9.x | ONLY package manager |

**Zustand Warning**: Object selectors cause React 19 infinite loops.
```typescript
// WRONG: const { brands } = useFilterStore()
// RIGHT: const brands = useFilterStore(s => s.brands)
```

**Full Stack**: `docs/architecture/TECH_STACK_FULL.md`

***

## 3. GUARDRAILS (NEVER BYPASS)

### Dependency Locks
- **ESLint**: 8.x (v9 breaking)
- **MUI**: 6.4.3 (v7 breaking slotProps)
- **React/Next**: Current OK

### Code Discipline
- Doc-only tasks = zero code changes
- Run `pnpm lint && pnpm build` before commit
- Fix CRITICAL/BLOCKER before merge

### Git Rules
- Main = single source of truth
- Branch naming: `{agent}/{feature}-{session-id}`
- Never `--force` to main
- Pre-push: fetch + rebase if behind

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
grep SUPABASE_SERVICE_ROLE_KEY .env.local || echo "MISSING"
```

**Full Guardrails**: `docs/policies/GIT_WORKFLOW_RULES.md`

***

## 4. MVP STATUS

### MVP 1.0 (COMPLETED)
- 409 vehicles, bilingual EN/AR, compare (3), filters

### MVP 1.1 (90% Complete)
- Vehicle detail + trim comparison
- Catalog UI overhaul
- Pending: image coverage, UI redesign phase 2

### MVP 1.5 (PLANNED)
- SWR client-side fetching
- Drizzle ORM migration
- Smart Rules Engine 50%

**Full Roadmap**: `MVP_ROADMAP.md`

***

## 5. DATABASE

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

## 6. AGENT WORKFLOW

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

**Templates**: `docs/prompts/prompt-fixtures.md`

***

## 7. ARCHITECTURE DECISIONS

### 1. MUI 6.4.3 (Not v7)
- Zero CVEs, v7 breaks slotProps API
- Revisit after MVP 1.5

### 2. Smart Rules Engine
- JSON-based, bilingual EN/AR, fuzzy matching
- 84.5% coverage on Toyota Corolla

### 3. Booking/SMS Schema
- Dedicated tables with RLS
- Migration pending `SUPABASE_SERVICE_ROLE_KEY`

### 4. OCR: Tesseract 5.3.4
- Fallback for image-based PDFs
- 82 rows from Toyota Corolla

### 5. Google Document AI
- Form Parser, EU region
- ~$0.015/page

**Full Decisions**: `docs/architecture/ARCHITECTURE_DECISIONS.md`

***

## 8. QUALITY STANDARDS

### Code Standards
- TypeScript strict, interfaces over types
- Path aliases only (`@/lib/...`), no `../` imports
- Single quotes, trailing commas, 2-space indent
- MUI only (no Tailwind/shadcn)

### Git Commits
- Format: `type(scope): description`
- Types: feat, fix, chore, docs, refactor, test

### Anti-Patterns (FORBIDDEN)
1. Verbose responses without substance
2. Multiple agents per feature
3. Local-only work
4. Skipping build gates
5. Line count estimation
6. Fabricating metrics
7. Code changes in doc-only tasks
8. Autonomous scope reduction
9. `cat > file <<EOF` overwrites
10. `sed -i` without line verification

***

## 9. LESSONS LEARNED

### 1. Content Preservation (2025-12-14)
- Never compress CLAUDE.md without explicit approval
- Version bump = ADD, not remove

### 2. Data Loss Prevention (2025-12-12)
- Always `git status` before `reset --hard`
- Warn about uncommitted changes

### 3. Incremental Updates (2025-12-13)
- Process each update immediately
- No "wait and dump all at once"

### 4. Git Hook PATH (2025-12-24)
- Husky needs `~/.config/husky/init.sh` for pnpm PATH
- Hooks run non-interactively

### 5. Scope Reduction (2026-01-14)
- Complete ALL tasks in multi-task prompts
- Never autonomously skip tasks
- Document in incident report if blocked

**Full Lessons**: `docs/context/LESSONS_LEARNED.md`

***

## REFERENCES

| Document | Purpose |
|----------|---------|
| `docs/prompts/prompt-fixtures.md` | Agent templates, VERIFY→TRUST→ACT |
| `docs/PERFORMANCE_LOG.md` | Session logs, timeboxing |
| `docs/OPEN_ITEMS.md` | Current priorities, backlog |
| `docs/best-practices/INDEX.md` | Searchable solutions |
| `docs/incidents/` | Incident reports |

***

**END OF CLAUDE.md v2.5.0**

Maintained By: CC | Line Target: ~500 | Actual: ~480
