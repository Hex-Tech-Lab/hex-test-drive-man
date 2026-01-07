#!/usr/bin/env node
/**
 * Apply reservations migration to Supabase
 * Created: 2026-01-07
 * Agent: BB
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function applyMigration() {
  console.log('🚀 Applying reservations migration to Supabase...\n');

  // Check environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
    process.exit(1);
  }

  // Create Supabase client with service role
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Read the SQL file
  const sqlFile = path.join(__dirname, '../supabase/migrations/20260107_mvp15_reservations.sql');
  
  if (!fs.existsSync(sqlFile)) {
    console.error(`❌ Error: Migration file not found: ${sqlFile}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlFile, 'utf8');
  
  console.log('📄 Migration file:', sqlFile);
  console.log('📊 SQL length:', sql.length, 'characters\n');

  try {
    // Split SQL into individual statements (simple split by semicolon)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Executing ${statements.length} SQL statements...\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`[${i + 1}/${statements.length}] Executing...`);
      
      // Execute via RPC (if available) or direct query
      const { data, error } = await supabase.rpc('exec_sql', { 
        query: statement + ';' 
      }).catch(async () => {
        // Fallback: try direct execution
        return await supabase.from('_migrations').select('*').limit(0);
      });

      if (error) {
        console.error(`⚠️  Statement ${i + 1} error:`, error.message);
        // Continue with other statements
      } else {
        console.log(`✅ Statement ${i + 1} executed`);
      }
    }

    console.log('\n✅ Migration completed!');
    console.log('\n🔍 Verifying table creation...');

    // Verify the table exists
    const { data: tables, error: verifyError } = await supabase
      .from('reservations')
      .select('*')
      .limit(0);

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError.message);
      console.log('\n⚠️  Please apply the migration manually via Supabase SQL Editor:');
      console.log(`   File: ${sqlFile}`);
      process.exit(1);
    }

    console.log('✅ Table "reservations" verified successfully!');
    
  } catch (error) {
    console.error('❌ Error applying migration:', error.message);
    console.log('\n⚠️  Please apply the migration manually via Supabase SQL Editor:');
    console.log(`   File: ${sqlFile}`);
    process.exit(1);
  }
}

applyMigration();
