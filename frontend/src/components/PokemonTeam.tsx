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
    <div className="flex gap-2 flex-col min-w-0">
      {/* <div className="grid gap-2 team-pokemon-grid-vertical w-full"> */}
      {/* 6 slots: 1 column vertical stack */}
      {pokemonTeam.map((pokemonId, index) => (
        <TeamPokemon
          key={index}
          pokemonId={pokemonId}
          position={index}
          isSelected={selectedPosition === index}
          onSelect={() => selectPokemon(index)}
          onRemove={() => removeInPosition(index)}
          isExpanded={isTeamExpanded}
        />
      ))}
      {/* </div> */}
    </div>
  )
}

export default PokemonTeam
