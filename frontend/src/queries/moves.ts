import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { API_URL } from '../utils/constants'

export interface MoveListItem {
  name: string
  type: string
  id: number
  damage_class: 'status' | 'physical' | 'special'
}

export interface MoveListResponse {
  count: number
  next: string | null
  previous: string | null
  results: MoveListItem[]
}

export interface MoveDetail {
  id: number
  name: string
  accuracy: number | null
  effect_chance: number | null
  pp: number | null
  priority: number
  power: number | null
  damage_class: {
    name: string
    url: string
  }
  type: {
    name: string
    url: string
  }
  effect_entries: Array<{
    effect: string
    language: {
      name: string
      url: string
    }
    short_effect?: string
  }>
  flavor_text_entries: Array<{
    flavor_text: string
    language: {
      name: string
      url: string
    }
    version_group: {
      name: string
      url: string
    }
  }>
  learned_by_pokemon: Array<{
    name: string
    url: string
  }>
}

// Fetch a single move by ID or name
export const fetchMoveById = async (
  id: string | number
): Promise<MoveDetail> => {
  const response = await fetch(`${API_URL}/api/moves/${id}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch move: ${id}`)
  }
  return response.json()
}

// Fetch all moves for a pokemon
export const fetchMovesByPokemon = async (
  pokemonId: number
): Promise<MoveListItem[]> => {
  const response = await fetch(`${API_URL}/api/moves?pokemon=${pokemonId}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch moves for pokemon: ${pokemonId}`)
  }
  return response.json()
}

// Hook to fetch all moves for a pokemon (no pagination)
export const useMoves = (pokemonId?: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['moves', 'list', pokemonId],
    queryFn: () => {
      if (!pokemonId) {
        throw new Error('pokemonId is required')
      }
      return fetchMovesByPokemon(pokemonId)
    },
    enabled: enabled && !!pokemonId, // Only fetch when enabled and pokemonId is provided
    staleTime: 1000 * 60 * 60, // 1 hour - moves data doesn't change often
  })
}

// Hook to fetch a single move by ID or name
export const useMove = (id: string | number | null) => {
  return useQuery({
    queryKey: ['moves', 'detail', id],
    queryFn: () => fetchMoveById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 60, // 1 hour
  })
}

// Hook to fetch a single move from a MoveListItem
export const useMoveFromListItem = (
  move: MoveListItem | null,
  enabled: boolean = true
) => {
  // Extract ID from move
  const moveId = React.useMemo(() => {
    if (!move) return null
    return move.id
  }, [move])

  return useQuery({
    queryKey: ['moves', 'detail', moveId],
    queryFn: () => fetchMoveById(moveId!),
    enabled: enabled && !!moveId,
    staleTime: 1000 * 60 * 60, // 1 hour
  })
}
