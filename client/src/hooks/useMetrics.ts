import { useState, useEffect } from 'react';
import { metricsService, ClusterMetrics, NodeMetrics } from '../services/metricsService';

interface MetricsHistory {
  time: string;
  cpu: number;
  memory: number;
  storage: number;
}

export function useMetrics(refreshInterval: number = 5000) {
  const [clusterMetrics, setClusterMetrics] = useState<ClusterMetrics | null>(null);
  const [nodesMetrics, setNodesMetrics] = useState<NodeMetrics[]>([]);
  const [metricsHistory, setMetricsHistory] = useState<MetricsHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      const [cluster, nodes] = await Promise.all([
        metricsService.getClusterMetrics(),
        metricsService.getNodesMetrics(),
      ]);

      setClusterMetrics(cluster);
      setNodesMetrics(nodes.nodes);

      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

      setMetricsHistory((prev) => {
        const newHistory = [
          ...prev,
          {
            time: timeStr,
            cpu: cluster.cpu.percentage,
            memory: cluster.memory.percentage,
            storage: cluster.storage.percentage,
          },
        ];
        return newHistory.slice(-20);
      });

      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return {
    clusterMetrics,
    nodesMetrics,
    metricsHistory,
    loading,
    error,
    refresh: fetchMetrics,
  };
}
