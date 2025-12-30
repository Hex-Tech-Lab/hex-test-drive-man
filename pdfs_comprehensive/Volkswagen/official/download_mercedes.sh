#!/bin/bash
# Mercedes-Benz Egypt Brochure Download Script
# Generated: 2025-12-29
# Total Models: 27

BASE_URL="https://www.mercedes-benz.com.eg"
TARGET_DIR="../Mercedes-Benz/official"

# Create target directory
mkdir -p "$TARGET_DIR"

echo "Starting Mercedes-Benz brochure downloads..."
echo "Target directory: $TARGET_DIR"
echo "Total PDFs to download: 27"
echo ""

# Electric Models
echo "[1/27] Downloading Maybach EQS SUV..."
wget -O "$TARGET_DIR/Maybach_EQS_SUV.pdf" "$BASE_URL/content/dam/egypt/passengercars/buy/EQS_SUV_Maybach_Z296_ePaper_20-7-2025_2_02_ENG%20new.pdf"

echo "[2/27] Downloading EQA..."
wget -O "$TARGET_DIR/EQA.pdf" "$BASE_URL/content/dam/egypt/Brochures/EQA%20catalogue%20CON%201.pdf"

echo "[3/27] Downloading EQB..."
wget -O "$TARGET_DIR/EQB.pdf" "$BASE_URL/content/dam/egypt/Brochures/EQB%20catalogue%20CON.pdf"

echo "[4/27] Downloading EQE Sedan..."
wget -O "$TARGET_DIR/EQE_Sedan.pdf" "$BASE_URL/content/dam/egypt/Brochures/EQE%20catalogue.pdf"

echo "[5/27] Downloading EQE SUV..."
wget -O "$TARGET_DIR/EQE_SUV.pdf" "$BASE_URL/content/dam/egypt/Brochures/EQE%20SUV%20catalogue.pdf"

echo "[6/27] Downloading EQS Saloon..."
wget -O "$TARGET_DIR/EQS_Saloon.pdf" "$BASE_URL/content/dam/egypt/Brochures/EQS%20catalogue%20high%20res.pdf"

echo "[7/27] Downloading EQS SUV..."
wget -O "$TARGET_DIR/EQS_SUV.pdf" "$BASE_URL/content/dam/egypt/Brochures/EQS%20SUV%20catalogue.pdf"

# Sedans
echo "[8/27] Downloading A-Class..."
wget -O "$TARGET_DIR/A-Class.pdf" "$BASE_URL/content/dam/egypt/passengercars/buy/MY26-A-Class-Standard-(2).pdf"

echo "[9/27] Downloading C-Class..."
wget -O "$TARGET_DIR/C-Class.pdf" "$BASE_URL/content/dam/egypt/Brochures/C-Class_Catalogue_2024.pdf"

echo "[10/27] Downloading AMG C 43..."
wget -O "$TARGET_DIR/AMG_C43.pdf" "$BASE_URL/content/dam/egypt/passengercars/buy/AMG-C-43_Catalogue_2025%20(1).pdf"

echo "[11/27] Downloading E-Class..."
wget -O "$TARGET_DIR/E-Class.pdf" "$BASE_URL/content/dam/egypt/Brochures/MY26-E-Class-Brochure.pdf"

echo "[12/27] Downloading S-Class..."
wget -O "$TARGET_DIR/S-Class.pdf" "$BASE_URL/content/dam/egypt/Brochures/S-Class%20Saloon%20Catalogue%202021_V3_19.01.21.pdf"

echo "[13/27] Downloading Maybach S-Class..."
wget -O "$TARGET_DIR/Maybach_S-Class.pdf" "$BASE_URL/content/dam/egypt/Brochures/s-class-maybach.pdf"

# SUVs
echo "[14/27] Downloading GLA..."
wget -O "$TARGET_DIR/GLA.pdf" "$BASE_URL/content/dam/egypt/passengercars/buy/MY26-GLA-Progressive-(2).pdf"

