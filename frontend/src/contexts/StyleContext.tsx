import React, { createContext, useContext, useState, useEffect } from 'react'
import { isMobile as checkIsMobile } from '../utils/helpers'

interface StyleContextType {
  isMobile: boolean
}

const StyleContext = createContext<StyleContextType | undefined>(undefined)

export function StyleProvider({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(checkIsMobile)

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(checkIsMobile())
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <StyleContext.Provider value={{ isMobile }}>
      {children}
    </StyleContext.Provider>
  )
}

export function useStyle() {
  const context = useContext(StyleContext)
  if (context === undefined) {
    throw new Error('useStyle must be used within a StyleProvider')
  }
  return context
}
