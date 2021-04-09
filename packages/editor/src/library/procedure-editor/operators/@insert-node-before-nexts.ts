import {NodeId} from '@magicflow/core';
import {
  OperatorFunction,
  addNodeNexts,
  out,
  replaceNodeNexts,
} from '@magicflow/procedure/operators';

export const insertNodeBeforeNexts: (
  from: NodeId,
) => OperatorFunction<[NodeId]> = from => target =>
  out(replaceNodeNexts(from, [target]), nexts => addNodeNexts(target, nexts));
