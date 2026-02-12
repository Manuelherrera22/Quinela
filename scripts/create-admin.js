const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function createAdmin() {
    try {
        await client.connect();
        console.log('Connected to database.');

        const adminUser = {
            email: 'admin@quinela.com',
            password: 'admin123',
            name: 'Administrador',
            country: 'Guatemala',
            points: 0,
            exact_matches: 0
        };

        const sql = `
      INSERT INTO public.users (email, password, name, country, points, exact_matches)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO UPDATE 
      SET password = $2, name = $3;
    `;

        await client.query(sql, [
            adminUser.email,
            adminUser.password,
            adminUser.name,
            adminUser.country,
            adminUser.points,
            adminUser.exact_matches
        ]);

        console.log('Admin user created successfully.');
        console.log(`Email: ${adminUser.email}`);
        console.log(`Password: ${adminUser.password}`);

    } catch (err) {
        console.error('Failed to create admin:', err);
    } finally {
        await client.end();
    }
}

createAdmin();
