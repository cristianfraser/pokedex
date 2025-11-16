import { createContext, useContext, useState, ReactNode } from 'react'
import { PokemonDetail } from '../queries/pokemon'
import { useLocalStorage } from '../hooks/useLocalStorage'

const STORAGE_KEY = 'pokedex_team_pokemon'
const STORAGE_KEY_MOVES = 'pokedex_team_moves'

type PokemonMoves = Array<{ name: string; type: string } | null>

interface PokemonContextType {
  pokemonTeam: (PokemonDetail | null)[]
  addNext: (pokemon: PokemonDetail) => void
  addInPosition: (pokemon: PokemonDetail, position: number) => void
  removeInPosition: (position: number) => void
  selectedPokemon: PokemonDetail | null
  selectedPosition: number | null
  selectPokemon: (position: number) => void
  clearSelection: () => void
  contextMoves: { [pokemonId: number]: PokemonMoves }
  setPokemonMoves: (pokemonId: number, moves: PokemonMoves) => void
  isPanelExpanded: boolean
  setIsPanelExpanded: (expanded: boolean) => void
  battleInfoPokemon: PokemonDetail | null
  setBattleInfoPokemon: (pokemon: PokemonDetail | null) => void
}

const PokemonContext = createContext<PokemonContextType | undefined>(undefined)

export const PokemonProvider = ({ children }: { children: ReactNode }) => {
  const [pokemonTeam, setPokemonTeam] = useLocalStorage<(PokemonDetail | null)[]>(
    STORAGE_KEY,
    Array(6).fill(null)
  )
  const [contextMoves, setContextMoves] = useLocalStorage<{ [pokemonId: number]: PokemonMoves }>(
    STORAGE_KEY_MOVES,
    {}
  )
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null)
  const [isPanelExpanded, setIsPanelExpanded] = useState(true)
  const [battleInfoPokemon, setBattleInfoPokemon] = useState<PokemonDetail | null>(null)

  const addNext = (pokemon: PokemonDetail) => {
    setPokemonTeam(prev => {
      // Check if pokemon is already in the list
      const exists = prev.some(p => p !== null && p.id === pokemon.id)
      if (exists) {
        // Do nothing if pokemon is already in the list
        return prev
      }
      // Find first empty slot and add pokemon
      const newList = [...prev]
      const emptyIndex = newList.findIndex(p => p === null)
      if (emptyIndex !== -1) {
        newList[emptyIndex] = pokemon
      }
      return newList
    })
  }

  const addInPosition = (pokemon: PokemonDetail, position: number) => {
    if (position < 0 || position > 5) {
      console.warn(`Position ${position} is out of range. Must be between 0 and 5.`)
      return
    }
    setPokemonTeam(prev => {
      const newList = [...prev]
      // Remove pokemon from previous position if it exists
      const previousIndex = newList.findIndex(
        p => p !== null && p.id === pokemon.id
      )
      if (previousIndex !== -1) {
        newList[previousIndex] = null
      }
      // Add pokemon to new position
      newList[position] = pokemon
      return newList
    })
  }

  const removeInPosition = (position: number) => {
    if (position < 0 || position > 5) {
      console.warn(`Position ${position} is out of range. Must be between 0 and 5.`)
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
      console.warn(`Position ${position} is out of range. Must be between 0 and 5.`)
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

  const selectedPokemon =
    selectedPosition !== null ? pokemonTeam[selectedPosition] : null

  return (
    <PokemonContext.Provider
      value={{
        pokemonTeam,
        addNext,
        addInPosition,
        removeInPosition,
        selectedPokemon,
        selectedPosition,
        selectPokemon,
        clearSelection,
        contextMoves,
        setPokemonMoves,
        isPanelExpanded,
        setIsPanelExpanded,
        battleInfoPokemon,
        setBattleInfoPokemon,
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

