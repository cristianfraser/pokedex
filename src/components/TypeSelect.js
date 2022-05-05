import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';

const Container = styled.div``;

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
    <Container>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {types.map((t) => (
          <option key={t.name} value={t.name}>
            {t.name}
          </option>
        ))}
      </select>
    </Container>
  );
}

export default TypeSelect;
