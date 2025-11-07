interface TypePillProps {
  type: {
    name: string
  }
  size?: 'default' | 'small'
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

const TypePill = ({ type, size = 'default' }: TypePillProps) => {
  const typeName = type.name.toLowerCase()
  const backgroundColor = typeColors[typeName] || typeColors.unknown

  const sizeClasses =
    size === 'small'
      ? 'text-[0.5rem] px-1 py-[1px]'
      : 'text-[0.6rem] px-1.5 py-[1px]'

  return (
    <span
      className={`text-white font-bold ${sizeClasses} rounded-sm uppercase inline-block`}
      style={{ backgroundColor }}
    >
      {type.name}
    </span>
  )
}

export default TypePill

