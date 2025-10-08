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

  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get('/healthz');
      return true;
    } catch {
      return false;
    }
  }
}
