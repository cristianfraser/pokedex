import { useState, useEffect } from 'react'

interface BlurImageProps {
  src: string | null
  alt: string
  className?: string
  style?: React.CSSProperties
  dominantColor?: string | null
  blurAmount?: number
  showBlur?: boolean
  setLoaded?: (loaded: boolean) => void
}

function BlurImage({
  src,
  alt,
  className,
  style,
  dominantColor,
  blurAmount = 20,
  showBlur,
  setLoaded: setLoadedCallback,
}: BlurImageProps) {
  const [loaded, setLoaded] = useState(false)

  // Reset loaded state when src changes
  useEffect(() => {
    setLoaded(false)
    setLoadedCallback?.(false)
    // if (showBlur) {
    //   setLoaded(false)
    //   setLoadedCallback?.(false)
    // }
  }, [src, showBlur])

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

  // if (test) {
  //   console.log({
  //     src,
  //     loaded,
  //     showBlur,
  //   })
  // }

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
          opacity: showBlur ? 1 : loaded ? 0 : 1,
          transition: `opacity ${showBlur ? 0.3 : 1}s, backgroundColor 0.3s`,
        }}
      />
      {/* Full image */}
      <img
        src={src}
        alt={alt}
        onLoad={() => {
          setLoaded(true)
          setLoadedCallback?.(true)
        }}
        className={imageClasses}
        style={{
          opacity: showBlur ? 0 : loaded ? 1 : 0,
          transition: `opacity ${showBlur ? 0.3 : 1}s`,
          position: 'relative',
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  )
}

export default BlurImage
