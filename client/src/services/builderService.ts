import { builderApi } from './api';

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

export interface Workflow {
  _id?: string;
  name: string;
  description?: string;
  userId: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  botType: 'discord';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateWorkflowRequest {
  name: string;
  description?: string;
  userId: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  botType?: 'discord';
}

export interface GenerateRequest {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

class BuilderService {
  async createWorkflow(data: CreateWorkflowRequest): Promise<Workflow> {
    const response = await builderApi.post('/api/workflows', data);
    return response.data.workflow;
  }

  async getWorkflows(userId: string): Promise<Workflow[]> {
    const response = await builderApi.get('/api/workflows', {
      params: { userId },
    });
    return response.data.workflows;
  }

  async getWorkflow(id: string, userId: string): Promise<Workflow> {
    const response = await builderApi.get(`/api/workflows/${id}`, {
      params: { userId },
    });
    return response.data.workflow;
  }

  async updateWorkflow(id: string, userId: string, data: Partial<Workflow>): Promise<Workflow> {
    const response = await builderApi.put(`/api/workflows/${id}`, data, {
      params: { userId },
    });
    return response.data.workflow;
  }

  async deleteWorkflow(id: string, userId: string): Promise<void> {
    await builderApi.delete(`/api/workflows/${id}`, {
      params: { userId },
    });
  }

  async generateFromWorkflow(id: string, userId: string): Promise<Blob> {
    const response = await builderApi.post(`/api/workflows/${id}/generate`, null, {
      params: { userId },
      responseType: 'blob',
    });
    return response.data;
  }

  async generateDirect(data: GenerateRequest): Promise<Blob> {
    const response = await builderApi.post('/api/generate', data, {
      responseType: 'blob',
    });
    return response.data;
  }
}

export const builderService = new BuilderService();
