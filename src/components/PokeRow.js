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
  border: 1px solid red;
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
  padding: 15px;
  font-size: ${({ theme }) => theme.fontSizes.default};

  color: inherit;
  text-decoration: inherit;

  transition: 0.3s transform ease-out, 0.3s box-shadow;

  &:hover {
    /* transform: translateY(-3px);
    box-shadow: 0px 3px 5px -1px rgba(0, 0, 0, 0.2),
      0px 6px 10px 0px rgba(0, 0, 0, 0.08), 0px 1px 18px 0px rgba(0, 0, 0, 0.26); */
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
  width: 150px;
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
  font-size: ${({ theme }) => theme.fontSizes.small};
  margin: 5px 0 3px;
`;

const SpecialPillContainer = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
`;

const PokeRow = ({ pokemonName, pokemonNumber, showShiny, style }) => {
  const { pokemon, isLoading } = useGetPokemonDetailQuery({
    pokemon: pokemonName,
  });

  let frontImage, backImage;
  const loading = isLoading || !pokemon;

  if (!loading) {
    frontImage = showShiny
      ? pokemon.sprites.front_shiny
      : pokemon.sprites.front_default;
    backImage = showShiny
      ? pokemon.sprites.back_shiny
      : pokemon.sprites.back_default;
  }

  if (loading || !pokemon) {
    return null;
  }

  console.log({ pokemon });

  const stats = PokeStats(pokemon);

  return (
    <Container style={style} as={Link} to={`${pokemonName}`}>
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
        <PokedexNumber>#{pokemonNumber}</PokedexNumber>
        <Name>{loading ? pokemonName : pokemon.name}</Name>
      </div>

      <div style={{ width: 140 }}>
        {stats.Weight}
        {stats.Height}
      </div>

      {!loading && (
        <SpecialPillContainer>
          {pokemon.is_legendary && <Pill>✨ Lengendary</Pill>}
          {pokemon.is_mythical && <Pill>✨ Mythical</Pill>}
        </SpecialPillContainer>
      )}
    </Container>
  );
};

export default PokeRow;
