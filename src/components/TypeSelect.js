import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import Input from './Input';

const Select = styled(Input)`
  width: 150px;
  &:focus {
    box-shadow: 0 0 0 0.2rem ${({ theme }) => theme.primaryTransparent};
  }
`;

function TypeSelect({ value, onChange }) {
  const { status, data, error, isFetching, isLoading } = useQuery(
    ['types'],
    async () => {
      const res = await fetch('https://pokeapi.co/api/v2/type').then((res) =>
        res.json()
      );
      return res.results;
    }
  );

  const types = data ?? [];

  return (
    <Select
      as="select"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">-</option>
      {types.map((t) => (
        <option key={t.name} value={t.name}>
          {t.name}
        </option>
      ))}
    </Select>
  );
}

export default TypeSelect;
