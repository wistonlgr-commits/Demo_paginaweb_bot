import pg from 'pg';
import fs from 'fs';

const connectionString = 'postgresql://postgres:.Leor0612..@db.eittsmxiqmzupwffghqy.supabase.co:5432/postgres';

const client = new pg.Client({
  connectionString,
});

async function run() {
  await client.connect();
  const sql = fs.readFileSync('database/03_secure_rls_policies.sql', 'utf8');
  await client.query(sql);
  console.log('SQL applied successfully');
  await client.end();
}

run().catch(console.error);
