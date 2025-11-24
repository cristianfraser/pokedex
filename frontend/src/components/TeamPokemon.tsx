import { useLayoutEffect, useRef, useState, useMemo, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PokemonDetail } from '../queries/pokemon'
import AnimatedTypePills from './AnimatedTypePills'
import TypePill from './TypePill'
import { MovesCombobox } from './MovesCombobox'
import { PokemonCombobox } from './PokemonCombobox'
import { cn } from '@/lib/utils'
import { useStyle } from '../contexts/StyleContext'
import { useMoves } from '../queries/moves'
import { usePokemonById } from '../queries/pokemon'
import { calculateTypeEffectiveness, NONE_TYPE_MARKER } from '@/constants/types'
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

  const [isAnimatingEmpty, setIsAnimatingEmpty] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const { isMobile } = useStyle()

  // Handle touch events on mobile to prevent double-tap issue
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isMobile) return

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
    // On mobile, ignore click events if we already handled it via touch
    // This prevents double-firing
    if (isMobile) {
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
  const emptyTextRef = useRef<HTMLDivElement>(null)
  const previousPokemonRef = useRef<PokemonDetail | null>(null)

  // Handle empty text fade animation when transitioning from Pokemon to empty
  useLayoutEffect(() => {
    if (!displayedPokemon && previousPokemonRef.current) {
      // Transitioning from Pokemon to empty: animate empty fade-in
      setIsAnimatingEmpty(true)
    }
    previousPokemonRef.current = displayedPokemon || null
  }, [displayedPokemon])

  // Handle empty text fade animation
  useLayoutEffect(() => {
    if (isAnimatingEmpty) {
      // Apply initial state immediately (no transition) before paint
      if (emptyTextRef.current) {
        emptyTextRef.current.style.transition = 'none'
        emptyTextRef.current.style.opacity = '0'
      }

      // After paint, enable transition and animate
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (emptyTextRef.current) {
            emptyTextRef.current.style.transition = 'opacity 0.3s ease-out'
            emptyTextRef.current.style.opacity = '1'
          }

          // After animation completes, reset
          setTimeout(() => {
            setIsAnimatingEmpty(false)
            if (emptyTextRef.current) {
              emptyTextRef.current.style.transition = ''
              emptyTextRef.current.style.opacity = ''
            }
          }, 300)
        })
      })
    } else if (!isAnimatingEmpty && emptyTextRef.current) {
      // No animation needed, reset styles
      emptyTextRef.current.style.transition = ''
      emptyTextRef.current.style.opacity = ''
    }
  }, [isAnimatingEmpty])

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

  if (!displayedPokemon) {
    return (
      <div
        onClick={onSelect}
        className={cn(
          'team-pokemon-empty',
          isSelected
            ? 'team-pokemon-empty-selected'
            : 'team-pokemon-empty-unselected'
        )}
        style={{
          height: '90px',
          minHeight: '90px',
          maxHeight: '90px',
        }}
      >
        <PokemonCombobox
          onValueChange={pokemonId => {
            addInPosition(pokemonId, position)
          }}
          trigger={
            <div
              ref={emptyTextRef}
              className="team-pokemon-empty-text hover:bg-gray-200 p-2 rounded"
              style={{
                opacity: isAnimatingEmpty ? 0 : undefined,
                transition: isAnimatingEmpty ? 'none' : undefined,
              }}
            >
              Empty
            </div>
          }
        />
      </div>
    )
  }

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
      {/* Delete button - top right */}
      <button
        onClick={e => {
          e.stopPropagation()
          onRemove()
        }}
        className="team-pokemon-delete-button"
        aria-label="Remove Pokemon"
      >
        <svg
          className="team-pokemon-delete-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

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
                  <img
                    src={displayedPokemon.sprites.front_default}
                    alt={displayedPokemon.name}
                    className="team-pokemon-image"
                    style={{ color: 'transparent' }}
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
          types={displayedPokemon.types || null}
          size={isMobile ? 'icon' : 'small'}
        />
      </div>

      {/* Right side: Moves */}
      <div
        className="team-pokemon-moves"
        style={{
          opacity: isExpanded ? 1 : 0,
          width: isExpanded ? 130 : 0,
          transition:
            'width 0.2s ease-in, opacity 0.2s ease-in, flex-basis 0.2s ease-in',
        }}
        onTouchEnd={e => e.stopPropagation()}
      >
        {displayedPokemon &&
          displayedMoves.map((move, index) => {
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
                        <svg
                          className="team-pokemon-effectiveness-icon-svg"
                          viewBox="0 0 12 12"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          role="img"
                          aria-label="No effect"
                        >
                          <title>No effect</title>
                          <path d="M2 2 L10 10 M10 2 L2 10" />
                        </svg>
                      )
                    } else if (effectiveness < 1) {
                      // Resistant - triangle
                      icon = (
                        <svg
                          className="team-pokemon-effectiveness-icon-svg-gray"
                          viewBox="0 0 12 12"
                          fill="none"
                          role="img"
                          aria-label="Not very effective"
                        >
                          <title>Not very effective</title>
                          <path
                            d="M6 5.2 L7.5 8 L4.5 8 Z"
                            fill="currentColor"
                          />
                          <path
                            d="M6 1.5 L10.5 10 L1.5 10 Z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            fill="none"
                          />
                        </svg>
                      )
                    } else if (effectiveness > 1) {
                      // Weak - circle
                      icon = (
                        <svg
                          className="team-pokemon-effectiveness-icon-svg-gray"
                          viewBox="0 0 12 12"
                          fill="none"
                          role="img"
                          aria-label="Super effective"
                        >
                          <title>Super effective</title>
                          <circle cx="6" cy="6" r="2" fill="currentColor" />
                          <circle
                            cx="6"
                            cy="6"
                            r="4.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            fill="none"
                          />
                        </svg>
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
                  pokemonId={displayedPokemon.id}
                  selectedMoves={displayedMoves
                    .filter((m, i) => m !== null && i !== index)
                    .map(m => m!.name)}
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
                      <svg
                        className="team-pokemon-clear-move-icon"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            )
          })}
      </div>
    </div>
  )
}

export default TeamPokemon
