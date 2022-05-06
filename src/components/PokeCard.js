import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useQuery } from 'react-query';

import TypePill from './TypePill';
import Pill from './Pill';

const Container = styled.div`
  position: relative;
  box-shadow: 0px 3px 5px -1px rgba(0, 0, 0, 0.2),
    0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12);
  max-width: 200px;
  width: 200px;
  flex: 0 1 auto;
  height: 240px;
  border-radius: 12px;
  padding: 15px;
  font-size: 0.875rem;
`;

const ImageContainer = styled.div`
  text-align: center;
  height: 85px;
`;

const InfoContainer = styled.div``;

const PokedexNumber = styled.h3`
  display: inline-block;
  color: ${({ theme }) => theme.textGray};
  font-size: 0.75rem;
`;

const Name = styled.h3`
  font-weight: 600;
  margin-block-end: 3px;
`;

const ImgFront = styled.img`
  height: 100%;
  ${Container}:hover & {
    display: none;
  }
`;

const ImgBack = styled.img`
  height: 100%;
  display: none;
  ${Container}:hover & {
    display: initial;
  }
`;

const Weight = styled.div`
  display: flex;
  flex-wrap: wrap;
  grid-template-columns: repeat(10, 1fr);
  gap: 1px;
`;

const WeightBox = styled.div`
  background-color: currentColor;
  height: 4px;
  width: 4px;
`;

const HeightBar = styled.div`
  background-color: ${({ theme }) => theme.gray};
  display: flex;
  width: 120px;
`;

const Height = styled.div`
  background-color: currentColor;
  height: 5px;
  width: ${({ percent }) => percent}%;

  &:nth-child(5n) {
    color: transparent;
  }
`;

const Stat = styled.div`
  font-size: 0.75rem;
  margin: 5px 0 3px;
`;

const SpecialPillContainer = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
`;

function PokeCard({ pokemon }) {
  return (
    <Container>
      <ImageContainer>
        <ImgFront src={pokemon.sprites.front_default} loading="lazy" />
        <ImgBack src={pokemon.sprites.back_default} loading="lazy" />
      </ImageContainer>
      <InfoContainer>
        <PokedexNumber>#{pokemon.pokedexNumber}</PokedexNumber>
        <Name>{pokemon.name}</Name>
        <div>
          {pokemon.types.map((type) => (
            <TypePill key={type.slot} type={type.type} />
          ))}
        </div>
        <div>
          <div>
            <Stat>Weight: {pokemon.weight / 10} kg</Stat>
            <Weight>
              {[...new Array(Math.ceil(pokemon.weight / 100))].map(
                (_, index) => (
                  <WeightBox key={index} />
                )
              )}
            </Weight>
          </div>
          <div>
            <Stat>Height: {pokemon.height / 10} m</Stat>
            <div>
              <HeightBar>
                <Height
                  percent={
                    (pokemon.height / 2) *
                    (1 + Math.cos(((Math.PI / 2) * pokemon.height) / 200))
                  }
                />
              </HeightBar>
            </div>
          </div>
        </div>
      </InfoContainer>

      <SpecialPillContainer>
        {pokemon.is_legendary && <Pill>✨ Lengendary</Pill>}
        {pokemon.is_mythical && <Pill>✨ Mythical</Pill>}
      </SpecialPillContainer>
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
