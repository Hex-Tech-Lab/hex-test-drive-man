# Environment Setup Reference
**Purpose**: Production-ready config for Docker/WSL/bare-metal environments
**Audience**: Future project templates, onboarding, container builds
**Status**: Living document (updated after each env issue)

***

## 1. pnpm PATH for Git Hooks (Husky)

### Problem
Git hooks execute in isolated shell without `~/.bashrc`/`~/.profile` PATH.
Husky's `husky.sh` re-executes hook with `sh -e "$0"` (clean shell).
Result: `pnpm not found` errors in pre-commit hooks.

### Root Cause
- Line 23 of `.husky/_/husky.sh`: `sh -e "$0" "$@"` starts new shell
- New shell doesn't inherit environment from parent
- `~/.huskyrc` sourced by husky.sh but not inherited by re-executed hook

### Solution (PERMANENT FIX - Dec 27, 2025)
**Modify `.husky/pre-commit` to source huskyrc AND set PATH directly**:

```bash
cat > .husky/pre-commit << 'EOFHOOK'
#!/usr/bin/env sh
if [ -f ~/.huskyrc ]; then
  . ~/.huskyrc
fi

# Add pnpm to PATH (CRITICAL: Must be in hook itself, not just huskyrc)
export PATH="/home/kellyb_dev/.local/bin:$PATH"

# Defensive check: Ensure pnpm is available
if ! command -v pnpm > /dev/null 2>&1; then
  echo ""
  echo "❌ ERROR: pnpm not found in PATH"
  echo ""
  echo "Pre-commit hook requires pnpm to run docstring checks."
  echo ""
  echo "Fix options:"
  echo "  1. Install pnpm globally:"
  echo "     npm install -g pnpm"
  echo "     # OR"
  echo "     curl -fsSL https://get.pnpm.io/install.sh | sh -"
  echo ""
  echo "  2. Skip this hook (EMERGENCY ONLY):"
  echo "     git commit --no-verify"
  echo ""
  echo "See SECURITY_NOTES.md section 5 for full setup instructions."
  echo ""
  exit 1
fi

# Run docstring coverage check
pnpm run check:docstrings
EOFHOOK
```

### Verification
```bash
# Test hook directly
cd ~/projects/hex-test-drive-man
sh -e .husky/pre-commit
# Expected: Hook runs, pnpm found, docstring check executes

# Test via git commit
git commit --allow-empty -m "test: verify pnpm hook"
# Expected: Hook passes (or fails on docstring coverage, not pnpm not found)
git reset --soft HEAD~1  # Clean up test
```

### Why This Works
1. Hook sources `~/.huskyrc` (if exists) for additional config
2. Hook sets PATH directly in its own execution context
3. No reliance on husky.sh's environment inheritance
4. PATH persists through entire hook execution

### Docker/WSL Template
```dockerfile
# In Dockerfile or WSL setup script
RUN mkdir -p /project/.husky && \
    cat > /project/.husky/pre-commit << 'EOFHOOK'
#!/usr/bin/env sh
export PATH="/root/.local/bin:$PATH"
if ! command -v pnpm > /dev/null 2>&1; then
  echo "❌ ERROR: pnpm not found"
  exit 1
fi
pnpm run check:docstrings
EOFHOOK
    chmod +x /project/.husky/pre-commit
```

### Status
✅ PERMANENT FIX (2025-12-27 23:54 EET)  
✅ Dockerizable  
✅ Verified working (hook executes successfully)  
✅ No husky.sh modification needed (isolated to hook file)

***

## 2. WSL Service Startup (0x80070422)

### Problem
`WslService` fails to start on Windows boot (error 0x80070422).
Impact: Ubuntu distribution won't start automatically.

### Solution (PERMANENT)
1. **PowerShell Script**: `C:\CleanupScripts\Fix-WSLService.ps1`
   - Starts WslService, vmcompute, hns
   - Includes error handling + logging

2. **Scheduled Task**: `WSL-Service-Startup`
   - Trigger: At system startup
   - Delay: 45 seconds (prevents race condition)
   - User: SYSTEM (highest privileges)
   - Script: `pwsh.exe -NoProfile -ExecutionPolicy Bypass -File "C:\CleanupScripts\Fix-WSLService.ps1"`

3. **Desktop Shortcut**: `Start-WSL.cmd` (manual recovery)

### Verification
```powershell
# Check service status
Get-Service WslService,vmcompute,hns | ft -AutoSize

# Check scheduled task
schtasks /Query /TN "WSL-Service-Startup" /V /FO LIST

# Test WSL
wsl --status
wsl uname -a
```

### Docker/WSL Template
N/A (Windows-specific, not Dockerizable)

### Status
✅ PERMANENT FIX (2025-12-27)  
❌ Not Dockerizable (Windows host only)  
✅ Verified working (service runs on boot)

***

## 3. Docstring Coverage Below 80% (Commit Blocker)

### Problem
Pre-commit hook blocks commits when docstring coverage < 80%.
Current coverage: 76.16% (36 missing docstrings out of 151 functions).

### Temporary Workaround
```bash
git commit --no-verify -m "your message"
```

### Permanent Solution (TODO)
Add docstrings to 6 more functions to reach 80% threshold.

**Target files** (likely candidates):
- Check `scripts/check_docstring_coverage.py` output for specific files
- Prioritize `src/` files with complex logic

### Status
⚠️ WORKAROUND ONLY (--no-verify bypasses check)  
⏳ TODO: Add 6+ docstrings to reach 80% coverage  
📅 Target: Next development session

***

## Docker Template Checklist

**When creating new project container**:
- [ ] pnpm PATH in `.husky/pre-commit` (Section 1)
- [ ] Install pnpm: `curl -fsSL https://get.pnpm.io/install.sh | sh -`
- [ ] Verify hook: `sh -e .husky/pre-commit` (should find pnpm)
- [ ] [Future fixes will be added here]

**Estimated setup time after automation**: <5 minutes (vs 6 weeks manual)

***

## WSL Setup Script (Template)

```bash
#!/bin/bash
# setup-wsl-environment.sh - One-time WSL environment setup

set -euo pipefail

echo "🚀 Setting up WSL environment..."

# 1. Install pnpm
if ! command -v pnpm &> /dev/null; then
  echo "📦 Installing pnpm..."
  curl -fsSL https://get.pnpm.io/install.sh | sh -
  export PATH="$HOME/.local/bin:$PATH"
fi

# 2. Configure Husky PATH
echo "🔧 Configuring Husky hooks..."
if [ -d .husky ]; then
  cat > .husky/pre-commit << 'EOFHOOK'
#!/usr/bin/env sh
export PATH="$HOME/.local/bin:$PATH"
if ! command -v pnpm > /dev/null 2>&1; then
  echo "❌ ERROR: pnpm not found"
  exit 1
fi
pnpm run check:docstrings
EOFHOOK
  chmod +x .husky/pre-commit
fi

# 3. Verify setup
echo "✅ Verifying setup..."
pnpm --version
sh -e .husky/pre-commit || echo "⚠️ Hook test failed (expected if no docstrings)"

echo "🎉 Setup complete!"
```

***

**Last Updated**: 2025-12-27 23:56 EET  
**Maintainer**: CC (Claude Code)  
**Next Review**: After each new env issue resolved
