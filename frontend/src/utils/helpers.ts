/**
 * Check if the current viewport is mobile (width < 768px)
 */
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') {
    return false
  }
  return window.innerWidth < 768
}

/**
 * Capitalizes the first letter of a string
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Formats a number with commas for better readability
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString()
}

/**
 * Generates a random ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9)
}

/**
 * Debounces a function call
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
