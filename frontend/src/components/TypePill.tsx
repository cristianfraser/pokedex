import { cn } from '@/lib/utils'
import { Pill } from '@crfrsr/design-system-react'
import { typeColors, typeColorsDark, typeLetters } from '@/constants/types'

interface TypePillProps {
  type: {
    name: string
  }
  size?: 'default' | 'small' | 'icon'
  className?: string
  onMouseEnter?: (e: React.MouseEvent<HTMLSpanElement>) => void
  onMouseLeave?: (e: React.MouseEvent<HTMLSpanElement>) => void
}

// Pokemon-specific pill: supplies type colors, the pokemon glyph font, and the
// tiny per-size font classes on top of the design-system <Pill>.
const TypePill = ({
  type,
  size = 'default',
  className = '',
  onMouseEnter,
  onMouseLeave,
}: TypePillProps) => {
  const hoverable = !!onMouseEnter
  const typeName = type.name.toLowerCase()
  const backgroundColor = typeColors[typeName] || typeColors.unknown
  const hoverBackgroundColor = typeColorsDark[typeName] || typeColorsDark.unknown
  const typeLetter = typeLetters[typeName] || type.name.charAt(0).toLowerCase()

  const sizeFontClass = {
    default: 'text-3xs',
    small: 'text-5xs',
    icon: 'text-4xs',
  }[size]

  return (
    <Pill
      size={size}
      color={backgroundColor}
      hoverColor={hoverable ? hoverBackgroundColor : undefined}
      uppercase={size !== 'icon'}
      glyph={
        size !== 'small' ? (
          <span className="pokemon-font-2 normal-case">{typeLetter}</span>
        ) : undefined
      }
      className={cn('rounded-sm', sizeFontClass, className)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {size !== 'icon' ? type.name : undefined}
    </Pill>
  )
}

export default TypePill
