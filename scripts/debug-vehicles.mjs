#!/usr/bin/env node
/**
 * Debug script to investigate vehicle 404 issues
 * Uses direct Supabase client to check vehicle names in database
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lbttmhwckcrfdymwyuhn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxidHRtaHdja2NyZmR5bXd5dWhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MzYyNzAsImV4cCI6MjA3ODIxMjI3MH0.kw9jPN7GuzTlAims_7B_UEnicaVmGklBiQF9IlVE_I4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function query(modelSearch, brandSearch = null) {
  let queryBuilder = supabase
    .from('vehicle_trims')
    .select('id,trim_name,model_year,models!inner(name,brands!inner(name))');

  if (modelSearch) {
    queryBuilder = queryBuilder.ilike('models.name', `%${modelSearch}%`);
  }

  if (brandSearch) {
    queryBuilder = queryBuilder.ilike('models.brands.name', `%${brandSearch}%`);
  }

  const { data, error } = await queryBuilder.limit(100);

  if (error) {
    console.error('Query error:', error);
    return [];
  }

  return data || [];
}

async function main() {
  console.log('=== Debugging Vehicle 404 Issues ===\n');

  // Test 1: Audi Q7
  console.log('1. Searching for Audi Q7...');
  const audiResults = await query('Q7', 'Audi');
  console.log(`   Found ${audiResults.length} results:`);
  if (audiResults.length > 0) {
    console.log(`   Sample result structure:`, JSON.stringify(audiResults[0], null, 2));
    audiResults.slice(0, 3).forEach(v => {
      const model = v.models;
      const brand = model?.brands;
      console.log(`   - ${brand?.name || 'NO BRAND'} ${model?.name || 'NO MODEL'} ${v.model_year} (${v.trim_name})`);
    });
  }

  // Test 2: Changan Uni-T
  console.log('\n2. Searching for Changan Uni-T...');
  const unitResults = await query('Uni', 'Changan');
  console.log(`   Found ${unitResults.length} results:`);
  unitResults.forEach(v => {
    const model = v.models;
    const brand = model?.brands;
    console.log(`   - ${brand?.name || 'NO BRAND'} ${model?.name || 'NO MODEL'} ${v.model_year} (${v.trim_name})`);
  });

  // Test 3: Changan Uni-V
  console.log('\n3. Searching for Changan Uni-V (2026)...');
  const univResults = await query('Uni', 'Changan');
  const univ2026 = univResults.filter(v => v.model_year === 2026);
  console.log(`   Found ${univ2026.length} results for 2026:`);
  univ2026.forEach(v => {
    const model = v.models;
    const brand = model?.brands;
    console.log(`   - ${brand?.name || 'NO BRAND'} ${model?.name || 'NO MODEL'} ${v.model_year} (${v.trim_name})`);
  });

  // Test 4: Mercedes-Benz
  console.log('\n4. Searching for Mercedes-Benz...');
  const mercedesResults = await query('', 'Mercedes');
  console.log(`   Found ${mercedesResults.length} results:`);
  const uniqueModels = [...new Set(mercedesResults.map(v => v.models?.name).filter(Boolean))];
  console.log(`   Unique models: ${uniqueModels.join(', ')}`);

  // Test 5: Check slug generation
  console.log('\n5. Testing slug generation for problematic vehicles...');
  const testCases = [
    { brand: 'Audi', model: 'Q7', year: 2025 },
    { brand: 'Changan', model: 'Uni-T', year: 2026 },
    { brand: 'Changan', model: 'Uni-V', year: 2026 },
  ];

  for (const testCase of testCases) {
    const slug = `${testCase.brand.toLowerCase().replace(/\s+/g, '-')}-${testCase.model.toLowerCase().replace(/\s+/g, '-')}-${testCase.year}`;
    const modelName = testCase.model.toLowerCase().replace(/-/g, ' ');
    console.log(`   ${testCase.brand} ${testCase.model} ${testCase.year}:`);
    console.log(`     Expected slug: ${slug}`);
    console.log(`     Query model name: "${modelName}"`);

    // Check if this would match
    const matches = await query(modelName, testCase.brand);
    const yearMatches = matches.filter(v => v.model_year === testCase.year);
    console.log(`     DB matches: ${matches.length} total, ${yearMatches.length} for ${testCase.year}`);
    if (yearMatches.length > 0) {
      console.log(`     Actual DB name: "${yearMatches[0].models?.name || 'UNKNOWN'}"`);
    }
  }

  console.log('\n=== End of Debug ===');
  process.exit(0);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
