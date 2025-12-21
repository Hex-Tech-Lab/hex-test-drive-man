-- Add delivery tracking columns to sms_verifications
-- Created: 2025-12-21
-- Purpose: Track SMS delivery status from WhySMS webhook

ALTER TABLE sms_verifications
ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;

-- Add index for efficient phone number + created_at queries
CREATE INDEX IF NOT EXISTS idx_sms_phone_created
ON sms_verifications(phone_number, created_at DESC);

-- Add index for delivery status queries
CREATE INDEX IF NOT EXISTS idx_sms_delivery_status
ON sms_verifications(delivery_status)
WHERE delivery_status != 'delivered';

-- Comment the columns
COMMENT ON COLUMN sms_verifications.delivery_status IS 'WhySMS delivery status: pending, delivered, failed';
COMMENT ON COLUMN sms_verifications.delivered_at IS 'Timestamp when SMS was delivered (from WhySMS webhook)';
