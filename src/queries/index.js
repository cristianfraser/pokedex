import { useState } from 'react';
import { useInfiniteQuery, useQuery } from 'react-query';

export function useGetPokemonQuery({
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

const getPokemonName = (pokemonNames, lang = 'en') => {
  return pokemonNames.find((info) => info.language.name === lang).name;
};

const getPokedexNumber = (pokemonNumbers, pokedex = 'national') => {
  return pokemonNumbers.find((info) => info.pokedex.name === pokedex)
    .entry_number;
};

export function useGetPokemonDetailQuery({ pokemon, enabled }) {
  const { data, ...query } = useQuery(
    ['pokemon', pokemon],
    async () => {
      const res = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${pokemon}`
      ).then((res) => res.json());
      const res2 = await fetch(
        `https://pokeapi.co/api/v2/pokemon-species/${pokemon}`
      ).then((res) => res.json());

      return {
        ...res,
        ...res2,
        name: getPokemonName(res2.names),
        pokedexNumber: getPokedexNumber(res2.pokedex_numbers),
      };
    },
    {
      keepPreviousData: true,
      enabled,
    }
  );

  return {
    pokemon: data,
    ...query,
  };
}

export function useGetPokedexQuery() {
  const { data, ...query } = useQuery(
    ['pokedex', 'national'],
    async () => {
      const res = await fetch(`https://pokeapi.co/api/v2/pokedex/1/`).then(
        (res) => res.json()
      );

      return res.pokemon_entries;
    },
    {
      keepPreviousData: true,
    }
  );

  return {
    pokemonEntries: data || [],
    ...query,
  };
}