echo "[15/27] Downloading GLC SUV..."
wget -O "$TARGET_DIR/GLC_SUV.pdf" "$BASE_URL/content/dam/egypt/Brochures/GLC%20suv%20catalogue.pdf"

echo "[16/27] Downloading GLC Coupé..."
wget -O "$TARGET_DIR/GLC_Coupe.pdf" "$BASE_URL/content/dam/egypt/passengercars/GLC_Coupe_catalogue_CON.pdf"

echo "[17/27] Downloading AMG GLC 43 Coupé..."
wget -O "$TARGET_DIR/AMG_GLC43_Coupe.pdf" "$BASE_URL/content/dam/egypt/Brochures/AMG-GLC-43-Coupe%CC%81-catalogue-2025.pdf"

echo "[18/27] Downloading GLE..."
wget -O "$TARGET_DIR/GLE.pdf" "$BASE_URL/content/dam/egypt/Brochures/gle-suv-v167-brochure.pdf"

echo "[19/27] Downloading GLS..."
wget -O "$TARGET_DIR/GLS.pdf" "$BASE_URL/content/dam/egypt/Brochures/GLS_X167_ePaper_23_1_02_ENG.pdf"

echo "[20/27] Downloading G-Class..."
wget -O "$TARGET_DIR/G-Class.pdf" "$BASE_URL/content/dam/egypt/passengercars/buy/G_Klasse_W465_ePaper_15_7_2025_ENG%20(1).pdf"

# Coupés & Cabriolets
echo "[21/27] Downloading AMG GT 63..."
wget -O "$TARGET_DIR/AMG_GT63.pdf" "$BASE_URL/content/dam/egypt/passengercars/buy/AMG_GT_C192_ePaper_20_7_2025_ENG%2028-29%20new.pdf"

echo "[22/27] Downloading CLA..."
wget -O "$TARGET_DIR/CLA.pdf" "$BASE_URL/content/dam/egypt/passengercars/buy/MY26-CLA-Progressive-(2).pdf"

echo "[23/27] Downloading E-Class Coupé & Cabriolet..."
wget -O "$TARGET_DIR/E-Class_Coupe_Cabriolet.pdf" "$BASE_URL/content/dam/egypt/Brochures/MY22-E-Coupe-and-Cabrio.pdf"

echo "[24/27] Downloading CLS..."
wget -O "$TARGET_DIR/CLS.pdf" "$BASE_URL/content/dam/egypt/Brochures/CLS_C257_ePaper_1121_02_ENG_v3.pdf"

echo "[25/27] Downloading AMG SL Roadster..."
wget -O "$TARGET_DIR/AMG_SL_Roadster.pdf" "$BASE_URL/content/dam/egypt/Brochures/AMG_SL_R232_ePaper_3_6_02_ENG-2024.pdf"

# Hatchbacks & Vans
echo "[26/27] Downloading B-Class..."
wget -O "$TARGET_DIR/B-Class.pdf" "$BASE_URL/content/dam/egypt/Brochures/MY26-B-Class-Standard.pdf"

echo "[27/27] Downloading V-Class..."
wget -O "$TARGET_DIR/V-Class.pdf" "$BASE_URL/content/dam/egypt/Brochures/V300_Catalogue_2025.pdf"

echo ""
echo "Download complete! Checking results..."
echo ""

# Count successful downloads
PDF_COUNT=$(ls -1 "$TARGET_DIR"/*.pdf 2>/dev/null | wc -l)
echo "Successfully downloaded: $PDF_COUNT/27 PDFs"
echo ""

# List all downloaded files with sizes
echo "Downloaded files:"
ls -lh "$TARGET_DIR"/*.pdf 2>/dev/null | awk '{print $9, "-", $5}'

echo ""
echo "All downloads complete!"
echo "Location: $TARGET_DIR"
