import { useState, useEffect, useRef, useCallback } from 'react'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import Button from '../components/Button'
import TypePill from '../components/TypePill'
import { usePokemonList, PokemonDetail } from '../queries/pokemon'
import { useDebounce } from '../hooks/useDebounce'
import { usePokemonContext } from '../contexts/PokemonContext'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const Pokemon = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const {
    addNext,
    addInPosition,
    selectedPosition,
    clearSelection,
    pokemonTeam,
    setBattleInfoPokemon,
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

  // Window virtualizer for table rows
  const parentRef = useRef<HTMLTableSectionElement>(null)

  const rowVirtualizer = useWindowVirtualizer({
    count: filteredPokemon.length,
    estimateSize: () => 53, // Estimated height of each table row
    overscan: 10, // Render 10 extra items outside viewport
  })

  const loadingIndicatorRef = useRef<HTMLDivElement>(null)

  // Use IntersectionObserver to detect when loading indicator is near viewport
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
    [hasNextPage, isFetchingNextPage, isLoading, fetchNextPage]
  )

  useEffect(() => {
    const element = loadingIndicatorRef.current
    if (!element) return

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
      rootMargin: '800px', // Start loading when indicator is 800px away from viewport
    })

    observer.observe(element)

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [handleObserver, filteredPokemon.length])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Pokémon Database
            </h1>
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

          {/* Table with opacity when fetching (search change), but not when loading next page */}
          <div
            className={`transition-opacity duration-200 ${
              isFetching && !isFetchingNextPage && filteredPokemon.length > 0
                ? 'opacity-80'
                : 'opacity-100'
            }`}
          >
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize() + 29}px`, // Add header height
                  width: '100%',
                  position: 'relative',
                }}
              >
                <table
                  className="min-w-full divide-y divide-gray-200"
                  style={{ tableLayout: 'fixed', width: '100%' }}
                >
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th
                        className="px-4 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        style={{ width: '60px' }}
                      >
                        #
                      </th>
                      <th
                        className="px-4 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        style={{ width: '80px' }}
                      >
                        Sprite
                      </th>
                      <th className="px-4 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Info
                      </th>
                      <th
                        className="px-4 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        // style={{ width: '200px' }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    ref={parentRef}
                    className="bg-white divide-y divide-gray-200"
                  >
                    {rowVirtualizer.getVirtualItems().map(virtualRow => {
                      const pokemon = filteredPokemon[virtualRow.index]
                      if (!pokemon) return null

                      return (
                        <tr
                          key={pokemon.id}
                          ref={rowVirtualizer.measureElement}
                          data-index={virtualRow.index}
                          className="hover:bg-gray-50 transition-colors flex items-center"
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: `${virtualRow.size}px`,
                            transform: `translateY(${virtualRow.start + 29}px)`, // Add header height offset
                          }}
                        >
                          <td
                            className="px-4 py-1.5 whitespace-nowrap text-2xs text-gray-500"
                            style={{ width: '60px' }}
                          >
                            #{pokemon.pokedexNumber}
                          </td>
                          <td
                            className="px-4 py-1.5 whitespace-nowrap flex-shrink-0"
                            style={{ width: '80px' }}
                          >
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
                          <td className="px-4 py-1.5 flex-grow">
                            <div className="flex flex-col">
                              <div className="flex flex-wrap gap-[5px]">
                                {pokemon.types.map(type => (
                                  <TypePill key={type.slot} type={type.type} />
                                ))}
                              </div>
                              {/* <div className="flex gap-1">
                                {pokemon.is_legendary && <LegendaryTag />}
                                {pokemon.is_mythical && <MythicalTag />}
                              </div> */}
                              <div className="text-sm font-medium text-gray-900 capitalize">
                                {pokemon.name}
                              </div>
                            </div>
                          </td>
                          <td
                            className="px-4 py-1.5 whitespace-nowrap text-sm"
                            // style={{ width: '200px' }}
                          >
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
                                  setBattleInfoPokemon(pokemon)
                                }}
                              >
                                Battle Info
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Loading indicator for next page */}
        {hasNextPage && !isFetchingNextPage && (
          <div ref={loadingIndicatorRef} className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-600 text-sm">
              Loading more Pokémon...
            </p>
          </div>
        )}
        {isFetchingNextPage && (
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
