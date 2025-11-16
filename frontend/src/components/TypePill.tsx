import { cn } from '@/lib/utils'
import { typeColors, typeLetters } from '@/constants/types'

interface TypePillProps {
  type: {
    name: string
  }
  size?: 'default' | 'small' | 'icon'
  className?: string
}

const TypePill = ({
  type,
  size = 'default',
  className = '',
}: TypePillProps) => {
  const typeName = type.name.toLowerCase()
  const backgroundColor = typeColors[typeName] || typeColors.unknown

  const sizeClasses = {
    default: 'text-3xs px-1.5 py-[1px]',
    small: 'text-5xs px-1 py-[1px]',
    icon: 'text-4xs px-1 py-[1px]',
  }[size]

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
