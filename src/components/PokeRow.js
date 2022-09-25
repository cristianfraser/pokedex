import styled from 'styled-components';
import { keyframes } from 'styled-components';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';

import TypePill from './TypePill';
import Pill from './Pill';
import { useGetPokemonDetailQuery } from '../queries';
import { memo } from 'react';
import PokeStats from './PokeStats';

const Container = styled.div`
  height: 120px;
  border: 1px solid red;
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
  padding: 15px 0;
  font-size: ${({ theme }) => theme.fontSizes.default};

  color: inherit;
  text-decoration: inherit;

  transition: 0.3s transform ease-out, 0.3s box-shadow;

  &:hover {
    /* transform: translateY(-3px);
    box-shadow: 0px 3px 5px -1px rgba(0, 0, 0, 0.2),
      0px 6px 10px 0px rgba(0, 0, 0, 0.08), 0px 1px 18px 0px rgba(0, 0, 0, 0.26); */
  }

  & > *:not(:last-child) {
    margin-inline-start: 15px;
  }
`;

const PokedexNumber = styled.h3`
  display: inline-block;
  color: ${({ theme }) => theme.textGray};
  font-size: ${({ theme }) => theme.fontSizes.small};
`;

const Name = styled.h3`
  display: inline-block;
  font-weight: 600;
  margin-block-end: 3px;
  margin-inline-start: 5px;
`;

const ImageContainer = styled.div`
  position: relative;
  text-align: center;
  height: 85px;
  width: 90px;
  display: flex;
  overflow: hidden;
`;

const bounce = keyframes`
  0% {
    transform: translate(50%, -50%);
  }
  40% {
    transform: translate(50%, -50%) translateX(-50%);
  }
  60% {
    transform: translate(50%, -50%) translateX(-40%);
  }
  100% {
    transform: translate(50%, -50);
  }
`;

const ImgFront = styled.img`
  height: 100%;
  position: absolute;

  top: 50%;
  right: 50%;
  transform: translate(50%, -50%);
  transition: transform 0.2s;

  @media (prefers-reduced-motion) {
    & {
      transition: none;
    }
  }

  &:last-child {
    transition: none;
  }

  /* ${Container}:hover & {
    transform: translate(50%, -50%) translateX(-200%);
  }

  ${Container}:hover &:last-child {
    animation: ${bounce} 0.2s linear forwards;
    transform: translate(50%, -50%);
  } */

  @media (prefers-reduced-motion) {
    & {
      transition: none;
    }
  }
`;

const ImgBack = styled.img`
  height: 100%;
  position: absolute;

  top: 50%;
  right: 50%;
  transform: translate(50%, -50%) translateX(200%);
  transition: transform 0.2s;

  @media (prefers-reduced-motion) {
    & {
      transition: none;
    }
  }

  /* ${Container}:hover & {
    transform: translate(50%, -50%);
  } */
`;

const SpecialPillContainer = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
`;

const PokeRow = ({ pokemon, showShiny }) => {
  console.log({ pokemon });

  const frontImage = showShiny
    ? pokemon.sprites.front_shiny
    : pokemon.sprites.front_default;
  const backImage = showShiny
    ? pokemon.sprites.back_shiny
    : pokemon.sprites.back_default;

  const stats = PokeStats(pokemon);

  return (
    <Container as={Link} to={`${pokemon.id}`}>
      <ImageContainer>
        <ImgFront
          key={frontImage}
          onlyImage={!backImage}
          src={frontImage}
          loading="eager"
        />
        {!!backImage && <ImgBack src={backImage} loading="lazy" />}
      </ImageContainer>
      <div style={{ width: 140 }}>
        {stats.Types}
        <PokedexNumber>#{pokemon.pokedexNumber}</PokedexNumber>
        <Name>{pokemon.name}</Name>
      </div>

      <div style={{ width: 140 }}>
        {stats.Weight}
        {stats.Height}
      </div>

      <SpecialPillContainer>
        {pokemon.is_legendary && <Pill>✨ Lengendary</Pill>}
        {pokemon.is_mythical && <Pill>✨ Mythical</Pill>}
      </SpecialPillContainer>
    </Container>
  );
};

export default PokeRow;
