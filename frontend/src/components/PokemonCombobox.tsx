'use client'

import * as React from 'react'
import { ChevronsUpDown } from 'lucide-react'
import { Button, Combobox, CommandItem } from '@crfrsr/ui'
import { useAllPokemonBasic } from '@/queries/pokemon'

interface PokemonOptionProps {
  pokemon: { name: string; id: number; pokedex_number: number }
  onSelect: () => void
}

function PokemonOption({ pokemon, onSelect }: PokemonOptionProps) {
  const { name } = pokemon

  return (
    <CommandItem
      value={name}
      onSelect={onSelect}
      onClick={e => e.stopPropagation()}
      className="flex items-center gap-2 relative py-1 text-xs"
    >
      <span className="text-2xs capitalize flex-1 truncate">
        #{pokemon.pokedex_number} {name}
      </span>
    </CommandItem>
  )
}

interface PokemonComboboxProps {
  value?: number
  onValueChange?: (pokemonId: number) => void
  trigger?: React.ReactNode
}

export function PokemonCombobox({
  value,
  onValueChange,
  trigger,
}: PokemonComboboxProps) {
  const [searchValue, setSearchValue] = React.useState('')
  const { data: allPokemon, isLoading } = useAllPokemonBasic()

  // Filter pokemon based on search
  const filteredPokemon = React.useMemo(() => {
    if (!allPokemon) return []
    if (!searchValue.trim()) return allPokemon

    const search = searchValue.toLowerCase().trim()
    return allPokemon.filter(
      p =>
        p.name.toLowerCase().includes(search) ||
        p.id.toString().includes(search) ||
        p.pokedex_number.toString().includes(search)
    )
  }, [allPokemon, searchValue])

  const selectedPokemon = allPokemon?.find(p => p.id === value)

  const defaultTrigger = (
    <Button
      variant="outline"
      role="combobox"
      className="w-full justify-between h-4 p-0 text-xs"
    >
      {selectedPokemon ? (
        <span className="truncate capitalize">
          #{selectedPokemon.pokedex_number} {selectedPokemon.name}
        </span>
      ) : (
        <span className="text-gray-400">Select pokemon...</span>
      )}
      <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
    </Button>
  )

  return (
    <Combobox
      options={allPokemon || []}
      filteredOptions={filteredPokemon}
      isLoading={isLoading}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      onSelect={pokemon => {
        onValueChange?.(pokemon.id)
      }}
      trigger={trigger || defaultTrigger}
      renderOption={(pokemon, _index, onSelectOption) => (
        <PokemonOption pokemon={pokemon} onSelect={onSelectOption} />
      )}
      placeholder="Search pokemon..."
      emptyMessage="No pokemon found."
      loadingMessage="Loading pokemon..."
      popoverWidth="200px"
      inputClassName="h-4 text-3xs"
      estimateItemSize={28}
    />
  )
}
