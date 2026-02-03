import { createDatabase } from '../db/schema.js'
import { Pool } from 'pg'

async function verifySeed(pool: Pool) {
  console.log('🔍 Verifying database seed...\n')

  try {
    // Check Pokemon count
    const pokemonCount = await pool.query('SELECT COUNT(*) as count FROM pokemon')
    const pokemonTotal = parseInt(pokemonCount.rows[0].count)
    console.log(`✅ Pokemon: ${pokemonTotal} entries`)

    if (pokemonTotal === 0) {
      console.error('❌ No Pokemon found in database!')
      return false
    }

    // Check Types count
    const typesCount = await pool.query('SELECT COUNT(*) as count FROM types')
    const typesTotal = parseInt(typesCount.rows[0].count)
    console.log(`✅ Types: ${typesTotal} entries`)

    // Check Moves count
    const movesCount = await pool.query('SELECT COUNT(*) as count FROM moves')
    const movesTotal = parseInt(movesCount.rows[0].count)
    console.log(`✅ Moves: ${movesTotal} entries`)

    // Check Pokemon with types
    const pokemonWithTypes = await pool.query(`
      SELECT COUNT(DISTINCT pokemon_id) as count 
      FROM pokemon_types
    `)
    const pokemonWithTypesCount = parseInt(pokemonWithTypes.rows[0].count)
    console.log(`✅ Pokemon with types: ${pokemonWithTypesCount}`)

    // Check Pokemon with stats
    const pokemonWithStats = await pool.query(`
      SELECT COUNT(DISTINCT pokemon_id) as count 
      FROM pokemon_stats
    `)
    const pokemonWithStatsCount = parseInt(pokemonWithStats.rows[0].count)
    console.log(`✅ Pokemon with stats: ${pokemonWithStatsCount}`)

    // Sample a few Pokemon to check data completeness
    console.log('\n📋 Checking sample Pokemon data...')
    const samplePokemon = await pool.query(`
      SELECT id, name, pokedex_number 
      FROM pokemon 
      ORDER BY pokedex_number ASC 
      LIMIT 5
    `)

    for (const pokemon of samplePokemon.rows) {
      const typesResult = await pool.query(
        `SELECT COUNT(*) as count FROM pokemon_types WHERE pokemon_id = $1`,
        [pokemon.id]
      )
      const typesCount = parseInt(typesResult.rows[0].count)

      const statsResult = await pool.query(
        `SELECT COUNT(*) as count FROM pokemon_stats WHERE pokemon_id = $1`,
        [pokemon.id]
      )
      const statsCount = parseInt(statsResult.rows[0].count)

      const status = typesCount > 0 && statsCount > 0 ? '✅' : '⚠️'
      console.log(
        `  ${status} ${pokemon.name} (ID: ${pokemon.id}, #${pokemon.pokedex_number}) - Types: ${typesCount}, Stats: ${statsCount}`
      )
    }

    // Check for Pokemon missing types
    const missingTypes = await pool.query(`
      SELECT COUNT(*) as count 
      FROM pokemon p
      WHERE NOT EXISTS (
        SELECT 1 FROM pokemon_types pt WHERE pt.pokemon_id = p.id
      )
    `)
    const missingTypesCount = parseInt(missingTypes.rows[0].count)
    if (missingTypesCount > 0) {
      console.log(`\n⚠️  Warning: ${missingTypesCount} Pokemon are missing types`)
    }

    // Check for Pokemon missing stats
    const missingStats = await pool.query(`
      SELECT COUNT(*) as count 
      FROM pokemon p
      WHERE NOT EXISTS (
        SELECT 1 FROM pokemon_stats ps WHERE ps.pokemon_id = p.id
      )
    `)
    const missingStatsCount = parseInt(missingStats.rows[0].count)
    if (missingStatsCount > 0) {
      console.log(`⚠️  Warning: ${missingStatsCount} Pokemon are missing stats`)
    }

    // Check database connection and test a query
    console.log('\n🔌 Testing API endpoint simulation...')
    const testQuery = await pool.query(`
      SELECT DISTINCT
        p.id, p.name, p.pokedex_number
      FROM pokemon p
      ORDER BY p.pokedex_number ASC
      LIMIT 10
    `)
    console.log(`✅ Successfully queried ${testQuery.rows.length} Pokemon`)
    console.log(`   Sample: ${testQuery.rows.map((r: any) => r.name).join(', ')}`)

    console.log('\n✅ Database verification complete!')
    return true
  } catch (error) {
    console.error('❌ Error verifying database:', error)
    return false
  }
}

async function main() {
  const pool = createDatabase()

  try {
    const success = await verifySeed(pool)
    process.exit(success ? 0 : 1)
  } catch (error) {
    console.error('Fatal error:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

main()

