import { useState, useEffect, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { usePokemonContext } from '../contexts/PokemonContext'
import AnimatedTypePills from './AnimatedTypePills'
import TypePill from './TypePill'
import {
  calculateTypeEffectiveness,
  typeEffectiveness,
} from '@/constants/types'

interface BattleInfoPokemonProps {
  top: number
}

const BattleInfoPokemon = ({ top }: BattleInfoPokemonProps) => {
  const { battleInfoPokemon, setBattleInfoPokemon } = usePokemonContext()
  const [rightOffset, setRightOffset] = useState<number | undefined>(undefined)

  // Calculate position to the left of PokemonTeam panel
  // Base right margins: mobile=16px, sm=24px, lg=32px
  const baseRight = { mobile: 16, sm: 24, lg: 32 }

  useEffect(() => {
    const updatePosition = () => {
      const width = window.innerWidth
      let baseMargin = baseRight.mobile
      if (width >= 1024) {
        baseMargin = baseRight.lg
      } else if (width >= 640) {
        baseMargin = baseRight.sm
      }
      // Position between PokemonTeam and right edge: just use base margin (closest to right edge)
      setRightOffset(baseMargin)
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    return () => window.removeEventListener('resize', updatePosition)
  }, [])

  // Format height and weight
  const heightInMeters = battleInfoPokemon ? battleInfoPokemon.height / 10 : 0
  const weightInKg = battleInfoPokemon ? battleInfoPokemon.weight / 10 : 0

  // Calculate offensive effectiveness (what this pokemon is strong/weak against when attacking)
  const { superEffective, notVeryEffective, noEffect } = useMemo(() => {
    if (!battleInfoPokemon || !battleInfoPokemon.types) {
      return { superEffective: [], notVeryEffective: [], noEffect: [] }
    }

    const pokemonTypes = battleInfoPokemon.types.map(t => t.type.name)
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
  }, [battleInfoPokemon])

  // Calculate defensive effectiveness (what types are strong/weak against this pokemon)
  const { weakTo, resists, immune } = useMemo(() => {
    if (!battleInfoPokemon || !battleInfoPokemon.types) {
      return { weakTo: [], resists: [], immune: [] }
    }

    const pokemonTypes = battleInfoPokemon.types.map(t => t.type.name)
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
  }, [battleInfoPokemon])

  return (
    <AnimatePresence mode="wait">
      {battleInfoPokemon && (
        <motion.div
          key="battle-info-panel"
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            top: `${top}px`,
            right: `${rightOffset}px`,
            width: '300px',
            zIndex: 40,
          }}
        >
          <div className="bg-white/80 backdrop-blur-xl shadow-lg border border-gray-200/50 rounded-xl p-2 relative">
            {/* Close button - top right */}
            <button
              onClick={() => setBattleInfoPokemon(null)}
              className="absolute top-1 left-1 w-6 h-6 flex items-center justify-center hover:bg-red-100 rounded-lg transition-colors z-10"
              aria-label="Close battle info"
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
            <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
              {/* Pokemon Image */}
              <div className="text-center">
                {battleInfoPokemon.sprites.other?.['official-artwork']
                  ?.front_default ? (
                  <img
                    src={
                      battleInfoPokemon.sprites.other['official-artwork']
                        .front_default
                    }
                    alt={battleInfoPokemon.name}
                    className="w-32 h-32 mx-auto object-contain"
                  />
                ) : battleInfoPokemon.sprites.front_default ? (
                  <img
                    src={battleInfoPokemon.sprites.front_default}
                    alt={battleInfoPokemon.name}
                    className="w-32 h-32 mx-auto object-contain"
                  />
                ) : null}
              </div>

              {/* Name and Number */}
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 capitalize">
                  <span className="text-sm text-gray-500">
                    #{battleInfoPokemon.pokedexNumber}
                  </span>{' '}
                  {battleInfoPokemon.name}
                </h3>
              </div>

              {/* Types */}
              <div>
                <AnimatedTypePills types={battleInfoPokemon.types} />
              </div>

              {/* Offensive Effectiveness */}
              {(superEffective.length > 0 ||
                notVeryEffective.length > 0 ||
                noEffect.length > 0) && (
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">
                    (Offensive)
                  </p>

                  {/* Super Effective */}
                  {superEffective.length > 0 && (
                    <div className="mb-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        <svg
                          className="w-3 h-3 text-gray-600"
                          viewBox="0 0 12 12"
                          fill="none"
                        >
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
                        <p className="text-xs text-gray-600">Strong against</p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {superEffective.map(typeName => (
                          <TypePill
                            key={typeName}
                            type={{ name: typeName }}
                            size="small"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Not Very Effective */}
                  {notVeryEffective.length > 0 && (
                    <div className="mb-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        <svg
                          className="w-3 h-3 text-gray-600"
                          viewBox="0 0 12 12"
                          fill="none"
                        >
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
                        <p className="text-xs text-gray-600">Weak against</p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {notVeryEffective.map(typeName => (
                          <TypePill
                            key={typeName}
                            type={{ name: typeName }}
                            size="small"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No Effect */}
                  {noEffect.length > 0 && (
                    <div className="mb-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        <svg
                          className="w-3 h-3 text-gray-700"
                          viewBox="0 0 12 12"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        >
                          <path d="M2 2 L10 10 M10 2 L2 10" />
                        </svg>
                        <p className="text-xs text-gray-600">No Effect</p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {noEffect.map(typeName => (
                          <TypePill
                            key={typeName}
                            type={{ name: typeName }}
                            size="small"
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
                  <p className="text-xs font-semibold text-gray-700 mb-2">
                    (Defensive)
                  </p>

                  {/* Weak To */}
                  {weakTo.length > 0 && (
                    <div className="mb-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        <svg
                          className="w-3 h-3 text-gray-600"
                          viewBox="0 0 12 12"
                          fill="none"
                        >
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
                        <p className="text-xs text-gray-600">Weak To</p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {weakTo.map(typeName => (
                          <TypePill
                            key={typeName}
                            type={{ name: typeName }}
                            size="small"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resists */}
                  {resists.length > 0 && (
                    <div className="mb-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        <svg
                          className="w-3 h-3 text-gray-600"
                          viewBox="0 0 12 12"
                          fill="none"
                        >
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
                        <p className="text-xs text-gray-600">Resists</p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {resists.map(typeName => (
                          <TypePill
                            key={typeName}
                            type={{ name: typeName }}
                            size="small"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Immune */}
                  {immune.length > 0 && (
                    <div className="mb-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        <svg
                          className="w-3 h-3 text-gray-700"
                          viewBox="0 0 12 12"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        >
                          <path d="M2 2 L10 10 M10 2 L2 10" />
                        </svg>
                        <p className="text-xs text-gray-600">Immune</p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {immune.map(typeName => (
                          <TypePill
                            key={typeName}
                            type={{ name: typeName }}
                            size="small"
                          />
                        ))}
                      </div>
                    </div>
                  )}
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
                    {battleInfoPokemon.base_experience}
                  </p>
                </div>
              </div>

              {/* Base Stats */}
              <div>
                <p className="text-xs text-gray-600 mb-2">Base Stats</p>
                <div className="space-y-2">
                  {battleInfoPokemon.stats.map(stat => (
                    <div key={stat.stat.name}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-700 capitalize">
                          {stat.stat.name.replace('-', ' ')}
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
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default BattleInfoPokemon
