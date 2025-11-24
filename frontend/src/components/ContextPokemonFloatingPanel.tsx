import { usePokemonContext } from '../contexts/PokemonContext'
import PokemonFloatingPanel, { PokemonFloatingPanelProps } from './PokemonFloatingPanel'

const ContextPokemonFloatingPanel = () => {
  const {
    pokemonTeam,
    selectPokemon,
    selectedPosition,
    removeInPosition,
    isTeamExpanded,
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

  const props: PokemonFloatingPanelProps = {
    pokemonTeam,
    selectPokemon,
    selectedPosition,
    removeInPosition,
    isTeamExpanded,
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
  }

  return <PokemonFloatingPanel {...props} />
}

export default ContextPokemonFloatingPanel

