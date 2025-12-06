import { Router } from 'express'
import { createDatabase } from '../db/schema.js'
import { Pool } from 'pg'

const router = Router()
const pool = createDatabase()

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
    let paramIndex = 1

    if (search) {
      whereClause += ` AND p.name ILIKE $${paramIndex}`
      params.push(`%${search}%`)
      paramIndex++
    }

    if (type) {
      whereClause += ` AND EXISTS (
        SELECT 1 FROM pokemon_types pt
        JOIN types t ON pt.type_id = t.id
        WHERE pt.pokemon_id = p.id AND LOWER(t.name) = LOWER($${paramIndex})
      )`
      params.push(type)
      paramIndex++
    }

    // Get total count
    const countResult = await pool.query(
      `
      SELECT COUNT(DISTINCT p.id) as count
      FROM pokemon p
      ${whereClause}
    `,
      params
    )
    const totalCount = parseInt(countResult.rows[0].count)

    // Add limit and offset to params for the main query
    const limitOffsetParams = [...params, limit, offset]
    const limitParamIndex = paramIndex
    const offsetParamIndex = paramIndex + 1

    // Get paginated Pokemon with all details
    const pokemonListResult = await pool.query(
      `
      SELECT DISTINCT
        p.id, p.name, p.pokedex_number, p.height, p.weight, p.base_experience,
        p.sprite_front_default, p.sprite_front_shiny, p.sprite_official_artwork,
        p.is_legendary, p.is_mythical, p.color, p.habitat, p.flavor_text, p.dominant_color
      FROM pokemon p
      ${whereClause}
      ORDER BY p.pokedex_number ASC
      LIMIT $${limitParamIndex} OFFSET $${offsetParamIndex}
    `,
      limitOffsetParams
    )

    const pokemonList = pokemonListResult.rows as Array<{
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
    const results = await Promise.all(
      pokemonList.map(async p => {
        const typesResult = await pool.query(
          `SELECT t.name, pt.slot
           FROM types t
           JOIN pokemon_types pt ON t.id = pt.type_id
           WHERE pt.pokemon_id = $1
           ORDER BY pt.slot ASC`,
          [p.id]
        )

        const statsResult = await pool.query(
          `SELECT stat_name, base_stat, effort, short_name
           FROM pokemon_stats
           WHERE pokemon_id = $1`,
          [p.id]
        )

        const types = typesResult.rows as Array<{ name: string; slot: number }>
        const stats = statsResult.rows as Array<{
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
    )

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
    const result = await pool.query(
      'SELECT id, name, pokedex_number FROM pokemon ORDER BY pokedex_number ASC'
    )

    const pokemonBasic = result.rows.map(row => ({
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
    const pokemonResult = await pool.query(
      'SELECT * FROM pokemon WHERE id = $1',
      [req.params.id]
    )

    if (pokemonResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pokemon not found' })
    }

    const pokemon = pokemonResult.rows[0] as {
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
    }

    // Get types
    const typesResult = await pool.query(
      `SELECT t.name, pt.slot
       FROM types t
       JOIN pokemon_types pt ON t.id = pt.type_id
       WHERE pt.pokemon_id = $1
       ORDER BY pt.slot ASC`,
      [pokemon.id]
    )

    // Get stats
    const statsResult = await pool.query(
      `SELECT stat_name, base_stat, effort, short_name
       FROM pokemon_stats
       WHERE pokemon_id = $1`,
      [pokemon.id]
    )

    const types = typesResult.rows as Array<{ name: string; slot: number }>
    const stats = statsResult.rows as Array<{
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
