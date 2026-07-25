import { createDatabase } from '../db/schema.js'
import type { Database as SqliteDatabase } from 'better-sqlite3'

async function verifySeed(db: SqliteDatabase) {
  console.log('🔍 Verifying database seed...\n')

  try {
    // Check Pokemon count
    const pokemonCount = db.prepare('SELECT COUNT(*) as count FROM pokemon').get() as { count: number }
    const pokemonTotal = Number(pokemonCount.count)
    console.log(`✅ Pokemon: ${pokemonTotal} entries`)

    if (pokemonTotal === 0) {
      console.error('❌ No Pokemon found in database!')
      return false
    }

    // Check Types count
    const typesCount = db.prepare('SELECT COUNT(*) as count FROM types').get() as { count: number }
    const typesTotal = Number(typesCount.count)
    console.log(`✅ Types: ${typesTotal} entries`)

    // Check Moves count
    const movesCount = db.prepare('SELECT COUNT(*) as count FROM moves').get() as { count: number }
    const movesTotal = Number(movesCount.count)
    console.log(`✅ Moves: ${movesTotal} entries`)

    // Check Pokemon with types
    const pokemonWithTypes = db.prepare(`
      SELECT COUNT(DISTINCT pokemon_id) as count 
      FROM pokemon_types
    `).get() as { count: number }
    const pokemonWithTypesCount = Number(pokemonWithTypes.count)
    console.log(`✅ Pokemon with types: ${pokemonWithTypesCount}`)

    // Check Pokemon with stats
    const pokemonWithStats = db.prepare(`
      SELECT COUNT(DISTINCT pokemon_id) as count 
      FROM pokemon_stats
    `).get() as { count: number }
    const pokemonWithStatsCount = Number(pokemonWithStats.count)
    console.log(`✅ Pokemon with stats: ${pokemonWithStatsCount}`)

    // Sample a few Pokemon to check data completeness
    console.log('\n📋 Checking sample Pokemon data...')
    const samplePokemon = db
      .prepare(
        `
      SELECT id, name, pokedex_number 
      FROM pokemon 
      ORDER BY pokedex_number ASC 
      LIMIT 5
    `
      )
      .all() as Array<{ id: number; name: string; pokedex_number: number }>

    for (const pokemon of samplePokemon) {
      const typesResult = db
        .prepare(`SELECT COUNT(*) as count FROM pokemon_types WHERE pokemon_id = ?`)
        .get(pokemon.id) as { count: number }
      const typesCount = Number(typesResult.count)

      const statsResult = db
        .prepare(`SELECT COUNT(*) as count FROM pokemon_stats WHERE pokemon_id = ?`)
        .get(pokemon.id) as { count: number }
      const statsCount = Number(statsResult.count)

      const status = typesCount > 0 && statsCount > 0 ? '✅' : '⚠️'
      console.log(
        `  ${status} ${pokemon.name} (ID: ${pokemon.id}, #${pokemon.pokedex_number}) - Types: ${typesCount}, Stats: ${statsCount}`
      )
    }

    // Check for Pokemon missing types
    const missingTypes = db.prepare(`
      SELECT COUNT(*) as count 
      FROM pokemon p
      WHERE NOT EXISTS (
        SELECT 1 FROM pokemon_types pt WHERE pt.pokemon_id = p.id
      )
    `).get() as { count: number }
    const missingTypesCount = Number(missingTypes.count)
    if (missingTypesCount > 0) {
      console.log(`\n⚠️  Warning: ${missingTypesCount} Pokemon are missing types`)
    }

    // Check for Pokemon missing stats
    const missingStats = db.prepare(`
      SELECT COUNT(*) as count 
      FROM pokemon p
      WHERE NOT EXISTS (
        SELECT 1 FROM pokemon_stats ps WHERE ps.pokemon_id = p.id
      )
    `).get() as { count: number }
    const missingStatsCount = Number(missingStats.count)
    if (missingStatsCount > 0) {
      console.log(`⚠️  Warning: ${missingStatsCount} Pokemon are missing stats`)
    }

    // Check database connection and test a query
    console.log('\n🔌 Testing API endpoint simulation...')
    const testQuery = db
      .prepare(
        `
      SELECT DISTINCT
        p.id, p.name, p.pokedex_number
      FROM pokemon p
      ORDER BY p.pokedex_number ASC
      LIMIT 10
    `
      )
      .all() as Array<{ id: number; name: string; pokedex_number: number }>
    console.log(`✅ Successfully queried ${testQuery.length} Pokemon`)
    console.log(`   Sample: ${testQuery.map(r => r.name).join(', ')}`)

    console.log('\n✅ Database verification complete!')
    return true
  } catch (error) {
    console.error('❌ Error verifying database:', error)
    return false
  }
}

async function main() {
  const db = createDatabase({ readonly: true })

  try {
    const success = await verifySeed(db)
    process.exit(success ? 0 : 1)
  } catch (error) {
    console.error('Fatal error:', error)
    process.exit(1)
  } finally {
    db.close()
  }
}

main()

