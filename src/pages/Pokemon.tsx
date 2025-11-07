import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import Card from '../components/Card'
import Button from '../components/Button'
import { usePokemonList } from '../queries/pokemon'
import type { PokemonListItem } from '../queries/pokemon'

const Pokemon = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePokemonList()

  // Flatten all pages into a single array
  const allPokemon = useMemo(() => {
    if (!data?.pages) return []
    return data.pages.flatMap(page => page.results)
  }, [data])

  // Filter Pokémon based on search term
  const filteredPokemon = useMemo(() => {
    if (!allPokemon.length) return []
    return allPokemon.filter((pokemon: PokemonListItem) =>
      pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [allPokemon, searchTerm])

  // Get total count from first page
  const totalCount = data?.pages[0]?.count ?? 0

  // Infinite scroll observer
  const observerTarget = useRef<HTMLDivElement>(null)

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
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
  }, [handleObserver])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading Pokémon...</p>
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-red-600 text-lg mb-4">
              Error loading Pokémon: {error?.message || 'Unknown error'}
            </p>
            <Button
              variant="secondary"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Pokémon Database
          </h1>
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
              {searchTerm && ` (${allPokemon.length} loaded)`}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPokemon.map(pokemon => (
            <Card key={pokemon.name} hover className="text-center">
              <div className="text-6xl mb-4">
                {pokemon.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 capitalize">
                {pokemon.name}
              </h3>
              <Button size="sm" className="w-full">
                View Details
              </Button>
            </Card>
          ))}
        </div>

        {/* Infinite scroll trigger */}
        {!searchTerm && <div ref={observerTarget} className="h-10 w-full" />}

        {/* Loading indicator for next page */}
        {isFetchingNextPage && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-600 text-sm">
              Loading more Pokémon...
            </p>
          </div>
        )}

        {/* End of list indicator */}
        {!hasNextPage && allPokemon.length > 0 && !searchTerm && (
          <div className="text-center py-8">
            <p className="text-gray-500">All Pokémon loaded!</p>
          </div>
        )}

        {filteredPokemon.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No Pokémon found matching "{searchTerm}"
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
