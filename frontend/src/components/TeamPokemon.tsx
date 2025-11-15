import { useLayoutEffect, useRef, useState, useMemo } from 'react'
import { PokemonDetail } from '../queries/pokemon'
import TypePill from './TypePill'
import { MovesCombobox } from './MovesCombobox'
import { cn } from '@/lib/utils'
import { usePokemonContext } from '../contexts/PokemonContext'

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
  const { contextMoves, setPokemonMoves } = usePokemonContext()
  const [exitingTypes, setExitingTypes] = useState<string[]>([])
  const [isAnimating, setIsAnimating] = useState(false)
  const [isAnimatingImageName, setIsAnimatingImageName] = useState(false)
  const [isAnimatingEmpty, setIsAnimatingEmpty] = useState(false)
  const [exitingPokemon, setExitingPokemon] = useState<PokemonDetail | null>(
    null
  )

  // Get moves from context for this pokemon, default to empty array
  const moves = useMemo(() => {
    if (!pokemon) return [null, null, null, null]
    return contextMoves[pokemon.id] || [null, null, null, null]
  }, [pokemon, contextMoves])
  const enteringRef = useRef<HTMLDivElement>(null)
  const exitingRef = useRef<HTMLDivElement>(null)
  const enteringImageNameRef = useRef<HTMLDivElement>(null)
  const exitingImageNameRef = useRef<HTMLDivElement>(null)
  const emptyTextRef = useRef<HTMLDivElement>(null)
  const previousPokemonRef = useRef<PokemonDetail | null>(null)
  const previousPokemonIdRef = useRef<number | null>(null)

  // Use useLayoutEffect to set exiting types synchronously before paint
  useLayoutEffect(() => {
    if (pokemon) {
      const enteringTypes = pokemon.types.map(t => t.type.name)

      if (previousPokemonRef.current) {
        // Had a previous Pokemon
        const previousTypesArray = previousPokemonRef.current.types.map(
          t => t.type.name
        )

        // Check if Pokemon changed (not just types)
        const pokemonChanged = previousPokemonRef.current.id !== pokemon.id

        // Check if types changed
        const typesChanged =
          previousTypesArray.length !== enteringTypes.length ||
          !previousTypesArray.every(
            (type, index) => type === enteringTypes[index]
          )

        if (pokemonChanged) {
          // Pokemon changed: animate image/name fade
          setExitingPokemon(previousPokemonRef.current)
          setIsAnimatingImageName(true)
        }

        if (typesChanged && previousTypesArray.length > 0) {
          // Types changed: set previous types as exiting synchronously
          setExitingTypes([...previousTypesArray])
          setIsAnimating(true)
        } else if (!typesChanged) {
          // Types are the same, clear exiting
          setExitingTypes([])
          setIsAnimating(false)
        }
      } else {
        // Transitioning from empty to Pokemon: animate image/name fade-in
        setIsAnimatingImageName(true)
        // No exiting types since there was no previous Pokemon
        setExitingTypes([])
        setIsAnimating(false)
      }
    } else {
      // No pokemon
      if (previousPokemonRef.current) {
        // Transitioning from Pokemon to empty: animate empty fade-in
        setIsAnimatingEmpty(true)
      }
      setExitingTypes([])
      setIsAnimating(false)
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

  useLayoutEffect(() => {
    if (isAnimating && exitingTypes.length > 0) {
      // Apply initial transforms immediately (no transition) before paint
      if (enteringRef.current) {
        enteringRef.current.style.transition = 'none'
        enteringRef.current.style.transform = 'translateY(calc(-100% - 2px))'
      }
      if (exitingRef.current) {
        exitingRef.current.style.transition = 'none'
        exitingRef.current.style.transform = 'translateY(0)'
      }

      // After paint, enable transitions and animate
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (enteringRef.current) {
            enteringRef.current.style.transition = 'transform 0.3s ease-out'
            enteringRef.current.style.transform = 'translateY(0)'
          }
          if (exitingRef.current) {
            exitingRef.current.style.transition =
              'transform 0.3s ease-out, opacity 0.3s'
            exitingRef.current.style.transform = 'translateY(120%)'
            exitingRef.current.style.opacity = '0.3'
          }

          // After animation completes, clear exiting types
          setTimeout(() => {
            setExitingTypes([])
            setIsAnimating(false)
            if (enteringRef.current) {
              enteringRef.current.style.transition = ''
              enteringRef.current.style.transform = ''
            }
            if (exitingRef.current) {
              exitingRef.current.style.display = 'none'
              exitingRef.current.style.transition = ''
              exitingRef.current.style.transform = ''
              exitingRef.current.style.opacity = ''
            }
          }, 300)
        })
      })
    } else if (!isAnimating) {
      // No animation needed, reset transforms
      if (enteringRef.current) {
        enteringRef.current.style.transition = ''
        enteringRef.current.style.transform = ''
      }
      if (exitingRef.current) {
        exitingRef.current.style.transition = ''
        exitingRef.current.style.transform = ''
        exitingRef.current.style.opacity = ''
      }
    }
  }, [isAnimating, exitingTypes])

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

  if (!pokemon) {
    return (
      <div
        onClick={onSelect}
        className={`text-2xs bg-gray-100 rounded-lg border px-1 flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden ${
          isSelected
            ? 'border-primary-600 bg-primary-50'
            : 'border-gray-200 hover:border-gray-300'
        }`}
        style={{
          height: '90px',
          minHeight: '90px',
          maxHeight: '90px',
        }}
      >
        <div
          ref={emptyTextRef}
          className="text-gray-400 text-xs"
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
      className={`group/container px-1 bg-gray-100 rounded-lg border flex flex-row gap-[5px] relative cursor-pointer transition-colors overflow-hidden ${
        isSelected
          ? 'border-primary-600 bg-primary-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
      style={{
        height: '90px',
        minHeight: '90px',
        maxHeight: '90px',
      }}
    >
      {/* Delete button - top right */}
      <button
        onClick={e => {
          e.stopPropagation()
          onRemove()
        }}
        className="absolute top-0 right-0 w-6 h-6 flex items-center justify-center hover:bg-red-100 rounded-bl-lg transition-opacity opacity-0 group-hover/container:opacity-100 z-10"
        aria-label="Remove Pokemon"
      >
        <svg
          className="w-4 h-4 text-red-600"
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
      <div className="flex flex-col items-center justify-center flex-shrink-0 w-[110px]">
        {/* Image and Name container */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          {/* Entering image/name */}
          <div
            ref={enteringImageNameRef}
            className="relative w-full h-full"
            style={{
              opacity: isAnimatingImageName ? 0 : undefined,
              transition: isAnimatingImageName ? 'none' : undefined,
            }}
          >
            {pokemon.sprites.front_default ? (
              <img
                src={pokemon.sprites.front_default}
                alt={pokemon.name}
                className="w-full h-full object-contain"
                style={{ color: 'transparent' }}
              />
            ) : null}
            <div
              className="text-3xs font-medium text-gray-900 capitalize text-center absolute bottom-0 left-0 right-0"
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
              className="absolute top-0 left-0 w-full h-full"
              style={{
                opacity: isAnimatingImageName ? 1 : undefined,
                transition: isAnimatingImageName ? 'none' : undefined,
              }}
            >
              {exitingPokemon.sprites.front_default ? (
                <img
                  src={exitingPokemon.sprites.front_default}
                  alt={exitingPokemon.name}
                  className="w-full h-full object-contain"
                  style={{ color: 'transparent' }}
                />
              ) : null}
              <div
                className="text-3xs font-medium text-gray-900 capitalize text-center absolute bottom-0 left-0 right-0"
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
        <div className="h-[18px] overflow-hidden relative mt-1">
          {/* Entering types (current) */}
          <div
            ref={enteringRef}
            className="flex gap-[2px] justify-center items-center h-[14px]"
            style={{
              // Apply initial transform immediately in render to prevent flash
              transform: isAnimating
                ? 'translateY(calc(-100% - 2px))'
                : undefined,
              transition: isAnimating ? 'none' : undefined,
            }}
          >
            {pokemon.types && pokemon.types.length > 0
              ? pokemon.types.map(type => {
                  const typeKey = `${type.type.name}-${type.slot}`
                  return (
                    <div
                      key={typeKey}
                      className="inline-block h-full flex items-center"
                    >
                      <TypePill type={type.type} size="small" />
                    </div>
                  )
                })
              : null}
          </div>
          {/* Exiting types (previous) */}
          {exitingTypes.length > 0 && (
            <div
              ref={exitingRef}
              className="absolute top-0 left-0 right-0 flex gap-[5px] justify-center items-center h-[14px]"
              style={{
                // Apply initial transform immediately in render to prevent flash
                transform: isAnimating ? 'translateY(0)' : undefined,
                transition: isAnimating ? 'none' : undefined,
              }}
            >
              {exitingTypes.map(typeName => (
                <div
                  key={`exit-${typeName}`}
                  className="inline-block h-full flex items-center"
                >
                  <TypePill type={{ name: typeName }} size="small" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right side: Moves */}
      <div
        className="flex flex-col gap-1 justify-center flex-1"
        style={{
          opacity: isExpanded ? 1 : 0,
          transition: 'opacity 0.4s ease-in',
        }}
      >
        {pokemon &&
          moves.map((move, index) => (
            <div
              key={index}
              className="relative group/move"
              onClick={e => e.stopPropagation()}
            >
              <MovesCombobox
                key={index}
                value={move?.name}
                pokemonId={pokemon.id}
                onValueChange={(moveName, moveType) => {
                  if (!pokemon) return
                  const newMoves = [...moves]
                  newMoves[index] = moveName
                    ? { name: moveName, type: moveType || '' }
                    : null
                  setPokemonMoves(pokemon.id, newMoves)
                }}
                trigger={
                  <div
                    className={cn(
                      'text-2xs h-4 rounded cursor-pointer transition-colors flex items-center px-1 relative',
                      !move && 'bg-gray-200 hover:bg-gray-300',
                      !!move && 'hover:bg-gray-200'
                    )}
                    onClick={e => e.stopPropagation()}
                  >
                    {move ? (
                      <>
                        <span className="text-2xs text-gray-700 capitalize truncate pr-4">
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
                    className="absolute right-0.5 top-[50%] translate-y-[-50%] w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-opacity opacity-0 group-hover/move:opacity-100 z-10"
                    aria-label="Clear move"
                  >
                    <svg
                      className="w-4 h-4"
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
          ))}
      </div>
    </div>
  )
}

export default TeamPokemon
