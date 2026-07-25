import { Router } from 'express'
import { createDatabase } from '../db/schema.js'

const router = Router()
// Read-only: the API never writes, so an accidental INSERT/UPDATE fails loudly here.
const db = createDatabase({ readonly: true })

// Get Pokemon list with pagination, search, and type filtering
router.get('/list', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 0
    const limit = parseInt(req.query.limit as string) || 20
    const offset = page * limit
    const search = req.query.search as string | undefined
    const type = req.query.type as string | undefined

    // Build WHERE clause based on filters
    let whereClause = 'WHERE 1=1'
    const params: any[] = []

    if (search) {
      // SQLite's LIKE is case-insensitive for ASCII, matching Postgres ILIKE here.
      whereClause += ` AND p.name LIKE ?`
      params.push(`%${search}%`)
    }

    if (type) {
      whereClause += ` AND EXISTS (
        SELECT 1 FROM pokemon_types pt
        JOIN types t ON pt.type_id = t.id
        WHERE pt.pokemon_id = p.id AND LOWER(t.name) = LOWER(?)
      )`
      params.push(type)
    }

    // Get total count
    const countRow = db
      .prepare(
        `
      SELECT COUNT(DISTINCT p.id) as count
      FROM pokemon p
      ${whereClause}
    `
      )
      .get(...params) as { count: number }
    const totalCount = Number(countRow.count)

    // Get paginated Pokemon with all details
    const pokemonList = db
      .prepare(
        `
      SELECT DISTINCT
        p.id, p.name, p.pokedex_number, p.height, p.weight, p.base_experience,
        p.sprite_front_default, p.sprite_front_shiny, p.sprite_official_artwork,
        p.is_legendary, p.is_mythical, p.color, p.habitat, p.flavor_text, p.dominant_color
      FROM pokemon p
      ${whereClause}
      ORDER BY p.pokedex_number ASC
      LIMIT ? OFFSET ?
    `
      )
      .all(...params, limit, offset) as Array<{
      id: number
      name: string
      pokedex_number: number
      height: number
      weight: number
      base_experience: number
      sprite_front_default: string | null
      sprite_front_shiny: string | null
      sprite_official_artwork: string | null
      is_legendary: number
      is_mythical: number
      color: string | null
      habitat: string | null
      flavor_text: string | null
      dominant_color: string | null
    }>

    // Get types and stats for each Pokemon
    const typesForPokemon = db.prepare(
      `SELECT t.name, pt.slot
       FROM types t
       JOIN pokemon_types pt ON t.id = pt.type_id
       WHERE pt.pokemon_id = ?
       ORDER BY pt.slot ASC`
    )
    const statsForPokemon = db.prepare(
      `SELECT stat_name, base_stat, effort, short_name
       FROM pokemon_stats
       WHERE pokemon_id = ?`
    )

    const results = pokemonList.map(p => {
        const types = typesForPokemon.all(p.id) as Array<{ name: string; slot: number }>
        const stats = statsForPokemon.all(p.id) as Array<{
          stat_name: string
          base_stat: number
          effort: number
          short_name: string | null
        }>

        return {
          id: p.id,
          name: p.name,
          pokedexNumber: p.pokedex_number,
          height: p.height,
          weight: p.weight,
          base_experience: p.base_experience,
          sprites: {
            front_default: p.sprite_front_default,
            front_shiny: p.sprite_front_shiny,
            other: {
              'official-artwork': {
                front_default: p.sprite_official_artwork,
              },
            },
          },
          types: types.map(t => ({
            slot: t.slot,
            type: {
              name: t.name,
              url: `/api/type/${t.name}`,
            },
          })),
          stats: stats.map(s => ({
            base_stat: s.base_stat,
            effort: s.effort,
            stat: {
              name: s.stat_name,
              short_name: s.short_name || s.stat_name,
              url: `/api/stat/${s.stat_name}`,
            },
          })),
          species: {
            name: p.name,
            url: `/api/pokemon-species/${p.id}`,
          },
          flavor_text_entries: p.flavor_text
            ? [
                {
                  flavor_text: p.flavor_text,
                  language: { name: 'en' },
                  version: { name: 'unknown' },
                },
              ]
            : [],
          color: p.color
            ? {
                name: p.color,
                url: `/api/pokemon-color/${p.color}`,
              }
            : undefined,
          habitat: p.habitat
            ? {
                name: p.habitat,
                url: `/api/pokemon-habitat/${p.habitat}`,
              }
            : undefined,
          is_legendary: p.is_legendary === 1,
          is_mythical: p.is_mythical === 1,
          dominant_color: p.dominant_color || undefined,
        }
    })

    const hasNext = offset + limit < totalCount
    const hasPrevious = offset > 0

    // Build query params for next/previous URLs
    const queryParams = new URLSearchParams()
    if (search) queryParams.set('search', search)
    if (type) queryParams.set('type', type)
    queryParams.set('limit', limit.toString())
    const queryString = queryParams.toString()

    res.json({
      count: totalCount,
      next: hasNext
        ? `/api/pokemon/list?page=${page + 1}&${queryString}`
        : null,
      previous: hasPrevious
        ? `/api/pokemon/list?page=${page - 1}&${queryString}`
        : null,
      results,
    })
  } catch (error) {
    console.error('Error fetching Pokemon list:', error)
    res.status(500).json({ error: 'Failed to fetch Pokemon list' })
  }
})

