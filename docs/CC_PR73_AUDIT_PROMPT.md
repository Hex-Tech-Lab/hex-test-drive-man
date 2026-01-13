# CC: PR#73 Final Audit (10x Prompt)

**CRITICAL ISSUES** (pr:scrape found 3):
1. TypeScript 5.7.3 → 5.5.4 downgrade
2. Lint 130 warnings (2 security errors)
3. Supabase storage bucket verification

**MANDATORY**:
- pnpm typecheck ✅
- pnpm lint --max-warnings=10 (allow minor)
- Manual security review (detect-object-injection)
- Storage bucket RLS policy check
- End-to-end test: /ar/bookings/new?vehicleId=abe7f3bc...

**MERGE CRITERIA**: Bucket 1 after fixes
