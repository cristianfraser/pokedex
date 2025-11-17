import { useLayoutEffect, useRef, useState, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PokemonDetail } from '../queries/pokemon'
import AnimatedTypePills from './AnimatedTypePills'
import TypePill from './TypePill'
import { MovesCombobox } from './MovesCombobox'
import { cn } from '@/lib/utils'
import { usePokemonContext } from '../contexts/PokemonContext'
import { useMoves } from '../queries/moves'
import { calculateTypeEffectiveness } from '@/constants/types'
import './TeamPokemon.css'

interface TeamPokemonProps {
  pokemon: PokemonDetail | null
  position: number
  isSelected: boolean
  onSelect: () => void
  onRemove: () => void
  isExpanded?: boolean
}

const TeamPokemon = ({
  pokemon,
  position: _position,
  isSelected,
  onSelect,
  onRemove,
  isExpanded = true,
}: TeamPokemonProps) => {
  const {
    contextMoves,
    setPokemonMoves,
    battleInfoPokemon,
    hoveredDefensiveTypes,
    hoveredOffensiveTypes,
  } = usePokemonContext()
  const [isAnimatingImageName, setIsAnimatingImageName] = useState(false)
  const [isAnimatingEmpty, setIsAnimatingEmpty] = useState(false)
  const [exitingPokemon, setExitingPokemon] = useState<PokemonDetail | null>(
    null
  )
  const [isHovered, setIsHovered] = useState(false)

  // Load moves query on hover
  useMoves(pokemon?.id, isHovered)

  // Get moves from context for this pokemon, default to empty array
  const moves = useMemo(() => {
    if (!pokemon) return [null, null, null, null]
    return contextMoves[pokemon.id] || [null, null, null, null]
  }, [pokemon, contextMoves])

  // Check if there are any highlighted moves or if pokemon has the hovered defensive type
  const hasHighlightedMoves = useMemo(() => {
    if (hoveredDefensiveTypes.length > 0) {
      const hasType =
        pokemon?.types?.some(t =>
          hoveredDefensiveTypes.includes(t.type.name)
        ) || false
      const hasMoveType = moves.some(
        move =>
          move?.type &&
          move?.damage_class !== 'status' &&
          hoveredDefensiveTypes.includes(move.type)
      )
      if (hasType || hasMoveType) return true
    }
    return false
  }, [moves, hoveredDefensiveTypes, pokemon])
  const enteringImageNameRef = useRef<HTMLDivElement>(null)
  const exitingImageNameRef = useRef<HTMLDivElement>(null)
  const emptyTextRef = useRef<HTMLDivElement>(null)
  const previousPokemonRef = useRef<PokemonDetail | null>(null)
  const previousPokemonIdRef = useRef<number | null>(null)

  // Use useLayoutEffect to handle image/name animations
  useLayoutEffect(() => {
    if (pokemon) {
      if (previousPokemonRef.current) {
        // Had a previous Pokemon
        // Check if Pokemon changed (not just types)
        const pokemonChanged = previousPokemonRef.current.id !== pokemon.id

        if (pokemonChanged) {
          // Pokemon changed: animate image/name fade
          setExitingPokemon(previousPokemonRef.current)
          setIsAnimatingImageName(true)
        }
      } else {
        // Transitioning from empty to Pokemon: animate image/name fade-in
        setIsAnimatingImageName(true)
      }
    } else {
      // No pokemon
      if (previousPokemonRef.current) {
        // Transitioning from Pokemon to empty: animate empty fade-in
        setIsAnimatingEmpty(true)
      }
      setExitingPokemon(null)
      setIsAnimatingImageName(false)
    }

    // Update ref for next render
    previousPokemonRef.current = pokemon
  }, [pokemon])

  // Update previousPokemonIdRef when Pokemon changes
  useLayoutEffect(() => {
    const currentId = pokemon?.id ?? null
    if (currentId !== previousPokemonIdRef.current) {
      previousPokemonIdRef.current = currentId
    }
  }, [pokemon])

  // Handle image/name fade animation
  useLayoutEffect(() => {
    if (isAnimatingImageName) {
      // Apply initial states immediately (no transition) before paint
      if (enteringImageNameRef.current) {
        enteringImageNameRef.current.style.transition = 'none'
        enteringImageNameRef.current.style.opacity = '0'
      }
      if (exitingImageNameRef.current && exitingPokemon) {
        exitingImageNameRef.current.style.transition = 'none'
        exitingImageNameRef.current.style.opacity = '1'
      }

      // After paint, enable transitions and animate
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (enteringImageNameRef.current) {
            enteringImageNameRef.current.style.transition =
              'opacity 0.3s ease-out'
            enteringImageNameRef.current.style.opacity = '1'
          }
          if (exitingImageNameRef.current && exitingPokemon) {
            exitingImageNameRef.current.style.transition =
              'opacity 0.3s ease-out'
            exitingImageNameRef.current.style.opacity = '0'
          }

          // After animation completes, clear exiting Pokemon
          setTimeout(() => {
            setExitingPokemon(null)
            setIsAnimatingImageName(false)
            if (enteringImageNameRef.current) {
              enteringImageNameRef.current.style.transition = ''
              enteringImageNameRef.current.style.opacity = ''
            }
            if (exitingImageNameRef.current) {
              exitingImageNameRef.current.style.display = 'none'
              exitingImageNameRef.current.style.transition = ''
              exitingImageNameRef.current.style.opacity = ''
            }
          }, 300)
        })
      })
    } else if (!isAnimatingImageName) {
      // No animation needed, reset styles
      if (enteringImageNameRef.current) {
        enteringImageNameRef.current.style.transition = ''
        enteringImageNameRef.current.style.opacity = ''
      }
      if (exitingImageNameRef.current) {
        exitingImageNameRef.current.style.transition = ''
        exitingImageNameRef.current.style.opacity = ''
      }
    }
  }, [isAnimatingImageName, exitingPokemon])

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
    if (!pokemon) return false
    if (hoveredOffensiveTypes.length > 0) {
      return (
        pokemon.types?.some(t => hoveredOffensiveTypes.includes(t.type.name)) ||
        false
      )
    }
    return false
  }, [pokemon, hoveredOffensiveTypes])

  if (!pokemon) {
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
        <div
          ref={emptyTextRef}
          className="team-pokemon-empty-text"
          style={{
            opacity: isAnimatingEmpty ? 0 : undefined,
            transition: isAnimatingEmpty ? 'none' : undefined,
          }}
        >
          Empty
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'team-pokemon-container group/container',
        isSelected
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
          'team-pokemon-container-highlighted'
      )}
      style={{
        height: '90px',
        minHeight: '90px',
        maxHeight: '90px',
        minWidth: 'fit-content',
        gap: isExpanded ? 5 : 0,
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
          {/* Entering image/name */}
          <div
            ref={enteringImageNameRef}
            className="team-pokemon-image-wrapper"
            style={{
              opacity: isAnimatingImageName ? 0 : undefined,
              transition: isAnimatingImageName ? 'none' : undefined,
            }}
          >
            {pokemon.sprites.front_default ? (
              <img
                src={pokemon.sprites.front_default}
                alt={pokemon.name}
                className="team-pokemon-image"
                style={{ color: 'transparent' }}
              />
            ) : null}
            <div
              className="team-pokemon-name"
              style={{
                boxShadow: '0 0 8px 4px rgb(243 244 246)',
                backgroundColor: 'rgba(243, 244, 246, 0.9)',
              }}
            >
              {pokemon.name}
            </div>
          </div>
          {/* Exiting image/name */}
          {exitingPokemon && (
            <div
              ref={exitingImageNameRef}
              className="team-pokemon-exiting-wrapper"
              style={{
                opacity: isAnimatingImageName ? 1 : undefined,
                transition: isAnimatingImageName ? 'none' : undefined,
              }}
            >
              {exitingPokemon.sprites.front_default ? (
                <img
                  src={exitingPokemon.sprites.front_default}
                  alt={exitingPokemon.name}
                  className="team-pokemon-image"
                  style={{ color: 'transparent' }}
                />
              ) : null}
              <div
                className="team-pokemon-name"
                style={{
                  boxShadow: '0 0 8px 4px rgb(243 244 246)',
                  backgroundColor: 'rgba(243, 244, 246, 0.9)',
                }}
              >
                {exitingPokemon.name}
              </div>
            </div>
          )}
        </div>

        {/* Types */}
        <AnimatedTypePills types={pokemon.types || null} size="small" />
      </div>

      {/* Right side: Moves */}
      <div
        className="team-pokemon-moves"
        style={{
          opacity: isExpanded ? 1 : 0,
          width: isExpanded ? 130 : 0,
          transition: 'opacity 0.2s ease-in, width 0.2s ease-in',
        }}
      >
        {pokemon &&
          moves.map((move, index) => {
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
                  pokemonId={pokemon.id}
                  onValueChange={(moveName, moveType, damageClass) => {
                    if (!pokemon) return
                    const newMoves = [...moves]
                    newMoves[index] = moveName
                      ? {
                          name: moveName,
                          type: moveType || '',
                          damage_class: damageClass,
                        }
                      : null
                    setPokemonMoves(pokemon.id, newMoves)
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
                        if (!pokemon) return
                        const newMoves = [...moves]
                        newMoves[index] = null
                        setPokemonMoves(pokemon.id, newMoves)
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
