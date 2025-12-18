#!/bin/bash
# Generate SQL UPDATE statements for vehicle images
# Output: scripts/update_image_urls.sql

set -e

cd "$(dirname "$0")/.."

# Load credentials if helper exists
if [ -f scripts/supabase_helper.sh ]; then
    echo "Loading credentials from supabase_helper.sh..."
    source scripts/supabase_helper.sh
fi

# Check credentials
if [ -z "$SUPABASE_URL" ]; then
    export SUPABASE_URL="https://lbttmhwckcrfdymwyuhn.supabase.co"
fi

if [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "ERROR: SUPABASE_ANON_KEY not set"
    echo "Set it manually or create scripts/supabase_helper.sh"
    exit 1
fi

echo "Generating SQL UPDATE statements..."
echo "Hero images: $(ls public/images/vehicles/hero/*.jpg 2>/dev/null | wc -l)"
echo "Hover images: $(ls public/images/vehicles/hover/*.jpg 2>/dev/null | wc -l)"
echo ""

# Generate SQL
python3 scripts/generate_image_updates.py > scripts/update_image_urls.sql

echo ""
echo "✅ SQL generated: scripts/update_image_urls.sql"
echo ""
echo "To apply:"
echo "  psql \$SUPABASE_URL < scripts/update_image_urls.sql"
echo ""
echo "Or via Supabase Dashboard:"
echo "  1. Open: https://supabase.com/dashboard/project/lbttmhwckcrfdymwyuhn/editor"
echo "  2. Copy contents of scripts/update_image_urls.sql"
echo "  3. Run in SQL Editor"
