import { cn } from '@/lib/utils'
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
  const hoverBackgroundColor =
    typeColorsDark[typeName] || typeColorsDark.unknown

  const sizeClasses = {
    default: 'text-3xs px-1.5 py-[1px]',
    small: 'text-5xs px-1 py-[1px]',
    icon: 'text-4xs px-1 py-[1px]',
  }[size]

  const typeLetter = typeLetters[typeName] || type.name.charAt(0).toLowerCase()

  return (
    <span
      className={cn(
        'text-white font-bold rounded-sm inline-block line-height-[0.5rem] cursor-default',
        size !== 'icon' && 'uppercase',
        sizeClasses,
        hoverable && 'transition-all duration-200',
        className
      )}
      style={{
        backgroundColor,
        lineHeight: size === 'icon' || size === 'small' ? '12px' : undefined,
      }}
      onMouseEnter={(e: React.MouseEvent<HTMLSpanElement>) => {
        if (hoverable) {
          e.currentTarget.style.backgroundColor = hoverBackgroundColor
        }
        onMouseEnter?.(e)
      }}
      onMouseLeave={(e: React.MouseEvent<HTMLSpanElement>) => {
        if (hoverable) {
          e.currentTarget.style.backgroundColor = backgroundColor
        }
        onMouseLeave?.(e)
      }}
    >
      {size !== 'small' && (
        <span className="pokemon-font-2 normal-case">{typeLetter}</span>
      )}
      {size !== 'icon' && (
        <span className={cn(size !== 'small' && 'ml-0.5')}>{type.name}</span>
      )}
    </span>
  )
}

export default TypePill
