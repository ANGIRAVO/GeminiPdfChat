import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../shared/schema';

// Check if we have a database URL
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create a Neon SQL client with the database URL
const sql = neon(process.env.DATABASE_URL);

// Create a Drizzle instance with the client and schema
export const db = drizzle(sql, { schema });