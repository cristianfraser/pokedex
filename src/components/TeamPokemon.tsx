import { PokemonDetail } from '../queries/pokemon'
import TypePill from './TypePill'

interface TeamPokemonProps {
  pokemon: PokemonDetail | null
  position: number
  isSelected: boolean
  onSelect: () => void
  onRemove: () => void
}

const TeamPokemon = ({
  pokemon,
  position: _position,
  isSelected,
  onSelect,
  onRemove,
}: TeamPokemonProps) => {
  if (!pokemon) {
    return (
      <div
        onClick={onSelect}
        className={`bg-gray-100 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-colors ${
          isSelected
            ? 'border-primary-600 bg-primary-50'
            : 'border-gray-200 hover:border-gray-300'
        }`}
        style={{ aspectRatio: '0.85' }}
      >
        <div className="text-gray-400 text-xs">Empty</div>
      </div>
    )
  }

  return (
    <div
      onClick={onSelect}
      className={`group bg-gray-100 rounded-lg border-2 flex flex-col relative cursor-pointer transition-colors overflow-hidden ${
        isSelected
          ? 'border-primary-600 bg-primary-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
      style={{ aspectRatio: '0.85' }}
    >
      {/* Delete button - top right */}
      <button
        onClick={e => {
          e.stopPropagation()
          onRemove()
        }}
        className="absolute top-0 right-0 w-6 h-6 flex items-center justify-center hover:bg-red-100 rounded-bl-lg transition-opacity opacity-0 group-hover:opacity-100 z-10"
        aria-label="Remove Pokemon"
      >
        <svg
          className="w-4 h-4 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Image and Name container - top left */}
      <div style={{ transform: 'translateY(-20%)' }}>
        <div className="flex items-center gap-2">
          {pokemon.sprites.front_default ? (
            <img
              src={pokemon.sprites.front_default}
              alt={pokemon.name}
              className="w-12 h-12 object-contain"
            />
          ) : (
            <div className="w-12 h-12 flex items-center justify-center bg-gray-200 rounded text-gray-400 text-lg">
              {pokemon.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div
            className="text-xs font-medium text-gray-900 capitalize"
            style={{ transform: 'translateX(-15px)' }}
          >
            {pokemon.name}
          </div>
        </div>

        <div className="flex flex-wrap gap-[5px] justify-center">
          {pokemon.types.map(type => (
            <TypePill key={type.slot} type={type.type} size="small" />
          ))}
        </div>
      </div>

      {/* 4 segments below name */}
      <div className="flex flex-col gap-1 mt-0 w-full">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
      </div>
    </div>
  )
}

export default TeamPokemon
