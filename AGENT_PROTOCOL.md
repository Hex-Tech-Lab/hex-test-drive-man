# Agent Turn-Start Protocol

## MANDATORY: Before Creating ANY New File or Import

**STOP and verify existing patterns:**

```bash
# 1. Check if pattern exists
grep -r "import.*PACKAGE_NAME" src/ --include="*.ts" --include="*.tsx" | head -10

# 2. Verify package installed
grep "PACKAGE_NAME" package.json

# 3. Check existing utility files
ls -la src/lib/ lib/

# 4. Use existing pattern (don't create duplicates)

MANDATORY: Before Using ANY New Package
bash
# 1. Check package.json
grep "PACKAGE_NAME" package.json

# 2. If not found, check if similar package exists
grep -i "KEYWORD" package.json

# 3. Use existing package or request installation
Real Example: Supabase Import Crisis (2026-01-13)
Wrong (caused 8 build failures):

typescript
// Created: src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'  // ❌ Not in package.json
Correct (existing pattern):

typescript
import { createClient } from '@/lib/supabase'  // ✅ Already in src/lib/supabase.ts
Agent Responsibilities
CC (Claude)
BEFORE creating utilities: grep existing imports

BEFORE using packages: verify package.json

BEFORE pushing: run local build

AFTER crisis: update CLAUDE.md with prevention

BB (Blackbox)
BEFORE scripts: check existing tools/ and scripts/ directories

BEFORE dependencies: verify package.json

AFTER new tool: document in CLAUDE.md

PPLX (Perplexity)
DIAGNOSTICS ONLY: Never create files without user approval

VERIFICATION FIRST: Show existing patterns before suggesting changes

PROTOCOL ENFORCEMENT: Point to AGENT_PROTOCOL.md when violations detected

GC (Claude with 1M context)
LARGE REFACTORS: Always grep existing patterns first

DOCUMENTATION: Sync CLAUDE.md after major changes

Violation Examples
🔴 Build Failure Cascade (2026-01-13)
Violation: Created src/lib/supabase/client.ts without checking existing

Cost: 8 failed builds, 2 hours debugging

Fix: Deleted duplicate, used existing src/lib/supabase.ts

⚠️ Future Violations
Creating duplicate utilities (check src/lib/ first)

Using uninstalled packages (verify package.json first)

Overwriting working patterns (grep usage before changing)

When in Doubt
grep existing code

Verify package.json

Ask user before creating new infrastructure

Test locally before pushing

Never assume. Always verify.
