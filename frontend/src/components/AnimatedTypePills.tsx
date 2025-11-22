import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import TypePill from './TypePill'

interface AnimatedTypePillsProps {
  types: Array<{ type: { name: string }; slot: number }> | null
  size?: 'default' | 'small' | 'icon'
  containerClassName?: string
  containerStyle?: React.CSSProperties
}

const AnimatedTypePills = ({
  types,
  size,
  containerStyle,
  containerClassName,
}: AnimatedTypePillsProps) => {
  // Adjust container and content heights based on size
  const containerHeight = size === 'small' ? 'h-[18px]' : 'min-h-[18px]'
  const contentHeight = size === 'small' ? 'h-[14px]' : 'min-h-[14px]'
  const animationOffset = size === 'small' ? -18 : -24

  return (
    <div className={cn(containerHeight, 'overflow-hidden relative w-full')}>
      {/* Entering types (current) */}
      <AnimatePresence>
        {types && types.length > 0 && (
          <motion.div
            key={types.map(t => t.type.name).join(',')}
            initial={{ y: animationOffset, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -animationOffset, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className={cn(
              'flex gap-[2px] justify-center items-center fit-content absolute top-0 left-0 right-0',
              contentHeight,
              containerClassName
            )}
            style={containerStyle}
          >
            {types.map(type => {
              const typeKey = `${type.type.name}-${type.slot}`
              return (
                <div
                  key={typeKey}
                  className="inline-block h-full flex items-center"
                >
                  <TypePill type={type.type} size={size} />
                </div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AnimatedTypePills
