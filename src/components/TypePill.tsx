import { cn } from '@/lib/utils'

interface TypePillProps {
  type: {
    name: string
  }
  size?: 'default' | 'small' | 'icon'
  className?: string
}

const typeColors: Record<string, string> = {
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
}

const typeLetters: Record<string, string> = {
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
}

const TypePill = ({
  type,
  size = 'default',
  className = '',
}: TypePillProps) => {
  const typeName = type.name.toLowerCase()
  const backgroundColor = typeColors[typeName] || typeColors.unknown

  const sizeClasses =
    size === 'icon' || size === 'small'
      ? 'text-4xs px-1 py-[1px]'
      : 'text-3xs px-1.5 py-[1px]'

  const typeLetter = typeLetters[typeName] || type.name.charAt(0).toLowerCase()

  // For icon size, only show the icon
  if (size === 'icon') {
    return (
      <span
        className={cn(
          'text-white font-bold rounded-sm inline-block line-height-[0.5rem]',
          sizeClasses,
          className
        )}
        style={{
          backgroundColor,
          lineHeight: '12px',
        }}
      >
        <span className="pokemon-font-2 normal-case">{typeLetter}</span>
      </span>
    )
  }

  return (
    <span
      className={cn(
        'text-white font-bold rounded-sm uppercase inline-block line-height-[0.5rem]',
        sizeClasses,
        className
      )}
      style={{
        backgroundColor,
        lineHeight: size === 'small' ? '12px' : undefined,
      }}
    >
      {size !== 'small' && (
        <span className="pokemon-font-2 normal-case">{typeLetter}</span>
      )}
      <span className={size !== 'small' ? 'ml-0.5' : ''}>{type.name}</span>
    </span>
  )
}

export default TypePill
