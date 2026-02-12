
const { Client } = require('pg');

// Disable certificate validation for self-signed certs (Supabase)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const connectionString = 'postgresql://postgres.pqvdcrwzpkyjrqkefhof:Herrera123Musfelcrow@aws-0-us-west-2.pooler.supabase.com:5432/postgres?sslmode=no-verify';

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();
        console.log('Connected.');

        const sql = `
      -- Drop old strictly authenticated policies if they exist
      DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
      DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
      
      -- Create new public policies
      CREATE POLICY "Public can upload avatars" 
      ON storage.objects FOR INSERT 
      WITH CHECK ( bucket_id = 'avatars' );

      CREATE POLICY "Public can update avatars" 
      ON storage.objects FOR UPDATE
      USING ( bucket_id = 'avatars' );
    `;

        console.log('Updating RLS policies...');
        await client.query(sql);
        console.log('Policies updated successfully.');
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

run();
