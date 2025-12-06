import { useState, useMemo, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PokemonDetail } from '../queries/pokemon'
import AnimatedTypePills from './AnimatedTypePills'
import TypePill from './TypePill'
import BlurImage from './BlurImage'
import { MovesCombobox } from './MovesCombobox'
import { PokemonCombobox } from './PokemonCombobox'
import { cn } from '@/lib/utils'
import { useStyle } from '../contexts/StyleContext'
import { usePokemonContext } from '../contexts/PokemonContext'
import { useMoves } from '../queries/moves'
import { usePokemonById } from '../queries/pokemon'
import { calculateTypeEffectiveness, NONE_TYPE_MARKER } from '@/constants/types'
import {
  DeleteIcon,
  SuperEffectiveIcon,
  NotVeryEffectiveIcon,
  ImmuneIcon,
} from './icons'
import './TeamPokemon.css'

type PokemonMoves = Array<{
  name: string
  type: string
  damage_class?: 'status' | 'physical' | 'special'
} | null>

interface TeamPokemonProps {
  pokemonId: number | null
  position: number
  isSelected: boolean
  onSelect: () => void
  onRemove: () => void
  isExpanded?: boolean
  contextMoves: { [pokemonId: number]: PokemonMoves }
  setPokemonMoves: (pokemonId: number, moves: PokemonMoves) => void
  battleInfoPokemonId: number | null
  hoveredDefensiveTypes: string[]
  hoveredOffensiveTypes: string[]
  addInPosition: (pokemonId: number, position: number) => void
  hideRemoveButton?: boolean
}

