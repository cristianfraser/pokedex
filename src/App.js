import { Navigate, Route, Routes } from 'react-router-dom';
import styled from 'styled-components';

import PokeCardList from './components/PokeCardList';
import PokemonDetail from './components/PokemonDetail';
import PokeRowList from './components/PokeRowList';

const HEADER_HEIGHT = 62;

const Header = styled.header`
  z-index: 10;
  border-bottom: 1px solid #e9eaeb;
  padding: 16px;
  box-shadow: rgba(38, 50, 56, 0.15) 0px 4px 15px;
  display: flex;
  justify-content: center;
  height: ${HEADER_HEIGHT}px;
  position: fixed;
  width: 100%;
  background-color: ${({ theme }) => theme.white};
`;

const HeaderContent = styled.div`
  width: 100%;
  max-width: ${({ theme }) => theme.APP_MAX_WIDTH}px;
`;

const Main = styled.main`
  padding: 30px;
  padding-block-start: ${30 + HEADER_HEIGHT}px;
  text-align: center;
`;

const Content = styled.div`
  width: 100%;
  height: 100%;
  max-width: ${({ theme }) => theme.APP_MAX_WIDTH}px;
  display: inline-block;
  text-align: initial;

  font-size: 0.875rem;
`;

const Logo = styled.span`
  color: ${({ theme }) => theme.primary};
  text-transform: uppercase;
  font-weight: 800;
  font-size: 1.5rem;
`;

function App() {
  return (
    <>
      <Header>
        <HeaderContent>
          <Logo>Pokédex</Logo>
        </HeaderContent>
      </Header>
      <Main>
        <Content>
          <Routes>
            <Route path="" element={<Navigate to="/pokedex" replace />} />
            <Route path="/pokedex">
              <Route path="" element={<Navigate to="/pokedex/1" replace />} />
              <Route path=":pokedexName" element={<PokeRowList />}>
                <Route path=":pokemonNumber" element={<PokemonDetail />} />
              </Route>
            </Route>
          </Routes>
        </Content>
      </Main>
    </>
  );
}

export default App;
