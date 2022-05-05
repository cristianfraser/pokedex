import { useEffect, useState } from 'react';
import styled from 'styled-components';
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

function PokeCard({ name, url }) {
  const [pokeInfo, setPokeInfo] = useState(null);

  useEffect(() => {
    fetch(url)
      .then((res) => res.json())
      .then((res) => {
        setPokeInfo(res);
      });
  }, [setPokeInfo]);

  return (
    <Container>
      <ImageContainer>
        {pokeInfo && (
          <img src={pokeInfo.sprites.front_default} loading="lazy" />
        )}
      </ImageContainer>
      <InfoContainer>
        <div>
          {name} - #{pokeInfo && pokeInfo.id}
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
