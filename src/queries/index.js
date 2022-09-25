import { useState } from 'react';
import { useInfiniteQuery, useQuery } from 'react-query';

const getPokemonName = (pokemonNames, lang = 'en') => {
  return pokemonNames.find((info) => info.language.name === lang).name;
};

const getPokedexNumber = (pokemonNumbers, pokedex = 'national') => {
  return pokemonNumbers.find((info) => info.pokedex.name === pokedex)
    .entry_number;
};

const getPokedexName = (pokedexNames = [], lang = 'en') => {
  return pokedexNames.find((info) => info.language?.name === lang)?.name || '';
};

export function useGetPokemonDetailQuery({ pokemon, enabled }) {
  const { data, ...query } = useQuery(
    ['pokemon', pokemon],
    async () => {
      const res2 = await fetch(
        `https://pokeapi.co/api/v2/pokemon-species/${pokemon}`
      ).then((res) => res.json());
      const res = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${res2.id}`
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
      staleTime: Infinity,
      enabled,
    }
  );

  return {
    pokemon: data,
    ...query,
  };
}

export function useGetPokedexQuery({
  name = 'national',
  searchQuery,
  type1,
  type2,
}) {
  const { data, ...query } = useQuery(
    ['pokedex', name],
    async () => {
      const res = await fetch(
        `https://pokeapi.co/api/v2/pokedex/${name}/`
      ).then((res) => res.json());

      return res.pokemon_entries;
    },
    {
      keepPreviousData: true,
    }
  );

  const type1Query = useQuery(
    ['type', type1],
    async () => {
      const res = await fetch(`https://pokeapi.co/api/v2/type/${type1}`).then(
        (res) => res.json()
      );

      const result = {};

      res.pokemon.forEach(({ pokemon }) => {
        result[pokemon.name] = true;
      });

      return result;
    },
    {
      keepPreviousData: true,
      enabled: !!type1,
    }
  );

  const type2Query = useQuery(
    ['type', type2],
    async () => {
      const res = await fetch(`https://pokeapi.co/api/v2/type/${type2}`).then(
        (res) => res.json()
      );

      const result = {};

      res.pokemon.forEach(({ pokemon }) => {
        result[pokemon.name] = true;
      });

      return result;
    },
    {
      keepPreviousData: true,
      enabled: !!type2,
    }
  );

  const pokemonEntries = (data || [])
    .filter((entry) => {
      if (searchQuery) {
        const numberQuery = parseInt(searchQuery, 10);

        return (
          entry.pokemon_species.name.includes(searchQuery) ||
          entry.entry_number === numberQuery
        );
      } else {
        return true;
      }
    })
    .filter((entry) => {
      if (type1 && type1Query.data) {
        return type1Query.data[entry.pokemon_species.name];
      } else {
        return true;
      }
    })
    .filter((entry) => {
      if (type2 && type2Query.data) {
        return type2Query.data[entry.pokemon_species.name];
      } else {
        return true;
      }
    });

  return {
    pokemonEntries,
    ...query,
  };
}

