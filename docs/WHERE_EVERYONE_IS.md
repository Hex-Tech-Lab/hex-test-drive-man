# WHERE EVERYONE IS - Comprehensive Agent Synchronization

**Generated**: 2025-12-14 23:55 UTC
**Purpose**: Establish single source of truth before GC cleanup + CCW OTP implementation

---

## CRITICAL: GitHub Repository State

**Primary Branch**: `main`
- Last commit on main: ca9da33 (Dec 11, 2025)
- Message: "feat(booking): use requestOtp engine for booking phone verification"
- Status: Stable, but 3+ days behind CC's work

**Active Development Branch**: `claude/sync-agent-instructions-015BBjkGH1Syq5uEU6r2uGCg`
- Created by: CC (Claude Code)
- Last commit: 5aa4a1c (Dec 14, 2025 23:45 UTC)
- Contains: CLAUDE.md v2.2.4 (2,219 lines, 87KB)
- Status: ✅ Up-to-date with all latest work
- Commits on this branch:
  - 5aa4a1c: GC branch cleanup prompt
  - 3cee304: CCW OTP/2FA prompt
  - 722c5e3: CLAUDE.md v2.2.4 (PR#7 + SonarCloud + Snyk)
  - e2b703b: CLAUDE.md v2.2.3 (Recovery + Housekeeping)
  - b008154: CLAUDE.md v2.2.2 (Vision-First Pipeline)
  - cf2d74e: CLAUDE.md v2.2.1 (Dec 3 THOS integration)

**Problematic Branch**: `hex-ai/claude-md-master`
- Last seen by: GC (Dec 12, 2025)
- Last commit: 896c0fd (Dec 12)
- Message: "docs: consolidate agent roles and sync gemini operations view"
- Status: ⚠️ DIVERGED from main (contains MVP_EVOLUTION docs not in main)
- Action needed: MERGE or ARCHIVE

**Branch Count**: 15+ (confirmed by user)
- Need cleanup to <5 active branches

---

## CC (Claude Code) - Current Position

**Last Session**: Dec 14, 2025 (18:00-23:45 UTC)
**Branch**: `claude/sync-agent-instructions-015BBjkGH1Syq5uEU6r2uGCg`
**Current HEAD**: 5aa4a1c

**Work Completed (Dec 14)**:
1. **CLAUDE.md Evolution** (v2.2.0 → v2.2.4):
   - v2.2.0: Fixed BB's 5 issues, added GUARDRAILS
   - v2.2.1: Integrated Dec 3 THOS (Smart Rules Engine)
   - v2.2.2: Integrated Dec 3-4, Dec 4, Dec 7-8 THOS
   - v2.2.3: Integrated Dec 9-10, Dec 12-13 THOS
   - v2.2.4: Integrated Dec 11 THOS (PR#7, SonarCloud, Snyk)

2. **Mission Briefs Created**:
   - CCW_OTP_2FA_PROMPT.md (763 lines) - 3-phase OTP implementation
   - GC_BRANCH_CLEANUP_PROMPT.md (534 lines) - Branch/PR cleanup

**Current State**:
- CLAUDE.md: 2,219 lines, 87KB, v2.2.4
- All commits pushed to GitHub
- Clean working tree
- Ready to hand off to GC and CCW

**Knowledge Base**:
- Fully aware of: Tech stack, architecture, MVP status, all THOS from Nov 26 → Dec 11
- Knows: PR#7 merged, SonarCloud configured, Snyk recommendations applied
- Knows: 15+ branches need cleanup, Dependabot PRs are dangerous

---

## CCW (Claude Code Worker) - Current Position

**Last Session**: Dec 11, 2025 (22:51 EET / 20:51 UTC)
**Branch**: `main` (at time of work)
**Last Commit**: ca9da33

**Work Completed (Dec 11)**:
1. **WhySMS Integration**:
   - File: `src/services/sms/engine.ts`
   - Function: `requestOtp()` working (sends SMS via WhySMS v3)
   - Function: `verifyOtp()` stub only (NO persistence)

2. **Booking Schema Defined**:
   - File: `supabase/migrations/20251211_booking_schema.sql`
   - Tables: `bookings`, `sms_verifications`
   - Status: ❌ NOT APPLIED to Supabase production

3. **Booking Repository**:
   - File: `src/repositories/bookingRepository.ts`
   - Status: In-memory only (needs Supabase migration)

**Current State**:
- Work is functional but incomplete
- Migration not applied (blocker for production)
- verifyOtp() needs implementation
- UI/UX layer not started
- **Next task**: OTP/2FA end-to-end system (per CCW_OTP_2FA_PROMPT.md)

**Future Branch**: Will create `ccw/otp-2fa-system` from current main or CC's branch

**Knowledge Base**:
- Knows: WhySMS API, booking flow, schema design
- Knows: requestOtp() working
- Needs: CLAUDE.md v2.2.4 context (current reality)
- Needs: Supabase credentials to apply migration

---

## GC (Gemini Code) - Last Known Position

**Last Session**: Dec 12, 2025 (01:55 EET / 23:55 UTC Dec 11)
**Branch**: Started on `main`, ended on `hex-ai/claude-md-master` (⚠️ DIVERGED)
**Last Commit**: 896c0fd

**Work Completed (Dec 11-12)**:
1. **Documentation Analysis**:
   - Found CLAUDE.md was 103 lines (truncated version on main)
   - Expected 597+ lines (mismatch)
   - Identified stale docs: REPOSITORY_STATE.md, duplicate AGENT_ASSIGNMENT.md
   - Proposed integration plan

2. **Cleanup Actions**:
   - Deleted: `docs/REPOSITORY_STATE.md`, `docs/AGENT_ASSIGNMENT.md`
   - Added: `docs/MVP_EVOLUTION_COMPLETE-v1.0-20251207.md`
   - Added: `docs/MVP_EVOLUTION_FRAMEWORK.md`
   - Added: `docs/TECHNOLOGY_STACK_DECISIONS-v1.0-20251207.md`
   - Added: `docs/TECH_DECISIONS_QUICK_REFERENCE-v1.0-20251207.md`
   - Updated: `GEMINI.md` (root)
   - Committed: 896c0fd on `hex-ai/claude-md-master`

3. **Untracked Files Identified** (Dec 12):
   - `CLAUDE - Full till 7-12-2025.md` (⚠️ potential 597-line version)
   - `CLAUDE-suspect1.md`
   - `CLAUDE-suspect2.md`
   - `docs/files (1).zip`

**Current State**:
- Branch: `hex-ai/claude-md-master` (⚠️ NOT main, NOT CC's branch)
- Working tree: Had changes, committed on wrong branch
- Knowledge: OUTDATED (last saw main at ca9da33, hasn't seen v2.2.4)

**Critical Issues**:
1. **Wrong branch**: Should be on main or CC's branch
2. **Stale context**: Doesn't know about CLAUDE.md v2.2.4
3. **Diverged work**: Commit 896c0fd on separate branch
4. **Multiple CLAUDE.md files**: Need consolidation

**Next Task**: Branch/PR cleanup (per GC_BRANCH_CLEANUP_PROMPT.md)

**Knowledge Base**:
- Knows: Basic repo structure, agents, workflows
- Knows: Documentation was fragmented (as of Dec 12)
- Does NOT know: CLAUDE.md v2.2.4, PR#7 status, SonarCloud integration, CC's recent work

---

## BB (Blackbox) - Status

**Last Session**: Unknown (not actively used recently)
**Branch**: N/A
**Work**: None recent

**Knowledge Base**: Likely outdated

---

## Documentation Synchronization Matrix

| File | Location | Owner | Status | Action Needed |
|------|----------|-------|--------|---------------|
| CLAUDE.md | `/` on CC branch | CC | ✅ v2.2.4 (2,219 lines) | Merge to main after cleanup |
| CLAUDE.md | `/` on main | CC | ⚠️ STALE (103 lines, b2b2557) | Overwrite with v2.2.4 |
| CLAUDE - Full till 7-12-2025.md | `/` (untracked) | ? | ❌ Unknown | Review & consolidate |
| CLAUDE-suspect1.md | `/` (untracked) | ? | ❌ Unknown | Review & delete |
| CLAUDE-suspect2.md | `/` (untracked) | ? | ❌ Unknown | Review & delete |
| GEMINI.md | `/` on hex-ai branch | GC | ⚠️ STALE (Dec 12) | Update from CLAUDE.md v2.2.4 |
| GEMINI.md | `docs/` on main | GC | ✅ Old extraction report | Keep as historical |
| BLACKBOX.md | Anywhere | BB | ❌ MISSING | Create later (low priority) |
| CCW_OTP_2FA_PROMPT.md | `docs/` on CC branch | CC | ✅ Ready | Use for CCW session |
| GC_BRANCH_CLEANUP_PROMPT.md | `docs/` on CC branch | CC | ✅ Ready | **NEEDS UPDATE** (see below) |
| MVP_EVOLUTION_*.md | `docs/` on hex-ai branch | CC/GC | ⚠️ Diverged | Merge to main |
| TECHNOLOGY_STACK_*.md | `docs/` on hex-ai branch | CC | ⚠️ Diverged | Merge to main |

---

## Branch Strategy for Upcoming Work

### GC Branch Cleanup (FIRST):

**Starting Branch**: `main`
**Why**: GC needs to audit ALL branches from neutral position

**Steps**:
1. GC checks out `main`
2. GC pulls latest from `origin/main` (will get ca9da33)
3. GC executes branch audit (per GC_BRANCH_CLEANUP_PROMPT.md)
4. GC identifies branches:
   - `main` - KEEP (protected)
   - `claude/sync-agent-instructions-015BBjkGH1Syq5uEU6r2uGCg` - KEEP (active CC work)
   - `hex-ai/claude-md-master` - MERGE or ARCHIVE (GC's diverged work)
   - `ccw/*` - FUTURE (don't interfere)
   - Stale branches - DELETE after audit
5. GC closes dangerous Dependabot PRs (ESLint 8→9, MUI 6→7, etc.)
6. GC commits cleanup documentation to NEW branch: `gc/branch-cleanup-2025-12-14`
7. GC creates PR: `gc/branch-cleanup-2025-12-14` → `main`

**Result**: Clean repo with <5 active branches

### CCW OTP/2FA Implementation (SECOND):

**Starting Branch**: `main` (AFTER GC cleanup merged)
**Why**: Start from clean, stable main

**Steps**:
1. CCW waits for GC cleanup to finish
2. CCW checks out `main`
3. CCW pulls latest (will include GC cleanup)
4. CCW creates NEW branch: `ccw/otp-2fa-system`
5. CCW executes Phase 1-3 (per CCW_OTP_2FA_PROMPT.md)
6. CCW commits incrementally (after each phase)
7. CCW creates PR: `ccw/otp-2fa-system` → `main`

**Result**: OTP/2FA system implemented on clean main

### CC Session Merge (AFTER CCW):

**Timing**: After GC and CCW complete
**Action**: Merge CC's branch to main

**Steps**:
1. Ensure GC cleanup merged to main
2. Ensure CCW OTP merged to main
3. Rebase CC's branch on updated main (resolve conflicts)
4. Merge: `claude/sync-agent-instructions-015BBjkGH1Syq5uEU6r2uGCg` → `main`
5. Result: CLAUDE.md v2.2.4 now on main

---

## Synchronization Plan

### Immediate (Right Now):

1. **Update GC_BRANCH_CLEANUP_PROMPT.md**:
   - Fix starting point (main, not CC branch)
   - Add awareness of CC's branch (don't touch)
   - Add handling for hex-ai/claude-md-master (merge or archive)
   - Add handling for multiple CLAUDE.md files
   - Add coordination with CCW future work

2. **Launch GC** (branch cleanup):
   - Feed updated GC_BRANCH_CLEANUP_PROMPT.md
   - GC works on main
   - GC creates gc/branch-cleanup-2025-12-14
   - GC does NOT interfere with CC or CCW branches

3. **Launch CCW** (after GC confirms started):
   - Feed CCW_OTP_2FA_PROMPT.md (already correct)
   - CCW waits for GC to finish if needed
   - CCW creates ccw/otp-2fa-system from main
   - CCW does NOT interfere with GC work

### Next Steps (After GC + CCW):

4. **Merge GC cleanup to main**:
   - Review gc/branch-cleanup-2025-12-14 PR
   - Merge (squash or rebase)
   - Delete gc/ branch

5. **Merge CCW OTP to main**:
   - Review ccw/otp-2fa-system PR
   - Merge (squash or rebase)
   - Delete ccw/ branch

6. **Merge CC session to main**:
   - Rebase claude/* branch on updated main
   - Resolve conflicts (CLAUDE.md v2.2.4 vs main's version)
   - Merge CLAUDE.md v2.2.4 to main
   - Result: Single source of truth

7. **Sync agent MDs**:
   - GEMINI.md: Update from CLAUDE.md v2.2.4
   - BLACKBOX.md: Create if BB becomes active

---

## Critical Decisions Made

### 1. Branch Priority:
- **main** = stable production baseline
- **CC branch** = latest comprehensive docs (v2.2.4)
- **GC branch** = diverged docs (needs merge)
- **CCW branch** = future OTP work (will branch from main)

### 2. CLAUDE.md Authority:
- v2.2.4 on CC branch is authoritative (2,219 lines, 87KB)
- 103-line version on main is stale (b2b2557)
- "Full till 7-12-2025" and "suspect" files need review

### 3. Merge Order:
- GC cleanup → main (FIRST)
- CCW OTP → main (SECOND)
- CC session → main (THIRD)

### 4. No Interference:
- GC will NOT touch CC branch
- GC will NOT touch future CCW branch
- CCW will NOT touch GC work
- Both work from main as baseline

---

## Risk Mitigation

### Risk 1: Branch Conflicts
**Scenario**: GC cleanup changes conflict with CC branch
**Mitigation**: GC works on main only, CC branch protected

### Risk 2: CLAUDE.md Merge Conflict
**Scenario**: CC's v2.2.4 conflicts with main after GC/CCW merges
**Mitigation**: Manual merge, prioritize v2.2.4 content

### Risk 3: CCW Starts Before GC Finishes
**Scenario**: CCW creates branch while GC still cleaning
**Mitigation**: CCW can start, works on separate branch

### Risk 4: Duplicate Documentation
**Scenario**: MVP_EVOLUTION docs on hex-ai branch vs CC branch
**Mitigation**: GC merges hex-ai docs to main, CC branch updated later

### Risk 5: Dangerous PR Auto-Merge
**Scenario**: Dependabot ESLint 8→9 PR merges
**Mitigation**: GC closes with rationale comments

---

## Success Criteria

### GC Success:
- [ ] <5 active branches remaining
- [ ] 0 dangerous Dependabot PRs open
- [ ] Cleanup documentation created
- [ ] hex-ai/claude-md-master merged or archived
- [ ] Multiple CLAUDE.md files resolved

### CCW Success:
- [ ] OTP/2FA Phases 1-3 complete
- [ ] Migration applied to Supabase
- [ ] verifyOtp() implemented with persistence
- [ ] UI/UX working (bilingual EN/AR)
- [ ] All quality gates passed

### Overall Success:
- [ ] Single GitHub repo version (no divergence)
- [ ] CLAUDE.md v2.2.4 on main
- [ ] All agents working from same baseline
- [ ] No conflicting branches
- [ ] Documentation synchronized

---

**END OF SYNCHRONIZATION DOCUMENT**

**Next Action**: Update GC_BRANCH_CLEANUP_PROMPT.md with this context
