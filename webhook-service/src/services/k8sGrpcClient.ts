import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { config } from '../config/env';
import path from 'path';

const PROTO_PATH = path.join(__dirname, '../../proto/k8s.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const k8sProto = grpc.loadPackageDefinition(packageDefinition).k8s as any;

export interface ClusterMetrics {
  total_nodes: number;
  ready_nodes: number;
  total_pods: number;
  running_pods: number;
  pending_pods: number;
  failed_pods: number;
  cpu_usage_percent: number;
  memory_usage_percent: number;
  max_pods_capacity: number;
  available_pods_capacity: number;
}

export interface NodeInfo {
  name: string;
  role: string;
  status: string;
  cpu_usage_percent: number;
  memory_usage_percent: number;
  pods_count: number;
  max_pods: number;
  is_master: boolean;
}

export interface NodesStatus {
  nodes: NodeInfo[];
}

export interface PodsCount {
  total: number;
  running: number;
  pending: number;
  failed: number;
  succeeded: number;
}

export class K8sGrpcClient {
  private client: any;

  constructor() {
    this.client = new k8sProto.K8sMetricsService(
      config.k8s.grpcUrl,
      grpc.credentials.createInsecure()
    );
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.getClusterMetrics();
      console.log('✅ Connexion gRPC k8s-service testée avec succès');
      return true;
    } catch (error: any) {
      console.error('❌ Erreur lors du test de connexion gRPC k8s-service:', error.message);
      return false;
    }
  }

  async getClusterMetrics(): Promise<ClusterMetrics> {
    return new Promise((resolve, reject) => {
      this.client.GetClusterMetrics({}, (error: any, response: ClusterMetrics) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  async getNodesStatus(): Promise<NodesStatus> {
    return new Promise((resolve, reject) => {
      this.client.GetNodesStatus({}, (error: any, response: NodesStatus) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  async getPodsCount(namespace: string = 'default'): Promise<PodsCount> {
    return new Promise((resolve, reject) => {
      this.client.GetPodsCount({ namespace }, (error: any, response: PodsCount) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }
}
