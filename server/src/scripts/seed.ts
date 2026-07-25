import { createDatabase, initializeSchema } from '../db/schema.js'
import type { Database as SqliteDatabase } from 'better-sqlite3'

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

interface PokeAPIListResponse {
  results: PokeAPIType[]
  next: string | null
  previous: string | null
}

interface PokeAPIPokedex {
  pokemon_entries: Array<{
    pokemon_species: {
      name: string
    }
  }>
}

async function seedTypes(db: SqliteDatabase) {
  console.log('Seeding types...')
  const response = await fetchWithRetry(`${POKEAPI_BASE}/type?limit=100`)
  const data = (await response.json()) as PokeAPIListResponse

  const typeNames = data.results.map((t: PokeAPIType) => t.name)

  const insertType = db.prepare(
    'INSERT INTO types (name) VALUES (?) ON CONFLICT (name) DO NOTHING'
  )
  for (const typeName of typeNames) {
    insertType.run(typeName)
  }

  console.log(`Seeded ${typeNames.length} types`)
}

async function seedPokemon(db: SqliteDatabase, limit?: number) {
  console.log('Seeding Pokemon...')

  const pageSize = 300

  // Get all Pokemon from national pokedex
  const pokedexResponse = await fetchWithRetry(
    `${POKEAPI_BASE}/pokedex/national/`
  )
  const pokedexData = (await pokedexResponse.json()) as PokeAPIPokedex

  const entries = pokedexData.pokemon_entries.slice(0, limit)
  console.log(`Fetching ${entries.length} Pokemon in batches of ${pageSize}...`)

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
        const speciesData = (await speciesResponse.json()) as PokeAPISpecies

        // Fetch Pokemon data
        const pokemonResponse = await fetchWithRetry(
          `${POKEAPI_BASE}/pokemon/${speciesData.id}`
        )
        const pokemonData = (await pokemonResponse.json()) as PokeAPIPokemon

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

        // Insert Pokemon and its related rows atomically
        const insertPokemon = db.prepare(
          `INSERT INTO pokemon (
              id, name, pokedex_number, height, weight, base_experience,
              sprite_front_default, sprite_front_shiny, sprite_official_artwork,
              is_legendary, is_mythical, color, habitat, flavor_text
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT (id) DO UPDATE SET
              name = EXCLUDED.name,
              pokedex_number = EXCLUDED.pokedex_number,
              height = EXCLUDED.height,
              weight = EXCLUDED.weight,
              base_experience = EXCLUDED.base_experience,
              sprite_front_default = EXCLUDED.sprite_front_default,
              sprite_front_shiny = EXCLUDED.sprite_front_shiny,
              sprite_official_artwork = EXCLUDED.sprite_official_artwork,
              is_legendary = EXCLUDED.is_legendary,
              is_mythical = EXCLUDED.is_mythical,
              color = EXCLUDED.color,
              habitat = EXCLUDED.habitat,
              flavor_text = EXCLUDED.flavor_text`
        )
        const insertPokemonType = db.prepare(
          `INSERT INTO pokemon_types (pokemon_id, type_id, slot)
               VALUES (?, (SELECT id FROM types WHERE name = ?), ?)
               ON CONFLICT (pokemon_id, type_id) DO NOTHING`
        )
        const insertPokemonStat = db.prepare(
          `INSERT INTO pokemon_stats (pokemon_id, stat_name, base_stat, effort, short_name)
               VALUES (?, ?, ?, ?, ?)
               ON CONFLICT (pokemon_id, stat_name) DO UPDATE SET
                 base_stat = EXCLUDED.base_stat,
                 effort = EXCLUDED.effort,
                 short_name = EXCLUDED.short_name`
        )

        const statShortNames: Record<string, string> = {
          'hp': 'hp',
          'attack': 'atk',
          'defense': 'def',
          'special-attack': 'sp. atk',
          'special-defense': 'sp. def',
          'speed': 'speed',
        }

        const writePokemon = db.transaction(() => {
          insertPokemon.run([
              pokemonData.id,
              englishName,
              pokedexNumber,
              pokemonData.height,
              pokemonData.weight,
              pokemonData.base_experience,
              pokemonData.sprites.front_default,
              pokemonData.sprites.front_shiny,
              pokemonData.sprites.other?.['official-artwork']?.front_default ||
                null,
              speciesData.is_legendary ? 1 : 0,
              speciesData.is_mythical ? 1 : 0,
              speciesData.color?.name || null,
              speciesData.habitat?.name || null,
              flavorText,
          ])

          for (const typeEntry of pokemonData.types) {
            insertPokemonType.run(pokemonData.id, typeEntry.type.name, typeEntry.slot)
          }

          for (const stat of pokemonData.stats) {
            const shortName = statShortNames[stat.stat.name] || stat.stat.name
            insertPokemonStat.run(
              pokemonData.id,
              stat.stat.name,
              stat.base_stat,
              stat.effort,
              shortName
            )
          }
        })
        writePokemon()

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

async function seedMoves(db: SqliteDatabase, limit?: number) {
  console.log('Seeding moves...')

  const insertMove = db.prepare(
    `INSERT INTO moves (
              id, name, accuracy, effect_chance, pp, priority, power,
              damage_class, effect_text, short_effect_text
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT (id) DO UPDATE SET
              name = EXCLUDED.name,
              accuracy = EXCLUDED.accuracy,
              effect_chance = EXCLUDED.effect_chance,
              pp = EXCLUDED.pp,
              priority = EXCLUDED.priority,
              power = EXCLUDED.power,
              damage_class = EXCLUDED.damage_class,
              effect_text = EXCLUDED.effect_text,
              short_effect_text = EXCLUDED.short_effect_text`
  )
  const findType = db.prepare('SELECT id FROM types WHERE name = ?')
  const insertMoveType = db.prepare(
    `INSERT INTO move_types (move_id, type_id)
               VALUES (?, (SELECT id FROM types WHERE name = ?))
               ON CONFLICT (move_id, type_id) DO NOTHING`
  )
  const findPokemon = db.prepare('SELECT id FROM pokemon WHERE id = ?')
  const insertPokemonMove = db.prepare(
    `INSERT INTO pokemon_moves (pokemon_id, move_id)
                   VALUES (?, ?)
                   ON CONFLICT (pokemon_id, move_id) DO NOTHING`
  )

  let offset = 0
  const pageSize = 100
  let hasMore = true
  let totalProcessed = 0

  while (hasMore && (!limit || totalProcessed < limit)) {
    const response = await fetchWithRetry(
      `${POKEAPI_BASE}/move?offset=${offset}&limit=${pageSize}`
    )
    const data = (await response.json()) as PokeAPIListResponse

    const movesToProcess = limit
      ? data.results.slice(0, limit - totalProcessed)
      : data.results

    for (const moveListItem of movesToProcess) {
      try {
        const moveResponse = await fetchWithRetry(moveListItem.url)
        const moveData = (await moveResponse.json()) as PokeAPIMove

        // Get English effect text
        const effectEntry = moveData.effect_entries.find(
          e => e.language.name === 'en'
        )

        const writeMove = db.transaction(() => {
          insertMove.run([
              moveData.id,
              moveData.name,
              moveData.accuracy,
              moveData.effect_chance,
              moveData.pp,
              moveData.priority,
              moveData.power,
              moveData.damage_class.name,
              effectEntry?.effect || null,
              effectEntry?.short_effect || null,
          ])

          // Insert move type (only if type exists)
          if (findType.get(moveData.type.name)) {
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
            // Silently skip if the Pokemon isn't in the database yet
            if (pokemonId && findPokemon.get(pokemonId)) {
              insertPokemonMove.run(pokemonId, moveData.id)
            }
          }
        })
        writeMove()

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

    // Initialize schema first
    console.log('Initializing database schema...')
    initializeSchema(db)
    console.log('Database schema initialized')

    await seedTypes(db)
    await seedPokemon(db, seedLimit()) // all Pokemon unless POKEDEX_SEED_LIMIT is set
    await seedMoves(db, seedLimit()) // all moves unless POKEDEX_SEED_LIMIT is set

    console.log('Database seed completed successfully!')

    // Calculate dominant colors after seeding
    console.log('\nCalculating dominant colors from images...')
    try {
      const { calculateDominantColors } = await import('./calculate-dominant-colors.js')
      await calculateDominantColors(db)
      console.log('Dominant colors calculated successfully!')
    } catch (error) {
      console.warn('Warning: Could not calculate dominant colors:', (error as Error).message)
      console.warn('You can run "yarn calculate-colors" separately to calculate colors later.')
    }
  } catch (error) {
    console.error('Error seeding database:', error)
    process.exit(1)
  } finally {
    db.close()
  }
}

/**
 * Optional cap for smoke-testing the pipeline without a 30+ minute full run:
 * POKEDEX_SEED_LIMIT=5 yarn seed
 */
function seedLimit(): number | undefined {
  const raw = process.env.POKEDEX_SEED_LIMIT?.trim()
  if (!raw) return undefined
  const n = Number(raw)
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error(`POKEDEX_SEED_LIMIT must be a positive integer, got "${raw}"`)
  }
  return n
}

main()
