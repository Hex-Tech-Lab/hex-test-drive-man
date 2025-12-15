# Protect Main Branch - Instructions

**Issue**: GitHub complaining main branch is not protected
**Priority**: HIGH (prevents accidental force pushes, direct commits)

---

## Option 1: Via GitHub Web UI (Recommended)

**Steps**:
1. Navigate to: https://github.com/Hex-Tech-Lab/hex-test-drive-man/settings/branches
2. Click "Add branch protection rule"
3. Branch name pattern: `main`
4. Enable these protections:
   - ✅ Require a pull request before merging
   - ✅ Require approvals: 1 (can be 0 if you're solo)
   - ✅ Require status checks to pass before merging
     - ✅ Require branches to be up to date before merging
     - Status checks: `build`, `sonarcloud` (if configured)
   - ✅ Require conversation resolution before merging
   - ✅ Include administrators (you can bypass if needed)
   - ❌ Do not allow force pushes
   - ❌ Do not allow deletions
5. Click "Create" or "Save changes"

**Result**: Main protected, requires PRs for all changes

---

## Option 2: Via GitHub CLI (Quick)

**Command**:
```bash
gh api repos/Hex-Tech-Lab/hex-test-drive-man/branches/main/protection \
  -X PUT \
  -H "Accept: application/vnd.github+json" \
  --input - << 'EOF'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["build", "sonarcloud"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 0
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_linear_history": false,
  "required_conversation_resolution": true
}
EOF
```

**Note**: Requires `repo` scope in your GitHub token

---

## Option 3: Minimal Protection (If Quick Setup Needed)

**Command**:
```bash
gh api repos/Hex-Tech-Lab/hex-test-drive-man/branches/main/protection \
  -X PUT \
  -H "Accept: application/vnd.github+json" \
  --input - << 'EOF'
{
  "required_status_checks": null,
  "enforce_admins": false,
  "required_pull_request_reviews": null,
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
EOF
```

**Result**: Prevents force push and deletion only

---

## Verify Protection

**Check if main is protected**:
```bash
gh api repos/Hex-Tech-Lab/hex-test-drive-man/branches/main/protection
```

**Expected output**: JSON with protection rules

**Or via web**: https://github.com/Hex-Tech-Lab/hex-test-drive-man/settings/branches

---

## Current Issue

GitHub is complaining because:
- Main has no protection rules
- Direct commits possible (risky)
- Force push possible (dangerous)

**Recommended Action**: Use Option 1 (Web UI) for full control, or Option 3 (CLI minimal) for quick fix.

---

## After Protection Enabled

**Workflow Changes**:
1. All changes to main MUST go through PR
2. Direct commits to main will be rejected
3. Force push to main blocked
4. CC, GC, CCW all create feature branches → PR → main

**This is Already Our Pattern** (good practice!):
- CC: `claude/sync-agent-instructions-*` → PR → main
- GC: `gc/branch-cleanup-*` → PR → main
- CCW: `ccw/otp-2fa-system` → PR → main

Protection formalizes what we're already doing.
