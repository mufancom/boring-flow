import {css} from 'styled-components';

import {transition} from '../../@common';

export const Icon = css`
  opacity: 1;
  border-radius: 50%;
  background-color: #fff;
  color: #296dff;
  font-size: 16px;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }

  ${transition(['opacity'])}
`;
