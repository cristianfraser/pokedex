import { cn } from '@/lib/utils'

interface IconProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-6 h-6',
}

export const DeleteIcon = ({ className, size = 'md' }: IconProps) => {
  return (
    <svg
      className={cn(sizeClasses[size], className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-label="Delete"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  )
}

export const SuperEffectiveIcon = ({ className, size = 'sm' }: IconProps) => {
  return (
    <svg
      className={cn(sizeClasses[size], className)}
      viewBox="0 0 12 12"
      fill="none"
      role="img"
      aria-label="Super effective"
    >
      <title>Super effective</title>
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
  )
}

export const NotVeryEffectiveIcon = ({
  className,
  size = 'sm',
}: IconProps) => {
  return (
    <svg
      className={cn(sizeClasses[size], className)}
      viewBox="0 0 12 12"
      fill="none"
      role="img"
      aria-label="Not very effective"
    >
      <title>Not very effective</title>
      <path d="M6 5.2 L7.5 8 L4.5 8 Z" fill="currentColor" />
      <path
        d="M6 1.5 L10.5 10 L1.5 10 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  )
}

export const ImmuneIcon = ({ className, size = 'sm' }: IconProps) => {
  return (
    <svg
      className={cn(sizeClasses[size], className)}
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      role="img"
      aria-label="No effect"
    >
      <title>No effect</title>
      <path d="M2 2 L10 10 M10 2 L2 10" />
    </svg>
  )
}

