#!/bin/bash
# Apply reservations migration to Supabase
# Created: 2026-01-07
# Agent: BB

set -e

echo "Applying reservations migration to Supabase..."

# Read the SQL file
SQL_FILE="supabase/migrations/20260107_mvp15_reservations.sql"

if [ ! -f "$SQL_FILE" ]; then
  echo "Error: Migration file not found: $SQL_FILE"
  exit 1
fi

# Check environment variables
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set"
  exit 1
fi

# Extract the project reference from URL
PROJECT_REF=$(echo "$SUPABASE_URL" | sed -E 's|https://([^.]+)\.supabase\.co|\1|')

echo "Project: $PROJECT_REF"
echo "Executing SQL migration..."

# Execute the SQL using Supabase REST API
curl -X POST \
  "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(cat "$SQL_FILE" | jq -Rs .)}" \
  || {
    echo "REST API method failed, trying direct psql connection..."
    
    # Alternative: Use psql if available
    if command -v psql &> /dev/null; then
      PGPASSWORD="${SUPABASE_SERVICE_ROLE_KEY}" psql \
        -h "db.${PROJECT_REF}.supabase.co" \
        -U postgres \
        -d postgres \
        -f "$SQL_FILE"
    else
      echo "Error: Could not apply migration. Please apply manually via Supabase dashboard."
      echo "SQL file: $SQL_FILE"
      exit 1
    fi
  }

echo "✅ Migration applied successfully!"
