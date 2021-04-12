// import {NodeId, SingleNode as SingleNodeDefinition} from '@magicflow/core';
import {ProcedureSingleTreeNode} from '@magicflow/procedure';
// import {Connect, Copy, Cut, Jump} from '@magicflow/icons';
import classnames from 'classnames';
import React, {FC, useContext} from 'react';
import styled from 'styled-components';

import {EditorContext} from '../../../context';
import {RESOURCE_WIDTH} from '../../common';

import {Header} from './@header';

// import {DisplayName} from './@header';

const BeforeWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

// const AfterWrapper = styled.div`
//   display: flex;
//   align-items: center;
//   justify-content: center;
// `;

const Wrapper = styled.div`
  position: relative;
  margin: 0 17px;
  width: ${RESOURCE_WIDTH}px;
  min-height: 83px;
  display: inline-block;
  vertical-align: top;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  background-color: #fff;
  cursor: pointer;

  &:hover {
    .header {
      color: #ffffff;
      background-color: #5b6e95;
    }
  }

  &.active {
    box-shadow: 0 6px 12px rgba(58, 69, 92, 0.16);

    .header {
      color: #ffffff;
      background-color: #296dff;
    }
  }

  &.editing {
    &::before {
      opacity: 0;
      margin: 0px;
      height: 100%;
      transform: translate(-12px, -12px);
      padding: 12px;
      position: absolute;
      top: 0px;
      left: 0px;
      width: 100%;
      content: '';
      z-index: 2;
      border: 1px dashed #296dff;
      border-radius: 4px;
      pointer-events: none;
    }

    &:hover {
      &::before {
        opacity: 1;
      }
    }

    &.selected,
    &.active {
      &::before {
        opacity: 1;
        background-color: rgba(255, 255, 255, 0.5);
      }
    }
  }
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
`;

const Footer = styled.div`
  display: flex;
`;

// const EditingIconWrapper = styled.div`
//   position: absolute;
//   display: flex;
//   align-items: center;
//   justify-content: center;

//   width: 32px;
//   height: 32px;

//   top: 100%;
//   left: 50%;
//   transform: translate(-50%, -4px);

//   background: #296dff;
//   color: #fff;
//   box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.08);
//   border-radius: 28px;

//   z-index: 3;
// `;

// const STATE_ICON_DICT: Partial<
//   {[key in ActiveTrunk['state']]: React.ElementType}
// > = {
//   joining: Connect,
//   cutting: Cut,
//   copying: Copy,
//   connecting: Jump,
// };

// const EditingIcon: FC<{state: ActiveTrunk['state']}> = ({state}) => {
//   let Component = STATE_ICON_DICT[state];

//   if (!Component) {
//     return <></>;
//   }

//   return (
//     <EditingIconWrapper>
//       <Component />
//     </EditingIconWrapper>
//   );
// };

export interface SingleNodeProps {
  node: ProcedureSingleTreeNode;
  className?: string;
  readOnly?: boolean;
}

export const SingleNode: FC<SingleNodeProps> = ({className, node}) => {
  const {editor} = useContext(EditorContext);

  // let nodeRef: NodeRef = {type: 'singleNode', id: node.id};

  // let activeTrunk = editor.activeTrunk;

  // const onNodeChange = (node: SingleNode): void => {
  // void editor.procedure.updateNode(node);
  // };

  // const onContainerClick = (event: MouseEvent<HTMLDivElement>): void => {
  //   event.stopPropagation();

  //   if (activeTrunk?.state === 'connecting') {
  //     void editor.procedure.connectNode(activeTrunk.ref, nodeRef);
  //     editor.setActiveTrunk(undefined);
  //     return;
  //   }

  //   if (activeTrunk?.state === 'joining') {
  //     editor.setActiveTrunk({
  //       ...activeTrunk,
  //       relationTrunks: [...(activeTrunk.relationTrunks || []), nodeRef],
  //     });
  //     return;
  //   }

  //   void editor.setActiveTrunk({
  //     prev,
  //     ref: nodeRef,
  //     state: 'none',
  //   });
  // };

  // let editing = activeTrunk && activeTrunk?.state !== 'none';
  // let active = activeTrunk?.ref?.id === node.id;
  // let selected = activeTrunk?.relationTrunks?.some(ref => ref.id === node.id);

  let {
    before = [],
    // after = [],

    // footer = [],
    // body = [],
  } = editor.nodeRenderDescriptor;

  return (
    <>
      {before.length ? (
        <BeforeWrapper>
          {/* {before.reduce(
          (reactNode, component) =>
            createElement(component, {node, editor, prevChildren: reactNode}),
          <></>,
        )} */}
        </BeforeWrapper>
      ) : undefined}
      <Wrapper
        className={classnames([
          className,
          {
            // editing,
            // active,
            // selected,
          },
        ])}
        // onClick={onContainerClick}
      >
        <Header node={node} />
        <Body>
          {/* {body.reduce(
          (reactNode, component) =>
            createElement(component, {node, editor, prevChildren: reactNode}),
          <></>,
        )} */}
        </Body>

        <Footer>
          {/* {footer.reduce(
          (reactNode, component) =>
            createElement(component, {node, editor, prevChildren: reactNode}),
          <></>,
        )} */}
        </Footer>

        {/* {editing && active ? (
        <EditingIcon state={activeTrunk!.state} />
      ) : undefined} */}
      </Wrapper>
      {/* {after.length ? (
      <AfterWrapper>
        {after.reduce(
          (reactNode, component) =>
            createElement(component, {node, editor, prevChildren: reactNode}),
          <></>,
        )}
      </AfterWrapper>
    ) : undefined} */}
    </>
  );
};
