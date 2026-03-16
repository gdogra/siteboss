const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://bjwsglnltidghrnkxdhv.supabase.co';
const supabaseKey = 'sb_publishable_okspTyuOCPHf_iMMC_hrbw_q-hnlaek';

const supabase = createClient(supabaseUrl, supabaseKey);

// Read the SQL schema file
const schema = fs.readFileSync('/Users/gautamdogra/Projects/siteboss/rebuild_db.sql', 'utf8');

// Split the schema into individual statements
const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);

async function setupDatabase() {
  console.log('Setting up Supabase database...');
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i].trim();
    if (statement.length > 0) {
      console.log(`Executing statement ${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error) {
          console.error(`Error executing statement ${i + 1}:`, error);
        } else {
          console.log(`Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.error(`Exception executing statement ${i + 1}:`, err);
      }
    }
  }
  
  console.log('Database setup complete!');
}

setupDatabase().catch(console.error);