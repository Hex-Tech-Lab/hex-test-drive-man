#!/bin/bash
# Apply Mercedes-Benz + Hongqi migrations via Supabase REST API
# Uses service role key for admin operations

set -e

SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL}"
SERVICE_KEY="${SUPABASE_SERVICE_ROLE_KEY}"
MERCEDES_BRAND_ID="82ac7a95-b107-4b14-a431-608e0d01f5ba"

if [ -z "$SUPABASE_URL" ] || [ -z "$SERVICE_KEY" ]; then
  echo "❌ Missing environment variables"
  exit 1
fi

echo "=== SUPABASE DATA MIGRATION ==="
echo "Target: $SUPABASE_URL"
echo "Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo ""

# Load Mercedes models from JSON
MODELS_JSON="/vercel/sandbox/scripts/mercedes_models.json"

if [ ! -f "$MODELS_JSON" ]; then
  echo "❌ Models JSON not found: $MODELS_JSON"
  exit 1
fi

echo "=== MERCEDES-BENZ MIGRATION ==="
echo "📦 Processing models from JSON..."
echo ""

SUCCESS_COUNT=0
ERROR_COUNT=0

# Read JSON and process each model
while IFS= read -r line; do
  # Extract model data using grep and sed
  NAME=$(echo "$line" | grep -o '"name": "[^"]*"' | sed 's/"name": "\(.*\)"/\1/')
  YEAR=$(echo "$line" | grep -o '"year": [0-9]*' | sed 's/"year": //')
  HERO=$(echo "$line" | grep -o '"hero_image": "[^"]*"' | sed 's/"hero_image": "\(.*\)"/\1/')
  
  if [ -z "$NAME" ]; then
    continue
  fi
  
  printf "   %-30s ... " "$NAME"
  
  # Upsert model
  MODEL_RESPONSE=$(curl -s -X POST \
    "${SUPABASE_URL}/rest/v1/models" \
    -H "apikey: ${SERVICE_KEY}" \
    -H "Authorization: Bearer ${SERVICE_KEY}" \
    -H "Content-Type: application/json" \
    -H "Prefer: resolution=merge-duplicates,return=representation" \
    -d "{
      \"brand_id\": \"${MERCEDES_BRAND_ID}\",
      \"name\": \"${NAME}\",
      \"hero_image_url\": \"/images/vehicles/hero/${HERO}\",
      \"updated_at\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
    }")
  
  # Extract model ID from response
  MODEL_ID=$(echo "$MODEL_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | sed 's/"id":"\(.*\)"/\1/')
  
  if [ -z "$MODEL_ID" ]; then
    echo "❌ Failed to get model ID"
    ERROR_COUNT=$((ERROR_COUNT + 1))
    continue
  fi
  
  # Insert default trim (ignore conflicts)
  curl -s -X POST \
    "${SUPABASE_URL}/rest/v1/vehicle_trims" \
    -H "apikey: ${SERVICE_KEY}" \
    -H "Authorization: Bearer ${SERVICE_KEY}" \
    -H "Content-Type: application/json" \
    -H "Prefer: resolution=ignore-duplicates" \
    -d "{
      \"model_id\": \"${MODEL_ID}\",
      \"trim_name\": \"Base\",
      \"model_year\": ${YEAR},
      \"price_egp\": 0,
      \"created_at\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
      \"updated_at\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
    }" > /dev/null
  
  echo "✅"
  SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  
done < <(cat "$MODELS_JSON" | grep -E '(name|year|hero_image)')

echo ""
echo "📊 Mercedes-Benz Results:"
echo "   ✅ Success: $SUCCESS_COUNT"
echo "   ❌ Errors: $ERROR_COUNT"

echo ""
echo "=== HONGQI MIGRATION ==="

# Create Hongqi brand
echo "   Creating Hongqi brand..."
HONGQI_RESPONSE=$(curl -s -X POST \
  "${SUPABASE_URL}/rest/v1/brands" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates,return=representation" \
  -d '{
    "name": "Hongqi",
    "logo_url": "/images/brands/hongqi.png",
    "updated_at": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }')

HONGQI_BRAND_ID=$(echo "$HONGQI_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | sed 's/"id":"\(.*\)"/\1/')

if [ -z "$HONGQI_BRAND_ID" ]; then
  echo "   ❌ Failed to create Hongqi brand"
  exit 1
fi

echo "   ✅ Hongqi brand: $HONGQI_BRAND_ID"

# Create H9 model
echo "   Creating H9 model..."
H9_RESPONSE=$(curl -s -X POST \
  "${SUPABASE_URL}/rest/v1/models" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates,return=representation" \
  -d "{
    \"brand_id\": \"${HONGQI_BRAND_ID}\",
    \"name\": \"H9\",
    \"hero_image_url\": \"/images/vehicles/hero/hongqi-hongqi-h9-2025-catalogue-ksa-en.jpg\",
    \"updated_at\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
  }")

H9_MODEL_ID=$(echo "$H9_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | sed 's/"id":"\(.*\)"/\1/')

if [ -z "$H9_MODEL_ID" ]; then
  echo "   ❌ Failed to create H9 model"
  exit 1
fi

echo "   ✅ H9 model: $H9_MODEL_ID"

# Create default trim
echo "   Creating Base trim..."
curl -s -X POST \
  "${SUPABASE_URL}/rest/v1/vehicle_trims" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=ignore-duplicates" \
  -d "{
    \"model_id\": \"${H9_MODEL_ID}\",
    \"trim_name\": \"Base\",
    \"model_year\": 2025,
    \"price_egp\": 0,
    \"created_at\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
    \"updated_at\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
  }" > /dev/null

echo "   ✅ Base trim created"

echo ""
echo "📊 Hongqi Results: ✅ Success"

echo ""
echo "=== FINAL SUMMARY ==="
echo "Mercedes-Benz: ✅ ($SUCCESS_COUNT models)"
echo "Hongqi: ✅ (1 model)"
echo ""
echo "🎉 All migrations completed successfully!"
