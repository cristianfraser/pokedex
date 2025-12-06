import { useState } from 'react'

interface BlurImageProps {
  src: string | null
  alt: string
  className?: string
  style?: React.CSSProperties
  dominantColor?: string | null
  blurAmount?: number
}

function BlurImage({
  src,
  alt,
  className,
  style,
  dominantColor,
  blurAmount = 20,
}: BlurImageProps) {
  const [loaded, setLoaded] = useState(false)

  if (!src) {
    return null
  }

  // Extract object-fit and other layout classes from className
  const containerClasses =
    className
      ?.split(' ')
      .filter(c => !c.includes('object-'))
      .join(' ') || ''
  const imageClasses =
    className
      ?.split(' ')
      .filter(c => c.includes('object-'))
      .join(' ') || 'object-contain'

  // Default to a light gray if no dominant color is provided
  const backgroundColor = dominantColor || '#e5e7eb'

  return (
    <div
      className={containerClasses}
      style={{ position: 'relative', ...style }}
    >
      {/* Color placeholder - blurry circle/oval */}
      <div
        style={{
          backgroundColor,
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '40%',
          height: '40%',
          borderRadius: '50%',
          filter: `blur(${blurAmount}px)`,
          opacity: loaded ? 0 : 1,
          transition: 'opacity 1s',
        }}
      />
      {/* Full image */}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={imageClasses}
        style={{
          opacity: loaded ? 1 : 0,
          transition: 'opacity 1s',
          position: 'relative',
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  )
}

export default BlurImage
