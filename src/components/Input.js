import styled from 'styled-components';

const Input = styled.input`
  min-width: 0;
  border-radius: 3px;
  background-color: #fafbfc;
  border: 1px solid ${({ theme }) => theme.gray};
  display: inline-block;
  transition: background-color 0.2s, border-color 0.1s, box-shadow 0.25s;
  height: 30px;
  padding: 5px 10px;

  &:disabled {
    background: #fff;
  }

  &::placeholder {
    color: #7c9cb2;
  }

  &:hover {
    border-color: undefined;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 0.2rem ${({ theme }) => theme.primaryTransparent};
    border-color: ${({ theme }) => theme.primary};
    position: relative;
  }

  &::selection {
    background-color: #ceeffb;
  }
`;

export default Input;
