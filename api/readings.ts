// This file should be placed in an `api` directory (e.g., /api/readings.ts)
// It is designed to work with hosting platforms that support Node.js serverless functions, like Vercel.
//
// You will need to install the Neon serverless driver:
// npm install @neondatabase/serverless
//
// Also, ensure you have set your Neon Database connection string as an
// environment variable named `DATABASE_URL` in your hosting provider's settings.

import { neon } from '@neondatabase/serverless';

// The Response object is part of the standard Web API, available in modern Node.js and serverless environments.
// If your environment doesn't have it globally, you might need to import it or use your framework's response helpers.

export const config = {
  runtime: 'edge', // Vercel specific config
};

export default async function handler(req: Request) {
  const sql = neon(process.env.DATABASE_URL!);

  if (req.method === 'GET') {
    try {
      const { searchParams } = new URL(req.url);
      const resort = searchParams.get('resort');
      const date = searchParams.get('date');

      if (!resort || !date) {
        return new Response(JSON.stringify({ message: 'Resort and date are required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const result = await sql`
        SELECT data FROM readings WHERE resort_name = ${resort} AND reading_date = ${date}
      `;

      if (result.length > 0) {
        return new Response(JSON.stringify(result[0].data), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        return new Response(JSON.stringify({ message: 'No readings found for this date' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } catch (error) {
      console.error('Database GET Error:', error);
      return new Response(JSON.stringify({ message: 'Failed to fetch readings', error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = await req.json();
      const { resort, date, data } = body;

      if (!resort || !date || !data) {
        return new Response(JSON.stringify({ message: 'Missing required fields: resort, date, data' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Use INSERT ... ON CONFLICT to perform an "UPSERT" (update if exists, insert if not)
      await sql`
        INSERT INTO readings (resort_name, reading_date, data)
        VALUES (${resort}, ${date}, ${JSON.stringify(data)})
        ON CONFLICT (resort_name, reading_date)
        DO UPDATE SET data = EXCLUDED.data, updated_at = CURRENT_TIMESTAMP
      `;
      
      return new Response(JSON.stringify({ message: 'Readings saved successfully' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

    } catch (error) {
       console.error('Database POST Error:', error);
       return new Response(JSON.stringify({ message: 'Failed to save readings', error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // Handle other methods
  return new Response(JSON.stringify({ message: `Method ${req.method} Not Allowed` }), {
    status: 405,
    headers: { 'Content-Type': 'application/json', 'Allow': 'GET, POST' },
  });
}
