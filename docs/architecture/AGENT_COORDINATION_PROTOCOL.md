# Agent Coordination Protocol - Multi-Agent Conflict Prevention

**Version**: 1.0
**Author**: CC (Claude Code)
**Date**: 2026-01-05
**Status**: ACTIVE - Ready for Implementation
**Purpose**: Prevent concurrent work conflicts in multi-agent environment

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [System Architecture](#system-architecture)
3. [File Locking Mechanism](#file-locking-mechanism)
4. [Task Reservation System](#task-reservation-system)
5. [Real-Time Status Broadcast](#real-time-status-broadcast)
6. [Handoff Automation](#handoff-automation)
7. [Conflict Resolution](#conflict-resolution)
8. [Implementation Guide](#implementation-guide)

---

## Problem Statement

### Current State (Gaps)

**✅ What We Have**:
- Pre-push Git hook (prevents unsafe pushes after work done)
- HANDOFF_STATUS.md (manual coordination, updated at session end)
- GIT_WORKFLOW_RULES.md (policies, not enforcement)

**❌ What's Missing**:
- **Real-time coordination**: Agents can start conflicting work unknowingly
- **File-level locking**: Two agents can edit same file simultaneously
- **Task queue system**: Work assignment is ad-hoc, no claim mechanism
- **Stale detection**: No way to tell if agent crashed vs still working

### Evidence of Problem

**Incident**: 2026-01-05 Git Rebase (docs/incidents/2026-01-05-REBASE-INCIDENT.md)
- CC and BB both worked on main concurrently
- No warning until push attempted
- Manual rebase required (preventable with coordination)

**Root Cause**: No pre-work coordination, only post-work Git protection

---

## System Architecture

### Design Principles

1. **Lightweight**: JSON file-based, no database dependency (MVP)
2. **Fail-Safe**: Missing lock file = all agents can proceed (degraded but functional)
3. **Self-Healing**: Expired locks auto-release (no manual cleanup)
4. **Non-Blocking**: Warnings, not hard blocks (agents can override in emergencies)

### Storage Mechanism Decision

**Evaluated Options**:

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **JSON File** | Simple, no infrastructure, version controlled | Concurrent writes = race condition | ✅ **CHOSEN** (MVP) |
| Database | ACID guarantees, proper locking | Adds dependency, overkill for 4 agents | ❌ Rejected (future) |
| GitHub API | Native integration, remote access | API rate limits, latency | ❌ Rejected (complexity) |

**Chosen**: JSON file with file-system atomic writes (rename strategy)

**Future**: Migrate to database when agent count > 10 or conflicts > 5/week

---

## File Locking Mechanism

### Lock Acquisition Protocol

**Step 1: Agent Checks Lock Before Starting**
```bash
# Agent CC wants to edit CLAUDE.md
python scripts/agent-coordination.py claim CLAUDE.md --agent CC

# Output:
✅ Lock acquired for CLAUDE.md (expires in 30 min)
```

**Step 2: Lock Storage**
```json
// docs/AGENT_STATUS_REALTIME.json
{
  "file_locks": {
    "CLAUDE.md": {
      "agent": "CC",
      "locked_at": "2026-01-05T13:00:00Z",
      "expires_at": "2026-01-05T13:30:00Z",
      "reason": "Pruning Section 13 (90 min task)"
    }
  }
}
```

**Step 3: Other Agent Attempts Same File**
```bash
# Agent BB wants to edit CLAUDE.md
python scripts/agent-coordination.py claim CLAUDE.md --agent BB

# Output:
❌ BLOCKED: CLAUDE.md locked by CC until 13:30 (20 min remaining)
Reason: Pruning Section 13 (90 min task)

Options:
1. Wait 20 minutes
2. Pick different task
3. Force unlock (emergency only): --force
```

### Lock Release Protocol

**Automatic Release** (preferred):
```bash
# Agent CC finishes work
python scripts/agent-coordination.py release CLAUDE.md --agent CC

# Output:
✅ Lock released for CLAUDE.md
```

**Timeout-Based Release**:
- Lock expires after 30 minutes automatically
- Agent must renew if task takes longer: `--extend 30`
- Prevents orphaned locks from crashed agents

**Force Release** (emergency):
```bash
# User manually unlocks after agent crash
python scripts/agent-coordination.py unlock CLAUDE.md --force

# Output:
⚠️  Force unlock: CLAUDE.md was locked by CC (started 40 min ago)
✅ Lock removed
```

### Lock Granularity Levels

**File-Level** (MVP):
- Locks entire file (e.g., `CLAUDE.md`)
- Simple, prevents most conflicts
- Downside: Blocks concurrent work on different sections

**Directory-Level** (future):
- Locks entire directory (e.g., `docs/best-practices/`)
- Useful for bulk operations

**Section-Level** (future):
- Locks file section (e.g., `CLAUDE.md:Section13`)
- Allows concurrent edits to different sections
- Requires line-range tracking

**Chosen for MVP**: File-level (simplest, covers 90% of conflicts)

---

## Task Reservation System

### Task Queue Structure

**Storage**: `docs/TASK_QUEUE.json`

```json
{
  "tasks": [
    {
      "id": "TASK-001",
      "title": "Consolidate 15 best practices lessons",
      "assigned_to": "BB",
      "status": "CLAIMED",
      "claimed_at": "2026-01-05T13:00:00Z",
      "files": ["docs/best-practices/git-workflows/", "docs/best-practices/INDEX.md"],
      "estimated_duration_min": 120,
      "timeout_at": "2026-01-05T15:00:00Z"
    },
    {
      "id": "TASK-002",
      "title": "Fix Mercedes trims (0 → 24 rows)",
      "assigned_to": null,
      "status": "READY_FOR_PICKUP",
      "files": ["scripts/fix-mercedes-trims.mjs"],
      "estimated_duration_min": 15
    }
  ]
}
```

### Task Lifecycle States

```
READY_FOR_PICKUP → CLAIMED → IN_PROGRESS → DONE → VERIFIED
                        ↓
                    STALLED (timeout) → AUTO_RELEASED
```

**State Transitions**:

1. **READY_FOR_PICKUP**: Task created by user or agent, no owner
2. **CLAIMED**: Agent calls `claim-task TASK-001 --agent BB`
3. **IN_PROGRESS**: Agent starts work, updates status heartbeat
4. **DONE**: Agent finishes, commits, marks complete
5. **VERIFIED**: User or another agent confirms success

**Timeout Rules**:
- CLAIMED → AUTO_RELEASED if no IN_PROGRESS within 10 min
- IN_PROGRESS → STALLED if no heartbeat within 30 min
- STALLED tasks return to READY_FOR_PICKUP

### Task Claiming Protocol

**Step 1: Agent Queries Available Tasks**
```bash
python scripts/agent-coordination.py list-tasks --status READY_FOR_PICKUP

# Output:
Available Tasks:
  TASK-002: Fix Mercedes trims (15 min) [scripts/fix-mercedes-trims.mjs]
  TASK-003: Add favorites button (10 min) [src/components/FavoriteButton.tsx]
```

**Step 2: Agent Claims Task**
```bash
python scripts/agent-coordination.py claim-task TASK-002 --agent BB

# Output:
✅ Task claimed: TASK-002 (Fix Mercedes trims)
Files locked: scripts/fix-mercedes-trims.mjs
Timeout: 2026-01-05T13:15:00Z (15 min)

IMPORTANT: Update status every 5 min or task will be auto-released
```

**Step 3: Conflict Detection**
```bash
# Agent CC tries to claim same task
python scripts/agent-coordination.py claim-task TASK-002 --agent CC

# Output:
❌ CONFLICT: TASK-002 already claimed by BB (5 min ago)
Status: IN_PROGRESS (last heartbeat 2 min ago)

Suggestion: Pick different task or wait 10 min for timeout
```

---

## Real-Time Status Broadcast

### Heartbeat Protocol

**Purpose**: Detect crashed/stalled agents

**Frequency**: Every 5 minutes (agent's responsibility)

**Implementation**:
```bash
# Agent BB working on task
python scripts/agent-coordination.py heartbeat --agent BB \
  --file "docs/best-practices/git-workflows/REBASE_NORMAL_WORKFLOW.md" \
  --status "Writing lesson 3 of 15"

# Stored in docs/AGENT_STATUS_REALTIME.json
```

**Storage Format**:
```json
{
  "agent_status": {
    "BB": {
      "status": "ACTIVE",
      "current_task": "TASK-001",
      "current_file": "docs/best-practices/git-workflows/REBASE_NORMAL_WORKFLOW.md",
      "progress": "Writing lesson 3 of 15",
      "started": "2026-01-05T13:00:00Z",
      "last_heartbeat": "2026-01-05T13:10:00Z"
    },
    "CC": {
      "status": "IDLE",
      "last_heartbeat": "2026-01-05T12:50:00Z"
    }
  }
}
```

### Stale Agent Detection

**Rule**: Agent considered stale if `last_heartbeat > 10 minutes ago`

**Auto-Actions**:
1. Release all file locks held by stale agent
2. Mark tasks as STALLED
3. Send notification (future: Slack/email)

**Manual Check**:
```bash
python scripts/agent-coordination.py check-stale

# Output:
⚠️  Stale Agents Detected:
  GC: Last seen 45 min ago (last file: docs/GEMINI.md)
  Action: Released 1 file lock, marked TASK-005 as STALLED
```

---

## Handoff Automation

### Current Manual Process (Inefficient)

**Today**:
1. Agent CC finishes task
2. Agent CC manually updates `docs/HANDOFF_STATUS.md`
3. User reads HANDOFF_STATUS, assigns next task to BB
4. BB reads HANDOFF_STATUS, starts work

**Problem**: Human in the loop, slow, error-prone

### Automated Handoff Protocol

**Step 1: Agent Marks Task Complete**
```bash
python scripts/agent-coordination.py complete-task TASK-001 --agent BB \
  --deliverables "15 lesson files, INDEX.md, 16 commits" \
  --next-action "User reviews INDEX.md, approves for production"

# Auto-updates:
# 1. TASK_QUEUE.json: status → DONE
# 2. HANDOFF_STATUS.md: Appends completion entry
# 3. Releases all file locks
# 4. Triggers notification (future)
```

**Step 2: Auto-Generated HANDOFF_STATUS Entry**
```markdown
## 2026-01-05 13:45 EET - BB Completed TASK-001

**Task**: Consolidate 15 best practices lessons
**Duration**: 90 min (allocated) / 85 min (actual) = 94% efficiency
**Deliverables**:
- 15 lesson files (docs/best-practices/)
- INDEX.md (master searchable index)
- 16 commits (incremental, not batched)

**Next Action**: User reviews INDEX.md, approves for production
**Status**: READY_FOR_REVIEW
```

**Step 3: Next Agent Auto-Discovery**
```bash
# Agent CC checks for available work
python scripts/agent-coordination.py next-task --agent CC

# Output:
📋 Suggested Next Task:
  TASK-003: Add favorites button (10 min)
  Reason: High priority, matches CC strengths (UI component design)

  Accept? (y/n): y
  ✅ Task claimed: TASK-003
```

---

## Conflict Resolution

### Conflict Types & Resolution Strategies

#### Type 1: File Lock Conflict

**Scenario**: Two agents want same file simultaneously

**Resolution**:
1. **First-Come-First-Serve** (MVP): First agent gets lock
2. **Priority-Based** (future): HIGH priority task overrides LOW priority
3. **Collaborative** (future): Lock with section-level granularity

**Example**:
```bash
# CC tries to lock CLAUDE.md (already locked by BB)
# Resolution: CC warned, picks different file or waits
```

---

#### Type 2: Task Claim Conflict

**Scenario**: Two agents claim same task in race condition

**Resolution**:
1. Check file timestamps (older timestamp wins)
2. Loser gets error, must pick different task
3. Log incident for analysis (how often does this happen?)

**Example**:
```json
// TASK_QUEUE.json shows both agents claimed TASK-002
// Script detects: BB claimed at 13:00:01, CC claimed at 13:00:03
// Winner: BB (2 sec earlier)
// Action: CC's claim rolled back, BB keeps task
```

---

#### Type 3: Stale Lock Blocking Progress

**Scenario**: Agent crashes, lock never released

**Resolution**:
1. Automatic timeout (30 min default)
2. Force unlock after verifying agent truly stale
3. Log incident (investigate why agent crashed)

**Example**:
```bash
# GC locked GEMINI.md 2 hours ago (no heartbeat)
# Auto-action: Lock expired, released for other agents
# Notification: User alerted about GC crash
```

---

### Grace Period Configuration

**Warnings vs Hard Blocks**:

```python
# Configuration (in script or env variable)
CONFLICT_MODE = "warn"  # Options: warn, block, auto-resolve

# Behavior:
if CONFLICT_MODE == "warn":
    print("⚠️  Warning: File locked by another agent")
    print("Continue anyway? (y/n)")  # Allow override

elif CONFLICT_MODE == "block":
    print("❌ BLOCKED: File locked by another agent")
    sys.exit(1)  # Hard stop

elif CONFLICT_MODE == "auto-resolve":
    # Apply resolution strategy (priority, timeout, etc.)
    auto_resolve_conflict()
```

**Recommended**: Start with "warn" mode for first 30 days, evaluate conflicts, then tighten to "block"

---

## Implementation Guide

### Phase 1: MVP (Week 1)

**Deliverables**:
- [ ] `scripts/agent-coordination.py` (file locking only)
- [ ] `docs/AGENT_STATUS_REALTIME.json` (storage file)
- [ ] Update CLAUDE.md Section 1 with coordination mandate
- [ ] Test with 2 agents (CC and BB)

**Commands Implemented**:
- `claim <file> --agent <name>`
- `release <file> --agent <name>`
- `check-conflicts --agent <name>`
- `list-locks` (show all active locks)

---

### Phase 2: Task Queue (Week 2)

**Deliverables**:
- [ ] `docs/TASK_QUEUE.json` (task storage)
- [ ] Task lifecycle management (CLAIMED → DONE)
- [ ] Timeout-based auto-release
- [ ] Integration with HANDOFF_STATUS.md

**Commands Added**:
- `list-tasks --status <STATUS>`
- `claim-task <TASK_ID> --agent <name>`
- `complete-task <TASK_ID> --agent <name>`
- `check-stale` (detect stalled agents)

---

### Phase 3: Real-Time Status (Week 3)

**Deliverables**:
- [ ] Heartbeat protocol (5 min intervals)
- [ ] Stale agent detection (> 10 min idle)
- [ ] Auto-unlock stale agent locks
- [ ] Dashboard view (list active agents)

**Commands Added**:
- `heartbeat --agent <name> --file <path> --status <msg>`
- `status` (show all agents, last seen, current work)
- `force-unlock <file>` (emergency manual unlock)

---

### Integration with Existing Systems

#### CLAUDE.md Section 1 Addition

**New Item #16** (after Best Practices First):
```markdown
16. **Agent Coordination Protocol (MANDATORY - 2026-01-05)**
    > Before modifying ANY file: `python scripts/agent-coordination.py claim <FILE> --agent <AGENT>`. If locked by another agent: WAIT or pick different task. After completing work: `python scripts/agent-coordination.py release <FILE> --agent <AGENT>`. Update heartbeat every 5 min during long tasks.
```

#### Pre-Commit Hook Integration

```bash
# .husky/pre-commit (add check)
#!/bin/sh

# Check if files being committed are locked by another agent
python scripts/agent-coordination.py verify-locks --files $(git diff --cached --name-only)

# If locked by another agent: warn (but allow commit)
```

#### GitHub Actions Workflow (Future)

```yaml
# .github/workflows/coordination-check.yml
name: Coordination Check
on: [pull_request]
jobs:
  check-conflicts:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Check for coordination violations
        run: python scripts/agent-coordination.py audit-pr --pr ${{ github.event.pull_request.number }}
```

---

## Success Metrics

### Week 1 (MVP)
- [ ] 0 concurrent file edit conflicts (down from 1-2/week)
- [ ] File locks working (tested with CC + BB)
- [ ] Agents aware of coordination protocol (cited in commits)

### Week 4 (Full System)
- [ ] Task queue operational (3+ tasks in queue)
- [ ] Heartbeat protocol running (agents update every 5 min)
- [ ] Stale detection working (auto-unlocks after timeout)

### Month 3 (Mature System)
- [ ] <1 coordination conflict per month
- [ ] 100% agent adoption (all agents use protocol)
- [ ] Handoff automation working (minimal user coordination)

---

## Rollout Strategy

### Phase 1: Soft Launch (Warnings Only)
- Deploy script with `CONFLICT_MODE = "warn"`
- Agents can override locks (not blocked)
- Collect data: How often do conflicts occur?

### Phase 2: Hard Enforcement (Blocks)
- After 2 weeks of data collection
- Switch to `CONFLICT_MODE = "block"`
- Agents must respect locks (no override)

### Phase 3: Full Automation
- Add task queue + heartbeat
- Auto-unlock stale agents
- Handoff automation

---

**END OF PROTOCOL DOCUMENT**

**Next Step**: Implement `scripts/agent-coordination.py` (Phase 1 MVP)
**Estimated Effort**: 2-3 hours (BB can implement from this spec)
**Dependencies**: None (pure Python, JSON storage)
