# Prompt Fixtures – v2.3 (Mandatory)

**Version**: 2.3
**Last Updated**: 2025-12-23 02:50 UTC
**Maintained By**: CC (Claude Code)
**Status**: MANDATORY - All agent prompts MUST incorporate this spec

---

## Purpose

This document defines the **canonical prompt structure** that MUST be used for all agent tasks (CC, GC, BB, CCW). No ad-hoc prompts are valid unless they incorporate these fixtures.

**Authority**: Only CC may modify this file. All other agents (GC, BB, CCW) must use these fixtures as read-only boilerplate.

---

## GLOBAL EXECUTION FIXTURES

Every prompt for every agent MUST include the following elements (verbatim or via template reference):

### 1. Timeboxing

**REQUIRED**: Every prompt states a clear timebox.

```
Timebox: <N> minutes
```

**Examples**:
- "Timebox: 20 minutes"
- "Timebox: 2 hours"
- "Timebox: 30 minutes (hard stop)"

**Rule**: If the timebox is exceeded, agent MUST stop work, document progress, commit partial results, and report status to user.

---

### 2. Reasoning

**REQUIRED**: Step-by-step thinking and self-critique before implementation.

```
REASONING REQUIREMENTS:
- Think step-by-step before executing
- Critique your own solution before implementation
- Identify edge cases and failure modes
- Consider simpler alternatives
```

**Application**:
- Before writing code: "What could go wrong with this approach?"
- Before committing: "Does this solve the root cause or just the symptom?"
- Before declaring done: "What did I not test that could break?"

---

### 3. Verification

**REQUIRED**: Sample-based verification with expansion if errors found.

```
VERIFICATION PROTOCOL:
1. Verify a representative sample of results (minimum 3 cases)
2. If ANY errors found:
   - Expand sample size (double the sample)
   - Re-verify expanded sample
   - Fix all errors found
   - Repeat verification until zero errors in expanded sample
3. Document verification results in commit message or report
```

**Examples**:
- Code changes: Test 3 affected functions/components
- Data transformations: Verify 3 input→output pairs
- Documentation updates: Verify 3 cross-references are correct

---

### 4. Documentation & Cadence

**REQUIRED**: Update project documentation after meaningful work cycles.

```
DOCUMENTATION SYNC:
1. Update CLAUDE.md when:
   - Architecture decisions change
   - New rules/guardrails established
   - Workflow processes modified
   - Major bugs/lessons learned

2. Sync changes to relevant agent files:
   - GEMINI.md (for GC-relevant updates)
   - BLACKBOX.md (for BB-relevant updates)

3. Append entry to docs/PERFORMANCE_LOG.md:
   Format: YYYY-MM-DD HH:MM UTC – Agent – Task
   Include:
   - Start time, end time, duration
   - Files touched (with line counts)
   - Agent name
   - Short self-critique (what worked, what didn't)
   - Blockers encountered
```

**Cadence**:
- Small tasks (<30 min): Update PERFORMANCE_LOG only
- Medium tasks (30 min - 2 hours): Update PERFORMANCE_LOG + relevant agent doc sections
- Large tasks (>2 hours): Update all affected docs + version bump if architecture changed

---

### 5. GitHub Discipline

**REQUIRED**: Treat GitHub main branch as single source of truth.

```
GITHUB WORKFLOW:
- Main branch = single source of truth
- All work happens on feature branches
- Branch naming: [agent]/[feature]-[session-id]
- Main only updated via PR merge (unless user explicitly overrides)
- Never use --force push to main
- Respect pre-commit hooks (no --no-verify without user approval)
```

**PR Requirements**:
- Clear title: `type(scope): description`
- Summary: Bullet points of changes
- Test plan: How to verify changes work
- Link to related issues/docs

---

### 6. Review Tooling

**REQUIRED**: Run and read outputs from quality tools before finalizing.

