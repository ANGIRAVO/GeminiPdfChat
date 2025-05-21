import { neon } from '@neondatabase/serverless';

async function testConnection() {
  try {
    console.log('Testing database connection with Neon client...');
    
    // Check for DATABASE_URL
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not defined');
    }
    
    // Create a sanitized URL for logging (hide password)
    const connectionString = process.env.DATABASE_URL;
    const sanitizedUrl = connectionString.replace(/:[^:]*@/, ':***@');
    console.log('Using connection string:', sanitizedUrl);
    
    // Create the Neon SQL client
    const sql = neon(process.env.DATABASE_URL);
    
    // Test the connection
    const result = await sql`SELECT 1 as result`;
    console.log('Connection successful!', result);
    
  } catch (error) {
    console.error('Database connection error:', error);
  }
}

testConnection();