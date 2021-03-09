import {
  LeafId,
  LeafMetadata,
  LeafType,
  NextMetadata,
  NextNodeMetadata,
  NodeId,
  NodeMetadata,
  ProcedureDefinition,
} from '@magicflow/core';
import {Patch, applyPatches, enableAllPlugins, produce} from 'immer';
import {cloneDeep, compact, isEqual} from 'lodash-es';
import {nanoid} from 'nanoid';

enableAllPlugins();

type ProcedureBeforeListenerReturnType =
  | void
  | 'handled'
  | Promise<void | 'handled'>;

export interface ProcedureListeners<
  TProcedureDefinition extends ProcedureDefinition
> {
  afterDefinitionChange?(definition: TProcedureDefinition): void;

  beforeLeafCreate?(
    definition: TProcedureDefinition,
    node: TProcedureDefinition['nodes'][number],
    leaf: TProcedureDefinition['leaves'][number],
  ): ProcedureBeforeListenerReturnType;

  beforeLeafDelete?(
    definition: TProcedureDefinition,
    node: TProcedureDefinition['nodes'][number],
    leaf: TProcedureDefinition['leaves'][number],
  ): ProcedureBeforeListenerReturnType;
}

export interface IProcedure<
  TProcedureDefinition extends ProcedureDefinition = ProcedureDefinition
> {
  definition: TProcedureDefinition;
  listeners: ProcedureListeners<TProcedureDefinition>;

  createLeaf(
    node: NodeId,
    type: LeafType,
    partial?: Partial<LeafMetadata>,
  ): void;
  deleteLeaf(leafId: LeafId): void;

  createNode(node: NodeId, next?: NextMetadata | 'next'): void;
  updateNode(node: NodeMetadata): void;
  deleteNode(node: NodeId, prevNode: NodeId | undefined): void;
  moveNode(
    movingNode: NodeId,
    prevNode: NodeId | undefined,
    targetNode: NodeId,
    targetNext: NextMetadata | undefined,
  ): void;
  copyNode(
    copyingNode: NodeId,
    targetNode: NodeId,
    targetNext: NextMetadata | undefined,
  ): void;

  undo(): void;
  redo(): void;
}

interface ProcedureActionStack {
  undoes: Patch[][];
  redoes: Patch[][];
  cursor: number;
}

export class Procedure<
  TProcedureDefinition extends ProcedureDefinition = ProcedureDefinition
