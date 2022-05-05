import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { useInfiniteQuery } from 'react-query';
import { useInView } from 'react-intersection-observer';

import PokeCard, { EmptyPokeCard } from './PokeCard';
import TypeSelect from './TypeSelect';

const PAGE_SIZE = 10;

const Container = styled.div``;

const FilterContainer = styled.div``;

const CardContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
`;

function PokeCardList() {
  const [filterInput, setFilterInput] = useState('');
  const [typeSelect, setTypeSelect] = useState('');
  const [total, setTotal] = useState(0);
  const { ref, inView } = useInView();

  const {
    status,
    data,
    error,
    isFetching,
    isFetchingNextPage,
    isFetchingPreviousPage,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
  } = useInfiniteQuery(
    ['pokemons', filterInput],
    async ({ pageParam = 0 }) => {
      const res = await fetch(
        `/pokemon/?limit=${PAGE_SIZE}&offset=${
          pageParam * PAGE_SIZE
        }&q=${filterInput}`
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

  console.log({ pokemons });
  return (
    <Container>
      <FilterContainer>
        <h3>Search Pokemon:</h3>
        <label htmlFor="nameFilter">by name:</label>
        <input
          id="nameFilter"
          value={filterInput}
          onChange={(event) => setFilterInput(event.target.value)}
        />

        <TypeSelect value={typeSelect} onChange={setTypeSelect} />
      </FilterContainer>
      <CardContainer>
        {pokemons.map((pokemon) => (
          <PokeCard key={pokemon.id} pokemon={pokemon} />
        ))}
        {hasNextPage && (
          <div ref={ref}>
            <EmptyPokeCard />
          </div>
        )}
      </CardContainer>
    </Container>
  );
}

export default PokeCardList;
