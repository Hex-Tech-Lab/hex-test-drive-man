#!/usr/bin/env node
import { config } from "dotenv";
config({ path: ".env.local" });
/**
 * Apply SQL migrations to Supabase via REST API
 * Uses service role key for admin operations
 */

const fs = require('fs');
const https = require('https');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lbttmhwckcrfdymwyuhn.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment');
  process.exit(1);
}

/**
 * Execute SQL via Supabase REST API
 */
async function executeSql(sql) {
  return new Promise((resolve, reject) => {
    const url = new URL('/rest/v1/rpc/exec_sql', SUPABASE_URL);
    
    const options = {
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data, statusCode: res.statusCode });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(JSON.stringify({ query: sql }));
    req.end();
  });
}

/**
 * Apply migration file
 */
async function applyMigration(filePath) {
  console.log(`\n📄 Reading: ${filePath}`);
  
  const sql = fs.readFileSync(filePath, 'utf8');
  console.log(`   Size: ${sql.length} bytes`);
  console.log(`   Lines: ${sql.split('\n').length}`);
  
  console.log(`\n🚀 Executing migration...`);
  
  try {
    const result = await executeSql(sql);
    console.log(`✅ Migration applied successfully`);
    console.log(`   Status: ${result.statusCode}`);
    return true;
  } catch (error) {
    console.error(`❌ Migration failed: ${error.message}`);
    return false;
  }
}

/**
 * Main execution
 */
async function main() {
  const migrations = [
    '/vercel/sandbox/supabase/migrations/20260105_mercedes_benz_models.sql',
    '/vercel/sandbox/supabase/migrations/20260105_create_hongqi.sql'
  ];

  console.log('=== SUPABASE MIGRATION TOOL ===');
  console.log(`Target: ${SUPABASE_URL}`);
  console.log(`Migrations: ${migrations.length}`);

  let successCount = 0;
  let failCount = 0;

  for (const migration of migrations) {
    const success = await applyMigration(migration);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  
  process.exit(failCount > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
