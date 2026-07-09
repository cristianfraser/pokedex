import type { ThemeOverrides } from '@crfrsr/core'

/**
 * Pokedex's design-system theme. Single source of truth for the app's look:
 * the shared ThemeProvider merges this over the library defaults and injects
 * the resulting --crfrsr-* CSS variables at runtime.
 *
 * Component-level knobs that aren't theme tokens (e.g. --crfrsr-btn-secondary-*)
 * live in index.css.
 */
export const pokedexTheme: ThemeOverrides = {
  colors: {
    light: {
      // Primary = sky (the old .btn-primary used primary-600 / primary-700 hover)
      primary: '#0284c7',
      primaryDark: '#0369a1',
      textOnPrimary: '#ffffff',
      focusRing: '#0ea5e9',

      // Neutrals (match the app's Tailwind grays)
      background: '#f9fafb',
      surface: '#ffffff',
      surfaceHover: '#f3f4f6',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
    },
  },
  typography: {
    fontFamily: {
      base: "'PKMN RBYGSC', sans-serif",
    },
  },
}
