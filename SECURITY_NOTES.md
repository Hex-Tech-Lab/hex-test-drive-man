# Security & Secret Handling

**Version**: 1.0
**Last Updated**: 2025-12-23
**Maintained By**: CC (Claude Code)

---

## 1. Source of Truth for Secrets

**MANDATORY RULE**: Secrets and API keys NEVER live in git-tracked files.

### Where Secrets MUST Live

| Environment | Storage Location | Access Method |
|-------------|------------------|---------------|
| **Local Development** | `.env.local` (gitignored) | Next.js auto-loads on `pnpm dev` |
| **Vercel Production** | Vercel Dashboard → Settings → Environment Variables | Auto-injected at build time |
| **Vercel Preview** | Vercel Dashboard → Settings → Environment Variables | Auto-injected at build time |
| **CI/CD (GitHub Actions)** | Repository Secrets (Settings → Secrets and variables → Actions) | `${{ secrets.VAR_NAME }}` |
| **Agent Sessions** | User provides via secure paste OR reads from local `.env.local` | Never logged/committed |

### Where Secrets MUST NEVER Be

❌ **Forbidden Locations**:
- Committed files (`.md`, `.ts`, `.js`, `.py`, `.sh`)
- Git history
- PR descriptions or comments
- Issue descriptions
- CLAUDE.md, BLACKBOX.md, GEMINI.md (agent handover docs)
- Scripts output logs
- Console logs or debug statements

---

## 2. Required Environment Variables

### Core Application (Runtime)

```bash
# Supabase Database (REQUIRED for app to function)
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.[payload].[signature]

# Supabase Service Role (REQUIRED for server-side operations)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.[payload].[signature]

# Sentry Error Tracking (OPTIONAL for production monitoring)
NEXT_PUBLIC_SENTRY_DSN=https://[hash]@[region].ingest.sentry.io/[project-id]
SENTRY_ORG=hex-tech-lab
SENTRY_PROJECT=hex-test-drive-man
SENTRY_AUTH_TOKEN=sntrys_[token]
```

### Development Tools (Local Only)

```bash
# AI Agent API Keys (for PDF extraction, analysis)
ANTHROPIC_API_KEY=sk-ant-api03-[key]
GEMINI_API_KEY=AIzaSy[key]

# GitHub API (for automated PRs, repository operations)
GITHUB_TOKEN=ghp_[token]
```

---

## 3. Setup Instructions

### Local Development Setup

1. **Copy template to local config**:
   ```bash
   cp .env.template .env.local
   ```

2. **Get Supabase credentials** (ask user or check password manager):
   - Dashboard: https://supabase.com/dashboard/project/lbttmhwckcrfdymwyuhn/settings/api
   - Copy `URL` → paste as `NEXT_PUBLIC_SUPABASE_URL`
   - Copy `anon/public` key → paste as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy `service_role` key → paste as `SUPABASE_SERVICE_ROLE_KEY`

3. **Verify gitignore** (confirm `.env.local` is ignored):
   ```bash
   grep -E "^\.env\.local$" .gitignore
   # Should output: .env.local
   ```

4. **Test app loads**:
   ```bash
   pnpm dev
   # Open http://localhost:3000/en
   # Should show vehicle catalog (not errors)
   ```

### Vercel Production Setup

1. **Navigate to Vercel Dashboard**:
   ```
   https://vercel.com/hex-tech-lab/hex-test-drive-man/settings/environment-variables
   ```

2. **Add Required Variables** (one at a time):
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
     Value: `https://lbttmhwckcrfdymwyuhn.supabase.co`
     Environments: ✅ Production ✅ Preview ✅ Development

   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.[full-jwt-token]`
     Environments: ✅ Production ✅ Preview ✅ Development

   - Name: `SUPABASE_SERVICE_ROLE_KEY`
     Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.[full-jwt-token]`
     Environments: ✅ Production

3. **Redeploy** (automatic on variable save):
   - Vercel triggers new deployment automatically
   - Wait 2-3 minutes for build to complete
   - Verify: https://getmytestdrive.com/en shows vehicles

### CI/CD (GitHub Actions) Setup

1. **Add Repository Secrets**:
   ```
   Settings → Secrets and variables → Actions → New repository secret
   ```

2. **Required Secrets**:
   - `SUPABASE_SERVICE_ROLE_KEY` (for migration tests)
   - `GITHUB_TOKEN` (auto-provided by GitHub Actions)

3. **Usage in Workflow**:
   ```yaml
   env:
     SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
   ```

---

## 4. Agent Rules for Secret Handling

### For CC, BB, GC, CCW (All Agents)

**Rule 1: NEVER request raw secrets in prompts**
- ❌ Bad: "What's the SUPABASE_ANON_KEY?"
- ✅ Good: "Please add NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local (see SECURITY_NOTES.md)"

**Rule 2: NEVER log secrets to terminal**
- ❌ Bad: `echo "KEY=$SUPABASE_ANON_KEY"`
- ✅ Good: `echo "SUPABASE_ANON_KEY is set: $([ -n "$SUPABASE_ANON_KEY" ] && echo 'YES' || echo 'NO')"`

**Rule 3: NEVER commit secrets**
- ❌ Bad: `git add .env.local`
- ✅ Good: Verify `.gitignore` includes `.env.local` before any `git add`

**Rule 4: Use placeholders in documentation**
- ❌ Bad: `NEXT_PUBLIC_SUPABASE_URL=https://lbttmhwckcrfdymwyuhn.supabase.co`
- ✅ Good: `NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co`

**Rule 5: Read from environment, never hardcode**
- ❌ Bad: `const url = "https://lbttmhwckcrfdymwyuhn.supabase.co"`
- ✅ Good: `const url = process.env.NEXT_PUBLIC_SUPABASE_URL`

