const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase URL or Service Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
    console.log('Setting up database...');

    // 1. Create Users Table
    const { error: usersError } = await supabase.rpc('create_users_table_if_not_exists');
    if (usersError) {
        // Fallback: Try RAW SQL via a function if RPC isn't available, or just log
        console.warn('Could not run RPC. Attempting to check tables manually via client is restricted. Please run SQL in Supabase Dashboard.');
        console.log(`
            -- RUN THIS SQL IN SUPABASE SQL EDITOR:
            
            CREATE TABLE IF NOT EXISTS public.users (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                country TEXT NOT NULL,
                password TEXT, -- In real app use Supabase Auth
                points INTEGER DEFAULT 0,
                exact_matches INTEGER DEFAULT 0,
                selected_champion TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
            );

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

            CREATE TABLE IF NOT EXISTS public.predictions (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                user_email TEXT REFERENCES public.users(email),
                match_id TEXT REFERENCES public.matches(id),
                home_score INTEGER NOT NULL,
                away_score INTEGER NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
                UNIQUE(user_email, match_id)
            );
            
            -- Enable RLS (Optional for now but good practice)
            ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
            ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
            ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
            
            -- Policies (Open for now for custom auth)
            CREATE POLICY "Public Read Users" ON public.users FOR SELECT USING (true);
            CREATE POLICY "Public Write Users" ON public.users FOR INSERT WITH CHECK (true);
            CREATE POLICY "Public Update Users" ON public.users FOR UPDATE USING (true);
            
            CREATE POLICY "Public Read Matches" ON public.matches FOR SELECT USING (true);
            CREATE POLICY "Public Write Matches" ON public.matches FOR INSERT WITH CHECK (true);
            CREATE POLICY "Public Update Matches" ON public.matches FOR UPDATE USING (true);

            CREATE POLICY "Public Read Predictions" ON public.predictions FOR SELECT USING (true);
            CREATE POLICY "Public Write Predictions" ON public.predictions FOR INSERT WITH CHECK (true);
            CREATE POLICY "Public Update Predictions" ON public.predictions FOR UPDATE USING (true);
         `);
    } else {
        console.log('RPC successful (unexpected if function not created).');
    }

    console.log('Database schema SQL provided above. Please execute in Supabase dashboard SQL editor as we cannot create tables via Client directly without specific RPCs.');
}

setupDatabase();
