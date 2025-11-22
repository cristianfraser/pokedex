'use client'

import * as React from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useStyle } from '@/contexts/StyleContext'

interface ComboboxProps<T> {
  options: T[]
  filteredOptions: T[]
  isLoading?: boolean
  searchValue: string
  onSearchChange: (value: string) => void
  onSelect: (option: T) => void
  trigger: React.ReactNode
  renderOption: (
    option: T,
    index: number,
    onSelect: () => void
  ) => React.ReactNode
  placeholder?: string
  emptyMessage?: string
  loadingMessage?: string
  popoverWidth?: string
  estimateItemSize?: number
  inputClassName?: string
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  onLoadMore?: () => void
  showClearButton?: boolean
  onClear?: () => void
  value?: any
  onOpenChange?: (open: boolean) => void
}

export function Combobox<T>({
  filteredOptions,
  isLoading = false,
  searchValue,
  onSearchChange,
  onSelect,
  trigger,
  renderOption,
  placeholder = 'Search...',
  emptyMessage = 'No items found.',
  loadingMessage = 'Loading...',
  popoverWidth = 'w-[137.5px]',
  estimateItemSize = 28,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
  showClearButton = false,
  onClear,
  value,
  onOpenChange: externalOnOpenChange,
  inputClassName = 'h-4 text-3xs',
}: ComboboxProps<T>) {
  const [open, setOpen] = React.useState(false)
  const { isMobile } = useStyle()

  // Notify parent of open state changes
  React.useEffect(() => {
    externalOnOpenChange?.(open)
  }, [open, externalOnOpenChange])
  const commandListRef = React.useRef<HTMLDivElement | null>(null)
  const parentRef = React.useRef<HTMLDivElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const isScrollingRef = React.useRef(false)

  // Reset search when popover closes, after animation finishes
  React.useEffect(() => {
    if (!open) {
      // Wait for closing animation to finish (200ms for fade-out + zoom-out)
      const timeoutId = setTimeout(() => {
        onSearchChange('')
      }, 200)
      return () => clearTimeout(timeoutId)
    }
  }, [open, onSearchChange])

  // Detect scrolling on mobile to prevent accidental combobox opens
  React.useEffect(() => {
    let scrollTimeout: ReturnType<typeof setTimeout>

    const handleScroll = () => {
      isScrollingRef.current = true
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        isScrollingRef.current = false
      }, 150) // Reset scrolling flag 150ms after scroll ends
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('touchmove', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('touchmove', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [])

  // Create full-page overlay when combobox opens
  React.useEffect(() => {
    if (!open) return

    const overlay = document.createElement('div')
    overlay.style.position = 'fixed'
    overlay.style.top = '0'
    overlay.style.left = '0'
    overlay.style.right = '0'
    overlay.style.bottom = '0'
    overlay.style.width = '100%'
    overlay.style.height = '100%'
    overlay.style.userSelect = 'none'
    // overlay.style.webkitUserSelect = 'none'
    // overlay.style.mozUserSelect = 'none'
    // overlay.style.msUserSelect = 'none'
    // overlay.style.oUserSelect = 'none'
    overlay.style.zIndex = '40' // Below popover (z-50) but above most content
    document.body.appendChild(overlay)

    return () => {
      if (document.body.contains(overlay)) {
        document.body.removeChild(overlay)
      }
    }
  }, [open])

  // Handle clicks outside the combobox to close it
  // React.useEffect(() => {
  //   const handleClickOutside = (event: MouseEvent | TouchEvent) => {
  //     console.log('handleClickOutside', open)
  //     if (!open) return
  //     const target = event.target as Node

  //     // Check if click is outside the container and popover content
  //     const container = containerRef.current
  //     const popoverContent = document.querySelector(
  //       '[data-radix-portal][role="dialog"]'
  //     )

  //     console.log('container', container)
  //     console.log('popoverContent', popoverContent)
  //     console.log('target', target)
  //     console.log('container.contains(target)', container?.contains(target))
  //     console.log(
  //       'popoverContent.contains(target)',
  //       popoverContent?.contains(target)
  //     )

  //     if (
  //       container &&
  //       !container.contains(target) &&
  //       popoverContent &&
  //       !popoverContent.contains(target)
  //     ) {
  //       console.log('close popover')
  //       event.preventDefault()
  //       setOpen(false)
  //     }
  //   }

  //   // Use capture phase to catch events before they reach TeamPokemon handlers
  //   // This ensures we close the popover before hover states are triggered
  //   document.addEventListener('mousedown', handleClickOutside, true)
  //   document.addEventListener('touchstart', handleClickOutside, true)
  //   document.addEventListener('click', handleClickOutside, true)

  //   return () => {
  //     document.removeEventListener('mousedown', handleClickOutside, true)
  //     document.removeEventListener('touchstart', handleClickOutside, true)
  //     document.removeEventListener('click', handleClickOutside, true)
  //   }
  // }, [open])

  // Virtualizer for the list
  const rowVirtualizer = useVirtualizer({
    count: filteredOptions.length,
    getScrollElement: () => commandListRef.current,
    estimateSize: () => estimateItemSize,
    overscan: 10,
  })

  // Reset virtualizer when opening
  React.useEffect(() => {
    if (open) {
      rowVirtualizer.measure()
    }
  }, [open, rowVirtualizer])

  // Update virtualizer when filtered options change
  React.useEffect(() => {
    if (open && filteredOptions.length > 0) {
      rowVirtualizer.measure()
    }
  }, [filteredOptions.length, open, rowVirtualizer])

  // Check if we need to load more pages (when data changes or scrolling)
  const virtualItems = rowVirtualizer.getVirtualItems()
  const checkLoadMore = React.useCallback(() => {
    // Skip if already fetching or no more pages
    if (isFetchingNextPage || isLoading || !hasNextPage || !onLoadMore) return

    const scrollElement = commandListRef.current
    if (!scrollElement) return

    // Check scroll position - load when within 80% of scroll height
    const scrollTop = scrollElement.scrollTop
    const scrollHeight = scrollElement.scrollHeight
    const clientHeight = scrollElement.clientHeight
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight

    // Also check virtual items as backup
    const lastItem =
      virtualItems.length > 0 ? virtualItems[virtualItems.length - 1] : null

    // Load next page if:
    // 1. Scrolled to 80% of content, OR
    // 2. Last visible item is within 20 items of the end
    if (
      scrollPercentage >= 0.8 ||
      (lastItem && lastItem.index >= filteredOptions.length - 20)
    ) {
      onLoadMore()
    }
  }, [
    virtualItems,
    isFetchingNextPage,
    isLoading,
    hasNextPage,
    onLoadMore,
    rowVirtualizer,
    filteredOptions.length,
  ])

  // Check for more pages when filtered options change (new data loaded)
  React.useEffect(() => {
    if (open && filteredOptions.length > 0 && onLoadMore) {
      // Use requestAnimationFrame to ensure virtualizer has updated
      requestAnimationFrame(() => {
        checkLoadMore()
      })
    }
  }, [open, filteredOptions.length, checkLoadMore, onLoadMore])

  // Infinite scroll: load next page when scrolling near the bottom
  React.useEffect(() => {
    if (!open || !onLoadMore) return

    const scrollElement = commandListRef.current
    if (!scrollElement) {
      return
    }

    // Use requestAnimationFrame to ensure virtualizer is updated
    const rafHandleScroll = () => {
      requestAnimationFrame(() => {
        checkLoadMore()
      })
    }

    scrollElement.addEventListener('scroll', rafHandleScroll, { passive: true })

    return () => {
      scrollElement.removeEventListener('scroll', rafHandleScroll)
    }
  }, [open, checkLoadMore, onLoadMore])

  // Handle popover open change - prevent opening if scrolling
  const handleOpenChange = React.useCallback((newOpen: boolean) => {
    // Prevent opening if currently scrolling
    if (newOpen && isScrollingRef.current) {
      return
    }
    setOpen(newOpen)
  }, [])

  // Touch handlers for mobile to prevent double-tap issue
  const handleTouchStart = React.useCallback(
    (e: React.TouchEvent) => {
      // Store touch start to detect scroll gestures
      if (isMobile) {
        const touch = e.touches[0]
        if (touch) {
          ;(e.currentTarget as any).__touchStart = {
            x: touch.clientX,
            y: touch.clientY,
            time: Date.now(),
          }
        }
      }
    },
    [isMobile]
  )

  const handleTouchMove = React.useCallback(
    (e: React.TouchEvent) => {
      // Detect if this is a scroll gesture
      if (isMobile) {
        const touchStart = (e.currentTarget as any).__touchStart
        if (touchStart) {
          const touch = e.touches[0]
          if (touch) {
            const deltaX = Math.abs(touch.clientX - touchStart.x)
            const deltaY = Math.abs(touch.clientY - touchStart.y)
            // If moved more than 10px, consider it a scroll
            if (deltaX > 10 || deltaY > 10) {
              ;(e.currentTarget as any).__isScrollGesture = true
            }
          }
        }
      }
    },
    [isMobile]
  )

  const handleTouchEnd = React.useCallback(
    (e: React.TouchEvent) => {
      // On mobile, trigger click immediately to open combobox
      // This prevents the double-tap issue
      if (isMobile) {
        // Check if this was a scroll gesture
        const isScrollGesture = (e.currentTarget as any).__isScrollGesture
        if (isScrollGesture) {
          // Don't open if it was a scroll gesture
          e.preventDefault()
          e.stopPropagation()
          // Clean up
          delete (e.currentTarget as any).__touchStart
          delete (e.currentTarget as any).__isScrollGesture
          return
        }

        // Clean up
        delete (e.currentTarget as any).__touchStart
        delete (e.currentTarget as any).__isScrollGesture

        e.preventDefault()
        e.stopPropagation()
        // Programmatically trigger click to open the popover
        const target = e.currentTarget
        const clickEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window,
        })
        target.dispatchEvent(clickEvent)
      }
    },
    [isMobile]
  )

  const handleTriggerClick = React.useCallback((e: React.MouseEvent) => {
    // Stop propagation to prevent container selection
    e.stopPropagation()
  }, [])

  return (
    <div ref={containerRef} className="group">
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={handleTriggerClick}
          >
            {trigger}
          </div>
        </PopoverTrigger>
        <PopoverContent
          className={`${popoverWidth} p-0 overflow-hidden`}
          align="start"
          onClick={e => e.stopPropagation()}
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={placeholder}
              className={inputClassName}
              value={searchValue}
              onValueChange={onSearchChange}
            />
            <CommandList
              className="max-h-[30vh] sm:max-h-[300px] overflow-auto"
              ref={commandListRef}
            >
              {isLoading ? (
                <CommandEmpty className="text-2xs text-center p-2">
                  {loadingMessage}
                </CommandEmpty>
              ) : filteredOptions.length === 0 ? (
                <CommandEmpty className="text-2xs text-center p-2">
                  {emptyMessage}
                </CommandEmpty>
              ) : null}
              <CommandGroup
                ref={parentRef}
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  width: '100%',
                  position: 'relative',
                }}
              >
                {filteredOptions.length === 0
                  ? null
                  : rowVirtualizer.getVirtualItems().map(virtualItem => {
                      const option = filteredOptions[virtualItem.index]
                      if (!option) return null

                      return (
                        <div
                          key={virtualItem.key}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: `${virtualItem.size}px`,
                            transform: `translateY(${virtualItem.start}px)`,
                          }}
                        >
                          {renderOption(option, virtualItem.index, () => {
                            if (!open) {
                              return
                            }
                            onSelect(option)
                            setOpen(false)
                          })}
                        </div>
                      )
                    })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {showClearButton && value && onClear && (
        <button
          onClick={e => {
            e.stopPropagation()
            onClear()
          }}
          className="absolute -right-4 top-0 w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-opacity opacity-0 group-hover:opacity-100 z-10"
          aria-label="Clear selection"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  )
}
