import styled from 'styled-components';
import Pill from './Pill';

const Container = styled(Pill)`
  color: #fff;

  font-size: 0.7rem;
  padding: 2px 10px 3px;

  &:not(:first-child) {
    margin-inline-start: 5px;
  }

  &.normal {
    background-color: #a8a878;
  }
  &.fighting {
    background-color: #c03028;
  }
  &.flying {
    background-color: #a890f0;
  }
  &.poison {
    background-color: #a040a0;
  }
  &.ground {
    background-color: #e0c068;
  }
  &.rock {
    background-color: #b8a038;
  }
  &.bug {
    background-color: #a8b820;
  }
  &.ghost {
    background-color: #705898;
  }
  &.steel {
    background-color: #b8b8d0;
  }
  &.fire {
    background-color: #f08030;
  }
  &.water {
    background-color: #6890f0;
  }
  &.grass {
    background-color: #78c850;
  }
  &.electric {
    background-color: #f8d030;
  }
  &.psychic {
    background-color: #f85888;
  }
  &.ice {
    background-color: #98d8d8;
  }
  &.dragon {
    background-color: #7038f8;
  }
  &.dark {
    background-color: #705848;
  }
  &.fairy {
    background-color: #ee99ac;
  }
  &.unknown {
    background-color: #68a090;
  }
  &.shadow {
    background-color: #604e82;
  }
`;

function TypePill({ type }) {
  return (
    <Container size="small" className={type.name}>
      {type.name}
    </Container>
  );
}

export default TypePill;
