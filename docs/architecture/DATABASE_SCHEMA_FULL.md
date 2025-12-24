# Database Schema (Complete)

Version: 2.4.0 | Last Updated: 2025-12-24 | Maintained By: CC

Provider: Supabase PostgreSQL
Total Tables: 46+ (schema audit + migrations)
Last Verified: 2025-12-14 20:00 UTC via Supabase REST API

## Verified Row Counts

| Table | Count | Last Verified | Artifact Claim | Variance |
|-------|-------|---------------|----------------|----------|
| vehicle_trims | 409 | 2025-12-14 20:00 UTC | 384 / 0 / 80 | +25 vs 384 |
| brands | 95 | 2025-12-14 20:00 UTC | 93 | +2 brands |
| agents | 20 | 2025-12-14 20:00 UTC | 20 | ✅ Match |
| agent_brands | 45 | 2025-12-14 20:00 UTC | 45 | ✅ Match |
| models | 199 | 2025-12-14 20:00 UTC | 58 | +141 models |
| segments | 6 | 2025-12-14 20:00 UTC | 6 | ✅ Match |

**Critical Finding** [2025-12-13 17:10 UTC, CC]:
- Dec 2 THOS claimed: "vehicle_trims table is empty" (0 rows)
- Current reality: 409 rows exist
- Conclusion: Data import occurred between Dec 2-13, 2025
- Impact: Production catalog should be functional (not showing 0 vehicles)

## Core Inventory System (13 tables)

**vehicle_trims** - Main catalog (409 rows, 27 columns)
- Fields per VEHICLE_SELECT constant (vehicleRepository.ts:22-46):
  - id, trim_name, model_year, price_egp
  - engine, horsepower, torque_nm, seats
  - ground_clearance_mm, wheelbase_mm, clutch_type
  - fuel_consumption, features, placeholder_image_url
  - trim_count, is_imported, is_electric, is_hybrid
- FK Relationships:
  - model_id → models.id → brands.id (nested inner join)
  - category_id → categories.id
  - transmission_id → transmissions.id
  - fuel_type_id → fuel_types.id
  - body_style_id → body_styles.id
  - segment_id → segments.id
  - country_of_origin_id → countries.id
  - agent_id → agents.id

**brands** (95 rows)
- Fields: name, logo_url
- Brand Logos: Populated with official assets (per TRAE v1.2)

**models** (199 rows)
- Fields: name, hero_image_url, hover_image_url, brand_id FK

**agents** (20 rows - Egyptian distributors)
- Fields: name_en, name_ar, logo_url, website_url

**agent_brands** (45 rows - relationships)
- Schema: 14 columns (per TRAE v1.2 artifact)
- Purpose: Track distributor types (OEM subsidiary, joint venture, master distributor)
- Includes: Deal metadata, local assembly flags

**segments** (6 rows - Egyptian price tiers)
- Entry-Level: ≤800K EGP
- Budget: 800K-1.2M EGP
- Mid-Range: 1.2M-1.8M EGP
- Premium: 1.8M-3.5M EGP
- Luxury: 3.5M-8M EGP
- Supercar: >8M EGP

**Other Lookup Tables**:
- categories, transmissions, fuel_types, body_styles
- countries (with flags), venues (test drive locations)
- venue_trims (junction: vehicle-venue availability)
- vehicle_images (photos with display_order, is_primary, image_type)

## Booking System (MIGRATION NOT APPLIED)

**File**: supabase/migrations/20251211_booking_schema.sql (30 lines, dated 2025-12-11)

**Tables Defined but NOT in Production** [Verified 2025-12-14 20:00 UTC]:

**bookings**:

```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL,
  test_drive_date TIMESTAMPTZ NOT NULL,
  test_drive_location TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  kyc_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Verification Error**: Could not find table 'public.bookings' (Supabase hint: "Perhaps you meant 'public.banks'")

**sms_verifications**:

```sql
CREATE TABLE sms_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  verification_code TEXT NOT NULL,
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Verification Error**: Could not find table 'public.sms_verifications' (Supabase hint: "Perhaps you meant 'public.test_drive_sessions'")

**RLS Policies Defined**:

```sql
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
```

**Status**: Defined in migration file but RLS NOT enabled on sms_verifications

**User Requirements** [2025-12-13, User]:
1. OTP system: Structure tables for future microservice spin-off (no separate DB yet if complexity high)
2. RLS: Enable on EVERYTHING
3. KYC system: Same philosophy (independent, reusable)

**ACTION REQUIRED**:

```bash
# Apply migration:
psql $SUPABASE_URL < supabase/migrations/20251211_booking_schema.sql

# Add missing RLS to sms_verifications:
ALTER TABLE sms_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own verifications"
  ON sms_verifications FOR SELECT
  USING (phone_number = current_setting('request.jwt.claims')::json->>'phone');
```

## Egyptian Market Specifics

**Critical Specs** (per artifacts + user context):
- Ground clearance: 170mm+ required (poor roads, potholes)
- Clutch type: Wet DCT preferred over dry (extreme heat 45°C + traffic)
- AC zones: Multi-zone essential (single-zone insufficient for rear passengers in summer)
- Wheelbase: Tight parking consideration
- Diesel vs Petrol: Diesel heavily subsidized (3 EGP/L vs 11 EGP/L petrol)

**Warranty Variations**:
- Same brand: 3yr Egypt vs 5yr UAE
- Affects Total Cost of Ownership (TCO) calculations
