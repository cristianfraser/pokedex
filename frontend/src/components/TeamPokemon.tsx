import { useLayoutEffect, useRef, useState, useMemo, useEffect } from 'react'
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
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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
      onClick={handleClick}
      onTouchEnd={handleTouchEnd}
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
        <AnimatedTypePills
          types={pokemon.types || null}
          size={isMobile ? 'icon' : 'small'}
        />
      </div>

      {/* Right side: Moves */}
      <div
        className="team-pokemon-moves"
        style={{
          opacity: isExpanded ? 1 : 0,
          width: isExpanded ? 130 : 0,
          transition: 'opacity 0.2s ease-in, width 0.2s ease-in',
        }}
        onTouchEnd={e => e.stopPropagation()}
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
                      onTouchStart={e => {
                        // Store touch start to detect scroll gestures
                        if (isMobile) {
                          const touch = e.touches[0]
                          if (touch) {
                            ;(e.currentTarget as any).__touchStart = {
                              x: touch.clientX,
                              y: touch.clientY,
                              time: Date.now(),
                            }
                          }
                        }
                      }}
                      onTouchMove={e => {
                        // Detect if this is a scroll gesture
                        if (isMobile) {
                          const touchStart = (e.currentTarget as any)
                            .__touchStart
                          if (touchStart) {
                            const touch = e.touches[0]
                            if (touch) {
                              const deltaX = Math.abs(
                                touch.clientX - touchStart.x
                              )
                              const deltaY = Math.abs(
                                touch.clientY - touchStart.y
                              )
                              // If moved more than 10px, consider it a scroll
                              if (deltaX > 10 || deltaY > 10) {
                                ;(e.currentTarget as any).__isScrollGesture =
                                  true
                              }
                            }
                          }
                        }
                      }}
                      onTouchEnd={e => {
                        // On mobile, trigger click immediately to open combobox
                        // This prevents the double-tap issue
                        if (isMobile) {
                          // Check if this was a scroll gesture
                          const isScrollGesture = (e.currentTarget as any)
                            .__isScrollGesture
                          if (isScrollGesture) {
                            // Don't open if it was a scroll gesture
                            e.preventDefault()
                            e.stopPropagation()
                            // Clean up
                            delete (e.currentTarget as any).__touchStart
                            delete (e.currentTarget as any).__isScrollGesture
                            return
                          }

                          // Clean up
                          delete (e.currentTarget as any).__touchStart
                          delete (e.currentTarget as any).__isScrollGesture

                          e.preventDefault()
                          e.stopPropagation()
                          // Programmatically trigger click to open the popover
                          const target = e.currentTarget
                          const clickEvent = new MouseEvent('click', {
                            bubbles: true,
                            cancelable: true,
                            view: window,
                          })
                          target.dispatchEvent(clickEvent)
                        }
                      }}
                      onClick={e => {
                        // Stop propagation to prevent container selection
                        e.stopPropagation()
                      }}
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
