import { Pool } from 'pg'
import { createDatabase } from '../schema.js'

const pool = createDatabase()

async function migrate() {
  const client = await pool.connect()
  
  try {
    console.log('Adding dominant_color column to pokemon table...')
    
    // Add column if it doesn't exist
    await client.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'pokemon' AND column_name = 'dominant_color'
        ) THEN
          ALTER TABLE pokemon ADD COLUMN dominant_color VARCHAR(7);
        END IF;
      END $$;
    `)
    
    console.log('Migration completed successfully!')
  } catch (error) {
    console.error('Error running migration:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

migrate()
  .then(() => {
    console.log('Migration script finished')
    process.exit(0)
  })
  .catch(error => {
    console.error('Migration failed:', error)
    process.exit(1)
  })

