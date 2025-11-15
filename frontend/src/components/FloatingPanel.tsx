import { useState } from 'react'
import { usePokemonContext } from '../contexts/PokemonContext'
import TeamPokemon from './TeamPokemon'

interface FloatingPanelProps {
  top: number
}

const FloatingPanel = ({ top }: FloatingPanelProps) => {
  const { pokemonTeam, selectPokemon, selectedPosition, removeInPosition } =
    usePokemonContext()
  const [isExpanded, setIsExpanded] = useState(true)

  const panelWidth = isExpanded ? '300px' : '136px'

  return (
    <div
      className="fixed right-4 sm:right-6 lg:right-8 z-40"
      style={{
        top: `${top}px`,
        transition: 'top 0.1s, width 0.2s ease-in-out',
        width: panelWidth,
      }}
    >
      <div className="bg-white/80 backdrop-blur-xl shadow-lg border border-gray-200/50 rounded-xl p-2 relative">
        <button
          onClick={() => setIsExpanded(prevIsExpanded => !prevIsExpanded)}
          className="absolute top-2 left-0 w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors z-10"
          style={{ transform: 'translateX(-100%)' }}
          aria-label={isExpanded ? 'Collapse panel' : 'Expand panel'}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease-in-out',
            }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
        <div className="flex justify-center">
          <div className="grid gap-2 team-pokemon-grid-vertical w-full">
            {/* 6 slots: 1 column vertical stack */}
            {pokemonTeam.map((pokemon, index) => (
              <TeamPokemon
                key={index}
                pokemon={pokemon}
                position={index}
                isSelected={selectedPosition === index}
                onSelect={() => selectPokemon(index)}
                onRemove={() => removeInPosition(index)}
                isExpanded={isExpanded}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FloatingPanel
