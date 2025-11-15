import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'
import TypePill from '../components/TypePill'
import LegendaryTag from '../components/LegendaryTag'
import MythicalTag from '../components/MythicalTag'
import { usePokemonList, PokemonDetail } from '../queries/pokemon'
import { useDebounce } from '../hooks/useDebounce'
import { usePokemonContext } from '../contexts/PokemonContext'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

type ViewMode = 'grid' | 'table'

const Pokemon = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const navigate = useNavigate()
  const {
    addNext,
    addInPosition,
    selectedPosition,
    clearSelection,
    pokemonTeam,
  } = usePokemonContext()

  // Check if a pokemon is already in the team
  const isPokemonInTeam = (pokemonId: number) => {
    return pokemonTeam.some(p => p !== null && p.id === pokemonId)
  }

  // Check if a pokemon is at the selected position
  const isPokemonAtSelectedPosition = (pokemonId: number) => {
    if (selectedPosition === null) return false
    const pokemonAtPosition = pokemonTeam[selectedPosition]
    return pokemonAtPosition !== null && pokemonAtPosition.id === pokemonId
  }

  // Check if the team is full (all 6 slots occupied)
  const isTeamFull = pokemonTeam.every(p => p !== null)

  // Check if button should be disabled
  const isButtonDisabled = (pokemonId: number) => {
    if (selectedPosition !== null) {
      // When a position is selected, only disable if pokemon is at that position
      return isPokemonAtSelectedPosition(pokemonId)
    } else {
      // When no position is selected, disable if pokemon is in team or team is full
      return isPokemonInTeam(pokemonId) || isTeamFull
    }
  }

  // Get button text
  const getButtonText = (pokemonId: number) => {
    if (selectedPosition !== null) {
      // When a position is selected, show "Added" only if pokemon is at that position
      return isPokemonAtSelectedPosition(pokemonId) ? 'Added' : 'Add to Team'
    } else {
      // When no position is selected, show "Added" if in team, "Team Full" if team is full
      if (isPokemonInTeam(pokemonId)) return 'Added'
      if (isTeamFull) return 'Team Full'
      return 'Add to Team'
    }
  }

  const handleAddToTeam = (pokemon: PokemonDetail) => {
    if (selectedPosition !== null) {
      // If a slot is selected, add to that position
      addInPosition(pokemon, selectedPosition)
      clearSelection()
    } else {
      // Otherwise, use addNext to find first empty slot
      addNext(pokemon)
    }
  }

  // Debounce search term to avoid excessive re-renders and API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    pokemonList,
  } = usePokemonList(debouncedSearchTerm)

  // Use the flattened pokemonList from the query
  const filteredPokemon = pokemonList || []

  // Get total count from first page
  const totalCount = data?.pages[0]?.count ?? 0

  // Infinite scroll observer
  const observerTarget = useRef<HTMLDivElement>(null)

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries
      if (
        target.isIntersecting &&
        hasNextPage &&
        !isFetchingNextPage &&
        !isLoading
      ) {
        fetchNextPage()
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage, isLoading]
  )

  useEffect(() => {
    const element = observerTarget.current
    if (!element) return

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
    })

    observer.observe(element)

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [handleObserver, filteredPokemon.length, debouncedSearchTerm])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Pokémon Database
            </h1>
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div className="max-w-md">
            <input
              type="text"
              placeholder="Search Pokémon..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          {totalCount > 0 && (
            <p className="mt-2 text-sm text-gray-600">
              Showing {filteredPokemon.length} of {totalCount} Pokémon
              {debouncedSearchTerm && ' (filtered)'}
            </p>
          )}
          {isError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm mb-2">
                Error loading Pokémon: {error?.message || 'Unknown error'}
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          )}
        </div>

        <div className="relative">
          {/* Loading overlay - show when initial loading or when fetching (search change) with existing data */}
          {(isLoading ||
            (isFetching &&
              !isFetchingNextPage &&
              filteredPokemon.length > 0)) && (
            <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10 rounded-lg">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <p className="mt-2 text-sm text-gray-600">Loading Pokémon...</p>
              </div>
            </div>
          )}

          {/* Grid/Table with opacity when fetching (search change), but not when loading next page */}
          <div
            className={`transition-opacity duration-200 ${
              isFetching && !isFetchingNextPage && filteredPokemon.length > 0
                ? 'opacity-80'
                : 'opacity-100'
            }`}
          >
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredPokemon.map(pokemon => (
                  <Card key={pokemon.id} hover className="text-center">
                    {pokemon.sprites.front_default ? (
                      <img
                        src={pokemon.sprites.front_default}
                        alt={pokemon.name}
                        className="w-32 h-32 mx-auto mb-4 object-contain"
                        style={{ color: 'transparent' }}
                      />
                    ) : (
                      <div className="text-6xl mb-4">
                        {pokemon.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="mb-2">
                      <span className="text-sm text-gray-500">
                        #{pokemon.pokedexNumber}
                      </span>
                    </div>
                    <div className="mb-2 flex justify-center gap-1">
                      {pokemon.is_legendary && <LegendaryTag />}
                      {pokemon.is_mythical && <MythicalTag />}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 capitalize">
                      {pokemon.name}
                    </h3>
                    <div className="flex flex-wrap gap-[5px] justify-center mb-4">
                      {pokemon.types.map(type => (
                        <TypePill key={type.slot} type={type.type} />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      {isButtonDisabled(pokemon.id) ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="flex-1">
                              <Button
                                size="sm"
                                className="w-full"
                                onClick={() => handleAddToTeam(pokemon)}
                                disabled={true}
                              >
                                {getButtonText(pokemon.id)}
                              </Button>
                            </span>
                          </TooltipTrigger>
                          {isPokemonAtSelectedPosition(pokemon.id) && (
                            <TooltipContent>
                              <p>Select a pokemon slot before adding</p>
                            </TooltipContent>
                          )}
                          {isPokemonInTeam(pokemon.id) &&
                            selectedPosition === null && (
                              <TooltipContent>
                                <p>Select a pokemon slot first before adding</p>
                              </TooltipContent>
                            )}
                          {isTeamFull &&
                            selectedPosition === null &&
                            !isPokemonInTeam(pokemon.id) && (
                              <TooltipContent>
                                <p>
                                  Select or remove a pokemon from the team
                                  before adding
                                </p>
                              </TooltipContent>
                            )}
                        </Tooltip>
                      ) : (
                        <Button
                          size="sm"
                          className="w-full flex-1"
                          onClick={() => handleAddToTeam(pokemon)}
                          disabled={false}
                        >
                          {getButtonText(pokemon.id)}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="secondary"
                        className="flex-1"
                        onClick={() => navigate(`/pokemon/${pokemon.id}`)}
                      >
                        Battle Info
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          #
                        </th>
                        <th className="px-4 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sprite
                        </th>
                        <th className="px-4 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-4 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Types
                        </th>
                        <th className="px-4 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPokemon.map(pokemon => (
                        <tr
                          key={pokemon.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-1.5 whitespace-nowrap text-2xs text-gray-500">
                            #{pokemon.pokedexNumber}
                          </td>
                          <td className="px-4 py-1.5 whitespace-nowrap">
                            {pokemon.sprites.front_default ? (
                              <img
                                src={pokemon.sprites.front_default}
                                alt={pokemon.name}
                                className="w-10 h-10 object-contain"
                                style={{ color: 'transparent' }}
                              />
                            ) : (
                              <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded text-gray-400 text-xs">
                                {pokemon.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-1.5 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              <div className="flex gap-1">
                                {pokemon.is_legendary && <LegendaryTag />}
                                {pokemon.is_mythical && <MythicalTag />}
                              </div>
                              <div className="text-sm font-medium text-gray-900 capitalize">
                                {pokemon.name}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-1.5 whitespace-nowrap">
                            <div className="flex flex-wrap gap-[5px]">
                              {pokemon.types.map(type => (
                                <TypePill key={type.slot} type={type.type} />
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-1.5 whitespace-nowrap text-sm">
                            <div className="flex gap-2">
                              {isButtonDisabled(pokemon.id) ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span>
                                      <Button
                                        size="sm"
                                        onClick={(
                                          e?: React.MouseEvent<HTMLButtonElement>
                                        ) => {
                                          e?.stopPropagation()
                                          handleAddToTeam(pokemon)
                                        }}
                                        disabled={true}
                                      >
                                        {getButtonText(pokemon.id)}
                                      </Button>
                                    </span>
                                  </TooltipTrigger>
                                  {isPokemonAtSelectedPosition(pokemon.id) && (
                                    <TooltipContent>
                                      <p>Select a pokemon slot before adding</p>
                                    </TooltipContent>
                                  )}
                                  {isPokemonInTeam(pokemon.id) &&
                                    selectedPosition === null && (
                                      <TooltipContent>
                                        <p>
                                          Select a pokemon slot first before
                                          adding
                                        </p>
                                      </TooltipContent>
                                    )}
                                  {isTeamFull &&
                                    selectedPosition === null &&
                                    !isPokemonInTeam(pokemon.id) && (
                                      <TooltipContent>
                                        <p>
                                          Select or remove a pokemon from the
                                          team before adding
                                        </p>
                                      </TooltipContent>
                                    )}
                                </Tooltip>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={(
                                    e?: React.MouseEvent<HTMLButtonElement>
                                  ) => {
                                    e?.stopPropagation()
                                    handleAddToTeam(pokemon)
                                  }}
                                  disabled={false}
                                >
                                  {getButtonText(pokemon.id)}
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={(
                                  e?: React.MouseEvent<HTMLButtonElement>
                                ) => {
                                  e?.stopPropagation()
                                  navigate(`/pokemon/${pokemon.id}`)
                                }}
                              >
                                Battle Info
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Infinite scroll trigger - inside the container */}
          <div ref={observerTarget} className="h-10 w-full" />
        </div>

        {/* Loading indicator for next page */}
        {(hasNextPage || isFetchingNextPage) && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-600 text-sm">
              Loading more Pokémon...
            </p>
          </div>
        )}

        {/* End of list indicator */}
        {!hasNextPage && filteredPokemon.length > 0 && !debouncedSearchTerm && (
          <div className="text-center py-8">
            <p className="text-gray-500">All Pokémon loaded!</p>
          </div>
        )}

        {filteredPokemon.length === 0 && debouncedSearchTerm && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No Pokémon found matching "{debouncedSearchTerm}"
            </p>
            <Button
              variant="secondary"
              onClick={() => setSearchTerm('')}
              className="mt-4"
            >
              Clear Search
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Pokemon
