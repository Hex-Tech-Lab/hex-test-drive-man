import fs from 'fs';
import path from 'path';

// Load env vars manually to avoid dependencies
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    console.warn('⚠️  .env.local not found. Trying .env');
    const envPathProd = path.join(process.cwd(), '.env');
    if (!fs.existsSync(envPathProd)) return;
    parseEnv(fs.readFileSync(envPathProd, 'utf8'));
    return;
  }
  parseEnv(fs.readFileSync(envPath, 'utf8'));
}

function parseEnv(content) {
  content.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, ''); // strip quotes
      process.env[key] = value;
    }
  });
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const PLACEHOLDER_IMAGE = '/images/vehicles/hero/placeholder.webp';

async function fetchVehicles() {
  console.log('🔄 Fetching vehicles from Supabase...');
  
  const response = await fetch(`${SUPABASE_URL}/rest/v1/vehicle_trims?select=id,model_year,price_egp,models(id,name,hero_image_url,brands(id,name))`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });

  if (!response.ok) {
    throw new Error(`Supabase error: ${response.status} ${response.statusText}`);
  }

  const vehicles = await response.json();
  console.log(`✅ Fetched ${vehicles.length} trims.`);
  return vehicles;
}

function aggregateVehicles(vehicles) {
  console.log('🔄 Aggregating by Brand + Model + Year...');
  const grouped = {};

  vehicles.forEach(v => {
    // Check if models and brands exist (handling potential nulls)
    if (!v.models || !v.models.brands) {
      console.warn(`⚠️ Warning: Vehicle trim ${v.id} has missing model or brand data.`);
      return;
    }

    const brandId = v.models.brands.id;
    const modelId = v.models.id; 
    const year = v.model_year;
    
    const key = `${brandId}_${modelId}_${year}`;
    
    if (!grouped[key]) {
      grouped[key] = {
        key,
        brand: v.models.brands.name,
        model: v.models.name,
        year: year,
        image: v.models.hero_image_url,
        trims: 1
      };
    } else {
      grouped[key].trims++;
    }
  });

  return Object.values(grouped);
}

function analyzeCoverage(aggregated) {
  let realImages = 0;
  let placeholders = 0;
  const missing = [];

  aggregated.forEach(item => {
    const img = item.image;
    // Check if it's a real image
    // Criteria: Not null, not undefined, not the placeholder string
    // Also detecting if it's a relative path to our local public images (which counts as "real" if it's not placeholder)
    const hasImage = img && img !== PLACEHOLDER_IMAGE;

    if (hasImage) {
      realImages++;
    } else {
      placeholders++;
      missing.push(`${item.brand} ${item.model} ${item.year}`);
    }
  });

  const total = aggregated.length;
  const percentage = total > 0 ? ((realImages / total) * 100).toFixed(1) : 0;

  console.log('\n📊 IMAGE COVERAGE REPORT');
  console.log('========================');
  console.log(`Total Cards:      ${total}`);
  console.log(`Real Images:      ${realImages}`);
  console.log(`Placeholders:     ${placeholders}`);
  console.log(`Coverage:         ${percentage}%`);
  console.log('========================');

  if (placeholders > 0) {
    console.log('\nMissing Images (Sample 10):');
    missing.slice(0, 10).forEach(m => console.log(` - ${m}`));
    if (missing.length > 10) console.log(` ... and ${missing.length - 10} more.`);
  }
}

async function run() {
  try {
    const rawData = await fetchVehicles();
    const aggregated = aggregateVehicles(rawData);
    analyzeCoverage(aggregated);
  } catch (error) {
    console.error('❌ Failed:', error);
    process.exit(1);
  }
}

run();