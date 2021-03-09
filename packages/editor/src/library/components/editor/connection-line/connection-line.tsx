import {LeafId, NextMetadata, NodeId} from '@magicflow/core';
import {Bezier, BezierStroke} from 'rc-bezier';
import React, {FC} from 'react';
import styled from 'styled-components';

import {useMark} from './@mark';

export const LINE_HEIGHT_DEFAULT = 68;

const STROKE_DEFAULT: BezierStroke = {color: '#C8CDD8', width: 1};

const ARC_RADIUS_DEFAULT = 8;

const Wrapper = styled(Bezier)`
  &.connection-line {
    display: inline-block;
    width: 0px !important;
    height: 0px !important;
    cursor: pointer;
  }
`;

export interface ConnectionLineProps {
  node: NodeId;
  next: NextMetadata;
  /**
   * 边际的两个元素会绘制向下的圆弧
   */
  left: NodeId | LeafId | undefined;
  right: NodeId | LeafId | undefined;
}

export const ConnectionLine: FC<ConnectionLineProps> = ({
  node,
  next,
  left,
  right,
}) => {
  const [Mark] = useMark(node, next);

  return (
    <Wrapper
      className="connection-line"
      stroke={STROKE_DEFAULT}
      startNode={['parent', 'previousSibling']}
      marks={[Mark]}
      generatePath={points => {
        let start = points[0];
        let end = points[points.length - 1];

        if (start.x === end.x) {
          return `M ${start.x},${start.y} V ${end.y}`;
        }

        let radius = ARC_RADIUS_DEFAULT;
        let direction = end.x > start.x ? 1 : -1;
        let midline = (start.y + end.y) / 2;

        if (!left) {
          return `M ${start.x},${start.y} V ${
            midline - radius
          } A ${radius},${radius},0,0,${direction === 1 ? '0' : '1'},${
            start.x + radius * direction
          },${midline} H ${
            end.x - radius * direction
          } A ${radius},${radius},0,0,${direction === 1 ? '1' : '0'},${end.x},${
            midline + radius
          } V ${end.y}`;
        }

        if (!right) {
          return `M ${start.x},${midline - radius} A ${radius},${radius},0,0,${
            direction === 1 ? '0' : '1'
          },${start.x + radius * direction},${midline} H ${
            end.x - radius * direction
          } A ${radius},${radius},0,0,${direction === 1 ? '1' : '0'},${end.x},${
            midline + radius
          } V ${end.y}`;
        }

        return `M ${end.x},${midline} V ${end.y}`;
      }}
    />
  );
};