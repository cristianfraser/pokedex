import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import TypePill from './TypePill'

interface AnimatedTypePillsProps {
  types: Array<{ type: { name: string }; slot: number }> | null
  size?: 'default' | 'small' | 'icon'
}

const AnimatedTypePills = ({ types, size }: AnimatedTypePillsProps) => {
  const [exitingTypes, setExitingTypes] = useState<string[]>([])
  const previousTypesRef = useRef<string[]>([])

  // Track types for animation
  useEffect(() => {
    if (types && types.length > 0) {
      const currentTypes = types.map(t => t.type.name)
      const previousTypes = previousTypesRef.current

      // Check if types changed
      const currentTypesStr = JSON.stringify(currentTypes)
      const previousTypesStr = JSON.stringify(previousTypes)
      const typesChanged = currentTypesStr !== previousTypesStr

      if (typesChanged && previousTypes.length > 0) {
        // Store previous types for exit animation
        setExitingTypes([...previousTypes])
      } else {
        setExitingTypes([])
      }

      // Update ref for next render
      previousTypesRef.current = [...currentTypes]
    } else {
      setExitingTypes([])
      previousTypesRef.current = []
    }
  }, [types])

  // Adjust container and content heights based on size
  const containerHeight = size === 'small' ? 'h-[18px]' : 'min-h-[18px]'
  const contentHeight = size === 'small' ? 'h-[14px]' : 'min-h-[14px]'
  const animationOffset = size === 'small' ? -18 : -24

  return (
    <div className={`${containerHeight} overflow-hidden relative mt-1 w-full`}>
      {/* Entering types (current) */}
      <AnimatePresence>
        {types && types.length > 0 && (
          <motion.div
            key={types.map(t => t.type.name).join(',')}
            initial={{ y: animationOffset, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: animationOffset, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`flex gap-[2px] justify-center items-center ${contentHeight} absolute top-0 left-0 right-0`}
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

      {/* Exiting types (previous) */}
      <AnimatePresence>
        {exitingTypes.length > 0 && (
          <motion.div
            key={`exit-${exitingTypes.join(',')}`}
            initial={{ y: 0, opacity: 1 }}
            animate={{ y: -animationOffset, opacity: 0.3 }}
            exit={{ y: -animationOffset, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`flex gap-[5px] justify-center items-center ${contentHeight} absolute top-0 left-0 right-0`}
          >
            {exitingTypes.map(typeName => (
              <div
                key={`exit-${typeName}`}
                className="inline-block h-full flex items-center"
              >
                <TypePill type={{ name: typeName }} size={size} />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AnimatedTypePills
