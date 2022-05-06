import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import Input from './Input';

const Select = styled(Input)`
  width: 150px;
`;

function TypeSelect({ value, onChange }) {
  const { data } = useQuery(['types'], async () => {
    const res = await fetch('https://pokeapi.co/api/v2/type').then((res) =>
      res.json()
    );
    return [...res.results].sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
  });

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
