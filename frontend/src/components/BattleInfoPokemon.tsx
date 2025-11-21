import { useMemo, useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { usePokemonContext } from '../contexts/PokemonContext'
import AnimatedTypePills from './AnimatedTypePills'
import TypePill from './TypePill'
import {
  calculateTypeEffectiveness,
  typeEffectiveness,
} from '@/constants/types'
import { PokemonCombobox } from './PokemonCombobox'
import { usePokemonById } from '../queries/pokemon'

interface BattleInfoPokemonProps {}

const BattleInfoPokemon = ({}: BattleInfoPokemonProps) => {
  const {
    battleInfoPokemon,
    setBattleInfoPokemon,
    setHoveredDefensiveTypes,
    setHoveredOffensiveTypes,
  } = usePokemonContext()
  const [selectedPokemonId, setSelectedPokemonId] = useState<number | null>(
    battleInfoPokemon?.id ?? null
  )
  const { data: newPokemon, isLoading: isLoadingNewPokemon } =
    usePokemonById(selectedPokemonId)

  // Sync selectedPokemonId with battleInfoPokemon when it changes externally
  useEffect(() => {
    if (battleInfoPokemon?.id !== selectedPokemonId) {
      setSelectedPokemonId(battleInfoPokemon?.id ?? null)
    }
  }, [battleInfoPokemon?.id])

  // Update battleInfoPokemon when new pokemon is loaded
  useEffect(() => {
    if (newPokemon && selectedPokemonId === newPokemon.id) {
      setBattleInfoPokemon(newPokemon)
    }
  }, [newPokemon, selectedPokemonId, setBattleInfoPokemon])

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
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 250, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeIn' }}
        >
          <div
            style={{ width: 250 }}
            className={`h-full overflow-y-auto bg-white/80 border border-gray-200 rounded-md p-2 relative transition-opacity ${
              isLoadingNewPokemon ? 'opacity-50' : 'opacity-100'
            }`}
          >
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
            <div>
              {/* Pokemon Image */}
              <motion.div
                key={`pokemon-info-${battleInfoPokemon.id}`}
                className="flex items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex-shrink-0">
                  {battleInfoPokemon.sprites.front_default ? (
                    <img
                      src={battleInfoPokemon.sprites.front_default}
                      alt={battleInfoPokemon.name}
                      className="w-24 h-24 object-contain"
                    />
                  ) : null}
                </div>
                {/* Name and Number */}
                <PokemonCombobox
                  value={battleInfoPokemon.id}
                  onValueChange={pokemonId => {
                    setSelectedPokemonId(pokemonId)
                  }}
                  trigger={
                    <div
                      className="text-left relative -ml-4 cursor-pointer hover:opacity-80 transition-opacity"
                      style={{
                        boxShadow: '-16px 0px 20px 14px rgb(255 255 255)',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      }}
                    >
                      <p className="text-sm text-gray-500">
                        #{battleInfoPokemon.pokedexNumber}
                      </p>
                      <h3 className="text-sm font-bold text-gray-900 capitalize">
                        {battleInfoPokemon.name}
                      </h3>
                    </div>
                  }
                />
              </motion.div>
              {/* Types */}
              <div className="width-full -mt-1">
                <AnimatedTypePills types={battleInfoPokemon.types} />
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
                              onMouseLeave={() => setHoveredOffensiveTypes([])}
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
                              onMouseEnter={() =>
                                setHoveredOffensiveTypes([typeName])
                              }
                              onMouseLeave={() => setHoveredOffensiveTypes([])}
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
                              onMouseEnter={() =>
                                setHoveredOffensiveTypes([typeName])
                              }
                              onMouseLeave={() => setHoveredOffensiveTypes([])}
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
                      onMouseEnter={() => setHoveredDefensiveTypes(weakTo)}
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
                          onMouseEnter={() => setHoveredDefensiveTypes([])}
                          onMouseLeave={() => setHoveredDefensiveTypes([])}
                        />
                      )}
                    </div>
                  </div>

                  {/* Resists */}
                  <div className="mb-2">
                    <div
                      className="flex items-center gap-1.5 mb-1 hover:bg-gray-100"
                      onMouseEnter={() => setHoveredDefensiveTypes(resists)}
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
                          onMouseEnter={() => setHoveredDefensiveTypes([])}
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
                          immune.length > 0 ? immune : []
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
                          onMouseEnter={() => setHoveredDefensiveTypes([])}
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
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default BattleInfoPokemon
