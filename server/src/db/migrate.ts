import { createDatabase, initializeSchema } from './schema.js'

const pool = createDatabase()

async function main() {
  try {
    console.log('Initializing database schema...')
    await initializeSchema(pool)
    console.log('Database schema initialized successfully!')
  } catch (error) {
    console.error('Error initializing database:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

main()

