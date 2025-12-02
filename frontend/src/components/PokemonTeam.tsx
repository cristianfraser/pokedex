import TeamPokemon from './TeamPokemon'

type PokemonMoves = Array<{
  name: string
  type: string
  damage_class?: 'status' | 'physical' | 'special'
} | null>

interface PokemonTeamProps {
  pokemonTeam: (number | null)[]
  selectPokemon: (position: number) => void
  selectedPosition: number | null
  removeInPosition: (position: number) => void
  isTeamExpanded: boolean
  contextMoves: { [pokemonId: number]: PokemonMoves }
  setPokemonMoves: (pokemonId: number, moves: PokemonMoves) => void
  battleInfoPokemonId: number | null
  hoveredDefensiveTypes: string[]
  hoveredOffensiveTypes: string[]
  addInPosition: (pokemonId: number, position: number) => void
  hideRemoveButton?: boolean
}

const PokemonTeam = ({
  pokemonTeam,
  selectPokemon,
  selectedPosition,
  removeInPosition,
  isTeamExpanded,
  contextMoves,
  setPokemonMoves,
  battleInfoPokemonId,
  hoveredDefensiveTypes,
  hoveredOffensiveTypes,
  addInPosition,
  hideRemoveButton = false,
}: PokemonTeamProps) => {
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
          contextMoves={contextMoves}
          setPokemonMoves={setPokemonMoves}
          battleInfoPokemonId={battleInfoPokemonId}
          hoveredDefensiveTypes={hoveredDefensiveTypes}
          hoveredOffensiveTypes={hoveredOffensiveTypes}
          addInPosition={addInPosition}
          hideRemoveButton={hideRemoveButton}
        />
      ))}
      {/* </div> */}
    </div>
  )
}

export default PokemonTeam
