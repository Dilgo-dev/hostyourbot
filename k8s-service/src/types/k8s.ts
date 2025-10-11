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
    conditions?: Array<{
      type: string;
      status: string;
      lastUpdateTime?: string;
      lastTransitionTime?: string;
      reason?: string;
      message?: string;
    }>;
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

export interface Node extends K8sResource {
  kind: 'Node';
  spec: {
    podCIDR?: string;
    taints?: Array<{
      key: string;
      value?: string;
      effect: string;
    }>;
  };
  status: {
    capacity: {
      cpu: string;
      memory: string;
      'ephemeral-storage': string;
      pods: string;
    };
    allocatable: {
      cpu: string;
      memory: string;
      'ephemeral-storage': string;
      pods: string;
    };
    conditions: Array<{
      type: string;
      status: string;
      lastHeartbeatTime: string;
      lastTransitionTime: string;
      reason?: string;
      message?: string;
    }>;
    addresses: Array<{
      type: string;
      address: string;
    }>;
    nodeInfo: {
      machineID: string;
      systemUUID: string;
      bootID: string;
      kernelVersion: string;
      osImage: string;
      containerRuntimeVersion: string;
      kubeletVersion: string;
      kubeProxyVersion: string;
      operatingSystem: string;
      architecture: string;
    };
  };
}

export interface NodeMetrics {
  metadata: {
    name: string;
    creationTimestamp: string;
  };
  timestamp: string;
  window: string;
  usage: {
    cpu: string;
    memory: string;
  };
}

export interface NodeMetricsList {
  kind: 'NodeMetricsList';
  apiVersion: 'metrics.k8s.io/v1beta1';
  metadata: {
    selfLink?: string;
  };
  items: NodeMetrics[];
}

export interface PodMetrics {
  metadata: {
    name: string;
    namespace: string;
    creationTimestamp: string;
  };
  timestamp: string;
  window: string;
  containers: Array<{
    name: string;
    usage: {
      cpu: string;
      memory: string;
    };
  }>;
}

export interface PodMetricsList {
  kind: 'PodMetricsList';
  apiVersion: 'metrics.k8s.io/v1beta1';
  metadata: {
    selfLink?: string;
  };
  items: PodMetrics[];
}
