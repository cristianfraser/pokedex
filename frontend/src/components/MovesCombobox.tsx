'use client'

import * as React from 'react'
import { ChevronsUpDown } from 'lucide-react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useMoves } from '@/queries/moves'
import TypePill from './TypePill'

interface MovesOptionProps {
  move: { name: string; type: string; id: number }
  value?: string
  onSelect: (currentValue: string) => void
  containerRef: React.RefObject<HTMLElement | null>
}

function MovesOption({
  move,
  value,
  onSelect,
  containerRef: _containerRef,
}: MovesOptionProps) {
  const { name: moveName, type: moveType } = move

  return (
    <CommandItem
      value={moveName}
      onSelect={currentValue => {
        onSelect(currentValue === value ? '' : currentValue)
      }}
      onClick={e => e.stopPropagation()}
      className="flex items-center gap-2 relative py-1 text-xs group"
    >
      {moveType && (
        <TypePill
          type={{ name: moveType }}
          size="small"
          className="absolute right-0.5 top-0.5 opacity-35 group-hover:opacity-70 transition-opacity"
        />
      )}
      <span className="text-2xs capitalize flex-1 truncate">{moveName}</span>
    </CommandItem>
  )
}

interface MovesComboboxProps {
  value?: string
  onValueChange?: (
    moveName: string,
    moveType: string,
    damageClass?: 'status' | 'physical' | 'special'
  ) => void
  trigger?: React.ReactNode
  pokemonId?: number
}

