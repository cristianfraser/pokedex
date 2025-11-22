// Special marker for "none" type hover state (when no types apply)
export const NONE_TYPE_MARKER = '__NONE__'

// Type colors for visual representation
export const typeColors: Record<string, string> = {
  normal: '#a8a878',
  fighting: '#c03028',
  flying: '#a890f0',
  poison: '#a040a0',
  ground: '#e0c068',
  rock: '#b8a038',
  bug: '#a8b820',
  ghost: '#705898',
  steel: '#b8b8d0',
  fire: '#f08030',
  water: '#6890f0',
  grass: '#78c850',
  electric: '#f8d030',
  psychic: '#f85888',
  ice: '#98d8d8',
  dragon: '#7038f8',
  dark: '#705848',
  fairy: '#ee99ac',
  unknown: '#68a090',
  shadow: '#604e82',
  none: '#6b7280', // Neutral dark gray
}

// Helper function to darken a hex color
function darkenColor(hex: string, factor: number = 0.75): string {
  // Remove # if present
  hex = hex.replace('#', '')

  // Parse RGB
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  // Darken by factor
  const darkenedR = Math.round(r * factor)
  const darkenedG = Math.round(g * factor)
  const darkenedB = Math.round(b * factor)

  // Convert back to hex
  const toHex = (n: number) => {
    const hex = n.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  return `#${toHex(darkenedR)}${toHex(darkenedG)}${toHex(darkenedB)}`
}

// Darker versions of type colors for hover states
export const typeColorsDark: Record<string, string> = Object.fromEntries(
  Object.entries(typeColors).map(([key, value]) => [key, darkenColor(value)])
) as Record<string, string>

// Type letters for icon representation
export const typeLetters: Record<string, string> = {
  ground: 'a',
  bug: 'b',
  normal: 'c',
  dark: 'd',
  fighting: 'f',
  grass: 'g',
  ghost: 'h',
  ice: 'i',
  rock: 'k',
  electric: 'l',
  steel: 'm',
  dragon: 'n',
  poison: 'o',
  psychic: 'p',
  fire: 'r',
  flying: 'v',
  water: 'w',
  fairy: 'y',
  none: 'x',
}

// Type effectiveness matrix
// Key: attacking type, Value: object with defending types and their effectiveness multipliers
// 2 = super effective (2x damage)
// 1 = normal effectiveness (1x damage)
// 0.5 = not very effective (0.5x damage)
// 0 = no effect (immune, 0x damage)
export const typeEffectiveness: Record<string, Record<string, number>> = {
  normal: {
    rock: 0.5,
    ghost: 0,
    steel: 0.5,
  },
  fighting: {
    normal: 2,
    flying: 0.5,
    poison: 0.5,
    rock: 2,
    bug: 0.5,
    ghost: 0,
    steel: 2,
    psychic: 0.5,
    ice: 2,
    dark: 2,
    fairy: 0.5,
  },
  flying: {
    fighting: 2,
    rock: 0.5,
    bug: 2,
    steel: 0.5,
    grass: 2,
    electric: 0.5,
  },
  poison: {
    poison: 0.5,
    ground: 0.5,
    rock: 0.5,
    ghost: 0.5,
    steel: 0,
    grass: 2,
    fairy: 2,
  },
  ground: {
    flying: 0,
    poison: 2,
    rock: 2,
    bug: 0.5,
    steel: 2,
    fire: 2,
    grass: 0.5,
    electric: 2,
  },
  rock: {
    fighting: 0.5,
    flying: 2,
    ground: 0.5,
    bug: 2,
    steel: 0.5,
    fire: 2,
    ice: 2,
  },
  bug: {
    fighting: 0.5,
    flying: 0.5,
    poison: 0.5,
    ghost: 0.5,
    steel: 0.5,
    fire: 0.5,
    grass: 2,
    psychic: 2,
    dark: 2,
    fairy: 0.5,
  },
  ghost: {
    normal: 0,
    ghost: 2,
    psychic: 2,
    dark: 0.5,
  },
  steel: {
    rock: 2,
    steel: 0.5,
    fire: 0.5,
    water: 0.5,
    electric: 0.5,
    ice: 2,
    fairy: 2,
  },
  fire: {
    rock: 0.5,
    bug: 2,
    steel: 2,
    fire: 0.5,
    water: 0.5,
    grass: 2,
    ice: 2,
    dragon: 0.5,
  },
  water: {
    ground: 2,
    rock: 2,
    fire: 2,
    water: 0.5,
    grass: 0.5,
    dragon: 0.5,
  },
  grass: {
    flying: 0.5,
    poison: 0.5,
    ground: 2,
    rock: 2,
    bug: 0.5,
    steel: 0.5,
    fire: 0.5,
    water: 2,
    grass: 0.5,
    dragon: 0.5,
  },
  electric: {
    flying: 2,
    ground: 0,
    water: 2,
    grass: 0.5,
    electric: 0.5,
    dragon: 0.5,
  },
  psychic: {
    fighting: 2,
    poison: 2,
    steel: 0.5,
    psychic: 0.5,
    dark: 0,
  },
  ice: {
    flying: 2,
    ground: 2,
    steel: 0.5,
    fire: 0.5,
    water: 0.5,
    grass: 2,
    ice: 0.5,
    dragon: 2,
  },
  dragon: {
    steel: 0.5,
    dragon: 2,
    fairy: 0,
  },
  dark: {
    fighting: 0.5,
    ghost: 2,
    psychic: 2,
    dark: 0.5,
    fairy: 0.5,
  },
  fairy: {
    fighting: 2,
    poison: 0.5,
    steel: 0.5,
    fire: 0.5,
    dragon: 2,
    dark: 2,
  },
}

/**
 * Calculate type effectiveness for an attack
 * @param attackingType - The type of the attacking move
 * @param defendingTypes - Array of defending Pokémon types
 * @returns Effectiveness multiplier (0, 0.5, 1, or 2)
 */
export function calculateTypeEffectiveness(
  attackingType: string,
  defendingTypes: string[]
): number {
  const effectivenessMap = typeEffectiveness[attackingType.toLowerCase()]
  if (!effectivenessMap) return 1

  // If multiple types, multiply effectiveness
  let totalEffectiveness = 1
  for (const defendingType of defendingTypes) {
    const effectiveness = effectivenessMap[defendingType.toLowerCase()] ?? 1
    totalEffectiveness *= effectiveness
  }

  return totalEffectiveness
}

/**
 * Get types that are weak to a given type (super effective)
 * @param attackingType - The attacking type
 * @returns Array of types that take 2x damage
 */
export function getWeaknesses(attackingType: string): string[] {
  const effectivenessMap = typeEffectiveness[attackingType.toLowerCase()]
  if (!effectivenessMap) return []

  return Object.entries(effectivenessMap)
    .filter(([_, effectiveness]) => effectiveness === 2)
    .map(([type, _]) => type)
}

/**
 * Get types that resist a given type (not very effective)
 * @param attackingType - The attacking type
 * @returns Array of types that take 0.5x damage
 */
export function getResistances(attackingType: string): string[] {
  const effectivenessMap = typeEffectiveness[attackingType.toLowerCase()]
  if (!effectivenessMap) return []

  return Object.entries(effectivenessMap)
    .filter(([_, effectiveness]) => effectiveness === 0.5)
    .map(([type, _]) => type)
}

/**
 * Get types that are immune to a given type (no effect)
 * @param attackingType - The attacking type
 * @returns Array of types that take 0x damage
 */
export function getImmunities(attackingType: string): string[] {
  const effectivenessMap = typeEffectiveness[attackingType.toLowerCase()]
  if (!effectivenessMap) return []

  return Object.entries(effectivenessMap)
    .filter(([_, effectiveness]) => effectiveness === 0)
    .map(([type, _]) => type)
}

/**
 * Get defensive effectiveness for a Pokémon with given types
 * @param defendingTypes - Array of defending Pokémon types
 * @returns Object mapping attacking types to their effectiveness multipliers
 */
export function getDefensiveEffectiveness(
  defendingTypes: string[]
): Record<string, number> {
  const result: Record<string, number> = {}

  // Check each attacking type
  for (const attackingType of Object.keys(typeEffectiveness)) {
    result[attackingType] = calculateTypeEffectiveness(
      attackingType,
      defendingTypes
    )
  }

  return result
}

/**
 * Get types that are strong against a given defending type (super effective)
 * This is the reverse lookup: which attacking types deal 2x damage to this type
 * @param defendingType - The defending type
 * @returns Array of types that deal 2x damage to this type
 */
export function getTypesStrongAgainst(defendingType: string): string[] {
  const result: string[] = []
  const defendingTypeLower = defendingType.toLowerCase()

  // Check each attacking type to see if it's super effective against the defending type
  for (const [attackingType, effectivenessMap] of Object.entries(
    typeEffectiveness
  )) {
    const effectiveness = effectivenessMap[defendingTypeLower]
    if (effectiveness === 2) {
      result.push(attackingType)
    }
  }

  return result
}

/**
 * Get types that are weak against a given defending type (not very effective)
 * This is the reverse lookup: which attacking types deal 0.5x damage to this type
 * @param defendingType - The defending type
 * @returns Array of types that deal 0.5x damage to this type
 */
export function getTypesWeakAgainst(defendingType: string): string[] {
  const result: string[] = []
  const defendingTypeLower = defendingType.toLowerCase()

  // Check each attacking type to see if it's not very effective against the defending type
  for (const [attackingType, effectivenessMap] of Object.entries(
    typeEffectiveness
  )) {
    const effectiveness = effectivenessMap[defendingTypeLower]
    if (effectiveness === 0.5) {
      result.push(attackingType)
    }
  }

  return result
}

/**
 * Get types that are immune to a given defending type (no effect)
 * This is the reverse lookup: which attacking types deal 0x damage to this type
 * @param defendingType - The defending type
 * @returns Array of types that deal 0x damage to this type
 */
export function getTypesImmuneTo(defendingType: string): string[] {
  const result: string[] = []
  const defendingTypeLower = defendingType.toLowerCase()

  // Check each attacking type to see if it's immune against the defending type
  for (const [attackingType, effectivenessMap] of Object.entries(
    typeEffectiveness
  )) {
    const effectiveness = effectivenessMap[defendingTypeLower]
    if (effectiveness === 0) {
      result.push(attackingType)
    }
  }

  return result
}
