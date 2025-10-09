import { useState } from 'react'
import Card from '../components/Card'
import Button from '../components/Button'

// Mock Pokémon data
const mockPokemon = [
  { id: 1, name: 'Pikachu', type: 'Electric', image: '⚡' },
  { id: 2, name: 'Charizard', type: 'Fire/Flying', image: '🔥' },
  { id: 3, name: 'Blastoise', type: 'Water', image: '💧' },
  { id: 4, name: 'Venusaur', type: 'Grass/Poison', image: '🌿' },
  { id: 5, name: 'Mewtwo', type: 'Psychic', image: '🧠' },
  { id: 6, name: 'Mew', type: 'Psychic', image: '✨' },
]

const Pokemon = () => {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredPokemon = mockPokemon.filter(pokemon =>
    pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPokemon.map(pokemon => (
            <Card key={pokemon.id} hover className="text-center">
              <div className="text-6xl mb-4">{pokemon.image}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {pokemon.name}
              </h3>
              <p className="text-gray-600 mb-4">Type: {pokemon.type}</p>
              <Button size="sm" className="w-full">
                View Details
              </Button>
            </Card>
          ))}
        </div>

        {filteredPokemon.length === 0 && (
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
