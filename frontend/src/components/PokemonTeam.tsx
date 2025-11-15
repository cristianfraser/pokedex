import FloatingPanel from './FloatingPanel'
import TeamPokemon from './TeamPokemon'
import { usePokemonContext } from '../contexts/PokemonContext'

interface PokemonTeamProps {
  top: number
}

const PokemonTeam = ({ top }: PokemonTeamProps) => {
  const {
    pokemonTeam,
    selectPokemon,
    selectedPosition,
    removeInPosition,
    isPanelExpanded,
    setIsPanelExpanded,
  } = usePokemonContext()
  const isExpanded = isPanelExpanded

  return (
    <FloatingPanel
      top={top}
      isExpanded={isExpanded}
      onToggle={() => setIsPanelExpanded(!isExpanded)}
    >
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
    </FloatingPanel>
  )
}

export default PokemonTeam

