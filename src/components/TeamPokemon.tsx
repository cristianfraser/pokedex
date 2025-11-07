import { useLayoutEffect, useRef, useState } from 'react'
import { PokemonDetail } from '../queries/pokemon'
import TypePill from './TypePill'

interface TeamPokemonProps {
  pokemon: PokemonDetail | null
  position: number
  isSelected: boolean
  onSelect: () => void
  onRemove: () => void
}

const TeamPokemon = ({
  pokemon,
  position: _position,
  isSelected,
  onSelect,
  onRemove,
}: TeamPokemonProps) => {
  const [exitingTypes, setExitingTypes] = useState<string[]>([])
  const [isAnimating, setIsAnimating] = useState(false)
  const enteringRef = useRef<HTMLDivElement>(null)
  const exitingRef = useRef<HTMLDivElement>(null)
  const previousPokemonRef = useRef<PokemonDetail | null>(null)

  // Use useLayoutEffect to set exiting types synchronously before paint
  useLayoutEffect(() => {
    if (pokemon && previousPokemonRef.current) {
      const enteringTypes = pokemon.types.map(t => t.type.name)
      const previousTypesArray = previousPokemonRef.current.types.map(
        t => t.type.name
      )

      // Check if types changed
      const typesChanged =
        previousTypesArray.length !== enteringTypes.length ||
        !previousTypesArray.every(
          (type, index) => type === enteringTypes[index]
        )

      if (typesChanged && previousTypesArray.length > 0) {
        // Types changed: set previous types as exiting synchronously
        setExitingTypes([...previousTypesArray])
        setIsAnimating(true)
      } else if (!typesChanged) {
        // Types are the same, clear exiting
        setExitingTypes([])
        setIsAnimating(false)
      }
    } else if (!pokemon) {
      // No pokemon
      setExitingTypes([])
      setIsAnimating(false)
    }

    // Update ref for next render
    previousPokemonRef.current = pokemon
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
      }
    }
  }, [isAnimating, exitingTypes])
  if (!pokemon) {
    return (
      <div
        onClick={onSelect}
        className={`bg-gray-100 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-colors ${
          isSelected
            ? 'border-primary-600 bg-primary-50'
            : 'border-gray-200 hover:border-gray-300'
        }`}
        style={{ aspectRatio: '0.85' }}
      >
        <div className="text-gray-400 text-xs">Empty</div>
      </div>
    )
  }

  return (
    <div
      onClick={onSelect}
      className={`group bg-gray-100 rounded-lg border-2 flex flex-col relative cursor-pointer transition-colors overflow-hidden ${
        isSelected
          ? 'border-primary-600 bg-primary-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
      style={{ aspectRatio: '0.85' }}
    >
      {/* Delete button - top right */}
      <button
        onClick={e => {
          e.stopPropagation()
          onRemove()
        }}
        className="absolute top-0 right-0 w-6 h-6 flex items-center justify-center hover:bg-red-100 rounded-bl-lg transition-opacity opacity-0 group-hover:opacity-100 z-10"
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

      {/* Image and Name container - top left */}
      <div style={{ transform: 'translateY(-20%)' }}>
        <div className="flex items-center gap-2">
          {pokemon.sprites.front_default ? (
            <img
              src={pokemon.sprites.front_default}
              alt={pokemon.name}
              className="w-12 h-12 object-contain"
            />
          ) : (
            <div className="w-12 h-12 flex items-center justify-center bg-gray-200 rounded text-gray-400 text-lg">
              {pokemon.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div
            className="text-xs font-medium text-gray-900 capitalize"
            style={{ transform: 'translateX(-15px)' }}
          >
            {pokemon.name}
          </div>
        </div>

        <div className="h-[18px] overflow-hidden relative">
          {/* Entering types (current) */}
          <div
            ref={enteringRef}
            className="flex flex-wrap gap-[5px] justify-center items-center h-[14px]"
            style={{
              // Apply initial transform immediately in render to prevent flash
              transform:
                isAnimating && exitingTypes.length > 0
                  ? 'translateY(calc(-100% - 2px))'
                  : undefined,
              transition:
                isAnimating && exitingTypes.length > 0 ? 'none' : undefined,
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
              className="absolute top-0 left-0 right-0 flex flex-wrap gap-[5px] justify-center items-center h-[14px]"
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

      {/* 4 segments below name */}
      <div className="flex flex-col gap-1 mt-0 w-full">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
      </div>
    </div>
  )
}

export default TeamPokemon
