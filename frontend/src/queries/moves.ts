import * as React from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'

export interface MoveListItem {
  name: string
  url: string
  type?: string // Type is now available directly
}

export interface MoveListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Array<[string, string, number]> // [moveName, moveType, moveId]
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

const MOVES_PER_PAGE = 100

// Fetch a single move by ID or name
export const fetchMoveById = async (
  id: string | number
): Promise<MoveDetail> => {
  const response = await fetch(`/api/moves/${id}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch move: ${id}`)
  }
  return response.json()
}

// Hook to fetch all moves with infinite scroll
export const useMoves = (pokemonId?: number, enabled: boolean = true) => {
  const query = useInfiniteQuery({
    queryKey: ['moves', 'list', pokemonId],
    queryFn: ({ pageParam = 0 }) => {
      const url = pokemonId
        ? `/api/moves?page=${pageParam}&limit=${MOVES_PER_PAGE}&pokemon=${pokemonId}`
        : `/api/moves?page=${pageParam}&limit=${MOVES_PER_PAGE}`
      return fetch(url).then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch moves list')
        }
        return res.json()
      })
    },
    getNextPageParam: (lastPage, _allPages) => {
      if (!lastPage.next) {
        return undefined
      }
      // Extract page from next URL (e.g., "/api/moves?page=1&limit=100")
      const nextUrl = new URL(lastPage.next, window.location.origin)
      const page = parseInt(nextUrl.searchParams.get('page') || '0', 10)
      return page
    },
    initialPageParam: 0,
    enabled, // Only fetch when enabled
    staleTime: 1000 * 60 * 60, // 1 hour - moves data doesn't change often
  })

  return query
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
// move can be either the old format (MoveListItem) or new format (tuple [name, type, id])
export const useMoveFromListItem = (
  move: MoveListItem | [string, string, number] | null,
  enabled: boolean = true
) => {
  // Extract ID from move - handle both old and new formats
  const moveId = React.useMemo(() => {
    if (!move) return null
    if (Array.isArray(move)) {
      // New format: [name, type, id]
      return move[2]
    } else {
      // Old format: { name, url }
      if (!move.url) return null
      const urlParts = move.url.split('/').filter(Boolean)
      const id = urlParts[urlParts.length - 1] // Last part is the ID
      return id ? (isNaN(Number(id)) ? id : Number(id)) : null
    }
  }, [move])

  return useQuery({
    queryKey: ['moves', 'detail', moveId],
    queryFn: () => fetchMoveById(moveId!),
    enabled: enabled && !!moveId,
    staleTime: 1000 * 60 * 60, // 1 hour
  })
}
