import { Router } from 'express'
import { createDatabase } from '../db/schema.js'
import { Pool } from 'pg'

const router = Router()
const pool = createDatabase()

// Get moves list with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 0
    const limit = parseInt(req.query.limit as string) || 100
    const offset = page * limit
    const pokemonId = req.query.pokemon
      ? parseInt(req.query.pokemon as string)
      : null

    // Build query based on whether pokemon filter is provided
    let query: string
    let countQuery: string
    let params: any[]

    if (pokemonId) {
      // Filter moves that can be learned by the specified Pokemon
      query = `
        SELECT DISTINCT m.id, m.name, t.name as type_name
        FROM moves m
        JOIN move_types mt ON m.id = mt.move_id
        JOIN types t ON mt.type_id = t.id
        JOIN pokemon_moves pm ON m.id = pm.move_id
        WHERE pm.pokemon_id = $1
        ORDER BY m.id ASC
        LIMIT $2 OFFSET $3
      `
      countQuery = `
        SELECT COUNT(DISTINCT m.id) as count
        FROM moves m
        JOIN pokemon_moves pm ON m.id = pm.move_id
        WHERE pm.pokemon_id = $1
      `
      params = [pokemonId, limit, offset]
    } else {
      // Get all moves
      query = `
        SELECT m.id, m.name, t.name as type_name
        FROM moves m
        JOIN move_types mt ON m.id = mt.move_id
        JOIN types t ON mt.type_id = t.id
        ORDER BY m.id ASC
        LIMIT $1 OFFSET $2
      `
      countQuery = 'SELECT COUNT(*) as count FROM moves'
      params = [limit, offset]
    }

    const movesResult = await pool.query(query, params)
    const moves = movesResult.rows as Array<{
      id: number
      name: string
      type_name: string
    }>

    const countResult = pokemonId
      ? await pool.query(countQuery, [pokemonId])
      : await pool.query(countQuery)
    const totalCount = parseInt(countResult.rows[0].count)

    const hasNext = offset + limit < totalCount
    const hasPrevious = offset > 0

    // Build next/previous URLs with pokemon param if present
    const pokemonParam = pokemonId ? `&pokemon=${pokemonId}` : ''
    const nextUrl = hasNext
      ? `/api/moves?page=${page + 1}&limit=${limit}${pokemonParam}`
      : null
    const previousUrl = hasPrevious
      ? `/api/moves?page=${page - 1}&limit=${limit}${pokemonParam}`
      : null

    res.json({
      count: totalCount,
      next: nextUrl,
      previous: previousUrl,
      results: moves.map(m => [m.name, m.type_name, m.id]),
    })
  } catch (error) {
    console.error('Error fetching moves list:', error)
    res.status(500).json({ error: 'Failed to fetch moves list' })
  }
})

// Get move by ID
router.get('/:id', async (req, res) => {
  try {
    const moveResult = await pool.query(
      'SELECT * FROM moves WHERE id = $1',
      [req.params.id]
    )

    if (moveResult.rows.length === 0) {
      return res.status(404).json({ error: 'Move not found' })
    }

    const move = moveResult.rows[0] as {
      id: number
      name: string
      accuracy: number | null
      effect_chance: number | null
      pp: number | null
      priority: number
      power: number | null
      damage_class: string
      effect_text: string | null
      short_effect_text: string | null
    }

    // Get move type
    const typeResult = await pool.query(
      `SELECT t.name
       FROM types t
       JOIN move_types mt ON t.id = mt.type_id
       WHERE mt.move_id = $1`,
      [req.params.id]
    )

    const type = typeResult.rows[0] as { name: string } | undefined

    // Format response to match frontend expectations
    const response = {
      id: move.id,
      name: move.name,
      accuracy: move.accuracy,
      effect_chance: move.effect_chance,
      pp: move.pp,
      priority: move.priority,
      power: move.power,
      damage_class: {
        name: move.damage_class,
        url: `/api/damage-class/${move.damage_class}`,
      },
      type: type
        ? {
            name: type.name,
            url: `/api/type/${type.name}`,
          }
        : null,
      effect_entries: move.effect_text
        ? [
            {
              effect: move.effect_text,
              language: { name: 'en' },
              short_effect: move.short_effect_text || undefined,
            },
          ]
        : [],
      flavor_text_entries: [],
      learned_by_pokemon: [],
    }

    res.json(response)
  } catch (error) {
    console.error('Error fetching move:', error)
    res.status(500).json({ error: 'Failed to fetch move' })
  }
})

export default router
