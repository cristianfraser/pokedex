import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface TypeEffectivenessIconProps {
  effectiveness: number
  className?: string
}

const AnimatedSuperEffectiveIcon = ({ className }: { className?: string }) => {
  return (
    <motion.svg
      className={cn('w-3 h-3', className)}
      viewBox="0 0 12 12"
      fill="none"
      role="img"
      aria-label="Super effective"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <title>Super effective</title>
      <motion.circle
        cx="6"
        cy="6"
        r="2"
        fill="currentColor"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      />
      <motion.circle
        cx="6"
        cy="6"
        r="4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        exit={{ pathLength: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      />
    </motion.svg>
  )
}

const AnimatedNotVeryEffectiveIcon = ({ className }: { className?: string }) => {
  return (
    <motion.svg
      className={cn('w-3 h-3', className)}
      viewBox="0 0 12 12"
      fill="none"
      role="img"
      aria-label="Not very effective"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <title>Not very effective</title>
      <motion.path
        d="M6 5.2 L7.5 8 L4.5 8 Z"
        fill="currentColor"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        style={{ transformOrigin: '6px 6.5px' }}
      />
      <motion.path
        d="M6 1.5 L10.5 10 L1.5 10 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        exit={{ pathLength: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      />
    </motion.svg>
  )
}

const AnimatedImmuneIcon = ({ className }: { className?: string }) => {
  return (
    <motion.svg
      className={cn('w-3 h-3', className)}
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      role="img"
      aria-label="No effect"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <title>No effect</title>
      <motion.path
        d="M2 2 L10 10"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        exit={{ pathLength: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      />
      <motion.path
        d="M10 2 L2 10"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        exit={{ pathLength: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      />
    </motion.svg>
  )
}

export const TypeEffectivenessIcon = ({
  effectiveness,
  className,
}: TypeEffectivenessIconProps) => {
  // Determine icon type based on effectiveness
  let iconType: 'immune' | 'resistant' | 'super-effective' | null = null
  let icon = null

  if (effectiveness === 0) {
    iconType = 'immune'
    icon = <AnimatedImmuneIcon className={className} />
  } else if (effectiveness < 1) {
    iconType = 'resistant'
    icon = <AnimatedNotVeryEffectiveIcon className={className} />
  } else if (effectiveness > 1) {
    iconType = 'super-effective'
    icon = <AnimatedSuperEffectiveIcon className={className} />
  }

  return (
    <AnimatePresence>
      {icon && iconType && (
        <motion.span
          key={iconType}
          className="team-pokemon-effectiveness-icon"
        >
          {icon}
        </motion.span>
      )}
    </AnimatePresence>
  )
}

