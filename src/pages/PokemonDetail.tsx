import { useParams, useNavigate } from 'react-router-dom'
import { usePokemonList } from '../queries/pokemon'
import type { PokemonDetail } from '../queries/pokemon'
import Modal from '../components/Modal'
import Button from '../components/Button'
import TypePill from '../components/TypePill'

const PokemonDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data } = usePokemonList()

  // Find the Pokemon from the loaded pages
  const pokemon: PokemonDetail | undefined = data?.pages
    .flatMap(page => page.results)
    .find(p => p.id.toString() === id || p.name === id)

  const handleClose = () => {
    navigate('/pokemon')
  }

  if (!pokemon) {
    return (
      <Modal isOpen={true} onClose={handleClose} title="Pokémon Not Found">
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            Pokémon with ID "{id}" not found in loaded data.
          </p>
          <Button onClick={handleClose}>Close</Button>
        </div>
      </Modal>
    )
  }

  // Get English flavor text
  const flavorText =
    pokemon.flavor_text_entries?.find(entry => entry.language.name === 'en')
      ?.flavor_text || 'No description available.'

  // Format height and weight (Pokemon API uses decimeters and hectograms)
  const heightInMeters = pokemon.height / 10
  const weightInKg = pokemon.weight / 10

  return (
    <Modal isOpen={true} onClose={handleClose} title={pokemon.name}>
      <div className="max-w-2xl mx-auto">
        {/* Pokemon Image */}
        <div className="text-center mb-6">
          {pokemon.sprites.other?.['official-artwork']?.front_default ? (
            <img
              src={pokemon.sprites.other['official-artwork'].front_default}
              alt={pokemon.name}
              className="w-64 h-64 mx-auto object-contain"
            />
          ) : pokemon.sprites.front_default ? (
            <img
              src={pokemon.sprites.front_default}
              alt={pokemon.name}
              className="w-64 h-64 mx-auto object-contain"
            />
          ) : null}
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Pokedex Number</p>
            <p className="text-2xl font-bold text-gray-900">
              #{pokemon.pokedexNumber}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">ID</p>
            <p className="text-2xl font-bold text-gray-900">#{pokemon.id}</p>
          </div>
        </div>

        {/* Types */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">Types</p>
          <div className="flex flex-wrap gap-[5px]">
            {pokemon.types.map(type => (
              <TypePill key={type.slot} type={type.type} />
            ))}
          </div>
        </div>

        {/* Physical Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Height</p>
            <p className="text-xl font-semibold text-gray-900">
              {heightInMeters}m
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Weight</p>
            <p className="text-xl font-semibold text-gray-900">
              {weightInKg}kg
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Base Exp</p>
            <p className="text-xl font-semibold text-gray-900">
              {pokemon.base_experience}
            </p>
          </div>
        </div>

        {/* Base Stats */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-3">Base Stats</p>
          <div className="space-y-3">
            {pokemon.stats.map(stat => (
              <div key={stat.stat.name}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {stat.stat.name.replace('-', ' ')}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {stat.base_stat}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min((stat.base_stat / 255) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">Description</p>
          <p className="text-gray-700 leading-relaxed">{flavorText}</p>
        </div>

        {/* Species Info */}
        {(pokemon.color || pokemon.habitat) && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            {pokemon.color && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Color</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">
                  {pokemon.color.name}
                </p>
              </div>
            )}
            {pokemon.habitat && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Habitat</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">
                  {pokemon.habitat.name}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-end">
          <Button onClick={handleClose}>Close</Button>
        </div>
      </div>
    </Modal>
  )
}

export default PokemonDetail
