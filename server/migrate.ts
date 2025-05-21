import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "./db";

// This script runs database migrations to ensure the database schema is up to date
async function main() {
  console.log("Running migrations...");
  
  try {
    await migrate(db, { migrationsFolder: "./migrations" });
    console.log("Migrations completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

main();