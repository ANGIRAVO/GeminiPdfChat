import { db } from "./db-pg";
import { 
  users, 
  pdfs, 
  chats, 
  messages 
} from "@shared/schema";

async function setup() {
  console.log("Setting up database tables...");
  try {
    // Create users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        name TEXT NOT NULL
      )
    `);
    console.log("✓ Users table created");

    // Create pdfs table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS pdfs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        name TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      )
    `);
    console.log("✓ PDFs table created");

    // Create chats table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS chats (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        title TEXT NOT NULL,
        pdf_id INTEGER REFERENCES pdfs(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      )
    `);
    console.log("✓ Chats table created");

    // Create messages table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        chat_id INTEGER NOT NULL REFERENCES chats(id),
        content TEXT NOT NULL,
        is_user BOOLEAN NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      )
    `);
    console.log("✓ Messages table created");

    console.log("All tables created successfully!");
  } catch (error) {
    console.error("Error setting up database:", error);
  }
}

setup();