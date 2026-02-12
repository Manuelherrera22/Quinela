const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for Supabase/AWS
});

async function migrate() {
    try {
        await client.connect();
        console.log('Connected to database.');

        const sql = `
      -- 1. Users
      CREATE TABLE IF NOT EXISTS public.users (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          country TEXT NOT NULL,
          password TEXT,
          points INTEGER DEFAULT 0,
          exact_matches INTEGER DEFAULT 0,
          selected_champion TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      -- 2. Matches
      CREATE TABLE IF NOT EXISTS public.matches (
          id TEXT PRIMARY KEY,
          home_team TEXT NOT NULL,
          away_team TEXT NOT NULL,
          home_flag TEXT,
          away_flag TEXT,
          date TIMESTAMP WITH TIME ZONE NOT NULL,
          stage TEXT NOT NULL,
          group_name TEXT,
          status TEXT DEFAULT 'open',
          home_score INTEGER,
          away_score INTEGER
      );

      -- 3. Predictions
      CREATE TABLE IF NOT EXISTS public.predictions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_email TEXT REFERENCES public.users(email),
          match_id TEXT REFERENCES public.matches(id),
          home_score INTEGER NOT NULL,
          away_score INTEGER NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
          UNIQUE(user_email, match_id)
      );

      -- Enable RLS (Optional/Idempotent)
      ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

      -- Policies (Drop existing to avoid error on rerun, then create)
      DO $$ 
      BEGIN
        -- Users
        IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'users' AND policyname = 'Public Read Users') THEN
            CREATE POLICY "Public Read Users" ON public.users FOR SELECT USING (true);
        END IF;
        IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'users' AND policyname = 'Public Write Users') THEN
            CREATE POLICY "Public Write Users" ON public.users FOR INSERT WITH CHECK (true);
        END IF;
        IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'users' AND policyname = 'Public Update Users') THEN
            CREATE POLICY "Public Update Users" ON public.users FOR UPDATE USING (true);
        END IF;

        -- Matches
        IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'matches' AND policyname = 'Public Read Matches') THEN
            CREATE POLICY "Public Read Matches" ON public.matches FOR SELECT USING (true);
        END IF;
        IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'matches' AND policyname = 'Public Write Matches') THEN
            CREATE POLICY "Public Write Matches" ON public.matches FOR INSERT WITH CHECK (true);
        END IF;
        IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'matches' AND policyname = 'Public Update Matches') THEN
            CREATE POLICY "Public Update Matches" ON public.matches FOR UPDATE USING (true);
        END IF;

        -- Predictions
        IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'predictions' AND policyname = 'Public Read Predictions') THEN
            CREATE POLICY "Public Read Predictions" ON public.predictions FOR SELECT USING (true);
        END IF;
        IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'predictions' AND policyname = 'Public Write Predictions') THEN
            CREATE POLICY "Public Write Predictions" ON public.predictions FOR INSERT WITH CHECK (true);
        END IF;
        IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'predictions' AND policyname = 'Public Update Predictions') THEN
            CREATE POLICY "Public Update Predictions" ON public.predictions FOR UPDATE USING (true);
        END IF;
      END $$;
    `;

        await client.query(sql);
        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

migrate();
