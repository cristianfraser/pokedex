import { createDatabase, initializeSchema } from './schema.js'

const db = createDatabase()

try {
  console.log('Initializing database schema...')
  initializeSchema(db)
  console.log('Database schema initialized successfully!')
} catch (error) {
  console.error('Error initializing database:', error)
  process.exit(1)
} finally {
  db.close()
}

