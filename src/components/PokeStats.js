import styled from 'styled-components';

import TypePill from './TypePill';

const Container = styled.div``;

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

function PokeStats(pokemon) {
  console.log({ pokemon });
  return {
    Types: (
      <div>
        {pokemon.types.map((type) => (
          <TypePill key={type.slot} type={type.type} />
        ))}
      </div>
    ),
    Weight: (
      <>
        <Stat>Weight: {pokemon.weight / 10} kg</Stat>
        <Weight>
          {[...new Array(Math.ceil(pokemon.weight / 100))].map((_, index) => (
            <WeightBox key={index} />
          ))}
        </Weight>
      </>
    ),
    Height: (
      <>
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
      </>
    ),
  };
}

export default PokeStats;
