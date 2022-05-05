import styled from 'styled-components';

import PokeCardList from './components/PokeCardList';

const Header = styled.header`
  border-bottom: 1px solid #e9eaeb;
  padding: 16px;
  box-shadow: rgba(38, 50, 56, 0.15) 0px 4px 15px;
`;

const Logo = styled.span`
  color: ${({ theme }) => theme.primary};
  text-transform: uppercase;
  font-weight: 800;
  font-size: 1.5rem;
`;

function App() {
  return (
    <div>
      <Header>
        <Logo>Pokédex</Logo>
      </Header>
      <main>
        <PokeCardList />
      </main>
    </div>
  );
}

export default App;
