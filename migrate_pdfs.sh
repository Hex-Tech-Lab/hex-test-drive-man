#!/bin/bash
# Migrate legacy pdfs/ to pdfs_comprehensive/

LEGACY="pdfs"
NEW="pdfs_comprehensive"

# Brands to migrate
brands="Audi BMW Chery Dongfeng Hongqi Hyundai Jetour MG Mercedes-Benz Mitsubishi Nissan Peugeot Renault Suzuki Toyota Voyah Zeekr Avatr"

for brand in $brands; do
  if [ -d "$LEGACY/$brand" ]; then
    echo "Migrating $brand..."
    mkdir -p "$NEW/$brand/official"
    
    # Find all PDFs and copy them
    find "$LEGACY/$brand" -name "*.pdf" -exec cp {} "$NEW/$brand/official/" \;
    
    count=$(find "$NEW/$brand/official" -name "*.pdf" | wc -l)
    echo "  → Copied $count PDFs to $NEW/$brand/official/"
  fi
done

echo ""
echo "Migration complete!"
find "$NEW" -name "*.pdf" | wc -l
echo "Total PDFs in pdfs_comprehensive/"
