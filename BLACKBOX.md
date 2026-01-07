# BLACKBOX.md - BB Agent Context

**Agent**: BB (Blackbox AI)
**Project**: hex-test-drive-man
**Last Updated**: 2026-01-07

## Current State
- MVP 1.5 (booking system in progress)
- Production: https://hex-test-drive-man.vercel.app
- Stack: Next.js 15 + TypeScript + MUI + Supabase + pnpm

## Recent Work
- PR #41: PERF fixes (reflow, JS, DOM)
- PR #42: MVP roadmap + 6 bugs
- PR #43: Interface bugs (pending)

## Git Sync Protocol
ALWAYS start tasks with:
git fetch origin
git checkout main
git pull origin main
ls -la src/components/

## Never Reinitialize
This project is ESTABLISHED. If src/ exists, DO NOT run create-next-app.
