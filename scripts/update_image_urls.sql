-- Auto-generated SQL to update vehicle image URLs
-- Generated: 2025-12-18 14:21:54 UTC
-- Hero images: 75
-- Hover images: 60
-- Agent: BB

BEGIN;

-- Clear old placeholder paths (optional - uncomment if needed)
-- UPDATE models SET hero_image_url = NULL WHERE hero_image_url LIKE '/cars/%';
-- UPDATE models SET hover_image_url = NULL WHERE hover_image_url LIKE '/cars/%';


-- ============================================
-- HERO IMAGES (75 files)
-- ============================================

-- Update hero for: Audi-q3-2024-25.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Audi-q3-2024-25.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Audi'))
  AND LOWER(name) LIKE '%q3%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Audi-q3-2025.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Audi-q3-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Audi'))
  AND LOWER(name) LIKE '%q3%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Audi-q7-2024-25.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Audi-q7-2024-25.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Audi'))
  AND LOWER(name) LIKE '%q7%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Audi-q7-2025.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Audi-q7-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Audi'))
  AND LOWER(name) LIKE '%q7%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: BMW-5-series---i5-2025.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/BMW-5-series---i5-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('BMW'))
  AND LOWER(name) LIKE '%5%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: BMW-5-series-i5-2025.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/BMW-5-series-i5-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('BMW'))
  AND LOWER(name) LIKE '%5%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: BMW-x1---ix1-2025.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/BMW-x1---ix1-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('BMW'))
  AND LOWER(name) LIKE '%x1%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: BMW-x1-ix1-2025.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/BMW-x1-ix1-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('BMW'))
  AND LOWER(name) LIKE '%x1%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: BMW-x2---ix2-2024.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/BMW-x2---ix2-2024.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('BMW'))
  AND LOWER(name) LIKE '%x2%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: BMW-x2-ix2-2025.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/BMW-x2-ix2-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('BMW'))
  AND LOWER(name) LIKE '%x2%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: BMW-x5-lci-2024.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/BMW-x5-lci-2024.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('BMW'))
  AND LOWER(name) LIKE '%x5%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: BMW-x5-lci-2025.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/BMW-x5-lci-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('BMW'))
  AND LOWER(name) LIKE '%x5%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Chery-arrizo-5-2024.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Chery-arrizo-5-2024.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Chery'))
  AND LOWER(name) LIKE '%arrizo%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Chery-arrizo-8-2025.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Chery-arrizo-8-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Chery'))
  AND LOWER(name) LIKE '%arrizo%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Chery-eq7-ev-2025.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Chery-eq7-ev-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Chery'))
  AND LOWER(name) LIKE '%eq7%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Chery-tiggo-3-2024.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Chery-tiggo-3-2024.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Chery'))
  AND LOWER(name) LIKE '%tiggo%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Chery-tiggo-4-pro-2025.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Chery-tiggo-4-pro-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Chery'))
  AND LOWER(name) LIKE '%tiggo%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Chery-tiggo-7-pro-max-2025.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Chery-tiggo-7-pro-max-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Chery'))
  AND LOWER(name) LIKE '%tiggo%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Chery-tiggo-8-pro-2024.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Chery-tiggo-8-pro-2024.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Chery'))
  AND LOWER(name) LIKE '%tiggo%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Chery-tiggo-8-pro-max-2025.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Chery-tiggo-8-pro-max-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Chery'))
  AND LOWER(name) LIKE '%tiggo%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Chevrolet-captiva-2025.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Chevrolet-captiva-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Chevrolet'))
  AND LOWER(name) LIKE '%captiva%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Chevrolet-move-van-2024.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Chevrolet-move-van-2024.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Chevrolet'))
  AND LOWER(name) LIKE '%move%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Chevrolet-optra-2026.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Chevrolet-optra-2026.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Chevrolet'))
  AND LOWER(name) LIKE '%optra%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Hyundai-bayon-2024.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Hyundai-bayon-2024.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Hyundai'))
  AND LOWER(name) LIKE '%bayon%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Hyundai-bayon-2025.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Hyundai-bayon-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Hyundai'))
  AND LOWER(name) LIKE '%bayon%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Hyundai-elantra-cn7-2024.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Hyundai-elantra-cn7-2024.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Hyundai'))
  AND LOWER(name) LIKE '%elantra%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Hyundai-elantra-cn7-smart-prime-2025.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Hyundai-elantra-cn7-smart-prime-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Hyundai'))
  AND LOWER(name) LIKE '%elantra%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Hyundai-i10-2024.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Hyundai-i10-2024.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Hyundai'))
  AND LOWER(name) LIKE '%i10%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Hyundai-i20-2024.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Hyundai-i20-2024.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Hyundai'))
  AND LOWER(name) LIKE '%i20%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Hyundai-i20-2025.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Hyundai-i20-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Hyundai'))
  AND LOWER(name) LIKE '%i20%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Hyundai-tucson-nx4-2024.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Hyundai-tucson-nx4-2024.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Hyundai'))
  AND LOWER(name) LIKE '%tucson%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Hyundai-tucson-nx4-premium-2025.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Hyundai-tucson-nx4-premium-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Hyundai'))
  AND LOWER(name) LIKE '%tucson%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Kia-grand-cerato-2024.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Kia-grand-cerato-2024.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Kia'))
  AND LOWER(name) LIKE '%grand%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Kia-seltos-2025.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Kia-seltos-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Kia'))
  AND LOWER(name) LIKE '%seltos%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Kia-sorento-2024.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Kia-sorento-2024.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Kia'))
  AND LOWER(name) LIKE '%sorento%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Kia-sportage-2025.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Kia-sportage-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Kia'))
  AND LOWER(name) LIKE '%sportage%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Kia-xceed-2024.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Kia-xceed-2024.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Kia'))
  AND LOWER(name) LIKE '%xceed%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: MG-hs-2024.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/MG-hs-2024.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('MG'))
  AND LOWER(name) LIKE '%hs%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: MG-mg-4-ev-2024.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/MG-mg-4-ev-2024.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('MG'))
  AND LOWER(name) LIKE '%mg%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: MG-mg-4-ev-2025.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/MG-mg-4-ev-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('MG'))
  AND LOWER(name) LIKE '%mg%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: MG-mg-5-2025.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/MG-mg-5-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('MG'))
  AND LOWER(name) LIKE '%mg%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: MG-mg-5-amended-2025.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/MG-mg-5-amended-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('MG'))
  AND LOWER(name) LIKE '%mg%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: MG-mg-6-2024.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/MG-mg-6-2024.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('MG'))
  AND LOWER(name) LIKE '%mg%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: MG-mg-hs-2025.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/MG-mg-hs-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('MG'))
  AND LOWER(name) LIKE '%mg%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: MG-mg-zs-lux-2025.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/MG-mg-zs-lux-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('MG'))
  AND LOWER(name) LIKE '%mg%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: MG-rx5-2025.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/MG-rx5-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('MG'))
  AND LOWER(name) LIKE '%rx5%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: MG-zs-2024.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/MG-zs-2024.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('MG'))
  AND LOWER(name) LIKE '%zs%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Mercedes-c-class-w206-2025.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Mercedes-c-class-w206-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Mercedes'))
  AND LOWER(name) LIKE '%c%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Mitsubishi-accessories-2025.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Mitsubishi-accessories-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Mitsubishi'))
  AND LOWER(name) LIKE '%accessories%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Mitsubishi-attrage-2024.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Mitsubishi-attrage-2024.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Mitsubishi'))
  AND LOWER(name) LIKE '%attrage%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Mitsubishi-attrage-2025.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Mitsubishi-attrage-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Mitsubishi'))
  AND LOWER(name) LIKE '%attrage%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Mitsubishi-mirage-2024.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Mitsubishi-mirage-2024.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Mitsubishi'))
  AND LOWER(name) LIKE '%mirage%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Mitsubishi-mirage-2025.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Mitsubishi-mirage-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Mitsubishi'))
  AND LOWER(name) LIKE '%mirage%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Nissan-juke-2025.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Nissan-juke-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Nissan'))
  AND LOWER(name) LIKE '%juke%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Nissan-patrol-2025.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Nissan-patrol-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Nissan'))
  AND LOWER(name) LIKE '%patrol%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Nissan-qashqai-2025.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Nissan-qashqai-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Nissan'))
  AND LOWER(name) LIKE '%qashqai%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Nissan-sentra-2024-25.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Nissan-sentra-2024-25.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Nissan'))
  AND LOWER(name) LIKE '%sentra%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Nissan-sentra-2025.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Nissan-sentra-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Nissan'))
  AND LOWER(name) LIKE '%sentra%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Nissan-sunny-2025.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Nissan-sunny-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Nissan'))
  AND LOWER(name) LIKE '%sunny%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Nissan-urvan-2025.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Nissan-urvan-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Nissan'))
  AND LOWER(name) LIKE '%urvan%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Nissan-x-trail-e-power-2025.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Nissan-x-trail-e-power-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Nissan'))
  AND LOWER(name) LIKE '%x%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Renault-duster-2024.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Renault-duster-2024.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Renault'))
  AND LOWER(name) LIKE '%duster%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Renault-megane-2024.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Renault-megane-2024.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Renault'))
  AND LOWER(name) LIKE '%megane%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Renault-megane-grand-coupé-2025.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Renault-megane-grand-coupé-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Renault'))
  AND LOWER(name) LIKE '%megane%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Toyota-belta-2024.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Toyota-belta-2024.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Toyota'))
  AND LOWER(name) LIKE '%belta%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Toyota-camry-2024.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Toyota-camry-2024.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Toyota'))
  AND LOWER(name) LIKE '%camry%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Toyota-camry-2025.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Toyota-camry-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Toyota'))
  AND LOWER(name) LIKE '%camry%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Toyota-coaster-2024.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Toyota-coaster-2024.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Toyota'))
  AND LOWER(name) LIKE '%coaster%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Toyota-corolla-2026.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Toyota-corolla-2026.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Toyota'))
  AND LOWER(name) LIKE '%corolla%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Toyota-corolla-all-trims-2026.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Toyota-corolla-all-trims-2026.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Toyota'))
  AND LOWER(name) LIKE '%corolla%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Toyota-hiace-ace-2025.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Toyota-hiace-ace-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Toyota'))
  AND LOWER(name) LIKE '%hiace%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Toyota-hilux-2025.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Toyota-hilux-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Toyota'))
  AND LOWER(name) LIKE '%hilux%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Toyota-hilux-glx-2025.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Toyota-hilux-glx-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Toyota'))
  AND LOWER(name) LIKE '%hilux%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Toyota-rav4-2024.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Toyota-rav4-2024.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Toyota'))
  AND LOWER(name) LIKE '%rav4%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- Update hero for: Toyota-rav4-2025.jpg
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Toyota-rav4-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Toyota'))
  AND LOWER(name) LIKE '%rav4%'
  AND (hero_image_url IS NULL OR hero_image_url LIKE '/cars/%');


