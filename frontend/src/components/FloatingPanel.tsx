import { ReactNode } from 'react'

interface FloatingPanelProps {
  top: number
  children: ReactNode
  offsetRight?: number // Offset from right edge (for positioning second panel)
  isVisible?: boolean // Control visibility with slide animation
}

const FloatingPanel = ({
  top,
  children,
  isVisible = true,
}: FloatingPanelProps) => {
  return (
    <div
      className={`fixed z-40 right-4`}
      style={{
        top: `${top}px`,
        transform: isVisible ? 'translateX(0)' : 'translateX(110%)',
        transition:
          'top 0.1s, width 0.2s ease-in-out, right 0.2s ease-in-out, transform 0.3s ease-in-out',
        willChange: 'width, top, right, transform',
      }}
    >
      <div className="flex bg-white/80 backdrop-blur-xl shadow-lg border border-gray-200/50 rounded-xl p-2 relative">
        {children}
      </div>
    </div>
  )
}

export default FloatingPanel
