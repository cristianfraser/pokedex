import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  ReactNode,
  Dispatch,
  SetStateAction,
} from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { debounce, isMobile } from '../utils/helpers'
import { usePokemonById, PokemonDetail } from '../queries/pokemon'

const STORAGE_KEY = 'pokedex_team_pokemon'
const STORAGE_KEY_MOVES = 'pokedex_team_moves'

type PokemonMoves = Array<{
  name: string
  type: string
  damage_class?: 'status' | 'physical' | 'special'
} | null>

interface PokemonContextType {
  pokemonTeam: (number | null)[]
  addNext: (pokemonId: number) => void
  addInPosition: (pokemonId: number, position: number) => void
  removeInPosition: (position: number) => void
  selectedPosition: number | null
  selectPokemon: (position: number) => void
  clearSelection: () => void
  contextMoves: { [pokemonId: number]: PokemonMoves }
  setPokemonMoves: (pokemonId: number, moves: PokemonMoves) => void
  isPanelExpanded: boolean
  setIsPanelExpanded: (expanded: boolean) => void
  isTeamExpanded: boolean
  setIsTeamExpanded: Dispatch<SetStateAction<boolean>>
  battleInfoPokemonId: number | null
  setBattleInfoPokemonId: (pokemonId: number | null) => void
  battleInfoPokemon: PokemonDetail | null
  isLoadingBattleInfoPokemon: boolean
  battleInfoPokemonHistory: (number | null)[]
  hoveredDefensiveTypes: string[]
  setHoveredDefensiveTypes: (types: string[]) => void
  hoveredOffensiveTypes: string[]
  setHoveredOffensiveTypes: (types: string[]) => void
}

const PokemonContext = createContext<PokemonContextType | undefined>(undefined)

