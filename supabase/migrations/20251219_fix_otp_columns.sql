-- CORRECTED MIGRATION: Fix column names to match code expectations
-- Original migration uses: verification_code, verified_at
-- Code expects: otp, verified
-- This migration fixes the mismatch

-- Step 1: Check if tables exist
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sms_verifications') THEN
        -- Table exists, alter columns
        ALTER TABLE sms_verifications
          RENAME COLUMN verification_code TO otp;

        ALTER TABLE sms_verifications
          ADD COLUMN verified BOOLEAN DEFAULT FALSE;

        RAISE NOTICE 'Altered existing sms_verifications table';
    ELSE
        -- Table doesn't exist, create from scratch
        CREATE TABLE bookings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID,
          vehicle_id UUID NOT NULL,
          test_drive_date TIMESTAMPTZ NOT NULL,
          test_drive_location TEXT NOT NULL,
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
          phone_number TEXT NOT NULL,
          phone_verified BOOLEAN DEFAULT FALSE,
          kyc_verified BOOLEAN DEFAULT FALSE,
          verified_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE sms_verifications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
          phone_number TEXT NOT NULL,
          otp TEXT NOT NULL,
          verified BOOLEAN DEFAULT FALSE,
          expires_at TIMESTAMPTZ NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Add indexes
        CREATE INDEX idx_sms_phone ON sms_verifications(phone_number);
        CREATE INDEX idx_sms_otp ON sms_verifications(otp);
        CREATE INDEX idx_bookings_phone ON bookings(phone_number);

        -- RLS policies
        ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
        ALTER TABLE sms_verifications ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Users can view own bookings" ON bookings
          FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY "Users can create bookings" ON bookings
          FOR INSERT WITH CHECK (true); -- Allow any authenticated user

        CREATE POLICY "Users can view own verifications" ON sms_verifications
          FOR SELECT USING (phone_number IN (
            SELECT phone_number FROM bookings WHERE user_id = auth.uid()
          ));

        RAISE NOTICE 'Created sms_verifications and bookings tables';
    END IF;
END $$;

-- Verify final schema
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name IN ('bookings', 'sms_verifications')
ORDER BY table_name, ordinal_position;
