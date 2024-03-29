import styled from 'styled-components';
import { keyframes } from 'styled-components';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';

import TypePill from './TypePill';
import Pill from './Pill';
import { useGetPokemonDetailQuery } from '../queries';
import { memo } from 'react';
import PokeStats from './PokeStats';
import StatCircle from './StatCircle';

const Container = styled.div`
  height: 120px;
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
  padding: 15px 0;
  font-size: ${({ theme }) => theme.fontSizes.small};

  color: inherit;
  text-decoration: inherit;

  transition: 0.3s transform ease-out, 0.3s box-shadow;

  &:hover {
    /* transform: translateY(-3px);
    box-shadow: 0px 3px 5px -1px rgba(0, 0, 0, 0.2),
      0px 6px 10px 0px rgba(0, 0, 0, 0.08), 0px 1px 18px 0px rgba(0, 0, 0, 0.26); */
  }

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.primaryTransparent};
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

const ImgFront = styled.img`
  height: 100%;
  position: absolute;

  top: 50%;
  right: 50%;
  transform: translate(50%, -50%);
  transition: transform 0.2s;
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

const STATS = {
  hp: { name: 'HP', max: 255 },
  attack: { name: 'Atk', max: 190 },
  defense: { name: 'Def', max: 230 },
  'special-attack': { name: 'SpA', max: 194 },
  'special-defense': { name: 'SpD', max: 130 },
  speed: { name: 'Spd', max: 150 },
};

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

      <div style={{ display: 'flex' }}>
        {pokemon.stats.map(({ base_stat, stat }) => (
          <div style={{ marginInlineEnd: 10, textAlign: 'center' }}>
            <div>{STATS[stat.name].name}</div>
            <div>{base_stat}</div>
            <div>
              <StatCircle
                stroke={6}
                radius={20}
                progress={Math.floor((base_stat / STATS[stat.name].max) * 100)}
              />
            </div>
          </div>
        ))}
      </div>

      <SpecialPillContainer>
        {pokemon.is_legendary && <Pill>✨ Lengendary</Pill>}
        {pokemon.is_mythical && <Pill>✨ Mythical</Pill>}
      </SpecialPillContainer>
    </Container>
  );
};

export default PokeRow;
