import {AddSolid} from '@magicflow/icons';
import {ProcedureBranchesTreeNode} from '@magicflow/procedure';
import classNames from 'classnames';
import React, {CSSProperties, FC, useContext} from 'react';
import styled from 'styled-components';

import {FlowContext} from '../../../flow-context';
import {createFlow} from '../../../procedure-editor';
import {Icon, RESOURCE_WIDTH, transition} from '../../@common';
import {Flow} from '../../flow';

const AddFlow = styled(AddSolid)`
  ${Icon};

  pointer-events: all !important;
`;

const AddFlowWrapper = styled.div``;

const Wrapper = styled.div`
  position: relative;
  display: inline-block;
  min-width: ${RESOURCE_WIDTH}px;
  min-height: 83px;

  border: 1px solid #c8cdd8;
  border-radius: 8px;
  margin: 0 17px;
  cursor: pointer;

  pointer-events: all !important;

  &.active {
    border-color: #296dff;
  }

  ${transition(['border-color'])}

  ${AddFlowWrapper} {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translate(50%, -50%);
  }
`;

export interface BranchesNodeProps {
  node: ProcedureBranchesTreeNode;
  className?: string;
  readOnly?: boolean;
  style?: CSSProperties;
}

export const BranchesNode: FC<BranchesNodeProps> = ({node}) => {
  const {editor} = useContext(FlowContext);

  const onCreateFlow = (): void => {
    editor.edit(createFlow({node: node.id}));
  };

  return (
    <Wrapper
      className={classNames({active: editor.isActive(node)})}
      data-id={node.id}
      data-prev={node.prev.id}
    >
      {node.flows.map(flow => (
        <Flow key={flow.id} flow={flow} />
      ))}
      <AddFlowWrapper>
        <AddFlow onClick={onCreateFlow} />
      </AddFlowWrapper>
    </Wrapper>
  );
};
