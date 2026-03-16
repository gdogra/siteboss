const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://bjwsglnltidghrnkxdhv.supabase.co';
const supabaseKey = 'sb_publishable_okspTyuOCPHf_iMMC_hrbw_q-hnlaek';

async function setupDatabase() {
  try {
    console.log('Setting up database using Supabase API...');
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test connection
    console.log('Testing connection...');
    const { data, error } = await supabase.auth.getSession();
    if (error && error.message !== 'Invalid session') {
      console.error('Connection error:', error);
      return;
    }
    
    console.log('Connection successful! Now setup requires direct SQL access.');
    console.log('\nTo complete the database setup:');
    console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard');
    console.log('2. Navigate to your project: bjwsglnltidghrnkxdhv');
    console.log('3. Go to the SQL Editor');
    console.log('4. Copy and paste the SQL schema from: backend/src/database/migrations/001_initial_schema.sql');
    console.log('5. Execute the schema to create all tables');
    
    console.log('\nAlternatively, if you have the service role key (not publishable key):');
    console.log('- Update the SUPABASE_SERVICE_KEY in your .env file');
    console.log('- The service role key has permissions to execute DDL statements');
    
  } catch (error) {
    console.error('Setup error:', error);
  }
}

setupDatabase();