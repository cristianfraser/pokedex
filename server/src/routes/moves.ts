import { Router } from 'express'
import { createDatabase } from '../db/schema.js'

const router = Router()

// Get moves list with pagination
router.get('/', (req, res) => {
  const db = createDatabase()

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
        WHERE pm.pokemon_id = ?
        ORDER BY m.id ASC
        LIMIT ? OFFSET ?
      `
      countQuery = `
        SELECT COUNT(DISTINCT m.id) as count
        FROM moves m
        JOIN pokemon_moves pm ON m.id = pm.move_id
        WHERE pm.pokemon_id = ?
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
        LIMIT ? OFFSET ?
      `
      countQuery = 'SELECT COUNT(*) as count FROM moves'
      params = [limit, offset]
    }

    const moves = db.prepare(query).all(...params) as Array<{
      id: number
      name: string
      type_name: string
    }>

    const totalCount = pokemonId
      ? (db.prepare(countQuery).get(pokemonId) as { count: number })
      : (db.prepare(countQuery).get() as { count: number })

    const hasNext = offset + limit < totalCount.count
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
      count: totalCount.count,
      next: nextUrl,
      previous: previousUrl,
      results: moves.map(m => [m.name, m.type_name, m.id]),
    })
  } catch (error) {
    console.error('Error fetching moves list:', error)
    res.status(500).json({ error: 'Failed to fetch moves list' })
  } finally {
    db.close()
  }
})

// Get move by ID
router.get('/:id', (req, res) => {
  const db = createDatabase()

  try {
    const move = db
      .prepare(
        `
      SELECT * FROM moves WHERE id = ?
    `
      )
      .get(req.params.id) as
      | {
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
      | undefined

    if (!move) {
      return res.status(404).json({ error: 'Move not found' })
    }

    // Get move type
    const type = db
      .prepare(
        `
      SELECT t.name
      FROM types t
      JOIN move_types mt ON t.id = mt.type_id
      WHERE mt.move_id = ?
    `
      )
      .get(req.params.id) as { name: string } | undefined

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
  } finally {
    db.close()
  }
})

export default router