const TeamPokemon = ({
  pokemonId,
  position,
  isSelected,
  onSelect,
  onRemove,
  isExpanded = true,
  contextMoves,
  setPokemonMoves,
  battleInfoPokemonId,
  hoveredDefensiveTypes,
  hoveredOffensiveTypes,
  addInPosition,
  hideRemoveButton = false,
}: TeamPokemonProps) => {
  const { data: pokemon, isLoading: isLoadingPokemon } =
    usePokemonById(pokemonId)
  const { data: battleInfoPokemon } = usePokemonById(battleInfoPokemonId)
  const [displayedPokemon, setDisplayedPokemon] =
    useState<PokemonDetail | null>(pokemon || null)
  const [displayedMoves, setDisplayedMoves] = useState<
    Array<{
      name: string
      type: string
      damage_class?: 'status' | 'physical' | 'special'
    } | null>
  >([null, null, null, null])

  // Update displayed pokemon when pokemon data changes
  useEffect(() => {
    if (pokemon && !isLoadingPokemon) {
      setDisplayedPokemon(pokemon)
      // Update displayed moves when new pokemon finishes loading
      const newMoves = contextMoves[pokemon.id] || [null, null, null, null]
      setDisplayedMoves(newMoves)
    } else if (!pokemonId && !isLoadingPokemon) {
      // Clear displayed pokemon when pokemonId is null and not loading
      setDisplayedPokemon(null)
      setDisplayedMoves([null, null, null, null])
    }
  }, [pokemon, pokemonId, isLoadingPokemon, contextMoves])

  // Initialize displayed pokemon and moves on mount
  useEffect(() => {
    if (pokemon && !displayedPokemon) {
      setDisplayedPokemon(pokemon)
      const initialMoves = contextMoves[pokemon.id] || [null, null, null, null]
      setDisplayedMoves(initialMoves)
    }
  }, [pokemon, displayedPokemon, contextMoves])

  const [isHovered, setIsHovered] = useState(false)
  const { isMobile } = useStyle()
  const { isTouch } = usePokemonContext()

  // Handle touch events on touch devices to prevent double-tap issue
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isTouch) return

    const target = e.target as HTMLElement

    // Check if there's an open popover FIRST - if so, let the click event bubble to close it
    const openPopover = document.querySelector(
      '[data-state="open"][role="dialog"]'
    )
    if (openPopover) {
      // Don't prevent default or stop propagation - let the click event fire
      // so MovesCombobox can detect it as an outside click and close the popover
      // Also don't call onSelect() - the popover closing is the priority
      return
    }

    // Don't select if touching interactive elements
    const movesArea = target.closest('.team-pokemon-moves')
    const moveItem = target.closest('.team-pokemon-move-item')
    const moveTrigger = target.closest('.team-pokemon-move-trigger')
    const isButton = target.tagName === 'BUTTON' || target.closest('button')
    const isInteractive =
      target.tagName === 'INPUT' ||
      target.tagName === 'SELECT' ||
      target.tagName === 'TEXTAREA' ||
      target.getAttribute('role') === 'button' ||
      target.closest(
        'button, input, select, textarea, [role="button"], [data-radix-popover-trigger]'
      )

    // If touching interactive elements, let the click event handle it
    if (movesArea || moveItem || moveTrigger || isButton || isInteractive) {
      return
    }

    // Prevent default to avoid hover state, then trigger selection
    e.preventDefault()
    e.stopPropagation()
    onSelect()
  }

  const handleClick = (e: React.MouseEvent) => {
    // On touch devices, ignore click events if we already handled it via touch
    // This prevents double-firing
    if (isTouch) {
      const target = e.target as HTMLElement
      const movesArea = target.closest('.team-pokemon-moves')
      const moveItem = target.closest('.team-pokemon-move-item')
      const moveTrigger = target.closest('.team-pokemon-move-trigger')
      const isButton = target.tagName === 'BUTTON' || target.closest('button')
      const isInteractive =
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'TEXTAREA' ||
        target.getAttribute('role') === 'button' ||
        target.closest(
          'button, input, select, textarea, [role="button"], [data-radix-popover-trigger]'
        )

      // If clicking on interactive elements, let it through
      if (movesArea || moveItem || moveTrigger || isButton || isInteractive) {
        return
      }
      // Otherwise, ignore the click (touch event already handled it)
      return
    }
    onSelect()
  }

  // Load moves query on hover
  useMoves(displayedPokemon?.id, isHovered)

  // Update displayed moves when contextMoves changes for the displayed pokemon
  useEffect(() => {
    if (displayedPokemon) {
      const newMoves = contextMoves[displayedPokemon.id] || [
        null,
        null,
        null,
        null,
      ]
      setDisplayedMoves(newMoves)
    }
  }, [displayedPokemon, contextMoves])

  // Check if there are any highlighted moves or if pokemon has the hovered defensive type
  const hasHighlightedMoves = useMemo(() => {
    if (hoveredDefensiveTypes.length > 0) {
      // Special case: if hovering "none", no pokemon should be highlighted (all dimmed)
      if (hoveredDefensiveTypes.includes(NONE_TYPE_MARKER)) {
        return false
      }
      const hasType =
        displayedPokemon?.types?.some(t =>
          hoveredDefensiveTypes.includes(t.type.name)
        ) || false
      const hasMoveType = displayedMoves.some(
        move =>
          move?.type &&
          move?.damage_class !== 'status' &&
          hoveredDefensiveTypes.includes(move.type)
      )
      if (hasType || hasMoveType) return true
    }
    return false
  }, [displayedMoves, hoveredDefensiveTypes, displayedPokemon])

  // Check if this pokemon has the hovered offensive type
  const hasHoveredOffensiveType = useMemo(() => {
    if (!displayedPokemon) return false
    if (hoveredOffensiveTypes.length > 0) {
      return (
        displayedPokemon.types?.some(t =>
          hoveredOffensiveTypes.includes(t.type.name)
        ) || false
      )
    }
    return false
  }, [displayedPokemon, hoveredOffensiveTypes])

  // Check if we're in empty state (no displayedPokemon and not loading)
  const isEmpty = !displayedPokemon && !isLoadingPokemon

  return (
    <div
      onClick={handleClick}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'team-pokemon-container group/container',
        // Only apply selected styles if not dimmed
        isSelected &&
          !(
            (hoveredOffensiveTypes.length > 0 && !hasHoveredOffensiveType) ||
            (hoveredDefensiveTypes.length > 0 && !hasHighlightedMoves)
          )
          ? 'team-pokemon-container-selected'
          : 'team-pokemon-container-unselected',
        hoveredOffensiveTypes.length > 0 &&
          hasHoveredOffensiveType &&
          'team-pokemon-container-highlighted',
        hoveredOffensiveTypes.length > 0 &&
          !hasHoveredOffensiveType &&
          'team-pokemon-container-dimmed',
        hoveredDefensiveTypes.length > 0 &&
          hasHighlightedMoves &&
          'team-pokemon-container-highlighted',
        hoveredDefensiveTypes.length > 0 &&
          !hasHighlightedMoves &&
          'team-pokemon-container-dimmed',
        isLoadingPokemon && 'opacity-50'
      )}
      style={{
        height: '90px',
        minHeight: '90px',
        maxHeight: '90px',
        gap: isExpanded ? 5 : 0,
        transition: isLoadingPokemon ? 'opacity 0.2s ease-in-out' : undefined,
      }}
    >
      {/* Delete button - top left */}
      {!hideRemoveButton && !isEmpty && (
        <button
          onClick={e => {
            e.stopPropagation()
            onRemove()
          }}
          className="team-pokemon-delete-button"
          aria-label="Remove Pokemon"
        >
          <DeleteIcon className="team-pokemon-delete-icon" />
        </button>
      )}

      {/* Left side: Image, Name, and Types */}
      <div
        className={cn(
          'team-pokemon-left',
          hoveredDefensiveTypes.length > 0 &&
            !hasHighlightedMoves &&
            'team-pokemon-left-dimmed'
        )}
      >
        {/* Image and Name container */}
        <div className="team-pokemon-image-container">
          <AnimatePresence mode="wait">
            {displayedPokemon && (
              <motion.div
                key={displayedPokemon.id}
                className="team-pokemon-image-wrapper"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {displayedPokemon.sprites.front_default ? (
                  <BlurImage
                    src={displayedPokemon.sprites.front_default}
                    alt={displayedPokemon.name}
                    className="team-pokemon-image"
                    style={{ color: 'transparent' }}
                    dominantColor={displayedPokemon.dominant_color}
                  />
                ) : null}
                <PokemonCombobox
                  value={displayedPokemon.id}
                  onValueChange={pokemonId => {
                    addInPosition(pokemonId, position)
                  }}
                  trigger={
                    <div
                      className="team-pokemon-name cursor-pointer hover:opacity-80 transition-opacity"
                      style={{
                        boxShadow: '0 0 8px 4px rgb(243 244 246)',
                        backgroundColor: 'rgba(243, 244, 246, 0.9)',
                      }}
                    >
                      {displayedPokemon.name}
                    </div>
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Types */}
        <AnimatedTypePills
          types={displayedPokemon?.types || null}
          size={isMobile ? 'icon' : 'small'}
        />
      </div>

      {/* Right side: Moves */}
      <div
        className="team-pokemon-moves"
        style={{
          opacity: isEmpty ? 0 : isExpanded ? 1 : 0,
          width: isEmpty ? (isExpanded ? 130 : 0) : isExpanded ? 130 : 0,
          visibility: isEmpty ? ('hidden' as const) : undefined,
          pointerEvents: isEmpty ? ('none' as const) : undefined,
          transition:
            'width 0.2s ease-in, opacity 0.2s ease-in, flex-basis 0.2s ease-in',
        }}
        onTouchEnd={e => e.stopPropagation()}
      >
        {/* Render 4 move items to maintain width when empty */}
        {(displayedPokemon ? displayedMoves : [null, null, null, null]).map(
          (move, index) => {
            const isHighlighted =
              hoveredDefensiveTypes.length > 0 &&
              move?.type &&
              move?.damage_class !== 'status' &&
              hoveredDefensiveTypes.includes(move.type)
            const shouldDarken =
              hoveredDefensiveTypes.length > 0 && !isHighlighted

            return (
              <div
                key={index}
                className={cn(
                  'team-pokemon-move-item group/move',
                  isHighlighted && 'team-pokemon-move-item-highlighted',
                  shouldDarken && 'team-pokemon-move-item-dimmed'
                )}
                style={{
                  transition: 'transform 0.1s ease-in',
                  transform: isHighlighted
                    ? 'translateY(0)'
                    : 'translateY(2px)',
                }}
                onClick={e => e.stopPropagation()}
                onTouchEnd={e => e.stopPropagation()}
              >
                {/* Effectiveness icon */}
                {move &&
                  move.damage_class !== 'status' &&
                  battleInfoPokemon &&
                  (() => {
                    const battleTypes = battleInfoPokemon.types.map(
                      t => t.type.name
                    )
                    const effectiveness = calculateTypeEffectiveness(
                      move.type,
                      battleTypes
                    )

                    let icon = null
                    if (effectiveness === 0) {
                      // Immune - cross
                      icon = (
                        <ImmuneIcon className="team-pokemon-effectiveness-icon-svg" />
                      )
                    } else if (effectiveness < 1) {
                      // Resistant - triangle
                      icon = (
                        <NotVeryEffectiveIcon className="team-pokemon-effectiveness-icon-svg" />
                      )
                    } else if (effectiveness > 1) {
                      // Weak - circle
                      icon = (
                        <SuperEffectiveIcon className="team-pokemon-effectiveness-icon-svg" />
                      )
                    }

                    return (
                      <AnimatePresence>
                        {icon && (
                          <motion.span
                            key={`${move.type}-${effectiveness}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="team-pokemon-effectiveness-icon"
                          >
                            {icon}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    )
                  })()}
                <MovesCombobox
                  key={index}
                  value={move?.name}
                  pokemonId={displayedPokemon?.id || 0}
                  selectedMoves={
                    displayedPokemon
                      ? displayedMoves
                          .filter((m, i) => m !== null && i !== index)
                          .map(m => m!.name)
                      : []
                  }
                  onValueChange={(moveName, moveType, damageClass) => {
                    if (!displayedPokemon) return
                    const newMoves = [...displayedMoves]
                    newMoves[index] = moveName
                      ? {
                          name: moveName,
                          type: moveType || '',
                          damage_class: damageClass,
                        }
                      : null
                    setPokemonMoves(displayedPokemon.id, newMoves)
                  }}
                  trigger={
                    <div
                      className={cn(
                        'team-pokemon-move-trigger',
                        !move && 'team-pokemon-move-trigger-empty',
                        !!move && 'team-pokemon-move-trigger-filled'
                      )}
                    >
                      {move ? (
                        <>
                          <span className="team-pokemon-move-name">
                            {move.name.replace(/-/g, ' ')}
                          </span>
                        </>
                      ) : null}
                    </div>
                  }
                />

                {move && move.type && (
                  <>
                    <TypePill
                      type={{ name: move.type }}
                      size="icon"
                      className="absolute right-0.5 top-0.5 group-hover/move:hidden"
                    />
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        if (!displayedPokemon) return
                        const newMoves = [...displayedMoves]
                        newMoves[index] = null
                        setPokemonMoves(displayedPokemon.id, newMoves)
                      }}
                      className="team-pokemon-clear-move-button"
                      aria-label="Clear move"
                    >
                      <DeleteIcon className="team-pokemon-clear-move-icon" />
                    </button>
                  </>
                )}
              </div>
            )
          }
        )}
      </div>

      {/* Empty state combobox - displayed over everything */}
      <AnimatePresence>
        {isEmpty && (
          <motion.div
            key="empty-state"
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <PokemonCombobox
              onValueChange={pokemonId => {
                addInPosition(pokemonId, position)
              }}
              trigger={
                <div className="team-pokemon-empty-text hover:bg-gray-200 p-2 rounded pointer-events-auto cursor-pointer">
                  Empty
                </div>
              }
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TeamPokemon
