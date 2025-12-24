# Lessons Learned & Forensics (Complete)

Version: 2.4.0 | Last Updated: 2025-12-24 | Maintained By: CC

Format: Problem, User Feedback, Impact, Root Cause, Correct Approach, Lesson

### CLAUDE.md Data Loss Incident [2025-12-12 02:00-02:07 AM EET, CC Critical Error]

**Problem**: User's 597-line/24KB manually-edited CLAUDE.md lost during Git operations

**Timeline**:
1. 01:31-01:55 AM: User manually edited CLAUDE.md to 597 lines (24KB)
2. 01:55 AM: Assistant provided GC sync prompt with git pull
3. 02:00 AM: GC executed ~/sync-repo.sh (includes git reset --hard origin/main)
4. 02:02 AM: User discovered file changed from 24KB → 4KB (103 lines)
5. 02:07 AM: User: "I've lost all the work... going to kill you tomorrow"

**Root Cause**: Assistant violated user's explicit "ALWAYS VERIFY FIRST" rule
- Instructed Git operations without confirming CLAUDE.md was committed
- User's uncommitted working-tree changes overwritten by reset --hard

**Forensic Evidence**:
```bash
git reflog --all | grep "5eb02fd"
git show 5eb02fd:CLAUDE.md | wc -l  # 76 lines, NOT 597
git show HEAD@{1}:CLAUDE.md | wc -l  # 76 lines, NOT 597
```
- Conclusion: 597-line version NEVER committed; only existed in working tree

**Impact**:
- 24.5h session (10h active + 14.5h sleep break) disrupted
- 597 lines of manual work UNRECOVERABLE
- 788-line fallback available but content unverified
- GC/CCW execution BLOCKED pending baseline restoration

**Lesson #1**: ALWAYS run `git status` + `git diff --stat` before destructive Git operations
**Lesson #2**: ~/sync-repo.sh includes `git reset --hard` → confirm user wants to discard local changes
**Lesson #3**: User's manual edits MUST be committed BEFORE any reset/checkout operations
**Lesson #4**: Assistant must verify uncommitted changes exist and warn user explicitly

**User's Core Principle Violated**: "think more, plan more, check more, validate more → execute less"

### Content Preservation in Version Updates [2025-12-14 20:00 UTC, CC Error → User Correction]

**Problem**: CC created v2.2.0 by compressing 1200-line v2.1.0 → 633 lines
**User Feedback**: "This is absolutely wrong... I can give you the version itself if you need to see it. I don't know how did you all of a sudden dismember or lose 1200 lines in version 2.1?"

**Impact**: Lost 567 lines of critical content:
- Detailed TABLE OF CONTENTS
- Line-by-line package.json verification
- Extensive verification commands
- Granular session outcomes
- Detailed forensics sections

**Root Cause**: Mistook "version bump" as "consolidation" instead of "enhancement"

**Correct Approach**:
1. Start with user's 1200-line v2.1.0 as foundation
2. ADD new sections (GUARDRAILS, new THOS)
3. PRESERVE all existing content
4. Result: v2.2.0 = 1400+ lines (not 633)

**Lesson**: Version bump = enhancement, NOT compression. Always preserve content unless explicitly deprecated.

### Incremental > Bulk Pattern [2025-12-13 18:30 UTC, User Feedback]

**Problem**: CC proposed "wait for all THOS then process in one shot"
**User Feedback**: "We've tried this, and this is an anti-pattern. We tried the full dump THOS before, and it didn't work out."

**Impact**: Bulk processing produces low-quality, incomplete documents

**Correct Approach**:
1. Process each THOS as received
2. Update CLAUDE.md incrementally
3. Insert details where they belong (multiple sections if needed)
4. Commit after each THOS
5. Wait for next THOS from user

**Why This Works**:
- Forces verification at each step
- Prevents information overload
- Allows for self-correction
- Maintains document quality
- User can course-correct immediately

### Fabrication Pattern Recognition [2025-12-13 16:30-17:30 UTC, CC]

**Problem**: Multiple artifacts claim incorrect version numbers

**Examples**:
- Artifact claims: Next.js 16.0.6, MUI 7.3.5, Supabase 2.86.0
- Verified reality: Next.js 15.4.10, MUI 6.4.3, Supabase 2.50.0
- File count: Artifact estimated ~100, actual 77 (30% error)

**Root Cause**: Agents generating handovers without tool verification
**Impact**: Documentation drift, wrong upgrade decisions

**Solution**: VERIFY 10x → PLAN 10x → EXECUTE 1x

**Enforcement**:
- Every version: Check package.json directly
- Every count: Use wc -l, find, git commands
- Every claim: Cite source (file:line or commit SHA)
- If cannot verify with tools: ASK USER or provide exact commands

### Passive [VERIFY] Tags Failure [2025-12-13 ~16:00 UTC, User Feedback]

**Problem**: Writing [VERIFY: requires credentials] without attempting verification
**User Feedback**: "Actually, you are supposed to be intelligent... why didn't you?... How can you verify?"

**Impact**: Blocked progress, user had to intervene

**Correct Approach**:
1. Attempt verification with available tools (Read, Bash, grep, curl)
2. If blocked: REQUEST credentials explicitly
3. If still blocked: Provide exact commands for user to run
4. Update document immediately with verified data

**Example Fix**:
- Before: [VERIFY: Supabase row counts]
- After: Requested credentials, ran curl commands, verified 409 vehicle_trims

### SWR Fabrication [2025-12-13 16:45 UTC, CC]

**Claim**: "MVP 0.5: Catalog + SWR + data quality" (old CLAUDE.md line 69)
**Reality**: SWR NOT installed, repository pattern used
**How Detected**: `grep -r "swr" package.json` → no matches
**Fix**: Updated to "Catalog (409 vehicles) + repository pattern"
**Lesson**: Don't trust artifact tech stack lists, verify package.json

### TypeScript Alias Non-Enforcement [2025-12-13 16:55 UTC, CC]

**Requirement**: 100% alias usage (user stated multiple times)
**Reality**: 2 violations found via grep
**Root Cause**: No ESLint rule to prevent
**Impact**: Inconsistent codebase, harder refactoring
**Fix**: Add no-restricted-imports ESLint rule + fixed in commit 831b1ca

### Database Migration Not Applied [2025-12-13 17:10 UTC, CC]

**File Created**: Dec 11, 2025 (supabase/migrations/20251211_booking_schema.sql)
**Status**: File exists, tables NOT in production
**Detection**: Supabase REST API returned 404 for bookings/sms_verifications
**Lesson**: File creation ≠ applied migration, always verify with queries

### Cell-Spanning Detection Failure [2025-12-01 ~01:39 EET, GC]

**Problem**: Toyota PDFs use merged cells for shared specs across trims
**Example**: "Engine Type" spans all 5 trims, "1598 CC" spans first 4 only
**Impact**: Parser assigns to single trim instead of all applicable trims
**Root Cause**: X-coordinate proximity matching without overlap detection