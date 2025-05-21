import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../shared/schema";

// Check if we have a database URL
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create a PostgreSQL client with the database URL
const client = postgres(process.env.DATABASE_URL);

// Create a Drizzle instance with the client and schema
export const db = drizzle(client, { schema });