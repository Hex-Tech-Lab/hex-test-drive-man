-- Auto-generated SQL to update hero_image_url
-- Generated from existing images in public/images/vehicles/hero/

BEGIN;

-- AUDI Q3 2024 25
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Audi-q3-2024-25.jpg'
WHERE UPPER(name) LIKE '%Q3 2024%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'AUDI'
  );

-- AUDI Q3 2025
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Audi-q3-2025.jpg'
WHERE UPPER(name) LIKE '%Q3%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'AUDI'
  );

-- AUDI Q7 2024 25
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Audi-q7-2024-25.jpg'
WHERE UPPER(name) LIKE '%Q7 2024%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'AUDI'
  );

-- AUDI Q7 2025
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Audi-q7-2025.jpg'
WHERE UPPER(name) LIKE '%Q7%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'AUDI'
  );

-- BMW 5 SERIES   I5 2025
UPDATE models
SET hero_image_url = '/images/vehicles/hero/BMW-5-series---i5-2025.jpg'
WHERE UPPER(name) LIKE '%5 SERIES   I5%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'BMW'
  );

-- BMW 5 SERIES I5 2025
UPDATE models
SET hero_image_url = '/images/vehicles/hero/BMW-5-series-i5-2025.jpg'
WHERE UPPER(name) LIKE '%5 SERIES I5%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'BMW'
  );

-- BMW X1   IX1 2025
UPDATE models
SET hero_image_url = '/images/vehicles/hero/BMW-x1---ix1-2025.jpg'
WHERE UPPER(name) LIKE '%X1   IX1%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'BMW'
  );

-- BMW X1 IX1 2025
UPDATE models
SET hero_image_url = '/images/vehicles/hero/BMW-x1-ix1-2025.jpg'
WHERE UPPER(name) LIKE '%X1 IX1%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'BMW'
  );

-- BMW X2   IX2 2024
UPDATE models
SET hero_image_url = '/images/vehicles/hero/BMW-x2---ix2-2024.jpg'
WHERE UPPER(name) LIKE '%X2   IX2%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'BMW'
  );

-- BMW X2 IX2 2025
UPDATE models
SET hero_image_url = '/images/vehicles/hero/BMW-x2-ix2-2025.jpg'
WHERE UPPER(name) LIKE '%X2 IX2%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'BMW'
  );

-- BMW X5 LCI 2024
UPDATE models
SET hero_image_url = '/images/vehicles/hero/BMW-x5-lci-2024.jpg'
WHERE UPPER(name) LIKE '%X5 LCI%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'BMW'
  );

-- BMW X5 LCI 2025
UPDATE models
SET hero_image_url = '/images/vehicles/hero/BMW-x5-lci-2025.jpg'
WHERE UPPER(name) LIKE '%X5 LCI%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'BMW'
  );

-- CHERY ARRIZO 5 2024
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Chery-arrizo-5-2024.jpg'
WHERE UPPER(name) LIKE '%ARRIZO 5%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'CHERY'
  );

-- CHERY ARRIZO 8 2025
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Chery-arrizo-8-2025.jpg'
WHERE UPPER(name) LIKE '%ARRIZO 8%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'CHERY'
  );

-- CHERY EQ7 EV 2025
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Chery-eq7-ev-2025.jpg'
WHERE UPPER(name) LIKE '%EQ7 EV%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'CHERY'
  );

-- CHERY TIGGO 3 2024
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Chery-tiggo-3-2024.jpg'
WHERE UPPER(name) LIKE '%TIGGO 3%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'CHERY'
  );

-- CHERY TIGGO 4 PRO 2025
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Chery-tiggo-4-pro-2025.jpg'
WHERE UPPER(name) LIKE '%TIGGO 4 PRO%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'CHERY'
  );

-- CHERY TIGGO 7 PRO MAX 2025
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Chery-tiggo-7-pro-max-2025.jpg'
WHERE UPPER(name) LIKE '%TIGGO 7 PRO MAX%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'CHERY'
  );

-- CHERY TIGGO 8 PRO 2024
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Chery-tiggo-8-pro-2024.jpg'
WHERE UPPER(name) LIKE '%TIGGO 8 PRO%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'CHERY'
  );

-- CHERY TIGGO 8 PRO MAX 2025
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Chery-tiggo-8-pro-max-2025.jpg'
WHERE UPPER(name) LIKE '%TIGGO 8 PRO MAX%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'CHERY'
  );

-- CHEVROLET CAPTIVA 2025
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Chevrolet-captiva-2025.jpg'
WHERE UPPER(name) LIKE '%CAPTIVA%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'CHEVROLET'
  );

-- CHEVROLET MOVE VAN 2024
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Chevrolet-move-van-2024.jpg'
WHERE UPPER(name) LIKE '%MOVE VAN%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'CHEVROLET'
  );

-- CHEVROLET OPTRA 2026
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Chevrolet-optra-2026.jpg'
WHERE UPPER(name) LIKE '%OPTRA%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'CHEVROLET'
  );

-- HYUNDAI BAYON 2024
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Hyundai-bayon-2024.jpg'
WHERE UPPER(name) LIKE '%BAYON%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'HYUNDAI'
  );

