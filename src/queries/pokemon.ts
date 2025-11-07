import { useInfiniteQuery } from '@tanstack/react-query'

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

const POKEMON_PER_PAGE = 20

const fetchPokemonList = async ({
  pageParam = 0,
}: {
  pageParam?: number
}): Promise<PokemonListResponse> => {
  const offset = (pageParam ?? 0) * POKEMON_PER_PAGE
  const response = await fetch(
    `https://pokeapi.co/api/v2/pokemon/?limit=${POKEMON_PER_PAGE}&offset=${offset}`
  )
  if (!response.ok) {
    throw new Error('Failed to fetch Pokémon list')
  }
  return response.json()
}

export const usePokemonList = () => {
  return useInfiniteQuery({
    queryKey: ['pokemon', 'list'],
    queryFn: ({ pageParam }) =>
      fetchPokemonList({ pageParam: pageParam as number }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      // Safety check: if lastPage or allPages is undefined/not an array, return undefined
      if (!lastPage || !Array.isArray(allPages)) {
        return undefined
      }
      // If there's a next page URL, return the next page number
      if (lastPage.next) {
        return allPages.length
      }
      // Otherwise, return undefined to signal no more pages
      return undefined
    },
    staleTime: 1000 * 60 * 60, // 1 hour - Pokémon data doesn't change often
  })
}
