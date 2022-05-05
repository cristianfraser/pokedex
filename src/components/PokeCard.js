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

function PokeCard({ pokemon }) {
  return (
    <Container>
      <ImageContainer>
        <img src={pokemon.sprites.front_default} loading="lazy" />
      </ImageContainer>
      <InfoContainer>
        <div>
          {pokemon.name} - #{pokemon.pokedexNumber}
        </div>
        <div>
          {pokemon.types.map((type) => (
            <TypePill key={type.slot} type={type.type} />
          ))}
        </div>
      </InfoContainer>
    </Container>
  );
}

export function EmptyPokeCard() {
  return (
    <Container>
      <ImageContainer>loading</ImageContainer>
      <InfoContainer></InfoContainer>
    </Container>
  );
}

export default PokeCard;
