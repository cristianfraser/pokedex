interface TypePillProps {
  type: {
    name: string
  }
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

const TypePill = ({ type }: TypePillProps) => {
  const typeName = type.name.toLowerCase()
  const backgroundColor = typeColors[typeName] || typeColors.unknown

  return (
    <span
      className="text-white text-[0.6rem] font-bold px-1.5 py-[1px] rounded-sm uppercase inline-block"
      style={{ backgroundColor }}
    >
      {type.name}
    </span>
  )
}

export default TypePill

