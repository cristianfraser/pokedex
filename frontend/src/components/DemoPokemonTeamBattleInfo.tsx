import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import PokemonFloatingPanel from './PokemonFloatingPanel'
import { fetchPokemonById, usePokemonById } from '../queries/pokemon'
import { PokemonDetail } from '../queries/pokemon'
import { useQueryClient } from '@tanstack/react-query'

type PokemonMoves = Array<{
  name: string
  type: string
  damage_class?: 'status' | 'physical' | 'special'
} | null>

// Preset Pokemon IDs: Charmeleon (5), Mewtwo (150), Pikachu (25)
const PRESET_POKEMON_IDS = [5, 150, 25, null, null, null] as (number | null)[]

// Preset moves for each Pokemon (4 moves each)
const PRESET_MOVES: { [pokemonId: number]: PokemonMoves } = {
  5: [
    // Charmeleon
    { name: 'Flamethrower', type: 'fire', damage_class: 'special' },
    { name: 'Dragon Claw', type: 'dragon', damage_class: 'physical' },
    { name: 'Slash', type: 'normal', damage_class: 'physical' },
    { name: 'Fire Blast', type: 'fire', damage_class: 'special' },
  ],
  150: [
    // Mewtwo
    { name: 'Psychic', type: 'psychic', damage_class: 'special' },
    { name: 'Shadow Ball', type: 'ghost', damage_class: 'special' },
    { name: 'Aura Sphere', type: 'fighting', damage_class: 'special' },
    { name: 'Ice Beam', type: 'ice', damage_class: 'special' },
  ],
  25: [
    // Pikachu
    { name: 'Thunderbolt', type: 'electric', damage_class: 'special' },
    { name: 'Quick Attack', type: 'normal', damage_class: 'physical' },
    { name: 'Iron Tail', type: 'steel', damage_class: 'physical' },
    { name: 'Volt Tackle', type: 'electric', damage_class: 'physical' },
  ],
}

const generateRandomIds = (): number[] => {
  const ids = new Set<number>()
  while (ids.size < 20) {
    const randomId = Math.floor(Math.random() * 1000) + 1
    ids.add(randomId)
  }
  return Array.from(ids)
}

const randomIds = generateRandomIds()

