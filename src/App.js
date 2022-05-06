import styled from 'styled-components';

import PokeCardList from './components/PokeCardList';

const Header = styled.header`
  border-bottom: 1px solid #e9eaeb;
  padding: 16px;
  box-shadow: rgba(38, 50, 56, 0.15) 0px 4px 15px;
  display: flex;
  justify-content: center;
`;

const HeaderContent = styled.div`
  width: 100%;
  max-width: ${({ theme }) => theme.APP_MAX_WIDTH}px;
`;

const Main = styled.main`
  padding: 30px;
  text-align: center;
`;

const Content = styled.div`
  width: 100%;
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
    <div>
      <Header>
        <HeaderContent>
          <Logo>Pokédex</Logo>
        </HeaderContent>
      </Header>
      <Main>
        <Content>
          <PokeCardList />
        </Content>
      </Main>
    </div>
  );
}

export default App;
