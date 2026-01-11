import { config } from "dotenv";
import "dotenv/config";
config({ path: ".env.local" });
/**
 * Apply Mercedes-Benz + Hongqi migrations
 * Inserts models and trims using Supabase service role
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const MERCEDES_BRAND_ID = '82ac7a95-b107-4b14-a431-608e0d01f5ba';

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

interface MercedesModel {
  name: string;
  year: number;
  hero_image: string;
  filename: string;
}

async function applyMercedesMigration() {
  console.log('\n=== MERCEDES-BENZ MIGRATION ===');
  
  const modelsData = fs.readFileSync('/vercel/sandbox/scripts/mercedes_models.json', 'utf8');
  const models: MercedesModel[] = JSON.parse(modelsData);
  
  console.log(`📦 Loaded ${models.length} models from JSON\n`);
  
  let successCount = 0;
  let errorCount = 0;

  for (const model of models) {
    process.stdout.write(`   ${model.name.padEnd(30, ' ')} ... `);
    
    try {
      // Insert model
      const { data: modelData, error: modelError } = await supabase
        .from('models')
        .insert({
          brand_id: MERCEDES_BRAND_ID,
          name: model.name,
          hero_image_url: `/images/vehicles/hero/${model.hero_image}`,
        })
        .select('id')
        .single();

      if (modelError) {
        throw new Error(`Model insert failed: ${modelError.message}`);
      }

      const modelId = modelData.id;

      // Insert default trim
      const { error: trimError } = await supabase
        .from('vehicle_trims')
        .insert({
          model_id: modelId,
          trim_name: 'Base',
          model_year: model.year,
          price_egp: 0,
        });

      if (trimError && !trimError.message.includes('duplicate')) {
        console.log(`⚠️  (trim warning: ${trimError.message})`);
      } else {
        console.log('✅');
      }

      successCount++;
    } catch (error: any) {
      console.log(`❌ ${error.message}`);
      errorCount++;
    }
  }

  console.log(`\n📊 Mercedes-Benz Results:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  
  return errorCount === 0;
}

async function applyHongqiMigration() {
  console.log('\n=== HONGQI MIGRATION ===');
  
  try {
    // Create Hongqi brand
    console.log('   Creating Hongqi brand...');
    const { data: brandData, error: brandError } = await supabase
      .from('brands')
      .insert({
        name: 'Hongqi',
        logo_url: '/images/brands/hongqi.png',
      })
      .select('id')
      .single();

    if (brandError) {
      // Check if brand already exists
      const { data: existingBrand } = await supabase
        .from('brands')
        .select('id')
        .eq('name', 'Hongqi')
        .single();
      
      if (existingBrand) {
        console.log(`   ✅ Hongqi brand already exists: ${existingBrand.id}`);
        const hongqiBrandId = existingBrand.id;
        
        // Create H9 model
        console.log('   Creating H9 model...');
        const { data: modelData, error: modelError } = await supabase
          .from('models')
          .insert({
            brand_id: hongqiBrandId,
            name: 'H9',
            hero_image_url: '/images/vehicles/hero/hongqi-hongqi-h9-2025-catalogue-ksa-en.jpg',
          })
          .select('id')
          .single();

        if (modelError) {
          throw new Error(`H9 model insert failed: ${modelError.message}`);
        }

        console.log(`   ✅ H9 model: ${modelData.id}`);

        // Create default trim
        console.log('   Creating Base trim...');
        await supabase
          .from('vehicle_trims')
          .insert({
            model_id: modelData.id,
            trim_name: 'Base',
            model_year: 2025,
            price_egp: 0,
          });

        console.log(`   ✅ Base trim created`);
        console.log('\n📊 Hongqi Results: ✅ Success');
        return true;
      }
      
      throw new Error(`Failed to create Hongqi brand: ${brandError.message}`);
    }

    const hongqiBrandId = brandData.id;
    console.log(`   ✅ Hongqi brand: ${hongqiBrandId}`);

    // Create H9 model
    console.log('   Creating H9 model...');
    const { data: modelData, error: modelError } = await supabase
      .from('models')
      .insert({
        brand_id: hongqiBrandId,
        name: 'H9',
        hero_image_url: '/images/vehicles/hero/hongqi-hongqi-h9-2025-catalogue-ksa-en.jpg',
      })
      .select('id')
      .single();

    if (modelError) {
      throw new Error(`H9 model insert failed: ${modelError.message}`);
    }

    console.log(`   ✅ H9 model: ${modelData.id}`);

    // Create default trim
    console.log('   Creating Base trim...');
    await supabase
      .from('vehicle_trims')
      .insert({
        model_id: modelData.id,
        trim_name: 'Base',
        model_year: 2025,
        price_egp: 0,
      });

    console.log(`   ✅ Base trim created`);
    console.log('\n📊 Hongqi Results: ✅ Success');
    return true;

  } catch (error: any) {
    console.error(`\n❌ Hongqi migration failed: ${error.message}`);
    return false;
  }
}

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