const DemoPokemonTeamBattleInfo = () => {
  // State for Pokemon team (preset)
  const [pokemonTeam] = useState<(number | null)[]>(PRESET_POKEMON_IDS)

  // State for selected position
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null)

  // State for battle info Pokemon - start with a random ID
  const [battleInfoPokemonId, setBattleInfoPokemonId] = useState<number | null>(
    () => randomIds[3]
  )

  const queryClient = useQueryClient()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    Promise.all([
      queryClient.prefetchQuery({
        queryKey: ['pokemon', 'byId', PRESET_POKEMON_IDS[0]!],
        queryFn: () => fetchPokemonById(PRESET_POKEMON_IDS[0]!.toString()),
      }),
      queryClient.prefetchQuery({
        queryKey: ['pokemon', 'byId', PRESET_POKEMON_IDS[1]!],
        queryFn: () => fetchPokemonById(PRESET_POKEMON_IDS[1]!.toString()),
      }),
      queryClient.prefetchQuery({
        queryKey: ['pokemon', 'byId', PRESET_POKEMON_IDS[2]!],
        queryFn: () => fetchPokemonById(PRESET_POKEMON_IDS[2]!.toString()),
      }),
      queryClient.prefetchQuery({
        queryKey: ['pokemon', 'byId', randomIds[3]],
        queryFn: () => fetchPokemonById(randomIds[3].toString()),
      }),
    ]).then(() => setIsReady(true))
  }, [])

  // State for battle info history (6-length array)
  const [battleInfoPokemonHistory, setBattleInfoPokemonHistory] = useState<
    (number | null)[]
  >(Array(6).fill(null))

  // State for hovered types
  const [hoveredDefensiveTypes, setHoveredDefensiveTypes] = useState<string[]>(
    []
  )
  const [hoveredOffensiveTypes, setHoveredOffensiveTypes] = useState<string[]>(
    []
  )

  // State for moves (preset)
  const [contextMoves] = useState<{ [pokemonId: number]: PokemonMoves }>(
    PRESET_MOVES
  )

  // State for team expansion
  const [isTeamExpanded] = useState<boolean>(true)

  // Fetch battle info Pokemon data
  const { data: battleInfoPokemonData, isLoading: isLoadingBattleInfoPokemon } =
    usePokemonById(battleInfoPokemonId)

  // Handler functions
  const selectPokemon = (position: number) => {
    setSelectedPosition(position)
  }

  const removeInPosition = (_position: number) => {
    // In demo mode, we don't allow removing Pokemon
    // But we can implement it if needed
  }

  const addInPosition = (_pokemonId: number, _position: number) => {
    // In demo mode, we don't allow adding Pokemon
    // But we can implement it if needed
  }

  const setPokemonMoves = (_pokemonId: number, _moves: PokemonMoves) => {
    // In demo mode, moves are preset and not changeable
    // But we can implement it if needed
  }

  const handleSetBattleInfoPokemonId = useCallback(
    (pokemonId: number | null) => {
      const prevId = battleInfoPokemonId

      // Update history: remove the pokemonId if it's already in history
      setBattleInfoPokemonHistory(prevHistory => {
        const filteredHistory = prevHistory.filter(id => id !== pokemonId)

        // If there was a previous ID (and it's different), add it to the front
        if (prevId !== null && prevId !== pokemonId) {
          const newHistory = [prevId, ...filteredHistory].slice(0, 6)
          // Pad with nulls to maintain 6-length array
          while (newHistory.length < 6) {
            newHistory.push(null)
          }
          return newHistory
        }

        // If no previous ID, just return filtered history (padded to 6)
        const paddedHistory = [...filteredHistory]
        while (paddedHistory.length < 6) {
          paddedHistory.push(null)
        }
        return paddedHistory
      })

      setBattleInfoPokemonId(pokemonId)
    },
    [battleInfoPokemonId]
  )

  // Memoize battleInfoPokemon to prevent unnecessary re-renders
  const battleInfoPokemon = useMemo<PokemonDetail | null>(() => {
    return battleInfoPokemonData || null
  }, [battleInfoPokemonData])

  // Ref to store current battleInfoPokemonId to avoid dependency issues
  const battleInfoPokemonIdRef = useRef<number | null>(battleInfoPokemonId)
  const previousBattleInfoPokemonIdRef = useRef<number | null>(null)

  // Update refs when battleInfoPokemonId changes
  useEffect(() => {
    previousBattleInfoPokemonIdRef.current = battleInfoPokemonIdRef.current
    battleInfoPokemonIdRef.current = battleInfoPokemonId
  }, [battleInfoPokemonId])

  // Set up interval to randomly select Pokemon
  useEffect(() => {
    const interval = setInterval(() => {
      const currentId = battleInfoPokemonIdRef.current
      const previousId = previousBattleInfoPokemonIdRef.current
      const availableIds = randomIds.filter(
        id => id !== currentId && id !== previousId
      )

      if (availableIds.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableIds.length)
        const randomId = availableIds[randomIndex]
        handleSetBattleInfoPokemonId(randomId)
      }
    }, 3000) // Change every 3 seconds

    return () => clearInterval(interval)
  }, [handleSetBattleInfoPokemonId]) // Include handler in dependencies

  if (!isReady) return null

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, ease: 'easeOut' }}
    >
      <PokemonFloatingPanel
        pokemonTeam={pokemonTeam}
        selectPokemon={selectPokemon}
        selectedPosition={selectedPosition}
        removeInPosition={removeInPosition}
        isTeamExpanded={isTeamExpanded}
        battleInfoPokemonId={battleInfoPokemonId}
        setBattleInfoPokemonId={handleSetBattleInfoPokemonId}
        battleInfoPokemon={battleInfoPokemon}
        isLoadingBattleInfoPokemon={isLoadingBattleInfoPokemon}
        setHoveredDefensiveTypes={setHoveredDefensiveTypes}
        setHoveredOffensiveTypes={setHoveredOffensiveTypes}
        battleInfoPokemonHistory={battleInfoPokemonHistory}
        contextMoves={contextMoves}
        setPokemonMoves={setPokemonMoves}
        hoveredDefensiveTypes={hoveredDefensiveTypes}
        hoveredOffensiveTypes={hoveredOffensiveTypes}
        addInPosition={addInPosition}
        skipInitialAnimation={true}
        hideRemoveButton={true}
      />
    </motion.div>
  )
}

export default DemoPokemonTeamBattleInfo
