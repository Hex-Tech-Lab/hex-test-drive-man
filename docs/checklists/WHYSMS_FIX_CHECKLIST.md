# 🔴 WHYSMS SMS FIX - IMMEDIATE ACTION CHECKLIST

**Created**: 2025-12-18 14:05 UTC
**Agent**: CC
**Status**: CODE FIXED ✅ | DEPLOYMENT PENDING ⏳

---

## ✅ COMPLETED (Just Now)

### 1. Fixed Critical Type Mismatch Bug
**File**: `src/services/sms/engine.ts`
**Commit**: `946c2ea`
**Branch**: `claude/verify-image-downloads-DHl1R`

**What was fixed**:
- `sendSms()` returns boolean, code expected object
- Removed `res.success` check (was always undefined)
- Now correctly checks `!smsSent` boolean value

**Result**: SMS code will now execute properly

---

## ⏳ ACTION REQUIRED (You Must Do)

### 2. Set WHYSMS_API_TOKEN in Vercel (2 min)

**Go to**: https://vercel.com/hex-tech-lab/hex-test-drive-man/settings/environment-variables

**Add**:
```
Name:  WHYSMS_API_TOKEN
Value: [your WhySMS token]
```

**Apply to**: All environments (Production, Preview, Development)

---

### 3. Fix Database Schema (2 min)

**Run this SQL in Supabase**:

```sql
-- Connect to Supabase SQL Editor
-- https://supabase.com/dashboard/project/lbttmhwckcrfdymwyuhn/sql

-- Rename column to match code
ALTER TABLE sms_verifications
  RENAME COLUMN verification_code TO otp;

-- Add verified boolean column
ALTER TABLE sms_verifications
  ADD COLUMN verified BOOLEAN DEFAULT FALSE;

-- Verify columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'sms_verifications'
ORDER BY ordinal_position;
```

**Expected output**:
```
id              | uuid
booking_id      | uuid
phone_number    | text
otp             | text          ← renamed from verification_code
verified_at     | timestamptz
expires_at      | timestamptz
created_at      | timestamptz
verified        | boolean       ← newly added
```

---

### 4. Deploy to Vercel (3 min)

**Option A: Merge PR**
1. Go to: https://github.com/Hex-Tech-Lab/hex-test-drive-man/pull/new/claude/verify-image-downloads-DHl1R
2. Create PR
3. Merge to main
4. Vercel auto-deploys

**Option B: Manual Deploy**
1. Push to main branch
2. Vercel auto-deploys
3. Check deployment status

---

### 5. Test SMS Flow (2 min)

**After deployment**:

1. Go to live site: https://hex-test-drive-man.vercel.app
2. Click "Book Test Drive" on any vehicle
3. Enter YOUR phone number: `+201XXXXXXXXX`
4. Click "Send OTP"
5. **Check phone for SMS**

**Expected SMS**:
```
Your Hex Test Drive code is 123456. It expires in 5 minutes.
```

---

### 6. Check Vercel Logs (1 min)

**Go to**: https://vercel.com/hex-tech-lab/hex-test-drive-man

**Check for**:
- ✅ `[WhySMS] Sending to +201XXXXXXXXX`
- ✅ `[WhySMS] Response (XXXms): {...}`
- ✅ `[OTP_REQUEST] { phone: ..., code: ..., smsSent: true }`

**Look for errors**:
- ❌ `WHYSMS_API_TOKEN is not defined`
- ❌ `column "otp" does not exist`
- ❌ `401 Unauthorized`

---

## 🔍 VERIFICATION

### What Should Happen Now:

1. **SMS Send**: WhySMS API receives request
2. **Database**: OTP stored in `sms_verifications` table
3. **User Phone**: Receives SMS with 6-digit code
4. **Vercel Logs**: Shows success messages

### If SMS Still Doesn't Arrive:

**Check Vercel logs for**:
1. `WHYSMS_API_TOKEN is not defined` → Set env var
2. `401 Unauthorized` → Token is wrong
3. `column "otp" does not exist` → Run SQL migration
4. `Failed to store OTP` → Check Supabase connection

**Check WhySMS Dashboard**:
1. Go to: https://bulk.whysms.com
2. Check API logs
3. Verify account balance
4. Check sender_id "ORDER" is registered

---

## 📊 TESTING CHECKLIST

- [ ] Vercel env var `WHYSMS_API_TOKEN` is set
- [ ] Supabase SQL migration applied (otp + verified columns)
- [ ] Code deployed to Vercel
- [ ] Booking form opens
- [ ] Phone number entered
- [ ] "Send OTP" button works
- [ ] Vercel logs show `[WhySMS] Sending...`
- [ ] Vercel logs show `[OTP_REQUEST] smsSent: true`
- [ ] SMS arrives on phone (within 30 seconds)
- [ ] OTP code appears in `sms_verifications` table
- [ ] OTP verification works (future step)

---

## 🚀 SUMMARY

**What CC Fixed** (Code):
- ✅ Type mismatch in `engine.ts`
- ✅ Boolean check now correct
- ✅ Pushed to GitHub

**What You Need to Do** (Infrastructure):
1. Set `WHYSMS_API_TOKEN` in Vercel (2 min)
2. Run SQL migration in Supabase (2 min)
3. Deploy to Vercel (auto on merge)
4. Test with your phone (2 min)

**Total Time**: 10 minutes

---

## 📞 EXPECTED RESULT

After completing steps 2-5:

```
User clicks "Send OTP"
  ↓
Frontend calls requestBookingOtp()
  ↓
Backend sends to WhySMS API
  ↓
WhySMS delivers SMS
  ↓
User receives: "Your Hex Test Drive code is 123456..."
  ↓
OTP row created in sms_verifications table
  ↓
✅ SUCCESS
```

---

**Next Steps After SMS Works**:
1. Implement OTP verification UI
2. Complete booking flow
3. Add rate limiting
4. Add retry logic

**Files Modified**:
- `src/services/sms/engine.ts` (fixed)
- `docs/EMERGENCY_SMS_DEBUG_2025-12-18_1400_CC.md` (analysis)
- `WHYSMS_FIX_CHECKLIST.md` (this file)

**Commits**:
- `946c2ea` - Critical SMS fix
- `e3167e3` - Debug analysis

**Agent**: CC
**Status**: Ready for deployment
