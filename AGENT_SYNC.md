# 🔄 Agent Sync Instructions

**Last sync**: 2025-12-21 08:52 UTC
**Branch**: main
**Commit**: c4ce6af

## For KWSL/All Agents

Before starting any work:

```bash
cd ~/hex-test-drive-man
git checkout main
git pull origin main
```

Never work on stale branches. Always pull latest.

## Current State

- ✅ Main branch: c4ce6af (phone whitespace fixes)
- ✅ Production API: Fixed (returns flat booking object)
- ✅ Vercel: Deployed from main branch
- ✅ Feature branch deleted: claude/booking-otp-verification-DHl1R
- ✅ All agents should work from main

## Last Changes

1. **Production Code Fix** (commit 403c915)
   - Fixed API response format
   - Returns `{id, ...}` not `{booking: {...}}`

2. **Phone Whitespace Fix** (commit c4ce6af)
   - Added .trim() to all phone inputs
   - Fixes database lookup/matching
   - No more leading/trailing spaces

## Active PRs

- PR #18: feat/Complete OTP booking system
- PR #13-17: Snyk dependency upgrades

All work should be done from main branch going forward.
