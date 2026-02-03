import PokemonTeam from './PokemonTeam'
import BattleInfoPokemon from './BattleInfoPokemon'
import { PokemonDetail } from '../queries/pokemon'

type PokemonMoves = Array<{
  name: string
  type: string
  damage_class?: 'status' | 'physical' | 'special'
} | null>

export interface PokemonFloatingPanelProps {
  pokemonTeam: (number | null)[]
  selectPokemon: (position: number) => void
  selectedPosition: number | null
  removeInPosition: (position: number) => void
  isTeamExpanded: boolean
  battleInfoPokemonId: number | null
  setBattleInfoPokemonId: (pokemonId: number | null) => void
  battleInfoPokemon: PokemonDetail | null
  isLoadingBattleInfoPokemon: boolean
  setHoveredDefensiveTypes: (types: string[]) => void
  setHoveredOffensiveTypes: (types: string[]) => void
  battleInfoPokemonHistory: (number | null)[]
  contextMoves: { [pokemonId: number]: PokemonMoves }
  setPokemonMoves: (pokemonId: number, moves: PokemonMoves) => void
  hoveredDefensiveTypes: string[]
  hoveredOffensiveTypes: string[]
  addInPosition: (pokemonId: number, position: number) => void
  skipInitialAnimation?: boolean
  hideRemoveButton?: boolean
  alwaysShow?: boolean
}

const PokemonFloatingPanel = ({
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
  skipInitialAnimation = false,
  hideRemoveButton = false,
  alwaysShow = false,
}: PokemonFloatingPanelProps) => {
  return (
    <div className="overflow-x-hidden flex gap-2 bg-white/80 backdrop-blur-xl shadow-lg border border-gray-200/50 rounded-xl p-2 relative">
      <PokemonTeam
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
        hideRemoveButton={hideRemoveButton}
      />
      <BattleInfoPokemon
        battleInfoPokemonId={battleInfoPokemonId}
        setBattleInfoPokemonId={setBattleInfoPokemonId}
        battleInfoPokemon={battleInfoPokemon}
        isLoadingBattleInfoPokemon={isLoadingBattleInfoPokemon}
        setHoveredDefensiveTypes={setHoveredDefensiveTypes}
        setHoveredOffensiveTypes={setHoveredOffensiveTypes}
        battleInfoPokemonHistory={battleInfoPokemonHistory}
        skipInitialAnimation={skipInitialAnimation}
        hideRemoveButton={hideRemoveButton}
        alwaysShow={alwaysShow}
      />
    </div>
  )
}

export default PokemonFloatingPanel
