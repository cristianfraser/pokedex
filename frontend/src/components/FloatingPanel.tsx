import { ReactNode } from 'react'

interface FloatingPanelProps {
  top: number
  isExpanded: boolean
  onToggle: () => void
  children: ReactNode
}

const FloatingPanel = ({
  top,
  isExpanded,
  onToggle,
  children,
}: FloatingPanelProps) => {
  const panelWidth = isExpanded ? '300px' : '136px'

  return (
    <div
      className="fixed right-4 sm:right-6 lg:right-8 z-40"
      style={{
        top: `${top}px`,
        transition: 'top 0.1s, width 0.2s ease-in-out',
        width: panelWidth,
        willChange: 'width, top',
      }}
    >
      <div className="bg-white/80 backdrop-blur-xl shadow-lg border border-gray-200/50 rounded-xl p-2 relative">
        <button
          onClick={onToggle}
          className="absolute top-2 -left-2 w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors z-10"
          style={{ transform: 'translateX(calc(-100%))' }}
          aria-label={isExpanded ? 'Collapse panel' : 'Expand panel'}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
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
        {children}
      </div>
    </div>
  )
}

export default FloatingPanel
