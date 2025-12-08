# Database Schema Audit Report
**Date**: 2025-12-08  
**Auditor**: AI Assistant (Task C)  
**Project**: GetMyTestDrive.com (hex-test-drive-man)  
**Status**: Post-Consolidation Analysis

---

## Executive Summary

### Current State
✅ **Next.js Version**: 15.2.6 (CVE-2025-66478 patched)  
✅ **Booking MVP**: Merged (commit 9f5ae6f)  
✅ **Active PRs**: 1 (PR #7 - PDF extraction engine)  
⚠️ **Schema Status**: TypeScript types exist, but **NO LIVE DATABASE SCHEMA FOUND**

### Critical Finding
**🚨 BLOCKER: No Supabase schema migrations or DDL files exist in repository**

The codebase contains:
- ✅ TypeScript type definitions (`src/types/vehicle.ts`)
- ✅ Repository layer with queries (`src/repositories/vehicleRepository.ts`)
- ✅ SQL insert statements (`pdfs/vehicles_comprehensive_inserts.sql`)
- ❌ **NO CREATE TABLE statements for production schema**
- ❌ **NO migration files**
- ❌ **NO schema.sql or init.sql**

---

## Schema Analysis

### 1. TypeScript Type Definitions (`src/types/vehicle.ts`)

**Last Updated**: 2025-11-09

#### Core Tables Implied by Types

| Table Name | Purpose | Key Fields | Status |
|------------|---------|------------|--------|
| `vehicle_trims` | Main vehicle data | id, trim_name, model_year, price_egp | ⚠️ DDL Missing |
| `brands` | Manufacturer brands | name, logo_url | ⚠️ DDL Missing |
| `models` | Vehicle models | name, hero_image_url, hover_image_url | ⚠️ DDL Missing |
| `categories` | Vehicle categories | name | ⚠️ DDL Missing |
| `transmissions` | Transmission types | name | ⚠️ DDL Missing |
| `fuel_types` | Fuel types | name | ⚠️ DDL Missing |
| `body_styles` | Body styles | name_en, name_ar, icon_url | ⚠️ DDL Missing |
| `segments` | Market segments | code, name_en, price_min_egp, price_max_egp | ⚠️ DDL Missing |
| `countries` | Countries of origin | name_en, name_ar, iso_code, flag_url | ⚠️ DDL Missing |
| `agents` | Authorized dealers | name_en, name_ar, logo_url, website_url | ⚠️ DDL Missing |
| `venues` | Test drive locations | id, name, address | ⚠️ DDL Missing |
| `venue_trims` | Vehicle availability at venues | vehicle_trim_id, venue_id, is_available | ⚠️ DDL Missing |
| `vehicle_images` | Vehicle photos | image_url, display_order, is_primary, image_type | ⚠️ DDL Missing |

#### Booking System Tables (from merged PR #4)
| Table Name | Purpose | Status |
|------------|---------|--------|
| `bookings` | Test drive bookings | ⚠️ DDL Missing |
| `booking_status` | Booking workflow states | ⚠️ DDL Missing |
| `time_slots` | Available booking times | ⚠️ DDL Missing |

---

### 2. Repository Layer Analysis (`src/repositories/vehicleRepository.ts`)

#### Query Patterns Used

```typescript
// Main query structure
const VEHICLE_SELECT = `
  id, trim_name, model_year, price_egp, engine, seats,
  horsepower, torque_nm, acceleration_0_100, top_speed,
  fuel_consumption, features, placeholder_image_url,
  trim_count, is_imported, is_electric, is_hybrid,
  models!inner(name, hero_image_url, hover_image_url,
    brands!inner(name, logo_url)
  ),
  categories(name),
  transmissions(name),
  fuel_types(name),
  body_styles(name_en, name_ar, icon_url),
  segments(code, name_en, name_local),
  countries(name_en, name_ar, flag_url),
  agents(name_en, name_ar, logo_url),
  venue_trims(venues(id, name)),
  vehicle_images(image_url, display_order, is_primary, image_type)
`;
```

#### Foreign Key Relationships Implied

```
vehicle_trims
├── model_id → models.id
│   └── brand_id → brands.id
├── category_id → categories.id
├── transmission_id → transmissions.id
├── fuel_type_id → fuel_types.id
├── body_style_id → body_styles.id
├── segment_id → segments.id
├── country_of_origin_id → countries.id
└── agent_id → agents.id

venue_trims
├── vehicle_trim_id → vehicle_trims.id
└── venue_id → venues.id

vehicle_images
└── vehicle_trim_id → vehicle_trims.id (implied, not in type)
```

---

### 3. Data Availability (`pdfs/vehicles_comprehensive_inserts.sql`)

**Source**: 80 official manufacturer PDFs  
**Generated**: 2025-11-26  
**Status**: Ready for import (INSERT statements only)

#### Sample Structure
```sql
INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (...)
```

⚠️ **Issue**: This SQL targets a `vehicles` table that doesn't match the TypeScript `vehicle_trims` schema.

---

## Schema Gaps & Discrepancies

### Gap 1: Missing DDL Files
**Severity**: 🔴 CRITICAL

**Problem**: No CREATE TABLE statements exist for:
- Core tables (vehicle_trims, brands, models, etc.)
- Booking system tables (bookings, booking_status, time_slots)
- Junction tables (venue_trims)
- Supporting tables (vehicle_images)

**Impact**: 
- Cannot recreate database from scratch
- No version control for schema changes
- Deployment to new environments impossible

**Recommendation**: Create comprehensive `schema.sql` with all DDL statements

---

### Gap 2: Table Name Mismatch
**Severity**: 🟡 MEDIUM

**Problem**: 
- TypeScript types reference `vehicle_trims` table
- SQL inserts target `vehicles` table
- Unclear which is the actual production table name

**Impact**: Data import will fail if table names don't match

**Recommendation**: 
1. Confirm production table name with database admin
2. Update either TypeScript types OR SQL inserts to match
3. Document naming convention in CLAUDE.md

---

### Gap 3: Missing Booking Schema
**Severity**: 🟡 MEDIUM

**Problem**: Booking MVP merged (PR #4, commit 9f5ae6f) but no schema found

**Expected Tables** (based on typical booking systems):
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_trim_id UUID REFERENCES vehicle_trims(id),
  venue_id UUID REFERENCES venues(id),
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_time TIME NOT NULL,
  status_id UUID REFERENCES booking_status(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE booking_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL, -- pending, confirmed, cancelled, completed
  name_en VARCHAR(100) NOT NULL,
  name_ar VARCHAR(100) NOT NULL,
  display_order INT
);

CREATE TABLE time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id),
  day_of_week INT CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_bookings INT DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE
);
```

**Impact**: Booking feature cannot function without these tables

**Recommendation**: 
1. Check if booking tables exist in Supabase dashboard
2. If yes, export DDL and add to repository
3. If no, create tables based on booking MVP code requirements

---

### Gap 4: Missing Indexes
**Severity**: 🟢 LOW (Performance)

**Problem**: No index definitions found

**Expected Indexes**:
```sql
-- Performance indexes
CREATE INDEX idx_vehicle_trims_model_id ON vehicle_trims(model_id);
CREATE INDEX idx_vehicle_trims_price ON vehicle_trims(price_egp);
CREATE INDEX idx_vehicle_trims_year ON vehicle_trims(model_year);
CREATE INDEX idx_models_brand_id ON models(brand_id);
CREATE INDEX idx_venue_trims_vehicle ON venue_trims(vehicle_trim_id);
CREATE INDEX idx_venue_trims_venue ON venue_trims(venue_id);
CREATE INDEX idx_bookings_status ON bookings(status_id);
CREATE INDEX idx_bookings_date ON bookings(preferred_date);

