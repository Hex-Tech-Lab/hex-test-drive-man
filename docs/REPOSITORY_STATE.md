# Repository State Audit
**Date**: 2025-12-08

## Active Integration Branch
**feature/gpg-commit-signing-20251124-1401**
Contains:
*   Latest docs (CLAUDE.md, GEMINI.md)
*   Next.js 15.2.6 (CVE fix)
*   UI fixes

## PR Status
| # | Title | Base | Head | Status |
|---|---|---|---|---|
| 1 | Sync Nov 8-24: Schema Enhancement + Brand Logos + CI/CD | main | feature/sync-nov8-24-complete-work | Open (Stale) |
| 2 | docs: Add GPG commit signing setup guide | main | feature/gpg-commit-signing-20251124-1401 | Open (Active) |
| 3 | feat: vehicle hero/hover images (Task 0) | feature/gpg-commit-signing-20251124-1401 | claude/add-vehicle-images-01NSbdxDBV46zFzfBtQM1oLQ | Open (Active) |
| 4 | feat: booking MVP 1.0 | feature/gpg-commit-signing-20251124-1401 | claude/booking-system-mvp-0189g3iqbGjjpKDJWbRpMfu8 | Open (Active) |
| 5 | 📝 Add docstrings to `claude/booking-system-mvp-0189g3iqbGjjpKDJWbRpMfu8` | claude/booking-system-mvp-0189g3iqbGjjpKDJWbRpMfu8 | coderabbitai/docstrings/acd34cf | Open (Review) |

## Branch Inventory
*   **Active:** `feature/gpg-commit-signing-20251124-1401`, `claude/booking-system-mvp-0189g3iqbGjjpKDJWbRpMfu8`, `claude/add-vehicle-images-01NSbdxDBV46zFzfBtQM1oLQ`.
*   **Stale (Candidates for Deletion):** `origin/feature/sync-nov8-24-complete-work`, `origin/feature/add-agents-md-and-project-setup`, `origin/fix/hotfix-venue-query`.

## Merge Plan
1.  Review and merge PR #5 into #4.
2.  Merge PR #4 (Booking) and PR #3 (Images) into Integration (`feature/gpg...`).
3.  Merge Integration (PR #2) into `main`.

## Security Audit
*   `.env` files are git-ignored and not tracked.
*   No API keys found in recent commit history (placeholders only).
