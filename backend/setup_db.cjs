const { Client } = require('pg');
const fs = require('fs');

async function setupDatabase() {
  const client = new Client({
    host: 'db.bjwsglnltidghrnkxdhv.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'UDN9RrlMVzwOr02o',
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully!');

    // Read the SQL file
    const schema = fs.readFileSync('/Users/gautamdogra/Projects/siteboss/backend/src/database/migrations/001_initial_schema.sql', 'utf8');
    
    console.log('Executing schema...');
    await client.query(schema);
    console.log('Schema executed successfully!');

    // Check if tables were created
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    const result = await client.query(tablesQuery);
    console.log('\nTables created:');
    result.rows.forEach(row => console.log(`- ${row.table_name}`));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
    console.log('Connection closed.');
  }
}

setupDatabase();