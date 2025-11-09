import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

const Card = ({ children, className = '', hover = false }: CardProps) => {
  const baseClasses = 'bg-white rounded-lg shadow-sm border border-gray-200 p-6'
  const hoverClasses = hover
    ? 'hover:shadow-md transition-shadow duration-200'
    : ''

  const classes = `${baseClasses} ${hoverClasses} ${className}`.trim()

  return <div className={classes}>{children}</div>
}

export default Card
