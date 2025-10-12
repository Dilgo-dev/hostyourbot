import axios, { AxiosInstance, AxiosError } from 'axios';
import https from 'https';
import { config } from '../config/env';
import {
  Pod,
  Deployment,
  Service,
  Namespace,
  ConfigMap,
  K8sList,
  K8sResource,
  Node,
  NodeMetricsList,
  PodMetricsList,
} from '../types/k8s';

export class K8sClient {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.k8s.apiUrl;

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Authorization: `Bearer ${config.k8s.apiToken}`,
        'Content-Type': 'application/json',
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response) {
          console.error('Erreur API Kubernetes:', error.response.status, error.response.data);
        }
        throw error;
      }
    );
  }

  async listNamespaces(): Promise<K8sList<Namespace>> {
    const response = await this.client.get('/api/v1/namespaces');
    return response.data;
  }

  async getNamespace(name: string): Promise<Namespace> {
    const response = await this.client.get(`/api/v1/namespaces/${name}`);
    return response.data;
  }

  async createNamespace(namespace: Namespace): Promise<Namespace> {
    const response = await this.client.post('/api/v1/namespaces', namespace);
    return response.data;
  }

  async deleteNamespace(name: string): Promise<void> {
    await this.client.delete(`/api/v1/namespaces/${name}`);
  }

  async listPods(namespace: string = 'default'): Promise<K8sList<Pod>> {
    const response = await this.client.get(`/api/v1/namespaces/${namespace}/pods`);
    return response.data;
  }

  async getPod(name: string, namespace: string = 'default'): Promise<Pod> {
    const response = await this.client.get(`/api/v1/namespaces/${namespace}/pods/${name}`);
    return response.data;
  }

  async createPod(pod: Pod, namespace: string = 'default'): Promise<Pod> {
    const response = await this.client.post(`/api/v1/namespaces/${namespace}/pods`, pod);
    return response.data;
  }

  async deletePod(name: string, namespace: string = 'default'): Promise<void> {
    await this.client.delete(`/api/v1/namespaces/${namespace}/pods/${name}`);
  }

  async listDeployments(namespace: string = 'default'): Promise<K8sList<Deployment>> {
    const response = await this.client.get(`/apis/apps/v1/namespaces/${namespace}/deployments`);
    return response.data;
  }

  async getDeployment(name: string, namespace: string = 'default'): Promise<Deployment> {
    const response = await this.client.get(`/apis/apps/v1/namespaces/${namespace}/deployments/${name}`);
    return response.data;
  }

  async createDeployment(deployment: Deployment, namespace: string = 'default'): Promise<Deployment> {
    const response = await this.client.post(`/apis/apps/v1/namespaces/${namespace}/deployments`, deployment);
    return response.data;
  }

  async updateDeployment(name: string, deployment: Deployment, namespace: string = 'default'): Promise<Deployment> {
    const response = await this.client.put(`/apis/apps/v1/namespaces/${namespace}/deployments/${name}`, deployment);
    return response.data;
  }

  async deleteDeployment(name: string, namespace: string = 'default'): Promise<void> {
    await this.client.delete(`/apis/apps/v1/namespaces/${namespace}/deployments/${name}`);
  }

  async scaleDeployment(name: string, replicas: number, namespace: string = 'default'): Promise<Deployment> {
    const deployment = await this.getDeployment(name, namespace);
    deployment.spec.replicas = replicas;
    return this.updateDeployment(name, deployment, namespace);
  }

  async listServices(namespace: string = 'default'): Promise<K8sList<Service>> {
    const response = await this.client.get(`/api/v1/namespaces/${namespace}/services`);
    return response.data;
  }

  async getService(name: string, namespace: string = 'default'): Promise<Service> {
    const response = await this.client.get(`/api/v1/namespaces/${namespace}/services/${name}`);
    return response.data;
  }

  async createService(service: Service, namespace: string = 'default'): Promise<Service> {
    const response = await this.client.post(`/api/v1/namespaces/${namespace}/services`, service);
    return response.data;
  }

  async deleteService(name: string, namespace: string = 'default'): Promise<void> {
    await this.client.delete(`/api/v1/namespaces/${namespace}/services/${name}`);
  }

  async getPodLogs(name: string, namespace: string = 'default', tailLines?: number): Promise<string> {
    const params = tailLines ? { tailLines: tailLines.toString() } : {};
    const response = await this.client.get(`/api/v1/namespaces/${namespace}/pods/${name}/log`, { params });
    return response.data;
  }

  async createConfigMap(configMap: ConfigMap, namespace: string = 'default'): Promise<ConfigMap> {
    const response = await this.client.post(`/api/v1/namespaces/${namespace}/configmaps`, configMap);
    return response.data;
  }

  async getConfigMap(name: string, namespace: string = 'default'): Promise<ConfigMap> {
    const response = await this.client.get(`/api/v1/namespaces/${namespace}/configmaps/${name}`);
    return response.data;
  }

  async deleteConfigMap(name: string, namespace: string = 'default'): Promise<void> {
    await this.client.delete(`/api/v1/namespaces/${namespace}/configmaps/${name}`);
  }

  async updateConfigMap(name: string, configMap: ConfigMap, namespace: string = 'default'): Promise<ConfigMap> {
    const response = await this.client.patch(
      `/api/v1/namespaces/${namespace}/configmaps/${name}`,
      {
        binaryData: configMap.binaryData,
        data: configMap.data,
      },
      {
        headers: {
          'Content-Type': 'application/strategic-merge-patch+json',
        },
      }
    );
    return response.data;
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get('/healthz');
      return true;
    } catch {
      return false;
    }
  }

  async listNodes(): Promise<K8sList<Node>> {
    const response = await this.client.get('/api/v1/nodes');
    return response.data;
  }

  async getNode(name: string): Promise<Node> {
    const response = await this.client.get(`/api/v1/nodes/${name}`);
    return response.data;
  }

  async getNodeMetrics(): Promise<NodeMetricsList> {
    const response = await this.client.get('/apis/metrics.k8s.io/v1beta1/nodes');
    return response.data;
  }

  async getPodMetrics(namespace?: string): Promise<PodMetricsList> {
    const url = namespace
      ? `/apis/metrics.k8s.io/v1beta1/namespaces/${namespace}/pods`
      : '/apis/metrics.k8s.io/v1beta1/pods';
    const response = await this.client.get(url);
    return response.data;
  }

  async getAllPods(): Promise<K8sList<Pod>> {
    const response = await this.client.get('/api/v1/pods');
    return response.data;
  }

  async execCommand(
    podName: string,
    namespace: string,
    command: string[],
    containerName?: string
  ): Promise<{ output: string; error?: string }> {
    try {
      const params: any = {
        command: command,
        stdout: true,
        stderr: true,
      };

      if (containerName) {
        params.container = containerName;
      }

      const queryString = new URLSearchParams();
      command.forEach(cmd => queryString.append('command', cmd));
      queryString.append('stdout', 'true');
      queryString.append('stderr', 'true');
      if (containerName) {
        queryString.append('container', containerName);
      }

      const response = await this.client.post(
        `/api/v1/namespaces/${namespace}/pods/${podName}/exec?${queryString.toString()}`,
        null,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        output: response.data || '',
      };
    } catch (error: any) {
      return {
        output: '',
        error: error.response?.data?.message || error.message || 'Command execution failed',
      };
    }
  }
}
