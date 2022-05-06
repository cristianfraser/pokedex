import { useState } from 'react';
import { useInfiniteQuery } from 'react-query';

export default function useGetPokemonQuery({
  searchQuery,
  filterType,
  additionalAdditionalSelectedType,
  pageSize = 10,
}) {
  const [total, setTotal] = useState(0);
  const { data, ...query } = useInfiniteQuery(
    [
      'pokemons',
      searchQuery,
      filterType,
      additionalAdditionalSelectedType,
      pageSize,
    ],
    async ({ pageParam = 0 }) => {
      const res = await fetch(
        `/pokemon/?limit=${pageSize}&offset=${
          pageParam * pageSize
        }&q=${searchQuery}&type1=${filterType}&&type2=${additionalAdditionalSelectedType}`
      ).then((res) => res.json());
      setTotal(res.count);

      return res.results;
    },
    {
      keepPreviousData: true,
      getNextPageParam: (lastPage, allPages) => {
        const maxPage = Math.ceil(total / pageSize);

        return allPages.length >= maxPage ? undefined : allPages.length;
      },
    }
  );

  const pokemon = [];

  data?.pages.forEach((page) => {
    pokemon.push(...page);
  });

  return {
    pokemon,
    total,
    ...query,
  };
}
