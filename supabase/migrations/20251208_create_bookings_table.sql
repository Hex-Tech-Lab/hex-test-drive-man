-- Migration: Create bookings table (MVP 1.0 - Lead Capture)
-- Created: 2025-12-08
-- Purpose: Staging area for test drive interest before full session booking
-- Funnel: bookings (pre-auth) → test_drive_sessions (post-KYC/payment)

-- ============================================================================
-- Table: bookings
-- ============================================================================
CREATE TABLE public.bookings (
  -- Primary Key
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Customer Information (Pre-Auth - No FK to profiles)
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,

  -- Booking Details
  vehicle_trim_id uuid NOT NULL,
  preferred_date date NOT NULL,
  preferred_time_slot text, -- 'morning', 'afternoon', 'evening', or specific time
  notes text,

  -- Status Tracking
  status text NOT NULL DEFAULT 'pending',

  -- Conversion Tracking
  converted_to_session_id uuid,

  -- Audit Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT bookings_status_check CHECK (
    status IN ('pending', 'confirmed', 'cancelled', 'completed', 'converted_to_session')
  ),
  CONSTRAINT bookings_preferred_date_check CHECK (preferred_date >= CURRENT_DATE),

  -- Foreign Keys
  CONSTRAINT bookings_vehicle_trim_id_fkey
    FOREIGN KEY (vehicle_trim_id)
    REFERENCES public.vehicle_trims(id)
    ON DELETE RESTRICT,

  CONSTRAINT bookings_converted_to_session_id_fkey
    FOREIGN KEY (converted_to_session_id)
    REFERENCES public.test_drive_sessions(id)
    ON DELETE SET NULL
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

-- Status-based queries (admin queue management)
CREATE INDEX idx_bookings_status
  ON public.bookings(status)
  WHERE status IN ('pending', 'confirmed');

-- Vehicle-based analytics
CREATE INDEX idx_bookings_vehicle_trim_id
  ON public.bookings(vehicle_trim_id);

-- Date-range queries (scheduling)
CREATE INDEX idx_bookings_preferred_date
  ON public.bookings(preferred_date);

-- Customer lookup (dedupe, follow-up)
CREATE INDEX idx_bookings_customer_phone
  ON public.bookings(customer_phone);

-- Composite index for admin dashboard (most common query)
CREATE INDEX idx_bookings_status_date
  ON public.bookings(status, preferred_date DESC);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public INSERT (allow unauthenticated lead capture)
CREATE POLICY "Allow public booking creation"
  ON public.bookings
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy 2: Authenticated users can view their own bookings (by phone)
CREATE POLICY "Users can view their own bookings"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (
    customer_phone IN (
      SELECT phone FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Policy 3: Admin full access
CREATE POLICY "Admins have full access to bookings"
  ON public.bookings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'operations_staff')
    )
  );

-- ============================================================================
-- Trigger: Update updated_at timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION update_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bookings_updated_at_trigger
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_bookings_updated_at();

-- ============================================================================
-- Comments for Documentation
-- ============================================================================

COMMENT ON TABLE public.bookings IS 'Lead capture for test drive interest. Converts to test_drive_sessions after KYC/payment.';
COMMENT ON COLUMN public.bookings.status IS 'Lifecycle: pending → confirmed → converted_to_session (or cancelled)';
COMMENT ON COLUMN public.bookings.converted_to_session_id IS 'Links to test_drive_sessions after successful conversion';
COMMENT ON COLUMN public.bookings.preferred_time_slot IS 'Free text or enum: morning/afternoon/evening';

-- ============================================================================
-- Rollback Instructions
-- ============================================================================

-- To rollback this migration:
-- DROP TRIGGER IF EXISTS bookings_updated_at_trigger ON public.bookings;
-- DROP FUNCTION IF EXISTS update_bookings_updated_at();
-- DROP TABLE IF EXISTS public.bookings CASCADE;
