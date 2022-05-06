import styled from 'styled-components';

const Container = styled.div`
  background-color: #eceff1;
  display: inline-block;
  border-radius: 100px;
  font-weight: 600;
  font-size: 0.75rem;
  padding: 4.8px 8px;
  cursor: default;
`;

function Pill({ className, children }) {
  return <Container className={className}>{children}</Container>;
}

export default Pill;
