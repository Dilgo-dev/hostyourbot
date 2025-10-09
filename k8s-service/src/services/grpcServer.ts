import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { K8sClient } from './k8sClient';

const PROTO_PATH = path.join(__dirname, '../../proto/k8s.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const k8sProto = grpc.loadPackageDefinition(packageDefinition).k8s as any;

export class K8sGrpcServer {
  private server: grpc.Server;
  private k8sClient: K8sClient;

  constructor(k8sClient: K8sClient) {
    this.server = new grpc.Server();
    this.k8sClient = k8sClient;

    this.server.addService(k8sProto.K8sMetricsService.service, {
      GetClusterMetrics: this.getClusterMetrics.bind(this),
      GetNodesStatus: this.getNodesStatus.bind(this),
      GetPodsCount: this.getPodsCount.bind(this),
    });
  }

  private async getClusterMetrics(
    call: any,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const namespaces = await this.k8sClient.listNamespaces();
      let totalPods = 0;
      let runningPods = 0;
      let pendingPods = 0;
      let failedPods = 0;

      for (const namespace of namespaces.items) {
        const pods = await this.k8sClient.listPods(namespace.metadata.name);
        totalPods += pods.items.length;

        for (const pod of pods.items) {
          const phase = pod.status?.phase || 'Unknown';
          if (phase === 'Running') runningPods++;
          else if (phase === 'Pending') pendingPods++;
          else if (phase === 'Failed') failedPods++;
        }
      }

      const nodes = await this.k8sClient.listNamespaces();
      const totalNodes = nodes.items.length;
      const readyNodes = totalNodes;

      const maxPodsCapacity = totalNodes * 110;
      const availablePodsCapacity = maxPodsCapacity - totalPods;

      callback(null, {
        total_nodes: totalNodes,
        ready_nodes: readyNodes,
        total_pods: totalPods,
        running_pods: runningPods,
        pending_pods: pendingPods,
        failed_pods: failedPods,
        cpu_usage_percent: 0,
        memory_usage_percent: 0,
        max_pods_capacity: maxPodsCapacity,
        available_pods_capacity: availablePodsCapacity,
      });
    } catch (error: any) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message,
      }, null);
    }
  }

  private async getNodesStatus(
    call: any,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const namespaces = await this.k8sClient.listNamespaces();
      const nodes = namespaces.items.map((namespace: any, index: number) => ({
        name: `node-${index + 1}`,
        role: index === 0 ? 'master' : 'worker',
        status: 'Ready',
        cpu_usage_percent: 0,
        memory_usage_percent: 0,
        pods_count: 0,
        max_pods: 110,
        is_master: index === 0,
      }));

      callback(null, { nodes });
    } catch (error: any) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message,
      }, null);
    }
  }

  private async getPodsCount(
    call: any,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const namespace = call.request.namespace || 'default';
      const pods = await this.k8sClient.listPods(namespace);

      let running = 0;
      let pending = 0;
      let failed = 0;
      let succeeded = 0;

      for (const pod of pods.items) {
        const phase = pod.status?.phase || 'Unknown';
        if (phase === 'Running') running++;
        else if (phase === 'Pending') pending++;
        else if (phase === 'Failed') failed++;
        else if (phase === 'Succeeded') succeeded++;
      }

      callback(null, {
        total: pods.items.length,
        running,
        pending,
        failed,
        succeeded,
      });
    } catch (error: any) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message,
      }, null);
    }
  }

  async start(port: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.bindAsync(
        `0.0.0.0:${port}`,
        grpc.ServerCredentials.createInsecure(),
        (error, port) => {
          if (error) {
            reject(error);
          } else {
            console.log(`Serveur gRPC K8s démarré sur le port ${port}`);
            resolve();
          }
        }
      );
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      this.server.tryShutdown(() => {
        console.log('Serveur gRPC K8s arrêté');
        resolve();
      });
    });
  }
}