-- Full-text search indexes (if needed)
CREATE INDEX idx_vehicle_search ON vehicle_trims 
  USING gin(to_tsvector('english', trim_name || ' ' || COALESCE(engine, '')));
```

**Impact**: Slow queries on large datasets

**Recommendation**: Add indexes after schema creation, benchmark query performance

---

### Gap 5: Missing Constraints
**Severity**: 🟡 MEDIUM (Data Integrity)

**Problem**: No CHECK constraints, UNIQUE constraints, or triggers documented

**Expected Constraints**:
```sql
-- Data validation
ALTER TABLE vehicle_trims 
  ADD CONSTRAINT chk_price_positive CHECK (price_egp > 0),
  ADD CONSTRAINT chk_year_valid CHECK (model_year BETWEEN 2020 AND 2030),
  ADD CONSTRAINT chk_seats_valid CHECK (seats BETWEEN 2 AND 9);

-- Unique constraints
ALTER TABLE brands ADD CONSTRAINT uq_brand_name UNIQUE (name);
ALTER TABLE models ADD CONSTRAINT uq_model_name_brand UNIQUE (name, brand_id);
ALTER TABLE categories ADD CONSTRAINT uq_category_name UNIQUE (name);

-- Referential integrity
ALTER TABLE vehicle_trims 
  ADD CONSTRAINT fk_model FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
