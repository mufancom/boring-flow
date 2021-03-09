import {
  LeafMetadata,
  LeafType,
  NodeId,
  NodeMetadata,
  ProcedureDefinition,
} from '@magicflow/core';
import {ComponentType} from 'react';
import {Nominal} from 'tslang';

export type LeafPluginType = Nominal<string, ['leaf-plugin-type']>;

export interface IPluginEvent {
  definition: ProcedureDefinition;

  stopPropagation(): void;
  preventDefault(): void;
}

export type PluginLeafEventType = 'create' | 'delete';

export interface PluginLeafEvent extends IPluginEvent {
  type: PluginLeafEventType;
  node: NodeId;
  metadata: LeafMetadata;
}

export type PluginEvent = PluginLeafEvent;

export type PluginEventHandler = (event: PluginEvent) => Promise<void> | void;

export interface LeafAction {
  label: string;
  icon?: ComponentType;

  /**
   * 操作所处顺序 (升序)
   */
  order?: number;
}

export interface LeafSelector {
  render: ComponentType;

  /**
   * 选择器所处顺序 (升序)
   */
  order?: number;
  /**
   * 是否支持多次添加
   */
  multiple?: boolean;
}

export interface ILeafPluginEventHandlers {
  onCreate?: PluginEventHandler;
  onDelete?: PluginEventHandler;
}

export interface LeafPluginComponentProps {
  leaf: LeafMetadata;
}

export type LeafPluginComponent = ComponentType<LeafPluginComponentProps>;

export interface ILeafPlugin extends ILeafPluginEventHandlers {
  /**
   * `type` 相同的 LeafPlugin:
   * 仅 最后一个 `render` 与 `selector` 生效
   * `actions` 将合并
   */
  type: LeafType;

  render?: LeafPluginComponent;
  selector?: LeafSelector;
  actions?: LeafAction[];
}

export interface IPluginEventHandlers {
  onLeafCreate?: PluginEventHandler;
  onLeafDelete?: PluginEventHandler;
}

export interface NodePluginComponentProps {
  node: NodeMetadata;
}

export type NodePluginComponent = ComponentType<NodePluginComponentProps>;

export interface NodePluginComponentRender {
  before?: NodePluginComponent;
  after?: NodePluginComponent;

  headLeft?: NodePluginComponent;
  headRight?: NodePluginComponent;

  body?: NodePluginComponent;
  bodyAppend?: boolean;

  footer?: NodePluginComponent;
}

export interface INodePlugin {
  render:
    | NodePluginComponentRender
    | ((node: NodeMetadata) => NodePluginComponentRender);
}

export interface IPlugin extends IPluginEventHandlers {
  nodes?: INodePlugin[];
  leaves?: ILeafPlugin[];
}