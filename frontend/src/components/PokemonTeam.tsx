import TeamPokemon from './TeamPokemon'
import { usePokemonContext } from '../contexts/PokemonContext'

const PokemonTeam = () => {
  const {
    pokemonTeam,
    selectPokemon,
    selectedPosition,
    removeInPosition,
    isTeamExpanded,
  } = usePokemonContext()

  return (
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
            isExpanded={isTeamExpanded}
          />
        ))}
      </div>
    </div>
  )
}

export default PokemonTeam
