import styled from 'styled-components';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import '@reach/dialog/styles.css';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetPokemonDetailQuery } from '../queries';
import VisuallyHidden from '@reach/visually-hidden';

const Container = styled.div``;

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

  return (
    <DialogOverlay
      style={{ background: 'hsla(0, 100%, 100%, 0.9)', zIndex: 20 }}
      isOpen
      onDismiss={close}
    >
      <DialogContent
        aria-label="Pokemon Detail"
        style={{ boxShadow: '0px 10px 50px hsla(0, 0%, 0%, 0.33)' }}
      >
        <div>
          <button onClick={close}>
            <VisuallyHidden>Close</VisuallyHidden> <span aria-hidden>×</span>{' '}
          </button>
        </div>
        <div>{pokemon && pokemon.name}</div>
      </DialogContent>
    </DialogOverlay>
  );
}

export default PokemonDetail;
