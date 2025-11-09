export const APP_NAME = 'Pokédex'
export const APP_VERSION = '1.0.0'

// Support both Vite (VITE_API_URL) and Create React App (REACT_APP_API_URL) naming conventions
export const API_URL = import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL || ''

export const POKEMON_TYPES = [
  'Normal',
  'Fire',
  'Water',
  'Electric',
  'Grass',
  'Ice',
  'Fighting',
  'Poison',
  'Ground',
  'Flying',
  'Psychic',
  'Bug',
  'Rock',
  'Ghost',
  'Dragon',
  'Dark',
  'Steel',
  'Fairy',
] as const

export type PokemonType = (typeof POKEMON_TYPES)[number]
