import styled from 'styled-components';
import { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';

import PokeCard from './PokeCard';
import TypeSelect from './TypeSelect';
import Input from './Input';
import Spinner from './Spinner';
import Checkbox from './Checkbox';
import { useGetPokedexQuery } from '../queries';
import { Outlet } from 'react-router-dom';

const H1 = styled.h1`
  font-weight: 800;
  font-size: 1.5rem;
  margin-block-end: 30px;
`;

const H2 = styled.h2`
  font-weight: 800;
  font-size: 1.2rem;
  margin-block-end: 10px;
`;

const Label = styled.label`
  display: inline-flex;
  flex-direction: column;
  font-weight: 600;
  font-size: 0.75rem;

  &:not(:last-child) {
    margin-inline-end: 5px;
  }
`;

const SpinnerContainer = styled.div`
  position: absolute;
  right: 50%;
  top: 250px;
  transform: translate(50%, -50%);
`;

const FilterContainer = styled.div`
  margin-block-end: 30px;
`;

const CardContainer = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: repeat(auto-fit, 200px);
  grid-gap: 20px;
  justify-content: center;

  ${({ isLoading }) => {
    if (isLoading)
      return `
        opacity: 0.7;
        pointer-events: none;
      `;
  }}
`;

function PokeCardList() {
  const [filterInput, setFilterInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [additionalSelectedType, setAdditionalFilterType] = useState('');
  const { ref, inView } = useInView();
  const [showShiny, setShowShiny] = useState(false);
  const debounce = useRef(null);

  const {
    pokemonEntries,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useGetPokedexQuery({
    searchQuery,
    type1: filterType,
    type2: additionalSelectedType,
  });

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  return (
    <>
      <H1>National Pokédex</H1>
      <FilterContainer>
        <H2>Search Pokémon</H2>
        <Label htmlFor="nameFilter">
          <span>by name, pokédex #</span>
          <Input
            style={{ width: 250 }}
            id="nameFilter"
            value={filterInput}
            placeholder="e. g.: Pikachu, 151"
            onChange={(event) => {
              clearTimeout(debounce.current);
              const value = event.target.value;
              setFilterInput(event.target.value);

              debounce.current = setTimeout(() => {
                setSearchQuery(value);
              }, 500);
            }}
          />
        </Label>

        <Label>
          <span>by type</span>
          <TypeSelect
            value={filterType}
            filter={additionalSelectedType}
            onChange={setFilterType}
          />
        </Label>

        {(!!filterType || !!additionalSelectedType) && (
          <Label>
            <span>by additional type</span>
            <TypeSelect
              value={additionalSelectedType}
              filter={filterType}
              onChange={setAdditionalFilterType}
            />
          </Label>
        )}

        <div>
          <Label style={{ flexDirection: 'row', marginBlockStart: 10 }}>
            <Checkbox
              checked={showShiny}
              onChange={(event) => {
                setShowShiny(event.target.checked);
              }}
            />
            <span style={{ marginLeft: 5 }}>Show shiny forms</span>
          </Label>
        </div>
      </FilterContainer>
      <div style={{ position: 'relative' }}>
        <CardContainer isLoading={isFetching && !isFetchingNextPage}>
          {pokemonEntries.map((pokemon) => (
            <PokeCard
              key={pokemon.entry_number}
              pokemonNumber={pokemon.entry_number}
              pokemonName={pokemon.pokemon_species.name}
              showShiny={showShiny}
            />
          ))}
        </CardContainer>
        {isFetching && !isFetchingNextPage && (
          <SpinnerContainer>
            <Spinner />
          </SpinnerContainer>
        )}
        {!isFetching && !isFetchingNextPage && !pokemonEntries.length && (
          <SpinnerContainer style={{ top: 100 }}>
            No criteria matching Pokémon found.
          </SpinnerContainer>
        )}
      </div>
      {hasNextPage && (
        <div
          ref={ref}
          style={{ width: '100%', textAlign: 'center', padding: 40 }}
        >
          <Spinner />
        </div>
      )}

      <Outlet />
    </>
  );
}

export default PokeCardList;
