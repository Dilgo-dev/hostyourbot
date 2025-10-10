export interface NodeConfig {
  messageContent?: string;
  channelId?: string;
  roleId?: string;
  triggerText?: string;
  command?: string;
  channelName?: string;
  roleName?: string;
}

export interface NodeData {
  label: string;
  type: 'event' | 'action' | 'condition';
  icon?: string;
  blockId?: string;
  config?: NodeConfig;
}

export interface WorkflowNode {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  data: NodeData;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface IWorkflow {
  name: string;
  description?: string;
  userId: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  botType: 'discord';
  createdAt?: Date;
  updatedAt?: Date;
}
