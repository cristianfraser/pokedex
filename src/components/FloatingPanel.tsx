import { usePokemonContext } from '../contexts/PokemonContext'
import TeamPokemon from './TeamPokemon'

interface FloatingPanelProps {
  top: number
}

const FloatingPanel = ({ top }: FloatingPanelProps) => {
  const { pokemonList, selectPokemon, selectedPosition, removeInPosition } =
    usePokemonContext()

  return (
    <div
      className="absolute left-4 right-4 sm:left-6 sm:right-6 lg:left-8 lg:right-8"
      style={{
        top: `${top}px`,
        transition: 'top 0.1s',
      }}
    >
      <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-xl shadow-lg border border-gray-200/50 rounded-xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-6 gap-4">
          {/* 6 slots horizontally, 1 row */}
          {pokemonList.map((pokemon, index) => (
            <TeamPokemon
              key={index}
              pokemon={pokemon}
              position={index}
              isSelected={selectedPosition === index}
              onSelect={() => selectPokemon(index)}
              onRemove={() => removeInPosition(index)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default FloatingPanel
