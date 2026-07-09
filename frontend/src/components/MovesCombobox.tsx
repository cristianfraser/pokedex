'use client'

import * as React from 'react'
import { ChevronsUpDown } from 'lucide-react'
import { Button, Combobox, CommandItem } from '@crfrsr/ui'
import { useMoves } from '@/queries/moves'
import TypePill from './TypePill'
import { cn } from '@/lib/utils'

interface MovesOptionProps {
  move: { name: string; type: string; id: number }
  value?: string
  onSelect: (currentValue: string) => void
  containerRef: React.RefObject<HTMLElement | null>
  disabled?: boolean
}

function MovesOption({
  move,
  value,
  onSelect,
  containerRef: _containerRef,
  disabled = false,
}: MovesOptionProps) {
  const { name: moveName, type: moveType } = move

  return (
    <CommandItem
      value={moveName}
      onSelect={currentValue => {
        if (disabled) return
        onSelect(currentValue === value ? '' : currentValue)
      }}
      onClick={e => {
        if (disabled) {
          e.preventDefault()
          e.stopPropagation()
          return
        }
        e.stopPropagation()
      }}
      disabled={disabled}
      className={cn(
        'flex items-center gap-2 relative py-1 text-xs group',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
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
  selectedMoves?: string[] // Array of move names that are already selected for this pokemon
}

export function MovesCombobox({
  value,
  onValueChange,
  trigger,
  pokemonId,
  selectedMoves = [],
}: MovesComboboxProps) {
  const [searchValue, setSearchValue] = React.useState('')
  const { data: allMoves = [], isLoading } = useMoves(pokemonId)

  // Filter moves based on search value
  const filteredMoves = React.useMemo(() => {
    if (!searchValue.trim()) return allMoves
    const searchLower = searchValue.toLowerCase()
    return allMoves.filter(move => {
      return `${move.name}--${move.type}`.toLowerCase().includes(searchLower)
    })
  }, [allMoves, searchValue])

  const selectedMove = allMoves.find(move => move.name === value)

  const defaultTrigger = (
    <Button
      variant="outline"
      role="combobox"
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

  return (
    <Combobox
      options={allMoves}
      filteredOptions={filteredMoves}
      isLoading={isLoading}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      onSelect={move => {
        if (move.name === value) {
          onValueChange?.('', '', undefined)
        } else {
          onValueChange?.(move.name, move.type, move.damage_class)
        }
      }}
      trigger={trigger || defaultTrigger}
      renderOption={(move, _index, onSelectOption) => {
        // Disable if move is already selected in another slot
        const isDisabled = selectedMoves.includes(move.name)
        return (
          <MovesOption
            move={move}
            value={value}
            containerRef={React.createRef()}
            disabled={isDisabled}
            onSelect={currentValue => {
              if (currentValue === value) {
                onValueChange?.('', '', undefined)
              } else {
                onValueChange?.(move.name, move.type, move.damage_class)
              }
              onSelectOption()
            }}
          />
        )
      }}
      placeholder="Search move..."
      emptyMessage="No move found."
      loadingMessage="Loading moves..."
      popoverWidth="137.5px"
      inputClassName="h-4 text-3xs"
      estimateItemSize={28}
      showClearButton={!!value}
      onClear={() => onValueChange?.('', '')}
      value={value}
    />
  )
}
