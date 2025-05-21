import postgres from 'postgres';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Make sure we have DATABASE_URL
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not defined');
    }
    
    // Sanitize and log the connection string (hiding password)
    const connectionString = process.env.DATABASE_URL;
    const sanitizedUrl = connectionString.replace(/:[^:]*@/, ':***@');
    console.log('Using connection string:', sanitizedUrl);
    
    // Create connection
    const sql = postgres(process.env.DATABASE_URL, { 
      max: 1,
      debug: true,
      onnotice: () => {} 
    });
    
    // Test connection with a simple query
    const result = await sql`SELECT 1 as result`;
    console.log('Connection successful!', result);
    
    // Close connection
    await sql.end();
    console.log('Connection closed.');
  } catch (error) {
    console.error('Database connection error:', error);
  }
}

testConnection();