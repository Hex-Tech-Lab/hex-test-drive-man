#!/usr/bin/env node
import { config } from "dotenv";
config({ path: ".env.local" });
/**
 * Apply Mercedes-Benz + Hongqi migrations via Supabase client
 * Inserts models and trims directly using the service role key
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing environment variables');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SERVICE_KEY ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const MERCEDES_BRAND_ID = '82ac7a95-b107-4b14-a431-608e0d01f5ba';

/**
 * Load Mercedes models from JSON
 */
function loadMercedesModels() {
  const data = fs.readFileSync('/vercel/sandbox/scripts/mercedes_models.json', 'utf8');
  return JSON.parse(data);
}

/**
 * Insert or update a model
 */
async function upsertModel(brandId, modelName, heroImage) {
  const { data, error } = await supabase
    .from('models')
    .upsert({
      brand_id: brandId,
      name: modelName,
      hero_image_url: `/images/vehicles/hero/${heroImage}`,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'brand_id,name',
      returning: 'representation'
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to upsert model ${modelName}: ${error.message}`);
  }

  return data.id;
}

/**
 * Insert default trim for a model
 */
async function insertTrim(modelId, modelName, year) {
  const { error } = await supabase
    .from('vehicle_trims')
    .insert({
      model_id: modelId,
      trim_name: 'Base',
      model_year: year,
      price_egp: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

  // Ignore conflict errors (trim already exists)
  if (error && !error.message.includes('duplicate')) {
    console.warn(`   ⚠️  Trim insert warning for ${modelName}: ${error.message}`);
  }
}

/**
 * Apply Mercedes-Benz migration
 */
async function applyMercedesMigration() {
  console.log('\n=== MERCEDES-BENZ MIGRATION ===');
  
  const models = loadMercedesModels();
  console.log(`📦 Loaded ${models.length} models from JSON`);
  
  let successCount = 0;
  let errorCount = 0;

  for (const model of models) {
    try {
      process.stdout.write(`   ${model.name.padEnd(30)} ... `);
      
      const modelId = await upsertModel(
        MERCEDES_BRAND_ID,
        model.name,
        model.hero_image
      );
      
      await insertTrim(modelId, model.name, model.year);
      
      console.log('✅');
      successCount++;
    } catch (error) {
      console.log(`❌ ${error.message}`);
      errorCount++;
    }
  }

  console.log(`\n📊 Mercedes-Benz Results:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  
  return errorCount === 0;
}

/**
 * Apply Hongqi migration
 */
async function applyHongqiMigration() {
  console.log('\n=== HONGQI MIGRATION ===');
  
  try {
    // Create Hongqi brand
    console.log('   Creating Hongqi brand...');
    const { data: brandData, error: brandError } = await supabase
      .from('brands')
      .upsert({
        name: 'Hongqi',
        logo_url: '/images/brands/hongqi.png',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'name',
        returning: 'representation'
      })
      .select('id')
      .single();

    if (brandError) {
      throw new Error(`Failed to create Hongqi brand: ${brandError.message}`);
    }

    const hongqiBrandId = brandData.id;
    console.log(`   ✅ Hongqi brand: ${hongqiBrandId}`);

    // Create H9 model
    console.log('   Creating H9 model...');
    const modelId = await upsertModel(
      hongqiBrandId,
      'H9',
      'hongqi-hongqi-h9-2025-catalogue-ksa-en.jpg'
    );
    console.log(`   ✅ H9 model: ${modelId}`);

    // Create default trim
    console.log('   Creating Base trim...');
    await insertTrim(modelId, 'H9', 2025);
    console.log(`   ✅ Base trim created`);

    console.log('\n📊 Hongqi Results: ✅ Success');
    return true;

  } catch (error) {
    console.error(`\n❌ Hongqi migration failed: ${error.message}`);
    return false;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('=== SUPABASE DATA MIGRATION ===');
  console.log(`Target: ${SUPABASE_URL}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);

  const mercedesSuccess = await applyMercedesMigration();
  const hongqiSuccess = await applyHongqiMigration();

  console.log('\n=== FINAL SUMMARY ===');
  console.log(`Mercedes-Benz: ${mercedesSuccess ? '✅' : '❌'}`);
  console.log(`Hongqi: ${hongqiSuccess ? '✅' : '❌'}`);

  if (mercedesSuccess && hongqiSuccess) {
    console.log('\n🎉 All migrations completed successfully!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some migrations failed. Check logs above.');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
