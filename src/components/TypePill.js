import { useEffect, useState } from 'react';
import styled from 'styled-components';

function TypePill({ type }) {
  return <div>{type.name}</div>;
}

export default TypePill;
