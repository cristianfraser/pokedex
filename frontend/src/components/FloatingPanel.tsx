import { ReactNode, forwardRef } from 'react'
import { usePokemonContext } from '../contexts/PokemonContext'

interface FloatingPanelProps {
  top: number
  children: ReactNode
  offsetRight?: number // Offset from right edge (for positioning second panel)
  hideCollapseButton?: boolean // Hide the collapse/expand button
}

const FloatingPanel = forwardRef<HTMLDivElement, FloatingPanelProps>(
  ({ top, children, hideCollapseButton = false }, ref) => {
    const { isTeamExpanded, setIsTeamExpanded } = usePokemonContext()
    return (
      <div
        ref={ref}
        className={`fixed z-40 right-2 ml-2`}
        style={{
          top: `${top}px`,
          transition:
            'top 0.1s, width 0.2s ease-in-out, right 0.2s ease-in-out, transform 0.3s ease-in-out',
          willChange: 'width, top, right, transform',
          maxWidth: 'calc(100% - 1rem)',
        }}
      >
        {!hideCollapseButton && (
          <button
            onClick={() => setIsTeamExpanded(prevIsExpanded => !prevIsExpanded)}
            className="absolute top-2 -left-2 w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded transition-colors z-10"
            style={{ transform: 'translateX(calc(-100%))' }}
            aria-label={isTeamExpanded ? 'Collapse panel' : 'Expand panel'}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{
                transform: isTeamExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease-in-out',
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}
        {children}
      </div>
    )
  }
)

FloatingPanel.displayName = 'FloatingPanel'

export default FloatingPanel
