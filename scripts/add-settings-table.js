const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    try {
        await client.connect();
        console.log('Connected to database.');

        const sql = `
      CREATE TABLE IF NOT EXISTS public.settings (
          key TEXT PRIMARY KEY,
          value TEXT
      );

      INSERT INTO public.settings (key, value) 
      VALUES ('champion', NULL) 
      ON CONFLICT (key) DO NOTHING;

      -- Policies
      ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'settings' AND policyname = 'Public Read Settings') THEN
            CREATE POLICY "Public Read Settings" ON public.settings FOR SELECT USING (true);
        END IF;
        IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'settings' AND policyname = 'Public Write Settings') THEN
            CREATE POLICY "Public Write Settings" ON public.settings FOR INSERT WITH CHECK (true);
        END IF;
        IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'settings' AND policyname = 'Public Update Settings') THEN
            CREATE POLICY "Public Update Settings" ON public.settings FOR UPDATE USING (true);
        END IF;
      END $$;
    `;

        await client.query(sql);
        console.log('Settings table created successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

migrate();
