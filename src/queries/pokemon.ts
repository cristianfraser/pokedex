import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

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

// Fetch all Pokemon list from pokedex (only base species, no forms)
const fetchAllPokemonList = async (): Promise<PokemonListItem[]> => {
  // Use pokedex endpoint to get only base species (like the example)
  const response = await fetch('https://pokeapi.co/api/v2/pokedex/national/')
  if (!response.ok) {
    throw new Error('Failed to fetch Pokémon list')
  }
  const pokedexData = await response.json()

  // Extract pokemon_species names from pokedex entries
  // This only includes base species, not form variants
  return pokedexData.pokemon_entries.map(
    (entry: {
      entry_number: number
      pokemon_species: { name: string; url: string }
    }) => ({
      name: entry.pokemon_species.name,
      url: entry.pokemon_species.url,
    })
  )
}

export const usePokemonList = (searchTerm: string = '') => {
  // First, fetch all Pokemon list (cached)
  const { data: allPokemonList } = useQuery({
    queryKey: ['pokemon', 'all-list'],
    queryFn: fetchAllPokemonList,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours - this list doesn't change often
  })

  // Filter the Pokemon list based on search term
  const pokemonToQuery = useMemo(() => {
    if (!allPokemonList) return []

    if (!searchTerm.trim()) {
      return allPokemonList
    }

    const searchLower = searchTerm.toLowerCase().trim()
    return allPokemonList.filter(item =>
      item.name.toLowerCase().includes(searchLower)
    )
  }, [allPokemonList, searchTerm])

  // Infinite query that paginates the filtered list
  const query = useInfiniteQuery({
    queryKey: ['pokemon', 'list', searchTerm],
    placeholderData: previousData => previousData,
    queryFn: async ({ pageParam = 0 }) => {
      // Get the slice of Pokemon to fetch for this page
      const pokemonToQueryPage = pokemonToQuery.slice(
        (pageParam as number) * POKEMON_PER_PAGE,
        ((pageParam as number) + 1) * POKEMON_PER_PAGE
      )

      // Fetch species data for all Pokemon in this page
      // Handle 404s gracefully (some Pokemon might not have species entries)
      const pokemonSpeciesPromiseArray = pokemonToQueryPage.map(pokeToQuery =>
        fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokeToQuery.name}`)
          .then(res => {
            if (!res.ok) {
              throw new Error(`Species not found: ${pokeToQuery.name}`)
            }
            return res.json()
          })
          .catch(error => {
            console.warn(
              `Failed to fetch species for ${pokeToQuery.name}:`,
              error
            )
            return null
          })
      )

      const pokemonSpeciesResults = await Promise.all(
        pokemonSpeciesPromiseArray
      )

      // Filter out null results (Pokemon without species entries)
      // Since we're using pokedex endpoint, all should be valid, but keep as safety
      const pokemonSpecies = pokemonSpeciesResults.filter(
        (species): species is NonNullable<typeof species> => species !== null
      )

      // Fetch detailed Pokemon data using species ID
      const pokemonPromiseArray = pokemonSpecies.map(species =>
        fetch(`https://pokeapi.co/api/v2/pokemon/${species.id}`)
          .then(res => {
            if (!res.ok) {
              throw new Error(`Pokemon not found: ${species.id}`)
            }
            return res.json()
          })
          .catch(error => {
            console.warn(
              `Failed to fetch Pokemon for species ${species.id}:`,
              error
            )
            return null
          })
      )

      const pokemonResults = await Promise.all(pokemonPromiseArray)

      // Filter out null results and combine with species data
      const results: PokemonDetail[] = []
      for (let i = 0; i < pokemonSpecies.length; i++) {
        const pokemonData = pokemonResults[i]
        const speciesData = pokemonSpecies[i]

        if (pokemonData && speciesData) {
          results.push({
            ...pokemonData,
            ...speciesData,
            name: getPokemonName(speciesData.names),
            pokedexNumber: getPokedexNumber(speciesData.pokedex_numbers),
          })
        }
      }

      return results
    },
    enabled: !!allPokemonList, // Only run when we have the full list
    initialPageParam: 0,
    getNextPageParam: (_lastPage, allPages) => {
      if (!Array.isArray(allPages) || !pokemonToQuery.length) {
        return undefined
      }

      const maxPage = Math.ceil(pokemonToQuery.length / POKEMON_PER_PAGE)
      return allPages.length >= maxPage ? undefined : allPages.length
    },
    staleTime: 1000 * 60 * 60, // 1 hour - Pokémon data doesn't change often
  })

  // Flatten all pages into a single array
  const pokemonList = useMemo(() => {
    const list: PokemonDetail[] = []
    query.data?.pages.forEach(page => {
      if (Array.isArray(page)) {
        list.push(...page)
      }
    })
    return list
  }, [query.data])

  return {
    ...query,
    data: query.data
      ? {
          ...query.data,
          pages: query.data.pages.map(page => ({
            count: pokemonToQuery.length,
            next: null,
            previous: null,
            results: page,
          })),
        }
      : undefined,
    pokemonList,
  }
}
