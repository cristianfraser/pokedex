import styled from 'styled-components';
import { useRef, useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import Measure from 'react-measure';

import PokeCard from './PokeCard';
import TypeSelect from './TypeSelect';
import Input from './Input';
import Spinner from './Spinner';
import Checkbox from './Checkbox';
import { useGetPokedexQuery } from '../queries';
import { Outlet, useParams } from 'react-router-dom';
import PokeRow from './PokeRow';

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
  height: 100%;
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
  const [dimensions, setDimensions] = useState({
    width: 500,
    height: 300,
  });
  const [filterInput, setFilterInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [additionalSelectedType, setAdditionalFilterType] = useState('');
  const [showShiny, setShowShiny] = useState(false);
  const debounce = useRef(null);

  const { pokemonEntries, isFetching } = useGetPokedexQuery({
    name: pokedexName,
    searchQuery,
    type1: filterType,
    type2: additionalSelectedType,
  });

  const PokeRowRow = ({ index, style, data }) => {
    console.log({ data: data[index] });
    return (
      <PokeRow
        pokemonName={data[index].pokemon_species.name}
        pokemonNumber={data[index].entry_number}
        style={style}
      />
    );
  };

  return (
    <Container>
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

      <Measure
        bounds
        onResize={(contentRect) => {
          setDimensions(contentRect.bounds);
        }}
      >
        {({ measureRef }) => (
          <div ref={measureRef} style={{ position: 'relative', flex: 1 }}>
            <CardContainer
              // className={className}
              isLoading={isFetching}
            >
              <List
                itemCount={pokemonEntries.length}
                itemSize={90}
                width={dimensions.width}
                height={dimensions.height}
                itemData={pokemonEntries}
                overscanCount={5}
              >
                {PokeRowRow}
                {/* {pokemonEntries.map((pokemon) => (
              <div
                key={pokemon.entry_number}
                pokemonNumber={pokemon.entry_number}
                pokemonName={pokemon.pokemon_species.name}
                showShiny={showShiny}
              >
                {pokemon.entry_number}
                {pokemon.pokemon_species.name}
              </div>
            ))} */}
              </List>
            </CardContainer>
            {isFetching && (
              <SpinnerContainer>
                <Spinner />
              </SpinnerContainer>
            )}
            {!isFetching && !pokemonEntries.length && (
              <SpinnerContainer style={{ top: 100 }}>
                No criteria matching Pokémon found.
              </SpinnerContainer>
            )}
          </div>
        )}
      </Measure>

      <Outlet />
    </Container>
  );
}

export default PokeRowList;
