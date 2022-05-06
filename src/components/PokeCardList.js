import styled from 'styled-components';
import { useEffect, useRef, useState } from 'react';
import { useInfiniteQuery } from 'react-query';
import { useInView } from 'react-intersection-observer';

import PokeCard from './PokeCard';
import TypeSelect from './TypeSelect';
import Input from './Input';
import Spinner from './Spinner';
import Checkbox from './Checkbox';

const PAGE_SIZE = 10;

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

const Container = styled.div``;

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
  const [typeSelect, setTypeSelect] = useState('');
  const [typeSelect2, setTypeSelect2] = useState('');
  const [total, setTotal] = useState(0);
  const { ref, inView } = useInView();
  const [searchQuery, setSearchQuery] = useState('');
  const [showShiny, setShowShiny] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const debounce = useRef(null);

  const {
    data,
    isFetching,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery(
    ['pokemons', searchQuery, typeSelect, typeSelect2, pageSize],
    async ({ pageParam = 0 }) => {
      const res = await fetch(
        `/pokemon/?limit=${pageSize}&offset=${
          pageParam * pageSize
        }&q=${searchQuery}&type1=${typeSelect}&&type2=${typeSelect2}`
      ).then((res) => res.json());
      setTotal(res.count);

      return res.results;
    },
    {
      keepPreviousData: true,
      getNextPageParam: (lastPage, allPages) => {
        const maxPage = Math.ceil(total / pageSize);

        console.log({
          maxPage,
          allPagesLength: allPages.length,
          allPages,
        });

        return allPages.length >= maxPage ? undefined : allPages.length;
      },
    }
  );

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  const pokemons = [];

  data?.pages.forEach((page) => {
    pokemons.push(...page);
  });

  console.log({ pokemons, isFetching, isLoading });
  return (
    <Container>
      <H1>National Pokédex</H1>
      <FilterContainer>
        <H2>Search Pokémon</H2>
        <div style={{ marginBlockEnd: 5 }}>
          <Label>
            <span>page size</span>
            <Input
              as="select"
              value={pageSize}
              onChange={(event) =>
                setPageSize(parseInt(event.target.value, 10))
              }
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="40">40</option>
            </Input>
          </Label>
        </div>
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
          <TypeSelect value={typeSelect} onChange={setTypeSelect} />
        </Label>

        {(!!typeSelect || !!typeSelect2) && (
          <Label>
            <span>by additional type</span>
            <TypeSelect value={typeSelect2} onChange={setTypeSelect2} />
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
          {pokemons.map((pokemon) => (
            <PokeCard
              key={pokemon.id}
              pokemon={pokemon}
              showShiny={showShiny}
            />
          ))}
        </CardContainer>
        {isFetching && !isFetchingNextPage && (
          <SpinnerContainer>
            <Spinner />
          </SpinnerContainer>
        )}
        {!isFetching && !isFetchingNextPage && !pokemons.length && (
          <SpinnerContainer style={{ top: 100 }}>
            No Pokémon matching criteria found.
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
    </Container>
  );
}

export default PokeCardList;