### Verification Commands for Agents

**Check if env vars are set** (safe to run):
```bash
# Local development
[ -n "$NEXT_PUBLIC_SUPABASE_URL" ] && echo "✅ Supabase URL set" || echo "❌ Missing"
[ -n "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ] && echo "✅ Anon key set" || echo "❌ Missing"

# Vercel production (via CLI)
vercel env ls
```

**Test Supabase connection** (safe to run):
```bash
curl -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
     "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/vehicle_trims?select=count" \
     2>&1 | grep -q "count" && echo "✅ Connected" || echo "❌ Failed"
```

---

## 5. Tooling Prerequisites

### Required Tools for Pre-commit Hooks

**pnpm** (package manager):
- Installation: `npm install -g pnpm` OR `curl -fsSL https://get.pnpm.io/install.sh | sh -`
- Verify: `pnpm --version` (should output `10.x.x`)

**Python 3** (for docstring checks):
- Installation: `apt install python3` (Ubuntu/WSL) OR `brew install python3` (macOS)
- Verify: `python3 --version` (should output `3.9+`)

**Husky** (git hooks):
- Installation: `pnpm install` (auto-installs via package.json)
- Verify: `.husky/pre-commit` file exists

### Troubleshooting Pre-commit Hook Failures

**Error**: `pnpm: not found`
- **Cause**: pnpm not in PATH when git hook runs
- **Fix**: Install pnpm globally OR use `git commit --no-verify` (emergency only)

**Error**: `python3: not found`
- **Cause**: Python not installed or not in PATH
- **Fix**: Install Python 3.9+ OR disable docstring check temporarily

**Error**: `check:docstrings failed`
- **Cause**: Missing docstrings in modified .py files
- **Fix**: Add docstrings OR run `git commit --no-verify` (if urgent)

---

## 6. Leak Remediation

### If Secrets Are Found in Git History

**DO NOT** just delete the file - secrets remain in git history forever.

**Correct Remediation Steps**:

1. **Rotate the leaked secret immediately**:
   - Supabase: Dashboard → Settings → API → Reset `anon` key
   - Sentry: Settings → Auth Tokens → Revoke → Create new
   - GitHub: Settings → Developer settings → Personal access tokens → Revoke

2. **Scrub git history** (use BFG Repo-Cleaner):
   ```bash
   # Install BFG
   brew install bfg  # macOS
   # OR download from https://rtyley.github.io/bfg-repo-cleaner/

   # Replace secret in ALL commits
   echo "old-secret-value" > secrets.txt
   bfg --replace-text secrets.txt

   # Force push (DANGEROUS - coordinate with team)
   git push --force
   ```

3. **Update all environments with new secret**:
   - `.env.local` (local dev)
   - Vercel Dashboard (production)
   - GitHub Secrets (CI/CD)

### Known Safe Public Information

These values are **safe to commit** (not secrets):
- Supabase project ID: `lbttmhwckcrfdymwyuhn`
- Supabase URL: `https://lbttmhwckcrfdymwyuhn.supabase.co` (public endpoint)
- Sentry project ID: `4510348150177872`
- Sentry DSN: `https://[hash]@o4510320861839361.ingest.de.sentry.io/4510348150177872` (designed to be public)

These values are **NEVER safe to commit** (secrets):
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (JWT token starting with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`)
- `SUPABASE_SERVICE_ROLE_KEY` (JWT token with admin privileges)
- `SENTRY_AUTH_TOKEN` (starts with `sntrys_`)
- `ANTHROPIC_API_KEY` (starts with `sk-ant-`)
- `GEMINI_API_KEY` (starts with `AIzaSy`)
- `GITHUB_TOKEN` (starts with `ghp_` or `github_pat_`)

---

## 7. Checklist for New Agent Sessions

Before starting work, agents MUST verify:

- [ ] `.env.local` exists with required Supabase keys
- [ ] `.gitignore` includes `.env.local` and `.env`
- [ ] `pnpm --version` works (for pre-commit hooks)
- [ ] No secrets in CLAUDE.md, BLACKBOX.md, GEMINI.md
- [ ] No hardcoded URLs/keys in `src/**/*.ts` files

**Quick Verification Script**:
```bash
#!/bin/bash
# Run this at session start

echo "🔍 Security Audit..."

# Check .env.local exists
[ -f .env.local ] && echo "✅ .env.local exists" || echo "❌ Missing .env.local"

# Check gitignore
grep -q "^\.env\.local$" .gitignore && echo "✅ .env.local gitignored" || echo "❌ .env.local NOT ignored"

# Check for leaked secrets in docs
if grep -r "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\\.eyJ" docs/ CLAUDE.md BLACKBOX.md GEMINI.md 2>/dev/null; then
  echo "❌ LEAKED JWT TOKENS FOUND - SCRUB IMMEDIATELY"
else
  echo "✅ No JWT tokens in docs"
fi

# Check pnpm available
command -v pnpm &>/dev/null && echo "✅ pnpm installed" || echo "⚠️  pnpm missing (pre-commit hooks will fail)"

echo "🔍 Audit complete"
```

---

## 8. References

- **Vercel Env Vars**: https://vercel.com/docs/projects/environment-variables
- **Supabase API Docs**: https://supabase.com/docs/guides/api
- **Next.js Env Vars**: https://nextjs.org/docs/app/building-your-application/configuring/environment-variables
- **GitHub Secrets**: https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions
- **BFG Repo-Cleaner**: https://rtyley.github.io/bfg-repo-cleaner/

---

**Last Updated**: 2025-12-23 02:50 UTC
**Maintained By**: CC (Claude Code)
**Version**: 1.0
