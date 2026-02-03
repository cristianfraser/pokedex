import { Pool } from 'pg'
import { createDatabase, initializeSchema } from './schema.js'

/**
 * Ensures the database exists, creating it if necessary
 */
async function ensureDatabaseExists(): Promise<void> {
  const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/pokedex'
  
  // Parse the connection string to extract database name
  const url = new URL(connectionString)
  const databaseName = url.pathname.slice(1) // Remove leading '/'
  
  // Connect to the default 'postgres' database to check/create the target database
  const defaultUrl = new URL(connectionString)
  defaultUrl.pathname = '/postgres'
  
  const adminPool = new Pool({
    connectionString: defaultUrl.toString(),
  })
  
  try {
    const client = await adminPool.connect()
    
    try {
      // Check if database exists
      const result = await client.query(
        `SELECT 1 FROM pg_database WHERE datname = $1`,
        [databaseName]
      )
      
      if (result.rows.length === 0) {
        console.log(`Database "${databaseName}" does not exist. Creating it...`)
        // Create the database
        await client.query(`CREATE DATABASE "${databaseName}"`)
        console.log(`Database "${databaseName}" created successfully!`)
      } else {
        console.log(`Database "${databaseName}" already exists.`)
      }
    } finally {
      client.release()
    }
  } finally {
    await adminPool.end()
  }
}

async function main() {
  try {
    // First, ensure the database exists
    await ensureDatabaseExists()
    
    // Now connect to the target database and initialize schema
    console.log('Initializing database schema...')
    const pool = createDatabase()
    await initializeSchema(pool)
    console.log('Database schema initialized successfully!')
    await pool.end()
  } catch (error) {
    console.error('Error initializing database:', error)
    process.exit(1)
  }
}

main()