-- HYUNDAI BAYON 2025
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Hyundai-bayon-2025.jpg'
WHERE UPPER(name) LIKE '%BAYON%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'HYUNDAI'
  );

-- HYUNDAI ELANTRA CN7 2024
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Hyundai-elantra-cn7-2024.jpg'
WHERE UPPER(name) LIKE '%ELANTRA CN7%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'HYUNDAI'
  );

-- HYUNDAI ELANTRA CN7 SMART PRIME 2025
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Hyundai-elantra-cn7-smart-prime-2025.jpg'
WHERE UPPER(name) LIKE '%ELANTRA CN7 SMART PRIME%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'HYUNDAI'
  );

-- HYUNDAI I10 2024
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Hyundai-i10-2024.jpg'
WHERE UPPER(name) LIKE '%I10%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'HYUNDAI'
  );

-- HYUNDAI I20 2024
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Hyundai-i20-2024.jpg'
WHERE UPPER(name) LIKE '%I20%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'HYUNDAI'
  );

-- HYUNDAI I20 2025
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Hyundai-i20-2025.jpg'
WHERE UPPER(name) LIKE '%I20%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'HYUNDAI'
  );

-- HYUNDAI TUCSON NX4 2024
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Hyundai-tucson-nx4-2024.jpg'
WHERE UPPER(name) LIKE '%TUCSON NX4%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'HYUNDAI'
  );

-- HYUNDAI TUCSON NX4 PREMIUM 2025
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Hyundai-tucson-nx4-premium-2025.jpg'
WHERE UPPER(name) LIKE '%TUCSON NX4 PREMIUM%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'HYUNDAI'
  );

-- KIA GRAND CERATO 2024
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Kia-grand-cerato-2024.jpg'
WHERE UPPER(name) LIKE '%GRAND CERATO%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'KIA'
  );

-- KIA SELTOS 2025
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Kia-seltos-2025.jpg'
WHERE UPPER(name) LIKE '%SELTOS%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'KIA'
  );

-- KIA SORENTO 2024
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Kia-sorento-2024.jpg'
WHERE UPPER(name) LIKE '%SORENTO%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'KIA'
  );

-- KIA SPORTAGE 2025
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Kia-sportage-2025.jpg'
WHERE UPPER(name) LIKE '%SPORTAGE%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'KIA'
  );

-- KIA XCEED 2024
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Kia-xceed-2024.jpg'
WHERE UPPER(name) LIKE '%XCEED%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'KIA'
  );

-- MG HS 2024
UPDATE models
SET hero_image_url = '/images/vehicles/hero/MG-hs-2024.jpg'
WHERE UPPER(name) LIKE '%HS%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'MG'
  );

-- MG MG 4 EV 2024
UPDATE models
SET hero_image_url = '/images/vehicles/hero/MG-mg-4-ev-2024.jpg'
WHERE UPPER(name) LIKE '%MG 4 EV%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'MG'
  );

-- MG MG 4 EV 2025
UPDATE models
SET hero_image_url = '/images/vehicles/hero/MG-mg-4-ev-2025.jpg'
WHERE UPPER(name) LIKE '%MG 4 EV%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'MG'
  );

-- MG MG 5 2025
UPDATE models
SET hero_image_url = '/images/vehicles/hero/MG-mg-5-2025.jpg'
WHERE UPPER(name) LIKE '%MG 5%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'MG'
  );

-- MG MG 5 AMENDED 2025
UPDATE models
SET hero_image_url = '/images/vehicles/hero/MG-mg-5-amended-2025.jpg'
WHERE UPPER(name) LIKE '%MG 5 AMENDED%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'MG'
  );

-- MG MG 6 2024
UPDATE models
SET hero_image_url = '/images/vehicles/hero/MG-mg-6-2024.jpg'
WHERE UPPER(name) LIKE '%MG 6%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'MG'
  );

-- MG MG HS 2025
UPDATE models
SET hero_image_url = '/images/vehicles/hero/MG-mg-hs-2025.jpg'
WHERE UPPER(name) LIKE '%MG HS%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'MG'
  );

-- MG MG ZS LUX 2025
UPDATE models
SET hero_image_url = '/images/vehicles/hero/MG-mg-zs-lux-2025.jpg'
WHERE UPPER(name) LIKE '%MG ZS LUX%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'MG'
  );

-- MG RX5 2025
UPDATE models
SET hero_image_url = '/images/vehicles/hero/MG-rx5-2025.jpg'
WHERE UPPER(name) LIKE '%RX5%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'MG'
  );

-- MG ZS 2024
UPDATE models
SET hero_image_url = '/images/vehicles/hero/MG-zs-2024.jpg'
WHERE UPPER(name) LIKE '%ZS%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'MG'
  );

-- MERCEDES C CLASS W206 2025
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Mercedes-c-class-w206-2025.jpg'
WHERE UPPER(name) LIKE '%C CLASS W206%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'MERCEDES'
  );

-- MITSUBISHI ACCESSORIES 2025
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Mitsubishi-accessories-2025.jpg'
WHERE UPPER(name) LIKE '%ACCESSORIES%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'MITSUBISHI'
  );

