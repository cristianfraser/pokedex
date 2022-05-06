import { useCallback, useRef } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: inline-block;
  height: 14px;
  position: relative;
`;

const BaseCheckbox = styled.input.attrs({ type: 'checkbox' })`
  border: 0;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
`;

const CheckIcon = ({
  color = 'currentColor',
  height = 14,
  style,
  className,
}) => (
  <svg
    height={`${height}px`}
    viewBox="0 0 15 14"
    style={style}
    className={className}
    data-testid="CheckIcon"
  >
    <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <g
        transform="translate(-1277.000000, -252.000000)"
        fill={color}
        fillRule="nonzero"
      >
        <g transform="translate(1262.000000, 244.000000)">
          <g transform="translate(15.000000, 8.000000)">
            <polygon points="15 2.66666667 5 13.3333333 0 8 1.875 6 5 9.33333333 13.125 0.666666667" />
          </g>
        </g>
      </g>
    </g>
  </svg>
);

const StyledCheckIcon = styled(CheckIcon)`
  vertical-align: middle;
  position: absolute;
  bottom: 2px;
  right: 1.5px;
  height: 8px;
`;

const PrettyCheckbox = styled.div`
  position: relative;
  background-color: ${({ theme }) => theme.white};
  border: 2px solid ${({ theme }) => theme.gray};
  border-radius: 2px;
  height: 14px;
  width: 14px;
  margin: 0;
  color: ${({ theme }) => theme.white};
  transition: background-color 0.2s, border-color 0.1s, box-shadow 0.2s;

  ${BaseCheckbox}:focus + & {
    box-shadow: 0 0 0 0.2rem ${({ theme }) => theme.primaryTransparent};
    border-color: ${({ theme }) => theme.primary};
  }

  &:hover {
    background-color: #ddd};
  }

  ${BaseCheckbox}:checked + & {
    ${({ theme }) => `
    border: 1px solid ${theme.primary};
    background-color: ${theme.primary};
    `}
  }

  ${BaseCheckbox}:checked:not(:disabled)
    + &:hover {
    ${({ theme }) => `
    background-color: ${theme.primary};
    `}
  }

  ${BaseCheckbox}:not(:disabled)
    + &:active {
    ${() => `
    box-shadow: inset 0px 1px 3px #e8eaec};
    `}
  }

  ${BaseCheckbox}:checked:not(:disabled)
    + &:active {
    ${({ theme }) => `
    box-shadow: inset 0px 1px 3px  ${theme.primary};
    `}
  }

  ${BaseCheckbox}:disabled + & {
    background-color: #f3f3f3;
    border-color: #d8d8d8;
    color: #ababab;
    cursor: not-allowed;
    box-shadow: none;
  }

  ${BaseCheckbox}:not(:checked) + & ${StyledCheckIcon} {
    visibility: hidden;
  }

  ${BaseCheckbox}:checked + & ${StyledCheckIcon} {
    visibility: visible;
  }
`;

function Checkbox({ checked, onChange, disabled, style, className, id }) {
  const inputRef = useRef();
  const onClick = useCallback((event) => {
    event.preventDefault();
    const inputNode = inputRef && inputRef.current;

    if (inputNode) {
      inputNode.click();
    }
  }, []);

  return (
    <Container>
      <BaseCheckbox
        id={id}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        ref={inputRef}
      />
      <PrettyCheckbox
        onClick={disabled ? undefined : onClick}
        checked={checked}
        style={style}
        className={className}
      >
        <StyledCheckIcon />
      </PrettyCheckbox>
    </Container>
  );
}

export default Checkbox;
