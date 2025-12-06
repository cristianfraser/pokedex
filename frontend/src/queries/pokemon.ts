import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useMemo } from 'react'
import { API_URL } from '../utils/constants'

export interface PokemonListItem {
  name: string
  url: string
}

export interface PokemonBasic {
  id: number
  name: string
  pokedex_number: number
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
      short_name?: string
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
  dominant_color?: string
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

// Fetch all pokemon basic info (for combobox)
export const fetchAllPokemonBasic = async (): Promise<PokemonBasic[]> => {
  const response = await fetch(`${API_URL}/api/pokemon/all/basic`)
  if (!response.ok) {
    throw new Error('Failed to fetch Pokémon basic list')
  }
  return response.json()
}

// Hook to get all pokemon basic info (name, id)
export const useAllPokemonBasic = () => {
  return useQuery({
    queryKey: ['pokemon', 'all', 'basic'],
    queryFn: fetchAllPokemonBasic,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours - this data rarely changes
  })
}

// Helper function to find Pokemon in cache synchronously
const findPokemonInCache = (
  queryClient: ReturnType<typeof useQueryClient>,
  id: number
): PokemonDetail | undefined => {
  // Get all query cache entries
  const cache = queryClient.getQueryCache()
  const allQueries = cache.getAll()

  // Search through all pokemon list queries
  for (const query of allQueries) {
    const queryKey = query.queryKey
    // Check if this is a pokemon list query
    if (
      Array.isArray(queryKey) &&
      queryKey[0] === 'pokemon' &&
      queryKey[1] === 'list'
    ) {
      const queryData = query.state.data
      // Check if it's an infinite query with pages
      if (queryData && typeof queryData === 'object' && 'pages' in queryData) {
        const pages = (queryData as { pages: unknown[] }).pages
        // Search through all pages
        for (const page of pages) {
          if (
            page &&
            typeof page === 'object' &&
            'results' in page &&
            Array.isArray(page.results)
          ) {
            const pokemon = (page.results as PokemonDetail[]).find(
              p => p.id === id
            )
            if (pokemon) {
              return pokemon
            }
          }
        }
      }
    }
  }

  return undefined
}

// Hook to fetch pokemon by ID
export const usePokemonById = (id: number | null | undefined) => {
  const queryClient = useQueryClient()

  // Check cache synchronously before query runs
  const cachedPokemon =
    id !== null && id !== undefined
      ? findPokemonInCache(queryClient, id)
      : undefined

  return useQuery({
    queryKey: ['pokemon', 'byId', id],
    queryFn: async () => {
      // If we have cached data, return it immediately (shouldn't happen due to initialData, but as fallback)
      if (cachedPokemon) {
        return cachedPokemon
      }
      // If not found in cache, fetch from API
      return fetchPokemonById(id!)
    },
    enabled: id !== null && id !== undefined,
    staleTime: 1000 * 60 * 60, // 1 hour
    initialData: cachedPokemon, // Use cached data as initial data to avoid loading state
    placeholderData: cachedPokemon, // Also use as placeholder to prevent loading flash
  })
}
