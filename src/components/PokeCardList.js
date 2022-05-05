import styled from 'styled-components';
import { useEffect, useState } from 'react';
import PokeCard from './PokeCard';

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
`;

function PokeCardList({ pokemons }) {
  return (
    <Container>
      {pokemons.map((pokemon) => (
        <PokeCard name={pokemon.name} url={pokemon.url} />
      ))}
    </Container>
  );
}

export default PokeCardList;
