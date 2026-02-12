
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// Load env vars
const envPath = path.resolve(__dirname, '../../.env.local');
let env = {};
if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) env[key.trim()] = value.trim();
    });
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMatches() {
    console.log('Checking matches table...');
    const { data, error } = await supabase.from('matches').select('*').limit(5);

    if (error) {
        console.error('Error fetching matches:', error);
    } else {
        console.log(`Found ${data.length} matches (limit 5 shown).`);
        console.log('Sample:', data);

        const countRes = await supabase.from('matches').select('*', { count: 'exact', head: true });
        console.log('Total count:', countRes.count);
    }
}

checkMatches();