-- MITSUBISHI ATTRAGE 2024
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Mitsubishi-attrage-2024.jpg'
WHERE UPPER(name) LIKE '%ATTRAGE%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'MITSUBISHI'
  );

-- MITSUBISHI ATTRAGE 2025
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Mitsubishi-attrage-2025.jpg'
WHERE UPPER(name) LIKE '%ATTRAGE%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'MITSUBISHI'
  );

-- MITSUBISHI MIRAGE 2024
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Mitsubishi-mirage-2024.jpg'
WHERE UPPER(name) LIKE '%MIRAGE%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'MITSUBISHI'
  );

-- MITSUBISHI MIRAGE 2025
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Mitsubishi-mirage-2025.jpg'
WHERE UPPER(name) LIKE '%MIRAGE%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'MITSUBISHI'
  );

-- NISSAN JUKE 2025
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Nissan-juke-2025.jpg'
WHERE UPPER(name) LIKE '%JUKE%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'NISSAN'
  );

-- NISSAN PATROL 2025
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Nissan-patrol-2025.jpg'
WHERE UPPER(name) LIKE '%PATROL%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'NISSAN'
  );

-- NISSAN QASHQAI 2025
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Nissan-qashqai-2025.jpg'
WHERE UPPER(name) LIKE '%QASHQAI%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'NISSAN'
  );

-- NISSAN SENTRA 2024 25
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Nissan-sentra-2024-25.jpg'
WHERE UPPER(name) LIKE '%SENTRA 2024%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'NISSAN'
  );

-- NISSAN SENTRA 2025
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Nissan-sentra-2025.jpg'
WHERE UPPER(name) LIKE '%SENTRA%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'NISSAN'
  );

-- NISSAN SUNNY 2025
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Nissan-sunny-2025.jpg'
WHERE UPPER(name) LIKE '%SUNNY%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'NISSAN'
  );

-- NISSAN URVAN 2025
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Nissan-urvan-2025.jpg'
WHERE UPPER(name) LIKE '%URVAN%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'NISSAN'
  );

-- NISSAN X TRAIL E POWER 2025
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Nissan-x-trail-e-power-2025.jpg'
WHERE UPPER(name) LIKE '%X TRAIL E POWER%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'NISSAN'
  );

-- RENAULT DUSTER 2024
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Renault-duster-2024.jpg'
WHERE UPPER(name) LIKE '%DUSTER%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'RENAULT'
  );

-- RENAULT MEGANE 2024
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Renault-megane-2024.jpg'
WHERE UPPER(name) LIKE '%MEGANE%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'RENAULT'
  );

-- RENAULT MEGANE GRAND COUPÉ 2025
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Renault-megane-grand-coupé-2025.jpg'
WHERE UPPER(name) LIKE '%MEGANE GRAND COUPÉ%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'RENAULT'
  );

-- TOYOTA BELTA 2024
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Toyota-belta-2024.jpg'
WHERE UPPER(name) LIKE '%BELTA%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'TOYOTA'
  );

-- TOYOTA CAMRY 2024
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Toyota-camry-2024.jpg'
WHERE UPPER(name) LIKE '%CAMRY%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'TOYOTA'
  );

-- TOYOTA CAMRY 2025
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Toyota-camry-2025.jpg'
WHERE UPPER(name) LIKE '%CAMRY%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'TOYOTA'
  );

-- TOYOTA COASTER 2024
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Toyota-coaster-2024.jpg'
WHERE UPPER(name) LIKE '%COASTER%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'TOYOTA'
  );

-- TOYOTA COROLLA 2026
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Toyota-corolla-2026.jpg'
WHERE UPPER(name) LIKE '%COROLLA%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'TOYOTA'
  );

-- TOYOTA COROLLA ALL TRIMS 2026
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Toyota-corolla-all-trims-2026.jpg'
WHERE UPPER(name) LIKE '%COROLLA ALL TRIMS%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'TOYOTA'
  );

-- TOYOTA HIACE ACE 2025
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Toyota-hiace-ace-2025.jpg'
WHERE UPPER(name) LIKE '%HIACE ACE%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'TOYOTA'
  );

-- TOYOTA HILUX 2025
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Toyota-hilux-2025.jpg'
WHERE UPPER(name) LIKE '%HILUX%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'TOYOTA'
  );

-- TOYOTA HILUX GLX 2025
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Toyota-hilux-glx-2025.jpg'
WHERE UPPER(name) LIKE '%HILUX GLX%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'TOYOTA'
  );

-- TOYOTA RAV4 2024
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Toyota-rav4-2024.jpg'
WHERE UPPER(name) LIKE '%RAV4%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'TOYOTA'
  );

-- TOYOTA RAV4 2025
UPDATE models
SET hero_image_url = '/images/vehicles/hero/Toyota-rav4-2025.jpg'
WHERE UPPER(name) LIKE '%RAV4%'
  AND EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = models.brand_id
    AND UPPER(brands.name) = 'TOYOTA'
  );

COMMIT;

-- Total images: 75