-- ============================================
-- HOVER IMAGES (60 files)
-- ============================================

-- Update hover for: Audi-q7-2024-25.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/Audi-q7-2024-25.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Audi'))
  AND LOWER(name) LIKE '%q7%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: Audi-q7-2025.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/Audi-q7-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Audi'))
  AND LOWER(name) LIKE '%q7%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: BMW-x1---ix1-2025.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/BMW-x1---ix1-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('BMW'))
  AND LOWER(name) LIKE '%x1%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: BMW-x1-ix1-2025.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/BMW-x1-ix1-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('BMW'))
  AND LOWER(name) LIKE '%x1%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: Chery-arrizo-5-2024.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/Chery-arrizo-5-2024.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Chery'))
  AND LOWER(name) LIKE '%arrizo%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: Chery-arrizo-8-2025.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/Chery-arrizo-8-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Chery'))
  AND LOWER(name) LIKE '%arrizo%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: Chery-tiggo-7-pro-max-2025.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/Chery-tiggo-7-pro-max-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Chery'))
  AND LOWER(name) LIKE '%tiggo%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: Chery-tiggo-8-pro-2024.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/Chery-tiggo-8-pro-2024.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Chery'))
  AND LOWER(name) LIKE '%tiggo%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: Chery-tiggo-8-pro-max-2025.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/Chery-tiggo-8-pro-max-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Chery'))
  AND LOWER(name) LIKE '%tiggo%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: Chevrolet-captiva-2025.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/Chevrolet-captiva-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Chevrolet'))
  AND LOWER(name) LIKE '%captiva%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: Chevrolet-move-van-2024.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/Chevrolet-move-van-2024.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Chevrolet'))
  AND LOWER(name) LIKE '%move%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: Chevrolet-optra-2026.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/Chevrolet-optra-2026.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Chevrolet'))
  AND LOWER(name) LIKE '%optra%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: Hyundai-accent-rb-2024.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/Hyundai-accent-rb-2024.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Hyundai'))
  AND LOWER(name) LIKE '%accent%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: Hyundai-accent-rb-gl-dab-abs-plus-prime-equiv-2025.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/Hyundai-accent-rb-gl-dab-abs-plus-prime-equiv-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Hyundai'))
  AND LOWER(name) LIKE '%accent%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: Hyundai-bayon-2024.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/Hyundai-bayon-2024.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Hyundai'))
  AND LOWER(name) LIKE '%bayon%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: Hyundai-bayon-2025.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/Hyundai-bayon-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Hyundai'))
  AND LOWER(name) LIKE '%bayon%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: Hyundai-elantra-cn7-2024.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/Hyundai-elantra-cn7-2024.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Hyundai'))
  AND LOWER(name) LIKE '%elantra%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: Hyundai-elantra-cn7-smart-prime-2025.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/Hyundai-elantra-cn7-smart-prime-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Hyundai'))
  AND LOWER(name) LIKE '%elantra%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: Hyundai-i10-2024.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/Hyundai-i10-2024.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Hyundai'))
  AND LOWER(name) LIKE '%i10%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: Hyundai-tucson-nx4-2024.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/Hyundai-tucson-nx4-2024.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Hyundai'))
  AND LOWER(name) LIKE '%tucson%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: Hyundai-tucson-nx4-premium-2025.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/Hyundai-tucson-nx4-premium-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Hyundai'))
  AND LOWER(name) LIKE '%tucson%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: Kia-grand-cerato-2024.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/Kia-grand-cerato-2024.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Kia'))
  AND LOWER(name) LIKE '%grand%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: Kia-seltos-2025.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/Kia-seltos-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Kia'))
  AND LOWER(name) LIKE '%seltos%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: Kia-sorento-2024.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/Kia-sorento-2024.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Kia'))
  AND LOWER(name) LIKE '%sorento%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: Kia-sportage-2025.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/Kia-sportage-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Kia'))
  AND LOWER(name) LIKE '%sportage%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: Kia-xceed-2024.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/Kia-xceed-2024.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Kia'))
  AND LOWER(name) LIKE '%xceed%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: MG-hs-2024.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/MG-hs-2024.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('MG'))
  AND LOWER(name) LIKE '%hs%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: MG-mg-4-ev-2024.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/MG-mg-4-ev-2024.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('MG'))
  AND LOWER(name) LIKE '%mg%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: MG-mg-4-ev-2025.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/MG-mg-4-ev-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('MG'))
  AND LOWER(name) LIKE '%mg%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: MG-mg-5-2025.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/MG-mg-5-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('MG'))
  AND LOWER(name) LIKE '%mg%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: MG-mg-5-amended-2025.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/MG-mg-5-amended-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('MG'))
  AND LOWER(name) LIKE '%mg%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: MG-mg-6-2024.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/MG-mg-6-2024.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('MG'))
  AND LOWER(name) LIKE '%mg%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: MG-mg-hs-2025.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/MG-mg-hs-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('MG'))
  AND LOWER(name) LIKE '%mg%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: MG-mg-zs-lux-2025.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/MG-mg-zs-lux-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('MG'))
  AND LOWER(name) LIKE '%mg%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: MG-rx5-2025.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/MG-rx5-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('MG'))
  AND LOWER(name) LIKE '%rx5%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: MG-zs-2024.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/MG-zs-2024.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('MG'))
  AND LOWER(name) LIKE '%zs%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: Mitsubishi-accessories-2025.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/Mitsubishi-accessories-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Mitsubishi'))
  AND LOWER(name) LIKE '%accessories%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: Mitsubishi-mirage-2024.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/Mitsubishi-mirage-2024.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Mitsubishi'))
  AND LOWER(name) LIKE '%mirage%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: Mitsubishi-mirage-2025.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/Mitsubishi-mirage-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Mitsubishi'))
  AND LOWER(name) LIKE '%mirage%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: Nissan-juke-2025.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/Nissan-juke-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Nissan'))
  AND LOWER(name) LIKE '%juke%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: Nissan-patrol-2025.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/Nissan-patrol-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Nissan'))
  AND LOWER(name) LIKE '%patrol%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: Nissan-qashqai-2025.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/Nissan-qashqai-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Nissan'))
  AND LOWER(name) LIKE '%qashqai%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: Nissan-sentra-2024-25.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/Nissan-sentra-2024-25.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Nissan'))
  AND LOWER(name) LIKE '%sentra%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: Nissan-sentra-2025.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/Nissan-sentra-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Nissan'))
  AND LOWER(name) LIKE '%sentra%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: Nissan-sunny-2025.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/Nissan-sunny-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Nissan'))
  AND LOWER(name) LIKE '%sunny%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: Nissan-urvan-2025.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/Nissan-urvan-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Nissan'))
  AND LOWER(name) LIKE '%urvan%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: Nissan-x-trail-e-power-2025.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/Nissan-x-trail-e-power-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Nissan'))
  AND LOWER(name) LIKE '%x%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: Renault-duster-2024.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/Renault-duster-2024.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Renault'))
  AND LOWER(name) LIKE '%duster%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: Toyota-belta-2024.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/Toyota-belta-2024.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Toyota'))
  AND LOWER(name) LIKE '%belta%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: Toyota-camry-2024.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/Toyota-camry-2024.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Toyota'))
  AND LOWER(name) LIKE '%camry%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: Toyota-camry-2025.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/Toyota-camry-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Toyota'))
  AND LOWER(name) LIKE '%camry%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: Toyota-coaster-2024.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/Toyota-coaster-2024.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Toyota'))
  AND LOWER(name) LIKE '%coaster%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: Toyota-corolla-2026.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/Toyota-corolla-2026.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Toyota'))
  AND LOWER(name) LIKE '%corolla%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: Toyota-corolla-all-trims-2026.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/Toyota-corolla-all-trims-2026.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Toyota'))
  AND LOWER(name) LIKE '%corolla%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: Toyota-hiace-ace-2025.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/Toyota-hiace-ace-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Toyota'))
  AND LOWER(name) LIKE '%hiace%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: Toyota-hilux-2025.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/Toyota-hilux-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Toyota'))
  AND LOWER(name) LIKE '%hilux%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: Toyota-hilux-glx-2025.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/Toyota-hilux-glx-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Toyota'))
  AND LOWER(name) LIKE '%hilux%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: Toyota-land-cruiser-250-2025.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/Toyota-land-cruiser-250-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Toyota'))
  AND LOWER(name) LIKE '%land%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: Toyota-rav4-2024.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/Toyota-rav4-2024.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Toyota'))
  AND LOWER(name) LIKE '%rav4%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


