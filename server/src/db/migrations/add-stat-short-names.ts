import { Pool } from 'pg'
import { createDatabase } from '../schema.js'

const pool = createDatabase()

// Mapping of stat names to short names
const statShortNames: Record<string, string> = {
  'hp': 'hp',
  'attack': 'atk',
  'defense': 'def',
  'special-attack': 'sp. atk',
  'special-defense': 'sp. def',
  'speed': 'speed',
}

async function migrate() {
  const client = await pool.connect()
  
  try {
    console.log('Adding short_name column to pokemon_stats...')
    
    // Add column if it doesn't exist
    await client.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'pokemon_stats' AND column_name = 'short_name'
        ) THEN
          ALTER TABLE pokemon_stats ADD COLUMN short_name VARCHAR(50);
        END IF;
      END $$;
    `)
    
    console.log('Populating short_name for existing stats...')
    
    // Update existing rows with short names
    for (const [statName, shortName] of Object.entries(statShortNames)) {
      const result = await client.query(
        `UPDATE pokemon_stats 
         SET short_name = $1 
         WHERE stat_name = $2`,
        [shortName, statName]
      )
      console.log(`Updated ${result.rowCount} rows for ${statName} -> ${shortName}`)
    }
    
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

