import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useQuery } from 'react-query';

import TypePill from './TypePill';

const Container = styled.div`
  box-shadow: 0px 3px 5px -1px rgba(0, 0, 0, 0.2),
    0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12);
  max-width: 200px;
  width: 200px;
  flex: 0 1 auto;
  height: 240px;
  border-radius: 12px;
  padding: 15px;
`;

const ImageContainer = styled.div`
  text-align: center;
  height: 100px;
`;

const InfoContainer = styled.div``;

const getPokemonName = (pokemonNames, lang = 'en') => {
  return pokemonNames.find((info) => info.language.name === lang).name;
};

function PokeCard({ name, number, url }) {
  const {
    status,
    data: pokeInfo,
    error,
    isFetching,
    isFetchingNextPage,
    isFetchingPreviousPage,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
  } = useQuery(['pokemon', name], async () => {
    const pokemonSpecies = await fetch(url).then((res) => res.json());

    const pokemonUrl = pokemonSpecies.varieties.filter(
      (variety) => !!variety.is_default
    )[0].pokemon.url;

    const pokemon = await fetch(pokemonUrl).then((res) => res.json());

    console.log({ name, pokemonSpecies, pokemon });

    return { ...pokemon, name: getPokemonName(pokemonSpecies.names) };
  });

  return (
    <Container>
      <ImageContainer>
        {pokeInfo && (
          <img src={pokeInfo.sprites.front_default} loading="lazy" />
        )}
      </ImageContainer>
      <InfoContainer>
        <div>
          {pokeInfo ? pokeInfo.name : name} - #{pokeInfo && pokeInfo.id}
        </div>
        {pokeInfo && (
          <div>
            {pokeInfo.types.map((type) => (
              <TypePill key={type.slot} type={type.type} />
            ))}
          </div>
        )}
      </InfoContainer>
    </Container>
  );
}

export default PokeCard;
