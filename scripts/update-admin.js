const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function setupAdmin() {
    try {
        await client.connect();
        console.log('Connected to database.');

        const email = 'admin@quinela.com';
        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `
            INSERT INTO public.users (email, password, name, country, points, exact_matches)
            VALUES ($1, $2, $3, $4, 0, 0)
            ON CONFLICT (email) DO UPDATE 
            SET password = $2;
        `;

        await client.query(sql, [email, hashedPassword, 'Administrador', 'Guatemala']);
        console.log('Admin user updated with hashed password.');
        console.log(`User: ${email}`);
        console.log(`Pass: ${password}`);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

setupAdmin();