// Get all Pokemon basic info (id, name, pokedex_number only)
router.get('/all/basic', async (req, res) => {
  try {
    const rows = db
      .prepare('SELECT id, name, pokedex_number FROM pokemon ORDER BY pokedex_number ASC')
      .all() as Array<{ id: number; name: string; pokedex_number: number }>

    const pokemonBasic = rows.map(row => ({
      id: row.id,
      name: row.name,
      pokedex_number: row.pokedex_number,
    }))

    res.json(pokemonBasic)
  } catch (error) {
    console.error('Error fetching Pokemon basic list:', error)
    res.status(500).json({ error: 'Failed to fetch Pokemon basic list' })
  }
})

// Get Pokemon by ID
router.get('/:id', async (req, res) => {
  try {
    const pokemon = db
      .prepare('SELECT * FROM pokemon WHERE id = ?')
      .get(req.params.id) as {
      id: number
      name: string
      pokedex_number: number
      height: number
      weight: number
      base_experience: number
      sprite_front_default: string | null
      sprite_front_shiny: string | null
      sprite_official_artwork: string | null
      is_legendary: number
      is_mythical: number
      color: string | null
      habitat: string | null
      flavor_text: string | null
      dominant_color: string | null
    } | undefined

    if (!pokemon) {
      return res.status(404).json({ error: 'Pokemon not found' })
    }

    // Get types
    const types = db
      .prepare(
        `SELECT t.name, pt.slot
       FROM types t
       JOIN pokemon_types pt ON t.id = pt.type_id
       WHERE pt.pokemon_id = ?
       ORDER BY pt.slot ASC`
      )
      .all(pokemon.id) as Array<{ name: string; slot: number }>

    // Get stats
    const stats = db
      .prepare(
        `SELECT stat_name, base_stat, effort, short_name
       FROM pokemon_stats
       WHERE pokemon_id = ?`
      )
      .all(pokemon.id) as Array<{
      stat_name: string
      base_stat: number
      effort: number
      short_name: string | null
    }>

    // Format response to match frontend expectations
    const response = {
      id: pokemon.id,
      name: pokemon.name,
      pokedexNumber: pokemon.pokedex_number,
      height: pokemon.height,
      weight: pokemon.weight,
      base_experience: pokemon.base_experience,
      sprites: {
        front_default: pokemon.sprite_front_default,
        front_shiny: pokemon.sprite_front_shiny,
        other: {
          'official-artwork': {
            front_default: pokemon.sprite_official_artwork,
          },
        },
      },
      types: types.map(t => ({
        slot: t.slot,
        type: {
          name: t.name,
          url: `/api/type/${t.name}`,
        },
      })),
      stats: stats.map(s => ({
        base_stat: s.base_stat,
        effort: s.effort,
        stat: {
          name: s.stat_name,
          short_name: s.short_name || s.stat_name,
          url: `/api/stat/${s.stat_name}`,
        },
      })),
      species: {
        name: pokemon.name,
        url: `/api/pokemon-species/${pokemon.id}`,
      },
      flavor_text_entries: pokemon.flavor_text
        ? [
            {
              flavor_text: pokemon.flavor_text,
              language: { name: 'en' },
              version: { name: 'unknown' },
            },
          ]
        : [],
      color: pokemon.color
        ? {
            name: pokemon.color,
            url: `/api/pokemon-color/${pokemon.color}`,
          }
        : undefined,
      habitat: pokemon.habitat
        ? {
            name: pokemon.habitat,
            url: `/api/pokemon-habitat/${pokemon.habitat}`,
          }
        : undefined,
      is_legendary: pokemon.is_legendary === 1,
      is_mythical: pokemon.is_mythical === 1,
      dominant_color: pokemon.dominant_color || undefined,
    }

    res.json(response)
  } catch (error) {
    console.error('Error fetching Pokemon:', error)
    res.status(500).json({ error: 'Failed to fetch Pokemon' })
  }
})

export default router
