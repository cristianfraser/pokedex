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
}

const POKEMON_PER_PAGE = 20

// Helper function to get Pokemon name in a specific language
const getPokemonName = (
  pokemonNames: Array<{ name: string; language: { name: string } }>,
  lang = 'en'
): string => {
  const nameInfo = pokemonNames.find(info => info.language.name === lang)
  return nameInfo?.name || pokemonNames[0]?.name || ''
}

// Helper function to get Pokedex number
const getPokedexNumber = (
  pokedexNumbers: Array<{ entry_number: number; pokedex: { name: string } }>,
  pokedex = 'national'
): number => {
  const pokedexInfo = pokedexNumbers.find(info => info.pokedex.name === pokedex)
  return pokedexInfo?.entry_number || 0
}

// Fetch detailed Pokemon information
const fetchPokemonDetails = async (
  pokemonName: string
): Promise<PokemonDetail> => {
  // First fetch pokemon-species to get ID and additional info
  const speciesResponse = await fetch(
    `https://pokeapi.co/api/v2/pokemon-species/${pokemonName}`
  )
  if (!speciesResponse.ok) {
    throw new Error(`Failed to fetch Pokémon species: ${pokemonName}`)
  }
  const speciesData = await speciesResponse.json()

  // Then fetch the actual pokemon data using the ID
  const pokemonResponse = await fetch(
    `https://pokeapi.co/api/v2/pokemon/${speciesData.id}`
  )
  if (!pokemonResponse.ok) {
    throw new Error(`Failed to fetch Pokémon: ${pokemonName}`)
  }
  const pokemonData = await pokemonResponse.json()

  // Combine the data
  return {
    ...pokemonData,
    ...speciesData,
    name: getPokemonName(speciesData.names),
    pokedexNumber: getPokedexNumber(speciesData.pokedex_numbers),
  }
}

const fetchPokemonList = async ({
  pageParam = 0,
  searchTerm = '',
}: {
  pageParam?: number
  searchTerm?: string
}): Promise<{
  count: number
  next: string | null
  previous: string | null
  results: PokemonDetail[]
}> => {
  const offset = (pageParam ?? 0) * POKEMON_PER_PAGE

  // First fetch the list of Pokemon
  const listResponse = await fetch(
    `https://pokeapi.co/api/v2/pokemon/?limit=${POKEMON_PER_PAGE}&offset=${offset}`
  )
  if (!listResponse.ok) {
    throw new Error('Failed to fetch Pokémon list')
  }
  const listData: PokemonListResponse = await listResponse.json()

  // Filter by search term at the list level (before fetching details)
  let filteredList = listData.results
  if (searchTerm.trim()) {
    const searchLower = searchTerm.toLowerCase().trim()
    filteredList = listData.results.filter(item =>
      item.name.toLowerCase().includes(searchLower)
    )
  }

  // Fetch detailed information for each filtered Pokemon in parallel
  const pokemonDetailsPromises = filteredList.map(item =>
    fetchPokemonDetails(item.name)
  )

  const pokemonDetails = await Promise.all(pokemonDetailsPromises)

  // Filter detailed results by search term (name and pokedex number)
  let filteredDetails = pokemonDetails
  if (searchTerm.trim()) {
    const searchLower = searchTerm.toLowerCase().trim()
    filteredDetails = pokemonDetails.filter(
      pokemon =>
        pokemon.name.toLowerCase().includes(searchLower) ||
        pokemon.pokedexNumber.toString().includes(searchTerm)
    )
  }

  return {
    count: listData.count,
    next: listData.next,
    previous: listData.previous,
    results: filteredDetails,
  }
}

export const usePokemonList = (searchTerm: string = '') => {
  return useInfiniteQuery({
    queryKey: ['pokemon', 'list', searchTerm],
    queryFn: ({ pageParam }) =>
      fetchPokemonList({
        pageParam: pageParam as number,
        searchTerm,
      }),
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
