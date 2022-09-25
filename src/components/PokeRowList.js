import styled from 'styled-components';
import { useRef, useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import Measure from 'react-measure';

import PokeCard from './PokeCard';
import TypeSelect from './TypeSelect';
import Input from './Input';
import Spinner from './Spinner';
import Checkbox from './Checkbox';
import { useGetPokedexQuery, useInfinitePokedexQuery } from '../queries';
import { Outlet, useParams } from 'react-router-dom';
import PokeRow from './PokeRow';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';

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

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: 60px;
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
  ${({ isLoading }) => {
    if (isLoading)
      return `
        opacity: 0.7;
        pointer-events: none;
      `;
  }}
`;

function PokeRowList() {
  const { pokedexName } = useParams();
  const [filterInput, setFilterInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [additionalSelectedType, setAdditionalFilterType] = useState('');
  const [showShiny, setShowShiny] = useState(false);
  const debounce = useRef(null);

  const { ref: inViewRef, inView } = useInView();

  const {
    pokedexLabel,
    pokemonList,
    isFetching,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfinitePokedexQuery({
    name: pokedexName,
    searchQuery,
    type1: filterType,
    type2: additionalSelectedType,
  });

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView]);

  return (
    <Container>
      <H1>{pokedexLabel} Pokédex</H1>
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

      <div style={{ position: 'relative', flex: 1 }}>
        <CardContainer
          // className={className}
          isLoading={isFetching && !isFetchingNextPage}
        >
          {pokemonList.map((pokemon) => {
            return <PokeRow pokemon={pokemon} showShiny={showShiny} />;
          })}
          {isFetching && !isFetchingNextPage && (
            <SpinnerContainer>
              <Spinner />
            </SpinnerContainer>
          )}
          {!isFetching && !isFetchingNextPage && !pokemonList.length && (
            <SpinnerContainer style={{ top: 100 }}>
              No criteria matching Pokémon found.
            </SpinnerContainer>
          )}
          {hasNextPage && (
            <div
              ref={inViewRef}
              style={{ width: '100%', textAlign: 'center', padding: 40 }}
            >
              <Spinner />
            </div>
          )}
        </CardContainer>
      </div>

      <Outlet />
    </Container>
  );
}

export default PokeRowList;
