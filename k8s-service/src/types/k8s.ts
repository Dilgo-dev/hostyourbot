export interface K8sResource {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    namespace?: string;
    labels?: Record<string, string>;
    annotations?: Record<string, string>;
    creationTimestamp?: string;
    uid?: string;
  };
}

export interface Pod extends K8sResource {
  kind: 'Pod';
  spec: {
    containers: Container[];
    initContainers?: Container[];
    volumes?: Volume[];
    restartPolicy?: string;
    nodeSelector?: Record<string, string>;
  };
  status?: {
    phase: string;
    conditions?: Array<{
      type: string;
      status: string;
      lastProbeTime?: string;
      lastTransitionTime?: string;
    }>;
    podIP?: string;
    startTime?: string;
  };
}

export interface Container {
  name: string;
  image: string;
  command?: string[];
  args?: string[];
  ports?: Array<{
    containerPort: number;
    protocol?: string;
  }>;
  env?: Array<{
    name: string;
    value?: string;
    valueFrom?: any;
  }>;
  volumeMounts?: VolumeMount[];
  resources?: {
    limits?: Record<string, string>;
    requests?: Record<string, string>;
  };
}

export interface Deployment extends K8sResource {
  kind: 'Deployment';
  spec: {
    replicas: number;
    selector: {
      matchLabels: Record<string, string>;
    };
    template: {
      metadata: {
        labels: Record<string, string>;
      };
      spec: {
        containers: Container[];
        initContainers?: Container[];
        volumes?: Volume[];
      };
    };
  };
  status?: {
    replicas?: number;
    updatedReplicas?: number;
    readyReplicas?: number;
    availableReplicas?: number;
  };
}

export interface Service extends K8sResource {
  kind: 'Service';
  spec: {
    type: string;
    selector: Record<string, string>;
    ports: Array<{
      port: number;
      targetPort: number;
      protocol?: string;
      name?: string;
    }>;
  };
  status?: {
    loadBalancer?: {
      ingress?: Array<{
        ip?: string;
        hostname?: string;
      }>;
    };
  };
}

export interface Namespace extends K8sResource {
  kind: 'Namespace';
  status?: {
    phase: string;
  };
}

export interface ConfigMap extends K8sResource {
  kind: 'ConfigMap';
  data?: Record<string, string>;
  binaryData?: Record<string, string>;
}

export interface Volume {
  name: string;
  emptyDir?: Record<string, any>;
  configMap?: {
    name: string;
    items?: Array<{
      key: string;
      path: string;
    }>;
  };
}

export interface VolumeMount {
  name: string;
  mountPath: string;
  subPath?: string;
  readOnly?: boolean;
}

export interface K8sList<T extends K8sResource> {
  apiVersion: string;
  kind: string;
  metadata: {
    resourceVersion: string;
  };
  items: T[];
}