export const PokemonProvider = ({ children }: { children: ReactNode }) => {
  const [pokemonTeam, setPokemonTeam] = useLocalStorage<(number | null)[]>(
    STORAGE_KEY,
    Array(6).fill(null)
  )
  const [contextMoves, setContextMoves] = useLocalStorage<{
    [pokemonId: number]: PokemonMoves
  }>(STORAGE_KEY_MOVES, {})
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null)
  const [isPanelExpanded, setIsPanelExpanded] = useState(true)
  const [isTeamExpanded, setIsTeamExpanded] = useState(() => {
    // Start collapsed on mobile
    return !isMobile()
  })
  const [battleInfoPokemonId, setBattleInfoPokemonIdState] = useState<
    number | null
  >(null)
  const [battleInfoPokemonHistory, setBattleInfoPokemonHistory] = useState<
    (number | null)[]
  >(Array(6).fill(null))

  // Wrapper function to handle history when setting battleInfoPokemonId
  const setBattleInfoPokemonId = useCallback((pokemonId: number | null) => {
    setBattleInfoPokemonIdState(prevId => {
      // If opening from null (closed), expand the team
      if (prevId === null && pokemonId !== null) {
        setIsTeamExpanded(true)
      }

      const setBattleInfoPokemonHistoryFunction = () => {
        setBattleInfoPokemonHistory(prevHistory => {
          // Remove the new pokemonId from history if it exists there
          let filteredHistory = prevHistory.filter(id => id !== pokemonId)

          // If there's a previous ID and it's different from the new one, add to history
          if (prevId !== null && prevId !== pokemonId) {
            // Remove the previous ID from history if it exists (to avoid duplicates)
            filteredHistory = filteredHistory.filter(id => id !== prevId)
            // Add to front (most recent first) and keep max 6 items
            filteredHistory = [prevId, ...filteredHistory].slice(0, 6)
          }

          // Pad with nulls if needed to maintain 6-length array
          return [
            ...filteredHistory,
            ...Array(6 - filteredHistory.length).fill(null),
          ]
        })
      }
      if (pokemonId === null) {
        setTimeout(setBattleInfoPokemonHistoryFunction, 200)
      } else {
        setBattleInfoPokemonHistoryFunction()
      }
      return pokemonId
    })
  }, [])

  const { data: battleInfoPokemonData, isLoading: isLoadingBattleInfo } =
    usePokemonById(battleInfoPokemonId)
  const [battleInfoPokemon, setBattleInfoPokemon] =
    useState<PokemonDetail | null>(battleInfoPokemonData || null)

  // Update battleInfoPokemon when data changes
  useEffect(() => {
    if (battleInfoPokemonData && !isLoadingBattleInfo) {
      setBattleInfoPokemon(battleInfoPokemonData)
    } else if (!battleInfoPokemonId && !isLoadingBattleInfo) {
      // Clear displayed pokemon when battleInfoPokemonId is null and not loading
      setBattleInfoPokemon(null)
    }
  }, [battleInfoPokemonData, battleInfoPokemonId, isLoadingBattleInfo])
  const [hoveredDefensiveTypes, setHoveredDefensiveTypes] = useState<string[]>(
    []
  )
  const [hoveredOffensiveTypes, setHoveredOffensiveTypes] = useState<string[]>(
    []
  )

  // Create debounced version of setHoveredDefensiveTypes
  const debouncedSetHoveredDefensiveTypesRef = useRef(
    debounce((types: string[]) => {
      setHoveredDefensiveTypes(types)
    }, 150)
  )

  const debouncedSetHoveredDefensiveTypes = useCallback((types: string[]) => {
    debouncedSetHoveredDefensiveTypesRef.current(types)
  }, [])

  const addNext = (pokemonId: number) => {
    setPokemonTeam(prev => {
      // Check if pokemon is already in the list
      const exists = prev.some(p => p !== null && p === pokemonId)
      if (exists) {
        // Do nothing if pokemon is already in the list
        return prev
      }
      // Find first empty slot and add pokemon ID
      const newList = [...prev]
      const emptyIndex = newList.findIndex(p => p === null)
      if (emptyIndex !== -1) {
        newList[emptyIndex] = pokemonId
      }
      return newList
    })
  }

  const addInPosition = (pokemonId: number, position: number) => {
    if (position < 0 || position > 5) {
      console.warn(
        `Position ${position} is out of range. Must be between 0 and 5.`
      )
      return
    }
    setPokemonTeam(prev => {
      const newList = [...prev]
      // Remove pokemon from previous position if it exists
      const previousIndex = newList.findIndex(
        p => p !== null && p === pokemonId
      )
      if (previousIndex !== -1) {
        newList[previousIndex] = null
      }
      // Add pokemon ID to new position
      newList[position] = pokemonId
      return newList
    })
  }

  const removeInPosition = (position: number) => {
    if (position < 0 || position > 5) {
      console.warn(
        `Position ${position} is out of range. Must be between 0 and 5.`
      )
      return
    }
    setPokemonTeam(prev => {
      const newList = [...prev]
      newList[position] = null
      return newList
    })
    // Clear selection if the removed pokemon was selected
    if (selectedPosition === position) {
      setSelectedPosition(null)
    }
  }

  const selectPokemon = (position: number) => {
    if (position < 0 || position > 5) {
      console.warn(
        `Position ${position} is out of range. Must be between 0 and 5.`
      )
      return
    }
    // Allow selecting any position, even if empty
    setSelectedPosition(position)
  }

  const clearSelection = () => {
    setSelectedPosition(null)
  }

  const setPokemonMoves = (pokemonId: number, moves: PokemonMoves) => {
    setContextMoves(prev => ({
      ...prev,
      [pokemonId]: moves,
    }))
  }

  return (
    <PokemonContext.Provider
      value={{
        pokemonTeam,
        addNext,
        addInPosition,
        removeInPosition,
        selectedPosition,
        selectPokemon,
        clearSelection,
        contextMoves,
        setPokemonMoves,
        isPanelExpanded,
        setIsPanelExpanded,
        isTeamExpanded,
        setIsTeamExpanded,
        battleInfoPokemonId,
        setBattleInfoPokemonId,
        battleInfoPokemon,
        isLoadingBattleInfoPokemon: isLoadingBattleInfo,
        battleInfoPokemonHistory,
        hoveredDefensiveTypes,
        setHoveredDefensiveTypes: debouncedSetHoveredDefensiveTypes,
        hoveredOffensiveTypes,
        setHoveredOffensiveTypes,
      }}
    >
      {children}
    </PokemonContext.Provider>
  )
}

export const usePokemonContext = () => {
  const context = useContext(PokemonContext)
  if (context === undefined) {
    throw new Error('usePokemonContext must be used within a PokemonProvider')
  }
  return context
}
