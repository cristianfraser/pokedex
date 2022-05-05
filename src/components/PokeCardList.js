import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { useInfiniteQuery } from 'react-query';
import { useInView } from 'react-intersection-observer';

import PokeCard from './PokeCard';

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
      console.log({ pageParam });
      const res = await fetch(
        `https://pokeapi.co/api/v2/pokemon/?limit=${PAGE_SIZE}&offset=${
          pageParam * PAGE_SIZE
        }&q=${filterInput}`
      ).then((res) => res.json());
      setTotal(res.count);

      return res.results;
    },
    {
      getNextPageParam: (lastPage, allPages) => {
        // todo: return undefined on last page
        const maxPage = Math.ceil(total / PAGE_SIZE);
        return allPages.length === maxPage ? undefined : allPages.length;
      },
    }
  );

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView]);

  console.log({ data });

  const pokemons = [];

  data?.pages.forEach((page) => {
    console.log({ data, page });
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
      </FilterContainer>
      <CardContainer>
        {pokemons.map((pokemon) => (
          <PokeCard
            key={pokemon.pokemon_species.name}
            name={pokemon.pokemon_species.name}
            number={pokemon.pokemon_species.number}
            url={pokemon.pokemon_species.url}
          />
        ))}
        <div ref={ref} />
      </CardContainer>
    </Container>
  );
}

export default PokeCardList;
