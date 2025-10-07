export enum BotType {
  DISCORD = 'discord',
  TELEGRAM = 'telegram',
  SLACK = 'slack',
  CUSTOM = 'custom',
}

export enum BotStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  STOPPED = 'stopped',
  ERROR = 'error',
  UNKNOWN = 'unknown',
}

export interface BotConfig {
  name: string;
  type: BotType;
  image: string;
  token: string;
  replicas?: number;
  env?: Record<string, string>;
  resources?: {
    limits?: {
      cpu?: string;
      memory?: string;
    };
    requests?: {
      cpu?: string;
      memory?: string;
    };
  };
  port?: number;
}

export interface Bot {
  id: string;
  name: string;
  type: BotType;
  status: BotStatus;
  namespace: string;
  image: string;
  replicas: number;
  createdAt: string;
  updatedAt?: string;
  podInfo?: {
    ready: number;
    total: number;
    phase?: string;
  };
}

export interface BotDeploymentRequest {
  name: string;
  type: BotType;
  image: string;
  token: string;
  replicas?: number;
  env?: Record<string, string>;
  resources?: {
    limits?: {
      cpu?: string;
      memory?: string;
    };
    requests?: {
      cpu?: string;
      memory?: string;
    };
  };
}

export interface BotScaleRequest {
  replicas: number;
}
