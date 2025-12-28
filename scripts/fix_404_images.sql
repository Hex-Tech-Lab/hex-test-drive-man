-- Emergency Fix: Clear 404 Image Paths
-- Date: 2025-12-28 20:00 EET
-- Issue: 12 models have snake_case paths that don't match physical files
-- Solution: Set to NULL temporarily (will show placeholder until proper mapping)
--
-- Affected models (from Vercel 404 logs):
-- - byd_f3.jpg
-- - suzuki_swift.jpg
-- - suzuki_fronx.jpg
-- - fiat_tipo.jpg
-- - jetour_x70.jpg
-- - geely_coolray.jpg
-- - haval_jolion.jpg
-- - jac_j7.jpg
-- - baic_x3.jpg
-- - peugeot_3008.jpg
-- - opel_mokka.jpg
-- - citroen_c4.jpg

BEGIN;

-- Clear all snake_case hero image paths (these don't match physical files)
UPDATE models
SET hero_image_url = '/images/vehicles/hero/placeholder.webp'
WHERE hero_image_url LIKE '%\_%'
  AND hero_image_url NOT LIKE '%placeholder%';

-- Clear all snake_case hover image paths
UPDATE models
SET hover_image_url = '/images/vehicles/hover/placeholder.webp'
WHERE hover_image_url LIKE '%\_%'
  AND hover_image_url NOT LIKE '%placeholder%';

-- Verify changes
SELECT
  name,
  brands.name as brand,
  hero_image_url,
  hover_image_url
FROM models
JOIN brands ON models.brand_id = brands.id
WHERE hero_image_url LIKE '%placeholder%'
   OR hover_image_url LIKE '%placeholder%'
ORDER BY brands.name, name
LIMIT 20;

COMMIT;

-- Summary:
-- This fixes immediate 404 errors by reverting to placeholders
-- Next step: Apply auto_mapped.sql to fix 229 correct paths
-- Future: Manual mapping for remaining models
