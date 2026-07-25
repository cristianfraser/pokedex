import { Router } from 'express'
import { createDatabase } from '../db/schema.js'

const router = Router()
// Read-only: the API never writes, so an accidental INSERT/UPDATE fails loudly here.
const db = createDatabase({ readonly: true })

// Get moves list with pagination (or all moves for a pokemon)
router.get('/', async (req, res) => {
  try {
    const pokemonId = req.query.pokemon
      ? parseInt(req.query.pokemon as string)
      : null

    if (pokemonId) {
      // Return all moves for the specified Pokemon (no pagination)
      const query = `
        SELECT DISTINCT m.id, m.name, t.name as type_name, m.damage_class
        FROM moves m
        JOIN move_types mt ON m.id = mt.move_id
        JOIN types t ON mt.type_id = t.id
        JOIN pokemon_moves pm ON m.id = pm.move_id
        WHERE pm.pokemon_id = ?
        ORDER BY m.id ASC
      `

      const moves = db.prepare(query).all(pokemonId) as Array<{
        id: number
        name: string
        type_name: string
        damage_class: string
      }>

      res.json(
        moves.map(m => ({
          name: m.name,
          type: m.type_name,
          id: m.id,
          damage_class: m.damage_class as 'status' | 'physical' | 'special',
        }))
      )
    } else {
      // Get all moves with pagination (for general use)
      const page = parseInt(req.query.page as string) || 0
      const limit = parseInt(req.query.limit as string) || 100
      const offset = page * limit

      const query = `
        SELECT m.id, m.name, t.name as type_name, m.damage_class
        FROM moves m
        JOIN move_types mt ON m.id = mt.move_id
        JOIN types t ON mt.type_id = t.id
        ORDER BY m.id ASC
        LIMIT ? OFFSET ?
      `
      const countQuery = 'SELECT COUNT(*) as count FROM moves'

      const moves = db.prepare(query).all(limit, offset) as Array<{
        id: number
        name: string
        type_name: string
        damage_class: string
      }>

      const countRow = db.prepare(countQuery).get() as { count: number }
      const totalCount = Number(countRow.count)

      const hasNext = offset + limit < totalCount
      const hasPrevious = offset > 0

      const nextUrl = hasNext
        ? `/api/moves?page=${page + 1}&limit=${limit}`
        : null
      const previousUrl = hasPrevious
        ? `/api/moves?page=${page - 1}&limit=${limit}`
        : null

      res.json({
        count: totalCount,
        next: nextUrl,
        previous: previousUrl,
        results: moves.map(m => ({
          name: m.name,
          type: m.type_name,
          id: m.id,
          damage_class: m.damage_class as 'status' | 'physical' | 'special',
        })),
      })
    }
  } catch (error) {
    console.error('Error fetching moves list:', error)
    res.status(500).json({ error: 'Failed to fetch moves list' })
  }
})

// Get move by ID
router.get('/:id', async (req, res) => {
  try {
    const move = db.prepare('SELECT * FROM moves WHERE id = ?').get(req.params.id) as {
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
    } | undefined

    if (!move) {
      return res.status(404).json({ error: 'Move not found' })
    }

    // Get move type
    const type = db
      .prepare(
        `SELECT t.name
       FROM types t
       JOIN move_types mt ON t.id = mt.type_id
       WHERE mt.move_id = ?`
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
  }
})

export default router