-- Update hover for: Toyota-rav4-2025.jpg
UPDATE models
SET hover_image_url = '/images/vehicles/hover/Toyota-rav4-2025.jpg'
WHERE brand_id = (SELECT id FROM brands WHERE LOWER(name) = LOWER('Toyota'))
  AND LOWER(name) LIKE '%rav4%'
  AND (hover_image_url IS NULL OR hover_image_url LIKE '/cars/%');


COMMIT;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Count updated models by brand
SELECT
    b.name as brand,
    COUNT(*) as total_models,
    COUNT(CASE WHEN m.hero_image_url LIKE '/images/vehicles/%' THEN 1 END) as with_hero,
    COUNT(CASE WHEN m.hover_image_url LIKE '/images/vehicles/%' THEN 1 END) as with_hover
FROM models m
JOIN brands b ON m.brand_id = b.id
GROUP BY b.name
ORDER BY total_models DESC;

-- List models still missing images
SELECT
    b.name as brand,
    m.name as model,
    m.year,
    CASE WHEN m.hero_image_url IS NULL THEN '❌' ELSE '✅' END as hero,
    CASE WHEN m.hover_image_url IS NULL THEN '❌' ELSE '✅' END as hover
FROM models m
JOIN brands b ON m.brand_id = b.id
WHERE m.hero_image_url IS NULL OR m.hover_image_url IS NULL
ORDER BY b.name, m.name, m.year;