```

**Impact**: Risk of invalid data, duplicate entries

**Recommendation**: Add constraints in migration file after initial data import

---

## Type Safety Analysis

### TypeScript → Database Mapping

| TypeScript Type | Database Type | Nullable | Notes |
|----------------|---------------|----------|-------|
| `string` | `VARCHAR` / `TEXT` | Varies | Max length not enforced in TS |
| `number` | `INTEGER` / `DECIMAL` | Varies | No precision specified |
| `boolean` | `BOOLEAN` | No | Defaults needed |
| `string[]` | `TEXT[]` / `JSONB` | Yes | Array vs JSON decision needed |
| `Date` | `TIMESTAMP` / `DATE` | Varies | Timezone handling unclear |

### Nullability Mismatches

**TypeScript allows `null`** for:
- `categories`, `transmissions`, `fuel_types` (should be required?)
- `body_styles`, `countries`, `agents` (should be required?)
- `venue_trims`, `vehicle_images` (OK - optional relations)

**Recommendation**: Review business rules and add `NOT NULL` constraints where appropriate

---

## Data Migration Status

### Available Data Sources

1. **PDF Extraction** (80 vehicles)
   - File: `pdfs/vehicles_comprehensive_inserts.sql`
   - Status: ✅ Ready (INSERT statements)
   - Issue: ⚠️ Targets wrong table name (`vehicles` vs `vehicle_trims`)

2. **CSV Data** (mentioned in CLAUDE.md)
   - Volume Leaders: 32 models
   - Challengers: 33 models
   - Premium Leaders: 27 models
   - Status: ❓ Location unknown, not found in repo

3. **Booking Data**
   - Status: ❓ Unknown if test data exists

### Migration Sequence (Recommended)

```sql
-- 1. Create lookup tables (no dependencies)
CREATE TABLE brands (...);
CREATE TABLE categories (...);
CREATE TABLE transmissions (...);
CREATE TABLE fuel_types (...);
CREATE TABLE body_styles (...);
CREATE TABLE segments (...);
CREATE TABLE countries (...);
CREATE TABLE agents (...);
CREATE TABLE venues (...);
CREATE TABLE booking_status (...);

-- 2. Create main tables (with FKs)
CREATE TABLE models (...);
CREATE TABLE vehicle_trims (...);

-- 3. Create junction/child tables
CREATE TABLE venue_trims (...);
CREATE TABLE vehicle_images (...);
CREATE TABLE time_slots (...);
CREATE TABLE bookings (...);

-- 4. Insert lookup data
INSERT INTO categories (name) VALUES ('Sedan'), ('SUV'), ('Hatchback'), ...;
INSERT INTO booking_status (code, name_en, name_ar) VALUES 
  ('pending', 'Pending', 'قيد الانتظار'),
  ('confirmed', 'Confirmed', 'مؤكد'),
  ...;

-- 5. Import vehicle data (after fixing table name)
-- Run pdfs/vehicles_comprehensive_inserts.sql (modified)