export function MovesCombobox({
  value,
  onValueChange,
  trigger,
  pokemonId,
}: MovesComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState('')
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useMoves(pokemonId, open) // Only fetch when combobox is open
  const commandListRef = React.useRef<HTMLDivElement | null>(null)
  const parentRef = React.useRef<HTMLDivElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const isScrollingRef = React.useRef(false)

  // Reset search when popover closes
  React.useEffect(() => {
    if (!open) {
      setSearchValue('')
    }
  }, [open])

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

  // Handle clicks outside the combobox to close it
  React.useEffect(() => {
    if (!open) return

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node

      // Check if click is outside the container and popover content
      const container = containerRef.current
      const popoverContent = document.querySelector(
        '[data-radix-portal][role="dialog"]'
      )

      if (
        container &&
        !container.contains(target) &&
        popoverContent &&
        !popoverContent.contains(target)
      ) {
        setOpen(false)
      }
    }

    // Use capture phase to catch events before they reach TeamPokemon handlers
    // This ensures we close the popover before hover states are triggered
    document.addEventListener('mousedown', handleClickOutside, true)
    document.addEventListener('touchstart', handleClickOutside, true)
    document.addEventListener('click', handleClickOutside, true)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true)
      document.removeEventListener('touchstart', handleClickOutside, true)
      document.removeEventListener('click', handleClickOutside, true)
    }
  }, [open])

  // Flatten all moves from all pages
  const allMoves = React.useMemo(() => {
    if (!data) return []
    return data.pages.flatMap(page => page.results)
  }, [data])

  // Filter moves based on search value
  const filteredMoves = React.useMemo(() => {
    if (!searchValue.trim()) return allMoves
    const searchLower = searchValue.toLowerCase()
    return allMoves.filter(move => {
      return `${move.name}--${move.type}`.toLowerCase().includes(searchLower)
    })
  }, [allMoves, searchValue])

  // Virtualizer for the moves list
  const rowVirtualizer = useVirtualizer({
    count: filteredMoves.length,
    getScrollElement: () => commandListRef.current,
    estimateSize: () => 28, // Estimated height of each move option (py-1 + text-xs)
    overscan: 10, // Render 5 extra items outside viewport
  })

  // Reset virtualizer when opening
  React.useEffect(() => {
    if (open) {
      rowVirtualizer.measure()
    }
  }, [open, rowVirtualizer])

  // Update virtualizer when filtered moves change
  React.useEffect(() => {
    if (open && filteredMoves.length > 0) {
      rowVirtualizer.measure()
    }
  }, [filteredMoves.length, open, rowVirtualizer])

  // Check if we need to load more pages (when data changes or scrolling)
  const virtualItems = rowVirtualizer.getVirtualItems()
  const checkLoadMore = React.useCallback(() => {
    // Skip if already fetching or no more pages
    if (isFetchingNextPage || isLoading || !hasNextPage) return

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
    // console.log(scrollPercentage)
    if (
      scrollPercentage >= 0.8 ||
      (lastItem && lastItem.index >= filteredMoves.length - 20)
    ) {
      //   console.log('fetching next page')
      fetchNextPage()
    }
  }, [
    virtualItems,
    isFetchingNextPage,
    isLoading,
    hasNextPage,
    fetchNextPage,
    rowVirtualizer,
    filteredMoves.length,
  ])

  // Check for more pages when filtered moves change (new data loaded)
  React.useEffect(() => {
    if (open && filteredMoves.length > 0) {
      // Use requestAnimationFrame to ensure virtualizer has updated
      requestAnimationFrame(() => {
        checkLoadMore()
      })
    }
  }, [open, filteredMoves.length, checkLoadMore])

  // Infinite scroll: load next page when scrolling near the bottom
  React.useEffect(() => {
    if (!open) return

    const scrollElement = commandListRef.current
    if (!scrollElement) {
      //   console.log('no scroll element')
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
  }, [open, checkLoadMore])

  const selectedMove = allMoves.find(move => move.name === value)

  const defaultTrigger = (
    <Button
      variant="outline"
      role="combobox"
      aria-expanded={open}
      className="w-full justify-between h-4 p-0 text-xs"
    >
      {selectedMove ? (
        <span className="truncate capitalize">{selectedMove.name}</span>
      ) : (
        <span className="text-gray-400">Select move...</span>
      )}
      <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
    </Button>
  )

  // Handle popover open change - prevent opening if scrolling
  const handleOpenChange = React.useCallback((newOpen: boolean) => {
    // Prevent opening if currently scrolling
    if (newOpen && isScrollingRef.current) {
      return
    }
    setOpen(newOpen)
  }, [])

  return (
    <div ref={containerRef} className="relative group">
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>{trigger || defaultTrigger}</PopoverTrigger>
        <PopoverContent
          className="w-[137.5px] p-0 overflow-hidden"
          align="start"
          onClick={e => e.stopPropagation()}
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search move..."
              className="h-4 text-3xs"
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList
              className="max-h-[30vh] sm:max-h-[300px] overflow-auto"
              ref={commandListRef}
            >
              {isLoading ? (
                <CommandEmpty>Loading moves...</CommandEmpty>
              ) : filteredMoves.length === 0 ? (
                <CommandEmpty>No move found.</CommandEmpty>
              ) : null}
              <CommandGroup
                ref={parentRef}
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  width: '100%',
                  position: 'relative',
                }}
              >
                {filteredMoves.length === 0
                  ? null
                  : rowVirtualizer.getVirtualItems().map(virtualItem => {
                      const move = filteredMoves[virtualItem.index]
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
                          <MovesOption
                            move={move}
                            value={value}
                            containerRef={commandListRef}
                            onSelect={currentValue => {
                              if (currentValue === value) {
                                onValueChange?.('', '', undefined)
                              } else {
                                onValueChange?.(
                                  move.name,
                                  move.type,
                                  move.damage_class
                                )
                              }
                              setOpen(false)
                            }}
                          />
                        </div>
                      )
                    })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {value && (
        <button
          onClick={e => {
            e.stopPropagation()
            onValueChange?.('', '')
          }}
          className="absolute -right-4 top-0 w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-opacity opacity-0 group-hover:opacity-100 z-10"
          aria-label="Clear move"
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
