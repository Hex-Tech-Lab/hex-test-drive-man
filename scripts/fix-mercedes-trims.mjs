#!/usr/bin/env node
/**
 * Emergency fix: Insert missing Mercedes-Benz vehicle trims
 * Models exist but trims are missing - this adds them
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MERCEDES_BRAND_ID = '82ac7a95-b107-4b14-a431-608e0d01f5ba';

if (!SERVICE_KEY) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY not set in environment');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function main() {
  console.log('🔧 Fixing Mercedes-Benz missing trims...\n');

  // Get all Mercedes models
  const { data: models, error } = await supabase
    .from('models')
    .select('id, name')
    .eq('brand_id', MERCEDES_BRAND_ID);

  if (error || !models) {
    console.error('Failed to fetch Mercedes models:', error);
    process.exit(1);
  }

  console.log(`Found ${models.length} Mercedes models`);

  let inserted = 0;
  let skipped = 0;

  for (const model of models) {
    // Check if trim already exists
    const { data: existing } = await supabase
      .from('vehicle_trims')
      .select('id')
      .eq('model_id', model.id)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log(`  ⏭️  ${model.name} - already has trims, skipping`);
      skipped++;
      continue;
    }

    // Insert base trim
    const { error: insertError } = await supabase
      .from('vehicle_trims')
      .insert({
        model_id: model.id,
        trim_name: 'Base',
        model_year: 2025,
        price_egp: 0,  // TBD - user will update
        is_imported: true,
        is_electric: false,
        is_hybrid: false,
        trim_count: 1,
      });

    if (insertError) {
      console.log(`  ❌ ${model.name} - failed: ${insertError.message}`);
    } else {
      console.log(`  ✅ ${model.name} - trim inserted`);
      inserted++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Inserted: ${inserted}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Total: ${models.length}`);

  process.exit(0);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
