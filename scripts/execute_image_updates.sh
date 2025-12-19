#!/bin/bash
# Execute SQL image updates via Supabase SQL Editor
# This updates models table with correct image paths

set -e

cd "$(dirname "$0")/.."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Executing Image URL Updates${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# Check if SQL file exists
if [ ! -f scripts/update_image_urls.sql ]; then
    echo -e "${RED}ERROR: scripts/update_image_urls.sql not found${NC}"
    exit 1
fi

# Load credentials if helper exists
if [ -f scripts/supabase_helper.sh ]; then
    echo "Loading credentials from supabase_helper.sh..."
    source scripts/supabase_helper.sh
fi

# Check credentials
if [ -z "$SUPABASE_URL" ]; then
    export SUPABASE_URL="https://lbttmhwckcrfdymwyuhn.supabase.co"
fi

if [ -z "$SUPABASE_SERVICE_KEY" ]; then
    echo -e "${RED}ERROR: SUPABASE_SERVICE_KEY not set${NC}"
    echo "This script requires service role key for SQL execution"
    echo ""
    echo "Options:"
    echo "  1. Set manually: export SUPABASE_SERVICE_KEY='your_key'"
    echo "  2. Create scripts/supabase_helper.sh with credentials"
    echo "  3. Run SQL manually in Supabase Dashboard:"
    echo "     https://supabase.com/dashboard/project/lbttmhwckcrfdymwyuhn/sql"
    exit 1
fi

echo "Supabase URL: $SUPABASE_URL"
echo "SQL File: scripts/update_image_urls.sql"
echo ""

# Count statements
STATEMENT_COUNT=$(grep -c "^UPDATE" scripts/update_image_urls.sql)
echo "Statements to execute: $STATEMENT_COUNT UPDATEs"
echo ""

# Read SQL file
SQL_CONTENT=$(cat scripts/update_image_urls.sql)

echo -e "${YELLOW}Executing SQL transaction...${NC}"

# Execute via Supabase SQL API
# Note: Supabase doesn't have a direct SQL execution API for full scripts
# We need to use the Dashboard or psql

echo ""
echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}MANUAL EXECUTION REQUIRED${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""
echo "Supabase REST API doesn't support full SQL script execution."
echo "Please execute via one of these methods:"
echo ""
echo -e "${GREEN}Option 1: Supabase SQL Editor (Recommended)${NC}"
echo "  1. Open: https://supabase.com/dashboard/project/lbttmhwckcrfdymwyuhn/sql"
echo "  2. Click 'New Query'"
echo "  3. Copy contents of: scripts/update_image_urls.sql"
echo "  4. Click 'Run'"
echo ""
echo -e "${GREEN}Option 2: psql Command Line${NC}"
echo "  psql 'postgresql://postgres:[PASSWORD]@db.lbttmhwckcrfdymwyuhn.supabase.co:5432/postgres' < scripts/update_image_urls.sql"
echo ""
echo -e "${GREEN}Option 3: Use Supabase CLI${NC}"
echo "  supabase db execute --file scripts/update_image_urls.sql"
echo ""

# Verification query
echo -e "${YELLOW}After execution, verify with:${NC}"
echo ""
echo "SELECT COUNT(*) FROM models WHERE hero_image_url LIKE '/images/vehicles/hero/%';"
echo "SELECT COUNT(*) FROM models WHERE hover_image_url LIKE '/images/vehicles/hover/%';"
echo ""
echo "Expected: 70+ models with hero images, 50+ with hover images"
