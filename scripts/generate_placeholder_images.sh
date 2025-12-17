#!/bin/bash

# For each vehicle, create placeholder with brand/model overlay
# (Requires imagemagick)
VEHICLES=(
"toyota-camry-2024"
"honda-accord-2024"
"bmw-3series-2024"
"mercedes-cclass-2024"
"audi-a4-2024"
"lexus-es-2024"
"hyundai-sonata-2024"
"kia-k5-2024"
"nissan-altima-2024"
"mazda-6-2024"
"subaru-legacy-2024"
"volkswagen-passat-2024"
"ford-fusion-2024"
"chevrolet-malibu-2024"
"tesla-model3-2024"
"porsche-911-2024"
"ferrari-sf90-2024"
"lamborghini-huracan-2024"
"mclaren-720s-2024"
"bugatti-chiron-2024"
)

for vehicle in "${VEHICLES[@]}"; do

# Create hero placeholder
convert -size 800x600 xc:lightgray \
-pointsize 40 -fill black \
-annotate +50+300 "$vehicle" \
"public/images/vehicles/hero/${vehicle}.jpg"

# Create hover placeholder
convert -size 800x600 xc:lightblue \
-pointsize 40 -fill black \
-annotate +50+300 "${vehicle}-interior" \
"public/images/vehicles/hover/${vehicle}.jpg"
done

echo "✅ Generated 20 placeholder images"
