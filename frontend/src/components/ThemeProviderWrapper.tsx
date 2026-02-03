import { ReactNode } from 'react'

interface ThemeProviderWrapperProps {
  skipBodyFontFamily?: boolean
  children: ReactNode
}

// Wrapper that handles optional @crfrsr/design-system-react dependency
// If the package is not available, this will be a no-op
// Vite will handle the import at build time - if it fails, the build will fail
// but we can catch that and provide a fallback
const ThemeProviderWrapper = ({ children }: ThemeProviderWrapperProps) => {
  // Try to use ThemeProvider if available
  // This import will be resolved at build time by Vite
  try {
    // @ts-ignore - package may not be available in deployment
    const { ThemeProvider } = require('@crfrsr/design-system-react')
    return <ThemeProvider skipBodyFontFamily>{children}</ThemeProvider>
  } catch {
    // Fallback: just render children if package not available
    return <>{children}</>
  }
}

export default ThemeProviderWrapper

