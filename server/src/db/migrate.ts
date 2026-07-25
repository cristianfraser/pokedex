import { createDatabase, databasePath, initializeSchema } from './schema.js'

/**
 * Creates an empty database with the schema in place.
 *
 * Only needed before seeding from scratch — the app ships a populated snapshot at
 * server/data/pokedex.db. SQLite needs no server, no CREATE DATABASE and no role setup,
 * so what used to be the Postgres bootstrap is now a single call.
 */
function main() {
  const db = createDatabase()
  try {
    console.log(`Initializing schema at ${databasePath()}...`)
    initializeSchema(db)
    console.log('Database schema initialized successfully!')
  } catch (error) {
    console.error('Error initializing database:', error)
    process.exit(1)
  } finally {
    db.close()
  }
}

main()
