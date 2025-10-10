import { k8sApi } from './api';

export interface ClusterMetrics {
  cpu: {
    used: number;
    total: number;
    percentage: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  storage: {
    used: number;
    total: number;
    percentage: number;
  };
  nodes: {
    total: number;
    ready: number;
  };
  pods: {
    total: number;
    running: number;
    pending: number;
    failed: number;
  };
}

export interface NodeMetrics {
  name: string;
  status: string;
  role: string;
  cpu: {
    used: number;
    total: number;
    percentage: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  pods: {
    current: number;
    max: number;
  };
}

export interface PodsMetrics {
  podsByNamespace: Record<string, {
    total: number;
    running: number;
    pending: number;
    failed: number;
    succeeded: number;
  }>;
}

export const metricsService = {
  async getClusterMetrics(): Promise<ClusterMetrics> {
    const response = await k8sApi.get<ClusterMetrics>('/api/v1/admin/metrics/cluster');
    return response.data;
  },

  async getNodesMetrics(): Promise<{ nodes: NodeMetrics[] }> {
    const response = await k8sApi.get<{ nodes: NodeMetrics[] }>('/api/v1/admin/metrics/nodes');
    return response.data;
  },

  async getPodsMetrics(): Promise<PodsMetrics> {
    const response = await k8sApi.get<PodsMetrics>('/api/v1/admin/metrics/pods');
    return response.data;
  },
};
