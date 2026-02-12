
const { Client } = require('pg');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const connectionString = 'postgresql://postgres.pqvdcrwzpkyjrqkefhof:Herrera123Musfelcrow@aws-0-us-west-2.pooler.supabase.com:5432/postgres?sslmode=no-verify';

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();
        console.log('--- Inspector de Supabase ---');

        console.log('\n1. Buckets existentes:');
        const bucketsRes = await client.query('SELECT id, name, public FROM storage.buckets');
        console.table(bucketsRes.rows);

        console.log('\n2. Políticas en storage.objects:');
        const policiesRes = await client.query(`
      SELECT policyname, cmd, roles, qual, with_check 
      FROM pg_policies 
      WHERE tablename = 'objects' AND schemaname = 'storage'
    `);
        console.table(policiesRes.rows);

        console.log('\n3. Estado de RLS en storage.objects:');
        const rlsRes = await client.query(`
      SELECT relname, relrowsecurity 
      FROM pg_class c 
      JOIN pg_namespace n ON n.oid = c.relnamespace 
      WHERE n.nspname = 'storage' AND c.relname = 'objects'
    `);
        console.table(rlsRes.rows);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
