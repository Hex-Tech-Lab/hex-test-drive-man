-- ADD MISSING COLUMNS TO EXISTING TABLES
-- Issue: bookings.phone_verified and sms_verifications.booking_id don't exist
-- This migration adds them without dropping/recreating tables

BEGIN;

-- Add phone_verified to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;

-- Add booking_id to sms_verifications table
ALTER TABLE sms_verifications
ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_sms_booking ON sms_verifications(booking_id);

-- Verify columns added
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'bookings' AND column_name = 'phone_verified'
    ) THEN
        RAISE NOTICE '✓ bookings.phone_verified exists';
    ELSE
        RAISE EXCEPTION '✗ bookings.phone_verified MISSING';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'sms_verifications' AND column_name = 'booking_id'
    ) THEN
        RAISE NOTICE '✓ sms_verifications.booking_id exists';
    ELSE
        RAISE EXCEPTION '✗ sms_verifications.booking_id MISSING';
    END IF;
END $$;

COMMIT;

-- Display final schema
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('bookings', 'sms_verifications')
ORDER BY table_name, ordinal_position;
