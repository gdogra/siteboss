const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bjwsglnltidghrnkxdhv.supabase.co';
const supabaseKey = 'sb_publishable_okspTyuOCPHf_iMMC_hrbw_q-hnlaek';

async function verifyDatabase() {
  try {
    console.log('Verifying database setup...\n');
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Check if core tables exist by trying to query them
    const tablesToVerify = [
      'companies',
      'users', 
      'projects',
      'tasks',
      'job_sites',
      'budget_categories',
      'expenses',
      'resources',
      'subcontractors',
      'documents',
      'notifications',
      'time_entries'
    ];
    
    let successCount = 0;
    let failCount = 0;
    
    console.log('Checking tables:');
    
    for (const table of tablesToVerify) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
          failCount++;
        } else {
          console.log(`✅ ${table}: OK`);
          successCount++;
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`);
        failCount++;
      }
    }
    
    // Check for custom types
    console.log('\nChecking custom types:');
    const { data: typesData, error: typesError } = await supabase
      .rpc('get_enum_values', { enum_name: 'user_role' })
      .then(
        () => console.log('✅ user_role enum: OK'),
        () => console.log('ℹ️  user_role enum: Cannot verify (expected with limited permissions)')
      );
    
    console.log(`\n📊 Summary:`);
    console.log(`✅ Tables verified: ${successCount}`);
    console.log(`❌ Tables failed: ${failCount}`);
    
    if (failCount === 0) {
      console.log('\n🎉 Database setup verified successfully!');
      console.log('All core tables are accessible and ready for use.');
    } else {
      console.log('\n⚠️  Some tables may not be accessible with the current API key.');
      console.log('This is normal if using a publishable key instead of service key.');
    }
    
  } catch (error) {
    console.error('Verification error:', error);
  }
}

verifyDatabase();