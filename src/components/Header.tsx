import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const Header = () => {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Start transition at 50px, complete at 100px
  const scrollStart = 50
  const scrollEnd = 100
  const scrollProgress = Math.min(
    Math.max((scrollY - scrollStart) / (scrollEnd - scrollStart), 0),
    1
  )

  // Calculate values based on scroll progress with easing
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
  const easedProgress = easeOutCubic(scrollProgress)

  const margin = 16 - easedProgress * 16 // 16px (mx-4) to 0px
  const borderRadius = 12 - easedProgress * 12 // 12px (rounded-xl) to 0px
  const topValue = 16 - easedProgress * 16 // 16px (top-4) to 0px

  // Glassy effect: more transparent when floating, more opaque when expanded
  const bgOpacity = 0.8 + easedProgress * 0.15 // 80% to 95%
  const backdropBlur = 12 + easedProgress * 4 // 12px to 16px

  // Determine if header is floating or expanded
  const isFloating = easedProgress < 1

  return (
    <header
      className={`fixed z-50 transition-all ease-[cubic-bezier(0.4,0,0.2,1)] ${
        isFloating ? 'header-floating' : 'header-expanded'
      }`}
      style={{
        width: easedProgress < 1 ? `calc(100% - ${margin * 2}px)` : '100%',
        top: `${topValue}px`,
        left: easedProgress < 1 ? `${margin}px` : 0,
        right: easedProgress < 1 ? `${margin}px` : 0,
      }}
    >
      <div
        className={`${easedProgress < 1 ? 'max-w-7xl mx-auto' : 'w-full'} shadow-lg border px-4 sm:px-6 lg:px-8 transition-all ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isFloating ? 'header-floating' : 'header-expanded'
        }`}
        style={{
          borderRadius: `${borderRadius}px`,
          backgroundColor: `rgba(255, 255, 255, ${bgOpacity})`,
          backdropFilter: `blur(${backdropBlur}px)`,
          WebkitBackdropFilter: `blur(${backdropBlur}px)`,
          borderColor: `rgba(229, 231, 235, ${0.5 + easedProgress * 0.3})`,
          boxShadow: `0 10px 15px -3px rgba(0, 0, 0, ${0.1 + easedProgress * 0.05}), 0 4px 6px -2px rgba(0, 0, 0, ${0.05 + easedProgress * 0.05})`,
        }}
      >
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Pokédex</span>
            </Link>
          </div>
          <nav className="hidden md:flex space-x-8">
            <Link
              to="/"
              className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              to="/pokemon"
              className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Pokémon
            </Link>
            <Link
              to="/about"
              className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              About
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
