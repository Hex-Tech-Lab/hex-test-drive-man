# Database Migration Safety Protocol

**Version**: 1.0
**Author**: CC (Claude Code)
**Date**: 2026-01-05
**Status**: ACTIVE - Ready for Implementation
**Purpose**: Prevent data loss and production outages from database migrations

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Pre-Migration Validation](#pre-migration-validation)
3. [Migration Checklist](#migration-checklist)
4. [Rollback Strategy](#rollback-strategy)
5. [Schema Drift Detection](#schema-drift-detection)
6. [Implementation Guide](#implementation-guide)

---

## Problem Statement

### Current State (Risky)

**Evidence**:
- `supabase/migrations/20251211_booking_schema.sql` exists but NOT applied to production
- No validation that Supabase schema matches codebase expectations
- No automated rollback scripts (what if migration breaks production?)
- No dry-run testing before production application

**Risks**:
- **Data Loss**: Incorrect migration could drop tables/columns
- **Downtime**: Failed migration blocks production queries
- **Breaking Changes**: Application code expects old schema, migration changes it
- **No Recovery**: No rollback script = manual emergency fix

---

## Pre-Migration Validation

### Step 1: Backup Verification

**Check**: Supabase has automatic backups enabled

**Command**:
```bash
# Query Supabase API for backup status
curl "https://lbttmhwckcrfdymwyuhn.supabase.co/v1/database/backups" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"

# Expected: {"enabled": true, "last_backup": "2026-01-05T12:00:00Z"}
```

**Fallback**: If no automatic backups, create manual backup first:
```bash
# Export schema to SQL file
pg_dump -h lbttmhwckcrfdymwyuhn.supabase.co \
  -U postgres \
  -d postgres \
  --schema-only \
  > backups/schema_$(date +%Y%m%d_%H%M%S).sql
```

---

### Step 2: Schema Comparison

**Check**: Does migration conflict with existing data?

**Tool**: `scripts/validate-schema.py` (see Implementation section)

**Command**:
```bash
python scripts/validate-schema.py compare \
  --migration supabase/migrations/20251211_booking_schema.sql

# Output:
✅ No table conflicts (bookings table does not exist)
⚠️  RLS policy missing for 'bookings' table
❌ Application code needs update (BookingRepository.ts references old schema)
```

**Block Conditions**:
- Migration attempts to drop table with data (> 0 rows)
- Migration conflicts with existing constraints
- Migration removes column referenced in application code

---

### Step 3: Dry-Run Test

**Check**: Apply migration to local Supabase instance first

**Process**:
1. Spin up local Supabase: `npx supabase start`
2. Apply migration: `npx supabase migration up`
3. Run smoke tests: `pnpm test:integration` (if tests exist)
4. Verify schema: `npx supabase db diff`

**Success Criteria**:
- Migration applies without errors
- Smoke tests pass
- Schema diff shows expected changes only

---

## Migration Checklist

### Mandatory Items (All Must Pass)

**Before applying ANY migration**:

- [ ] **Rollback Script Exists**: `supabase/migrations/[DATE]_rollback_[NAME].sql` created
- [ ] **Tested Locally**: Migration applied to local Supabase instance successfully
- [ ] **No Breaking Changes**: Existing queries still work after migration
- [ ] **RLS Policies Updated**: New tables have appropriate Row Level Security
- [ ] **Application Code Updated**: Code references new schema (if schema changes)
- [ ] **Performance Impact Assessed**: New indexes won't slow down existing queries
- [ ] **Backup Verified**: Supabase backups enabled OR manual backup created
- [ ] **Schema Validator Passed**: `validate-schema.py` returns no blockers

---

### Migration Types & Risk Levels

| Migration Type | Risk Level | Requirements |
|----------------|------------|--------------|
| **Add Table** | LOW | RLS policies, rollback script |
| **Add Column** | LOW | Default value, nullable, rollback script |
| **Modify Column** | MEDIUM | Data migration script, rollback tested |
| **Drop Column** | HIGH | Verify no code references, backup first |
| **Drop Table** | CRITICAL | Explicit user approval, data export, rollback impossible |

**Rule**: NEVER drop table/column without explicit user approval in production

---

## Rollback Strategy

### Rollback Script Template

**For Every Migration**: Create corresponding rollback

**Example**: `supabase/migrations/20251211_booking_schema.sql`
```sql
-- Create bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  vehicle_trim_id UUID REFERENCES vehicle_trims(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Rollback**: `supabase/migrations/20251211_rollback_booking_schema.sql`
```sql
-- Rollback: Drop bookings table
DROP TABLE IF EXISTS bookings CASCADE;
```

**Naming Convention**: `[DATE]_rollback_[ORIGINAL_NAME].sql`

---

### Automated Rollback Trigger

**Scenario**: Migration fails midway through execution

**Tool**: `scripts/apply-migration.sh` (automated safety wrapper)

**Logic**:
```bash
#!/bin/bash
MIGRATION_FILE=$1
ROLLBACK_FILE=$(echo $MIGRATION_FILE | sed 's/\([0-9]*\)_/\1_rollback_/')

# 1. Check rollback exists
if [ ! -f "$ROLLBACK_FILE" ]; then
  echo "❌ Rollback script not found: $ROLLBACK_FILE"
  exit 1
fi

# 2. Create pre-migration backup
pg_dump ... > backup_before_migration.sql

# 3. Apply migration
if psql ... -f $MIGRATION_FILE; then
  echo "✅ Migration successful"
else
  echo "❌ Migration failed - auto-rolling back"
  psql ... -f $ROLLBACK_FILE
  echo "✅ Rollback complete"
  exit 1
fi

# 4. Run smoke tests
if npm run test:smoke; then
  echo "✅ Smoke tests passed"
else
  echo "❌ Smoke tests failed - rolling back"
  psql ... -f $ROLLBACK_FILE
  exit 1
fi
```

---

## Schema Drift Detection

### What is Schema Drift?

**Definition**: Production database schema differs from codebase expectations

**Example Drift**:
- Migration creates `bookings` table, but application code expects `test_drives`
- Migration adds column `phone_number`, but code queries `mobile_number`
- Migration changes `price_egp` from INTEGER to NUMERIC, but code expects INTEGER

---

### Drift Detection Tool

**Tool**: `scripts/validate-schema.py` (see Implementation section)

**Capabilities**:
1. Query Supabase for actual schema (via REST API)
2. Parse migration files for expected schema
3. Compare actual vs expected
4. Report drifts (missing tables, extra columns, type mismatches)

**Usage**:
```bash
# Detect drift between production and migrations
python scripts/validate-schema.py detect-drift

# Output:
⚠️  Schema Drift Detected:
  - Table 'bookings' missing in production (expected by migration 20251211)
  - Column 'vehicle_trims.trim_count' exists but not in migrations
  - Type mismatch: 'vehicle_trims.price_egp' is INTEGER, expected NUMERIC
```

---

### Drift Resolution Strategies

**Strategy 1: Apply Missing Migrations**
```bash
# If drift is due to unapplied migrations
python scripts/validate-schema.py apply-missing
```

**Strategy 2: Update Migrations to Match Production**
```bash
# If production is correct, migrations are stale
python scripts/validate-schema.py sync-migrations
```

**Strategy 3: Manual Review**
```bash
# If drift is unexpected, investigate
python scripts/validate-schema.py diff --detailed
```

---

## Implementation Guide

### Tool: `scripts/validate-schema.py`

**Functions**:
1. `get_supabase_schema()` - Query production schema via REST API
2. `parse_migrations()` - Extract expected schema from SQL files
3. `compare_schemas()` - Detect drifts between actual vs expected
4. `validate_migration()` - Pre-flight check for migration safety

**Example Usage**:
```python
from scripts.validate_schema import SchemaValidator

validator = SchemaValidator()

# Check if migration is safe
is_safe, issues = validator.validate_migration("supabase/migrations/20251211_booking_schema.sql")

if not is_safe:
    print("❌ Migration NOT safe:")
    for issue in issues:
        print(f"  - {issue}")
    sys.exit(1)
```

---

### Integration with CI/CD

**GitHub Action**: `.github/workflows/migration-safety-check.yml`

```yaml
name: Migration Safety Check
on:
  pull_request:
    paths:
      - 'supabase/migrations/*.sql'
jobs:
  validate-migration:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Check migration safety
        run: |
          python scripts/validate-schema.py validate \
            --migration ${{ github.event.pull_request.head.ref }}
      - name: Verify rollback exists
        run: |
          for migration in supabase/migrations/*.sql; do
            rollback=$(echo $migration | sed 's/\([0-9]*\)_/\1_rollback_/')
            if [ ! -f "$rollback" ]; then
              echo "❌ Missing rollback for: $migration"
              exit 1
            fi
          done
```

---

## Success Metrics

### Week 1 (Validator Operational)
- [ ] `validate-schema.py` can query Supabase schema
- [ ] Drift detection working (reports 1+ existing drift)
- [ ] Pre-flight checks integrated into workflow

### Month 1 (Zero Data Loss Incidents)
- [ ] All migrations have rollback scripts
- [ ] 100% migration success rate (no failed migrations)
- [ ] Schema drift reduced to zero

### Month 3 (Automated Safety)
- [ ] CI/CD blocks PRs without rollback scripts
- [ ] Automated dry-run testing on every migration PR
- [ ] Smoke tests run post-migration automatically

---

**END OF PROTOCOL**

**Next Step**: Implement `scripts/validate-schema.py` (schema drift detection)
**Estimated Effort**: 3-4 hours
**Dependencies**: Supabase REST API access, SQL parsing library
