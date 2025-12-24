# 🚀 OTP Booking System - Deployment Steps

**Status**: Ready for production deployment
**Last Updated**: 2025-12-19
**Agent**: CCW

---

## ✅ CREDENTIALS CONFIGURED

All credentials are now in `.env.local`:

- ✅ Supabase URL + Keys
- ✅ WhySMS API Token (`953|PcKzpzQRCZ0cU8Qf3citNBdctp876myRFfnw0cGp7d57dc41`)
- ✅ Sentry, Anthropic, Gemini keys

**⚠️ CRITICAL**: Never commit `.env.local` to Git (already in `.gitignore`)

---

## 📋 STEP 1: Apply Database Migration (5 min)

### Option A: Supabase Dashboard (RECOMMENDED)

1. **Open Supabase SQL Editor**:
   ```
   https://supabase.com/dashboard/project/lbttmhwckcrfdymwyuhn/sql
   ```

2. **Copy migration content**:
   ```bash
   cat supabase/migrations/20251219_fix_otp_columns.sql
   ```

3. **Paste into SQL Editor and click "Run"**

4. **Verify success**: Should see:
   ```
   Success. 0 rows returned
   NOTICE: Created sms_verifications and bookings tables
   ```

### Option B: Verify Tables Exist (if migration already applied)

```bash
# Check bookings table
curl -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxidHRtaHdja2NyZmR5bXd5dWhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MzYyNzAsImV4cCI6MjA3ODIxMjI3MH0.kw9jPN7GuzTlAims_7B_UEnicaVmGklBiQF9IlVE_I4" \
  "https://lbttmhwckcrfdymwyuhn.supabase.co/rest/v1/bookings?select=count"

# Check sms_verifications table
curl -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxidHRtaHdja2NyZmR5bXd5dWhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MzYyNzAsImV4cCI6MjA3ODIxMjI3MH0.kw9jPN7GuzTlAims_7B_UEnicaVmGklBiQF9IlVE_I4" \
  "https://lbttmhwckcrfdymwyuhn.supabase.co/rest/v1/sms_verifications?select=count"
```

**Expected**: `[{"count": 0}]` for both (empty tables, but they exist)

---

## 📋 STEP 2: Test Local Development (5 min)

### Start Dev Server

```bash
cd /home/user/hex-test-drive-man
pnpm dev
```

**Expected output**:
```
▲ Next.js 15.4.10
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in 2.3s
```

### Manual Test Flow

1. **Open**: http://localhost:3000
2. **Click**: Any vehicle card → "Book Test Drive"
3. **Fill form**:
   - Name: Test User
   - Email: test@example.com
   - Phone: +20XXXXXXXXXX (use your actual phone)
   - Date: Tomorrow
4. **Submit** → Should redirect to `/bookings/{id}/verify`
5. **Check SMS**: You should receive 6-digit OTP
6. **Enter OTP** → Submit → Should mark booking as verified

---

## 📋 STEP 3: Verify Database Records (2 min)

After testing, check data was saved:

```bash
# View bookings
curl -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxidHRtaHdja2NyZmR5bXd5dWhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MzYyNzAsImV4cCI6MjA3ODIxMjI3MH0.kw9jPN7GuzTlAims_7B_UEnicaVmGklBiQF9IlVE_I4" \
  "https://lbttmhwckcrfdymwyuhn.supabase.co/rest/v1/bookings?select=*&limit=5"

# View OTP records
curl -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxidHRtaHdja2NyZmR5bXd5dWhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MzYyNzAsImV4cCI6MjA3ODIxMjI3MH0.kw9jPN7GuzTlAims_7B_UEnicaVmGklBiQF9IlVE_I4" \
  "https://lbttmhwckcrfdymwyuhn.supabase.co/rest/v1/sms_verifications?select=*&limit=5"
```

**Expected**: JSON with your test booking and OTP

---

## 📋 STEP 4: Deploy to Vercel (10 min)

### Set Environment Variables

1. **Open Vercel Dashboard**:
   ```
   https://vercel.com/hex-tech-lab/hex-test-drive-man/settings/environment-variables
   ```

2. **Add these variables** (copy from `.env.local`):

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://lbttmhwckcrfdymwyuhn.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxidHRtaHdja2NyZmR5bXd5dWhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MzYyNzAsImV4cCI6MjA3ODIxMjI3MH0.kw9jPN7GuzTlAims_7B_UEnicaVmGklBiQF9IlVE_I4
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxidHRtaHdja2NyZmR5bXd5dWhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjYzNjI3MCwiZXhwIjoyMDc4MjEyMjcwfQ.vOteqNu-oD_10NRasipllTewUETEjiMsyCFetA3UzW8
   WHYSMS_API_URL=https://bulk.whysms.com/api/v3/
   WHYSMS_API_TOKEN=953|PcKzpzQRCZ0cU8Qf3citNBdctp876myRFfnw0cGp7d57dc41
   ```

   **Set for**: Production, Preview, Development (all environments)

3. **Redeploy**:
   ```bash
   git push origin claude/booking-otp-verification-DHl1R
   ```

4. **Wait for build** (~2 min)

5. **Test production**: Visit your Vercel URL and repeat Step 2 manual test

---

## ✅ SUCCESS CRITERIA

All should pass:

- [ ] Migration applied (no SQL errors)
- [ ] Local dev server starts without errors
- [ ] Booking form submits successfully
- [ ] SMS arrives with 6-digit OTP
- [ ] OTP verification works
- [ ] Database shows booking + sms_verification records
- [ ] Vercel production deployment green
- [ ] Production booking flow works end-to-end

---

## 🐛 Troubleshooting

### SMS not arriving

**Check WhySMS balance**:
```
https://bulk.whysms.com/dashboard
```

**Test SMS manually**:
```bash
curl -X POST https://bulk.whysms.com/api/v3/sms/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 953|PcKzpzQRCZ0cU8Qf3citNBdctp876myRFfnw0cGp7d57dc41" \
  -d '{
    "recipient": "+20XXXXXXXXXX",
    "sender_id": "ORDER",
    "message": "Test: Your OTP is 123456"
  }'
```

**Expected**: `{"status": "success"}` or similar

### Database errors

**Check table exists**:
```
https://supabase.com/dashboard/project/lbttmhwckcrfdymwyuhn/editor
```

Click "bookings" and "sms_verifications" in left sidebar - should show table structure

### Build errors

**Check logs**:
```bash
pnpm build
```

If TypeScript errors, fix and commit before deploying

---

## 📊 Performance Metrics

**Expected timings**:
- Migration: ~10 seconds
- Local test: ~2 minutes
- Vercel deploy: ~2 minutes
- **Total**: ~15 minutes from start to production

---

## 🔒 Security Notes

**Before public launch**:

1. Rotate all API keys (Supabase, WhySMS, Anthropic, Gemini)
2. Enable Supabase RLS on all tables (already done in migration)
3. Add rate limiting to booking endpoint
4. Review Sentry error budget (<0.1% error rate)
5. Add CAPTCHA to booking form (prevent spam)

**Current state**: Development credentials, safe for testing only

---

**Questions? Check**:
- `docs/COMPLETE_SESSION_REPORT_20251219.md` - Full implementation details
- `docs/CCW_SESSION_REPORT_20251219_1030.md` - OTP system architecture
- `WHYSMS_FIX_CHECKLIST.md` - Original fix documentation
