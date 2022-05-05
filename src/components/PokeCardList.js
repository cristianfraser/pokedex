import styled from 'styled-components';
import { useEffect, useRef, useState } from 'react';
import { useInfiniteQuery } from 'react-query';
import { useInView } from 'react-intersection-observer';

import PokeCard, { EmptyPokeCard } from './PokeCard';
import TypeSelect from './TypeSelect';
import Input from './Input';

const PAGE_SIZE = 10;

const Container = styled.div``;

const FilterContainer = styled.div``;

const CardContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;

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
  const debounce = useRef(null);

  const {
    status,
    data,
    error,
    isFetching,
    isLoading,
    isFetchingNextPage,
    isFetchingPreviousPage,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
  } = useInfiniteQuery(
    ['pokemons', searchQuery, typeSelect, typeSelect2],
    async ({ pageParam = 0 }) => {
      const res = await fetch(
        `/pokemon/?limit=${PAGE_SIZE}&offset=${
          pageParam * PAGE_SIZE
        }&q=${searchQuery}&type1=${typeSelect}&&type2=${typeSelect2}`
      ).then((res) => res.json());
      setTotal(res.count);

      return res.results;
    },
    {
      keepPreviousData: true,
      getNextPageParam: (lastPage, allPages) => {
        const maxPage = Math.ceil(total / PAGE_SIZE);

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
  }, [inView]);

  const pokemons = [];

  data?.pages.forEach((page) => {
    pokemons.push(...page);
  });

  console.log({ pokemons, isFetching, isLoading });
  return (
    <Container>
      <FilterContainer>
        <h3>Search Pokemon:</h3>
        <label htmlFor="nameFilter">by name:</label>
        <Input
          id="nameFilter"
          value={filterInput}
          onChange={(event) => {
            clearTimeout(debounce.current);
            const value = event.target.value;
            setFilterInput(event.target.value);

            debounce.current = setTimeout(() => {
              setSearchQuery(value);
            }, 500);
          }}
        />

        <label>
          by type:
          <TypeSelect value={typeSelect} onChange={setTypeSelect} />
        </label>

        <label>
          by type:
          <TypeSelect value={typeSelect2} onChange={setTypeSelect2} />
        </label>
      </FilterContainer>
      <CardContainer isLoading={isFetching && !isFetchingNextPage}>
        {pokemons.map((pokemon) => (
          <PokeCard key={pokemon.id} pokemon={pokemon} />
        ))}
        {hasNextPage && (
          <div ref={ref} style={{ width: '100%' }}>
            loading more...
          </div>
        )}
      </CardContainer>
    </Container>
  );
}

export default PokeCardList;
