import { useMemo, useState, useEffect, useRef, forwardRef } from 'react'
import { PokemonDetail, usePokemonById } from '../queries/pokemon'
import { AnimatePresence, motion, Target } from 'framer-motion'
import { useStyle } from '../contexts/StyleContext'
import AnimatedTypePills from './AnimatedTypePills'
import TypePill from './TypePill'
import {
  calculateTypeEffectiveness,
  typeEffectiveness,
  NONE_TYPE_MARKER,
} from '@/constants/types'
import { PokemonCombobox } from './PokemonCombobox'
import { cn } from '@/lib/utils'
import {
  DeleteIcon,
  SuperEffectiveIcon,
  NotVeryEffectiveIcon,
  ImmuneIcon,
} from './icons'

interface BattleInfoPokemonProps {
  battleInfoPokemonId: number | null
  setBattleInfoPokemonId: (pokemonId: number | null) => void
  battleInfoPokemon: PokemonDetail | null
  isLoadingBattleInfoPokemon: boolean
  setHoveredDefensiveTypes: (types: string[]) => void
  setHoveredOffensiveTypes: (types: string[]) => void
  battleInfoPokemonHistory: (number | null)[]
  skipInitialAnimation?: boolean
  hideCloseButton?: boolean
}

const BattleInfoPokemon = ({
  battleInfoPokemonId,
  setBattleInfoPokemonId,
  battleInfoPokemon,
  isLoadingBattleInfoPokemon,
  setHoveredDefensiveTypes,
  setHoveredOffensiveTypes,
  battleInfoPokemonHistory,
  skipInitialAnimation = false,
  hideCloseButton = false,
}: BattleInfoPokemonProps) => {
  const { isMobile } = useStyle()
  const [displayedPokemon, setDisplayedPokemon] =
    useState<PokemonDetail | null>(battleInfoPokemon || null)

  useEffect(() => {
    if (battleInfoPokemon) {
      setDisplayedPokemon(battleInfoPokemon)
    } else if (!battleInfoPokemonId) {
      // Clear displayed pokemon when battleInfoPokemonId is null
      setDisplayedPokemon(null)
    }
  }, [battleInfoPokemon, battleInfoPokemonId])

  // Format height and weight
  const heightInMeters = displayedPokemon ? displayedPokemon.height / 10 : 0
  const weightInKg = displayedPokemon ? displayedPokemon.weight / 10 : 0

  // Calculate offensive effectiveness (what this pokemon is strong/weak against when attacking)
  const { superEffective, notVeryEffective, noEffect } = useMemo(() => {
    if (!displayedPokemon || !displayedPokemon.types) {
      return { superEffective: [], notVeryEffective: [], noEffect: [] }
    }

    const pokemonTypes = displayedPokemon.types.map(t => t.type.name)
    const superEffectiveList: string[] = []
    const notVeryEffectiveList: string[] = []
    const noEffectList: string[] = []

    // Get all possible defending types
    const allTypes = Object.keys(typeEffectiveness)

    // For each possible defending type, calculate combined effectiveness
    for (const defendingType of allTypes) {
      let combinedEffectiveness = 1

      // Calculate effectiveness for each of the pokemon's types
      for (const attackingType of pokemonTypes) {
        const effectiveness = calculateTypeEffectiveness(attackingType, [
          defendingType,
        ])
        combinedEffectiveness *= effectiveness
      }

      // Categorize based on final effectiveness
      if (combinedEffectiveness === 0) {
        noEffectList.push(defendingType)
      } else if (combinedEffectiveness < 1) {
        // Any value less than 1 (0.25, 0.5) is not very effective
        notVeryEffectiveList.push(defendingType)
      } else if (combinedEffectiveness > 1) {
        // Any value greater than 1 (2, 4) is super effective
        superEffectiveList.push(defendingType)
      }
      // If effectiveness is exactly 1, it's normal - don't add to any list
    }

    return {
      superEffective: superEffectiveList.sort(),
      notVeryEffective: notVeryEffectiveList.sort(),
      noEffect: noEffectList.sort(),
    }
  }, [displayedPokemon])

  // Calculate defensive effectiveness (what types are strong/weak against this pokemon)
  const { weakTo, resists, immune } = useMemo(() => {
    if (!displayedPokemon || !displayedPokemon.types) {
      return { weakTo: [], resists: [], immune: [] }
    }

    const pokemonTypes = displayedPokemon.types.map(t => t.type.name)
    const weakToList: string[] = []
    const resistsList: string[] = []
    const immuneList: string[] = []

    // Get all possible attacking types
    const allTypes = Object.keys(typeEffectiveness)

    // For each possible attacking type, calculate combined effectiveness against this pokemon
    for (const attackingType of allTypes) {
      const combinedEffectiveness = calculateTypeEffectiveness(
        attackingType,
        pokemonTypes
      )

      // Categorize based on final effectiveness
      if (combinedEffectiveness === 0) {
        immuneList.push(attackingType)
      } else if (combinedEffectiveness < 1) {
        // Any value less than 1 (0.25, 0.5) is a resistance
        resistsList.push(attackingType)
      } else if (combinedEffectiveness > 1) {
        // Any value greater than 1 (2, 4) is a weakness
        weakToList.push(attackingType)
      }
      // If effectiveness is exactly 1, it's normal - don't add to any list
    }

    return {
      weakTo: weakToList.sort(),
      resists: resistsList.sort(),
      immune: immuneList.sort(),
    }
  }, [displayedPokemon])

  // Reorder stats for display: [hp, special-attack, attack, special-defense, defense, speed]
  // Original order: [hp, attack, defense, special-attack, special-defense, speed]
  // New order indices: [0, 3, 1, 4, 2, 5]
  const reorderedStats = useMemo(() => {
    if (!displayedPokemon || !displayedPokemon.stats) return []
    return [
      displayedPokemon.stats[0], // hp
      displayedPokemon.stats[3], // special-attack
      displayedPokemon.stats[1], // attack
      displayedPokemon.stats[4], // special-defense
      displayedPokemon.stats[2], // defense
      displayedPokemon.stats[5], // speed
    ]
  }, [displayedPokemon?.stats])

  const ref = useRef<HTMLDivElement>(null)
  const [finalWidth, setFinalWidth] = useState(188)
  const historyRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let rafId: number | null = null
    let debounceTimer: ReturnType<typeof setTimeout> | null = null

    const handleResize = () => {
      // Clear existing debounce timer
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }

      // Debounce the resize event
      debounceTimer = setTimeout(() => {
        // Cancel any pending RAF
        if (rafId !== null) {
          cancelAnimationFrame(rafId)
        }

        // Schedule with requestAnimationFrame
        rafId = requestAnimationFrame(() => {
          setFinalWidth(188)
          rafId = null
        })
      }, 150) // 150ms debounce
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [])

  return (
    <AnimatePresence mode="wait">
      {displayedPokemon && (
        <motion.div
          key="battle-info-panel"
          initial={
            skipInitialAnimation
              ? { width: 250, opacity: 1 }
              : { width: 0, opacity: 0 }
          }
          animate={{ width: 250, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeIn' }}
          onAnimationStart={(definition: Target) => {
            if (definition.width === 0) {
              historyRef.current!.style.minWidth =
                historyRef.current!.clientWidth + 'px'
            }
          }}
          onAnimationComplete={() => {
            if (ref.current!.offsetWidth > 50 && displayedPokemon) {
              setFinalWidth(isMobile ? 188 : ref.current!.clientWidth)
            }
          }}
          className="flex flex-col gap-1"
        >
          <div className="relative overflow-hidden">
            <div
              className="flex flex-nowrap h-full"
              style={{ minHeight: 28 }}
              ref={historyRef}
            >
              <AnimatePresence mode="popLayout">
                {[...battleInfoPokemonHistory]
                  .reverse()
                  // .slice(0, 6) // Ensure max 6 items are rendered
                  .map((pokemonId, index) => (
                    <HistoryCircle
                      key={
                        pokemonId !== null
                          ? `pokemon-${pokemonId}`
                          : `empty-${index}`
                      }
                      pokemonId={pokemonId}
                      onClick={() => {
                        if (pokemonId !== null) {
                          setBattleInfoPokemonId(pokemonId)
                        }
                      }}
                    />
                  ))}
              </AnimatePresence>
            </div>
          </div>
          <div style={{ display: 'flex' }}>
            <div
              style={{
                minWidth: finalWidth > 50 ? finalWidth : 'unset',
                flexGrow: 1,
              }}
              ref={ref}
              className={`h-full overflow-y-auto bg-white/80 border border-gray-200 rounded-md p-2 relative transition-opacity ${
                isLoadingBattleInfoPokemon ? 'opacity-50' : 'opacity-100'
              }`}
            >
              {/* Close button - top right */}
              {!hideCloseButton && (
                <button
                  onClick={() => setBattleInfoPokemonId(null)}
                  className="absolute top-1 left-1 w-6 h-6 flex items-center justify-center hover:bg-red-100 rounded-lg transition-colors z-10"
                  aria-label="Close battle info"
                >
                  <DeleteIcon className="w-4 h-4 text-red-600" />
                </button>
              )}
              <div>
                {/* Pokemon Image */}
                <motion.div
                  key={`pokemon-info-${displayedPokemon.id}`}
                  className="flex items-center relative"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex-shrink-0">
                    {displayedPokemon.sprites.front_default ? (
                      <img
                        src={displayedPokemon.sprites.front_default}
                        alt={displayedPokemon.name}
                        className="w-20 h-24 sm:w-24 -ml-2 object-contain"
                        style={{ color: 'transparent', fontSize: 0 }}
                      />
                    ) : null}
                  </div>
                  {/* Name and Number */}
                  <PokemonCombobox
                    value={displayedPokemon?.id ?? null}
                    onValueChange={pokemonId => {
                      setBattleInfoPokemonId(pokemonId)
                    }}
                    trigger={
                      <div
                        className="text-left relative cursor-pointer hover:opacity-80 transition-opacity"
                        style={{
                          boxShadow: '-5px 0px 20px 14px rgb(255 255 255)',
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          position: 'absolute',
                          left: '50%',
                          top: '50%',
                          transform: 'translate(-50%, -50%)',
                          height: 60,
                        }}
                      >
                        <p className="text-sm text-gray-500">
                          #{displayedPokemon.pokedexNumber}
                        </p>
                        <h3 className="text-sm font-bold text-gray-900 capitalize">
                          {displayedPokemon.name}
                        </h3>
                      </div>
                    }
                  />
                </motion.div>
                {/* Types */}
                <div className="width-full -mt-2">
                  <AnimatedTypePills types={displayedPokemon.types} />
                </div>

                {/* Offensive Effectiveness */}
                {(superEffective.length > 0 ||
                  notVeryEffective.length > 0 ||
                  noEffect.length > 0) &&
                  false && (
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-2">
                        (Offensive)
                      </p>

                      {/* Super Effective */}
                      {superEffective.length > 0 && (
                        <div className="mb-2">
                          <div
                            className="flex items-center gap-1.5 mb-1"
                            onMouseEnter={() =>
                              setHoveredOffensiveTypes(superEffective)
                            }
                            onMouseLeave={() => setHoveredOffensiveTypes([])}
                          >
                            <SuperEffectiveIcon className="w-3 h-3 text-gray-600" />
                            <p className="text-xs text-gray-600">
                              Strong against
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {superEffective.map(typeName => (
                              <TypePill
                                key={typeName}
                                type={{ name: typeName }}
                                size="small"
                                onMouseEnter={() =>
                                  setHoveredOffensiveTypes([typeName])
                                }
                                onMouseLeave={() =>
                                  setHoveredOffensiveTypes([])
                                }
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Not Very Effective */}
                      {notVeryEffective.length > 0 && (
                        <div className="mb-2">
                          <div
                            className="flex items-center gap-1.5 mb-1"
                            onMouseEnter={() =>
                              setHoveredOffensiveTypes(notVeryEffective)
                            }
                            onMouseLeave={() => setHoveredOffensiveTypes([])}
                          >
                            <NotVeryEffectiveIcon className="w-3 h-3 text-gray-600" />
                            <p className="text-xs text-gray-600">
                              Weak against
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {notVeryEffective.map(typeName => (
                              <TypePill
                                key={typeName}
                                type={{ name: typeName }}
                                size="small"
                                onMouseEnter={() =>
                                  setHoveredOffensiveTypes([typeName])
                                }
                                onMouseLeave={() =>
                                  setHoveredOffensiveTypes([])
                                }
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* No Effect */}
                      {noEffect.length > 0 && (
                        <div className="mb-2">
                          <div
                            className="flex items-center gap-1.5 mb-1"
                            onMouseEnter={() =>
                              setHoveredOffensiveTypes(noEffect)
                            }
                            onMouseLeave={() => setHoveredOffensiveTypes([])}
                          >
                            <ImmuneIcon className="w-3 h-3 text-gray-700" />
                            <p className="text-xs text-gray-600">No Effect</p>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {noEffect.map(typeName => (
                              <TypePill
                                key={typeName}
                                type={{ name: typeName }}
                                size="small"
                                onMouseEnter={() =>
                                  setHoveredOffensiveTypes([typeName])
                                }
                                onMouseLeave={() =>
                                  setHoveredOffensiveTypes([])
                                }
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                {/* Defensive Effectiveness */}
                {(weakTo.length > 0 ||
                  resists.length > 0 ||
                  immune.length > 0) && (
                  <div>
                    {/* Weak To */}
                    <div className="mb-2">
                      <div
                        className="flex items-center gap-1.5 mb-1 hover:bg-gray-100"
                        onMouseEnter={() =>
                          setHoveredDefensiveTypes(
                            weakTo.length > 0 ? weakTo : [NONE_TYPE_MARKER]
                          )
                        }
                        onMouseLeave={() => setHoveredDefensiveTypes([])}
                      >
                        <p className="text-xs text-gray-600 rounded px-1 py-0.5 transition-colors">
                          Weak To
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {weakTo.length > 0 ? (
                          weakTo.map(typeName => (
                            <TypePill
                              key={typeName}
                              type={{ name: typeName }}
                              size="small"
                              onMouseEnter={() =>
                                setHoveredDefensiveTypes([typeName])
                              }
                              onMouseLeave={() => setHoveredDefensiveTypes([])}
                            />
                          ))
                        ) : (
                          <TypePill
                            type={{ name: 'none' }}
                            size="small"
                            onMouseEnter={() =>
                              setHoveredDefensiveTypes([NONE_TYPE_MARKER])
                            }
                            onMouseLeave={() => setHoveredDefensiveTypes([])}
                          />
                        )}
                      </div>
                    </div>

                    {/* Resists */}
                    <div className="mb-2">
                      <div
                        className="flex items-center gap-1.5 mb-1 hover:bg-gray-100"
                        onMouseEnter={() =>
                          setHoveredDefensiveTypes(
                            resists.length > 0 ? resists : [NONE_TYPE_MARKER]
                          )
                        }
                        onMouseLeave={() => setHoveredDefensiveTypes([])}
                      >
                        <p className="text-xs text-gray-600 rounded px-1 py-0.5 transition-colors">
                          Resists
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {resists.length > 0 ? (
                          resists.map(typeName => (
                            <TypePill
                              key={typeName}
                              type={{ name: typeName }}
                              size="small"
                              onMouseEnter={() =>
                                setHoveredDefensiveTypes([typeName])
                              }
                              onMouseLeave={() => setHoveredDefensiveTypes([])}
                            />
                          ))
                        ) : (
                          <TypePill
                            type={{ name: 'none' }}
                            size="small"
                            onMouseEnter={() =>
                              setHoveredDefensiveTypes([NONE_TYPE_MARKER])
                            }
                            onMouseLeave={() => setHoveredDefensiveTypes([])}
                          />
                        )}
                      </div>
                    </div>

                    {/* Immune */}
                    <div className="mb-2">
                      <div
                        className="flex items-center gap-1.5 mb-1 hover:bg-gray-100"
                        onMouseEnter={() =>
                          setHoveredDefensiveTypes(
                            immune.length > 0 ? immune : [NONE_TYPE_MARKER]
                          )
                        }
                        onMouseLeave={() => setHoveredDefensiveTypes([])}
                      >
                        <p className="text-xs text-gray-600 rounded px-1 py-0.5 transition-colors">
                          Immune
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {immune.length > 0 ? (
                          immune.map(typeName => (
                            <TypePill
                              key={typeName}
                              type={{ name: typeName }}
                              size="small"
                              onMouseEnter={() =>
                                setHoveredDefensiveTypes([typeName])
                              }
                              onMouseLeave={() => setHoveredDefensiveTypes([])}
                            />
                          ))
                        ) : (
                          <TypePill
                            type={{ name: 'none' }}
                            size="small"
                            onMouseEnter={() =>
                              setHoveredDefensiveTypes([NONE_TYPE_MARKER])
                            }
                            onMouseLeave={() => setHoveredDefensiveTypes([])}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Physical Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-gray-50 rounded p-2 text-center">
                    <p className="text-xs text-gray-600">Height</p>
                    <p className="text-sm font-semibold">{heightInMeters}m</p>
                  </div>
                  <div className="bg-gray-50 rounded p-2 text-center">
                    <p className="text-xs text-gray-600">Weight</p>
                    <p className="text-sm font-semibold">{weightInKg}kg</p>
                  </div>
                  <div className="bg-gray-50 rounded p-2 text-center">
                    <p className="text-xs text-gray-600">Base Exp</p>
                    <p className="text-sm font-semibold">
                      {displayedPokemon.base_experience}
                    </p>
                  </div>
                </div>

                {/* Base Stats */}
                <div>
                  <p className="text-xs text-gray-600 mb-2">Base Stats</p>
                  <div className="grid grid-cols-2 gap-2">
                    {reorderedStats.map(stat => (
                      <div key={stat.stat.name}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-gray-700 capitalize">
                            {stat.stat.short_name ||
                              stat.stat.name.replace('-', ' ')}
                          </span>
                          <span className="text-xs font-semibold text-gray-900">
                            {stat.base_stat}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-primary-600 h-1.5 rounded-full"
                            style={{
                              width: `${Math.min((stat.base_stat / 255) * 100, 100)}%`,
                              transition: 'width 200ms ease-in-out',
                              willChange: 'width',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Component for displaying a single history circle
const HistoryCircle = forwardRef<
  HTMLDivElement,
  {
    pokemonId: number | null
    onClick: () => void
  }
>(({ pokemonId, onClick }, ref) => {
  const { data: pokemon } = usePokemonById(pokemonId)

  return (
    <motion.div
      layout
      // layoutId={pokemonId !== null ? `history-${pokemonId}` : undefined}
      initial={{
        transform: 'translateX(105%)',
        width: 'calc((100% - 1.25rem) / 6)',
        opacity: 0,
        marginRight: '0.25rem',
      }}
      animate={{
        transform: 'translateX(0)',
        width: 'calc((100% - 1.25rem) / 6)',
        opacity: 1,
        marginRight: '0.25rem',
      }}
      exit={{ width: 0, opacity: 0, marginRight: 0 }}
      transition={{ duration: 0.3, ease: 'easeIn' }}
      style={{
        width: 'calc((100% - 1.25rem) / 6)',
        minWidth: 0,
        flexShrink: 0,
        overflow: 'hidden',
        marginRight: '0.25rem',
        boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.1)',
      }}
      className={cn(
        'h-full rounded-full relative overflow-hidden',
        !pokemonId && 'bg-gray-100',
        pokemonId && 'cursor-pointer bg-gray-200 hover:bg-gray-300'
      )}
      onClick={onClick}
    >
      <div ref={ref}>
        {pokemon?.sprites.front_default ? (
          <img
            src={pokemon.sprites.front_default}
            alt={pokemon.name}
            className="w-full object-contain"
            style={{ color: 'transparent', fontSize: 0 }}
          />
        ) : (
          <img
            src={'/pokemon/0001-bulbasaur-front-default.png'}
            alt="empty"
            className="w-full h-full object-contain"
            style={{ opacity: 0 }}
          />
        )}
      </div>
    </motion.div>
  )
})

HistoryCircle.displayName = 'HistoryCircle'

export default BattleInfoPokemon
