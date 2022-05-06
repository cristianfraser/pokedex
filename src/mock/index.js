import { createServer } from 'miragejs';
import { pokemon_entries } from './data';

const getPokemonName = (pokemonNames, lang = 'en') => {
  return pokemonNames.find((info) => info.language.name === lang).name;
};

createServer({
  routes() {
    this.passthrough();
    this.passthrough('https://pokeapi.co/api/v2/**');

    this.get(
      '/pokemon',
      async (schema, request) => {
        const {
          limit = 0,
          offset = 0,
          q = '',
          type1 = '',
          type2 = '',
        } = request.queryParams;
        const parsedLimit = parseInt(limit, 10);
        const parsedOffset = parseInt(offset, 10);

        let typePokemon1 = [];
        let typePokemon2 = [];
        if (type1) {
          const typeRes = await fetch(
            `https://pokeapi.co/api/v2/type/${type1}`
          ).then((res) => res.json());

          typePokemon1 = typeRes.pokemon; // array
        }
        if (type2) {
          const typeRes = await fetch(
            `https://pokeapi.co/api/v2/type/${type2}`
          ).then((res) => res.json());

          typePokemon2 = typeRes.pokemon; // array
        }

        const poke_raw = pokemon_entries.filter(
          (pokemon) =>
            (!q ||
              `${pokemon.entry_number} ${pokemon.pokemon_species.name}`.includes(
                q.toLowerCase()
              )) &&
            (!type1 ||
              typePokemon1.find(
                (typePoke) =>
                  typePoke.pokemon.name === pokemon.pokemon_species.name
              )) &&
            (!type2 ||
              typePokemon2.find(
                (typePoke) =>
                  typePoke.pokemon.name === pokemon.pokemon_species.name
              ))
        );

        const poke_raw_sliced = poke_raw.slice(
          parsedOffset,
          parsedOffset + parsedLimit
        );

        const promises = poke_raw_sliced.map((entry) => {
          return fetch(entry.pokemon_species.url)
            .then((res) => res.json())
            .then(async (pokemonSpecies) => {
              const pokemonUrl = pokemonSpecies.varieties.filter(
                (variety) => !!variety.is_default
              )[0].pokemon.url;

              const pokemon = await fetch(pokemonUrl).then((res) => res.json());

              return {
                ...pokemonSpecies,
                ...pokemon,
              };
            });
        });

        const res = await Promise.all(promises);

        return {
          count: poke_raw.length,
          results: res.map((r, index) => ({
            ...r,
            pokedexNumber: poke_raw_sliced[index].entry_number,
            name: getPokemonName(r.names),
          })),
        };
      },
      { timing: 300 }
    );
  },
});
