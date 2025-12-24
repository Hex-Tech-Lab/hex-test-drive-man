# Multi-Agent Orchestration Protocol

Version: 1.0.0 | Created: 2025-12-24 | Maintained By: CC

## Flag-Holding Protocol
When assigning tasks to multiple agents:
1. CC assigns tasks with explicit agent IDs in HANDOFF_STATUS.md
2. Each agent checks task dependencies before starting
3. Agent updates status to "in_progress" (claims flag)
4. Agent updates status to "done" or "blocked" (releases flag)
5. Dependent agents wait for "done" status before starting

## Wait-and-Listen Protocol
When multi-agent work has dependencies:
1. Agent A completes work, pushes to GitHub, updates HANDOFF_STATUS.md
2. Agent B polls HANDOFF_STATUS.md every 5 min (or user notifies)
3. Agent B verifies Agent A's commit SHA exists on remote
4. Agent B pulls latest, checks for conflicts, proceeds

## Conflict Resolution
If agents modify same files:
1. Later agent detects conflict during pull
2. Later agent requests CC review before resolving
3. CC arbitrates: accept, reject, or merge strategy
4. Decision documented in PERFORMANCE_LOG.md

## Tools
- HANDOFF_STATUS.md: Task registry with agent assignments, statuses
- git log: Verify commits from other agents
- GitHub API: Check PR status, branch existence