export const useInfinitePokedexQuery = ({
  name = 'national',
  searchQuery,
  type1,
  type2,
  pageSize = 25,
}) => {
  const { data: pokedexData, ...pokedexQuery } = useQuery(
    ['pokedex', name],
    async () => {
      const res = await fetch(
        `https://pokeapi.co/api/v2/pokedex/${name}/`
      ).then((res) => res.json());

      return res;
    },
    {
      keepPreviousData: true,
    }
  );

  const type1Query = useQuery(
    ['type', type1],
    async () => {
      const res = await fetch(`https://pokeapi.co/api/v2/type/${type1}`).then(
        (res) => res.json()
      );

      const result = {};

      res.pokemon.forEach(({ pokemon }) => {
        result[pokemon.name] = true;
      });

      return result;
    },
    {
      keepPreviousData: true,
      enabled: !!type1,
    }
  );

  const type2Query = useQuery(
    ['type', type2],
    async () => {
      const res = await fetch(`https://pokeapi.co/api/v2/type/${type2}`).then(
        (res) => res.json()
      );

      const result = {};

      res.pokemon.forEach(({ pokemon }) => {
        result[pokemon.name] = true;
      });

      return result;
    },
    {
      keepPreviousData: true,
      enabled: !!type2,
    }
  );

  const [total, setTotal] = useState(0);

  console.log({ pokedexData });

  const pokemonToQuery = (pokedexData?.pokemon_entries || [])
    .filter((entry) => {
      if (searchQuery) {
        const numberQuery = parseInt(searchQuery, 10);

        return (
          entry.pokemon_species.name.includes(searchQuery) ||
          entry.entry_number === numberQuery
        );
      } else {
        return true;
      }
    })
    .filter((entry) => {
      if (type1 && type1Query.data) {
        return type1Query.data[entry.pokemon_species.name];
      } else {
        return true;
      }
    })
    .filter((entry) => {
      if (type2 && type2Query.data) {
        return type2Query.data[entry.pokemon_species.name];
      } else {
        return true;
      }
    });

  const { ...query } = useInfiniteQuery(
    ['pokemons', pokemonToQuery, searchQuery, name, type1, type2],
    async ({ pageParam = 0 }) => {
      const pokemonSpeciesPromiseArray = [];

      const pokemonToQueryPage = pokemonToQuery.filter(
        (p, index) =>
          index >= pageParam * pageSize && index < (pageParam + 1) * pageSize
      );

      pokemonToQueryPage.forEach((pokeToQuery) => {
        pokemonSpeciesPromiseArray.push(
          fetch(
            `https://pokeapi.co/api/v2/pokemon-species/${pokeToQuery.pokemon_species.name}`
          ).then((res) => res.json())
        );
      });

      setTotal(pokemonToQuery.length);

      const pokemonSpecies = await Promise.all(pokemonSpeciesPromiseArray);

      const pokemonPromiseArray = [];
      pokemonSpecies.forEach((pokemonSpecies) => {
        pokemonPromiseArray.push(
          fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonSpecies.id}`).then(
            (res) => res.json()
          )
        );
      });

      const pokemon = await Promise.all(pokemonPromiseArray);

      console.log({
        pokemonToQuery,
        pokemonToQueryPage,
        pokemonSpecies,
        pokemon,
      });
      const results = pokemon.map((pokemon, index) => {
        console.log({ caca: pokemon });
        return {
          ...pokemon,
          ...pokemonSpecies[index],
          name: getPokemonName(pokemonSpecies[index].names),
          pokedexNumber: getPokedexNumber(
            pokemonSpecies[index].pokedex_numbers,
            pokedexData?.name
          ),
        };
      });

      return results;
    },
    {
      keepPreviousData: true,
      getNextPageParam: (lastPage, allPages) => {
        const maxPage = Math.ceil(total / pageSize);

        // console.log({
        //   maxPage,
        //   allPagesLength: allPages.length,
        //   allPages,
        // });

        return allPages.length >= maxPage ? undefined : allPages.length;
      },
    }
  );

  const pokemonEntries = [];

  query.data?.pages.forEach((page) => {
    pokemonEntries.push(...page);
  });

  return {
    ...query,
    pokemonList: pokemonEntries,
    pokedexLabel: getPokedexName(pokedexData?.names || [], 'en'),
  };
};

export function useGetTypePokemonQuery({ type }) {
  const { data, ...query } = useQuery(
    ['pokemon', type],
    async () => {
      const res = await fetch(`https://pokeapi.co/api/v2/type/${type}`).then(
        (res) => res.json()
      );

      const result = {};

      res.pokemon.forEach(({ name }) => {
        result[name] = true;
      });

      return result;
    },
    {
      keepPreviousData: true,
    }
  );

  return {
    pokemonEntries: data || {},
    ...query,
  };
}