-- 6. Add indexes and constraints
CREATE INDEX ...;
ALTER TABLE ... ADD CONSTRAINT ...;
```

---

## Environment Configuration

### Supabase Connection

**File**: `src/lib/supabase.ts`  
**Status**: ✅ Configured

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Environment Variables Required**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Verification Needed**:
- [ ] Check `.env.local` exists and has valid credentials
- [ ] Test connection with `supabase status` or API call
- [ ] Verify RLS (Row Level Security) policies if enabled

---

## Recommendations

### Immediate Actions (Priority 1)

1. **Export Current Schema from Supabase**
   ```bash
   # If Supabase CLI is installed
   supabase db dump --schema public > supabase/schema.sql
   
   # Or manually via Supabase Dashboard:
   # Settings → Database → Schema → Export
   ```

2. **Create Schema Documentation**
   - Document all tables, columns, types, constraints
   - Add ER diagram (use dbdiagram.io or similar)
   - Include sample data for each table

3. **Fix Table Name Mismatch**
   - Confirm: Is production table `vehicles` or `vehicle_trims`?
   - Update TypeScript types OR SQL inserts accordingly
   - Test data import on staging environment

4. **Verify Booking Schema**
   - Check if booking tables exist in Supabase
   - If missing, create DDL based on booking MVP code
   - Test booking flow end-to-end

### Short-term Actions (Priority 2)

5. **Add Migration System**
   - Use Supabase migrations: `supabase migration new <name>`
   - Or use a tool like Prisma, Drizzle, or TypeORM
   - Version control all schema changes

6. **Add Seed Data Scripts**
   - Create `supabase/seed.sql` with lookup table data
   - Include test venues, categories, segments
   - Document seed data in README

7. **Type Safety Improvements**
   - Generate TypeScript types from database schema
   - Use `supabase gen types typescript` or Prisma
   - Add Zod schemas for runtime validation

8. **Add Database Tests**
   - Test foreign key constraints
   - Test unique constraints
   - Test RLS policies (if enabled)

### Long-term Actions (Priority 3)

9. **Performance Optimization**
   - Add indexes based on query patterns
   - Implement database query monitoring (Sentry, Supabase logs)
   - Consider materialized views for complex queries

10. **Data Governance**
    - Document data retention policies
    - Add soft delete (deleted_at) columns if needed
    - Implement audit logging for bookings

11. **Backup & Recovery**
    - Set up automated backups (Supabase handles this)
    - Document restore procedures
    - Test disaster recovery plan

---

## Next Steps

### For User Review

**Question 1**: Does the Supabase database already have tables created?
- If YES → Export schema and add to repo
- If NO → Create schema from TypeScript types

**Question 2**: What is the correct table name?
- `vehicles` (as in SQL inserts)
- `vehicle_trims` (as in TypeScript types)
- Something else?

**Question 3**: Are booking tables live in production?
- If YES → Export DDL
- If NO → Create from booking MVP requirements

**Question 4**: Priority for next task?
- A) Create complete schema.sql file
- B) Fix table name mismatch and test data import
- C) Verify booking system schema
- D) Other (specify)

---

## Appendix: File Inventory

### Schema-Related Files Found

| File | Purpose | Status |
|------|---------|--------|
| `src/types/vehicle.ts` | TypeScript type definitions | ✅ Complete |
| `src/repositories/vehicleRepository.ts` | Database query layer | ✅ Complete |
| `supabase/check_categories.sql` | Category seed data | ✅ Complete |
| `pdfs/vehicles_comprehensive_inserts.sql` | Vehicle data inserts | ⚠️ Table name issue |

### Schema-Related Files Missing

| File | Purpose | Priority |
|------|---------|----------|
| `supabase/schema.sql` | Complete DDL | 🔴 CRITICAL |
| `supabase/migrations/*.sql` | Schema version history | 🔴 CRITICAL |
| `supabase/seed.sql` | Lookup table data | 🟡 MEDIUM |
| `docs/ER_DIAGRAM.md` | Visual schema documentation | 🟢 LOW |
| `supabase/indexes.sql` | Performance indexes | 🟢 LOW |

---

**End of Schema Audit Report**

*Generated by AI Assistant on 2025-12-08*  
*Next Review: After schema creation/export*
