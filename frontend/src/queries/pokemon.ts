import { useInfiniteQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { API_URL } from '../utils/constants'

export interface PokemonListItem {
  name: string
  url: string
}

export interface PokemonListResponse {
  count: number
  next: string | null
  previous: string | null
  results: PokemonListItem[]
}

export interface PokemonDetail {
  id: number
  name: string
  pokedexNumber: number
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
    type: {
      name: string
      url: string
    }
  }>
  stats: Array<{
    base_stat: number
    effort: number
    stat: {
      name: string
      url: string
    }
  }>
  height: number
  weight: number
  base_experience: number
  species: {
    name: string
    url: string
  }
  // Additional species data
  flavor_text_entries?: Array<{
    flavor_text: string
    language: {
      name: string
      url: string
    }
    version: {
      name: string
      url: string
    }
  }>
  color?: {
    name: string
    url: string
  }
  habitat?: {
    name: string
    url: string
  }
  is_legendary?: boolean
  is_mythical?: boolean
}

const POKEMON_PER_PAGE = 100

// Fetch a single Pokemon by ID
export const fetchPokemonById = async (
  id: string | number
): Promise<PokemonDetail> => {
  const response = await fetch(`${API_URL}/api/pokemon/${id}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch Pokémon: ${id}`)
  }
  return response.json()
}

export const usePokemonList = (searchTerm: string = '', type?: string) => {
  const query = useInfiniteQuery({
    queryKey: ['pokemon', 'list', searchTerm, type],
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams()
      params.set('page', pageParam.toString())
      params.set('limit', POKEMON_PER_PAGE.toString())
      if (searchTerm.trim()) {
        params.set('search', searchTerm.trim())
      }
      if (type) {
        params.set('type', type)
      }

      const response = await fetch(
        `${API_URL}/api/pokemon/list?${params.toString()}`
      )
      if (!response.ok) {
        throw new Error('Failed to fetch Pokémon list')
      }
      const data = await response.json()
      // Store the full response metadata for pagination
      return {
        results: data.results as PokemonDetail[],
        next: data.next,
        count: data.count,
      }
    },
    initialPageParam: 0,
    getNextPageParam: lastPage => {
      if (!lastPage.next) {
        return undefined
      }
      // Extract page from next URL
      const nextUrl = new URL(lastPage.next, window.location.origin)
      const page = parseInt(nextUrl.searchParams.get('page') || '0', 10)
      return page
    },
    staleTime: 1000 * 60 * 60, // 1 hour - Pokémon data doesn't change often
  })

  // Flatten all pages into a single array
  const pokemonList = useMemo(() => {
    const list: PokemonDetail[] = []
    query.data?.pages.forEach(page => {
      if (page && 'results' in page && Array.isArray(page.results)) {
        list.push(...page.results)
      }
    })
    return list
  }, [query.data])

  return {
    ...query,
    pokemonList,
  }
}
