## Agent Instructions & Protocol (Permanent)

1.  **Source of Truth:** `CLAUDE.md` is the primary source of truth for project context, tech stack, and architectural patterns.
2.  **Synchronization:** Whenever `GEMINI.md` (or any other agent context file like `CHATGPT.md`) is updated, `CLAUDE.md` MUST be updated to reflect the latest changes, decisions, and reports.
3.  **Consolidation:** Agents must consume reports from other agent files and append their own "Technical Report" to `CLAUDE.md` to maintain a unified history.
4.  **File Naming:** All agent context files must follow the pattern `AGENTNAME.md` (e.g., `CLAUDE.md`, `GEMINI.md`).
5.  **Quality Gates:** After any substantial change (and before updating the documentation), the system must be verified (e.g., `pnpm build`, `pnpm test`, or `pnpm lint`) to ensure it is working as expected.
6.  **Documentation:** The "Technical Report" format (What, Key Changes, Key Decisions, Reflection, Results, Quality Gates, Next Steps) is standard and should be used for all significant updates.

---

## Technical Report - Environment Fixes & Next.js 16 Verification (2025-12-06)

*   **What has been done:**
    *   Updated `@google/gemini-cli` to version 0.19.4.
    *   Fixed `git` and `eslint` ignoring of the python `venv/` directory.
    *   Verified Next.js 16 migration (build & lint passing).
*   **Key Changes:**
    *   `.gitignore`: Added `venv/`.
    *   `eslint.config.js`: Added `ignores: ['venv/**']`.
*   **Key Decisions:**
    *   **Package Manager:** `npm` is disabled in this environment. Installed `pnpm` locally (`curl -fsSL https://get.pnpm.io/install.sh | sh -`) and used it to update dependencies and tools.
    *   **Gemini Update:** Updated via `pnpm add -g @google/gemini-cli@latest`.
*   **Key Reflection Points:**
    *   The environment lacks a global `pnpm` in the PATH, requiring manual setup of `PNPM_HOME` and `PATH` for shell commands.
*   **Results:**
    *   Build passes.
    *   Lint passes.
    *   Gemini CLI updated.
*   **Quality Gates:**
    *   `pnpm build`: Passed.
    *   `pnpm lint`: Passed.
*   **Expected Actual Next Steps:**
    *   Commit changes.
