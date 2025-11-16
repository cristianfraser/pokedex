import { useState, useEffect } from 'react'
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
    battleInfoPokemon,
  } = usePokemonContext()
  const isExpanded = isPanelExpanded
  const [rightOffset, setRightOffset] = useState<number | undefined>(undefined)

  // Calculate position based on BattleInfoPokemon visibility
  // Base right margins: mobile=16px, sm=24px, lg=32px
  const baseRight = { mobile: 16, sm: 24, lg: 32 }
  const gap = 8 // Gap between panels
  const battleInfoWidth = 300 // BattleInfoPokemon is always 300px

  useEffect(() => {
    const updatePosition = () => {
      const width = window.innerWidth
      let baseMargin = baseRight.mobile
      if (width >= 1024) {
        baseMargin = baseRight.lg
      } else if (width >= 640) {
        baseMargin = baseRight.sm
      }
      // When battle info is visible, position to the left of it
      // When battle info is hidden, position at the right edge
      if (battleInfoPokemon) {
        setRightOffset(baseMargin + battleInfoWidth + gap)
      } else {
        setRightOffset(baseMargin)
      }
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    return () => window.removeEventListener('resize', updatePosition)
  }, [battleInfoPokemon])

  return (
    <FloatingPanel
      top={top}
      isExpanded={isExpanded}
      onToggle={() => setIsPanelExpanded(!isExpanded)}
      offsetRight={rightOffset}
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
