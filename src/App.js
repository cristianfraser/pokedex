import { useEffect, useState } from 'react';
import { useInfiniteQuery } from 'react-query';
import PokeCardList from './components/PokeCardList';

function App() {
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
    'pokemons',
    async ({ pageParam = 0 }) => {
      const res = await fetch(
        pageParam === 0
          ? 'https://pokeapi.co/api/v2/pokemon/?limit=10'
          : pageParam
      ).then((res) => res.json());
      console.log({ res, pageParam });
      // return res.results;
      return { data: res.results, nextPage: res.next };
    },
    {
      // getPreviousPageParam: (firstPage) => firstPage.previousId ?? undefined,
      getNextPageParam: (lastPage) => {
        console.log({ lastPage });

        return lastPage.nextPage ?? undefined;
      },
    }
  );

  console.log({ data });

  const pokemons = [];

  data?.pages.forEach((page) => {
    pokemons.push(...page.data);
  });

  console.log({ pokemons });

  return (
    <div>
      <header></header>
      <button onClick={fetchNextPage}>load more</button>
      <main>
        <PokeCardList pokemons={pokemons} />
      </main>
    </div>
  );
}

export default App;
