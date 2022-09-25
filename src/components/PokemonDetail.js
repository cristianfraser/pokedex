import styled from 'styled-components';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import '@reach/dialog/styles.css';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useGetPokemonDetailQuery } from '../queries';
import VisuallyHidden from '@reach/visually-hidden';
import TypePill from './TypePill';
import PokeStats from './PokeStats';

const Container = styled.div``;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;

  width: 20px;
  height: 19px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;

  &:hover {
    background: #ececec;
  }
`;

const NameTitle = styled.h1`
  display: inline-block;
  font-size: ${({ theme }) => theme.fontSizes.large};
  font-weight: 600;
  /* margin-block-end: 5px; */
`;

const ImagesContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
`;

const ImgContainer = styled.div`
  text-align: center;
  transition: transform 0.35s;
  position: relative;

  &:nth-child(1) {
    transform: translateX(163%);
  }

  &:nth-child(2) {
    transform: translateX(378%);
  }

  &:nth-child(3) {
    transform: translateX(268%);
  }

  &:nth-child(4) {
    transform: translateX(158%);
  }

  ${ImagesContainer}:hover & {
    transform: translateX(0);
  }
`;

const HoverLabel = styled.div`
  position: absolute;
  right: -120%;
  top: 50%;
  transform: translate(15px, -50%);
  transition: color 0.4s;
  font-size: 0.8em;

  ${ImagesContainer}:hover & {
    color: white;
  }
`;

function PokemonDetail() {
  let navigate = useNavigate();
  let { pokemonNumber } = useParams();
  const [showDialog, setShowDialog] = useState(false);
  const open = () => setShowDialog(true);
  const close = () => navigate('../');

  const { pokemon, isLoading } = useGetPokemonDetailQuery({
    pokemon: pokemonNumber,
  });

  const loading = !pokemon || isLoading;

  console.log({ pokemon, isLoading });

  let frontImage, backImage, frontShinyImage, backShinyImage, stats;

  if (!loading) {
    frontImage = pokemon.sprites.front_default;
    frontShinyImage = pokemon.sprites.front_shiny;
    backImage = pokemon.sprites.back_default;
    backShinyImage = pokemon.sprites.back_shiny;
    stats = PokeStats(pokemon);
  }

  return (
    <DialogOverlay
      style={{ background: 'hsla(0, 100%, 100%, 0.9)', zIndex: 20 }}
      isOpen
      onDismiss={close}
    >
      <DialogContent
        aria-label="Pokemon Detail"
        style={{
          boxShadow: '0px 10px 50px hsla(0, 0%, 0%, 0.33)',
          overflow: 'hidden',
          position: 'relative',
          borderRadius: 8,
        }}
      >
        {loading ? null : (
          <>
            <div>
              <CloseButton onClick={close}>
                <VisuallyHidden>Close</VisuallyHidden>
                <span aria-hidden>×</span>
              </CloseButton>
            </div>

            <ImagesContainer>
              <ImgContainer>
                <img src={frontImage} />
                <HoverLabel>reveal forms</HoverLabel>
              </ImgContainer>
              <ImgContainer>
                <img src={backImage} />
              </ImgContainer>
              <ImgContainer>
                <img src={frontShinyImage} />
              </ImgContainer>
              <ImgContainer>
                <img src={backShinyImage} />
              </ImgContainer>
            </ImagesContainer>

            <NameTitle>{pokemon.name}</NameTitle>
            <div>
              {stats.Types}
              {stats.Weight}
              {stats.Height}
            </div>

            <div>
              <ul>
                <h2>Found in these regions:</h2>
                {pokemon.pokedex_numbers.map(({ entry_number, pokedex }) => (
                  <li>
                    <Link to={`../../${pokedex.name}`}>
                      {pokedex.name} #{entry_number}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </DialogContent>
    </DialogOverlay>
  );
}

export default PokemonDetail;
