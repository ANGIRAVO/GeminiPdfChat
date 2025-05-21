import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

// Use the PostgreSQL connection string from environment variables
const connectionString = process.env.DATABASE_URL!;

// Create a postgres client
const client = postgres(connectionString);

// Create a drizzle client
export const db = drizzle(client, { schema });
