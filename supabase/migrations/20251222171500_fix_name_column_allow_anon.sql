-- Fix bookings table: add name column + allow anonymous bookings
-- Date: 2025-12-22 17:15 EET
-- Issue: Original migration blocked anonymous inserts with auth.uid() = user_id

-- Add name column (idempotent)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS name TEXT;

-- Drop old restrictive policies
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can delete own bookings" ON bookings;

-- Allow anonymous bookings (phone-verified MVP flow)
CREATE POLICY "Anyone can create bookings" ON bookings
  FOR INSERT WITH CHECK (true);

-- Users can read their own bookings (by phone or user_id)
CREATE POLICY "Users can read own bookings" ON bookings
  FOR SELECT USING (
    auth.uid() = user_id
    OR phone_number = current_setting('request.jwt.claims', true)::json->>'phone'
  );

-- Users can update their own bookings
CREATE POLICY "Users can update own bookings" ON bookings
  FOR UPDATE USING (
    auth.uid() = user_id
    OR phone_number = current_setting('request.jwt.claims', true)::json->>'phone'
  );

-- Users can delete their own bookings
CREATE POLICY "Users can delete own bookings" ON bookings
  FOR DELETE USING (auth.uid() = user_id);

-- Add comment
COMMENT ON COLUMN bookings.name IS 'Customer name for test drive booking';
