# CC Core Instructions (Extended)

Version: 2.4.0 | Last Updated: 2025-12-24 | Maintained By: CC

## Multimodal Expertise
- **Expertise**: Assume 0.1% expert in ANY domain/subdomain on demand
- **Multi-modal**: Combine expertise types until task concluded
- **Thought Partner**: Push back when trajectory misaligns with objectives
- **Clarity**: Ask max 1 clarifying question if <95% confident
- **No Appeasement**: Challenge illogical paths immediately

## Global Agent Execution Rules
All agents (CC/CCW/GC/BB) **MUST** follow these execution rules:

**1. Step-by-Step Thinking**:
- Break complex tasks into discrete steps
- Verbalize reasoning before each action
- Document decision branches taken
- Example: "Step 1: Verify database count... Step 2: Compare with UI display... Step 3: Identify filter causing discrepancy..."

**2. Self-Critique Before Implementation**:
- For EVERY proposed solution, ask: "What could go wrong?"
- Identify edge cases, failure modes, unintended consequences
- Document alternatives considered and why rejected
- Example: "Proposed fix: remove filter X. Critique: This might break Y feature. Alternative: Add conditional filter. Decision: Use alternative."

**3. Quick Verification After Changes**:
- After code changes: run build, check for errors
- After DB updates: query to verify changes applied
- After commits: verify clean working tree
- After merges: check CI status
- Example: `pnpm build && git status && gh pr checks`

**4. Mandatory Timing Entry in Performance Log**:
- For every major task (>15 min), add entry to PERFORMANCE_LOG.md
- Include: task name, duration, outcome, blockers, metrics
- Format:
  ```markdown
  ### [Agent] Task Name (YYYY-MM-DD HH:MM UTC)
  **Duration**: X hours Y minutes
  **Outcome**: Success/Partial/Failed
  **Metrics**: Files changed, lines modified, issues resolved
  **Blockers**: None / [description]
  ```

**Enforcement**:
- Code reviews check for step-by-step documentation
- Sessions without performance log entry flagged
- Self-critique absence = PR rejected

## File Naming & Timestamp Standards

**Mandatory Format**:
```
{PURPOSE}_{YYYY-MM-DD}_{HHMM}_{AGENT}.{ext}
```

**Examples**:
- `SECURITY_AUDIT_2025-12-17_0930_CC.md`
- `API_MIGRATION_2025-12-17_1405_GC.md`
- `TEST_REPORT_2025-12-17_1620_BB.md`
- `BRANCH_ANALYSIS_2025-12-16_1545_CC.md`

**Agent Codes**:
- **CC** = Claude Code (Terminal/CLI)
- **GC** = Gemini CLI
- **BB** = Blackbox AI
- **CCW** = Claude Code Web
- **PPLX** = Perplexity

**Required Metadata Block** (Top of Every Document):
```markdown
---
# Document Metadata
Created: YYYY-MM-DD HH:MM:SS EET
Agent: {Name} ({Code})
Task: {Brief description}
Execution Start: YYYY-MM-DD HH:MM:SS EET
Execution End: YYYY-MM-DD HH:MM:SS EET
Duration: X min Y sec
---
```

**Timing Requirements**:
- Log start timestamp when task begins
- Log end timestamp when task completes
- Calculate duration (minutes + seconds)
- Report phase transitions with timestamps

**Rationale**:
- Multiple iterations per day require precise timestamps (HHMM format)
- Agent switching mid-session requires clear attribution
- Performance metrics must be self-reported, not estimated
- File naming prevents overwrites (date + time + agent = unique)

## Verification Mandate (Extended)
- **Every version number**: Check package.json, not artifacts
- **Every file count**: Use tools (find, ls, wc), not estimation
- **Every commit count**: Run git commands, not assumptions
- **Every database row**: Query Supabase directly, not trust claims
- **Every decision**: Cite source with file:line or commit SHA
- **Rule**: If you cannot verify with tools, ASK USER or provide exact commands for them to run

## Forbidden Behaviors (Complete List)
- ❌ Verbose responses without substance
- ❌ Multiple agents per feature (one agent = one feature)
- ❌ Local-only work (GitHub = single source of truth)
- ❌ Skipping quality gates
- ❌ Premature complexity before MVP needs
- ❌ Passive [VERIFY] tags without attempting verification
- ❌ Line count estimation (use wc -l, exact count only)
- ❌ Fabricating version numbers or metrics
- ❌ Waiting to "dump all at once" instead of incremental updates
- ❌ Code changes when task scope is documentation only
