import { createServer } from 'miragejs';
import { pokemon_entries } from './data';

const getPokemonName = (pokemonNames, lang = 'en') => {
  return pokemonNames.find((info) => info.language.name === lang).name;
};

createServer({
  routes() {
    let _this = this;
    // this.urlPrefix = 'https://pokeapi.co/api/v2';

    this.passthrough();
    this.passthrough('https://pokeapi.co/api/v2/**');

    // this.pokemon_entries = [];

    this.get(
      '/pokemon',
      async (schema, request) => {
        if (request.params.id) {
        }

        // if (!_this.pokemon) {
        //   const response = await fetch(
        //     `https://pokeapi.co/api/v2/pokemon/?limit=1200`
        //   );
        //   const { results } = await response.json();

        //   _this.pokemon = results;
        // }

        const { limit = 0, offset = 0, q = '' } = request.queryParams;
        const parsedLimit = parseInt(limit, 10);
        const parsedOffset = parseInt(offset, 10);

        // console.log({ caca: _this.pokemon });

        const poke_raw = pokemon_entries.filter(
          (pokemon) =>
            !q || pokemon.pokemon_species.name.includes(q.toLowerCase())
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

        console.log({ res });
        console.log({ poke_raw });

        return {
          count: poke_raw.length,
          results: res.map((r, index) => ({
            ...r,
            pokedexNumber: poke_raw_sliced[index].entry_number,
            name: getPokemonName(r.names),
          })),
        };
      },
      { timing: 700 }
    );
  },
});
