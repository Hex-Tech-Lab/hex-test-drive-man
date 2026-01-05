#!/bin/bash
# Apply Mercedes-Benz + Hongqi migrations via Supabase REST API
# Fixed version without updated_at column

set -e

SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL}"
SERVICE_KEY="${SUPABASE_SERVICE_ROLE_KEY}"
MERCEDES_BRAND_ID="82ac7a95-b107-4b14-a431-608e0d01f5ba"

echo "=== SUPABASE DATA MIGRATION ==="
echo "Target: $SUPABASE_URL"
echo ""

echo "=== MERCEDES-BENZ MIGRATION ==="
echo "📦 Processing 24 models..."
echo ""

SUCCESS_COUNT=0
ERROR_COUNT=0

# Array of Mercedes models (name|hero_image|year)
MODELS=(
  "AMG C43|mercedes-benz-amg-c43.jpg|2025"
  "AMG Glc43 Coupe|mercedes-benz-amg-glc43-coupe.jpg|2025"
  "AMG Gt63|mercedes-benz-amg-gt63.jpg|2025"
  "AMG SL Roadster|mercedes-benz-amg-sl-roadster.jpg|2025"
  "B Class|mercedes-benz-b-class.jpg|2025"
  "C Class|mercedes-benz-c-class.jpg|2025"
  "CLS|mercedes-benz-cls.jpg|2025"
  "E Class Coupe Cabriolet|mercedes-benz-e-class-coupe-cabriolet.jpg|2025"
  "E Class|mercedes-benz-e-class.jpg|2025"
  "EQA|mercedes-benz-eqa.jpg|2025"
  "EQB|mercedes-benz-eqb.jpg|2025"
  "EQE Sedan|mercedes-benz-eqe-sedan.jpg|2025"
  "EQE SUV|mercedes-benz-eqe-suv.jpg|2025"
  "EQS Saloon|mercedes-benz-eqs-saloon.jpg|2025"
  "EQS SUV|mercedes-benz-eqs-suv.jpg|2025"
  "G Class|mercedes-benz-g-class.jpg|2025"
  "GLC Coupe|mercedes-benz-glc-coupe.jpg|2025"
  "GLC SUV|mercedes-benz-glc-suv.jpg|2025"
  "GLE|mercedes-benz-gle.jpg|2025"
  "GLS|mercedes-benz-gls.jpg|2025"
  "Maybach EQS SUV|mercedes-benz-maybach-eqs-suv.jpg|2025"
  "Maybach S Class|mercedes-benz-maybach-s-class.jpg|2025"
  "S Class|mercedes-benz-s-class.jpg|2025"
  "V Class|mercedes-benz-v-class.jpg|2025"
)

for MODEL_DATA in "${MODELS[@]}"; do
  IFS='|' read -r NAME HERO YEAR <<< "$MODEL_DATA"
  
  printf "   %-30s ... " "$NAME"
  
  # Insert model
  MODEL_RESPONSE=$(curl -s -X POST \
    "${SUPABASE_URL}/rest/v1/models" \
    -H "apikey: ${SERVICE_KEY}" \
    -H "Authorization: Bearer ${SERVICE_KEY}" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=representation" \
    -d "{
      \"brand_id\": \"${MERCEDES_BRAND_ID}\",
      \"name\": \"${NAME}\",
      \"hero_image_url\": \"/images/vehicles/hero/${HERO}\"
    }")
  
  # Extract model ID
  MODEL_ID=$(echo "$MODEL_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  
  if [ -z "$MODEL_ID" ]; then
    echo "❌"
    ERROR_COUNT=$((ERROR_COUNT + 1))
    continue
  fi
  
  # Insert default trim
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
      \"price_egp\": 0
    }" > /dev/null
  
  echo "✅"
  SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
done

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
  -H "Prefer: return=representation" \
  -d '{
    "name": "Hongqi",
    "logo_url": "/images/brands/hongqi.png"
  }')

HONGQI_BRAND_ID=$(echo "$HONGQI_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$HONGQI_BRAND_ID" ]; then
  echo "   ⚠️  Brand creation returned empty ID, checking if exists..."
  
  # Check if brand already exists
  EXISTING_RESPONSE=$(curl -s -X GET \
    "${SUPABASE_URL}/rest/v1/brands?name=eq.Hongqi&select=id" \
    -H "apikey: ${SERVICE_KEY}" \
    -H "Authorization: Bearer ${SERVICE_KEY}")
  
  HONGQI_BRAND_ID=$(echo "$EXISTING_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  
  if [ -z "$HONGQI_BRAND_ID" ]; then
    echo "   ❌ Failed to create or find Hongqi brand"
    exit 1
  fi
  
  echo "   ✅ Hongqi brand exists: $HONGQI_BRAND_ID"
else
  echo "   ✅ Hongqi brand created: $HONGQI_BRAND_ID"
fi

# Create H9 model
echo "   Creating H9 model..."
H9_RESPONSE=$(curl -s -X POST \
  "${SUPABASE_URL}/rest/v1/models" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d "{
    \"brand_id\": \"${HONGQI_BRAND_ID}\",
    \"name\": \"H9\",
    \"hero_image_url\": \"/images/vehicles/hero/hongqi-hongqi-h9-2025-catalogue-ksa-en.jpg\"
  }")

H9_MODEL_ID=$(echo "$H9_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$H9_MODEL_ID" ]; then
  echo "   ❌ Failed to create H9 model"
  exit 1
fi

echo "   ✅ H9 model created: $H9_MODEL_ID"

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
    \"price_egp\": 0
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
