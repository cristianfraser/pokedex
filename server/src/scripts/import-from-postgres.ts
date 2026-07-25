import { Pool } from 'pg'
import { createDatabase, databasePath, initializeSchema } from '../db/schema.js'

/**
 * One-time migration: copies the seeded dataset out of the old PostgreSQL database into the
 * SQLite snapshot that now ships with the app.
 *
 * This exists so the move off Postgres did not require re-running `seed.ts`, which takes 30+
 * minutes against the rate-limited PokéAPI. It is kept in the repo as provenance for how
 * data/pokedex.db was produced — `seed.ts` remains the source of truth for regenerating the
 * data from scratch.
 *
 *   DATABASE_URL=postgresql://localhost:5432/pokedex yarn db:import-postgres
 */

// Column lists are explicit so a schema drift on either side fails loudly instead of
// silently dropping or misaligning a column.
const TABLES: ReadonlyArray<{ name: string; columns: readonly string[]; order: string }> = [
  { name: 'types', columns: ['id', 'name'], order: 'id' },
  {
    name: 'pokemon',
    columns: [
      'id',
      'name',
      'pokedex_number',
      'height',
      'weight',
      'base_experience',
      'sprite_front_default',
      'sprite_front_shiny',
      'sprite_official_artwork',
      'is_legendary',
      'is_mythical',
      'color',
      'habitat',
      'flavor_text',
      'dominant_color',
    ],
    order: 'id',
  },
  { name: 'pokemon_types', columns: ['pokemon_id', 'type_id', 'slot'], order: 'pokemon_id, type_id' },
  {
    name: 'pokemon_stats',
    columns: ['pokemon_id', 'stat_name', 'base_stat', 'effort', 'short_name'],
    order: 'pokemon_id, stat_name',
  },
  {
    name: 'moves',
    columns: [
      'id',
      'name',
      'accuracy',
      'effect_chance',
      'pp',
      'priority',
      'power',
      'damage_class',
      'effect_text',
      'short_effect_text',
    ],
    order: 'id',
  },
  { name: 'move_types', columns: ['move_id', 'type_id'], order: 'move_id, type_id' },
  { name: 'pokemon_moves', columns: ['pokemon_id', 'move_id'], order: 'pokemon_id, move_id' },
]

async function main() {
  const connectionString =
    process.env.DATABASE_URL || 'postgresql://localhost:5432/pokedex'
  const pool = new Pool({ connectionString })
  const db = createDatabase()

  try {
    initializeSchema(db)
    console.log(`Importing ${connectionString} → ${databasePath()}`)

    for (const table of TABLES) {
      const { rows } = await pool.query(
        `SELECT ${table.columns.join(', ')} FROM ${table.name} ORDER BY ${table.order}`
      )

      const placeholders = table.columns.map(() => '?').join(', ')
      const insert = db.prepare(
        `INSERT OR REPLACE INTO ${table.name} (${table.columns.join(', ')}) VALUES (${placeholders})`
      )

      const insertAll = db.transaction((batch: Record<string, unknown>[]) => {
        db.prepare(`DELETE FROM ${table.name}`).run()
        for (const row of batch) {
          insert.run(table.columns.map(c => normalize(row[c])))
        }
      })
      insertAll(rows)

      const count = (
        db.prepare(`SELECT COUNT(*) AS c FROM ${table.name}`).get() as { c: number }
      ).c
      if (count !== rows.length) {
        throw new Error(
          `${table.name}: copied ${count} rows but Postgres had ${rows.length}`
        )
      }
      console.log(`  ${table.name.padEnd(14)} ${count} rows`)
    }

    // Compact and defragment: the file is committed to the repo, so size is worth the pass.
    db.pragma('journal_mode = DELETE')
    db.exec('VACUUM')
    console.log('Done.')
  } finally {
    db.close()
    await pool.end()
  }
}

/**
 * SQLite accepts numbers, strings, bigints, buffers and null. Postgres hands back Dates for
 * timestamps and booleans for bools; neither appears in the copied columns, so anything else
 * is a schema surprise worth failing on rather than coercing silently.
 */
function normalize(value: unknown): string | number | bigint | Buffer | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'bigint') {
    return value
  }
  if (Buffer.isBuffer(value)) return value
  throw new Error(`Unsupported value type from Postgres: ${typeof value} (${String(value)})`)
}

main().catch(error => {
  console.error('Import failed:', error)
  process.exit(1)
})
