import { createDatabase } from '../db/schema.js'
import Database from 'better-sqlite3'

const POKEAPI_BASE = 'https://pokeapi.co/api/v2'

interface PokeAPIType {
  name: string
  url: string
}

interface PokeAPIPokemon {
  id: number
  name: string
  height: number
  weight: number
  base_experience: number
  sprites: {
    front_default: string | null
    front_shiny: string | null
    other?: {
      'official-artwork'?: {
        front_default: string | null
      }
    }
  }
  types: Array<{
    slot: number
    type: PokeAPIType
  }>
  stats: Array<{
    base_stat: number
    effort: number
    stat: {
      name: string
    }
  }>
}

interface PokeAPISpecies {
  id: number
  names: Array<{
    name: string
    language: { name: string }
  }>
  pokedex_numbers: Array<{
    entry_number: number
    pokedex: { name: string }
  }>
  flavor_text_entries: Array<{
    flavor_text: string
    language: { name: string }
    version: { name: string }
  }>
  color: { name: string }
  habitat: { name: string } | null
  is_legendary: boolean
  is_mythical: boolean
}

interface PokeAPIMove {
  id: number
  name: string
  accuracy: number | null
  effect_chance: number | null
  pp: number | null
  priority: number
  power: number | null
  damage_class: {
    name: string
  }
  type: PokeAPIType
  effect_entries: Array<{
    effect: string
    language: { name: string }
    short_effect?: string
  }>
  learned_by_pokemon: Array<{
    name: string
    url: string
  }>
}

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url)
      if (response.ok) return response
      if (response.status === 404) throw new Error(`Not found: ${url}`)
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
        continue
      }
      throw new Error(`Failed to fetch: ${url} (${response.status})`)
    } catch (error) {
      if (i === retries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
  throw new Error(`Failed to fetch after ${retries} retries: ${url}`)
}

async function seedTypes(db: Database.Database) {
  console.log('Seeding types...')
  const response = await fetchWithRetry(`${POKEAPI_BASE}/type?limit=100`)
  const data = await response.json()

  const insertType = db.prepare('INSERT OR IGNORE INTO types (name) VALUES (?)')
  const insertMany = db.transaction((types: string[]) => {
    for (const typeName of types) {
      insertType.run(typeName)
    }
  })

  const typeNames = data.results.map((t: PokeAPIType) => t.name)
  insertMany(typeNames)
  console.log(`Seeded ${typeNames.length} types`)
}

async function seedPokemon(db: Database.Database, limit?: number) {
  console.log('Seeding Pokemon...')

  const pageSize = 300

  // Get all Pokemon from national pokedex
  const pokedexResponse = await fetchWithRetry(
    `${POKEAPI_BASE}/pokedex/national/`
  )
  const pokedexData = await pokedexResponse.json()

  const entries = pokedexData.pokemon_entries.slice(0, limit)
  console.log(`Fetching ${entries.length} Pokemon in batches of ${pageSize}...`)

  const insertPokemon = db.prepare(`
    INSERT OR REPLACE INTO pokemon (
      id, name, pokedex_number, height, weight, base_experience,
      sprite_front_default, sprite_front_shiny, sprite_official_artwork,
      is_legendary, is_mythical, color, habitat, flavor_text
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const insertPokemonType = db.prepare(`
    INSERT OR IGNORE INTO pokemon_types (pokemon_id, type_id, slot)
    VALUES (?, (SELECT id FROM types WHERE name = ?), ?)
  `)

  const insertPokemonStat = db.prepare(`
    INSERT OR REPLACE INTO pokemon_stats (pokemon_id, stat_name, base_stat, effort)
    VALUES (?, ?, ?, ?)
  `)

  const insertTransaction = db.transaction((pokemon: any) => {
    insertPokemon.run(
      pokemon.id,
      pokemon.name,
      pokemon.pokedexNumber,
      pokemon.height,
      pokemon.weight,
      pokemon.base_experience,
      pokemon.sprites.front_default,
      pokemon.sprites.front_shiny,
      pokemon.sprites.other?.['official-artwork']?.front_default || null,
      pokemon.is_legendary ? 1 : 0,
      pokemon.is_mythical ? 1 : 0,
      pokemon.color?.name || null,
      pokemon.habitat?.name || null,
      pokemon.flavorText || null
    )

    // Insert types
    for (const typeEntry of pokemon.types) {
      insertPokemonType.run(pokemon.id, typeEntry.type.name, typeEntry.slot)
    }

    // Insert stats
    for (const stat of pokemon.stats) {
      insertPokemonStat.run(
        pokemon.id,
        stat.stat.name,
        stat.base_stat,
        stat.effort
      )
    }
  })

  let processed = 0
  // Process entries in batches of pageSize
  for (let i = 0; i < entries.length; i += pageSize) {
    const batch = entries.slice(i, i + pageSize)
    console.log(
      `Processing batch ${Math.floor(i / pageSize) + 1}/${Math.ceil(
        entries.length / pageSize
      )} (${batch.length} Pokemon)...`
    )

    for (const entry of batch) {
      try {
        const speciesName = entry.pokemon_species.name

        // Fetch species data
        const speciesResponse = await fetchWithRetry(
          `${POKEAPI_BASE}/pokemon-species/${speciesName}`
        )
        const speciesData: PokeAPISpecies = await speciesResponse.json()

        // Fetch Pokemon data
        const pokemonResponse = await fetchWithRetry(
          `${POKEAPI_BASE}/pokemon/${speciesData.id}`
        )
        const pokemonData: PokeAPIPokemon = await pokemonResponse.json()

        // Get English name
        const englishName =
          speciesData.names.find(n => n.language.name === 'en')?.name ||
          pokemonData.name

        // Get Pokedex number
        const pokedexNumber =
          speciesData.pokedex_numbers.find(p => p.pokedex.name === 'national')
            ?.entry_number || 0

        // Get English flavor text
        const flavorText =
          speciesData.flavor_text_entries.find(e => e.language.name === 'en')
            ?.flavor_text || null

        const pokemon = {
          ...pokemonData,
          name: englishName,
          pokedexNumber,
          color: speciesData.color,
          habitat: speciesData.habitat,
          is_legendary: speciesData.is_legendary,
          is_mythical: speciesData.is_mythical,
          flavorText,
        }

        insertTransaction(pokemon)
        processed++

        if (processed % 10 === 0) {
          console.log(`Processed ${processed}/${entries.length} Pokemon...`)
        }

        // Rate limiting - be nice to PokeAPI
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`Error processing ${entry.pokemon_species.name}:`, error)
      }
    }

    console.log(
      `Completed batch ${Math.floor(i / pageSize) + 1}. Total processed: ${processed}/${entries.length}`
    )
  }

  console.log(`Seeded ${processed} Pokemon`)
}

async function seedMoves(db: Database.Database, limit?: number) {
  console.log('Seeding moves...')

  let offset = 0
  const pageSize = 100
  let hasMore = true
  let totalProcessed = 0

  const insertMove = db.prepare(`
    INSERT OR REPLACE INTO moves (
      id, name, accuracy, effect_chance, pp, priority, power,
      damage_class, effect_text, short_effect_text
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const insertMoveType = db.prepare(`
    INSERT OR IGNORE INTO move_types (move_id, type_id)
    VALUES (?, (SELECT id FROM types WHERE name = ?))
  `)

  const checkTypeExists = db.prepare(`
    SELECT id FROM types WHERE name = ?
  `)

  const checkPokemonExists = db.prepare(`
    SELECT id FROM pokemon WHERE id = ?
  `)

  const insertPokemonMove = db.prepare(`
    INSERT OR IGNORE INTO pokemon_moves (pokemon_id, move_id)
    VALUES (?, ?)
  `)

  while (hasMore && (!limit || totalProcessed < limit)) {
    const response = await fetchWithRetry(
      `${POKEAPI_BASE}/move?offset=${offset}&limit=${pageSize}`
    )
    const data = await response.json()

    const movesToProcess = limit
      ? data.results.slice(0, limit - totalProcessed)
      : data.results

    for (const moveListItem of movesToProcess) {
      try {
        const moveResponse = await fetchWithRetry(moveListItem.url)
        const moveData: PokeAPIMove = await moveResponse.json()

        // Get English effect text
        const effectEntry = moveData.effect_entries.find(
          e => e.language.name === 'en'
        )

        const insertTransaction = db.transaction(() => {
          insertMove.run(
            moveData.id,
            moveData.name,
            moveData.accuracy,
            moveData.effect_chance,
            moveData.pp,
            moveData.priority,
            moveData.power,
            moveData.damage_class.name,
            effectEntry?.effect || null,
            effectEntry?.short_effect || null
          )

          // Insert move type (only if type exists)
          const typeExists = checkTypeExists.get(moveData.type.name)
          if (typeExists) {
            insertMoveType.run(moveData.id, moveData.type.name)
          } else {
            console.warn(
              `Type ${moveData.type.name} not found for move ${moveData.name}`
            )
          }

          // Insert Pokemon that can learn this move (only if Pokemon exists)
          for (const pokemon of moveData.learned_by_pokemon) {
            // Extract Pokemon ID from URL
            const pokemonId = parseInt(
              pokemon.url.split('/').filter(Boolean).pop() || '0'
            )
            if (pokemonId) {
              // Check if Pokemon exists before inserting relationship
              const pokemonExists = checkPokemonExists.get(pokemonId)
              if (pokemonExists) {
                insertPokemonMove.run(pokemonId, moveData.id)
              }
              // Silently skip if Pokemon doesn't exist yet
            }
          }
        })

        insertTransaction()
        totalProcessed++

        if (totalProcessed % 50 === 0) {
          console.log(`Processed ${totalProcessed} moves...`)
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 50))
      } catch (error) {
        console.error(`Error processing move ${moveListItem.name}:`, error)
      }
    }

    hasMore = !!data.next
    offset += pageSize

    if (limit && totalProcessed >= limit) {
      break
    }
  }

  console.log(`Seeded ${totalProcessed} moves`)
}

async function main() {
  const db = createDatabase()

  try {
    console.log('Starting database seed...')

    await seedTypes(db)
    await seedPokemon(db) // Seed all Pokemon (can add limit if needed)
    await seedMoves(db) // Seed all moves (can add limit if needed)

    console.log('Database seed completed successfully!')
  } catch (error) {
    console.error('Error seeding database:', error)
    process.exit(1)
  } finally {
    db.close()
  }
}

main()