> implements IProcedure {
  private _definition!: TProcedureDefinition;

  private actionStack: ProcedureActionStack = {
    undoes: [],
    redoes: [],
    cursor: -1,
  };

  get definition(): TProcedureDefinition {
    return this._definition;
  }

  constructor(
    definition: TProcedureDefinition,
    readonly listeners: ProcedureListeners<TProcedureDefinition> = {},
  ) {
    this.setDefinition(cloneDeep(definition), false);
  }

  getNode(nodeId: NodeId): TProcedureDefinition['nodes'][number] | undefined {
    return this.definition.nodes.find(node => node.id === nodeId);
  }

  getLeaf(leafId: LeafId): TProcedureDefinition['leaves'][number] | undefined {
    return this.definition.leaves.find(leaf => leaf.id === leafId);
  }

  async createLeaf(
    node: NodeId,
    type: LeafType,
    partial: Partial<TProcedureDefinition['leaves'][number]> = {},
  ): Promise<void> {
    return this.update(async definition => {
      let nodeMetadata = definition.nodes.find(({id}) => id === node);

      if (!nodeMetadata) {
        throw Error(`Not found node metadata by id '${node}'`);
      }

      let id = createId<LeafId>();
      let metadata = {
        ...partial,
        id,
        type,
      };

      if (
        (await this.listeners.beforeLeafCreate?.(
          definition,
          nodeMetadata,
          metadata,
        )) === 'handled'
      ) {
        return;
      }

      nodeMetadata.nexts = nodeMetadata.nexts || [];

      nodeMetadata.nexts.push({type: 'leaf', id});
      definition.leaves.push(metadata);
    });
  }

  async deleteLeaf(leafId: LeafId): Promise<void> {
    return this.update(async definition => {
      let leafIndex = definition.leaves.findIndex(leaf => leaf.id === leafId);

      if (leafIndex === -1) {
        throw Error(`Not found leaf metadata by leaf '${leafId}'`);
      }

      let nodeMetadata = definition.nodes.find(({nexts}) =>
        nexts?.some(({type, id}) => type === 'leaf' && id === leafId),
      );

      if (!nodeMetadata) {
        definition.leaves.splice(leafIndex, 1);
        return;
      }

      let leaf = definition.leaves[leafIndex];

      if (
        (await this.listeners.beforeLeafDelete?.(
          definition,
          nodeMetadata,
          leaf,
        )) === 'handled'
      ) {
        return;
      }

      definition.leaves.splice(leafIndex, 1);
      nodeMetadata.nexts = nodeMetadata.nexts?.filter(
        ({type, id}) => type !== 'leaf' || id !== leafId,
      );
    });
  }

  /**
   *
   * @param node
   * @param target
   *  1. next = undefined, 创建节点 node 的新子节点分支
   *  2. next = 'next', 创建新节点并转移节点 node 所有子节点到新节点
   *  3. next = NextMetadata, 创建新节点插入至节点 node 与 next 之间
   * @param metadata
   */
  async createNode(
    node: NodeId,
    target: NextMetadata | 'next' | undefined = undefined,
    {
      id: _id,
      nexts = [],
      ...partial
    }: Partial<TProcedureDefinition['nodes'][number]> = {},
  ): Promise<void> {
    return this.update(definition => {
      let nodeMetadata = definition.nodes.find(({id}) => id === node);

      if (!nodeMetadata) {
        throw Error(`Not found node metadata by id '${node}'`);
      }

      let id = createId<NodeId>();

      let newNodeMetadata: NodeMetadata = {...partial, id, nexts};

      if (typeof target === 'object') {
        let nextMetadataIndex = nodeMetadata.nexts?.findIndex(item =>
          isEqual(item, target),
        );

        if (nextMetadataIndex === undefined || nextMetadataIndex === -1) {
          throw Error(`Not found node next by ${JSON.stringify(target)}`);
        }

        newNodeMetadata.nexts!.push(nodeMetadata.nexts![nextMetadataIndex]);
        nodeMetadata.nexts!.splice(nextMetadataIndex, 1, {type: 'node', id});
      } else {
        if (
          target === 'next' &&
          nodeMetadata.nexts &&
          nodeMetadata.nexts.length
        ) {
          newNodeMetadata.nexts!.push(...nodeMetadata.nexts);
          nodeMetadata.nexts = [];
        }

        nodeMetadata.nexts = nodeMetadata.nexts || [];
        nodeMetadata.nexts.push({type: 'node', id});
      }

      definition.nodes.push(newNodeMetadata);
    });
  }

  async connectNode(node: NodeId, next: NextMetadata): Promise<void> {
    return this.update(definition => {
      let nodeMetadata = definition.nodes.find(({id}) => id === node);

      if (!nodeMetadata) {
        throw Error(`Not found node metadata by id '${node}'`);
      }

      nodeMetadata.nexts = nodeMetadata.nexts || [];

      nodeMetadata.nexts.push(next);
    });
  }

  async disconnectNode(node: NodeId, next: NextMetadata): Promise<void> {
    return this.update(definition => {
      let nodeMetadata = definition.nodes.find(({id}) => id === node);

      if (!nodeMetadata) {
        throw Error(`Not found node metadata by id '${node}'`);
      }

      if (!nodeMetadata.nexts?.length) {
        return;
      }

      nodeMetadata.nexts = nodeMetadata.nexts.filter(({id}) => id !== next.id);
    });
  }

  async updateNode(
    metadata: TProcedureDefinition['nodes'][number],
  ): Promise<void> {
    return this.update(definition => {
      let nodeIndex = definition.nodes.findIndex(({id}) => id === metadata.id);

      if (nodeIndex === -1) {
        throw Error(`Not found node metadata by id '${metadata.id}'`);
      }

      definition.nodes.splice(nodeIndex, 1, metadata);
    });
  }

  async deleteNode(
    nodeId: NodeId,
    prevNodeId: NodeId | undefined,
  ): Promise<void> {
    return this.update(definition => {
      let nodesMap = new Map(definition.nodes.map(node => [node.id, node]));

      let node = nodesMap.get(nodeId);

      if (!node) {
        throw Error(`Not found node metadata by id '${nodeId}'`);
      }

      let prevNode = prevNodeId && nodesMap.get(prevNodeId);

      if (prevNodeId) {
        if (!prevNode) {
          throw Error(`Not found node metadata by id '${prevNodeId}'`);
        }

        if (!prevNode.nexts?.some(next => next.id === nodeId)) {
          throw Error(
            `Not found node '${nodeId}' at nexts of prevNode '${prevNodeId}'`,
          );
        }
      }

      let visitedNodesSet: Set<NodeId> = new Set();

      let checkingNodes = getTypeNextIds<NextNodeMetadata>(node, 'node');

      while (checkingNodes.length) {
        let checkingNodeId = checkingNodes.shift()!;

        if (checkingNodeId === nodeId) {
          throw Error(
            `Delete node '${nodeId}' failed because delete path with cycle`,
          );
        }

        let checkingNode = nodesMap.get(checkingNodeId)!;

        if (!checkingNode) {
          throw Error(`Not found node metadata by id '${checkingNodeId}'`);
        }

        if (visitedNodesSet.has(checkingNodeId)) {
          continue;
        }

        visitedNodesSet.add(checkingNode.id);

        checkingNodes.push(
          ...getTypeNextIds<NextNodeMetadata>(checkingNode, 'node'),
        );
      }

      definition.nodes = compact(
        definition.nodes.map(node => {
          if (node.id === nodeId) {
            return undefined;
          }

          node.nexts = node.nexts?.filter(next => next.id !== nodeId);

          return node;
        }),
      );

      if (prevNode && node.nexts?.length) {
        prevNode.nexts!.push(...node.nexts);
      }
    });
  }

  async moveNode(
    movingNodeId: NodeId,
    prevNodeId: NodeId | undefined,
    targetNodeId: NodeId,
    targetNext: NextMetadata | undefined,
  ): Promise<void> {
    if (movingNodeId === targetNodeId) {
      return;
    }

    return this.update(definition => {
      let nodesMap = new Map(definition.nodes.map(node => [node.id, node]));

      let movingNode = nodesMap.get(movingNodeId);
      let prevNode = prevNodeId && nodesMap.get(prevNodeId);
      let targetNode = nodesMap.get(targetNodeId);

      if (!movingNode) {
        throw Error(`Not found movingNode metadata by id '${movingNodeId}'`);
      }

      if (!targetNode) {
        throw Error(`Not found targetNode metadata by id '${targetNodeId}'`);
      }

      let movingNodeNexts = movingNode.nexts || [];
      let pendingTransferMovingNodeNexts = [];

      movingNode.nexts = [];

      // The leaves will move with the node
      for (let next of movingNodeNexts) {
        if (next.type === 'leaf') {
          movingNode.nexts.push(next);
          continue;
        }

        pendingTransferMovingNodeNexts.push(next);
      }

      if (prevNode) {
        prevNode.nexts = prevNode.nexts || [];

        let movingNodeIndex = prevNode.nexts.findIndex(
          next => next.id === movingNodeId,
        );

        if (movingNodeIndex === -1) {
          throw Error(
            `Not found movingNode '${movingNodeId}' at nexts of prevNode '${prevNodeId}'`,
          );
        }

        prevNode.nexts.splice(
          movingNodeIndex,
          1,
          ...pendingTransferMovingNodeNexts,
        );
      }

      targetNode.nexts = targetNode.nexts || [];

      if (targetNext) {
        let targetNextIndex = targetNode.nexts.findIndex(
          next => next.id === targetNext.id,
        );

        if (targetNextIndex === -1) {
          throw Error(
            `Not found targetNext ${JSON.stringify(
              targetNext,
            )} at nexts of targetNode '${targetNodeId}'`,
          );
        }

        targetNode.nexts.splice(targetNextIndex, 1);

        movingNode.nexts.push(targetNext);
      }

      targetNode.nexts.push({type: 'node', id: movingNodeId});
    });
  }

  async copyNode(
    copyingNodeId: NodeId,
    targetNodeId: NodeId,
    targetNext: NextMetadata | undefined,
  ): Promise<void> {
    return this.update(definition => {
      let nodesMap = new Map(definition.nodes.map(node => [node.id, node]));

      let copyingNode = nodesMap.get(copyingNodeId);

      let targetNode = nodesMap.get(targetNodeId);

      if (!copyingNode) {
        throw Error(`Not found node metadata by id '${copyingNodeId}'`);
      }

      if (!targetNode) {
        throw Error(`Not found node metadata by id '${targetNodeId}'`);
      }

      let duplicateNodeId = createId<NodeId>();
      let duplicateNode = cloneDeep(copyingNode);

      duplicateNode.id = duplicateNodeId;
      duplicateNode.nexts = [];

      targetNode.nexts = targetNode.nexts || [];

      if (!targetNext) {
        targetNode.nexts.push({type: 'node', id: duplicateNodeId});
        definition.nodes.push(duplicateNode);

        return;
      }

      let nextIndex = targetNode.nexts.findIndex(next =>
        isEqual(next, targetNext),
      );

      if (nextIndex === -1) {
        throw Error(
          `Not found next metadata ${JSON.stringify(targetNext)} at node '${
            targetNode.id
          }'`,
        );
      }

      targetNode.nexts.splice(nextIndex, 1, {
        type: 'node',
        id: duplicateNodeId,
      });
      duplicateNode.nexts.push(targetNext);
      definition.nodes.push(duplicateNode);
    });
  }

  undo(): void {
    let actionStack = this.actionStack;

    if (actionStack.cursor === actionStack.redoes.length - 1) {
      return;
    }

    actionStack.cursor += 1;

    this.setDefinition(
      applyPatches(this._definition, actionStack.undoes[actionStack.cursor]),
    );
  }

  redo(): void {
    let actionStack = this.actionStack;

    if (actionStack.cursor === -1) {
      return;
    }

    this.setDefinition(
      applyPatches(this._definition, actionStack.redoes[actionStack.cursor]),
    );

    actionStack.cursor -= 1;
  }

  async update(
    handler: (definition: TProcedureDefinition) => Promise<void> | void,
  ): Promise<void> {
    let definition = await produce(
      this._definition,
      handler,
      (patches, inversePatches) => {
        if (!patches.length) {
          return;
        }

        let actionStack = this.actionStack;
        let size = actionStack.cursor + 1;

        actionStack.undoes.splice(0, size, inversePatches);
        actionStack.redoes.splice(0, size, patches);
        actionStack.cursor = -1;
      },
    );

    if (definition === this._definition) {
      return;
    }

    this.setDefinition(definition);
  }

  private setDefinition(definition: TProcedureDefinition, notify = true): void {
    this._definition = definition;

    if (!notify) {
      return;
    }

    this.listeners.afterDefinitionChange?.(definition);
  }
}

export function createId<TId>(): TId {
  return (nanoid(8) as unknown) as TId;
}

function getTypeNextIds<TNextMetadata extends NextMetadata>(
  node: NodeMetadata,
  type: TNextMetadata['type'],
): TNextMetadata['id'][] {
  if (!node.nexts?.length) {
    return [];
  }

  let typeNextIds: TNextMetadata['id'][] = [];

  for (let next of node.nexts) {
    if (next.type !== type) {
      continue;
    }

    typeNextIds.push(next.id);
  }

  return typeNextIds;
}