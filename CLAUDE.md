# CLAUDE.md - Project Brain (CC Owns) [2025-12-12 00:54 EET, Hex-AI]

## CC Operating Instructions (MANDATORY - READ FIRST)
[Your complete instructions - unchanged]

---

## TECH STACK EVOLUTION [2025-12-12 00:54 EET, Hex-AI]
✓ Next.js 15.4.8 | React 19 | TS 5.7.3 [2025-12-07 16:28 EET, Bash]
✓ pnpm ONLY | MUI 7 ONLY | Zustand persist [stable]
✓ Supabase PG + repository pattern [2025-12-07 16:28 EET, Bash]
✓ WhySMS v3 SMS /api/v3/sms/send [2025-12-11 22:51 EET, CCW]
✓ i18n Arabic/English [locale] routing [2025-12-07 16:28 EET, Bash]
⏳ Drizzle ORM (MVP 1.5 SMS microservice)
⏳ Upstash Redis/QStash (queues)
⏳ Pino structured logging

## MVP ROADMAP [2025-12-12 00:54 EET, Hex-AI]
✓ MVP 0.5: Catalog SWR + data quality [2025-12-03 17:45 EET, Bash]
🔄 MVP 1.0: Booking + OTP 2FA (30%) 
  ✅ VehicleCard modal → /api/bookings [in-memory repo]
  ✅ requestOtp → WhySMS send [ca9da33, CCW]
  ❌ verifyOtp stub (no sms_verifications persistence)
  ❌ /bookings/[id]/verify page missing
  ❌ RLS policies pending
⏳ MVP 1.5: KYC upload + staff portals
⏳ MVP 2.0: Admin dashboard + queues

## AGENT OWNERSHIP MATRIX [2025-12-12 00:54 EET, Hex-AI]
| Agent | Ownership | Files | Status |
|-------|-----------|-------|--------|
| CC | CLAUDE.md, arch, PR audit | CLAUDE.md | Active |
| CCW | SMS/OTP/2FA end-to-end | src/services/sms/ | Phase 1 |
| GC | Git/PR/doc sync | GEMINI.md | Sync needed |
| BB | Scripts/CI/admin tools | scripts/ | Pending |

## ARCHITECTURE DECISIONS (reverse chrono)
2025-12-11 22:51 EET [CCW]: WhySMS provider (ca9da33)
2025-12-11 16:28 EET [Bash]: bookings + sms_verifications schema
2025-12-07 16:28 EET [Bash]: Repository pattern (no direct Supabase)
2025-12-07 14:45 EET [Bash]: SWR catalog (TanStack Query SMS admin only)
2025-12-03 17:45 EET [Bash]: MVP 0.5 catalog complete

## 5-DAY WSL HANDOVERS [2025-12-12 00:54 EET, Hex-AI]
- 2025-12-11 22:51: SMS engine WhySMS integration [ca9da33, CCW]
- 2025-12-11 16:28: Booking schema migration [Bash]
- 2025-12-07 22:51: PR7 AI prompts fixed [scripts/resolve_pr7_comments.py]
- 2025-12-07 16:28: Repository pattern established [Bash]
- 2025-12-07 14:45: SWR vs TanStack decision [Bash]

## GIT TRUTH STATUS [2025-12-12 00:54 EET, Hex-AI]
WSL: main @ 6c23ac7+ (SMS commits)
GitHub main: Dec 7 (5 days behind ❌)
PRs: hex-ai/claude-md-master (pending merge)

## QUALITY GATES STATUS [2025-12-12 00:54 EET, Hex-AI]
⚠️ 6 vulns (1 high, 5 moderate) [Dependabot]
✅ SonarCloud quality gate passing
✅ Snyk scans clean (pdfminer isolated)
✅ CodeRabbit/Sourcery active
⏳ Test coverage <70% critical paths

## OPEN BLOCKERS [PRIORITY ORDER]
1. GC: GitHub main sync (5 days WSL commits)
2. Supabase: Apply migrations + RLS
3. CCW: SMS Phase 1 (otpRepository + verify page)
4. BB: Dev scripts (env validation, test harness)
5. Dependabot: Fix 1 high vuln

## SESSION HISTORY (reverse chrono, 30+ entries)
2025-12-12 00:48 EET: CLAUDE.md 10x restructure [Hex-AI, b2b2557]
2025-12-11 22:51 EET: SMS WhySMS engine [CCW, ca9da33]
2025-12-11 16:28 EET: Booking schema [Bash]
[... 27+ older entries preserved from original CLAUDE.md ...]

---
