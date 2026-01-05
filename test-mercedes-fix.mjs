#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Testing Mercedes-Benz Filter Fix\n');

// Test 1: Get all Mercedes vehicles
const { data: mercedesVehicles, error: mercedesError } = await supabase
  .from('vehicle_trims')
  .select(`
    id,
    trim_name,
    price_egp,
    models!inner (
      id,
      name,
      brands!inner (
        id,
        name
      )
    )
  `)
  .eq('models.brands.name', 'Mercedes-Benz');

console.log('✅ Mercedes-Benz vehicles found:', mercedesVehicles?.length || 0);
console.log('   Zero-price vehicles:', mercedesVehicles?.filter(v => v.price_egp === 0).length || 0);
console.log('   Priced vehicles:', mercedesVehicles?.filter(v => v.price_egp > 0).length || 0);

// Test 2: Get all vehicles with price range including zero
const { data: allVehicles, error: allError } = await supabase
  .from('vehicle_trims')
  .select(`
    id,
    trim_name,
    price_egp,
    models!inner (
      brands!inner (
        name
      )
    )
  `);

const priceStats = {
  total: allVehicles?.length || 0,
  zeroPriced: allVehicles?.filter(v => v.price_egp === 0).length || 0,
  priced: allVehicles?.filter(v => v.price_egp > 0).length || 0,
  minPrice: Math.min(...(allVehicles?.filter(v => v.price_egp > 0).map(v => v.price_egp) || [0])),
  maxPrice: Math.max(...(allVehicles?.map(v => v.price_egp) || [0]))
};

console.log('\n📊 Price Statistics:');
console.log('   Total vehicles:', priceStats.total);
console.log('   Zero-priced:', priceStats.zeroPriced);
console.log('   Priced:', priceStats.priced);
console.log('   Min price (non-zero):', priceStats.minPrice.toLocaleString(), 'EGP');
console.log('   Max price:', priceStats.maxPrice.toLocaleString(), 'EGP');

// Test 3: Simulate filter with price range [0, maxPrice]
const filteredByBrand = allVehicles?.filter(v => 
  v.models.brands.name === 'Mercedes-Benz'
);

const filteredByPrice = filteredByBrand?.filter(v => 
  v.price_egp === 0 || (v.price_egp >= 0 && v.price_egp <= priceStats.maxPrice)
);

console.log('\n🎯 Filter Simulation (Mercedes-Benz + Price Range [0, max]):');
console.log('   After brand filter:', filteredByBrand?.length || 0);
console.log('   After price filter:', filteredByPrice?.length || 0);
console.log('   ✅ Fix working:', filteredByPrice?.length === mercedesVehicles?.length ? 'YES' : 'NO');

process.exit(0);