```
QUALITY GATES (when applicable):
1. Lint: pnpm lint
2. Type check: pnpm build (for TypeScript)
3. Tests: pnpm test (when test suite exists)
4. Code review tools:
   - CodeRabbit (AI review on PRs)
   - Sonar (security/quality scanning)
   - Snyk (dependency vulnerabilities)

OUTPUT HANDLING:
- Read and understand all errors/warnings
- Fix CRITICAL/BLOCKER issues before committing
- Document accepted technical debt in commit message
- Summarize important findings in PR description
```

**Self-Review Checklist**:
- [ ] Zero TypeScript errors
- [ ] ESLint warnings reviewed (fix or document why safe to ignore)
- [ ] Security vulnerabilities addressed or documented
- [ ] Tests pass (or test plan documented if no tests exist)

---

## SECURITY & ENVIRONMENT VARIABLES

**REFERENCE**: See `SECURITY_NOTES.md` for full security discipline.

**Key Rule for Prompts**:
```
SECURITY DISCIPLINE:
- Agents may rely on env vars being correctly configured
- Agents MUST NOT request raw secrets in prompts or outputs
- Agents MUST NOT log secrets to terminal or console
- Agents MUST NOT commit secrets to git
- Use placeholders in documentation: [your-key-here]
- Reference SECURITY_NOTES.md for setup instructions
```

**Environment Variables Setup**:
- Local: `.env.local` (gitignored, copied from `.env.example`)
- Vercel: Dashboard → Settings → Environment Variables
- CI/CD: GitHub Repository Secrets

---

## AGENT CAPABILITIES TABLE

| Agent | Primary Responsibilities | Tools/Expertise | Template Location |
|-------|-------------------------|-----------------|-------------------|
| **CC** | Architecture, master docs, prompt system design, hardest bugs, guardrails | All tools, design authority | CLAUDE.md § CC Prompt Template |
| **GC** | Git/PR/doc integration, large refactors, doc syncing across agents | 1M token context, git automation | GEMINI.md § GC Prompt Template |
| **BB** | Scripts/tools, Playwright+Xvfb browser testing, rich reports with screenshots | Playwright, JSON reports, screenshots | BLACKBOX.md § BB Prompt Template |
| **CCW** | Vertical feature ownership (e.g., OTP/SMS end-to-end implementation) | Same as CC, focused scope | CLAUDE.md § CC Prompt Template |

**Authority Hierarchy**:
1. **CC**: Designs fixtures, templates, guardrails. Only agent that can modify this file.
2. **GC/BB/CCW**: Apply fixtures via templates. Never redesign structure.

**Constraint**: GC may never design new fixtures or modify prompt templates. GC only wraps task-specific instructions inside the GC Prompt Template from GEMINI.md.

---

## TEMPLATE USAGE RULES

### For CC (designing prompts for other agents)

When creating a prompt for GC or BB:
1. Start with the agent's template (from GEMINI.md or BLACKBOX.md)
2. Fill in task-specific details in the "TASK-SPECIFIC INSTRUCTIONS" section
3. Keep all global fixtures intact
4. Add agent-specific requirements as needed

### For GC (receiving prompts from CC)

When receiving a task from CC:
1. Locate GC Prompt Template in GEMINI.md
2. Insert CC's task description into the "TASK-SPECIFIC INSTRUCTIONS" section
3. Execute following the template structure
4. Never modify the fixtures or template structure

### For BB (receiving prompts from CC)

When receiving a task from CC:
1. Locate BB Prompt Template in BLACKBOX.md
2. Insert CC's task description into the "TASK-SPECIFIC INSTRUCTIONS" section
3. Execute following the template structure
4. Always include screenshots and JSON reports per BB-specific requirements

---

## VERSION HISTORY

### v2.3 (2025-12-23 02:50 UTC)
- **Initial Release**: Established mandatory global fixtures for all agents
- Created CC, GC, BB prompt templates
- Defined authority hierarchy (CC designs, others apply)
- Integrated SECURITY_NOTES.md reference
- Established verification protocol with sample expansion
- Documented agent capabilities table

---

**Last Updated**: 2025-12-23 02:50 UTC
**Maintained By**: CC (Claude Code)
**Next Review**: After MVP 1.0 completion or when workflow changes require fixture updates
