import { usePokemonContext } from '../contexts/PokemonContext'
import PokemonFloatingPanel from '../components/PokemonFloatingPanel'

const Team = () => {
  const {
    pokemonTeam,
    selectPokemon,
    selectedPosition,
    removeInPosition,
    battleInfoPokemonId,
    setBattleInfoPokemonId,
    battleInfoPokemon,
    isLoadingBattleInfoPokemon,
    setHoveredDefensiveTypes,
    setHoveredOffensiveTypes,
    battleInfoPokemonHistory,
    contextMoves,
    setPokemonMoves,
    hoveredDefensiveTypes,
    hoveredOffensiveTypes,
    addInPosition,
  } = usePokemonContext()

  // Force team to always be expanded
  const isTeamExpanded = true

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="fixed z-40" style={{ top: '80px', left: '50%', transform: 'translateX(-50%)' }}>
        <PokemonFloatingPanel
          pokemonTeam={pokemonTeam}
          selectPokemon={selectPokemon}
          selectedPosition={selectedPosition}
          removeInPosition={removeInPosition}
          isTeamExpanded={isTeamExpanded}
          contextMoves={contextMoves}
          setPokemonMoves={setPokemonMoves}
          battleInfoPokemonId={battleInfoPokemonId}
          hoveredDefensiveTypes={hoveredDefensiveTypes}
          hoveredOffensiveTypes={hoveredOffensiveTypes}
          addInPosition={addInPosition}
          setBattleInfoPokemonId={setBattleInfoPokemonId}
          battleInfoPokemon={battleInfoPokemon}
          isLoadingBattleInfoPokemon={isLoadingBattleInfoPokemon}
          setHoveredDefensiveTypes={setHoveredDefensiveTypes}
          setHoveredOffensiveTypes={setHoveredOffensiveTypes}
          battleInfoPokemonHistory={battleInfoPokemonHistory}
          alwaysShow={true}
          hideRemoveButton={true}
          skipInitialAnimation={true}
        />
      </div>
    </div>
  )
}

export default Team

